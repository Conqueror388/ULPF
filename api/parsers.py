from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

from backend.app.storage.database import get_db
from backend.app.storage.models import DBParserConfig, DBParserVersion, DBAuditLog
from backend.app.schema.parser_models import (
    ParserConfigModel, ParserVersionModel, AuditLogModel,
    ParseTestRequest, ParseTestResponse, FieldMapping, AIMappingSuggestion
)
from backend.app.engine.ingestion_pipeline import IngestionPipeline
from backend.app.engine.ai_mapper import AIMappingGenerator
from backend.app.engine.detector import FormatDetector
from backend.app.engine.integrity import IntegrityEngine

router = APIRouter(prefix="/api/parsers", tags=["Parsers"])

@router.get("/", response_model=List[ParserConfigModel])
def list_parsers(db: Session = Depends(get_db)):
    parsers = db.query(DBParserConfig).all()
    results = []
    for p in parsers:
        results.append(ParserConfigModel(
            id=p.id,
            name=p.name,
            description=p.description,
            source_type=p.source_type,
            version=p.version,
            is_active=p.is_active,
            pattern=p.pattern,
            mappings=[FieldMapping(**m) for m in (p.mappings or [])],
            custom_rules=p.custom_rules or {},
            created_by=p.created_by,
            created_at=p.created_at.isoformat() if p.created_at else None,
            updated_at=p.updated_at.isoformat() if p.updated_at else None
        ))
    return results

@router.post("/", response_model=ParserConfigModel)
def create_or_update_parser(config: ParserConfigModel, db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)
    existing = db.query(DBParserConfig).filter(DBParserConfig.name == config.name).first()

    mappings_json = [m.model_dump() for m in config.mappings]

    if existing:
        # Determine next version (e.g., v1.1 -> v1.2)
        old_ver = existing.version
        try:
            ver_num = float(old_ver.replace("v", ""))
            new_ver = f"v{ver_num + 0.1:.1f}"
        except Exception:
            new_ver = f"{old_ver}.1"

        # Save previous version in version history
        version_entry = DBParserVersion(
            parser_id=existing.id,
            parser_name=existing.name,
            version=existing.version,
            config_json={
                "mappings": existing.mappings,
                "pattern": existing.pattern,
                "source_type": existing.source_type
            },
            changelog=f"Updated by {config.created_by or 'admin'}",
            created_by=config.created_by or "admin",
            created_at=now
        )
        db.add(version_entry)

        existing.version = new_ver
        existing.description = config.description or existing.description
        existing.mappings = mappings_json
        existing.pattern = config.pattern
        existing.source_type = config.source_type
        existing.updated_at = now
        db.commit()
        db.refresh(existing)

        # Audit log
        db.add(DBAuditLog(
            action="UPDATED",
            parser_name=existing.name,
            version=existing.version,
            performed_by=config.created_by or "admin",
            details=f"Updated parser mappings ({len(mappings_json)} rules). Previous version: {old_ver}",
            timestamp=now
        ))
        db.commit()

        target_obj = existing
    else:
        new_parser = DBParserConfig(
            name=config.name,
            description=config.description or "",
            source_type=config.source_type,
            version=config.version or "v1.0",
            is_active=True,
            pattern=config.pattern,
            mappings=mappings_json,
            custom_rules=config.custom_rules or {},
            created_by=config.created_by or "admin",
            created_at=now,
            updated_at=now
        )
        db.add(new_parser)
        db.commit()
        db.refresh(new_parser)

        # Initial version snapshot
        db.add(DBParserVersion(
            parser_id=new_parser.id,
            parser_name=new_parser.name,
            version=new_parser.version,
            config_json={"mappings": mappings_json, "pattern": config.pattern},
            changelog="Initial parser creation",
            created_by=config.created_by or "admin",
            created_at=now
        ))
        # Audit log
        db.add(DBAuditLog(
            action="CREATED",
            parser_name=new_parser.name,
            version=new_parser.version,
            performed_by=config.created_by or "admin",
            details=f"Created new parser configuration with {len(mappings_json)} mappings",
            timestamp=now
        ))
        db.commit()
        target_obj = new_parser

    return ParserConfigModel(
        id=target_obj.id,
        name=target_obj.name,
        description=target_obj.description,
        source_type=target_obj.source_type,
        version=target_obj.version,
        is_active=target_obj.is_active,
        pattern=target_obj.pattern,
        mappings=[FieldMapping(**m) for m in (target_obj.mappings or [])],
        custom_rules=target_obj.custom_rules or {},
        created_by=target_obj.created_by,
        created_at=target_obj.created_at.isoformat(),
        updated_at=target_obj.updated_at.isoformat()
    )

