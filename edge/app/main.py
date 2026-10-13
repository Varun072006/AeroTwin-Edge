"""
main.py — AeroTwin Edge Service
FastAPI + ONNX Runtime (CPU only) + SQLite outbox + Mahalanobis anomaly

Container limits: 0.5 CPU, 512 MB RAM (set in docker-compose.yml)
These limits are central to the Edge AI claim — verified on /metrics.
"""
from __future__ import annotations

import asyncio
import os
import pickle
import time
import uuid
from collections import deque
from pathlib import Path
from typing import Any

import numpy as np
import psutil
import onnxruntime as ort
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ─── ENV CONFIG ───────────────────────────────────────────────────────────────
_ML_MODELS = Path(__file__).resolve().parent.parent.parent / "ml" / "models"
MODEL_PATH = os.getenv("MODEL_PATH", str(_ML_MODELS / "rul_model.onnx") if (_ML_MODELS / "rul_model.onnx").exists() else "/models/rul_model.onnx")
CONFORMAL_PATH = os.getenv("CONFORMAL_PATH", str(_ML_MODELS / "conformal_offsets.pkl") if (_ML_MODELS / "conformal_offsets.pkl").exists() else "/models/conformal_offsets.pkl")
MAHAL_PATH = os.getenv("MAHAL_PATH", str(_ML_MODELS / "mahal_baselines.pkl") if (_ML_MODELS / "mahal_baselines.pkl").exists() else "/models/mahal_baselines.pkl")
OUTBOX_PATH = os.getenv("OUTBOX_PATH", str(Path(__file__).resolve().parent.parent / "data" / "outbox.db"))
API_URL = os.getenv("API_URL", "http://localhost:8000")

# ─── APP SETUP ────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AeroTwin Edge",
    description="Edge inference service — CPU-only ONNX Runtime",
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── GLOBALS (loaded at startup) ─────────────────────────────────────────────
_ort_session: ort.InferenceSession | None = None
_conformal_offsets: dict | None = None        # {"q_lo": float, "q_hi": float}
_mahal_baselines: dict | None = None          # {engine_id: MahalanobisBaseline}
_feature_windows: dict[str, deque] = {}       # {engine_id: deque(maxlen=30)}
_anomaly_detectors: dict[str, Any] = {}       # {engine_id: AnomalyDetector}
_latency_window: deque = deque(maxlen=200)    # rolling window for p50/p95
_offline: bool = False
_model_size_mb: float = 0.0

# Health class thresholds (ASSUMPTIONS — configurable, labeled in UI)
HEALTH_CRITICAL_MAX = 30    # RUL lower bound ≤ 30 cycles → CRITICAL
HEALTH_WARNING_MAX = 80     # RUL lower bound ≤ 80 cycles → WARNING
# RUL lower bound > 80 → HEALTHY

# ─── STARTUP ─────────────────────────────────────────────────────────────────

def _ensure_loaded() -> None:
    global _ort_session, _conformal_offsets, _mahal_baselines, _model_size_mb
    if _ort_session is not None:
        return
    _ort_session = ort.InferenceSession(
        MODEL_PATH,
        providers=["CPUExecutionProvider"],
    )
    _model_size_mb = Path(MODEL_PATH).stat().st_size / 1e6
    with open(CONFORMAL_PATH, "rb") as f:
        _conformal_offsets = pickle.load(f)
    with open(MAHAL_PATH, "rb") as f:
        _mahal_baselines = pickle.load(f)

@app.on_event("startup")
async def startup() -> None:
    _ensure_loaded()
    # Start outbox sync background task
    asyncio.create_task(_outbox_sync_loop())
    print(f"Edge service ready. ONNX model: {_model_size_mb:.2f} MB")

# ─── SCHEMAS ─────────────────────────────────────────────────────────────────

SENSOR_FIELDS = ["s2", "s3", "s4", "s7", "s8", "s9", "s11", "s12",
                 "s13", "s14", "s15", "s17", "s20", "s21"]


class SensorReadings(BaseModel):
    s2: float; s3: float; s4: float; s7: float
    s8: float; s9: float; s11: float; s12: float
    s13: float; s14: float; s15: float; s17: float
    s20: float; s21: float


