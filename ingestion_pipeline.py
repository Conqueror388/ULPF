from typing import Dict, Any, List, Optional
from backend.app.engine.detector import FormatDetector
from backend.app.engine.normalizer import Normalizer
from backend.app.engine.validator import EventValidator
from backend.app.schema.unified_event import UnifiedEvent
from backend.app.schema.parser_models import FieldMapping

class IngestionPipeline:
    def __init__(self):
        self.detector = FormatDetector()

    def process_raw_line(
        self,
        raw_line: str,
        forced_format: Optional[str] = None,
        parser_name: Optional[str] = None,
        parser_version: str = "1.0",
        custom_mappings: Optional[List[FieldMapping]] = None
    ) -> UnifiedEvent:
        """
        Executes Ingest -> Detect -> Parse -> Normalize -> Validate pipeline for a single raw log.
        """
        if not raw_line or not raw_line.strip():
            raise ValueError("Empty log line provided")

        clean_line = raw_line.strip()

        # Step 1 & 2: Format Detection
        parser, detected_fmt, confidence = self.detector.detect_format(clean_line)
        format_type = forced_format or detected_fmt
        active_parser_name = parser_name or (parser.name if parser else f"auto_{format_type}")

        # Step 3: Parsing
        parsed_dict: Dict[str, Any] = {}
        if parser:
            try:
                parsed_dict = parser.parse(clean_line)
            except Exception as e:
                parsed_dict = {"_parse_error": str(e), "raw": clean_line}
        else:
            parsed_dict = {"raw": clean_line}

        # Step 4: Normalization to OCSF Unified Event
        event = Normalizer.normalize_event(
            raw_log=clean_line,
            parsed_dict=parsed_dict,
            format_type=format_type,
            parser_name=active_parser_name,
            parser_version=parser_version,
            custom_mappings=custom_mappings
        )

        # Step 5: Schema Validation
        EventValidator.validate(event)

        return event

    def process_batch(self, raw_lines: List[str]) -> List[UnifiedEvent]:
        events = []
        for line in raw_lines:
            if line.strip():
                try:
                    events.append(self.process_raw_line(line))
                except Exception as e:
                    pass
        return events
