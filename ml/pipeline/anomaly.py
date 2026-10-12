"""
anomaly.py — Mahalanobis distance anomaly detection + CUSUM change-point trigger.

Implemented in NumPy only (no ONNX needed).
Runs inside the edge service for each engine.

Rules:
- Fit Mahalanobis baseline on FIRST 30 CYCLES per engine (healthy assumption)
- CUSUM trigger: alert when cumulative sum > threshold for 3 consecutive cycles
- False-positive rate target: < 5% on training engines (set threshold accordingly)
"""
from __future__ import annotations

import numpy as np
from dataclasses import dataclass, field


@dataclass
class MahalanobisBaseline:
    """Fitted baseline for one engine."""
    mean: np.ndarray           # shape (n_sensors,)
    inv_cov: np.ndarray        # shape (n_sensors, n_sensors)
    n_samples_fit: int
    
    def score(self, x: np.ndarray) -> float:
        """
        Compute Mahalanobis distance of a new observation.
        Higher = more anomalous.
        
        Args:
            x: 1D array of sensor values, shape (n_sensors,)
        """
        diff = x - self.mean
        return float(np.sqrt(np.dot(diff, np.dot(self.inv_cov, diff))))


def fit_baseline(
    sensor_history: np.ndarray,
    n_healthy_cycles: int = 30,
) -> MahalanobisBaseline | None:
    """
    Fit Mahalanobis baseline from the first n_healthy_cycles of sensor data.
    
    Args:
        sensor_history: shape (n_cycles, n_sensors)
        n_healthy_cycles: Number of initial cycles assumed healthy
    
    Returns:
        MahalanobisBaseline or None if insufficient data
    """
    healthy = sensor_history[:n_healthy_cycles]
    if len(healthy) < 5:
        return None
    
    mean = np.mean(healthy, axis=0)
    cov = np.cov(healthy, rowvar=False)
    
    # Regularise covariance matrix for numerical stability
    cov += np.eye(cov.shape[0]) * 1e-6
    
    try:
        inv_cov = np.linalg.inv(cov)
    except np.linalg.LinAlgError:
        inv_cov = np.linalg.pinv(cov)
    
    return MahalanobisBaseline(
        mean=mean,
        inv_cov=inv_cov,
        n_samples_fit=len(healthy),
    )


@dataclass
class CUSUMState:
    """CUSUM change-point detector state for one engine."""
    cusum_pos: float = 0.0       # Positive cumulative sum
    cusum_neg: float = 0.0       # Negative cumulative sum
    consecutive_above: int = 0   # Consecutive cycles above threshold
    threshold: float = 5.0       # CUSUM threshold (tune on training data)
    k: float = 0.5               # Allowance parameter
    alert_consecutive: int = 3   # Consecutive cycles needed to trigger alert
    
    def update(self, score: float, baseline_mean: float = 2.0) -> bool:
        """
        Update CUSUM state with new anomaly score.
        
        Args:
            score: Current Mahalanobis distance
            baseline_mean: Expected baseline score (mean of healthy distribution)
        
        Returns:
            True if CUSUM alert is triggered
        """
        deviation = score - baseline_mean
        
        self.cusum_pos = max(0, self.cusum_pos + deviation - self.k)
        self.cusum_neg = max(0, self.cusum_neg - deviation - self.k)
        
        if self.cusum_pos > self.threshold or self.cusum_neg > self.threshold:
            self.consecutive_above += 1
        else:
            self.consecutive_above = 0
        
        return self.consecutive_above >= self.alert_consecutive
    
    def reset(self) -> None:
        """Reset CUSUM state (e.g., after maintenance)."""
        self.cusum_pos = 0.0
        self.cusum_neg = 0.0
        self.consecutive_above = 0


class AnomalyDetector:
    """
    Per-engine anomaly detector combining Mahalanobis distance and CUSUM.
    
    Usage in edge service:
        detector = AnomalyDetector.from_baseline(baseline)
        score, is_alert = detector.update(sensor_values)
    """
    
    def __init__(
        self,
        baseline: MahalanobisBaseline,
        cusum_threshold: float = 5.0,
        alert_consecutive: int = 3,
    ) -> None:
        self.baseline = baseline
        self.cusum = CUSUMState(
            threshold=cusum_threshold,
            alert_consecutive=alert_consecutive,
        )
        self._score_history: list[float] = []
    
    @classmethod
    def from_baseline(cls, baseline: MahalanobisBaseline) -> "AnomalyDetector":
        return cls(baseline=baseline)
    
    def update(self, sensor_values: np.ndarray) -> tuple[float, bool]:
        """
        Process one cycle of sensor readings.
        
        Returns:
            (anomaly_score, is_alert_triggered)
        """
        score = self.baseline.score(sensor_values)
        self._score_history.append(score)
        
        # CUSUM expects approximate baseline mean
        baseline_mean = float(np.mean(self._score_history[:30])) if len(self._score_history) >= 30 else 2.0
        is_alert = self.cusum.update(score, baseline_mean)
        
        return score, is_alert
