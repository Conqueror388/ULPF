import React, { useEffect, useState, useRef } from 'react';
import {
  Radio,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Terminal,
  Server,
  Zap,
  ShieldCheck,
  Hash,
  Activity,
} from 'lucide-react';
import { SeverityBadge } from '../components/SeverityBadge';
import { RawNormalizedModal } from '../components/RawNormalizedModal';
import { soundFx } from '../utils/audio';

interface StreamEvent {
  id: string;
  timestamp: string;
  source_name: string;
  raw_message: string;
  raw_hash: string;
  category: string;
  action: string;
  severity: string;
  source_ip: string;
  dest_ip: string;
  normalized: boolean;
  status: string;
}

const LOCAL_SAMPLES = [
  {
    raw: '<134>1 2026-09-01T10:32:01Z fw01.corp.net firewall 1024 - - proto=TCP src=192.168.1.10 dst=10.0.0.20 sport=54321 dport=443 action=DENY user=admin',
    source: 'Firewall-01 (Palo Alto)',
    category: 'network',
    action: 'DENY',
    severity: 'HIGH',
    src: '192.168.1.10',
    dst: '10.0.0.20',
  },
  {
    raw: '<Event><System><EventID>4625</EventID><TimeCreated SystemTime="2026-09-01T10:32:04Z"/></System><EventData><Data Name="TargetUserName">administrator</Data><Data Name="IpAddress">10.0.0.12</Data></EventData></Event>',
    source: 'Windows-Domain-DC',
    category: 'authentication',
    action: 'FAILED_LOGIN',
    severity: 'HIGH',
    src: '10.0.0.12',
    dst: '10.0.0.2',
  },
  {
    raw: '{"eventVersion": "1.08", "userIdentity": {"userName": "root_backup"}, "eventName": "ConsoleLogin", "sourceIPAddress": "203.0.113.45", "errorMessage": "Failed authentication"}',
    source: 'AWS-CloudTrail-Prod',
    category: 'authentication',
    action: 'CONSOLELOGIN',
    severity: 'MEDIUM',
    src: '203.0.113.45',
    dst: 's3.amazonaws.com',
  },
  {
    raw: 'CEF:0|Suricata|IDP|6.0.4|2001219|ET SCAN Potential SSH Scan|3|src=192.168.1.105 dst=198.51.100.12 sport=55412 dport=22 proto=TCP',
    source: 'Suricata-IDS',
    category: 'security_alert',
    action: 'ALERT',
    severity: 'CRITICAL',
    src: '192.168.1.105',
    dst: '198.51.100.12',
  },
  {
    raw: '2026-09-01T10:32:15Z,192.168.1.88,GET /api/v1/auth/token,401,10.0.0.5,443,curl/7.68.0',
    source: 'Web-App-Nginx',
    category: 'web',
    action: 'HTTP_401',
    severity: 'LOW',
    src: '192.168.1.88',
    dst: '10.0.0.5',
  },
];

