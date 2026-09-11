import React, { useState } from 'react';
import { Sparkles, ArrowRight, X, CheckCircle2, Shield, Radio, FileSearch } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface Props {
  onNavigate: (tab: any) => void;
}

export const QuickStartBanner: React.FC<Props> = ({ onNavigate }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-[#171f33] via-[#1a233b] to-[#171f33] border border-cyan-500/40 rounded-2xl p-6 shadow-xl relative overflow-hidden transition-all duration-300">
      
      {/* Background ambient decorative shapes */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-10 -top-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Close button */}
      <button
        onClick={() => {
          soundFx.playClick();
          setDismissed(true);
        }}
        className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        title="Dismiss Guide"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
        
        {/* Left explanation */}
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300 text-[10px] font-mono font-bold uppercase tracking-wider">
              🚀 Quick Start Guide
            </span>
            <span className="text-xs text-slate-400 font-mono">Simple 3-Step Process</span>
          </div>
          <h2 className="text-lg font-bold text-white font-mono">
            Welcome to Universal Log Pre-processing Framework (ULPF)
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            ULPF automatically takes logs from any firewall, operating system, or cloud provider, detects their format, and transforms them into standard OCSF format without losing a single character of the original event.
          </p>
        </div>

        {/* 3 Steps Visual Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
          
          <button
            onClick={() => {
              soundFx.playClick();
              onNavigate('add-source');
            }}
            className="p-3.5 rounded-xl bg-[#0f172a] hover:bg-cyan-950/60 border border-slate-700 hover:border-cyan-400 text-left transition-all duration-200 group hover:scale-[1.03] shadow-md"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="w-5 h-5 rounded-full bg-cyan-500 text-black font-bold text-xs flex items-center justify-center font-mono">
                1
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h4 className="text-xs font-bold text-white font-mono">1. Add Log Source</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Upload logs & auto-detect format</p>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              onNavigate('live-stream');
            }}
            className="p-3.5 rounded-xl bg-[#0f172a] hover:bg-emerald-950/60 border border-slate-700 hover:border-emerald-400 text-left transition-all duration-200 group hover:scale-[1.03] shadow-md"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-black font-bold text-xs flex items-center justify-center font-mono">
                2
              </span>
              <Radio className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <h4 className="text-xs font-bold text-white font-mono">2. Watch Live Stream</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">See raw vs normalized in real time</p>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              onNavigate('log-explorer');
            }}
            className="p-3.5 rounded-xl bg-[#0f172a] hover:bg-purple-950/60 border border-slate-700 hover:border-purple-400 text-left transition-all duration-200 group hover:scale-[1.03] shadow-md"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="w-5 h-5 rounded-full bg-purple-500 text-black font-bold text-xs flex items-center justify-center font-mono">
                3
              </span>
              <FileSearch className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
            </div>
            <h4 className="text-xs font-bold text-white font-mono">3. Search & Inspect</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Explore unified logs & hash proofs</p>
          </button>

        </div>

      </div>

    </div>
  );
};
