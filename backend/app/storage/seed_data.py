import json
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from backend.app.storage.models import (
    DBLogSource, DBParserConfig, DBParserVersion, DBAuditLog, DBNormalizedEvent
)
from backend.app.engine.ingestion_pipeline import IngestionPipeline

SAMPLE_LOG_RECORDS = [
    # 1. Palo Alto Firewall Syslog (DENY)
    "<134>1 2026-09-01T10:32:01Z fw01.corp.net firewall 1024 - - proto=TCP src=192.168.1.10 dst=10.0.0.20 sport=54321 dport=443 action=DENY user=admin",
    # 2. Palo Alto Firewall Syslog (ALLOW)
    "<134>1 2026-09-01T10:32:02Z fw01.corp.net firewall 1024 - - proto=TCP src=192.168.1.55 dst=10.0.0.80 sport=49152 dport=80 action=ALLOW user=dev_user",
    # 3. Windows Security Event (Event ID 4625 - Failed Login)
    "<Event xmlns='http://schemas.microsoft.com/win/2004/08/events/event'><System><Provider Name='Microsoft-Windows-Security-Auditing'/><EventID>4625</EventID><Level>0</Level><TimeCreated SystemTime='2026-09-01T10:32:04Z'/><Computer>DC01.corp.local</Computer></System><EventData><Data Name='TargetUserName'>administrator</Data><Data Name='IpAddress'>10.0.0.12</Data><Data Name='IpPort'>50210</Data><Data Name='Status'>0xC000006D</Data><Data Name='SubStatus'>0xC000006A</Data></EventData></Event>",
    # 4. Windows Security Event (Event ID 4624 - Successful Login)
    "<Event xmlns='http://schemas.microsoft.com/win/2004/08/events/event'><System><Provider Name='Microsoft-Windows-Security-Auditing'/><EventID>4624</EventID><Level>0</Level><TimeCreated SystemTime='2026-09-01T10:32:06Z'/><Computer>DC01.corp.local</Computer></System><EventData><Data Name='TargetUserName'>security_lead</Data><Data Name='IpAddress'>10.0.0.15</Data><Data Name='IpPort'>51230</Data><Data Name='Status'>0x0</Data></EventData></Event>",
    # 5. AWS CloudTrail JSON Event (ConsoleLogin Failed)
    json.dumps({
        "eventVersion": "1.08",
        "userIdentity": {"type": "IAMUser", "userName": "root_backup", "accountId": "123456789012"},
        "eventTime": "2026-09-01T10:32:10Z",
        "eventSource": "signin.amazonaws.com",
        "eventName": "ConsoleLogin",
        "awsRegion": "us-east-1",
        "sourceIPAddress": "203.0.113.45",
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "errorMessage": "Failed authentication",
        "responseElements": {"ConsoleLogin": "Failure"},
        "additionalEventData": {"MFAUsed": "No"}
    }),
    # 6. Suricata IDS CEF Alert
    "CEF:0|Suricata|IDP|6.0.4|2001219|ET SCAN Potential SSH Scan OUTBOUND|3|src=192.168.1.105 dst=198.51.100.12 sport=55412 dport=22 proto=TCP msg=ET SCAN Potential SSH Scan OUTBOUND",
    # 7. Nginx Access Log (CSV / Delimited)
    "2026-09-01T10:32:15Z,192.168.1.88,GET /api/v1/auth/token,401,10.0.0.5,443,curl/7.68.0",
    # 8. Palo Alto Firewall Syslog (CRITICAL Threat detected)
    "<130>1 2026-09-01T10:32:18Z fw01.corp.net firewall 1024 - - proto=UDP src=192.168.1.200 dst=10.0.0.53 sport=61234 dport=53 action=BLOCK threat=DNS-Tunneling severity=CRITICAL user=guest_user",
    # 9. AWS CloudTrail JSON Event (Unauthorized S3 Access)
    json.dumps({
        "eventVersion": "1.08",
        "userIdentity": {"type": "IAMUser", "userName": "finance_audit", "accountId": "123456789012"},
        "eventTime": "2026-09-01T10:32:20Z",
        "eventSource": "s3.amazonaws.com",
        "eventName": "GetObject",
        "awsRegion": "us-east-1",
        "sourceIPAddress": "198.51.100.77",
        "errorCode": "AccessDenied",
        "errorMessage": "Access Denied to bucket: confidential-financial-records",
        "requestParameters": {"bucketName": "confidential-financial-records", "key": "q3_report.pdf"}
    }),
    # 10. Palo Alto Firewall Syslog (Port Scan)
    "<134>1 2026-09-01T10:32:25Z fw01.corp.net firewall 1024 - - proto=TCP src=192.168.1.99 dst=10.0.0.10 sport=44122 dport=3389 action=DENY user=anonymous"
]