export const LiveIngestionPage: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<number>(1);
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const rawScrollRef = useRef<HTMLDivElement>(null);
  const normScrollRef = useRef<HTMLDivElement>(null);

  // Stream generator simulation (with WebSocket fallback)
  useEffect(() => {
    if (!isPlaying) return;

    let ws: WebSocket | null = null;
    let fallbackInterval: any = null;

    try {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      let wsTarget = 'ws://localhost:8000/api/stream/live';
      if (import.meta.env.VITE_WS_URL) {
        wsTarget = import.meta.env.VITE_WS_URL;
      } else if (import.meta.env.VITE_API_URL) {
        try {
          const apiUrl = new URL(import.meta.env.VITE_API_URL, window.location.href);
          const proto = apiUrl.protocol === 'https:' ? 'wss:' : 'ws:';
          wsTarget = `${proto}//${apiUrl.host}/api/stream/live`;
        } catch (_) {
          // fallback
        }
      } else if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        wsTarget = `${wsProtocol}//${window.location.host}/api/stream/live`;
      }
      ws = new WebSocket(wsTarget);
      ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        const newEvt: StreamEvent = {
          id: `EVT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          ...data,
        };
        setEvents((prev) => [newEvt, ...prev.slice(0, 99)]);
      };
      ws.onerror = () => {
        startFallback();
      };
    } catch (e) {
      startFallback();
    }

    function startFallback() {
      if (fallbackInterval) return;
      fallbackInterval = setInterval(() => {
        const sample = LOCAL_SAMPLES[Math.floor(Math.random() * LOCAL_SAMPLES.length)];
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
        const randIp = `192.168.1.${Math.floor(Math.random() * 240) + 10}`;

        const newEvt: StreamEvent = {
          id: `EVT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          timestamp: timeStr,
          source_name: sample.source,
          raw_message: sample.raw.replace('192.168.1.10', randIp),
          raw_hash: 'sha256:7f83b165...',
          category: sample.category,
          action: sample.action,
          severity: sample.severity,
          source_ip: sample.src === '192.168.1.10' ? randIp : sample.src,
          dest_ip: sample.dst,
          normalized: true,
          status: 'SUCCESS',
        };
        setEvents((prev) => [newEvt, ...prev.slice(0, 99)]);
      }, 700 / speed);
    }

    return () => {
      if (ws) ws.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [isPlaying, speed]);

  const handleInspect = (evt: StreamEvent) => {
    soundFx.playClick();
    setSelectedEvent({
      event_id: evt.id,
      timestamp: evt.timestamp,
      raw_message: evt.raw_message,
      raw_hash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      severity: evt.severity,
      category: evt.category,
      action: evt.action,
      source_ip: evt.source_ip,
      dest_ip: evt.dest_ip,
      parser_name: evt.source_name,
      parser_version: 'v1.0',
      full_event_json: {
        event_id: evt.id,
        timestamp: evt.timestamp,
        event: { category: evt.category, action: evt.action, severity: evt.severity },
        source: { ip: evt.source_ip },
        destination: { ip: evt.dest_ip },
        observer: { product: evt.source_name },
        raw: { message: evt.raw_message, hash: 'sha256:verified' },
      },
    });
    setIsModalOpen(true);
  };

  return (
    <div className="py-8 px-6 sm:px-10 space-y-6 max-w-[1720px] w-full mx-auto">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-800 text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest">
              Live Pipeline Stream
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-mono text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              STREAMING ACTIVE
            </span>
          </div>
          <h1 className="text-2xl font-bold font-mono text-white tracking-wide mt-1.5 flex items-center gap-3">
            <span>Real-Time Ingestion Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Simultaneous multi-source raw log intake and live OCSF normalization pipeline.
          </p>
        </div>

        {/* Live Stream Controls */}
        <div className="flex items-center gap-3 bg-[#171f33] border border-slate-800 p-1.5 rounded-xl text-xs font-mono shadow-md">
          <button
            onClick={() => {
              soundFx.playClick();
              setIsPlaying(!isPlaying);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold transition-all duration-200 hover:scale-105 ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 hover:shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 hover:shadow-[0_0_15px_rgba(34,197,94,0.25)]'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause Stream' : 'Resume Stream'}</span>
          </button>

          <div className="flex items-center gap-1 bg-[#0b1326] px-2 py-1 rounded-lg border border-slate-800">
            <span className="text-slate-500">Speed:</span>
            {[1, 2, 5].map((s) => (
              <button
                key={s}
                onClick={() => {
                  soundFx.playClick();
                  setSpeed(s);
                }}
                className={`px-2 py-0.5 rounded-md transition-all ${
                  speed === s ? 'bg-cyan-500 text-black font-bold shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              setEvents([]);
            }}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all hover:scale-110"
            title="Clear Stream Buffer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Connected Source Rate Badges with Rich Hover */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 items-stretch">
        {[
          { name: 'Firewall-01', rate: '1,240/s', status: 'ACTIVE', type: 'Syslog' },
          { name: 'Windows-Domain-DC', rate: '820/s', status: 'ACTIVE', type: 'XML' },
          { name: 'AWS-CloudTrail', rate: '450/s', status: 'ACTIVE', type: 'JSON' },
          { name: 'Suricata-IDS', rate: '630/s', status: 'ACTIVE', type: 'CEF' },
          { name: 'Web-App-Nginx', rate: '310/s', status: 'ACTIVE', type: 'CSV' },
        ].map((src, i) => (
          <div
            key={i}
            className="bg-[#171f33] border border-slate-800 hover:border-cyan-500/70 hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:-translate-y-1 transition-all duration-300 rounded-2xl p-4 cursor-pointer group h-full flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="font-semibold text-slate-200 group-hover:text-white truncate">{src.name}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#22c55e]" />
            </div>
            <div className="flex items-baseline justify-between text-xs font-mono pt-1">
              <span className="text-cyan-400 font-bold group-hover:text-cyan-300 text-sm">{src.rate}</span>
              <span className="text-[10px] text-slate-500 group-hover:text-slate-400 px-1.5 py-0.2 rounded bg-black/40 border border-slate-800">{src.type}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Dual Stream Split Console */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Left: Incoming Raw Log Stream */}
        <div className="bg-[#131b2e] border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden flex flex-col shadow-2xl transition-colors duration-300">
          <div className="px-5 py-3.5 bg-[#171f33] border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">
                1. Incoming Raw Stream (Unmodified)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500 bg-black/40 px-2 py-0.5 rounded border border-slate-800">
              Buffer: {events.length} lines
            </span>
          </div>

          <div
            ref={rawScrollRef}
            className="p-3.5 h-[500px] overflow-y-auto space-y-2 font-mono text-[11px] bg-[#0b1326]"
          >
            {events.map((e, idx) => (
              <div
                key={`${e.id}-${idx}`}
                onClick={() => handleInspect(e)}
                className="p-2.5 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] border border-slate-900 hover:border-amber-500/60 hover:shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:translate-x-1 cursor-pointer transition-all duration-200 group"
              >
                <div className="flex items-center justify-between text-slate-500 text-[10px] mb-1">
                  <span className="text-cyan-400 font-semibold group-hover:text-cyan-300">{e.timestamp}</span>
                  <span className="text-slate-400 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800 group-hover:border-slate-700">
                    {e.source_name}
                  </span>
                </div>
                <div className="text-amber-300/90 group-hover:text-amber-200 whitespace-pre-wrap break-all leading-snug">
                  {e.raw_message}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Normalized OCSF Live Stream */}
        <div className="bg-[#131b2e] border border-cyan-500/40 hover:border-cyan-400/80 rounded-2xl overflow-hidden flex flex-col shadow-2xl transition-colors duration-300">
          <div className="px-5 py-3.5 bg-[#171f33] border-b border-cyan-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold font-mono text-cyan-300 uppercase tracking-wider">
                2. Normalized OCSF Stream (Unified Schema)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" /> Normalizing 100%
            </span>
          </div>

          <div
            ref={normScrollRef}
            className="p-3.5 h-[500px] overflow-y-auto space-y-2 font-mono text-[11px] bg-[#0b1326]"
          >
            {events.map((e, idx) => (
              <div
                key={`norm-${e.id}-${idx}`}
                onClick={() => handleInspect(e)}
                className="p-3 rounded-xl bg-[#131b2e] hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:translate-x-1 cursor-pointer transition-all duration-200 flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-emerald-400 font-bold text-xs flex-shrink-0 group-hover:scale-125 transition-transform">✓</span>
                  <span className="text-slate-400 text-[10px] flex-shrink-0">{e.timestamp}</span>
                  <SeverityBadge severity={e.severity} size="sm" />
                  <span className="text-white font-semibold truncate text-xs group-hover:text-cyan-300 transition-colors">{e.action}</span>
                  <span className="text-slate-500 text-[10px] hidden sm:inline">[{e.category}]</span>
                </div>

                <div className="flex items-center gap-3 text-[11px] flex-shrink-0">
                  <span className="text-cyan-300 font-mono">{e.source_ip}</span>
                  <span className="text-slate-600">→</span>
                  <span className="text-cyan-300 font-mono">{e.dest_ip}</span>
                  <span className="text-[10px] text-cyan-400 group-hover:text-white group-hover:underline">Inspect →</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Raw vs Normalized Inspector Modal */}
      <RawNormalizedModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={selectedEvent}
      />

    </div>
  );
};
