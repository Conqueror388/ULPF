import React, { useState } from 'react';
import {
  Shield,
  Search,
  Volume2,
  VolumeX,
  BookOpen,
  ExternalLink,
  Palette,
  LayoutDashboard,
  Layers,
  PlusCircle,
  Radio,
  Crosshair,
  FileText,
  Settings,
  History,
  Award,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

export type CyberTheme = 'cyan' | 'matrix' | 'crimson' | 'synth';

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
  systemStatus?: string;
  throughput?: number;
  onOpenCommandPalette: () => void;
  currentTheme?: CyberTheme;
  onThemeChange?: (theme: CyberTheme) => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  onTabChange,
  systemStatus = 'ONLINE',
  throughput = 14250,
  onOpenCommandPalette,
  currentTheme = 'cyan',
  onThemeChange,
}) => {
  const [soundOn, setSoundOn] = useState(soundFx.enabled);
  const [showThemes, setShowThemes] = useState(false);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    soundFx.enabled = next;
    if (next) soundFx.playSuccess();
  };

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: 'pipeline-dag', label: 'Architecture', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'add-source', label: 'Add Source', icon: <PlusCircle className="w-3.5 h-3.5" />, badge: 'AI' },
    { id: 'live-stream', label: 'Live Ingest', icon: <Radio className="w-3.5 h-3.5" />, badge: 'Live' },
    { id: 'threat-radar', label: 'Threat Radar & 3D', icon: <Crosshair className="w-3.5 h-3.5" /> },
    { id: 'log-explorer', label: 'Log Explorer', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'parser-manager', label: 'Parser Rules', icon: <Settings className="w-3.5 h-3.5" /> },
    { id: 'audit-trail', label: 'Audit Trail', icon: <History className="w-3.5 h-3.5" /> },
    { id: 'demo-walkthrough', label: 'Demo Mode', icon: <Award className="w-3.5 h-3.5" />, badge: 'Judge' },
  ];

  const themes: { id: CyberTheme; name: string; color: string }[] = [
    { id: 'cyan', name: 'Cyber Blue', color: 'bg-cyan-500' },
    { id: 'matrix', name: 'Emerald', color: 'bg-emerald-500' },
    { id: 'crimson', name: 'Crimson', color: 'bg-rose-500' },
    { id: 'synth', name: 'Amethyst', color: 'bg-purple-500' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#090d16]/95 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-[1720px] mx-auto px-6 h-14 flex items-center justify-between gap-4">
        
        {/* Left: Clean Professional Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-950">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-base tracking-widest font-cyber">ULPF</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                OCSF v1.1
              </span>
            </div>
          </div>
        </div>

        {/* Center: Integrated Clean Horizontal Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  soundFx.playClick();
                  onTabChange(item.id);
                }}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-tech tracking-wider uppercase transition-all ${
                  isActive
                    ? 'bg-slate-800/90 text-white font-bold shadow-sm border border-slate-700/80'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 font-medium'
                }`}
              >
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                )}
                <span className={isActive ? 'text-cyan-400' : 'text-slate-500'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                      isActive
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Controls, Search, Status & Profile */}
        <div className="flex items-center gap-2.5">
          
          {/* Quick Search Bar Trigger */}
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenCommandPalette();
            }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-400 transition-all shadow-inner"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden xl:inline text-[11px]">Search commands...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-400 font-mono">
              Ctrl+K
            </kbd>
          </button>

          {/* Real-Time Tactical Status Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-950/90 border border-slate-800 text-[11px] font-mono text-slate-300 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 live-pulse-emerald" />
            <span className="text-emerald-400 font-medium">14.2k eps</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-400 text-[10px]">1.2ms</span>
          </div>

          {/* API Docs Link */}
          <a
            href={import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/docs` : (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? '/docs' : 'http://localhost:8000/docs')}
            target="_blank"
            rel="noreferrer"
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            title="FastAPI Swagger API Documentation"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>Docs</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>

          {/* Palette Selector */}
          <div className="relative">
            <button
              onClick={() => {
                soundFx.playClick();
                setShowThemes(!showThemes);
              }}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
              title="Change theme accent"
            >
              <Palette className="w-4 h-4" />
            </button>

            {showThemes && (
              <div className="absolute right-0 mt-2 w-40 bg-[#0f1422] border border-slate-800 rounded-xl p-1.5 shadow-xl z-50 animate-in fade-in space-y-1 text-xs">
                <div className="px-2 py-1 text-[10px] text-slate-500 uppercase font-semibold">
                  Theme Accent
                </div>
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      soundFx.playClick();
                      if (onThemeChange) onThemeChange(t.id);
                      setShowThemes(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all ${
                      currentTheme === t.id ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:bg-slate-800/60'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${t.color}`} />
                    <span>{t.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`p-1.5 rounded-lg transition-all ${
              soundOn ? 'text-cyan-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-800'
            }`}
            title={soundOn ? 'Audio FX Enabled' : 'Audio FX Muted'}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Operator Badge */}
          <div className="flex items-center gap-1.5 pl-1">
            <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-200">
              OP
            </div>
          </div>

        </div>

      </div>

      {/* Mobile Horizontal Navigation Tab Bar (For smaller screens) */}
      <div className="lg:hidden bg-[#0b101c] border-t border-slate-800/60 px-4 py-1.5 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 min-w-max">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  soundFx.playClick();
                  onTabChange(item.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
