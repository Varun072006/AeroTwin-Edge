# RULES.md — AeroTwin Edge · Agent & Contributor Rules

These rules apply to ALL agents and ALL contributors across this monorepo.
Violations must be caught in code review before merge.

---

## 1. Data Integrity (Most Critical)
- **NO invented data.** Every value must come from: the model output, the dataset, or a clearly labelled assumption.
- **Every impact figure** must include a visible source label: `[model output]`, `[dataset]`, `[assumption]`, or `[cited study: <url>]`.
- **Health class thresholds** (Critical ≤ 30 cycles, Warning 31–80 cycles, Healthy > 80 cycles) are ASSUMPTIONS. They must be labelled as such in the UI and in code comments.
- **RUL values** must be in realistic C-MAPSS range (~0–362 cycles). Any value outside this range is a bug.
- **Conformal intervals** must use rul_lo (lower bound) as the basis for maintenance recommendations (conservative by design).

## 2. Branding & Labelling
- **No real-engine branding.** Do not reference CFM56, GE90, specific aircraft types, airlines, or real-world operating data.
- **Label the dataset** as "C-MAPSS simulated turbofan (NASA Prognostics Data Repository)".
- **Label the simulation** as "constrained-container edge simulation" — not "edge hardware measurement".
- **Sensor labels:** Use s2–s21 notation or the mapped physical name (T50, Nf, etc.). Never invent sensor names like "vibration" or "oil pressure".

## 3. Code Quality
- **TypeScript strict mode** everywhere in /web (`"strict": true` in tsconfig.json).
- **Python type hints** everywhere in /edge and /api (all function signatures, all class attributes).
- **No `any` types** in TypeScript (use `unknown` and type guards).
- **Docstrings** on every public function and class.

## 4. Testing
- **Every PR must pass:** lint → type-check → tests → ONNX parity test.
- **Test coverage ≥ 70%** on edge and api critical paths.
- **The offline-60s test** (edge) must always pass before merge to main.
- **The ONNX parity test** (`max abs diff < 1e-3`) must always pass before merge to main.

## 5. UI / Portal Rules
- **Data source badge** must appear on every chart. Options: "live model", "replay bundle", "assumption".
- **Dark theme only.** No light mode.
- **Health palette:** Healthy `#22c55e`, Warning `#f59e0b`, Critical `#ef4444`. Do not use other colours for health states.
- **No placeholder images.** Either generate real visuals or use the SVG turbofan component.

## 6. Overclaiming
- Do not state "continuous learning" — it is not implemented. Label it as "future work" if referenced at all.
- Do not state specific improvement percentages (e.g., "20–30% fewer events") without a visible source. Use the Impact Calculator with labelled assumptions instead.
- The demo script must NOT quote metric values in advance. Read them from actual model output.

## 7. Architecture
- Edge service: CPU-only ONNX Runtime. No GPU dependencies.
- Edge container: 0.5 CPU / 512 MB memory limit. Do not exceed.
- Outbox events: idempotent event_id (UUID). Duplicates must be silently ignored on receipt.
- SSE stream: fan-out to multiple portal clients. Closing one client must not affect others.
