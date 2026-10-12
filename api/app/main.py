"""
api/app/main.py — AeroTwin Cloud API Service
FastAPI + PostgreSQL + SSE stream + Simulator
"""
from __future__ import annotations

import asyncio
import json
import os
from pathlib import Path
from typing import AsyncGenerator

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, Response
from sqlalchemy.ext.asyncio import AsyncSession

from .database import get_db, engine, Base
from .routes import events, stream, history, modelcard, impact, report, simulator

app = FastAPI(
    title="AeroTwin Cloud API",
    version="1.0.0",
    description="Cloud API — receives edge events, serves portal, generates reports",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# SSE broadcast queue (shared across routes)
_sse_queue: asyncio.Queue = asyncio.Queue(maxsize=500)
app.state.sse_queue = _sse_queue

# Register routers
app.include_router(events.router)
app.include_router(stream.router)
app.include_router(history.router)
app.include_router(modelcard.router)
app.include_router(impact.router)
app.include_router(report.router)
app.include_router(simulator.router)


@app.on_event("startup")
async def startup() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}
