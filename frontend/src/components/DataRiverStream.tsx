import React, { useState, useEffect } from 'react';
import {
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Play,
  Pause,
  Layers,
  Sparkles,
  Server,
  Activity,
  Cpu,
  Hash,
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { RawNormalizedModal } from './RawNormalizedModal';

interface PipelineLogItem {
  id: string;
  source: string;
  protocol: string;
  rawSample: string;
  ocsfClass: string;
  ocsfClassId: number;
  action: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  latency: string;
  sha256: string;
  normalizedJson: any;
}

const STREAM_ITEMS: PipelineLogItem[] = [
  {
    id: 'EVT-9041',
    source: 'Palo Alto NGFW',
    protocol: 'Syslog (RFC 5424)',
    rawSample: '<134>1 2026-09-02T10:32:01Z fw01.tokyo firewall 1024 - - src=192.168.1.50 dst=10.0.0.1 action=DENY proto=TCP',
    ocsfClass: 'Network Activity',
    ocsfClassId: 4001,
    action: 'DENY',
    severity: 'HIGH',
    latency: '1.2ms',
    sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    normalizedJson: {
      class_uid: 4001,
      class_name: 'Network Activity',
      category_uid: 4,
      severity_id: 3,
      activity_name: 'Traffic Denied',
      src_endpoint: { ip: '192.168.1.50', port: 54102 },
      dst_endpoint: { ip: '10.0.0.1', port: 443 },
      connection_info: { protocol_name: 'TCP', direction: 'Inbound' },
      disposition: 'Blocked',
    },
  },
  {
    id: 'EVT-9042',
    source: 'AWS CloudTrail Prod',
    protocol: 'JSON Stream',
    rawSample: '{"eventVersion":"1.08","userIdentity":{"userName":"admin_ops"},"eventName":"ConsoleLogin","sourceIPAddress":"203.0.113.45"}',
    ocsfClass: 'Authentication',
    ocsfClassId: 3001,
    action: 'LOGON_SUCCESS',
    severity: 'LOW',
    latency: '1.8ms',
    sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    normalizedJson: {
      class_uid: 3001,
      class_name: 'Authentication',
      category_uid: 3,
      severity_id: 1,
      activity_name: 'Logon',
      actor: { user: { name: 'admin_ops', type: 'IAMUser' } },
      src_endpoint: { ip: '203.0.113.45' },
      status: 'Success',
      cloud: { provider: 'AWS', region: 'us-east-1' },
    },
  },
  {
    id: 'EVT-9043',
    source: 'Suricata NIDS Alerts',
    protocol: 'CEF Protocol',
    rawSample: 'CEF:0|Suricata|IDP|6.0.4|2001219|ET SCAN Potential SSH Scan|3|src=192.168.1.105 dst=198.51.100.12 dport=22',
    ocsfClass: 'Security Finding',
    ocsfClassId: 2001,
    action: 'DETECTED',
    severity: 'CRITICAL',
    latency: '2.1ms',
    sha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    normalizedJson: {
      class_uid: 2001,
      class_name: 'Security Finding',
      category_uid: 2,
      severity_id: 4,
      activity_name: 'Port Scan Detected',
      finding_info: { title: 'ET SCAN Potential SSH Scan', desc: 'Port sweep against SSH gateway' },
      src_endpoint: { ip: '192.168.1.105' },
      dst_endpoint: { ip: '198.51.100.12', port: 22 },
    },
  },
  {
    id: 'EVT-9044',
    source: 'Windows Security AD',
    protocol: 'XML EventLog',
    rawSample: '<Event><System><EventID>4625</EventID><TimeCreated SystemTime="2026-09-02T10:32:10Z"/></System><EventData><Data Name="TargetUserName">svc_backup</Data></EventData></Event>',
    ocsfClass: 'Authentication',
    ocsfClassId: 3001,
    action: 'FAILED_LOGON',
    severity: 'HIGH',
    latency: '1.4ms',
    sha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    normalizedJson: {
      class_uid: 3001,
      class_name: 'Authentication',
      category_uid: 3,
      severity_id: 3,
      activity_name: 'Logon Failed',
      actor: { user: { name: 'svc_backup', domain: 'CORP' } },
      status: 'Failure',
      status_code: '0xC000006A',
    },
  },
];

export const DataRiverStream: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [processedCount, setProcessedCount] = useState(1425890);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setActiveItemIndex((prev) => (prev + 1) % STREAM_ITEMS.length);
      setProcessedCount((prev) => prev + Math.floor(Math.random() * 8) + 12);
    }, 2800);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const activeEvent = STREAM_ITEMS[activeItemIndex];

  const handleInspect = (item: PipelineLogItem) => {
    soundFx.playClick();
    setSelectedEvent({
      event_id: item.id,
      source_name: item.source,
      parser_name: `${item.protocol} Normalizer`,
      parser_version: 'v1.1',
      severity: item.severity,
      raw_message: item.rawSample,
      raw_hash: item.sha256,
      category: item.ocsfClass.toLowerCase(),
      action: item.action,
      source_ip: item.normalizedJson.src_endpoint?.ip,
      dest_ip: item.normalizedJson.dst_endpoint?.ip,
      full_event_json: item.normalizedJson,
    });
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#0b1220]/90 border border-slate-800 backdrop-blur-xl p-5 shadow-hud group">
      {/* Tactical HUD Corner Reticles */}
      <div className="hud-corner-tl" />
      <div className="hud-corner-tr" />
      <div className="hud-corner-bl" />
      <div className="hud-corner-br" />

      {/* Ambient Top Glow Line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-70" />

      {/* Section Header with Telemetry & Stream Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-950/70 border border-cyan-800/80 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Live Ingestion & Normalization River
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Ingress
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Real-time multi-protocol packet stream transforming raw logs into Unified OCSF v1.1 events
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Live Ingestion Velocity Counter */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-xs">
            <span className="text-slate-400 text-[10px] uppercase">Processed:</span>
            <span className="text-cyan-300 font-bold tracking-tight">
              {processedCount.toLocaleString()}
            </span>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              setIsPlaying(!isPlaying);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-mono font-medium transition-all ${
              isPlaying
                ? 'bg-slate-900/90 text-amber-300 border-amber-800/60 hover:bg-slate-800'
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3 h-3" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3" />
                <span>Resume</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* The Interactive Visual Stream Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center">
        
        {/* Left: Heterogeneous Raw Ingest Packet (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
            <span className="flex items-center gap-1.5 text-amber-400 font-semibold uppercase">
              <Server className="w-3.5 h-3.5" />
              1. Inbound Raw Message
            </span>
            <span className="text-[10px] text-slate-500">{activeEvent.protocol}</span>
          </div>

          <div
            onClick={() => handleInspect(activeEvent)}
            className="cursor-pointer relative p-3.5 rounded-xl bg-slate-950/80 border border-amber-500/40 hover:border-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all group/raw h-[122px] flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono font-bold text-white group-hover/raw:text-amber-200">
                {activeEvent.source}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-800">
                RAW
              </span>
            </div>
            <div className="p-2 rounded-lg bg-black/60 border border-slate-900 text-[11px] font-mono text-amber-300/90 truncate">
              {activeEvent.rawSample}
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span className="flex items-center gap-1">
                <Hash className="w-3 h-3 text-cyan-400" />
                {activeEvent.sha256.substring(0, 16)}...
              </span>
              <span className="text-amber-400/80 group-hover/raw:translate-x-0.5 transition-transform">
                Click to inspect →
              </span>
            </div>
          </div>
        </div>

        {/* Center: Quantum Normalizer Engine Core (3 cols) */}
        <div className="lg:col-span-3 flex flex-col items-center justify-center p-2 relative h-[142px]">
          {/* Animated Connecting Fiber Lines */}
          <div className="hidden lg:block absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-amber-500/40 via-cyan-400 to-emerald-500/40 z-0" />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-950 to-slate-900 border border-cyan-500/80 flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.4)] animate-pulse">
              <div className="absolute inset-0 rounded-2xl border border-cyan-400/40 animate-ping opacity-25" />
              <Cpu className="w-6 h-6 text-cyan-300" />
            </div>

            <div className="mt-2 space-y-0.5">
              <span className="text-[11px] font-mono font-bold text-cyan-300 tracking-wider block uppercase">
                OCSF Normalizer
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/60 inline-flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                {activeEvent.latency} Latency
              </span>
            </div>
          </div>
        </div>

        {/* Right: Standardized OCSF Output Event (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold uppercase">
              <CheckCircle2 className="w-3.5 h-3.5" />
              2. Standardized OCSF Event
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">Class UID: {activeEvent.ocsfClassId}</span>
          </div>

          <div
            onClick={() => handleInspect(activeEvent)}
            className="cursor-pointer relative p-3.5 rounded-xl bg-slate-950/80 border border-emerald-500/40 hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all group/ocsf h-[122px] flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono font-bold text-emerald-300 group-hover/ocsf:text-emerald-200">
                {activeEvent.ocsfClass}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5" />
                OCSF v1.1
              </span>
            </div>
            <div className="p-2 rounded-lg bg-black/60 border border-slate-900 text-[11px] font-mono text-emerald-300/90 flex items-center justify-between">
              <span>Action: <strong className="text-white">{activeEvent.action}</strong></span>
              <span className="text-slate-400">{activeEvent.normalizedJson.src_endpoint?.ip || 'IP-Bound'}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                SHA-256 Validated
              </span>
              <span className="text-cyan-400/80 group-hover/ocsf:translate-x-0.5 transition-transform">
                View OCSF Object →
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Interactive Modal for Selected Event */}
      <RawNormalizedModal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        event={selectedEvent}
      />
    </div>
  );
};
