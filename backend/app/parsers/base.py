from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, Tuple
import hashlib
from datetime import datetime, timezone

class BaseParser(ABC):
    name: str = "base"
    format_type: str = "generic"

    @abstractmethod
    def can_parse(self, raw_log: str) -> Tuple[bool, float]:
        """
        Returns (can_parse, confidence_score: 0.0 to 1.0)
        """
        pass

    @abstractmethod
    def parse(self, raw_log: str) -> Dict[str, Any]:
        """
        Extracts key-value fields from raw log
        """
        pass

    def compute_hash(self, raw_log: str) -> str:
        return hashlib.sha256(raw_log.strip().encode('utf-8')).hexdigest()
