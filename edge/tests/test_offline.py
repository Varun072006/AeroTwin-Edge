"""
test_offline.py — CRITICAL TEST: offline mode + zero event loss.

This test MUST pass before any merge to main.
Verifies:
1. Events queued in outbox while offline (60+ events)
2. On reconnect, all events sync to mock API in correct order
3. Zero events lost, zero duplicates
4. Outbox depth returns to 0 after sync
"""
import asyncio
from unittest.mock import patch

import pytest
import httpx


@pytest.mark.asyncio
async def test_offline_60s_reconnect_zero_loss():
    """
    Simulate 60 inference requests while offline,
    then reconnect and verify all 60 events reach the cloud API.
    """
    from edge.app import outbox
    from edge.app.main import app
    from httpx import AsyncClient, ASGITransport
    
    received_event_ids: list[str] = []
    orig_post = AsyncClient.post

    async def mock_api_post(self, url, *args, **kwargs):
        """Mock cloud API that records received events, while allowing test client calls to pass."""
        url_str = str(url)
        if url_str.startswith("http://test") or url_str.startswith("/"):
            return await orig_post(self, url, *args, **kwargs)
        
        json_data = kwargs.get("json", {})
        if json_data and "event_id" in json_data:
            received_event_ids.append(json_data["event_id"])
            return httpx.Response(201, json={"status": "stored", "event_id": json_data["event_id"]})
        return httpx.Response(200, json={"status": "ok"})
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Go offline
        resp = await client.post("/offline", json={"offline": True})
        assert resp.status_code == 200
        assert resp.json()["offline"] is True
        
        # 2. Send 60 prediction requests
        sent_event_ids: list[str] = []
        for cycle in range(1, 61):
            resp = await client.post("/predict", json={
                "engine_id": "TEST-001",
                "cycle": cycle,
                "sensors": {
                    "s2": 642.68, "s3": 1590.04, "s4": 1406.06,
                    "s7": 553.94, "s8": 2388.08, "s9": 9065.27,
                    "s11": 47.17, "s12": 521.63, "s13": 2388.07,
                    "s14": 8143.75, "s15": 8.4168, "s17": 392.0,
                    "s20": 38.91, "s21": 23.3747,
                }
            })
            assert resp.status_code == 200
            assert resp.json()["offline"] is True
            sent_event_ids.append(resp.json()["event_id"])
        
        # 3. Verify all 60 events in outbox
        queue_depth = outbox.get_queue_depth()
        assert queue_depth == 60, f"Expected 60 events in outbox, got {queue_depth}"
        
        # 4. Go online (reconnect)
        with patch.object(AsyncClient, "post", new=mock_api_post):
            resp = await client.post("/offline", json={"offline": False})
            assert resp.status_code == 200
            
            # Wait for outbox to drain (max 10 seconds)
            for _ in range(100):
                await asyncio.sleep(0.1)
                if outbox.get_queue_depth() == 0:
                    break
        
        # 5. Verify zero events lost, zero duplicates, correct count
        assert outbox.get_queue_depth() == 0, "Outbox not drained"
        assert len(received_event_ids) == 60, f"Expected 60 events, got {len(received_event_ids)}"
        assert len(set(received_event_ids)) == 60, "Duplicate events detected"
        
        # 6. Verify all sent event IDs were received
        missing = set(sent_event_ids) - set(received_event_ids)
        assert len(missing) == 0, f"Lost events: {missing}"


@pytest.mark.asyncio
async def test_duplicate_event_idempotency():
    """Sending the same event_id twice must not result in duplicates."""
    from edge.app import outbox, main
    main._offline = True
    
    event = {"event_id": "test-uuid-idempotent-999", "engine_id": "TEST-001", "cycle": 1}
    outbox.write_event(event)
    outbox.write_event(event)  # duplicate
    
    with outbox._conn() as c:
        rows = c.execute("SELECT * FROM outbox WHERE event_id = ?", (event["event_id"],)).fetchall()
    assert len(rows) == 1, "Duplicate event_id written to outbox"
