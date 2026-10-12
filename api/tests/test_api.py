"""test_api.py — Unit and integration tests for API service."""
from __future__ import annotations
import sys
from pathlib import Path

# Add api directory to sys.path so app is imported cleanly
API_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(API_DIR))

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_health():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.get("/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_impact_calculator():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.get("/impact")
        assert resp.status_code == 200
        data = resp.json()
        assert "fleet_size" in data
        assert "cost_per_unscheduled_event_usd" in data
        assert "assumptions" in data
        assert data["data_source_label"] == "assumption"


@pytest.mark.asyncio
async def test_model_card_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.get("/modelcard")
        assert resp.status_code == 200
        assert "dataset" in resp.json() or "model_id" in resp.json() or "architecture" in resp.json()
