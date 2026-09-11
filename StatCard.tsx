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
    cyan: 'bg-cyan-400',
    green: 'bg-emerald-400',
    red: 'bg-rose-400',
    amber: 'bg-amber-400',
    default: 'bg-slate-400',
  };

  const badgeColor = {
    cyan: 'text-cyan-400 bg-cyan-950/50 border-cyan-900/50',
    green: 'text-emerald-400 bg-emerald-950/50 border-emerald-900/50',
    red: 'text-rose-400 bg-rose-950/50 border-rose-900/50',
    amber: 'text-amber-400 bg-amber-950/50 border-amber-900/50',
    default: 'text-slate-400 bg-slate-900 border-slate-800',
  };

  return (
    <div className="bg-[#0f1422] border border-slate-800/80 hover:border-slate-700 rounded-xl p-4 transition-all duration-150 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${accentDot[variant]}`} />
          <span className="text-xs font-medium text-slate-400">
            {title}
          </span>
        </div>
        <div className={`p-1.5 rounded-lg border ${badgeColor[variant]}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold font-mono text-white tracking-tight">{value}</span>
          {trend && (
            <span className="text-[11px] font-mono font-medium text-emerald-400">{trend}</span>
          )}
        </div>
        {subtitle && (
          <p className="mt-0.5 text-[11px] text-slate-500 font-sans">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
