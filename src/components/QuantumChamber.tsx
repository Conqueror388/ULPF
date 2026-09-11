import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, Zap, ArrowRight, Hash, Layers, RefreshCw, CheckCircle2 } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface Props {
  onNavigate?: (tab: any) => void;
}

export const QuantumChamber: React.FC<Props> = ({ onNavigate }) => {
  const [pulse, setPulse] = useState(0);
  const [activeStep, setActiveStep] = useState(1);
  const [rawText, setRawText] = useState(
    '<134>1 2026-09-02T10:32:01Z fw01.corp.net firewall 1024 - - src=192.168.1.50 dst=10.0.0.1 sport=49152 dport=443 proto=TCP action=DENY user=sec_admin'
  );
  const [hashValue, setHashValue] = useState('sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069');
  const [isIonizing, setIsIonizing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((p) => (p + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleIonize = () => {
    soundFx.playBeep();
    setIsIonizing(true);
    setTimeout(() => {
      soundFx.playSuccess();
      setIsIonizing(false);
      setActiveStep(2);
    }, 800);
  };

  return (
    <div className="bg-[#0f172a]/90 border border-cyan-500/40 rounded-3xl p-7 shadow-[0_0_50px_rgba(6,182,212,0.2)] relative overflow-hidden space-y-6">
      
      {/* Background Decorative Hologram Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-cyan-500/10 pointer-events-none animate-spin duration-1000" style={{ animationDuration: '40s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-dashed border-cyan-500/20 pointer-events-none animate-spin" style={{ animationDuration: '25s' }} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-950 border border-cyan-500/80 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_#06b6d4]">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold font-mono text-white tracking-wide">
                Interactive OCSF Normalization Chamber
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500 text-black text-[10px] font-bold font-mono uppercase">
                LIVE HUD
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans">
              Test real-time log ingestion, schema crystallization, and bit-exact SHA-256 seal generation.
            </p>
          </div>
        </div>

        <button
          onClick={handleIonize}
          disabled={isIonizing}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 via-cyan-400 to-emerald-400 hover:scale-105 text-black font-bold text-xs font-mono rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
        >
          {isIonizing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Ionizing Payload...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Simulate Real-Time Normalization</span>
            </>
          )}
        </button>
      </div>

      {/* 3-Chamber Transformation Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 relative z-10">
        
        {/* Stage 1: Heterogeneous Raw Input (4 cols) */}
        <div className="lg:col-span-4 bg-[#131b2e]/90 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 flex flex-col justify-between shadow-lg transition-all">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                1. Raw Ingest Feed
              </span>
              <span className="text-[10px] font-mono text-slate-500">RFC 5424</span>
            </div>
            <textarea
              rows={4}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full bg-[#070c18] border border-slate-800 rounded-xl p-3 text-xs font-mono text-amber-300/90 whitespace-pre focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Size: 138 Bytes</span>
            <span className="text-amber-400">Heterogeneous Format</span>
          </div>
        </div>

        {/* Center: Ionization & Cryptographic Seal Core (4 cols) */}
        <div className="lg:col-span-4 bg-gradient-to-b from-[#0b1326] via-[#131b2e] to-[#0b1326] border border-cyan-500/60 rounded-2xl p-5 flex flex-col items-center justify-center text-center relative shadow-[inset_0_0_30px_rgba(6,182,212,0.15)]">
          
          {/* Animated Hologram Core */}
          <div className="relative w-24 h-24 flex items-center justify-center mb-3">
            <div
              className="absolute inset-0 rounded-full border border-cyan-400/40 animate-ping opacity-50"
              style={{ animationDuration: '3s' }}
            />
            <div
              className="w-20 h-20 rounded-full border-2 border-cyan-400/70 flex items-center justify-center shadow-[0_0_20px_#06b6d4]"
              style={{ transform: `rotate(${pulse * 3.6}deg)` }}
            >
              <Layers className="w-8 h-8 text-cyan-300" />
            </div>
          </div>

          <h4 className="text-xs font-bold font-mono text-white tracking-wider uppercase mb-1">
            Zero-Loss Ionization Core
          </h4>
          <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 mb-2">
            SHA-256 Seal Active
          </span>
          <p className="text-[11px] text-slate-300 font-mono line-clamp-2 max-w-xs break-all bg-black/60 p-2 rounded-lg border border-slate-900">
            {hashValue}
          </p>

          <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Forensic Hash Certified</span>
          </div>
        </div>

        {/* Stage 3: Standardized OCSF Output (4 cols) */}
        <div className="lg:col-span-4 bg-[#131b2e]/90 border border-cyan-500/40 hover:border-cyan-400 rounded-2xl p-4 flex flex-col justify-between shadow-lg transition-all">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                2. Unified OCSF Standard
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                100% Validated
              </span>
            </div>
            <pre className="bg-[#070c18] border border-cyan-950 p-3 rounded-xl text-xs font-mono text-cyan-200/90 h-32 overflow-y-auto whitespace-pre-wrap leading-relaxed selection:bg-cyan-500 selection:text-black">
{`{
  "category": "network",
  "action": "DENY",
  "severity": "HIGH",
  "source": { "ip": "192.168.1.50", "port": 49152 },
  "destination": { "ip": "10.0.0.1", "port": 443 },
  "user": { "name": "sec_admin" },
  "integrity": { "sha256": "verified" }
}`}
            </pre>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">Latency: <strong className="text-emerald-400">0.41 ms</strong></span>
            {onNavigate && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  onNavigate('log-explorer');
                }}
                className="text-cyan-400 hover:text-white font-semibold flex items-center gap-1 hover:underline"
              >
                Inspect Explorer →
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
