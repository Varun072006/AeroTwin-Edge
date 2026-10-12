"""
outbox.py — SQLite store-and-forward outbox for the edge service.

Events are written here on every prediction.
Background task drains them to the cloud API when online.
Idempotent: writing the same event_id twice is a no-op.
"""
from __future__ import annotations

import json
import os
import sqlite3
import time
from pathlib import Path
from typing import Any

_OUTBOX_PATH = os.getenv("OUTBOX_PATH", str(Path(__file__).resolve().parent.parent / "data" / "outbox.db"))


def _conn() -> sqlite3.Connection:
    Path(_OUTBOX_PATH).parent.mkdir(parents=True, exist_ok=True)
    c = sqlite3.connect(_OUTBOX_PATH, check_same_thread=False)
    c.execute("""
        CREATE TABLE IF NOT EXISTS outbox (
            event_id   TEXT PRIMARY KEY,
            payload    TEXT NOT NULL,
            sent       INTEGER NOT NULL DEFAULT 0,
            created_at REAL NOT NULL DEFAULT 0.0
        )
    """)
    c.commit()
    return c


def write_event(event: dict[str, Any]) -> None:
    """Write event to outbox. Silently ignores duplicate event_id."""
    now = time.time()
    with _conn() as c:
        c.execute(
            "INSERT OR IGNORE INTO outbox (event_id, payload, created_at) VALUES (?, ?, ?)",
            (event["event_id"], json.dumps(event), now),
        )
        c.commit()


def get_unsent_events(limit: int = 50) -> list[dict[str, Any]]:
    """Return unsent events in insertion order."""
    with _conn() as c:
        rows = c.execute(
            "SELECT payload FROM outbox WHERE sent = 0 ORDER BY created_at LIMIT ?",
            (limit,),
        ).fetchall()
    return [json.loads(r[0]) for r in rows]


def mark_sent(event_id: str) -> None:
    """Mark event as successfully forwarded to cloud API."""
    with _conn() as c:
        c.execute("UPDATE outbox SET sent = 1 WHERE event_id = ?", (event_id,))
        c.commit()


def get_queue_depth() -> int:
    """Return count of unsent events currently queued."""
    with _conn() as c:
        row = c.execute("SELECT COUNT(*) FROM outbox WHERE sent = 0").fetchone()
    return int(row[0]) if row else 0
