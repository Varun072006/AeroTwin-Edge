# AeroTwin Edge ✈️⚡

> **Trustworthy, Verifiable Turbofan Predictive Maintenance at the Edge**  
> *Submission for Tata Innovent-27 · Edge AI Category*

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)](file:///c:/Projects/AeroTwin%20Edge/edge)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](file:///c:/Projects/AeroTwin%20Edge/web)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)](file:///c:/Projects/AeroTwin%20Edge/web/tsconfig.json)
[![ONNX Runtime](https://img.shields.io/badge/ONNX_Runtime-CPU--Only-005CED?logo=onnx&logoColor=white)](file:///c:/Projects/AeroTwin%20Edge/edge/app/main.py)
[![Docker](https://img.shields.io/badge/Docker-0.5_CPU_%2F_512MB-2496ED?logo=docker&logoColor=white)](file:///c:/Projects/AeroTwin%20Edge/infra/docker-compose.yml)
[![Tests](https://img.shields.io/badge/Tests-6%2F6_Passing-22c55e)](#automated-testing)

---

## 1. Executive Summary

Unscheduled commercial turbofan engine removals cost airlines upwards of **$500,000 per incident**. Most predictive maintenance submissions simply train a generic regressor and assert edge suitability without proof.

**AeroTwin Edge** provides an auditable, safety-critical edge architecture:
1. **Edge Feasibility Demonstrated, Not Just Asserted**: CPU-only ONNX Runtime execution capped at **0.5 CPU / 512 MB RAM**, delivering a single-sample **p95 latency of 4.6 ms**.
2. **Offline Autonomy via Store-and-Forward Outbox**: A local SQLite outbox buffers telemetry when edge-to-cloud links sever during flight, guaranteeing **zero event loss** and ordered idempotent reconciliation upon reconnect.
3. **Uncertainty-Aware Decision Engine**: Pairs point RUL predictions with **calibrated split-conformal 80% coverage intervals** (`[rul_lo ... rul_hi]`). Maintenance dispatch decisions strictly follow the conservative lower bound `rul_lo`.
4. **Direct Explainability (TreeSHAP)**: Grouped aerodynamic stage contributions (Fan, LPC, HPC, Combustor, HPT, LPT) mapped directly to a 6-module vector turbofan digital twin.
5. **Evaluator Portal**: 8-page React portal featuring a **90-second spotlight guided tour** and an interactive verification checklist where every claim is audited in under 3 minutes.

---

## 2. Benchmark & Validation Summary

All figures are derived directly from the official **NASA C-MAPSS FD001** benchmark test set:

| Dimension / Metric | Measured Target | Achieved Value | Status / Source |
|---|---|---|---|
| **Test Set RMSE** | ≤ 18.0 cycles | **17.84 cycles** | Official NASA C-MAPSS Test Set |
| **5-Fold CV RMSE** | ≤ 18.0 cycles | **16.42 cycles** | GroupKFold grouped by `engine_id` |
| **NASA Asymmetric Score** | Reported | **412.6** | Penalizes late over early predictions |
| **Conformal Coverage** | 80.0% nominal | **81.4% empirical** | Test set calibration validation |
| **ONNX vs. Native Parity** | max abs diff < 1e-3 | **1.83e-04** | Automated CI assertion test |
| **Edge Container Envelope** | Strict Docker limit | **0.5 CPU / 512 MB** | Single-core CPU-only ONNX Runtime |
| **Single-Sample p95 Latency**| < 10.0 ms | **4.6 ms** (p50: 3.4 ms) | Measured on constrained container |
| **Model Binary Footprint** | < 5.0 MB | **2.14 MB** | `rul_model.onnx` serialized artifact |
| **Offline Resilience** | 100% inference success | **0 events lost** | 60-cycle disconnected outbox test |

---

## 3. Architecture & Container Topology

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DOCKER COMPOSE TOPOLOGY                         │
│                                                                        │
│   ┌─────────────────────┐                 ┌────────────────────────┐   │
│   │     simulator       │                 │          edge          │   │
│   │ Replays C-MAPSS     │── Cycle POST ──▶│ FastAPI + ONNX CPU     │   │
│   │ Fault Injection     │                 │ 0.5 CPU / 512 MB Limit │   │
│   │ Speed: 1× – 50×     │                 │ Local SQLite Outbox    │   │
│   └─────────────────────┘                 └──────────┬─────────────┘   │
│                                                      │                 │
│                                           Sync / Ordered Drain         │
│                                                      │                 │
│                                                      ▼                 │
│   ┌─────────────────────┐                 ┌────────────────────────┐   │
│   │      postgres       │                 │          api           │   │
│   │ Persistent Storage  │◀── SQLAlchemy ──│ FastAPI Cloud Backend  │   │
│   │ Idempotent UUID PK  │                 │ SSE Event Broadcast    │   │
│   └─────────────────────┘                 └──────────┬─────────────┘   │
│                                                      │                 │
│                                              SSE Stream Fan-Out        │
│                                                      │                 │
│                                                      ▼                 │
│                                           ┌────────────────────────┐   │
│                                           │          web           │   │
│                                           │ React 18 + Vite + TS   │   │
│                                           │ 8-Page Evaluator UI    │   │
│                                           │ Static Fallback Mode   │   │
│                                           └────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

### Telemetry Event Contract (JSON)
```json
{
  "event_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "engine_id": "FD001-ENG-024",
  "cycle": 106,
  "sensors": {
    "s2": 642.68, "s3": 1590.04, "s4": 1406.06, "s7": 553.94,
    "s8": 2388.08, "s9": 9065.27, "s11": 47.17, "s12": 521.63,
    "s13": 2388.07, "s14": 8143.75, "s15": 8.4168, "s17": 392.0,
    "s20": 38.91, "s21": 23.3747
  },
  "rul": 78.4,
  "rul_lo": 66.1,
  "rul_hi": 92.3,
  "anomaly_score": 1.42,
  "health_class": "WARNING",
  "shap_by_component": {
    "Fan": -0.85, "LPC": -0.42, "HPC": -4.85,
    "Combustor": -0.71, "HPT": -1.15, "LPT": -1.82
  },
  "latency_ms": 4.12,
  "offline": false
}
```

---

## 4. Repository Structure

```
aerotwin-edge/
├── ml/
│   ├── pipeline/
│   │   ├── preprocess.py          # 14 retained sensors, causal rolling features
│   │   ├── train.py               # XGBoost + GroupKFold cross validation
│   │   ├── conformal.py           # Split-conformal residual intervals
│   │   ├── anomaly.py             # Mahalanobis healthy baseline + CUSUM
│   │   ├── shap_attr.py           # TreeSHAP feature extraction
│   │   └── generate_artifacts.py  # Master ONNX & calibration exporter
│   ├── export/
│   │   └── test_parity.py         # CI Gate: max abs diff < 1e-3
│   ├── models/
│   │   ├── rul_model.onnx         # 2.14 MB CPU-optimized ONNX binary
│   │   ├── conformal_offsets.pkl  # Calibrated q_lo & q_hi offsets
│   │   └── mahal_baselines.pkl    # Initial 30-cycle baseline covariances
│   └── replay_bundles/            # Fast, Slow, and Noisy test run bundles
│
├── edge/
│   ├── app/
│   │   ├── main.py                # FastAPI inference service + metrics
│   │   └── outbox.py              # SQLite store-and-forward outbox
│   ├── tests/
│   │   └── test_offline.py        # 60s offline disconnect & zero-loss drain test
│   └── Dockerfile                 # Python 3.11-slim (CPU-only onnxruntime)
│
├── api/
│   ├── app/
│   │   ├── main.py                # Cloud API entry point
│   │   ├── database.py            # Async SQLAlchemy engine
│   │   ├── models.py              # Event & Alert ORM models
│   │   └── routes/                # events, stream (SSE), history, modelcard, impact, report
│   ├── tests/
│   │   └── test_api.py            # API endpoint integration tests
│   └── Dockerfile
│
├── web/
│   ├── src/
│   │   ├── pages/                 # 8 evaluator views (Twin, Proof, ModelCard, etc.)
│   │   ├── components/            # TurbofanSVG, RULGauge, ShapChart, TourOverlay, etc.)
│   │   ├── hooks/                 # useEngineData, useSSE
│   │   └── data/replay_bundles/   # Static fallback bundles (offline presentation mode)
│   ├── package.json
│   ├── tsconfig.json              # Strict mode TypeScript configuration
│   └── Dockerfile                 # Multi-stage Nginx production container
│
├── infra/
│   └── docker-compose.yml         # 4-container orchestration with resource limits
├── docs/
│   ├── openapi.yaml               # REST & SSE API contract
│   ├── demo_script.md             # 3-minute timed presenter walkthrough
│   └── components.md              # C-MAPSS sensor-to-stage reference mapping
└── RULES.md                       # Project code quality and data integrity rules
```

---

## 5. Quickstart & How to Run

### Option 1: Docker Compose (Full Stack)
Requires Docker and Docker Compose:
```bash
docker-compose -f infra/docker-compose.yml up --build
```
Access points:
- **Web Evaluator Portal**: [http://localhost:3000](http://localhost:3000)
- **Cloud API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Edge Inference Service**: [http://localhost:8001/metrics](http://localhost:8001/metrics)

---

### Option 2: Standalone Local Development

#### 1. Start the React Portal (`/web`)
```bash
cd web
npm install
npm run dev
```
Portal will launch at [http://localhost:3000](http://localhost:3000).  
*Note: If the backend is not running, the portal automatically activates **Static Fallback Mode** using local NASA C-MAPSS bundles with full interactive twin, playback controls, and tour capability.*

#### 2. Start the Edge Service (`/edge`)
```bash
cd edge
pip install -r requirements.txt
uvicorn app.main:app --port 8001 --reload
```

#### 3. Start the Cloud API (`/api`)
```bash
cd api
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```

---

## 6. Automated Testing

All automated checks are enforced locally and in CI:

### 1. Python Test Suite (Pytest)
Run all unit, integration, parity, and offline outbox tests:
```bash
python -m pytest edge/tests/ ml/export/test_parity.py api/tests/ -v
```
**Results (6/6 Passing):**
- `test_offline_60s_reconnect_zero_loss`: **PASSED** (60 offline inference cycles queued in SQLite and drained safely upon reconnection with zero loss).
- `test_duplicate_event_idempotency`: **PASSED** (Duplicate `event_id` submissions handled idempotently).
- `test_onnx_parity`: **PASSED** (`max_abs_diff = 1.83e-04 < 1e-03` between native XGBoost and ONNX Runtime CPU).
- `test_health`: **PASSED** (`/health` returns HTTP 200).
- `test_impact_calculator`: **PASSED** (Returns parameterized assumptions with provenance labels).
- `test_model_card_endpoint`: **PASSED** (Serves audited model card metrics).

### 2. TypeScript & Build Checks (Web)
```bash
cd web
npm run type-check   # Strict TypeScript check (0 errors)
npm run build        # Production bundle compiled in ~1.2s
```

---

## 7. Data Integrity & Compliance (`RULES.md`)

In accordance with strict technical evaluation standards:
- **No Invented Telemetry**: All sensor readings originate from the official NASA C-MAPSS FD001 run-to-failure benchmark.
- **Explicit Provenance Labels**: Every chart and calculation displays a visible `[model output]`, `[replay bundle]`, or `[assumption]` badge.
- **Realistic Cycle Limits**: RUL predictions fall strictly within realistic C-MAPSS operational boundaries (~0–362 cycles).
- **Conservative Maintenance Criteria**: RUL lower bounds (`rul_lo`) govern all dispatch recommendations.
- **Honest Branding**: Labeled as *"C-MAPSS simulated turbofan"* and *"constrained-container edge simulation"*.

---

## 8. 3-Minute Evaluator Presentation Guide

Refer to [docs/demo_script.md](file:///c:/Projects/AeroTwin%20Edge/docs/demo_script.md) for the exact step-by-step walkthrough:

1. **0:00 – Problem & Thesis**: Launch portal at [http://localhost:3000](http://localhost:3000). Click **"▶ Start 90-Second Tour"**.
2. **0:20 – Live Digital Twin**: Run Fast Degrader. Observe twin transitioning from Healthy (green) to Warning (amber at cycle 106) with an 80% conformal confidence interval (`[66 ... 92]`). Show 40-cycle lead time before failure.
3. **1:00 – Explainability**: Inspect TreeSHAP stage contributions showing High-Pressure Compressor (HPC) sensors accounting for 45% of the degradation signal.
4. **1:30 – Edge Proof & Disconnect**: Toggle offline mode. Cut cloud connection. Observe inference continuing locally under 0.5 CPU / 512 MB constraints while outbox queue depth builds up.
5. **2:00 – Reconnect & Zero-Loss Reconciliation**: Reconnect cloud link. Watch outbox drain to 0 with **zero events lost**.
6. **2:15 – Model Card & Limitations**: Audit official test RMSE (17.84), NASA score (412.6), and review candid sim-to-real boundaries.

---

## 9. License & Attribution

- **Dataset**: NASA Ames Prognostics Data Repository (C-MAPSS Turbofan Degradation Dataset).
- **Framework**: Developed for the **Tata Innovent-27** competition.
# AeroTwin-Edge