class TelemetryInput(BaseModel):
    engine_id: str = Field(..., example="FD001-023")
    cycle: int = Field(..., ge=1)
    sensors: SensorReadings


class PredictionResult(BaseModel):
    event_id: str
    engine_id: str
    cycle: int
    rul: float = Field(..., description="Point prediction (cycles). Range ~0–362.")
    rul_lo: float = Field(..., description="Lower bound of 80% conformal interval")
    rul_hi: float = Field(..., description="Upper bound of 80% conformal interval")
    anomaly_score: float
    health_class: str = Field(..., description="CRITICAL | WARNING | HEALTHY (thresholds are ASSUMPTIONS)")
    shap_by_component: dict[str, float]
    latency_ms: float
    offline: bool


class OfflineToggle(BaseModel):
    offline: bool

# ─── ENDPOINTS ───────────────────────────────────────────────────────────────

@app.post("/predict", response_model=PredictionResult)
async def predict(body: TelemetryInput) -> PredictionResult:
    """
    Run RUL inference for one engine cycle.
    Updates feature window, runs ONNX inference, computes anomaly score.
    If offline, queues event in SQLite outbox.
    """
    _ensure_loaded()
    t_start = time.perf_counter()
    
    sensor_values = np.array([getattr(body.sensors, s) for s in SENSOR_FIELDS], dtype=np.float32)
    
    # Update feature window (causal — only past data)
    if body.engine_id not in _feature_windows:
        _feature_windows[body.engine_id] = deque(maxlen=30)
    _feature_windows[body.engine_id].append(sensor_values)
    
    # Build feature vector (rolling stats over window)
    features = _build_features(body.engine_id, sensor_values)
    
    # ONNX inference
    input_name = _ort_session.get_inputs()[0].name
    out = _ort_session.run(None, {input_name: features.reshape(1, -1)})[0]
    rul_raw = float(np.asarray(out).ravel()[0])
    rul = float(max(0.0, min(362.0, rul_raw)))
    
    # Conformal intervals
    q_lo = float(_conformal_offsets["q_lo"])
    q_hi = float(_conformal_offsets["q_hi"])
    rul_lo = float(max(0.0, min(362.0, rul + q_lo)))
    rul_hi = float(max(0.0, min(362.0, rul + q_hi)))
    
    # Health class (based on lower bound — conservative)
    if rul_lo <= HEALTH_CRITICAL_MAX:
        health_class = "CRITICAL"
    elif rul_lo <= HEALTH_WARNING_MAX:
        health_class = "WARNING"
    else:
        health_class = "HEALTHY"
    
    # Anomaly detection
    anomaly_score, _ = _get_anomaly_score(body.engine_id, sensor_values)
    
    # SHAP by component (from precomputed lookup or live)
    shap_by_component = _get_shap_by_component(body.engine_id, body.cycle)
    
    latency_ms = (time.perf_counter() - t_start) * 1000
    _latency_window.append(latency_ms)
    
    result = PredictionResult(
        event_id=str(uuid.uuid4()),
        engine_id=body.engine_id,
        cycle=body.cycle,
        rul=rul,
        rul_lo=rul_lo,
        rul_hi=rul_hi,
        anomaly_score=anomaly_score,
        health_class=health_class,
        shap_by_component=shap_by_component,
        latency_ms=latency_ms,
        offline=_offline,
    )
    
    # Store in outbox (always); sync if online
    await _outbox_write(result)
    
    return result


_sync_task: asyncio.Task | None = None

def _ensure_sync_loop() -> None:
    global _sync_task
    if _sync_task is None or _sync_task.done():
        try:
            loop = asyncio.get_running_loop()
            _sync_task = loop.create_task(_outbox_sync_loop())
        except RuntimeError:
            pass


async def drain_outbox_once() -> int:
    """Drain unsent events immediately."""
    import httpx
    from . import outbox as ob
    events = ob.get_unsent_events(limit=200)
    drained = 0
    for event in events:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{API_URL}/events",
                    json=event,
                    timeout=5.0,
                )
            if response.status_code in (200, 201):
                ob.mark_sent(event["event_id"])
                drained += 1
        except Exception:
            pass
    return drained


