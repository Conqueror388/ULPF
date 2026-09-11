import re
from typing import Dict, Any, Tuple, List, Optional
from backend.app.parsers.base import BaseParser

class CustomRuleParser(BaseParser):
    name = "custom_rule_parser"
    format_type = "custom"

    def __init__(self, rule_name: str, pattern: Optional[str] = None, mappings: Optional[List[Dict[str, Any]]] = None):
        self.name = rule_name
        self.pattern = pattern
        self.compiled_regex = re.compile(pattern) if pattern else None
        self.mappings = mappings or []

    def can_parse(self, raw_log: str) -> Tuple[bool, float]:
        if not self.compiled_regex:
            return False, 0.0
        if self.compiled_regex.search(raw_log):
            return True, 0.95
        return False, 0.0

    def parse(self, raw_log: str) -> Dict[str, Any]:
        result: Dict[str, Any] = {}
        if self.compiled_regex:
            match = self.compiled_regex.search(raw_log.strip())
            if match:
                result = match.groupdict()
        if not result:
            # Fallback key-value pattern extraction
            kv_pairs = re.findall(r'([a-zA-Z0-9_\-\.]+)=("([^"]*)"|\'([^\']*)\'|([^\s,]+))', raw_log)
            for m in kv_pairs:
                result[m[0]] = m[2] or m[3] or m[4]
        return result
