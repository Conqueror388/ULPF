from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone

from backend.app.storage.database import get_db
from backend.app.storage.models import DBLogSource, DBParserConfig
from backend.app.schema.source_models import (
    LogSourceModel, SourceUploadAnalysisRequest, SourceUploadAnalysisResponse
)
from backend.app.engine.detector import FormatDetector
from backend.app.engine.ai_mapper import AIMappingGenerator
from backend.app.engine.ingestion_pipeline import IngestionPipeline

router = APIRouter(prefix="/api/sources", tags=["Sources"])

@router.get("/", response_model=List[LogSourceModel])
def list_sources(db: Session = Depends(get_db)):
    sources = db.query(DBLogSource).all()
    results = []
    for s in sources:
        results.append(LogSourceModel(
            id=s.id,
            name=s.name,
            input_type=s.input_type,
            status=s.status,
            host=s.host,
            port=s.port,
            events_per_sec=s.events_per_sec,
            total_events=s.total_events,
            failed_events=s.failed_events,
            parser_name=s.parser_name,
            description=s.description,
            created_at=s.created_at.isoformat() if s.created_at else None,
            last_event_at=s.last_event_at.isoformat() if s.last_event_at else None
        ))
    return results

@router.post("/", response_model=LogSourceModel)
def create_source(source_data: LogSourceModel, db: Session = Depends(get_db)):
    existing = db.query(DBLogSource).filter(DBLogSource.name == source_data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="A source with this name already exists.")

    new_source = DBLogSource(
        name=source_data.name,
        input_type=source_data.input_type,
        status="ACTIVE",
        host=source_data.host,
        port=source_data.port,
        events_per_sec=source_data.events_per_sec or 100.0,
        total_events=0,
        failed_events=0,
        parser_name=source_data.parser_name,
        description=source_data.description,
        created_at=datetime.now(timezone.utc)
    )
    db.add(new_source)
    db.commit()
    db.refresh(new_source)
    return LogSourceModel(
        id=new_source.id,
        name=new_source.name,
        input_type=new_source.input_type,
        status=new_source.status,
        host=new_source.host,
        port=new_source.port,
        events_per_sec=new_source.events_per_sec,
        total_events=new_source.total_events,
        failed_events=new_source.failed_events,
        parser_name=new_source.parser_name,
        description=new_source.description
    )

@router.post("/analyze-upload", response_model=SourceUploadAnalysisResponse)
def analyze_uploaded_samples(req: SourceUploadAnalysisRequest):
    """
    Analyzes uploaded sample logs: detects format, computes confidence score,
    extracts discovered field names, and proposes AI OCSF schema mappings.
    """
    raw_lines = [l.strip() for l in req.sample_content.splitlines() if l.strip()]
    if not raw_lines:
        raise HTTPException(status_code=400, detail="Uploaded sample log content is empty.")

    detector = FormatDetector()
    analysis = detector.analyze_batch(raw_lines[:20])

    # Generate AI mappings
    sample_first_line = raw_lines[0]
    pipeline = IngestionPipeline()
    sample_event = None
    try:
        sample_event = pipeline.process_raw_line(sample_first_line)
    except Exception:
        pass

    ai_suggestion = AIMappingGenerator.generate_suggestions(
        detected_format=analysis["detected_format"],
        detected_fields=analysis["detected_fields"],
        sample_data=sample_event.model_dump() if sample_event else None
    )

    sample_preview = sample_event.model_dump() if sample_event else {
        "event": {"category": "unknown", "action": "UNKNOWN"},
        "raw": {"message": sample_first_line}
    }

    return SourceUploadAnalysisResponse(
        source_name=req.source_name,
        input_type=req.input_type,
        detected_format=analysis["detected_format"].upper(),
        confidence=analysis["confidence"],
        total_sample_lines=len(raw_lines),
        detected_fields=analysis["detected_fields"],
        suggested_mappings=[m.model_dump() for m in ai_suggestion.suggested_mappings],
        sample_raw_line=sample_first_line,
        sample_normalized_preview=sample_preview,
        ready_to_deploy=True
    )
