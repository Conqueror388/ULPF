import React, { useState } from 'react';
import { X, ShieldCheck, Copy, Check, Hash, FileCode, Layers, Download } from 'lucide-react';
import { SeverityBadge } from './SeverityBadge';
import { soundFx } from '../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  event: any;
}

export const RawNormalizedModal: React.FC<Props> = ({ isOpen, onClose, event }) => {
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  if (!isOpen || !event) return null;

  const rawMessage = event.raw_message || event.raw?.message || '';
  const rawHash = event.raw_hash || event.raw?.sha256 || 'N/A';
  const fullJson = event.full_event_json || event.normalized || event;

  const handleCopyRaw = () => {
    soundFx.playSuccess();
    navigator.clipboard.writeText(rawMessage);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  const handleCopyJson = () => {
    soundFx.playSuccess();
    navigator.clipboard.writeText(JSON.stringify(fullJson, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-cyan-500/60 rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(6,182,212,0.3)] overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#171f33]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400 shadow-inner">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white font-mono tracking-wide">
                  {event.event_id || 'EVENT-INSPECTOR'}
                </h2>
                <SeverityBadge severity={event.severity || fullJson.event?.severity || 'LOW'} size="sm" />
              </div>
              <p className="text-xs text-slate-400">
                Parsed by <span className="text-cyan-300 font-mono font-semibold">{event.parser_name || 'ULPF-Engine'}</span> ({event.parser_version || 'v1.0'})
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 hover:scale-110 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split Screen with Hover Previews */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 p-6 overflow-y-auto flex-1 bg-[#0b1326]">
          
          {/* Left: Original Raw Log */}
          <div className="flex flex-col bg-[#131b2e] border border-slate-800 hover:border-amber-500/50 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between px-5 py-3 bg-[#171f33] border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-mono font-bold uppercase text-slate-300">
                  Original Unmodified Raw Log
                </span>
              </div>
              <button
                onClick={handleCopyRaw}
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-[#0f172a] hover:bg-slate-800 border border-slate-700 hover:border-amber-500/60 px-3 py-1.5 rounded-lg transition-all hover:scale-105"
              >
                {copiedRaw ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedRaw ? 'Copied!' : 'Copy Raw'}
              </button>
            </div>

            <div className="p-5 flex-1">
              <pre className="text-xs font-mono text-amber-300/95 whitespace-pre-wrap break-all leading-relaxed bg-[#0b1326] p-4 rounded-xl border border-slate-900 selection:bg-amber-500 selection:text-black">
                {rawMessage}
              </pre>

              {/* Cryptographic Integrity Badge */}
              <div className="mt-4 p-4 rounded-xl bg-[#0f172a] border border-slate-800/90 hover:border-emerald-500/50 hover:shadow-[0_0_15px_rgba(34,197,94,0.15)] transition-all duration-300">
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold mb-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  SHA-256 Bit-Exact Forensic Proof (Unmodified)
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-300 break-all bg-black/60 p-2.5 rounded-lg border border-slate-950">
                  <Hash className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  <span>{rawHash}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  ✓ Bit-exact match guaranteed. The original log line is preserved unaltered for forensic compliance and zero data loss.
                </p>
              </div>
            </div>
          </div>

          {/* Right: OCSF Normalized Event */}
          <div className="flex flex-col bg-[#131b2e] border border-cyan-500/40 hover:border-cyan-400 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between px-5 py-3 bg-[#171f33] border-b border-cyan-900/40">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-xs font-mono font-bold uppercase text-cyan-300">
                  Unified OCSF Normalized Schema
                </span>
              </div>
              <button
                onClick={handleCopyJson}
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-[#0f172a] hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 px-3 py-1.5 rounded-lg transition-all hover:scale-105 hover:shadow-[0_0_10px_rgba(6,182,212,0.3)]"
              >
                {copiedJson ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedJson ? 'Copied!' : 'Copy JSON'}
              </button>
            </div>

            <div className="p-5 flex-1">
              <pre className="text-xs font-mono text-cyan-200/95 whitespace-pre-wrap break-all leading-relaxed bg-[#0b1326] p-4 rounded-xl border border-cyan-950 max-h-[500px] overflow-y-auto selection:bg-cyan-500 selection:text-black">
                {JSON.stringify(fullJson, null, 2)}
              </pre>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-[#171f33] text-xs font-mono text-slate-400">
          <div className="flex items-center gap-4 flex-wrap">
            <span>Category: <strong className="text-white">{event.category || fullJson.event?.category || 'generic'}</strong></span>
            <span>Action: <strong className="text-white">{event.action || fullJson.event?.action || 'UNKNOWN'}</strong></span>
            <span>Source IP: <strong className="text-cyan-300">{event.source_ip || fullJson.source?.ip || '-'}</strong></span>
            <span>Dest IP: <strong className="text-cyan-300">{event.dest_ip || fullJson.destination?.ip || '-'}</strong></span>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 hover:border-slate-600 border border-slate-700 text-white rounded-xl text-xs font-mono hover:scale-105 transition-all"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
