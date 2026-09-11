from typing import List, Tuple, Dict, Any, Optional
from backend.app.parsers.base import BaseParser
from backend.app.parsers.json_parser import JsonParser
from backend.app.parsers.cef_parser import CefParser
from backend.app.parsers.leef_parser import LeefParser
from backend.app.parsers.xml_parser import XmlParser
from backend.app.parsers.syslog_parser import SyslogParser
from backend.app.parsers.csv_parser import CsvParser

class FormatDetector:
    def __init__(self, custom_parsers: Optional[List[BaseParser]] = None):
        self.parsers: List[BaseParser] = [
            JsonParser(),
            CefParser(),
            LeefParser(),
            XmlParser(),
            SyslogParser(),
            CsvParser()
        ]
        if custom_parsers:
            self.parsers = custom_parsers + self.parsers

    def detect_format(self, sample_line: str) -> Tuple[Optional[BaseParser], str, float]:
        """
        Tests line against all registered parsers and returns (Parser, format_name, confidence)
        """
        best_parser: Optional[BaseParser] = None
        best_format: str = "unknown"
        highest_confidence: float = 0.0

        for parser in self.parsers:
            can_parse, confidence = parser.can_parse(sample_line)
            if can_parse and confidence > highest_confidence:
                highest_confidence = confidence
                best_parser = parser
                best_format = parser.format_type

        return best_parser, best_format, highest_confidence

    def analyze_batch(self, sample_lines: List[str]) -> Dict[str, Any]:
        """
        Analyzes a batch of sample lines to detect format, aggregate confidence, and extract discovered fields.
        """
        if not sample_lines:
            return {
                "detected_format": "unknown",
                "confidence": 0.0,
                "detected_fields": [],
                "sample_count": 0
            }

        format_votes: Dict[str, int] = {}
        confidence_sums: Dict[str, float] = {}
        all_fields: set = set()
        representative_parser: Optional[BaseParser] = None

        for line in sample_lines:
            if not line.strip():
                continue
            parser, fmt, conf = self.detect_format(line)
            format_votes[fmt] = format_votes.get(fmt, 0) + 1
            confidence_sums[fmt] = confidence_sums.get(fmt, 0.0) + conf

            if parser:
                try:
                    parsed = parser.parse(line)
                    for k in parsed.keys():
                        if not k.startswith("_"):
                            all_fields.add(k)
                    if not representative_parser:
                        representative_parser = parser
                except Exception:
                    pass

        # Winning format
        winner_fmt = max(format_votes.keys(), key=lambda k: format_votes[k])
        count = format_votes[winner_fmt]
        avg_conf = confidence_sums[winner_fmt] / count if count > 0 else 0.0

        return {
            "detected_format": winner_fmt,
            "confidence": round(avg_conf, 2),
            "detected_fields": sorted(list(all_fields)),
            "sample_count": len(sample_lines),
            "parser_name": representative_parser.name if representative_parser else "unknown"
        }
