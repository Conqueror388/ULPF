from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from backend.app.schema.unified_event import (
    UnifiedEvent, EventMetadata, Endpoint, UserInfo, NetworkInfo,
    HttpInfo, ObserverInfo, RawLogPayload, ParserMetadata
)
from backend.app.schema.parser_models import FieldMapping
from backend.app.engine.integrity import IntegrityEngine

class Normalizer:
    @staticmethod
    def normalize_event(
        raw_log: str,
        parsed_dict: Dict[str, Any],
        format_type: str,
        parser_name: str,
        parser_version: str = "1.0",
        custom_mappings: Optional[List[FieldMapping]] = None
    ) -> UnifiedEvent:
        """
        Normalizes a parsed key-value payload into a standard OCSF UnifiedEvent.
        """
        raw_hash = IntegrityEngine.generate_sha256(raw_log)
        now_iso = datetime.now(timezone.utc).isoformat()

        raw_payload = RawLogPayload(
            message=raw_log.strip(),
            format=format_type,
            sha256=raw_hash,
            byte_size=len(raw_log.encode('utf-8')),
            received_at=now_iso
        )

        parser_meta = ParserMetadata(
            name=parser_name,
            version=parser_version,
            confidence=1.0
        )

        event_meta = EventMetadata()
        source_ep = Endpoint()
        dest_ep = Endpoint()
        user_info = UserInfo()
        network_info = NetworkInfo()
        http_info = None
        observer_info = ObserverInfo()
        unmapped: Dict[str, Any] = {}
        timestamp_val = now_iso

        # Build dynamic mapping table
        mapping_dict = {}
        if custom_mappings:
            for m in custom_mappings:
                mapping_dict[m.source_field.lower()] = (m.target_field, m.data_type)

        # Helper to set value in nested schema
        def _set_target_val(target_path: str, val: Any):
            nonlocal timestamp_val, http_info
            if val is None or val == "":
                return
            
            str_val = str(val).strip()

            if target_path == "timestamp":
                timestamp_val = str_val
            elif target_path == "event.category":
                event_meta.category = str_val.lower()
            elif target_path == "event.type":
                event_meta.type = str_val.lower()
            elif target_path == "event.action":
                event_meta.action = str_val.upper()
                if event_meta.action in ["DENY", "DROP", "BLOCK", "FAILED", "FAILURE"]:
                    event_meta.outcome = "failure"
                    if event_meta.severity == "LOW":
                        event_meta.severity = "HIGH"
                elif event_meta.action in ["ALLOW", "ACCEPT", "SUCCESS", "LOGIN"]:
                    event_meta.outcome = "success"
            elif target_path == "event.severity":
                s = str_val.upper()
                if s in ["0", "EMERGENCY", "ALERT", "CRIT", "CRITICAL", "10"]:
                    event_meta.severity = "CRITICAL"
                elif s in ["1", "2", "3", "ERR", "ERROR", "HIGH", "7", "8", "9"]:
                    event_meta.severity = "HIGH"
                elif s in ["4", "WARNING", "WARN", "MEDIUM", "MED", "4", "5", "6"]:
                    event_meta.severity = "MEDIUM"
                else:
                    event_meta.severity = "LOW"
            elif target_path == "source.ip":
                source_ep.ip = str_val
            elif target_path == "source.port":
                try:
                    source_ep.port = int(str_val)
                except Exception:
                    pass
            elif target_path == "source.hostname":
                source_ep.hostname = str_val
            elif target_path == "destination.ip":
                dest_ep.ip = str_val
            elif target_path == "destination.port":
                try:
                    dest_ep.port = int(str_val)
                except Exception:
                    pass
            elif target_path == "destination.hostname":
                dest_ep.hostname = str_val
            elif target_path == "user.name":
                user_info.name = str_val
            elif target_path == "user.id":
                user_info.id = str_val
            elif target_path == "user.email":
                user_info.email = str_val
            elif target_path == "network.protocol":
                network_info.protocol = str_val.upper()
            elif target_path == "network.bytes_in":
                try:
                    network_info.bytes_in = int(str_val)
                except Exception:
                    pass
            elif target_path == "network.bytes_out":
                try:
                    network_info.bytes_out = int(str_val)
                except Exception:
                    pass
            elif target_path == "network.direction":
                network_info.direction = str_val
            elif target_path.startswith("http."):
                if not http_info:
                    http_info = HttpInfo()
                if target_path == "http.method":
                    http_info.method = str_val.upper()
                elif target_path == "http.url":
                    http_info.url = str_val
                elif target_path == "http.status_code":
                    try:
                        http_info.status_code = int(str_val)
                    except Exception:
                        pass
                elif target_path == "http.user_agent":
                    http_info.user_agent = str_val
            elif target_path == "observer.vendor":
                observer_info.vendor = str_val
            elif target_path == "observer.product":
                observer_info.product = str_val
            elif target_path.startswith("unmapped."):
                k = target_path.replace("unmapped.", "")
                unmapped[k] = val
            else:
                unmapped[target_path] = val

        # Process parsed fields (including flattened keys)
        items_to_process = list(parsed_dict.items())
        if "_flattened" in parsed_dict and isinstance(parsed_dict["_flattened"], dict):
            items_to_process.extend(parsed_dict["_flattened"].items())

        for raw_k, raw_v in items_to_process:
            if raw_k.startswith("_"):
                continue
            
            clean_k = raw_k.lower()
            if clean_k in mapping_dict:
                target_field, _ = mapping_dict[clean_k]
                _set_target_val(target_field, raw_v)
            else:
                # Built-in automatic standard matching
                from backend.app.engine.ai_mapper import FIELD_MAPPINGS_TAXONOMY
                if clean_k in FIELD_MAPPINGS_TAXONOMY:
                    target_field, _, _ = FIELD_MAPPINGS_TAXONOMY[clean_k]
                    _set_target_val(target_field, raw_v)
                else:
                    unmapped[raw_k] = raw_v

        # Set default categories based on available fields
        if event_meta.category == "generic":
            if http_info or (dest_ep.port in [80, 443, 8080, 8443]):
                event_meta.category = "web"
                event_meta.type = "http_request"
            elif user_info.name or "auth" in raw_log.lower() or "login" in raw_log.lower():
                event_meta.category = "authentication"
                event_meta.type = "user_login"
            elif source_ep.ip or dest_ep.ip:
                event_meta.category = "network"
                event_meta.type = "traffic_flow"

        return UnifiedEvent(
            timestamp=timestamp_val,
            event=event_meta,
            source=source_ep,
            destination=dest_ep,
            user=user_info,
            network=network_info,
            http=http_info,
            observer=observer_info,
            raw=raw_payload,
            parser=parser_meta,
            unmapped=unmapped,
            is_valid=True
        )
