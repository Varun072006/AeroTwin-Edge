"""routes/history.py"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..models import Event

router = APIRouter()

@router.get("/history")
async def get_history(
    engine_id: str = Query(...),
    from_cycle: int | None = Query(None),
    to_cycle:   int | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    q = select(Event).where(Event.engine_id == engine_id)
    if from_cycle: q = q.where(Event.cycle >= from_cycle)
    if to_cycle:   q = q.where(Event.cycle <= to_cycle)
    q = q.order_by(Event.cycle)
    result = await db.execute(q)
    events = result.scalars().all()
    return [
        {
            "event_id": e.event_id, "engine_id": e.engine_id, "cycle": e.cycle,
            "rul": e.rul, "rul_lo": e.rul_lo, "rul_hi": e.rul_hi,
            "anomaly_score": e.anomaly_score, "health_class": e.health_class,
            "shap_by_component": e.shap_json, "latency_ms": e.latency_ms,
            "received_at": e.received_at.isoformat(),
        }
        for e in events
    ]
