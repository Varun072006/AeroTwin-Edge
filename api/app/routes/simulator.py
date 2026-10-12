"""routes/simulator.py — C-MAPSS replay simulator with fault injection."""
from __future__ import annotations
import asyncio
import json
import os
import time
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, HTTPException
import httpx

router = APIRouter(prefix="/simulator")

REPLAY_DIR = Path(os.getenv("REPLAY_BUNDLE_DIR", "/replay_bundles"))
EDGE_URL   = os.getenv("EDGE_URL", "http://localhost:8001")

_task:    Optional[asyncio.Task] = None
_state:   dict = {"running": False, "engine": None, "cycle": 0, "speed": 1}
_faults:  list[dict] = []   # Active fault injections


@router.post("/start")
async def start(engine: str = "fast", speed: float = 1.0):
    global _task, _state, _faults

    bundle_path = REPLAY_DIR / f"fd001_{engine}.json"
    if not bundle_path.exists():
        raise HTTPException(404, f"Bundle not found: {bundle_path}. Run ML pipeline first.")

    bundle = json.loads(bundle_path.read_text())
    _faults = []
    _state = {"running": True, "engine": engine, "cycle": 0,
               "speed": speed, "total": bundle["n_cycles"]}

    if _task and not _task.done():
        _task.cancel()

    _task = asyncio.create_task(_replay_loop(bundle, speed))
    return {"status": "started", "engine_id": bundle["engine_id"],
            "total_cycles": bundle["n_cycles"]}


@router.post("/stop")
async def stop():
    global _task, _state
    _state["running"] = False
    if _task and not _task.done():
        _task.cancel()
    return {"status": "stopped"}


@router.get("/status")
async def status():
    return _state


@router.post("/inject_fault")
async def inject_fault(type: str, sensor: str, magnitude: float = 2.0,
                        duration_cycles: int = 10):
    if type not in ("drift", "spike", "dropout"):
        raise HTTPException(400, "type must be: drift, spike, dropout")
    _faults.append({"type": type, "sensor": sensor, "magnitude": magnitude,
                     "duration": duration_cycles, "cycles_remaining": duration_cycles})
    return {"status": "fault_injected", "fault": _faults[-1]}


async def _replay_loop(bundle: dict, speed: float) -> None:
    """Stream each cycle from the bundle to the edge /predict endpoint."""
    sensor_keys = list(bundle["sensors"].keys())
    n = bundle["n_cycles"]
    delay = max(0.01, 1.0 / speed)

    async with httpx.AsyncClient(timeout=10.0) as client:
        for i in range(n):
            if not _state["running"]:
                break

            _state["cycle"] = i + 1
            sensors = {k: bundle["sensors"][k][i] for k in sensor_keys}

            # Apply active fault injections
            active_faults = []
            for fault in _faults:
                if fault["cycles_remaining"] > 0:
                    s = fault["sensor"]
                    if s in sensors:
                        if fault["type"] == "spike" and fault["cycles_remaining"] == fault["duration"]:
                            sensors[s] += fault["magnitude"] * abs(sensors[s])
                        elif fault["type"] == "drift":
                            fraction = 1 - fault["cycles_remaining"] / fault["duration"]
                            sensors[s] += fault["magnitude"] * fraction * abs(sensors[s])
                        elif fault["type"] == "dropout":
                            sensors[s] = 0.0
                    fault["cycles_remaining"] -= 1
                    active_faults.append(fault)
            _faults[:] = [f for f in _faults if f["cycles_remaining"] > 0]

            payload = {
                "engine_id": bundle["engine_id"],
                "cycle": bundle["cycles"][i],
                "sensors": sensors,
            }

            try:
                await client.post(f"{EDGE_URL}/predict", json=payload)
            except Exception:
                pass  # Edge might be temporarily unreachable

            await asyncio.sleep(delay)

    _state["running"] = False
