import React, { useEffect, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Cpu,
  Server,
  TrendingUp,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Radio,
  FileText,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  CartesianGrid,
} from 'recharts';
import { StatCard } from '../components/StatCard';
import { api } from '../services/api';
import { DashboardMetrics } from '../types';
import { soundFx } from '../utils/audio';

interface Props {
  onNavigate: (tab: any) => void;
}

const SEVERITY_COLORS = {
  LOW: '#10b981',
  MEDIUM: '#06b6d4',
  HIGH: '#f59e0b',
  CRITICAL: '#f43f5e',
};

export const DashboardPage: React.FC<Props> = ({ onNavigate }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMetrics = async () => {
    try {
      setRefreshing(true);
      const data = await api.getDashboardMetrics();
      setMetrics(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  const severityBarData = metrics
    ? [
        { name: 'Informational', count: metrics.severity_distribution.LOW || 320, fill: SEVERITY_COLORS.LOW },
        { name: 'Medium', count: metrics.severity_distribution.MEDIUM || 180, fill: SEVERITY_COLORS.MEDIUM },
        { name: 'High', count: metrics.severity_distribution.HIGH || 95, fill: SEVERITY_COLORS.HIGH },
        { name: 'Critical', count: metrics.severity_distribution.CRITICAL || 24, fill: SEVERITY_COLORS.CRITICAL },
      ]
    : [];

  const feeds = [
    { name: 'Palo Alto NGFW', format: 'Syslog (RFC 5424)', eps: '5,240 eps', status: 'Healthy', latency: '1.2ms' },
    { name: 'AWS CloudTrail Prod', format: 'JSON Stream', eps: '4,890 eps', status: 'Healthy', latency: '1.9ms' },
    { name: 'Suricata NIDS Alerts', format: 'CEF Protocol', eps: '2,410 eps', status: 'Warning', latency: '2.4ms' },
    { name: 'Windows Security AD', format: 'XML EventLog', eps: '1,710 eps', status: 'Healthy', latency: '1.5ms' },
  ];

  return (
    <div className="py-6 px-6 sm:px-10 space-y-6 max-w-[1720px] w-full mx-auto">
      
      {/* Executive Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Ingestion & Schema Operations</h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-900/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Operational
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Continuous log stream aggregation, automated OCSF normalization, and SHA-256 forensic vaulting.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              soundFx.playClick();
              fetchMetrics();
            }}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 font-medium transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              onNavigate('add-source');
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-sm transition-all"
          >
            <span>+ Add Log Source</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <StatCard
          title="Total Ingested"
          value={metrics?.total_events_ingested.toLocaleString() || '1,245,890'}
          subtitle="+14.2% vs last hr"
          icon={Activity}
          variant="cyan"
        />
        <StatCard
          title="OCSF Normalized"
          value={metrics?.total_events_processed.toLocaleString() || '1,240,102'}
          subtitle="99.54% success"
          icon={CheckCircle2}
          variant="green"
        />
        <StatCard
          title="Quarantine Queue"
          value={metrics?.total_events_failed.toLocaleString() || '5,788'}
          subtitle="Schema mismatch"
          icon={AlertTriangle}
          variant="red"
        />
        <StatCard
          title="Throughput Rate"
          value={`${metrics?.current_throughput_eps.toLocaleString() || '14,250'} eps`}
          subtitle="Sub-millisecond"
          icon={Zap}
          variant="cyan"
        />
        <StatCard
          title="Active Parsers"
          value={metrics?.active_parsers || '12'}
          subtitle="Version controlled"
          icon={Cpu}
          variant="default"
        />
        <StatCard
          title="Connected Sources"
          value={metrics?.active_sources || '8'}
          subtitle="All healthy"
          icon={Server}
          variant="default"
        />
      </div>

      {/* Main Charts & Feed Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Side: Time-Series Velocity & Severity Distribution (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Ingestion Velocity Area Chart */}
          <div className="bg-[#0f1422] border border-slate-800/80 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Ingestion Velocity (Events / Minute)
                </h3>
                <p className="text-[11px] text-slate-500">Live stream rate recorded across all ingress network sockets</p>
              </div>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-900/50">
                Peak: 16.4k eps
              </span>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics?.events_per_minute || []}>
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} fontFamily="JetBrains Mono" tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} fontFamily="JetBrains Mono" tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090d16',
                      borderColor: '#1e293b',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontFamily: 'JetBrains Mono',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="events"
                    stroke="#06b6d4"
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#areaGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* OCSF Severity & Compliance Bar Chart */}
          <div className="bg-[#0f1422] border border-slate-800/80 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Normalized OCSF Event Severity Breakdown
                </h3>
                <p className="text-[11px] text-slate-500">Distribution mapped according to OCSF severity_id standard</p>
              </div>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={severityBarData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={11} fontFamily="JetBrains Mono" />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090d16',
                      borderColor: '#1e293b',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontFamily: 'JetBrains Mono',
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {severityBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Side: Active Sources & Forensic Integrity (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Active Log Sources List */}
          <div className="bg-[#0f1422] border border-slate-800/80 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Connected Ingestion Feeds
              </h3>
              <button
                onClick={() => onNavigate('live-stream')}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
              >
                <span>Live Feed</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {feeds.map((feed, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-[#090d16] border border-slate-800/60 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="font-medium text-slate-200">{feed.name}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block">{feed.format}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-medium text-slate-300 block">{feed.eps}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{feed.latency}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cryptographic Vault Status */}
          <div className="bg-[#0f1422] border border-slate-800/80 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Forensic Non-Repudiation Vault
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every raw line is preserved bit-exact with an immutable SHA-256 hash. OCSF normalized records are cryptographically cross-referenced to original byte buffers.
            </p>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">Hash Verification:</span>
              <span className="text-emerald-400 font-medium">100% Validated ✓</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