def seed_database(db: Session):
    # Check if already seeded
    if db.query(DBLogSource).count() > 0:
        return

    pipeline = IngestionPipeline()
    now = datetime.now(timezone.utc)

    # 1. Seed Sources
    sources = [
        DBLogSource(
            name="Firewall-01 (Palo Alto)",
            input_type="syslog",
            status="ACTIVE",
            host="10.0.0.1",
            port=514,
            events_per_sec=1240.0,
            total_events=523450,
            failed_events=1200,
            parser_name="Palo Alto Firewall Parser v1.2",
            description="Perimeter corporate firewall syslog stream"
        ),
        DBLogSource(
            name="Windows-Domain-DC",
            input_type="xml",
            status="ACTIVE",
            host="10.0.0.2",
            port=5985,
            events_per_sec=820.0,
            total_events=386200,
            failed_events=940,
            parser_name="Windows Security Event Parser v2.0",
            description="Active Directory domain controller event audit stream"
        ),
        DBLogSource(
            name="AWS-CloudTrail-Prod",
            input_type="json",
            status="ACTIVE",
            host="s3.amazonaws.com",
            port=443,
            events_per_sec=450.0,
            total_events=224100,
            failed_events=310,
            parser_name="AWS CloudTrail JSON Parser v1.1",
            description="Cloud management and infrastructure audit trail"
        ),
        DBLogSource(
            name="Web-App-Nginx",
            input_type="csv",
            status="ACTIVE",
            host="10.0.0.5",
            port=80,
            events_per_sec=310.0,
            total_events=112000,
            failed_events=150,
            parser_name="Nginx Access Log Parser v1.3",
            description="Frontend edge reverse proxy logs"
        ),
        DBLogSource(
            name="Suricata-IDS",
            input_type="cef",
            status="ACTIVE",
            host="10.0.0.10",
            port=514,
            events_per_sec=630.0,
            total_events=194000,
            failed_events=188,
            parser_name="Suricata IDS CEF Parser v1.0",
            description="Intrusion Detection System signature alerts"
        )
    ]
    for s in sources:
        db.add(s)
    db.commit()

    # 2. Seed Parsers & Versions
    parsers = [
        DBParserConfig(
            name="Palo Alto Firewall Parser",
            description="Parses RFC 5424 Syslog traffic and threat logs from Palo Alto NGFW",
            source_type="syslog",
            version="v1.2",
            is_active=True,
            mappings=[
                {"source_field": "src", "target_field": "source.ip", "data_type": "ip", "confidence": 0.99},
                {"source_field": "dst", "target_field": "destination.ip", "data_type": "ip", "confidence": 0.99},
                {"source_field": "sport", "target_field": "source.port", "data_type": "integer", "confidence": 0.98},
                {"source_field": "dport", "target_field": "destination.port", "data_type": "integer", "confidence": 0.98},
                {"source_field": "proto", "target_field": "network.protocol", "data_type": "string", "confidence": 0.98},
                {"source_field": "action", "target_field": "event.action", "data_type": "enum", "confidence": 0.99},
                {"source_field": "user", "target_field": "user.name", "data_type": "string", "confidence": 0.95}
            ],
            created_by="sec_admin"
        ),
        DBParserConfig(
            name="Windows Security Event Parser",
            description="Normalizes Windows Security Audit XML events (Logon 4624, Failed 4625)",
            source_type="xml",
            version="v2.0",
            is_active=True,
            mappings=[
                {"source_field": "EventData.IpAddress", "target_field": "source.ip", "data_type": "ip", "confidence": 0.98},
                {"source_field": "EventData.IpPort", "target_field": "source.port", "data_type": "integer", "confidence": 0.95},
                {"source_field": "EventData.TargetUserName", "target_field": "user.name", "data_type": "string", "confidence": 0.99},
                {"source_field": "System.Computer", "target_field": "destination.hostname", "data_type": "string", "confidence": 0.95}
            ],
            created_by="system_engineer"
        ),
        DBParserConfig(
            name="AWS CloudTrail JSON Parser",
            description="Parses AWS CloudTrail JSON API and authentication logs",
            source_type="json",
            version="v1.1",
            is_active=True,
            mappings=[
                {"source_field": "sourceIPAddress", "target_field": "source.ip", "data_type": "ip", "confidence": 0.99},
                {"source_field": "userIdentity.userName", "target_field": "user.name", "data_type": "string", "confidence": 0.99},
                {"source_field": "eventName", "target_field": "event.action", "data_type": "enum", "confidence": 0.95},
                {"source_field": "eventSource", "target_field": "event.category", "data_type": "string", "confidence": 0.95}
            ],
            created_by="cloud_architect"
        ),
        DBParserConfig(
            name="Suricata IDS CEF Parser",
            description="Parses Common Event Format alerts from Suricata",
            source_type="cef",
            version="v1.0",
            is_active=True,
            mappings=[
                {"source_field": "src", "target_field": "source.ip", "data_type": "ip", "confidence": 0.99},
                {"source_field": "dst", "target_field": "destination.ip", "data_type": "ip", "confidence": 0.99},
                {"source_field": "sport", "target_field": "source.port", "data_type": "integer", "confidence": 0.98},
                {"source_field": "dport", "target_field": "destination.port", "data_type": "integer", "confidence": 0.98},
                {"source_field": "msg", "target_field": "event.type", "data_type": "string", "confidence": 0.95}
            ],
            created_by="soc_analyst"
        )
    ]
    for p in parsers:
        db.add(p)
    db.commit()

    # 3. Seed Versions & Audit Logs
    audit_logs = [
        DBAuditLog(
            action="CREATED",
            parser_name="Palo Alto Firewall Parser",
            version="v1.0",
            performed_by="ai_suggester",
            details="Initial parser generated from sample syslog files with AI heuristic mapper",
            timestamp=now - timedelta(days=4)
        ),
        DBAuditLog(
            action="UPDATED",
            parser_name="Palo Alto Firewall Parser",
            version="v1.1",
            performed_by="security_lead",
            details="Added user.name extraction and TCP/UDP protocol normalizer",
            timestamp=now - timedelta(days=2)
        ),
        DBAuditLog(
            action="UPDATED",
            parser_name="Palo Alto Firewall Parser",
            version="v1.2",
            performed_by="admin",
            details="Fine-tuned sport/dport casting rules and severity thresholds",
            timestamp=now - timedelta(hours=3)
        ),
        DBAuditLog(
            action="CREATED",
            parser_name="Windows Security Event Parser",
            version="v1.0",
            performed_by="system_engineer",
            details="Created XML tree extractor for Event IDs 4624/4625",
            timestamp=now - timedelta(days=3)
        ),
        DBAuditLog(
            action="UPDATED",
            parser_name="Windows Security Event Parser",
            version="v2.0",
            performed_by="system_engineer",
            details="Upgraded XPath extraction for nested LogonType and Status codes",
            timestamp=now - timedelta(days=1)
        )
    ]
    for a in audit_logs:
        db.add(a)
    db.commit()

    # 4. Ingest Sample Logs into Normalized Events table
    for i, raw_line in enumerate(SAMPLE_LOG_RECORDS):
        try:
            event = pipeline.process_raw_line(raw_line)
            db_event = DBNormalizedEvent(
                event_id=event.event_id,
                timestamp=event.timestamp,
                source_name=event.parser.name,
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
                created_at=now - timedelta(minutes=10 - i)
            )
            db.add(db_event)
        except Exception as e:
            pass
    db.commit()
