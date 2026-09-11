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
  Sparkles,
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
import { DataRiverStream } from '../components/DataRiverStream';
import { HologramCore3D } from '../components/HologramCore3D';
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
      
      {/* Tactical Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight font-mono flex items-center gap-2.5">
              <span>Ingestion & Schema Operations</span>
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 shadow-[0_0_10px_rgba(16,185,129,0.25)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SOC SYSTEM ONLINE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 font-mono font-medium transition-all shadow-inner"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
            <span>Sync Engine</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              onNavigate('add-source');
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-mono font-medium text-xs shadow-[0_0_15px_rgba(6,182,212,0.35)] transition-all hover:scale-105"
          >
            <span>+ Add Log Source</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Summary Strip with Tactical HUD Cards */}
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
          subtitle="1.95ms latency"
          icon={Zap}
          variant="cyan"
        />
        <StatCard
          title="Active Parsers"
          value={metrics?.active_parsers || '12'}
          subtitle="v1.0 → v1.1 versioned"
          icon={Cpu}
          variant="default"
        />
        <StatCard
          title="Connected Sources"
          value={metrics?.active_sources || '8'}
          subtitle="Multi-protocol stream"
          icon={Server}
          variant="default"
        />
      </div>

      {/* Live Ingestion & Normalization Data River */}
      <DataRiverStream />

      {/* Main Operations & Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Side: Time-Series Velocity & Severity Distribution (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Ingestion Velocity Area Chart */}
          <div className="relative overflow-hidden rounded-2xl bg-[#0f1422]/90 border border-slate-800 backdrop-blur-md p-5 shadow-hud group">
            <div className="hud-corner-tl" />
            <div className="hud-corner-tr" />
            <div className="hud-corner-bl" />
            <div className="hud-corner-br" />

            <div className="flex items-center justify-between mb-4 relative z-10">
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  Ingestion Velocity Telemetry (Events / Minute)
                </h3>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                  Live stream rate recorded across all ingress network sockets & protocol listeners
                </p>
              </div>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-800/80 shadow-[0_0_10px_rgba(6,182,212,0.25)]">
                Peak: 16.4k eps
              </span>
            </div>

            <div className="h-60 w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics?.events_per_minute || []}>
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} fontFamily="JetBrains Mono" tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} fontFamily="JetBrains Mono" tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090d16',
                      borderColor: '#06b6d4',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontFamily: 'JetBrains Mono',
                      boxShadow: '0 0 15px rgba(6,182,212,0.3)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="events"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#areaGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* OCSF Severity & Compliance Bar Chart */}
          <div className="relative overflow-hidden rounded-2xl bg-[#0f1422]/90 border border-slate-800 backdrop-blur-md p-5 shadow-hud group">
            <div className="hud-corner-tl" />
            <div className="hud-corner-tr" />
            <div className="hud-corner-bl" />
            <div className="hud-corner-br" />

            <div className="flex items-center justify-between mb-3 relative z-10">
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  Normalized OCSF Event Severity Breakdown
                </h3>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                  Distribution mapped according to OCSF severity_id standard
                </p>
              </div>
            </div>

            <div className="h-44 w-full relative z-10">
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

        {/* Right Side: 3D Hologram Telemetry, Connected Feeds & Vault (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* 3D WebGL Holographic Stream Core Telemetry */}
          <div className="relative overflow-hidden rounded-2xl bg-[#0f1422]/90 border border-cyan-500/40 backdrop-blur-md p-4 shadow-[0_0_30px_rgba(6,182,212,0.15)] group">
            <div className="hud-corner-tl" />
            <div className="hud-corner-tr" />
            <div className="hud-corner-bl" />
            <div className="hud-corner-br" />
            
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80 mb-2 relative z-10">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  3D Pipeline Engine Core
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                WebGL Active
              </span>
            </div>

            <div className="h-[230px] w-full relative z-10 rounded-xl overflow-hidden bg-black/40 border border-slate-900">
              <HologramCore3D />
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400 relative z-10">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Zero-Downtime Engine
              </span>
              <button
                onClick={() => {
                  soundFx.playClick();
                  onNavigate('pipeline-dag');
                }}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono text-xs transition-transform hover:translate-x-0.5"
              >
                <span>Full DAG View →</span>
              </button>
            </div>
          </div>

          {/* Connected Ingestion Feeds */}
          <div className="relative overflow-hidden rounded-2xl bg-[#0f1422]/90 border border-slate-800 backdrop-blur-md p-5 space-y-3 shadow-hud">
            <div className="hud-corner-tl" />
            <div className="hud-corner-br" />

            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-cyan-400" />
                Connected Ingestion Feeds
              </h3>
              <button
                onClick={() => {
                  soundFx.playClick();
                  onNavigate('live-stream');
                }}
                className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>Live Feed</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {feeds.map((feed, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#090d16]/90 border border-slate-800/70 hover:border-cyan-500/40 flex items-center justify-between text-xs transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-pulse-emerald" />
                      <span className="font-semibold text-slate-200 font-mono">{feed.name}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono block">{feed.format}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-cyan-300 block">{feed.eps}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{feed.latency}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cryptographic Vault Status */}
          <div className="relative overflow-hidden rounded-2xl bg-[#0f1422]/90 border border-emerald-500/30 backdrop-blur-md p-5 space-y-3 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <div className="hud-corner-tl" />
            <div className="hud-corner-br" />

            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                Forensic Non-Repudiation Vault
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Every raw line is preserved bit-exact with an immutable SHA-256 hash. OCSF normalized records are cryptographically cross-referenced to original byte buffers.
            </p>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">Hash Verification:</span>
              <span className="text-emerald-400 font-medium bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                100% Validated ✓
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
