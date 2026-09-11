import re
from typing import Dict, Any, Tuple
from backend.app.parsers.base import BaseParser

KV_REGEX = re.compile(r'([a-zA-Z0-9_\-\.]+)=("([^"]*)"|\'([^\']*)\'|([^\s,]+))')

class CefParser(BaseParser):
    name = "cef_parser"
    format_type = "cef"

    def can_parse(self, raw_log: str) -> Tuple[bool, float]:
        raw_log = raw_log.strip()
        if "CEF:" in raw_log:
            return True, 0.99
        return False, 0.0

    def parse(self, raw_log: str) -> Dict[str, Any]:
        raw_log = raw_log.strip()
        idx = raw_log.find("CEF:")
        if idx != -1:
            raw_log = raw_log[idx:]
            
        parts = raw_log.split("|")
        result: Dict[str, Any] = {}
        if len(parts) >= 7:
            result["cef_version"] = parts[0].replace("CEF:", "").strip()
            result["device_vendor"] = parts[1].strip()
            result["device_product"] = parts[2].strip()
            result["device_version"] = parts[3].strip()
            result["signature_id"] = parts[4].strip()
            result["name"] = parts[5].strip()
            result["severity"] = parts[6].strip()

            # Extension key-value pairs
            if len(parts) > 7:
                extension_str = "|".join(parts[7:])
                matches = KV_REGEX.findall(extension_str)
                for m in matches:
                    k = m[0]
                    v = m[2] if m[2] else (m[3] if m[3] else m[4])
                    result[k] = v
        return result
