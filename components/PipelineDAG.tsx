import React, { useState } from 'react';
import {
  Activity,
  Cpu,
  ShieldCheck,
  Search,
  Database,
  ArrowRight,
  Zap,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';

interface StageInfo {
  id: string;
  name: string;
  sub: string;
  metric: string;
  latency: string;
  status: 'ACTIVE' | 'OPTIMAL' | 'IDLE';
  details: string;
  icon: any;
  color: string;
}

export const PipelineDAG: React.FC = () => {
  const [selectedStage, setSelectedStage] = useState<string>('normalizer');

  const stages: StageInfo[] = [
    {
      id: 'ingest',
      name: '1. Multi-Feed Ingest',
      sub: 'Syslog / JSON / CEF / XML / CSV',
      metric: '14,250 eps',
      latency: '0.12 ms',
      status: 'ACTIVE',
      details: 'Asynchronous event collector supporting UDP/TCP Syslog, REST Webhooks, Kafka topics, and direct file uploads with zero-copy buffer.',
      icon: Activity,
      color: 'text-cyan-400 border-cyan-500/60 bg-cyan-950/40',
    },
    {
      id: 'detector',
      name: '2. Format Detector',
      sub: 'Multi-Parser Confidence Eval',
      metric: '98.4% conf',
      latency: '0.24 ms',
      status: 'OPTIMAL',
      details: 'Automatic format classifier checking RFC 3164/5424, ArcSight CEF, LEEF, JSON trees, and Windows XML without manual configuration.',
      icon: Sparkles,
      color: 'text-purple-400 border-purple-500/60 bg-purple-950/40',
    },
    {
      id: 'normalizer',
      name: '3. OCSF Normalizer',
      sub: 'Unified Schema Transformation',
      metric: '100% compliant',
      latency: '0.41 ms',
      status: 'ACTIVE',
      details: 'Converts disparate vendor schemas into standardized OCSF Unified Events. Maps IP endpoints, ports, user identity, action, and severity taxonomy.',
      icon: Layers,
      color: 'text-emerald-400 border-emerald-500/60 bg-emerald-950/40',
    },
    {
      id: 'vault',
      name: '4. Integrity Vault',
      sub: 'Bit-Exact SHA-256 Hashing',
      metric: 'Zero data loss',
      latency: '0.08 ms',
      status: 'OPTIMAL',
      details: 'Calculates cryptographic SHA-256 hash for every raw input log line. Preserves bit-exact raw payload for forensic audit readiness.',
      icon: ShieldCheck,
      color: 'text-amber-400 border-amber-500/60 bg-amber-950/40',
    },
    {
      id: 'index',
      name: '5. Search Index',
      sub: 'Fast Field Queries & Aggs',
      metric: '1.24M records',
      latency: '1.10 ms',
      status: 'OPTIMAL',
      details: 'Unified high-speed structured index enabling sub-second filtering across millions of logs by source.ip, destination.port, and severity.',
      icon: Search,
      color: 'text-blue-400 border-blue-500/60 bg-blue-950/40',
    },
  ];

  const activeStageInfo = stages.find((s) => s.id === selectedStage) || stages[2];

  return (
    <div className="bg-[#171f33] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
            Live Stream Processing Architecture (Interactive DAG)
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400">
          End-to-End Latency: <strong className="text-emerald-400 font-bold">1.95 ms</strong> (Sub-millisecond per stage)
        </span>
      </div>

      {/* DAG Flow Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {stages.map((stg, idx) => {
          const Icon = stg.icon;
          const isSelected = selectedStage === stg.id;

          return (
            <div key={stg.id} className="relative flex flex-col">
              <button
                type="button"
                onClick={() => setSelectedStage(stg.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between min-h-[130px] ${
                  isSelected
                    ? `${stg.color} shadow-[0_0_15px_rgba(6,182,212,0.25)] scale-[1.02]`
                    : 'bg-[#131b2e] border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg bg-black/40 border border-slate-800`}>
                    <Icon className="w-4 h-4 text-cyan-300" />
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/50 border border-slate-800 text-slate-400">
                    {stg.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold font-mono text-white leading-tight">{stg.name}</h4>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">{stg.sub}</p>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-cyan-400 font-semibold">{stg.metric}</span>
                  <span className="text-slate-500">{stg.latency}</span>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Stage Detail Callout Panel */}
      <div className="p-4 rounded-xl bg-[#0f172a] border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 mt-0.5">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">{activeStageInfo.name}</span>
              <span className="px-2 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px]">
                {activeStageInfo.sub}
              </span>
            </div>
            <p className="text-slate-300 text-xs mt-1 leading-relaxed max-w-3xl">
              {activeStageInfo.details}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0 bg-[#131b2e] px-4 py-2 rounded-lg border border-slate-800 self-stretch md:self-auto justify-between md:justify-start">
          <div>
            <span className="text-[10px] text-slate-400 block">Performance</span>
            <span className="text-emerald-400 font-bold">{activeStageInfo.metric}</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-[10px] text-slate-400 block">Stage Latency</span>
            <span className="text-cyan-300 font-bold">{activeStageInfo.latency}</span>
          </div>
        </div>
      </div>

    </div>
  );
};
