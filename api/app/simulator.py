"""
api/app/simulator.py — Background telemetry simulator service.
Streams C-MAPSS cycles to edge service for continuous digital twin demonstration.
"""
from __future__ import annotations

import asyncio
import json
import os
import sys
import time
from pathlib import Path

import httpx

EDGE_URL = os.getenv("EDGE_URL", "http://edge:8001")
REPLAY_DIR = Path(os.getenv("REPLAY_BUNDLE_DIR", "/replay_bundles"))
SPEED = float(os.getenv("SIMULATOR_SPEED", "2.0"))


async def run_simulator() -> None:
    print(f"[Simulator] Initializing standalone telemetry simulator -> {EDGE_URL}")
    bundles = ["fd001_fast.json", "fd001_slow.json", "fd001_noisy.json"]

    async with httpx.AsyncClient(timeout=10.0) as client:
        # Wait for Edge service health
        while True:
            try:
                resp = await client.get(f"{EDGE_URL}/health")
                if resp.status_code == 200:
                    print("[Simulator] Edge service is healthy and online.")
                    break
            except Exception as e:
                print(f"[Simulator] Waiting for edge service at {EDGE_URL}... ({e})")
            await asyncio.sleep(2.0)

        # Replay loop
        while True:
            for b_name in bundles:
                bundle_path = REPLAY_DIR / b_name
                if not bundle_path.exists():
                    print(f"[Simulator] Bundle not found at {bundle_path}, skipping...")
                    await asyncio.sleep(2.0)
                    continue

                print(f"[Simulator] Replaying flight cycle bundle: {b_name}")
                try:
                    data = json.loads(bundle_path.read_text())
                except Exception as e:
                    print(f"[Simulator] Failed reading {b_name}: {e}")
                    continue

                sensor_keys = list(data["sensors"].keys())
                n = data["n_cycles"]
                delay = max(0.05, 1.0 / SPEED)

                for i in range(n):
                    sensors = {k: data["sensors"][k][i] for k in sensor_keys}
                    payload = {
                        "engine_id": data["engine_id"],
                        "cycle": data["cycles"][i],
                        "sensors": sensors,
                    }

                    try:
                        await client.post(f"{EDGE_URL}/predict", json=payload)
                    except Exception as err:
                        print(f"[Simulator] POST cycle {i+1} error: {err}")

                    await asyncio.sleep(delay)

                print(f"[Simulator] Completed bundle {b_name}. Pausing before next run...")
                await asyncio.sleep(4.0)


if __name__ == "__main__":
    asyncio.run(run_simulator())
