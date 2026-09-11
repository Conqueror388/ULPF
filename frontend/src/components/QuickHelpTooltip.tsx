import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface Props {
  content: string;
  title?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const QuickHelpTooltip: React.FC<Props> = ({
  content,
  title,
  position = 'top',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const posClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <button
        type="button"
        className="text-slate-400 hover:text-cyan-300 p-0.5 rounded-full hover:bg-cyan-950/60 transition-colors focus:outline-none"
        aria-label="More information"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {isVisible && (
        <div
          className={`absolute z-50 w-64 p-3 bg-[#0f172a] border border-cyan-500/50 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.8)] text-left text-xs font-sans text-slate-200 pointer-events-none animate-in fade-in zoom-in-95 duration-150 ${posClasses[position]}`}
        >
          {title && (
            <div className="font-bold text-cyan-400 font-mono text-[11px] uppercase tracking-wider mb-1">
              {title}
            </div>
          )}
          <p className="text-[11px] leading-relaxed text-slate-300">{content}</p>
          <div className="mt-1.5 pt-1.5 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
            ULPF Helper
          </div>
        </div>
      )}
    </div>
  );
};
