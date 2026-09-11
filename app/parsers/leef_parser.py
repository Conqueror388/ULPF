import re
from typing import Dict, Any, Tuple
from backend.app.parsers.base import BaseParser

KV_REGEX = re.compile(r'([a-zA-Z0-9_\-\.]+)=("([^"]*)"|\'([^\']*)\'|([^\t\^,]+))')

class LeefParser(BaseParser):
    name = "leef_parser"
    format_type = "leef"

    def can_parse(self, raw_log: str) -> Tuple[bool, float]:
        raw_log = raw_log.strip()
        if "LEEF:" in raw_log:
            return True, 0.99
        return False, 0.0

    def parse(self, raw_log: str) -> Dict[str, Any]:
        raw_log = raw_log.strip()
        idx = raw_log.find("LEEF:")
        if idx != -1:
            raw_log = raw_log[idx:]
            
        parts = raw_log.split("|")
        result: Dict[str, Any] = {}
        if len(parts) >= 5:
            result["leef_version"] = parts[0].replace("LEEF:", "").strip()
            result["vendor"] = parts[1].strip()
            result["product"] = parts[2].strip()
            result["version"] = parts[3].strip()
            result["event_id"] = parts[4].strip()

            if len(parts) > 5:
                ext_str = "|".join(parts[5:])
                matches = KV_REGEX.findall(ext_str)
                for m in matches:
                    k = m[0]
                    v = m[2] if m[2] else (m[3] if m[3] else m[4])
                    result[k] = v
        return result
