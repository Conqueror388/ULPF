import React from 'react';
import {
  Crosshair,
  ShieldAlert,
  Radio,
  Activity,
  Globe,
  Lock,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { ThreatRadar } from '../components/ThreatRadar';
import { CyberGlobe3D } from '../components/CyberGlobe3D';
import { soundFx } from '../utils/audio';

interface Props {
  onNavigate: (tab: any) => void;
}

export const ThreatRadarPage: React.FC<Props> = ({ onNavigate }) => {
  return (
    <div className="py-8 px-6 sm:px-10 space-y-8 max-w-[1720px] w-full mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-red-950/90 border border-red-800 text-[10px] font-mono text-red-400 font-bold uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
              SOC Anomaly Radar & 3D Globe
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-400 font-mono font-semibold">
              Live Threat Normalization
            </span>
          </div>
          <h1 className="text-2xl font-bold font-mono text-white tracking-wide mt-1.5 flex items-center gap-3">
            <span>Threat Detection, Radar & 3D Telemetry</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Continuous threat signature monitoring, target port attack heatmaps, and interactive 3D cross-border log trajectory mesh.
          </p>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            onNavigate('log-explorer');
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black font-bold rounded-xl text-xs font-mono shadow-[0_0_15px_rgba(6,182,212,0.35)] transition-all hover:scale-105"
        >
          <span>Search Threat Logs</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 3D WebGL Cyber Globe */}
      <CyberGlobe3D />

      {/* Main Threat Radar Component */}
      <ThreatRadar />

      {/* SOC Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        
        <div className="bg-[#171f33] border border-slate-800 hover:border-red-500/50 rounded-2xl p-6 shadow-xl flex flex-col justify-between h-full transition-all hover:-translate-y-1 relative overflow-hidden group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-slate-400 uppercase font-semibold tracking-wider">Top Threat Category</span>
              <span className="px-2.5 py-1 rounded-lg bg-red-950/80 border border-red-800 text-red-400 text-xs font-mono font-bold">
                Web RCE
              </span>
            </div>
            <h3 className="text-xl font-bold font-mono text-white mb-2">CVE-2017-5638</h3>
            <p className="text-xs font-sans text-slate-400 leading-relaxed">
              Apache Struts OGNL expression injection detected across perimeter gateway.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Status: Quarantined</span>
            <span className="text-red-400 font-semibold">OCSF Class: 4001</span>
          </div>
        </div>

        <div className="bg-[#171f33] border border-slate-800 hover:border-amber-500/50 rounded-2xl p-6 shadow-xl flex flex-col justify-between h-full transition-all hover:-translate-y-1 relative overflow-hidden group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-slate-400 uppercase font-semibold tracking-wider">Attacked Endpoint</span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-800 text-amber-400 text-xs font-mono font-bold">
                Port 22 SSH
              </span>
            </div>
            <h3 className="text-xl font-bold font-mono text-white mb-2">3,120 Sweeps</h3>
            <p className="text-xs font-sans text-slate-400 leading-relaxed">
              Automated brute force attempts quarantined and mapped to destination.port 22.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Target: Bastion Host</span>
            <span className="text-amber-400 font-semibold">Protocol: TCP</span>
          </div>
        </div>

        <div className="bg-[#171f33] border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 shadow-xl flex flex-col justify-between h-full transition-all hover:-translate-y-1 relative overflow-hidden group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-slate-400 uppercase font-semibold tracking-wider">Protocol Distribution</span>
              <span className="px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-400 text-xs font-mono font-bold">
                TCP 78% / UDP 22%
              </span>
            </div>
            <h3 className="text-xl font-bold font-mono text-white mb-2">Normalized OCSF</h3>
            <p className="text-xs font-sans text-slate-400 leading-relaxed">
              100% of network protocol headers standardized under network.protocol attribute.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Schema: Network Activity</span>
            <span className="text-cyan-400 font-semibold">100% Standardized</span>
          </div>
        </div>

      </div>

    </div>
  );
};
