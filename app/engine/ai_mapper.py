from typing import List, Dict, Any
from backend.app.schema.parser_models import FieldMapping, AIMappingSuggestion

# Heuristic Mapping Dictionary to OCSF Schema
FIELD_MAPPINGS_TAXONOMY = {
    # Source IP & Port
    "src": ("source.ip", "ip", 0.98),
    "src_ip": ("source.ip", "ip", 0.99),
    "source_ip": ("source.ip", "ip", 0.99),
    "sourceip": ("source.ip", "ip", 0.99),
    "sourceipaddress": ("source.ip", "ip", 0.99),
    "ipaddress": ("source.ip", "ip", 0.98),
    "ip": ("source.ip", "ip", 0.90),
    "srcip": ("source.ip", "ip", 0.99),
    "c_ip": ("source.ip", "ip", 0.95),
    "c-ip": ("source.ip", "ip", 0.95),
    "client_ip": ("source.ip", "ip", 0.97),
    "sourceaddress": ("source.ip", "ip", 0.98),
    "src_port": ("source.port", "integer", 0.98),
    "srcport": ("source.port", "integer", 0.98),
    "sport": ("source.port", "integer", 0.98),
    "source_port": ("source.port", "integer", 0.98),
    "sourceport": ("source.port", "integer", 0.98),
    "c_port": ("source.port", "integer", 0.95),
    "c-port": ("source.port", "integer", 0.95),

    # Destination IP & Port
    "dst": ("destination.ip", "ip", 0.98),
    "dst_ip": ("destination.ip", "ip", 0.99),
    "dest_ip": ("destination.ip", "ip", 0.99),
    "destination_ip": ("destination.ip", "ip", 0.99),
    "destinationip": ("destination.ip", "ip", 0.99),
    "destinationipaddress": ("destination.ip", "ip", 0.99),
    "dstip": ("destination.ip", "ip", 0.99),
    "destinationaddress": ("destination.ip", "ip", 0.98),
    "server_ip": ("destination.ip", "ip", 0.95),
    "dst_port": ("destination.port", "integer", 0.98),
    "dstport": ("destination.port", "integer", 0.98),
    "dport": ("destination.port", "integer", 0.98),
    "dest_port": ("destination.port", "integer", 0.98),
    "destination_port": ("destination.port", "integer", 0.98),
    "destinationport": ("destination.port", "integer", 0.98),
    "s-port": ("destination.port", "integer", 0.95),

    # User
    "user": ("user.name", "string", 0.95),
    "username": ("user.name", "string", 0.99),
    "user_name": ("user.name", "string", 0.99),
    "useridentity.username": ("user.name", "string", 0.99),
    "targetusername": ("user.name", "string", 0.99),
    "uname": ("user.name", "string", 0.95),
    "usr": ("user.name", "string", 0.90),
    "account": ("user.name", "string", 0.92),
    "user_id": ("user.id", "string", 0.95),
    "uid": ("user.id", "string", 0.95),
    "email": ("user.email", "string", 0.97),

    # Action / Outcome
    "action": ("event.action", "enum", 0.99),
    "eventname": ("event.action", "enum", 0.95),
    "act": ("event.action", "enum", 0.95),
    "status": ("event.action", "enum", 0.90),
    "outcome": ("event.outcome", "enum", 0.92),
    "result": ("event.outcome", "enum", 0.92),
    "decision": ("event.action", "enum", 0.95),

    # Protocol & Network
    "proto": ("network.protocol", "string", 0.98),
    "protocol": ("network.protocol", "string", 0.99),
    "transport": ("network.protocol", "string", 0.95),
    "bytes_in": ("network.bytes_in", "integer", 0.95),
    "bytes_out": ("network.bytes_out", "integer", 0.95),
    "in_bytes": ("network.bytes_in", "integer", 0.95),
    "out_bytes": ("network.bytes_out", "integer", 0.95),
    "direction": ("network.direction", "string", 0.95),

    # Timestamp
    "time": ("timestamp", "datetime", 0.95),
    "timestamp": ("timestamp", "datetime", 0.99),
    "@timestamp": ("timestamp", "datetime", 0.99),
    "date": ("timestamp", "datetime", 0.90),
    "datetime": ("timestamp", "datetime", 0.95),

    # Hostname / Observer
    "host": ("source.hostname", "string", 0.90),
    "hostname": ("source.hostname", "string", 0.95),
    "device_vendor": ("observer.vendor", "string", 0.98),
    "vendor": ("observer.vendor", "string", 0.95),
    "device_product": ("observer.product", "string", 0.98),
    "product": ("observer.product", "string", 0.95),

    # HTTP
    "method": ("http.method", "string", 0.98),
    "url": ("http.url", "string", 0.98),
    "uri": ("http.url", "string", 0.98),
    "http_status": ("http.status_code", "integer", 0.98),
    "status_code": ("http.status_code", "integer", 0.98),
    "user_agent": ("http.user_agent", "string", 0.98),
    "useragent": ("http.user_agent", "string", 0.98),

    # Severity
    "severity": ("event.severity", "enum", 0.98),
    "sev": ("event.severity", "enum", 0.98),
    "priority": ("event.severity", "enum", 0.95),
    "level": ("event.severity", "enum", 0.95),
}

class AIMappingGenerator:
    """
    AI / NLP-assisted rule mapping engine for automatic schema conversion.
    Designed for 100% offline air-gapped readiness with intelligent heuristic matching.
    """
    @staticmethod
    def generate_suggestions(detected_format: str, detected_fields: List[str], sample_data: Dict[str, Any] = None) -> AIMappingSuggestion:
        suggested: List[FieldMapping] = []
        
        for field in detected_fields:
            clean_field = field.lower().replace("-", "_").replace(".", "_")
            if clean_field in FIELD_MAPPINGS_TAXONOMY:
                target, dtype, conf = FIELD_MAPPINGS_TAXONOMY[clean_field]
                suggested.append(FieldMapping(
                    source_field=field,
                    target_field=target,
                    data_type=dtype,
                    confidence=conf
                ))
            else:
                # Substring matching for fuzzy discovery
                matched = False
                for pattern, (target, dtype, conf) in FIELD_MAPPINGS_TAXONOMY.items():
                    if pattern in clean_field or clean_field in pattern:
                        suggested.append(FieldMapping(
                            source_field=field,
                            target_field=target,
                            data_type=dtype,
                            confidence=round(conf * 0.85, 2)
                        ))
                        matched = True
                        break
                if not matched:
                    # Unmapped metadata field
                    suggested.append(FieldMapping(
                        source_field=field,
                        target_field=f"unmapped.{field}",
                        data_type="string",
                        confidence=0.70
                    ))

        return AIMappingSuggestion(
            detected_format=detected_format,
            confidence=0.96 if suggested else 0.5,
            detected_fields=detected_fields,
            suggested_mappings=suggested,
            sample_parsed_event=sample_data,
            explanation=f"AI engine analyzed {len(detected_fields)} fields and mapped {len([m for m in suggested if not m.target_field.startswith('unmapped')])} directly to OCSF Unified Event Schema with high confidence."
        )
