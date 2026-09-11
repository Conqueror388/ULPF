export interface DashboardMetrics {
  status: string;
  system_health: string;
  total_events_ingested: number;
  total_events_processed: number;
  total_events_failed: number;
  current_throughput_eps: number;
  active_parsers: number;
  active_sources: number;
  severity_distribution: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
  sources: Array<{
    id: number;
    name: string;
    input_type: string;
    events_per_sec: number;
    total_events: number;
    percentage: number;
    status: string;
  }>;
  events_per_minute: Array<{
    time: string;
    events: number;
    spike?: boolean;
  }>;
  recent_errors: Array<{
    timestamp: string;
    source: string;
    raw_snippet: string;
    reason: string;
  }>;
}

export interface FieldMapping {
  source_field: string;
  target_field: string;
  data_type: string;
  confidence: number;
  transform?: string;
}

export interface ParserConfig {
  id?: number;
  name: string;
  description?: string;
  source_type: string;
  version: string;
  is_active: boolean;
  pattern?: string;
  mappings: FieldMapping[];
  custom_rules?: Record<string, any>;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ParserVersion {
  id: number;
  parser_id: number;
  version: string;
  config_json: any;
  changelog: string;
  created_by: string;
  created_at: string;
}

export interface AuditLog {
  id: number;
  action: string;
  parser_name: string;
  version: string;
  performed_by: string;
  details: string;
  timestamp: string;
}

export interface LogItem {
  id: number;
  event_id: string;
  timestamp: string;
  source_name: string;
  category: string;
  event_type: string;
  action: string;
  severity: string;
  source_ip: string;
  source_port?: number;
  dest_ip: string;
  dest_port?: number;
  user_name: string;
  protocol: string;
  raw_hash: string;
  raw_message: string;
  parser_name: string;
  parser_version: string;
  full_event_json: any;
}

export interface CompareResult {
  event_id: string;
  timestamp: string;
  raw: {
    message: string;
    sha256: string;
    is_verified: boolean;
    byte_size: number;
  };
  normalized: any;
  parser: {
    name: string;
    version: string;
  };
}

export interface SourceUploadAnalysis {
  source_name: string;
  input_type: string;
  detected_format: string;
  confidence: number;
  total_sample_lines: number;
  detected_fields: string[];
  suggested_mappings: FieldMapping[];
  sample_raw_line: string;
  sample_normalized_preview: any;
  ready_to_deploy: boolean;
}