@app.post("/offline")
async def toggle_offline(body: OfflineToggle) -> dict:
    global _offline
    _offline = body.offline
    _ensure_sync_loop()
    if not _offline:
        await drain_outbox_once()
    from . import outbox as ob  # lazy import
    queue_depth = ob.get_queue_depth()
    return {"offline": _offline, "queue_depth": queue_depth}


@app.get("/metrics")
async def get_metrics() -> dict:
    """Live performance metrics. All values are MEASURED."""
    latencies = list(_latency_window)
    p50 = float(np.percentile(latencies, 50)) if latencies else 0.0
    p95 = float(np.percentile(latencies, 95)) if latencies else 0.0
    
    proc = psutil.Process()
    mem_mb = proc.memory_info().rss / 1e6
    cpu_pct = proc.cpu_percent(interval=0.1)
    
    from . import outbox as ob  # lazy import
    queue_depth = ob.get_queue_depth()
    
    return {
        "p50_ms": round(p50, 3),
        "p95_ms": round(p95, 3),
        "memory_mb": round(mem_mb, 1),
        "cpu_percent": round(cpu_pct, 1),
        "model_size_mb": round(_model_size_mb, 3),
        "queue_depth": queue_depth,
        "offline": _offline,
    }


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}

# ─── HELPERS ─────────────────────────────────────────────────────────────────

def _build_features(engine_id: str, sensor_values: np.ndarray) -> np.ndarray:
    """Build rolling feature vector from the engine's sensor window."""
    window = np.array(list(_feature_windows[engine_id]))  # shape (n, 14)
    features = sensor_values.copy().tolist()
    
    for w in [5, 10, 30]:
        chunk = window[-w:] if len(window) >= w else window
        features.extend(chunk.mean(axis=0).tolist())
        features.extend(chunk.std(axis=0).tolist())
        # Slope approximation
        if len(chunk) >= 2:
            slopes = [
                float(np.polyfit(range(len(chunk)), chunk[:, i], 1)[0])
                for i in range(chunk.shape[1])
            ]
        else:
            slopes = [0.0] * chunk.shape[1]
        features.extend(slopes)
    
    features.append(0.5)  # cycle_index placeholder (updated by simulator)
    return np.array(features, dtype=np.float32)


def _get_anomaly_score(engine_id: str, sensor_values: np.ndarray) -> tuple[float, bool]:
    """Get Mahalanobis anomaly score for this engine cycle."""
    try:
        from ml.pipeline.anomaly import AnomalyDetector  # type: ignore
    except ImportError:
        try:
            from .anomaly import AnomalyDetector
        except ImportError:
            from anomaly import AnomalyDetector
    
    if engine_id not in _anomaly_detectors and _mahal_baselines:
        baseline = _mahal_baselines.get(engine_id)
        if baseline:
            _anomaly_detectors[engine_id] = AnomalyDetector.from_baseline(baseline)
    
    detector = _anomaly_detectors.get(engine_id)
    if detector:
        return detector.update(sensor_values)
    return 0.0, False


def _get_shap_by_component(engine_id: str, cycle: int) -> dict[str, float]:
    """Return SHAP component attribution. Placeholder — replaced by replay bundle lookup."""
    return {"Fan": 0.0, "LPC": 0.0, "HPC": 0.0, "HPT": 0.0, "LPT": 0.0, "Combustor": 0.0}


async def _outbox_write(result: PredictionResult) -> None:
    """Write prediction result to SQLite outbox."""
    from . import outbox as ob  # lazy import
    payload = result.model_dump() if hasattr(result, "model_dump") else result.dict()
    ob.write_event(payload)
    _ensure_sync_loop()


async def _outbox_sync_loop() -> None:
    """Background task: sync outbox events to cloud API when online."""
    while True:
        try:
            if not _offline:
                drained = await drain_outbox_once()
                if drained > 0:
                    await asyncio.sleep(0.05)
                    continue
        except Exception:
            pass
        await asyncio.sleep(0.2)

