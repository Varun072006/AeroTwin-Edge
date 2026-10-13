"""routes/events.py — Receive and store events from edge outbox."""
from __future__ import annotations
import json
from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..models import Event, Alert

router = APIRouter()


@router.post("/events", status_code=201)
async def receive_event(body: dict, request: Request, db: AsyncSession = Depends(get_db)):
    """Idempotent: duplicate event_id returns 200, not 201."""
    event_id = body.get("event_id")
    existing = await db.get(Event, event_id)
    if existing:
        return {"status": "duplicate", "event_id": event_id}

    event = Event(
        event_id=event_id,
        engine_id=body["engine_id"],
        cycle=body["cycle"],
        rul=body["rul"],
        rul_lo=body["rul_lo"],
        rul_hi=body["rul_hi"],
        anomaly_score=body["anomaly_score"],
        health_class=body["health_class"],
        shap_json=body.get("shap_by_component", {}),
        latency_ms=body.get("latency_ms", 0.0),
        offline=body.get("offline", False),
    )
    db.add(event)

    # Auto-create alert if health_class changed to WARNING/CRITICAL
    if body["health_class"] in ("WARNING", "CRITICAL"):
        alert = Alert(
            engine_id=body["engine_id"],
            cycle=body["cycle"],
            severity=body["health_class"],
            message=f"Engine {body['engine_id']}: RUL={body['rul']:.0f} cycles "
                    f"(lower bound={body['rul_lo']:.0f}). "
                    f"Health: {body['health_class']}.",
        )
        db.add(alert)

    try:
        await db.commit()
    except Exception:
        await db.rollback()
        return {"status": "duplicate", "event_id": event_id}

    # Broadcast to SSE clients
    sse_queue = request.app.state.sse_queue
    try:
        sse_queue.put_nowait(body)
    except Exception:
        pass

    return {"status": "stored", "event_id": event_id}
