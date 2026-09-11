import json
from typing import Dict, Any, Tuple
from backend.app.parsers.base import BaseParser

class JsonParser(BaseParser):
    name = "json_parser"
    format_type = "json"

    def can_parse(self, raw_log: str) -> Tuple[bool, float]:
        raw_log = raw_log.strip()
        if not (raw_log.startswith("{") and raw_log.endswith("}")):
            return False, 0.0
        try:
            data = json.loads(raw_log)
            if isinstance(data, dict):
                # High confidence if valid json dict
                return True, 0.99
        except Exception:
            pass
        return False, 0.0

    def parse(self, raw_log: str) -> Dict[str, Any]:
        data = json.loads(raw_log.strip())
        # Flatten simple 1-level nested dicts for easier mapping
        flattened = {}
        def _flatten(obj, prefix=""):
            for k, v in obj.items():
                key = f"{prefix}.{k}" if prefix else k
                if isinstance(v, dict):
                    _flatten(v, key)
                else:
                    flattened[key] = v
        _flatten(data)
        return {**data, "_flattened": flattened}
