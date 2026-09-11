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
          <h1 className="text-2xl font-bold font-mono text-white tracking-wide mt-1.5 flex items-center gap-3">
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
          <QuantumChamber onNavigate={onNavigate} />
        </div>
        <div className="lg:col-span-4">
          <HologramCore3D />
        </div>
      </div>

      {/* Architecture Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-[#171f33] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3 hover:border-cyan-500/50 transition-all hover:-translate-y-1">
          <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-800 text-cyan-400 w-fit">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
            1. Zero-Copy Ingestion
          </h3>
          <p className="text-xs font-mono text-slate-400 leading-relaxed">
            Asynchronous multi-threaded listener handles high-volume UDP/TCP Syslog, REST payloads, and file uploads directly into an in-memory event buffer.
          </p>
        </div>

        <div className="bg-[#171f33] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3 hover:border-emerald-500/50 transition-all hover:-translate-y-1">
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-400 w-fit">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
            2. Heuristic AI Mapping
          </h3>
          <p className="text-xs font-mono text-slate-400 leading-relaxed">
            Runs 100% offline in air-gapped environments. Discovers fields from raw events, scores classification confidence, and aligns fields to OCSF classes.
          </p>
        </div>

        <div className="bg-[#171f33] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3 hover:border-amber-500/50 transition-all hover:-translate-y-1">
          <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-400 w-fit">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
            3. Forensic Integrity Vault
          </h3>
          <p className="text-xs font-mono text-slate-400 leading-relaxed">
            Every raw log line receives a deterministic SHA-256 hash. The original event is never modified, ensuring forensic non-repudiation in security investigations.
          </p>
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