@router.post("/test", response_model=ParseTestResponse)
def test_parser(req: ParseTestRequest):
    """
    Tests a sample log line in real-time with custom or auto mappings.
    """
    if not req.sample_log or not req.sample_log.strip():
        raise HTTPException(status_code=400, detail="Empty sample log")

    pipeline = IngestionPipeline()
    detector = FormatDetector()
    _, detected_fmt, conf = detector.detect_format(req.sample_log)
    raw_hash = IntegrityEngine.generate_sha256(req.sample_log)

    try:
        event = pipeline.process_raw_line(
            raw_line=req.sample_log,
            forced_format=req.format or detected_fmt,
            custom_mappings=req.mappings
        )
        return ParseTestResponse(
            success=event.is_valid,
            detected_format=(req.format or detected_fmt).upper(),
            confidence=conf or 0.95,
            normalized_event=event.model_dump(),
            raw_hash=raw_hash,
            unmapped_fields=event.unmapped,
            errors=event.validation_errors
        )
    except Exception as e:
        return ParseTestResponse(
            success=False,
            detected_format="UNKNOWN",
            confidence=0.0,
            normalized_event=None,
            raw_hash=raw_hash,
            errors=[str(e)]
        )

@router.get("/versions/{parser_name}", response_model=List[ParserVersionModel])
def get_parser_versions(parser_name: str, db: Session = Depends(get_db)):
    versions = db.query(DBParserVersion).filter(DBParserVersion.parser_name == parser_name).order_by(DBParserVersion.id.desc()).all()
    results = []
    for v in versions:
        results.append(ParserVersionModel(
            id=v.id,
            parser_id=v.parser_id,
            version=v.version,
            config_json=v.config_json,
            changelog=v.changelog,
            created_by=v.created_by,
            created_at=v.created_at.isoformat()
        ))
    return results

@router.post("/rollback/{parser_id}/{version_id}")
def rollback_parser_version(parser_id: int, version_id: int, db: Session = Depends(get_db)):
    parser = db.query(DBParserConfig).filter(DBParserConfig.id == parser_id).first()
    version_entry = db.query(DBParserVersion).filter(DBParserVersion.id == version_id).first()

    if not parser or not version_entry:
        raise HTTPException(status_code=404, detail="Parser or Version not found")

    old_ver = parser.version
    target_ver = version_entry.version
    parser.mappings = version_entry.config_json.get("mappings", parser.mappings)
    parser.pattern = version_entry.config_json.get("pattern", parser.pattern)
    parser.version = f"{target_ver}-rollback"
    parser.updated_at = datetime.now(timezone.utc)

    db.add(DBAuditLog(
        action="ROLLED_BACK",
        parser_name=parser.name,
        version=parser.version,
        performed_by="admin",
        details=f"Rolled back from {old_ver} to configuration of {target_ver}",
        timestamp=datetime.now(timezone.utc)
    ))
    db.commit()

    return {"status": "success", "message": f"Successfully rolled back to version {target_ver}"}

@router.get("/audit-logs", response_model=List[AuditLogModel])
def get_audit_logs(db: Session = Depends(get_db)):
    logs = db.query(DBAuditLog).order_by(DBAuditLog.id.desc()).limit(100).all()
    results = []
    for l in logs:
        results.append(AuditLogModel(
            id=l.id,
            action=l.action,
            parser_name=l.parser_name,
            version=l.version,
            performed_by=l.performed_by,
            details=l.details,
            timestamp=l.timestamp.isoformat()
        ))
    return results
