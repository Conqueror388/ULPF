from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, JSON
from sqlalchemy.orm import declarative_base
from datetime import datetime, timezone

Base = declarative_base()

class DBLogSource(Base):
    __tablename__ = "log_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    input_type = Column(String(50), nullable=False)  # syslog, cef, json, csv, etc.
    status = Column(String(50), default="ACTIVE")
    host = Column(String(255), nullable=True)
    port = Column(Integer, nullable=True)
    events_per_sec = Column(Float, default=0.0)
    total_events = Column(Integer, default=0)
    failed_events = Column(Integer, default=0)
    parser_name = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_event_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class DBParserConfig(Base):
    __tablename__ = "parser_configs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    source_type = Column(String(50), nullable=False)
    version = Column(String(50), default="1.0")
    is_active = Column(Boolean, default=True)
    pattern = Column(Text, nullable=True)
    mappings = Column(JSON, default=list)  # List of FieldMapping dicts
    custom_rules = Column(JSON, default=dict)
    created_by = Column(String(100), default="admin")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class DBParserVersion(Base):
    __tablename__ = "parser_versions"

    id = Column(Integer, primary_key=True, index=True)
    parser_id = Column(Integer, index=True, nullable=False)
    parser_name = Column(String(255), index=True, nullable=False)
    version = Column(String(50), nullable=False)
    config_json = Column(JSON, nullable=False)
    changelog = Column(Text, nullable=False)
    created_by = Column(String(100), default="admin")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class DBAuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(50), nullable=False)  # CREATED, UPDATED, ROLLED_BACK, DELETED
    parser_name = Column(String(255), nullable=False)
    version = Column(String(50), nullable=False)
    performed_by = Column(String(100), default="admin")
    details = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class DBNormalizedEvent(Base):
    __tablename__ = "normalized_events"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String(64), unique=True, index=True, nullable=False)
    timestamp = Column(String(64), index=True, nullable=False)
    source_name = Column(String(255), index=True)
    category = Column(String(100), index=True)
    event_type = Column(String(100))
    action = Column(String(100), index=True)
    severity = Column(String(50), index=True)
    source_ip = Column(String(100), index=True)
    source_port = Column(Integer, nullable=True)
    dest_ip = Column(String(100), index=True)
    dest_port = Column(Integer, nullable=True)
    user_name = Column(String(100), index=True)
    protocol = Column(String(50))
    raw_hash = Column(String(64), index=True, nullable=False)
    raw_message = Column(Text, nullable=False)
    parser_name = Column(String(255))
    parser_version = Column(String(50), default="1.0")
    full_event_json = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
