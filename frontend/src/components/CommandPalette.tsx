import React, { useEffect, useState } from 'react';
import {
  Search,
  LayoutDashboard,
  PlusCircle,
  Radio,
  FileSearch,
  Cpu,
  History,
  Presentation,
  Volume2,
  VolumeX,
  FileCode,
  X,
  Terminal,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: any) => void;
}

export const CommandPalette: React.FC<Props> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onClose(); // toggle
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const actions = [
    {
      id: 'dash',
      title: 'Go to Executive Dashboard',
      category: 'Navigation',
      icon: LayoutDashboard,
      run: () => onNavigate('dashboard'),
    },
    {
      id: 'add',
      title: 'Add New Log Source & AI Parser Generator',
      category: 'Navigation',
      icon: PlusCircle,
      run: () => onNavigate('add-source'),
    },
    {
      id: 'stream',
      title: 'Open Real-Time Live Ingestion Stream',
      category: 'Navigation',
      icon: Radio,
      run: () => onNavigate('live-stream'),
    },
    {
      id: 'explorer',
      title: 'Open Unified OCSF Log Explorer',
      category: 'Navigation',
      icon: FileSearch,
      run: () => onNavigate('log-explorer'),
    },
    {
      id: 'parsers',
      title: 'Parser Rulepacks & Version Rollback',
      category: 'Navigation',
      icon: Cpu,
      run: () => onNavigate('parser-manager'),
    },
    {
      id: 'audit',
      title: 'View SOC Compliance Audit Trail',
      category: 'Navigation',
      icon: History,
      run: () => onNavigate('audit-trail'),
    },
    {
      id: 'demo',
      title: 'Launch SIH26156 Judge Interactive Demo Mode',
      category: 'Presentation',
      icon: Presentation,
      run: () => onNavigate('demo-walkthrough'),
    },
    {
      id: 'sound',
      title: soundEnabled ? 'Mute Tactical Sound FX' : 'Enable Tactical Sound FX',
      category: 'Audio',
      icon: soundEnabled ? VolumeX : Volume2,
      run: () => {
        const next = !soundEnabled;
        setSoundEnabled(next);
        soundFx.enabled = next;
        if (next) soundFx.playSuccess();
      },
    },
  ];

  const filtered = actions.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase()) || a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-100">
      <div className="bg-[#0f172a] border border-cyan-500/50 rounded-2xl w-full max-w-2xl shadow-[0_0_40px_rgba(6,182,212,0.3)] overflow-hidden">
        
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-[#171f33]">
          <Search className="w-5 h-5 text-cyan-400 mr-3 flex-shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or jump to page (e.g. Ingest, Parser, Demo, Audio)..."
            className="w-full bg-transparent text-sm font-mono text-white placeholder-slate-500 focus:outline-none"
          />
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-2 max-h-80 overflow-y-auto space-y-1 font-mono text-xs">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-slate-500">No matching commands found.</div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.run();
                    soundFx.playClick();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-cyan-950/60 border border-transparent hover:border-cyan-500/40 text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-[#131b2e] border border-slate-800 text-cyan-400 group-hover:border-cyan-500/60">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-slate-200 group-hover:text-white font-semibold">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 px-2 py-0.5 rounded bg-black/40 border border-slate-900">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-[#131b2e] border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Use <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">↓</kbd> to navigate</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">ESC</kbd> to close</span>
        </div>

      </div>
    </div>
  );
};
