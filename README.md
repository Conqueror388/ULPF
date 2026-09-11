# ULPF — Universal Log Pre-processing Framework (SIH26156)

[![Status](https://img.shields.io/badge/Status-Production%20Ready-emerald.svg)]()
[![Schema](https://img.shields.io/badge/Schema-OCSF%20Unified%20Event-cyan.svg)]()
[![Integrity](https://img.shields.io/badge/Integrity-SHA--256%20Cryptographic%20Proof-purple.svg)]()
[![Air--Gapped](https://img.shields.io/badge/Deployment-Air--Gapped%20%2F%20Docker-blue.svg)]()

> **"Upload or stream logs from any system → automatically understand them → convert them into one standard format → preserve the original → make them searchable and ready for SIEM/AI."**

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                   WEB DASHBOARD (React + TypeScript)                  │
│   Dashboard  |  Add Source  |  Live Stream  |  Log Explorer  |  Audit   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ REST / WebSocket (Port 8000)
                                    ↓
┌────────────────────────────────────────────────────────────────────────┐
│                        FASTAPI INGESTION ENGINE                        │
│                                                                        │
│   1. Ingest  →  2. Detect  →  3. Parse  →  4. Normalize  →  5. Validate│
│       │             │             │             │                │     │
│  Multi-Protocol  Format Conf.   Modular    OCSF Unified Schema  Schema │
│  Syslog/JSON/CEF  0.0 - 1.0     Parsers     Field Normalizer    Checks │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ↓
┌────────────────────────────────────────────────────────────────────────┐
│                      STORAGE & FORENSIC INTEGRITY                      │
│                                                                        │
│   • Raw Logs Vault (Bit-exact SHA-256 cryptographic verification)      │
│   • Normalized Events Index (Search, filtering, aggregations)          │
│   • Parser Rules & Version History (v1.0 -> v1.1 with instant rollback)│
│   • Immutable Compliance Audit Trail                                   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features & Demo Highlights

1. **Executive Dashboard (`DashboardPage`)**:
   - Ingestion throughput (EPS), processed vs. quarantined events, error rate.
   - Events/minute line chart with automated spike detection.
   - OCSF severity breakdown and source distribution.
2. **Add Log Source & AI Parser Generator (`AddSourcePage`)**:
   - One-click preset loader for Palo Alto NGFW, Windows Security XML, AWS CloudTrail JSON, Suricata CEF, and Unknown proprietary banking logs.
   - Format detection with confidence scoring (>95%).
   - AI-assisted field mapping generator with human-in-the-loop approval.
3. **Real-Time Live Ingestion (`LiveIngestionPage`)**:
   - Live stream with Play/Pause, speed control (1x, 2x, 5x).
   - Side-by-side terminal: Incoming unparsed logs ↔ Normalized OCSF events with green verification checks.
4. **Unified Log Explorer & Dual-Pane Inspector (`LogExplorerPage`)**:
   - Full-text & structured queries (`source.ip:192.168.1.10`, `severity:HIGH`, `action:DENY`).
   - Side-by-side split modal: **Original Unmodified Log** (with SHA-256 hash) ↔ **OCSF Normalized JSON**.
5. **Parser Rule Governance & Rollback (`ParserManagerPage`)**:
   - Parser versioning (`v1.0` -> `v1.1` -> `v1.2`).
   - Instant 1-click rollback to any previous version snapshot.
6. **Immutable Audit Trail (`AuditTrailPage`)**:
   - Cryptographic tracking of who created, updated, or rolled back parser configurations.
7. **Judge Presentation Walkthrough (`InteractiveDemoPage`)**:
   - Guided 6-step presentation mode designed specifically for SIH demoing.

---

## 🚀 Quick Start (Local)

### 1. Requirements
- Python 3.10+
- Node.js 18+

### 2. Run Everything with One Command
```bash
python start_all.py
```

Or start individually:
```bash
# Terminal 1: Backend
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2: Frontend
cd frontend
npm run dev
```

- **Web Dashboard**: `http://localhost:3000`
- **FastAPI Interactive Docs**: `http://localhost:8000/docs`

---

## 🐳 Docker / Air-Gapped Deployment

To run ULPF in an offline / air-gapped environment:
```bash
docker compose up --build
```

---

## 🧪 Automated Testing

Run the test suite:
```bash
python -m pytest backend/tests/
```
