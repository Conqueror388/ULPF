from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone

from backend.app.storage.database import get_db
from backend.app.storage.models import DBNormalizedEvent, DBLogSource
from backend.app.schema.unified_event import UnifiedEvent
from backend.app.engine.ingestion_pipeline import IngestionPipeline
from backend.app.engine.integrity import IntegrityEngine

router = APIRouter(prefix="/api/logs", tags=["Logs"])

class IngestBatchRequest(Dict[str, Any]):
    pass

@router.post("/ingest")
def ingest_log_line(payload: Dict[str, Any], db: Session = Depends(get_db)):
    raw_log = payload.get("raw_log", "")
    source_name = payload.get("source_name", "Direct API Ingest")
    if not raw_log:
        raise HTTPException(status_code=400, detail="Missing raw_log field")

    pipeline = IngestionPipeline()
    event = pipeline.process_raw_line(raw_log)

    db_event = DBNormalizedEvent(
        event_id=event.event_id,
        timestamp=event.timestamp,
        source_name=source_name,
        category=event.event.category,
        event_type=event.event.type,
        action=event.event.action,
        severity=event.event.severity,
        source_ip=event.source.ip,
        source_port=event.source.port,
        dest_ip=event.destination.ip,
        dest_port=event.destination.port,
        user_name=event.user.name,
        protocol=event.network.protocol,
        raw_hash=event.raw.sha256,
        raw_message=event.raw.message,
        parser_name=event.parser.name,
        parser_version=event.parser.version,
        full_event_json=event.model_dump(),
        created_at=datetime.now(timezone.utc)
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)

    return {
        "status": "ingested",
        "event_id": event.event_id,
        "raw_hash": event.raw.sha256,
        "normalized_event": event.model_dump()
    }

@router.get("/search")
def search_logs(
    query: Optional[str] = Query(None, description="Free text or key:val filter (e.g. source.ip:192.168.1.10)"),
    severity: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    source_name: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
    db: Session = Depends(get_db)
):
    q = db.query(DBNormalizedEvent)

    if severity and severity != "ALL":
        q = q.filter(DBNormalizedEvent.severity == severity.upper())

    if category and category != "ALL":
        q = q.filter(DBNormalizedEvent.category == category.lower())

    if source_name and source_name != "ALL":
        q = q.filter(DBNormalizedEvent.source_name.ilike(f"%{source_name}%"))

    if action and action != "ALL":
        q = q.filter(DBNormalizedEvent.action == action.upper())

    if query:
        clean_query = query.strip()
        # Check if query is structured (e.g., ip:10.0.0.1 or user:admin)
        if ":" in clean_query and not clean_query.startswith("http"):
            parts = clean_query.split(":", 1)
            k, v = parts[0].strip().lower(), parts[1].strip()
            if "ip" in k or "src" in k:
                q = q.filter(or_(DBNormalizedEvent.source_ip.ilike(f"%{v}%"), DBNormalizedEvent.dest_ip.ilike(f"%{v}%")))
            elif "user" in k:
                q = q.filter(DBNormalizedEvent.user_name.ilike(f"%{v}%"))
            elif "action" in k:
                q = q.filter(DBNormalizedEvent.action.ilike(f"%{v}%"))
            elif "sev" in k:
                q = q.filter(DBNormalizedEvent.severity.ilike(f"%{v}%"))
            else:
                q = q.filter(DBNormalizedEvent.raw_message.ilike(f"%{clean_query}%"))
        else:
            q = q.filter(or_(
                DBNormalizedEvent.raw_message.ilike(f"%{clean_query}%"),
                DBNormalizedEvent.source_ip.ilike(f"%{clean_query}%"),
                DBNormalizedEvent.dest_ip.ilike(f"%{clean_query}%"),
                DBNormalizedEvent.user_name.ilike(f"%{clean_query}%"),
                DBNormalizedEvent.action.ilike(f"%{clean_query}%"),
                DBNormalizedEvent.event_id.ilike(f"%{clean_query}%")
            ))

    total = q.count()
    events = q.order_by(DBNormalizedEvent.id.desc()).offset(offset).limit(limit).all()

    items = []
    for e in events:
        items.append({
            "id": e.id,
            "event_id": e.event_id,
            "timestamp": e.timestamp,
            "source_name": e.source_name,
            "category": e.category or "generic",
            "event_type": e.event_type or "activity",
            "action": e.action or "UNKNOWN",
            "severity": e.severity or "LOW",
            "source_ip": e.source_ip or "-",
            "source_port": e.source_port,
            "dest_ip": e.dest_ip or "-",
            "dest_port": e.dest_port,
            "user_name": e.user_name or "-",
            "protocol": e.protocol or "-",
            "raw_hash": e.raw_hash,
            "raw_message": e.raw_message,
            "parser_name": e.parser_name,
            "parser_version": e.parser_version,
            "full_event_json": e.full_event_json
        })

    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "items": items
    }

@router.get("/compare/{event_id}")
def get_raw_vs_normalized(event_id: str, db: Session = Depends(get_db)):
    """
    Returns Raw Log side-by-side with Normalized Event JSON and SHA-256 cryptographic verification.
    """
    event = db.query(DBNormalizedEvent).filter(DBNormalizedEvent.event_id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    is_tamper_free = IntegrityEngine.verify_integrity(event.raw_message, event.raw_hash)

    return {
        "event_id": event.event_id,
        "timestamp": event.timestamp,
        "raw": {
            "message": event.raw_message,
            "sha256": event.raw_hash,
            "is_verified": is_tamper_free,
            "byte_size": len(event.raw_message.encode('utf-8'))
        },
        "normalized": event.full_event_json,
        "parser": {
            "name": event.parser_name,
            "version": event.parser_version
        }
    }
