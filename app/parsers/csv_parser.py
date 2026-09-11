import csv
import io
from typing import Dict, Any, Tuple, List, Optional
from backend.app.parsers.base import BaseParser

class CsvParser(BaseParser):
    name = "csv_parser"
    format_type = "csv"

    def __init__(self, headers: Optional[List[str]] = None, delimiter: str = ","):
        self.headers = headers
        self.delimiter = delimiter

    def can_parse(self, raw_log: str) -> Tuple[bool, float]:
        raw_log = raw_log.strip()
        # If it looks like CSV or TSV with at least 3 columns
        if "," in raw_log:
            reader = csv.reader(io.StringIO(raw_log), delimiter=",")
            try:
                row = next(reader)
                if len(row) >= 3 and not (raw_log.startswith("{") or raw_log.startswith("<")):
                    return True, 0.92
            except Exception:
                pass
        return False, 0.0

    def parse(self, raw_log: str) -> Dict[str, Any]:
        raw_log = raw_log.strip()
        reader = csv.reader(io.StringIO(raw_log), delimiter=self.delimiter)
        try:
            row = next(reader)
            if self.headers and len(self.headers) == len(row):
                return {h: v for h, v in zip(self.headers, row)}
            else:
                return {f"column_{i+1}": val for i, val in enumerate(row)}
        except Exception:
            return {"raw_csv": raw_log}
