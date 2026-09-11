import React from 'react';

interface Props {
  severity?: string;
  size?: 'sm' | 'md';
}

export const SeverityBadge: React.FC<Props> = ({ severity = 'LOW', size = 'md' }) => {
  const s = severity.toUpperCase();

  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';

  if (s === 'CRITICAL') {
    colorClasses = 'bg-red-950/80 text-red-400 border-red-800 shadow-[0_0_8px_rgba(239,68,68,0.3)] animate-pulse';
  } else if (s === 'HIGH') {
    colorClasses = 'bg-amber-950/80 text-amber-400 border-amber-800 shadow-[0_0_6px_rgba(245,158,11,0.25)]';
  } else if (s === 'MEDIUM' || s === 'MED') {
    colorClasses = 'bg-cyan-950/80 text-cyan-400 border-cyan-800';
  } else if (s === 'LOW' || s === 'INFORMATIONAL' || s === 'INFO') {
    colorClasses = 'bg-emerald-950/80 text-emerald-400 border-emerald-800';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span className={`inline-flex items-center gap-1 rounded font-mono border ${sizeClasses} ${colorClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {s}
    </span>
  );
};
