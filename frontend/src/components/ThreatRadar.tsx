import React, { useEffect, useState } from 'react';
import { ShieldAlert, Crosshair, Radio, Activity, Globe, Lock } from 'lucide-react';
import { SeverityBadge } from './SeverityBadge';

interface ThreatBlip {
  id: string;
  name: string;
  sourceIp: string;
  targetPort: number;
  protocol: string;
  severity: string;
  time: string;
}

const LIVE_THREATS: ThreatBlip[] = [
  {
    id: 'T1',
    name: 'Apache Struts CVE-2017-5638',
    sourceIp: '203.0.113.88',
    targetPort: 8080,
    protocol: 'TCP',
    severity: 'CRITICAL',
    time: 'Just now',
  },
  {
    id: 'T2',
    name: 'ET SCAN Outbound SSH Sweep',
    sourceIp: '192.168.1.105',
    targetPort: 22,
    protocol: 'TCP',
    severity: 'HIGH',
    time: '12s ago',
  },
  {
    id: 'T3',
    name: 'DNS Tunneling Telemetry Anomaly',
    sourceIp: '192.168.1.200',
    targetPort: 53,
    protocol: 'UDP',
    severity: 'CRITICAL',
    time: '45s ago',
  },
  {
    id: 'T4',
    name: 'RDP Port Scan Attempt',
    sourceIp: '192.168.1.99',
    targetPort: 3389,
    protocol: 'TCP',
    severity: 'HIGH',
    time: '1m ago',
  },
  {
    id: 'T5',
    name: 'Unauthorized S3 Bucket Access',
    sourceIp: '198.51.100.77',
    targetPort: 443,
    protocol: 'HTTPS',
    severity: 'MEDIUM',
    time: '2m ago',
  },
];

export const ThreatRadar: React.FC = () => {
  const [radarAngle, setRadarAngle] = useState(0);
  const [activeBlipIndex, setActiveBlipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRadarAngle((a) => (a + 4) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBlipIndex((idx) => (idx + 1) % LIVE_THREATS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#171f33] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crosshair className="w-5 h-5 text-red-400 animate-pulse" />
          <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
            SOC Anomaly Detection & Threat Radar
          </h3>
        </div>
        <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-red-950/80 border border-red-800 text-red-400 font-semibold">
          5 Threats Normalized & Flagged
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left: Rotating Tactical Radar HUD (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-between p-5 bg-[#0f172a] rounded-xl border border-slate-800 relative overflow-hidden h-full">
          <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-500 mb-2">
            <span className="text-cyan-400 uppercase font-semibold">360° Real-Time Scan</span>
            <span className="px-1.5 py-0.5 rounded bg-black/40 border border-slate-800 text-slate-400 font-mono">Radar Active</span>
          </div>

          {/* Radar Circles */}
          <div className="w-52 h-52 rounded-full border border-cyan-500/20 relative flex items-center justify-center my-auto">
            <div className="w-36 h-36 rounded-full border border-cyan-500/30 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border border-cyan-500/40 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
              </div>
            </div>

            {/* Crosshairs */}
            <div className="absolute w-full h-px bg-cyan-500/20" />
            <div className="absolute h-full w-px bg-cyan-500/20" />

            {/* Rotating Radar Sweep Beam */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: `conic-gradient(from ${radarAngle}deg, rgba(6, 182, 212, 0.4) 0deg, transparent 60deg)`,
              }}
            />

            {/* Threat Blips */}
            <div className="absolute top-10 right-14 flex items-center gap-1 group">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="text-[9px] font-mono text-red-400 bg-black/80 px-1 rounded border border-red-800">
                Struts RCE
              </span>
            </div>

            <div className="absolute bottom-12 left-10 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[9px] font-mono text-amber-300 bg-black/80 px-1 rounded border border-amber-800">
                SSH Scan
              </span>
            </div>

            <div className="absolute top-16 left-12 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-[9px] font-mono text-red-300 bg-black/80 px-1 rounded border border-red-900">
                DNS Tunnel
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between w-full text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800/80">
            <span>Range: 360° Perimeter</span>
            <span className="text-cyan-400 font-semibold">Live Telemetry Synchronized</span>
          </div>
        </div>

        {/* Right: Active Threat Incident Queue (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-2.5">
          <div className="text-xs font-mono text-slate-400 uppercase font-semibold flex items-center justify-between mb-1">
            <span>Live Flagged Threat Queue</span>
            <span className="text-[11px] text-cyan-400">Auto-Correlated by OCSF Parser</span>
          </div>

          {LIVE_THREATS.map((t, idx) => {
            const isHighlight = idx === activeBlipIndex;
            return (
              <div
                key={t.id}
                className={`p-3 rounded-lg border transition-all flex items-center justify-between gap-3 text-xs font-mono ${
                  isHighlight
                    ? 'bg-cyan-950/60 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    : 'bg-[#131b2e] border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <SeverityBadge severity={t.severity} size="sm" />
                  <div>
                    <h4 className="font-bold text-white truncate text-xs">{t.name}</h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Attacker: <strong className="text-amber-300">{t.sourceIp}</strong> ➔ Port{' '}
                      <strong className="text-cyan-300">{t.targetPort}</strong> ({t.protocol})
                    </span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-[10px] text-slate-500 block">{t.time}</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">Normalized ✓</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Target Port Heatmap Bar */}
      <div className="pt-3 border-t border-slate-800/80">
        <div className="text-[11px] font-mono text-slate-400 mb-2 flex items-center justify-between">
          <span>Top Attacked Target Ports (Last 1 Hour)</span>
          <span className="text-slate-500">Auto-Mapped to destination.port</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
          {[
            { port: 'Port 443 (HTTPS)', count: 4820, pct: 42, color: 'bg-cyan-500' },
            { port: 'Port 22 (SSH)', count: 3120, pct: 28, color: 'bg-amber-500' },
            { port: 'Port 8080 (Web)', count: 1640, pct: 15, color: 'bg-red-500' },
            { port: 'Port 3389 (RDP)', count: 980, pct: 9, color: 'bg-purple-500' },
            { port: 'Port 53 (DNS)', count: 650, pct: 6, color: 'bg-emerald-500' },
          ].map((p, i) => (
            <div key={i} className="p-2.5 rounded-lg bg-[#0f172a] border border-slate-800 space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-300 font-semibold truncate">{p.port}</span>
                <span className="text-cyan-300 font-bold">{p.pct}%</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${p.color}`} style={{ width: `${p.pct * 2}%` }} />
              </div>
              <span className="text-[10px] text-slate-500 block">{p.count.toLocaleString()} hits</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
