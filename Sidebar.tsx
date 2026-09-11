import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Radio,
  FileSearch,
  Cpu,
  History,
  Presentation,
  ShieldCheck,
  Zap,
  Crosshair,
  Layers,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

export type NavTab =
  | 'dashboard'
  | 'pipeline-dag'
  | 'add-source'
  | 'live-stream'
  | 'threat-radar'
  | 'log-explorer'
  | 'parser-manager'
  | 'audit-trail'
  | 'demo-walkthrough';

interface Props {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const Sidebar: React.FC<Props> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pipeline-dag', label: 'Stream Architecture', icon: Layers, badge: 'DAG' },
    { id: 'add-source', label: 'Add Log Source', icon: PlusCircle, badge: 'AI Gen' },
    { id: 'live-stream', label: 'Live Ingestion', icon: Radio, live: true },
    { id: 'threat-radar', label: 'Threat Radar & SOC', icon: Crosshair },
    { id: 'log-explorer', label: 'Log Explorer', icon: FileSearch },
    { id: 'parser-manager', label: 'Parser Rules & Versions', icon: Cpu },
    { id: 'audit-trail', label: 'Audit Trail', icon: History },
    { id: 'demo-walkthrough', label: 'Judge Demo Mode', icon: Presentation, highlight: true },
  ];

  const handleSelect = (tab: NavTab) => {
    soundFx.playClick();
    onTabChange(tab);
  };

  return (
    <aside className="w-64 bg-[#0f172a] border-r border-slate-800 flex flex-col justify-between flex-shrink-0 h-[calc(100vh-4rem)] sticky top-16 shadow-2xl">
      <div className="p-4 space-y-2 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
          <span>Navigation Hub</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_#06b6d4]" />
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id as NavTab)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono transition-all duration-300 group ${
                isActive
                  ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/80 shadow-[0_0_20px_rgba(6,182,212,0.3)] font-bold translate-x-1.5'
                  : item.highlight
                  ? 'bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/60 border border-emerald-800/60 hover:border-emerald-500 hover:translate-x-1.5 hover:shadow-[0_0_15px_rgba(34,197,94,0.25)]'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-[#171f33] border border-transparent hover:border-slate-700 hover:translate-x-1.5 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${
                    isActive
                      ? 'text-cyan-400'
                      : item.highlight
                      ? 'text-emerald-400'
                      : 'text-slate-500 group-hover:text-cyan-400'
                  }`}
                />
                <span className="transition-colors group-hover:text-white">{item.label}</span>
              </div>

              {item.live && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}

              {item.badge && (
                <span className="px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 rounded text-[10px] border border-cyan-500/40 group-hover:bg-cyan-500/30 group-hover:border-cyan-400 transition-colors">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom info banner */}
      <div className="p-4 border-t border-slate-800 bg-[#131b2e]/70 m-3 rounded-2xl border border-slate-800/80 shadow-md hover:border-cyan-500/40 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all duration-300">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold mb-1">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>OCSF Standardized</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-tight">
          Unified schema transforms heterogeneous logs into compliant security events without raw data loss.
        </p>
      </div>
    </aside>
  );
};
