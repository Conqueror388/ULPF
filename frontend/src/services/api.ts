import {
  DashboardMetrics,
  ParserConfig,
  ParserVersion,
  AuditLog,
  LogItem,
  CompareResult,
  SourceUploadAnalysis,
} from '../types';

const getApiBase = (): string => {
  if (import.meta.env.VITE_API_URL) {
    const raw = (import.meta.env.VITE_API_URL as string).trim().replace(/\/$/, '');
    return raw.endsWith('/api') ? raw : `${raw}/api`;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:8000/api';
    }
    return '/api';
  }
  return 'http://localhost:8000/api';
};

export const API_BASE = getApiBase();

export const api = {
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const res = await fetch(`${API_BASE}/dashboard/metrics`);
    if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
    return res.json();
  },

  async getSources(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/sources/`);
    if (!res.ok) throw new Error('Failed to fetch sources');
    return res.json();
  },

  async createSource(data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/sources/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to create source');
    }
    return res.json();
  },

  async analyzeUpload(data: {
    source_name: string;
    input_type: string;
    sample_content: string;
    filename?: string;
  }): Promise<SourceUploadAnalysis> {
    const res = await fetch(`${API_BASE}/sources/analyze-upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to analyze upload');
    }
    return res.json();
  },

  async getParsers(): Promise<ParserConfig[]> {
    const res = await fetch(`${API_BASE}/parsers/`);
    if (!res.ok) throw new Error('Failed to fetch parsers');
    return res.json();
  },

  async createOrUpdateParser(config: ParserConfig): Promise<ParserConfig> {
    const res = await fetch(`${API_BASE}/parsers/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to save parser');
    }
    return res.json();
  },

  async testParser(data: {
    sample_log: string;
    format?: string;
    mappings?: any[];
    pattern?: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/parsers/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to test parser');
    }
    return res.json();
  },

  async getParserVersions(parserName: string): Promise<ParserVersion[]> {
    const res = await fetch(`${API_BASE}/parsers/versions/${encodeURIComponent(parserName)}`);
    if (!res.ok) throw new Error('Failed to fetch parser versions');
    return res.json();
  },

  async rollbackParser(parserId: number, versionId: number): Promise<any> {
    const res = await fetch(`${API_BASE}/parsers/rollback/${parserId}/${versionId}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to rollback parser');
    return res.json();
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch(`${API_BASE}/parsers/audit-logs`);
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  async searchLogs(params: {
    query?: string;
    severity?: string;
    category?: string;
    source_name?: string;
    action?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ total: number; items: LogItem[] }> {
    const queryParams = new URLSearchParams();
    if (params.query) queryParams.set('query', params.query);
    if (params.severity) queryParams.set('severity', params.severity);
    if (params.category) queryParams.set('category', params.category);
    if (params.source_name) queryParams.set('source_name', params.source_name);
    if (params.action) queryParams.set('action', params.action);
    if (params.limit) queryParams.set('limit', String(params.limit));
    if (params.offset) queryParams.set('offset', String(params.offset));

    const res = await fetch(`${API_BASE}/logs/search?${queryParams.toString()}`);
    if (!res.ok) throw new Error('Failed to search logs');
    return res.json();
  },

  async getRawVsNormalized(eventId: string): Promise<CompareResult> {
    const res = await fetch(`${API_BASE}/logs/compare/${encodeURIComponent(eventId)}`);
    if (!res.ok) throw new Error('Failed to compare event');
    return res.json();
  },

  async ingestLog(rawLog: string, sourceName?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/logs/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw_log: rawLog, source_name: sourceName || 'Direct Ingestion' }),
    });
    if (!res.ok) throw new Error('Failed to ingest log');
    return res.json();
  },
};
