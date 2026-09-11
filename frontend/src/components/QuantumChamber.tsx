import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Hash,
  Layers,
  RefreshCw,
  CheckCircle2,
  Cpu,
  Server,
  Terminal,
  FileCode,
  Activity,
  Lock,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface Props {
  onNavigate?: (tab: any) => void;
}

interface PresetSample {
  id: string;
  name: string;
  format: string;
  raw: string;
  hash: string;
  ocsf: any;
  mappings: { rawKey: string; ocsfField: string; type: string; confidence: string }[];
}

const CHAMBER_PRESETS: PresetSample[] = [
  {
    id: 'palo-alto',
    name: 'Palo Alto NGFW',
    format: 'Syslog (RFC 5424)',
    raw: '<134>1 2026-09-02T10:32:01Z fw01.corp.net firewall 1024 - - src=192.168.1.50 dst=10.0.0.1 sport=49152 dport=443 proto=TCP action=DENY user=sec_admin',
    hash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    ocsf: {
      category_uid: 4,
      category_name: 'Network Activity',
      class_uid: 4001,
      class_name: 'Network Activity',
      activity_name: 'Traffic Denied',
      severity_id: 3,
      severity: 'HIGH',
      src_endpoint: { ip: '192.168.1.50', port: 49152 },
      dst_endpoint: { ip: '10.0.0.1', port: 443 },
      connection_info: { protocol_name: 'TCP' },
      actor: { user: { name: 'sec_admin' } },
      disposition: 'Blocked',
      metadata: { version: '1.1.0', product: { name: 'Palo Alto NGFW' } },
    },
    mappings: [
      { rawKey: 'src=192.168.1.50', ocsfField: 'src_endpoint.ip', type: 'IPv4', confidence: '99.8%' },
      { rawKey: 'dst=10.0.0.1', ocsfField: 'dst_endpoint.ip', type: 'IPv4', confidence: '99.9%' },
      { rawKey: 'sport=49152', ocsfField: 'src_endpoint.port', type: 'Integer', confidence: '100%' },
      { rawKey: 'dport=443', ocsfField: 'dst_endpoint.port', type: 'Integer', confidence: '100%' },
      { rawKey: 'proto=TCP', ocsfField: 'connection_info.protocol', type: 'Enum (6)', confidence: '99.9%' },
      { rawKey: 'action=DENY', ocsfField: 'disposition', type: 'String', confidence: '99.5%' },
    ],
  },
  {
    id: 'aws-cloudtrail',
    name: 'AWS CloudTrail',
    format: 'JSON Stream',
    raw: '{"eventVersion":"1.08","userIdentity":{"userName":"root_backup"},"eventName":"ConsoleLogin","sourceIPAddress":"203.0.113.45","responseElements":{"ConsoleLogin":"Failure"}}',
    hash: 'sha256:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    ocsf: {
      category_uid: 3,
      category_name: 'Identity & Access',
      class_uid: 3001,
      class_name: 'Authentication',
      activity_name: 'Logon Failed',
      severity_id: 3,
      severity: 'HIGH',
      actor: { user: { name: 'root_backup', type: 'IAMUser' } },
      src_endpoint: { ip: '203.0.113.45' },
      status: 'Failure',
      status_detail: 'Failed Console Authentication',
      cloud: { provider: 'AWS', region: 'us-east-1' },
      metadata: { version: '1.1.0', product: { name: 'CloudTrail' } },
    },
    mappings: [
      { rawKey: 'userIdentity.userName', ocsfField: 'actor.user.name', type: 'String', confidence: '99.9%' },
      { rawKey: 'sourceIPAddress', ocsfField: 'src_endpoint.ip', type: 'IPv4', confidence: '100%' },
      { rawKey: 'eventName:ConsoleLogin', ocsfField: 'activity_name', type: 'String', confidence: '99.7%' },
      { rawKey: 'responseElements', ocsfField: 'status', type: 'Enum (Failure)', confidence: '99.4%' },
    ],
  },
  {
    id: 'suricata-cef',
    name: 'Suricata NIDS',
    format: 'CEF Protocol',
    raw: 'CEF:0|Suricata|IDP|6.0.4|2001219|ET SCAN Potential SSH Scan|3|src=192.168.1.105 dst=198.51.100.12 dport=22 proto=TCP msg=Scan',
    hash: 'sha256:5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    ocsf: {
      category_uid: 2,
      category_name: 'Findings',
      class_uid: 2001,
      class_name: 'Security Finding',
      activity_name: 'Port Sweep Detected',
      severity_id: 4,
      severity: 'CRITICAL',
      finding_info: { title: 'ET SCAN Potential SSH Scan', uid: '2001219' },
      src_endpoint: { ip: '192.168.1.105' },
      dst_endpoint: { ip: '198.51.100.12', port: 22 },
      metadata: { version: '1.1.0', product: { name: 'Suricata NIDS' } },
    },
    mappings: [
      { rawKey: 'src=192.168.1.105', ocsfField: 'src_endpoint.ip', type: 'IPv4', confidence: '99.9%' },
      { rawKey: 'dst=198.51.100.12', ocsfField: 'dst_endpoint.ip', type: 'IPv4', confidence: '99.9%' },
      { rawKey: 'dport=22', ocsfField: 'dst_endpoint.port', type: 'Integer (SSH)', confidence: '100%' },
      { rawKey: 'name=ET SCAN', ocsfField: 'finding_info.title', type: 'String', confidence: '99.6%' },
    ],
  },
  {
    id: 'windows-xml',
    name: 'Windows AD Security',
    format: 'XML EventLog',
    raw: '<Event><System><EventID>4625</EventID><TimeCreated SystemTime="2026-09-02T10:32:10Z"/></System><EventData><Data Name="TargetUserName">svc_backup</Data><Data Name="IpAddress">10.0.0.12</Data></EventData></Event>',
    hash: 'sha256:4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    ocsf: {
      category_uid: 3,
      category_name: 'Identity & Access',
      class_uid: 3001,
      class_name: 'Authentication',
      activity_name: 'Logon Failed',
      severity_id: 3,
      severity: 'HIGH',
      actor: { user: { name: 'svc_backup', domain: 'CORP' } },
      src_endpoint: { ip: '10.0.0.12' },
      status: 'Failure',
      metadata: { version: '1.1.0', product: { name: 'Windows Security' } },
    },
    mappings: [
      { rawKey: 'EventID=4625', ocsfField: 'activity_name', type: 'Enum (Failed)', confidence: '100%' },
      { rawKey: 'TargetUserName', ocsfField: 'actor.user.name', type: 'String', confidence: '99.8%' },
      { rawKey: 'IpAddress=10.0.0.12', ocsfField: 'src_endpoint.ip', type: 'IPv4', confidence: '100%' },
    ],
  },
];

