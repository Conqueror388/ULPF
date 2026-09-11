import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  variant?: 'cyan' | 'green' | 'red' | 'amber' | 'default';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
}) => {
  const accentDot = {
    cyan: 'bg-cyan-400 live-pulse-cyan',
    green: 'bg-emerald-400 live-pulse-emerald',
    red: 'bg-rose-400 live-pulse-rose',
    amber: 'bg-amber-400',
    default: 'bg-slate-400',
  };

  const cornerColor = {
    cyan: 'border-cyan-400/80',
    green: 'border-emerald-400/80',
    red: 'border-rose-400/80',
    amber: 'border-amber-400/80',
    default: 'border-slate-500/80',
  };

  const badgeColor = {
    cyan: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/80 shadow-[0_0_12px_rgba(6,182,212,0.25)]',
    green: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/80 shadow-[0_0_12px_rgba(16,185,129,0.25)]',
    red: 'text-rose-400 bg-rose-950/60 border-rose-800/80 shadow-[0_0_12px_rgba(244,63,94,0.25)]',
    amber: 'text-amber-400 bg-amber-950/60 border-amber-800/80 shadow-[0_0_12px_rgba(245,158,11,0.25)]',
    default: 'text-slate-400 bg-slate-900/80 border-slate-800',
  };

  const glowBg = {
    cyan: 'from-cyan-500/10 via-transparent to-transparent',
    green: 'from-emerald-500/10 via-transparent to-transparent',
    red: 'from-rose-500/10 via-transparent to-transparent',
    amber: 'from-amber-500/10 via-transparent to-transparent',
    default: 'from-slate-500/5 via-transparent to-transparent',
  };

  return (
    <div className="relative group bg-[#0f1422] border border-slate-800/90 hover:border-slate-700 rounded-xl p-4 transition-all duration-200 flex flex-col justify-between h-full overflow-hidden shadow-hud hover:-translate-y-0.5">
      {/* Tactical Corner Reticles */}
      <div className={`absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 ${cornerColor[variant]} transition-colors group-hover:scale-110`} />
      <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 ${cornerColor[variant]} transition-colors group-hover:scale-110`} />

      {/* Ambient Radial Back-Glow */}
      <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gradient-to-br ${glowBg[variant]} blur-xl pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity`} />

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${accentDot[variant]}`} />
          <span className="text-[11px] font-mono tracking-wider uppercase text-slate-400 group-hover:text-slate-300 transition-colors">
            {title}
          </span>
        </div>
        <div className={`p-1.5 rounded-lg border transition-transform duration-300 group-hover:scale-110 ${badgeColor[variant]}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="mt-3.5 relative z-10">
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold font-mono text-white tracking-tight group-hover:text-cyan-200 transition-colors">
            {value}
          </span>
          {trend && (
            <span className="text-[10px] font-mono font-medium text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/50">
              {trend}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="mt-1 text-[11px] text-slate-400 font-mono tracking-tight">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
