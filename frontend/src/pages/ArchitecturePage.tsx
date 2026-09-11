import React from 'react';
import {
  Layers,
  Zap,
  ShieldCheck,
  Cpu,
  Database,
  ArrowRight,
  Sparkles,
  Server,
  Activity,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { PipelineDAG } from '../components/PipelineDAG';
import { QuantumChamber } from '../components/QuantumChamber';
import { HologramCore3D } from '../components/HologramCore3D';
import { soundFx } from '../utils/audio';

interface Props {
  onNavigate: (tab: any) => void;
}

export const ArchitecturePage: React.FC<Props> = ({ onNavigate }) => {
  const comparisons = [
    {
      feature: 'Format Detection',
      ulpf: 'Automated Multi-Parser & AI Heuristic (>95% Conf)',
      traditional: 'Manual Grok patterns & Regex configuration',
      advantage: 'Zero-configuration onboarding',
    },
    {
      feature: 'Schema Standard',
      ulpf: 'OCSF (Open Cybersecurity Schema Framework)',
      traditional: 'Proprietary custom index mappings',
      advantage: 'Universal SIEM & AI compatibility',
    },
    {
      feature: 'Raw Log Integrity',
      ulpf: 'Bit-Exact SHA-256 Cryptographic Vault',
      traditional: 'Raw message often discarded or mutated',
      advantage: '100% forensic compliance proof',
    },
    {
      feature: 'Average Stage Latency',
      ulpf: '1.95 ms (Sub-millisecond pipeline)',
      traditional: '24.5 ms - 65.0 ms pipeline lag',
      advantage: '12x lower latency',
    },
    {
      feature: 'Memory Footprint',
      ulpf: '~65 MB (Python/C optimized)',
      traditional: '~1.4 GB (JVM based)',
      advantage: '20x lower memory overhead',
    },
    {
      feature: 'Rule Governance & Rollback',
      ulpf: 'Immutable Version Snapshots (v1.0 -> v1.1) + 1-Click Rollback',
      traditional: 'Manual file editing & service restart',
      advantage: 'Zero-downtime rule governance',
    },
  ];

  return (
    <div className="py-8 px-6 sm:px-10 space-y-8 max-w-[1720px] w-full mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-800 text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest">
              System Internals & Stream DAG
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-mono font-semibold">
              ● High-Throughput Stream Pipeline
            </span>
          </div>
          <h1 className="text-3xl font-bold font-tech text-white tracking-wide mt-1.5 flex items-center gap-3">
            <span>Stream Processing Architecture & 3D Core</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Interactive node-based Directed Acyclic Graph (DAG) and 3D WebGL core demonstrating real-time stages from ingestion to OCSF normalization.
          </p>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            onNavigate('live-stream');
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black font-bold rounded-xl text-xs font-mono shadow-[0_0_15px_rgba(6,182,212,0.35)] transition-all hover:scale-105"
        >
          <span>View Live Ingest Stream</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Interactive Stream DAG */}
      <PipelineDAG />

      {/* 3D Holographic Core & Interactive Chamber Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 flex flex-col">
          <QuantumChamber onNavigate={onNavigate} />
        </div>
        <div className="lg:col-span-4 flex flex-col justify-between gap-6">
          <HologramCore3D />

          {/* Engine Architecture & Ingress Socket Telemetry */}
          <div className="bg-[#171f33] border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-3 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-tech font-bold uppercase tracking-wider text-slate-200">
                    Ingress Sockets & Buffer Telemetry
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  Ring Buffer: 0% Drop
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] font-mono">
                <div className="p-2.5 rounded-xl bg-[#0b1326] border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">UDP Syslog</span>
                  <span className="text-cyan-300 font-bold">Port 514 / RFC 5424</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0b1326] border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">TCP TLS Syslog</span>
                  <span className="text-cyan-300 font-bold">Port 6514 / Encrypted</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0b1326] border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">REST Event Stream</span>
                  <span className="text-emerald-400 font-bold">Port 8000 / FastAPI</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0b1326] border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Kafka Ingestion</span>
                  <span className="text-purple-400 font-bold">Port 9092 / Topics</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Memory Footprint:</span>
              <span className="text-cyan-300 font-bold">65 MB (Zero-Copy)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Architecture Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-[#171f33] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3 hover:border-cyan-500/50 transition-all hover:-translate-y-1 h-full flex flex-col justify-between">
          <div>
            <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-800 text-cyan-400 w-fit mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold font-tech text-white uppercase tracking-wider">
              1. Zero-Copy Ingestion
            </h3>
            <p className="text-xs font-sans text-slate-400 leading-relaxed mt-2">
              Asynchronous multi-threaded listener handles high-volume UDP/TCP Syslog, REST payloads, and file uploads directly into an in-memory event buffer.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-800/80 text-[11px] font-mono text-cyan-400">
            Sub-millisecond latency (1.95ms)
          </div>
        </div>

        <div className="bg-[#171f33] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3 hover:border-emerald-500/50 transition-all hover:-translate-y-1 h-full flex flex-col justify-between">
          <div>
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-400 w-fit mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold font-tech text-white uppercase tracking-wider">
              2. Heuristic AI Mapping
            </h3>
            <p className="text-xs font-sans text-slate-400 leading-relaxed mt-2">
              Runs 100% offline in air-gapped environments. Discovers fields from raw events, scores classification confidence, and aligns fields to OCSF classes.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-800/80 text-[11px] font-mono text-emerald-400">
            Air-Gapped & Offline Ready
          </div>
        </div>

        <div className="bg-[#171f33] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3 hover:border-amber-500/50 transition-all hover:-translate-y-1 h-full flex flex-col justify-between">
          <div>
            <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-400 w-fit mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold font-tech text-white uppercase tracking-wider">
              3. Forensic Integrity Vault
            </h3>
            <p className="text-xs font-sans text-slate-400 leading-relaxed mt-2">
              Every raw log line receives a deterministic SHA-256 hash. The original event is never modified, ensuring forensic non-repudiation in security investigations.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-800/80 text-[11px] font-mono text-amber-400">
            100% Non-Repudiation Proof
          </div>
        </div>

      </div>

      {/* Benchmark & Architectural Advantage Table */}
      <div className="bg-[#171f33] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
              ULPF Architectural Advantage vs Traditional Log Pipelines
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Comparative analysis between ULPF's unified engine and legacy log aggregators.
          </p>
        </div>

        <div className="border border-slate-800 rounded-xl overflow-hidden bg-[#0f172a]">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#131b2e] border-b border-slate-800 text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Evaluation Dimension</th>
                <th className="py-3 px-4 text-cyan-400 font-bold">ULPF Framework</th>
                <th className="py-3 px-4 text-slate-400">Legacy Aggregators (Logstash)</th>
                <th className="py-3 px-4 text-emerald-400 font-bold">Key Advantage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {comparisons.map((c, i) => (
                <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 text-white font-semibold">{c.feature}</td>
                  <td className="py-3 px-4 text-cyan-300 font-semibold">{c.ulpf}</td>
                  <td className="py-3 px-4 text-slate-400">{c.traditional}</td>
                  <td className="py-3 px-4 text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{c.advantage}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
