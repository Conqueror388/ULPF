from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

class FieldMapping(BaseModel):
    source_field: str
    target_field: str
    data_type: str = "string"  # string, integer, float, datetime, ip, enum
    confidence: float = 1.0
    transform: Optional[str] = None  # uppercase, lowercase, int_cast, timestamp_iso

class ParserConfigModel(BaseModel):
    id: Optional[int] = None
    name: str
    description: Optional[str] = ""
    source_type: str  # syslog, cef, leef, json, csv, xml, custom
    version: str = "1.0"
    is_active: bool = True
    pattern: Optional[str] = None  # Regex / Grok / Delimiter pattern
    mappings: List[FieldMapping] = Field(default_factory=list)
    custom_rules: Dict[str, Any] = Field(default_factory=dict)
    created_by: str = "system"
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class ParserVersionModel(BaseModel):
    id: Optional[int] = None
    parser_id: int
    version: str
    config_json: Dict[str, Any]
    changelog: str
    created_by: str
    created_at: str

class AuditLogModel(BaseModel):
    id: Optional[int] = None
    action: str  # CREATED, UPDATED, ROLLED_BACK, DELETED, TESTED
    parser_name: str
    version: str
    performed_by: str
    details: str
    timestamp: str

class AIMappingSuggestion(BaseModel):
    detected_format: str
    confidence: float
    detected_fields: List[str]
    suggested_mappings: List[FieldMapping]
    sample_parsed_event: Optional[Dict[str, Any]] = None
    explanation: str

class ParseTestRequest(BaseModel):
    sample_log: str
    format: Optional[str] = None
    mappings: Optional[List[FieldMapping]] = None
    pattern: Optional[str] = None

class ParseTestResponse(BaseModel):
    success: bool
    detected_format: str
    confidence: float
    normalized_event: Optional[Dict[str, Any]] = None
    raw_hash: str
    unmapped_fields: Dict[str, Any] = Field(default_factory=dict)
    errors: List[str] = Field(default_factory=list)
