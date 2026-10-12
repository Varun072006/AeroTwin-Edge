"""models.py — SQLAlchemy ORM models."""
from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import String, Float, Integer, DateTime, JSON, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from .database import Base


class Event(Base):
    __tablename__ = "events"

    event_id:       Mapped[str]      = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    engine_id:      Mapped[str]      = mapped_column(String, index=True)
    cycle:          Mapped[int]      = mapped_column(Integer)
    rul:            Mapped[float]    = mapped_column(Float)
    rul_lo:         Mapped[float]    = mapped_column(Float)
    rul_hi:         Mapped[float]    = mapped_column(Float)
    anomaly_score:  Mapped[float]    = mapped_column(Float)
    health_class:   Mapped[str]      = mapped_column(String(16))
    shap_json:      Mapped[dict]     = mapped_column(JSON)
    latency_ms:     Mapped[float]    = mapped_column(Float)
    offline:        Mapped[bool]     = mapped_column(Boolean, default=False)
    received_at:    Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Alert(Base):
    __tablename__ = "alerts"

    alert_id:   Mapped[str]      = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    engine_id:  Mapped[str]      = mapped_column(String, index=True)
    cycle:      Mapped[int]      = mapped_column(Integer)
    severity:   Mapped[str]      = mapped_column(String(16))
    message:    Mapped[str]      = mapped_column(String(512))
    fired_at:   Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
