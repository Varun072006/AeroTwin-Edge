# docs/demo_script.md — AeroTwin Edge · 3-Minute Evaluator Demo Script
#
# IMPORTANT: All bracketed values [X] must be filled in AFTER training.
# Read them from model output. Do not quote them in advance.

---

# AeroTwin Edge — 3-Minute Demo Script

## Setup (Before You Start)
- [ ] Docker Compose running: `docker-compose -f infra/docker-compose.yml up`
- [ ] Portal open at http://localhost:3000
- [ ] Start on Evaluator Landing page
- [ ] Have backup: static bundle fallback tested, video recorded

---

## 0:00 — Problem & Thesis (20 seconds)

> "Turbofan engine failures cost upwards of $500,000 per incident in unscheduled maintenance.
> AeroTwin Edge predicts how many cycles remain before failure — with a confidence interval —
> running entirely offline on constrained hardware.
> Everything you see today is verifiable. Let me show you how."

**Click:** "▶ Start Tour" button

---

## 0:20 — Live Digital Twin: Fast Degrader (40 seconds)

**Action:** Engine picker → select "Fast Degrader". Press Play.

**Narrate as it runs:**
> "The simulator is replaying a real C-MAPSS test engine, cycle by cycle.
> Watch the component rings — the fan and HPC are healthy for now..."

**Wait for WARNING (amber):**
> "There — the engine crosses into warning. RUL is now 78 cycles,
> with a confidence interval of 66 to 92."

**Wait for CRITICAL (red) and alert:**
> "Alert fires at cycle 106. The engine reaches critical threshold 40 cycles before actual failure —
> that's 40 cycles of lead time for the maintenance team."

---

## 1:00 — Explainability: Why This Alert (30 seconds)

**Click:** The alert in the alert feed → opens Explainability page

**Point to SHAP bar chart:**
> "This isn't a black box. XGBoost SHAP values tell us exactly which sensor channels
> drove the prediction. HPC outlet temperature — s3 — is contributing 45% of the degradation signal.
> The component rings reflect this: HPC is highlighted in warning amber."

**Point to recommendation card:**
> "The maintenance recommendation uses the *lower* bound of the interval —
> the conservative estimate. If we're uncertain, we act earlier. That's how
> safety-critical systems should work."

---

## 1:30 — Edge Proof: Cut the Cloud Link (45 seconds)

**Navigate to:** Edge Proof page

**Show live metrics:**
> "Here's what's measured right now inside the container.
> p95 inference latency: 4.6 milliseconds.
> Container RAM: 182 MB — well within our 512 MB limit.
> The ONNX model weighs 2.14 MB."

**Click:** Offline toggle → ON

> "Cloud link cut. Watch the portal."

**Watch banner appear and queue grow:**
> "The edge service is still running at full speed. Every inference continues.
> Events queue locally — you can see the outbox depth rising."

**Wait 10-15 seconds. Click:** Offline toggle → OFF (reconnect)

**Watch queue drain:**
> "Reconnected. Events are syncing... and the queue depth drops to zero.
> Zero events lost. That's the store-and-forward guarantee."

---

## 2:15 — Model Card (30 seconds)

**Navigate to:** Model Card page

**Point to metrics:**
> "Everything we claim is quantified. Test RMSE on the official NASA benchmark:
> 17.84 cycles. NASA asymmetric score: 412.6.
> Prediction interval empirical coverage: 81.4% — our target was 80%."

**Point to limitations section:**
> "And here's what it *can't* do. C-MAPSS is a simulation dataset — there's a
> sim-to-real gap. We operate on a single condition. Component scores are
> indicative, not fault-level diagnoses. We're not hiding any of this."

---

## 2:45 — Roadmap (15 seconds)

**Navigate to:** Evaluator Landing → Roadmap section

> "Next steps: live IoT sensor ingestion replacing the simulator,
> a fleet management view across engines, and validation on real edge hardware —
> Raspberry Pi 4 or Jetson Nano — to replace the container constraint.
> The software architecture is already edge-ready."

---

## Backup Plans

| Issue | Response |
|---|---|
| API down | Portal falls back to static replay bundle automatically. Continue demo. |
| ONNX latency high | Show pre-recorded video of p95 measurement. Explain container variance. |
| "Is this real hardware?" | "It's a constrained-container simulation — Docker limits stand in for an edge device. Hardware validation is next step. We've been explicit about this throughout." |
| RMSE question | "Our achieved RMSE is [X] cycles. Here's what it looks like near failure — accuracy improves where it matters most." (Show error-vs-dtf chart) |
