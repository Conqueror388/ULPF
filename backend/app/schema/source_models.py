from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class LogSourceModel(BaseModel):
    id: Optional[int] = None
    name: str
    input_type: str  # syslog, cef, json, file_upload, webhook, api
    status: str = "ACTIVE"  # ACTIVE, PAUSED, ERROR, INACTIVE
    host: Optional[str] = None
    port: Optional[int] = None
    events_per_sec: float = 0.0
    total_events: int = 0
    failed_events: int = 0
    parser_id: Optional[int] = None
    parser_name: Optional[str] = None
    description: Optional[str] = None
    created_at: Optional[str] = None
    last_event_at: Optional[str] = None

class SourceUploadAnalysisRequest(BaseModel):
    source_name: str
    input_type: str
    sample_content: str
    filename: Optional[str] = None

class SourceUploadAnalysisResponse(BaseModel):
    source_name: str
    input_type: str
    detected_format: str
    confidence: float
    total_sample_lines: int
    detected_fields: List[str]
    suggested_mappings: List[Dict[str, Any]]
    sample_raw_line: str
    sample_normalized_preview: Dict[str, Any]
    ready_to_deploy: bool = True
