"""
Unified Event Schema (OCSF Aligned)
Standard schema for all normalized logs in ULPF.
"""
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime, timezone
import uuid

class EventMetadata(BaseModel):
    category: str = Field(default="generic", description="authentication, network, system, security_alert, web, database")
    type: str = Field(default="activity", description="login, traffic, file_access, query, alert")
    action: str = Field(default="unknown", description="allowed, denied, failed, success, blocked, error")
    severity: str = Field(default="LOW", description="INFORMATIONAL, LOW, MEDIUM, HIGH, CRITICAL")
    outcome: Optional[str] = Field(default="unknown", description="success, failure, unknown")
    code: Optional[str] = None
    reason: Optional[str] = None

class Endpoint(BaseModel):
    ip: Optional[str] = None
    port: Optional[int] = None
    hostname: Optional[str] = None
    mac: Optional[str] = None
    domain: Optional[str] = None
    geo_country: Optional[str] = None

class UserInfo(BaseModel):
    name: Optional[str] = None
    id: Optional[str] = None
    domain: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None

class NetworkInfo(BaseModel):
    protocol: Optional[str] = None
    bytes_in: Optional[int] = None
    bytes_out: Optional[int] = None
    packets: Optional[int] = None
    direction: Optional[str] = None
    session_id: Optional[str] = None

class HttpInfo(BaseModel):
    method: Optional[str] = None
    url: Optional[str] = None
    status_code: Optional[int] = None
    user_agent: Optional[str] = None
    referer: Optional[str] = None

class ObserverInfo(BaseModel):
    vendor: Optional[str] = None
    product: Optional[str] = None
    version: Optional[str] = None
    hostname: Optional[str] = None

class RawLogPayload(BaseModel):
    message: str
    format: str = "unknown"
    sha256: str
    byte_size: int
    received_at: str

class ParserMetadata(BaseModel):
    name: str
    version: str = "1.0"
    confidence: float = 1.0

class UnifiedEvent(BaseModel):
    event_id: str = Field(default_factory=lambda: f"ULPF-{uuid.uuid4().hex[:12].upper()}")
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    event: EventMetadata = Field(default_factory=EventMetadata)
    source: Endpoint = Field(default_factory=Endpoint)
    destination: Endpoint = Field(default_factory=Endpoint)
    user: UserInfo = Field(default_factory=UserInfo)
    network: NetworkInfo = Field(default_factory=NetworkInfo)
    http: Optional[HttpInfo] = None
    observer: ObserverInfo = Field(default_factory=ObserverInfo)
    raw: RawLogPayload
    parser: ParserMetadata
    unmapped: Dict[str, Any] = Field(default_factory=dict)
    is_valid: bool = True
    validation_errors: list[str] = Field(default_factory=list)
