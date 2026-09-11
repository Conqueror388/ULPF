import re
from typing import Dict, Any, Tuple
from backend.app.parsers.base import BaseParser

# RFC 3164 / RFC 5424 / Common Firewall Syslog patterns
SYSLOG_PRI_REGEX = re.compile(r"^<(\d{1,3})>(?:(\d+)\s+)?(.*)$")
KV_REGEX = re.compile(r'([a-zA-Z0-9_\-\.]+)=("([^"]*)"|\'([^\']*)\'|([^\s,]+))')

class SyslogParser(BaseParser):
    name = "syslog_parser"
    format_type = "syslog"

    def can_parse(self, raw_log: str) -> Tuple[bool, float]:
        raw_log = raw_log.strip()
        if raw_log.startswith("<") and ">" in raw_log[:6]:
            return True, 0.98
        # Check for standard syslog timestamp formats (e.g. Sep 1 10:32:01 or 2026-09-01T10:32:01)
        if re.match(r"^[A-Z][a-z]{2}\s+\d+\s+\d{2}:\d{2}:\d{2}", raw_log):
            return True, 0.90
        if re.match(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[^\s,]*\s+", raw_log):
            return True, 0.85
        return False, 0.0

    def parse(self, raw_log: str) -> Dict[str, Any]:
        raw_log = raw_log.strip()
        result: Dict[str, Any] = {}
        
        # 1. Check for PRI facility/severity
        pri_match = SYSLOG_PRI_REGEX.match(raw_log)
        content = raw_log
        if pri_match:
            pri = int(pri_match.group(1))
            result["pri"] = pri
            result["facility"] = pri >> 3
            result["severity_code"] = pri & 7
            content = pri_match.group(3)

        # 2. Extract timestamp and hostname if present
        # Format: Sep 01 10:32:01 hostname app[pid]: message
        # Format: 2026-09-01T10:32:01Z hostname app ...
        parts = content.split(" ", 4)
        if len(parts) >= 3:
            # Check ISO timestamp
            if re.match(r"^\d{4}-\d{2}-\d{2}", parts[0]):
                result["timestamp"] = parts[0]
                if len(parts) > 1:
                    result["hostname"] = parts[1]
                if len(parts) > 2:
                    result["program"] = parts[2]
            elif re.match(r"^[A-Z][a-z]{2}$", parts[0]) and len(parts) >= 4:
                result["timestamp"] = f"{parts[0]} {parts[1]} {parts[2]}"
                result["hostname"] = parts[3]
                if len(parts) > 4:
                    result["program"] = parts[4].split(":")[0]

        # 3. Extract all Key=Value pairs from the remaining text
        kv_pairs = KV_REGEX.findall(content)
        for match in kv_pairs:
            k = match[0].lower()
            # Pick non-empty group value
            v = match[2] if match[2] else (match[3] if match[3] else match[4])
            result[k] = v

        result["_raw_content"] = content
        return result
