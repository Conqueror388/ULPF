import pytest
from backend.app.engine.detector import FormatDetector
from backend.app.engine.integrity import IntegrityEngine
from backend.app.engine.ingestion_pipeline import IngestionPipeline
from backend.app.parsers.json_parser import JsonParser
from backend.app.parsers.syslog_parser import SyslogParser
from backend.app.parsers.cef_parser import CefParser

def test_integrity_hash():
    sample = "<134>1 2026-09-01T10:32:01Z fw01 firewall - - - action=DENY src=192.168.1.10"
    h1 = IntegrityEngine.generate_sha256(sample)
    assert len(h1) == 64
    assert IntegrityEngine.verify_integrity(sample, h1) is True
    assert IntegrityEngine.verify_integrity(sample + "TAMPERED", h1) is False

def test_syslog_detection_and_parsing():
    raw_syslog = "<134>1 2026-09-01T10:32:01Z fw01.corp.net firewall 1024 - - proto=TCP src=192.168.1.10 dst=10.0.0.20 sport=54321 dport=443 action=DENY user=admin"
    detector = FormatDetector()
    parser, fmt, conf = detector.detect_format(raw_syslog)
    assert fmt == "syslog"
    assert conf > 0.90

    pipeline = IngestionPipeline()
    event = pipeline.process_raw_line(raw_syslog)
    assert event.source.ip == "192.168.1.10"
    assert event.destination.ip == "10.0.0.20"
    assert event.destination.port == 443
    assert event.event.action == "DENY"
    assert event.event.severity == "HIGH"
    assert event.user.name == "admin"
    assert event.is_valid is True

def test_json_parsing():
    raw_json = '{"eventSource": "iam.amazonaws.com", "eventName": "CreateUser", "sourceIPAddress": "1.2.3.4", "userIdentity": {"userName": "alice"}}'
    pipeline = IngestionPipeline()
    event = pipeline.process_raw_line(raw_json)
    assert event.source.ip == "1.2.3.4"
    assert event.user.name == "alice"
    assert event.event.action == "CREATEUSER"
    assert event.is_valid is True

def test_cef_parsing():
    raw_cef = "CEF:0|Suricata|IDP|6.0.4|2001219|Potential SSH Scan|3|src=192.168.1.105 dst=198.51.100.12 sport=55412 dport=22 proto=TCP"
    pipeline = IngestionPipeline()
    event = pipeline.process_raw_line(raw_cef)
    assert event.source.ip == "192.168.1.105"
    assert event.destination.ip == "198.51.100.12"
    assert event.destination.port == 22
    assert event.network.protocol == "TCP"
    assert event.is_valid is True

def test_csv_parsing():
    raw_csv = "2026-09-01T10:32:15Z,192.168.1.88,GET /api/v1/auth,401,10.0.0.5,443"
    pipeline = IngestionPipeline()
    event = pipeline.process_raw_line(raw_csv)
    assert event.raw.format == "csv"
    assert event.is_valid is True

def test_xml_parsing():
    raw_xml = "<Event><System><EventID>4624</EventID><TimeCreated SystemTime='2026-09-01T10:32:00Z'/></System><EventData><Data Name='TargetUserName'>security_lead</Data><Data Name='IpAddress'>10.0.0.15</Data></EventData></Event>"
    pipeline = IngestionPipeline()
    event = pipeline.process_raw_line(raw_xml)
    assert event.raw.format == "xml"
    assert event.source.ip == "10.0.0.15"
    assert event.user.name == "security_lead"
    assert event.is_valid is True

def test_format_detector_batch():
    detector = FormatDetector()
    samples = [
        "<134>1 2026-09-01T10:32:01Z fw01 action=DENY src=192.168.1.10",
        "<134>1 2026-09-01T10:32:02Z fw01 action=ALLOW src=192.168.1.20"
    ]
    analysis = detector.analyze_batch(samples)
    assert analysis["detected_format"] == "syslog"
    assert analysis["confidence"] >= 0.90
    assert "src" in analysis["detected_fields"]
    assert "action" in analysis["detected_fields"]
