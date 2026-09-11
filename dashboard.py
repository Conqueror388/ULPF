from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone, timedelta
from backend.app.storage.database import get_db
from backend.app.storage.models import DBLogSource, DBParserConfig, DBNormalizedEvent

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/metrics")
def get_dashboard_metrics(db: Session = Depends(get_db)):
    sources = db.query(DBLogSource).all()
    total_ingested = sum(s.total_events for s in sources)
    total_failed = sum(s.failed_events for s in sources)
    total_processed = max(0, total_ingested - total_failed)
    current_eps = sum(s.events_per_sec for s in sources if s.status == "ACTIVE")
    active_parsers_count = db.query(DBParserConfig).filter(DBParserConfig.is_active == True).count()
    active_sources_count = len([s for s in sources if s.status == "ACTIVE"])

    # Severity distribution
    severity_counts = db.query(
        DBNormalizedEvent.severity, func.count(DBNormalizedEvent.id)
    ).group_by(DBNormalizedEvent.severity).all()
    
    sev_map = {"LOW": 0, "MEDIUM": 0, "HIGH": 0, "CRITICAL": 0}
    for sev, count in severity_counts:
        if sev in sev_map:
            sev_map[sev] = count

    # Source breakdown
    source_stats = []
    total_s_events = sum(s.total_events for s in sources) or 1
    for s in sources:
        pct = round((s.total_events / total_s_events) * 100, 1)
        source_stats.append({
            "id": s.id,
            "name": s.name,
            "input_type": s.input_type,
            "events_per_sec": s.events_per_sec,
            "total_events": s.total_events,
            "percentage": pct,
            "status": s.status
        })

    # Time series (Events per minute for the last 15 minutes)
    now = datetime.now(timezone.utc)
    time_series = []
    base_rate = int(current_eps / 60) if current_eps > 0 else 1200
    for i in range(15, 0, -1):
        t = now - timedelta(minutes=i)
        variance = (i % 4) * 120 - 60
        # Add a simulated spike at minute 5 for demonstration
        spike = 4500 if i == 5 else 0
        time_series.append({
            "time": t.strftime("%H:%M"),
            "events": base_rate * 60 + variance + spike,
            "spike": i == 5
        })

    # Recent errors snippet
    recent_errors = [
        {
            "timestamp": (now - timedelta(minutes=2)).strftime("%H:%M:%S"),
            "source": "Firewall-01",
            "raw_snippet": "<134>1 2026-09-01T10:30:00Z MALFORMED_HEADER %%%",
            "reason": "Missing required delimiter/PRI header"
        },
        {
            "timestamp": (now - timedelta(minutes=7)).strftime("%H:%M:%S"),
            "source": "Web-App-Nginx",
            "raw_snippet": "CORRUPTED_STREAM_0x999",
            "reason": "Invalid column count for CSV schema"
        },
        {
            "timestamp": (now - timedelta(minutes=14)).strftime("%H:%M:%S"),
            "source": "Suricata-IDS",
            "raw_snippet": "CEF:INVALID_PREFIX|test",
            "reason": "Header field count less than 7"
        }
    ]

    return {
        "status": "ONLINE",
        "system_health": "OPTIMAL",
        "total_events_ingested": total_ingested,
        "total_events_processed": total_processed,
        "total_events_failed": total_failed,
        "current_throughput_eps": round(current_eps, 1),
        "active_parsers": active_parsers_count,
        "active_sources": active_sources_count,
        "severity_distribution": sev_map,
        "sources": source_stats,
        "events_per_minute": time_series,
        "recent_errors": recent_errors
    }
