"""routes/stream.py — Server-Sent Events stream for the portal."""
from __future__ import annotations
import asyncio
import json
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse

router = APIRouter()


@router.get("/stream")
async def stream_events(request: Request):
    """
    SSE stream. Multiple portal clients can subscribe simultaneously.
    Each client gets its own queue subscribed to the broadcast queue.
    """
    broadcast_queue: asyncio.Queue = request.app.state.sse_queue

    async def event_generator():
        client_queue: asyncio.Queue = asyncio.Queue(maxsize=200)

        # Register this client
        if not hasattr(request.app.state, "sse_clients"):
            request.app.state.sse_clients = []
        request.app.state.sse_clients.append(client_queue)

        try:
            yield "data: {\"type\":\"connected\"}\n\n"
            while True:
                if await request.is_disconnected():
                    break
                try:
                    event = await asyncio.wait_for(client_queue.get(), timeout=15.0)
                    yield f"data: {json.dumps(event)}\n\n"
                except asyncio.TimeoutError:
                    yield ": heartbeat\n\n"
        finally:
            request.app.state.sse_clients.remove(client_queue)

    # Background fan-out task
    async def fanout():
        while True:
            event = await broadcast_queue.get()
            if hasattr(request.app.state, "sse_clients"):
                for cq in list(request.app.state.sse_clients):
                    try:
                        cq.put_nowait(event)
                    except asyncio.QueueFull:
                        pass

    asyncio.create_task(fanout())

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
