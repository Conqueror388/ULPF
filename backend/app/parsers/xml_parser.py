import xml.etree.ElementTree as ET
from typing import Dict, Any, Tuple
from backend.app.parsers.base import BaseParser

class XmlParser(BaseParser):
    name = "xml_parser"
    format_type = "xml"

    def can_parse(self, raw_log: str) -> Tuple[bool, float]:
        raw_log = raw_log.strip()
        if raw_log.startswith("<") and raw_log.endswith(">") and not raw_log.startswith("<1") and not raw_log.startswith("<0"):
            try:
                ET.fromstring(raw_log)
                return True, 0.95
            except Exception:
                pass
        return False, 0.0

    def parse(self, raw_log: str) -> Dict[str, Any]:
        result: Dict[str, Any] = {}
        try:
            root = ET.fromstring(raw_log.strip())
            def _traverse(node, prefix=""):
                tag = node.tag.split("}")[-1]  # Remove XML namespaces
                key = f"{prefix}.{tag}" if prefix else tag
                text = node.text.strip() if node.text else ""
                
                # Check for Windows Event Data Name attribute: <Data Name='TargetUserName'>value</Data>
                if "Name" in node.attrib and text:
                    result[node.attrib["Name"]] = text
                    result[f"{key}.{node.attrib['Name']}"] = text

                if text:
                    result[key] = text

                for attr_k, attr_v in node.attrib.items():
                    result[f"{key}@{attr_k}"] = attr_v

                for child in node:
                    _traverse(child, key)
            _traverse(root)
        except Exception as e:
            result["_xml_error"] = str(e)
            result["raw"] = raw_log
        return result
