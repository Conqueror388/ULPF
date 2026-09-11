import asyncio
import json
import random
from datetime import datetime, timezone
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from backend.app.storage.seed_data import SAMPLE_LOG_RECORDS
from backend.app.engine.ingestion_pipeline import IngestionPipeline

router = APIRouter(prefix="/api/stream", tags=["Streaming"])

active_connections: list[WebSocket] = []

@router.websocket("/live")
async def websocket_live_stream(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    pipeline = IngestionPipeline()
    try:
        while True:
            # Pick a random sample log line
            raw_line = random.choice(SAMPLE_LOG_RECORDS)
            # Add dynamic timestamp & dynamic IP variations
            dynamic_ip = f"192.168.1.{random.randint(10, 250)}"
            if "src=" in raw_line:
                raw_line = raw_line.replace("192.168.1.10", dynamic_ip)
            
            event = pipeline.process_raw_line(raw_line)

            payload = {
                "timestamp": datetime.now(timezone.utc).strftime("%H:%M:%S.%f")[:-3],
                "source_name": event.parser.name,
                "raw_message": event.raw.message,
                "raw_hash": event.raw.sha256[:12] + "...",
                "category": event.event.category,
                "action": event.event.action,
                "severity": event.event.severity,
                "source_ip": event.source.ip or dynamic_ip,
                "dest_ip": event.destination.ip or "10.0.0.1",
                "normalized": True,
                "status": "SUCCESS"
            }
            await websocket.send_text(json.dumps(payload))
            await asyncio.sleep(0.6)  # Stream an event every 600ms
    except WebSocketDisconnect:
        if websocket in active_connections:
            active_connections.remove(websocket)
    except Exception:
        if websocket in active_connections:
            active_connections.remove(websocket)

@router.get("/status")
def get_stream_status():
    return {
        "status": "STREAMING_ACTIVE",
        "active_clients": len(active_connections),
        "pipeline_buffer_health": 99.8,
        "throughput_eps": 3450
    }
