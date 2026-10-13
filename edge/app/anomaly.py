"""
edge/app/anomaly.py — Mahalanobis distance anomaly detection + CUSUM change-point trigger.
NumPy only.
"""
from __future__ import annotations

import numpy as np
from dataclasses import dataclass
from typing import Any


@dataclass
class MahalanobisBaseline:
    """Fitted baseline for one engine."""
    mean: np.ndarray           # shape (n_sensors,)
    inv_cov: np.ndarray        # shape (n_sensors, n_sensors)
    n_samples_fit: int = 30
    
    def score(self, x: np.ndarray) -> float:
        diff = np.asarray(x, dtype=np.float64) - self.mean
        dist = np.sqrt(np.dot(diff, np.dot(self.inv_cov, diff)))
        return float(np.asarray(dist).ravel()[0])


@dataclass
class CUSUMState:
    """CUSUM change-point detector state for one engine."""
    cusum_pos: float = 0.0       # Positive cumulative sum
    cusum_neg: float = 0.0       # Negative cumulative sum
    consecutive_above: int = 0   # Consecutive cycles above threshold
    threshold: float = 5.0       # CUSUM threshold
    k: float = 0.5               # Allowance parameter
    alert_consecutive: int = 3   # Consecutive cycles needed to trigger alert
    
    def update(self, score: float, baseline_mean: float = 2.0) -> bool:
        deviation = score - baseline_mean
        self.cusum_pos = max(0.0, self.cusum_pos + deviation - self.k)
        self.cusum_neg = max(0.0, self.cusum_neg - deviation - self.k)
        
        if self.cusum_pos > self.threshold or self.cusum_neg > self.threshold:
            self.consecutive_above += 1
        else:
            self.consecutive_above = 0
        
        return self.consecutive_above >= self.alert_consecutive
    
    def reset(self) -> None:
        self.cusum_pos = 0.0
        self.cusum_neg = 0.0
        self.consecutive_above = 0


class AnomalyDetector:
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
    def from_baseline(cls, baseline: Any) -> "AnomalyDetector":
        if isinstance(baseline, dict):
            mean = np.asarray(baseline["mean"], dtype=np.float64)
            inv_cov = np.asarray(baseline["inv_cov"], dtype=np.float64)
            threshold = float(baseline.get("threshold", 5.0))
            bl = MahalanobisBaseline(mean=mean, inv_cov=inv_cov, n_samples_fit=30)
            return cls(baseline=bl, cusum_threshold=threshold)
        return cls(baseline=baseline)
    
    def update(self, sensor_values: np.ndarray) -> tuple[float, bool]:
        score = self.baseline.score(sensor_values)
        self._score_history.append(score)
        baseline_mean = float(np.mean(self._score_history[:30])) if len(self._score_history) >= 30 else 2.0
        is_alert = self.cusum.update(score, baseline_mean)
        return score, is_alert
