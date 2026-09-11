import re
from typing import List, Tuple
from backend.app.schema.unified_event import UnifiedEvent

IPV4_REGEX = re.compile(r"^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$")

class EventValidator:
    @staticmethod
    def validate(event: UnifiedEvent) -> Tuple[bool, List[str]]:
        """
        Validates event against schema constraints, data types, and required fields.
        """
        errors: List[str] = []

        # Validate IP addresses if present
        if event.source.ip and not IPV4_REGEX.match(event.source.ip):
            if ":" not in event.source.ip:  # Not IPv6 either
                errors.append(f"Invalid source IP format: {event.source.ip}")

        if event.destination.ip and not IPV4_REGEX.match(event.destination.ip):
            if ":" not in event.destination.ip:
                errors.append(f"Invalid destination IP format: {event.destination.ip}")

        # Validate Port ranges
        if event.source.port is not None and not (0 <= event.source.port <= 65535):
            errors.append(f"Source port out of range [0-65535]: {event.source.port}")

        if event.destination.port is not None and not (0 <= event.destination.port <= 65535):
            errors.append(f"Destination port out of range [0-65535]: {event.destination.port}")

        # Validate Hash Presence
        if not event.raw.sha256 or len(event.raw.sha256) != 64:
            errors.append("Invalid or missing raw SHA-256 integrity hash")

        is_valid = len(errors) == 0
        event.is_valid = is_valid
        event.validation_errors = errors
        return is_valid, errors