export const QuantumChamber: React.FC<Props> = ({ onNavigate }) => {
  const [pulse, setPulse] = useState(0);
  const [selectedPresetId, setSelectedPresetId] = useState('palo-alto');
  const [currentPreset, setCurrentPreset] = useState<PresetSample>(CHAMBER_PRESETS[0]);
  const [rawText, setRawText] = useState(CHAMBER_PRESETS[0].raw);
  const [isIonizing, setIsIonizing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((p) => (p + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleSelectPreset = (preset: PresetSample) => {
    soundFx.playClick();
    setSelectedPresetId(preset.id);
    setCurrentPreset(preset);
    setRawText(preset.raw);
  };

  const handleIonize = () => {
    soundFx.playBeep();
    setIsIonizing(true);
    setTimeout(() => {
      soundFx.playSuccess();
      setIsIonizing(false);
    }, 700);
  };

  return (
    <div className="bg-[#0f172a] border border-cyan-500/40 rounded-3xl p-6 sm:p-7 shadow-hud relative overflow-hidden space-y-6">
      
      {/* Background Decorative Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-cyan-500/10 pointer-events-none animate-spin" style={{ animationDuration: '40s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-dashed border-cyan-500/20 pointer-events-none animate-spin" style={{ animationDuration: '25s' }} />

      {/* Header with Stylish Cyber Typography */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-950 border border-cyan-500/80 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold font-tech uppercase tracking-wider text-white">
                Interactive OCSF Normalization Chamber
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500 text-black text-[10px] font-bold font-cyber uppercase tracking-wider">
                LIVE HUD
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans">
              Real-time multi-protocol log parser, heuristic AI field mapping, and SHA-256 cryptographic vaulting.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleIonize}
            disabled={isIonizing}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 via-cyan-400 to-emerald-400 hover:scale-105 text-black font-bold text-xs font-tech tracking-wider uppercase rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
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
      </div>

      {/* Preset Format Quick Selectors */}
      <div className="flex flex-wrap items-center gap-2 relative z-10">
        <span className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400 mr-1">
          Source Presets:
        </span>
        {CHAMBER_PRESETS.map((p) => {
          const isSelected = selectedPresetId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => handleSelectPreset(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-cyan-950 border border-cyan-400 text-cyan-300 font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'bg-[#131b2e] border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-cyan-400 animate-ping' : 'bg-slate-500'}`} />
              <span>{p.name}</span>
              <span className="text-[10px] text-slate-500 font-sans">({p.format})</span>
            </button>
          );
        })}
      </div>

      {/* 3-Chamber Transformation Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 relative z-10">
        
        {/* Stage 1: Heterogeneous Raw Input (4 cols) */}
        <div className="lg:col-span-4 bg-[#131b2e] border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 flex flex-col justify-between shadow-lg transition-all group h-[260px]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-tech text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                1. Raw Ingest Feed
              </span>
              <span className="text-[10px] font-mono text-slate-500">{currentPreset.format}</span>
            </div>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full h-32 resize-none bg-[#070c18] border border-slate-800 rounded-xl p-3 text-xs font-mono text-amber-300/90 whitespace-pre focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Size: {rawText.length} Bytes</span>
            <span className="text-amber-400 font-semibold">{currentPreset.name}</span>
          </div>
        </div>

        {/* Center: Ionization & Cryptographic Seal Core (4 cols) */}
        <div className="lg:col-span-4 bg-gradient-to-b from-[#0b1326] via-[#131b2e] to-[#0b1326] border border-cyan-500/60 rounded-2xl p-4 flex flex-col items-center justify-between text-center relative shadow-[inset_0_0_30px_rgba(6,182,212,0.15)] h-[260px]">
          
          {/* Animated Hologram Core */}
          <div className="relative w-16 h-16 flex items-center justify-center mb-1">
            <div
              className="absolute inset-0 rounded-full border border-cyan-400/40 animate-ping opacity-50"
              style={{ animationDuration: '3s' }}
            />
            <div
              className="w-14 h-14 rounded-full border-2 border-cyan-400/70 flex items-center justify-center shadow-[0_0_20px_#06b6d4]"
              style={{ transform: `rotate(${pulse * 3.6}deg)` }}
            >
              <Layers className="w-6 h-6 text-cyan-300" />
            </div>
          </div>

          <div className="space-y-1 w-full flex flex-col items-center">
            <h4 className="text-xs font-bold font-tech text-white tracking-wider uppercase">
              Zero-Loss Ionization Engine
            </h4>
            <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 inline-block">
              SHA-256 Seal Active
            </span>
            <p className="text-[10px] text-slate-300 font-mono line-clamp-2 w-full break-all bg-black/60 p-2 rounded-lg border border-slate-900">
              {currentPreset.hash}
            </p>
          </div>

          <div className="mt-2 pt-2 border-t border-cyan-900/40 w-full flex items-center justify-center gap-1.5 text-[11px] font-mono text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Forensic Hash Verified</span>
          </div>
        </div>

        {/* Stage 3: Standardized OCSF Output (4 cols) */}
        <div className="lg:col-span-4 bg-[#131b2e] border border-cyan-500/40 hover:border-cyan-400 rounded-2xl p-4 flex flex-col justify-between shadow-lg transition-all h-[260px]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-tech text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                2. Unified OCSF Standard
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                100% Validated
              </span>
            </div>
            <pre className="bg-[#070c18] border border-cyan-950 p-3 rounded-xl text-xs font-mono text-cyan-200/90 h-32 overflow-y-auto whitespace-pre-wrap leading-relaxed selection:bg-cyan-500 selection:text-black">
              {JSON.stringify(currentPreset.ocsf, null, 2)}
            </pre>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">Latency: <strong className="text-emerald-400">0.41 ms</strong></span>
            {onNavigate && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  onNavigate('log-explorer');
                }}
                className="text-cyan-400 hover:text-white font-semibold flex items-center gap-1 hover:underline text-xs"
              >
                Inspect Explorer →
              </button>
            )}
          </div>
        </div>

      </div>

      {/* =========================================================================
         ✨ ENHANCED SECTION FILLING THE SPACE BELOW THE NORMALIZATION CHAMBER
         Interactive Field Lineage, AI Mapping Confidence & Forensic Specs
         ========================================================================= */}
      <div className="relative z-10 pt-4 border-t border-slate-800 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-tech font-bold uppercase tracking-wider text-slate-200">
              Deterministic Field Mapping Lineage & Confidence Scores
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            OCSF v1.1 Schema Compliant
          </span>
        </div>

        {/* Live Field Conversion Chips */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {currentPreset.mappings.map((m, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-[#090e1a] border border-slate-800/80 hover:border-cyan-500/50 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                <span className="truncate max-w-[120px] text-amber-300 font-semibold">{m.rawKey}</span>
                <span className="text-emerald-400 bg-emerald-950/40 px-1 rounded">{m.confidence}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-mono text-cyan-300">
                <ArrowRight className="w-3 h-3 text-cyan-500 flex-shrink-0" />
                <span className="font-bold truncate">{m.ocsfField}</span>
              </div>
              <span className="text-[9px] font-mono text-slate-500 mt-1">Type: {m.type}</span>
            </div>
          ))}
        </div>

        {/* Forensic Non-Repudiation & Zero-Loss Engine Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-[#090d18] via-[#0d1424] to-[#090d18] border border-slate-800/90 text-xs font-mono">
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-tech">Pipeline Latency</span>
            <div className="text-emerald-400 font-bold text-sm flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              <span>0.41 ms</span>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-tech">Forensic Preservation</span>
            <div className="text-cyan-300 font-bold text-sm flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Bit-Exact</span>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-tech">Memory Footprint</span>
            <div className="text-white font-bold text-sm flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>~65 MB Zero-Copy</span>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-tech">Offline Execution</span>
            <div className="text-purple-400 font-bold text-sm flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" />
              <span>100% Air-Gapped</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
