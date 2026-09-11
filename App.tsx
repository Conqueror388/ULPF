import React, { useState } from 'react';
import { Navbar, CyberTheme, NavTab } from './components/Navbar';
import { CommandPalette } from './components/CommandPalette';
import { DashboardPage } from './pages/DashboardPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { AddSourcePage } from './pages/AddSourcePage';
import { LiveIngestionPage } from './pages/LiveIngestionPage';
import { ThreatRadarPage } from './pages/ThreatRadarPage';
import { LogExplorerPage } from './pages/LogExplorerPage';
import { ParserManagerPage } from './pages/ParserManagerPage';
import { AuditTrailPage } from './pages/AuditTrailPage';
import { InteractiveDemoPage } from './pages/InteractiveDemoPage';

const PAGE_BACKGROUNDS: Record<NavTab, string> = {
  dashboard: 'bg-dashboard-mesh',
  'pipeline-dag': 'bg-architecture-mesh',
  'add-source': 'bg-ai-mesh',
  'live-stream': 'bg-stream-mesh',
  'threat-radar': 'bg-threat-mesh',
  'log-explorer': 'bg-explorer-mesh',
  'parser-manager': 'bg-explorer-mesh',
  'audit-trail': 'bg-demo-mesh',
  'demo-walkthrough': 'bg-demo-mesh',
};

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [theme, setTheme] = useState<CyberTheme>('cyan');

  const currentBgClass = PAGE_BACKGROUNDS[activeTab] || 'bg-dashboard-mesh';

  return (
    <div className={`min-h-screen ${currentBgClass} theme-${theme} text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black transition-all duration-500`}>
      
      {/* Professional Horizontal Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        systemStatus="ONLINE"
        throughput={14250}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        currentTheme={theme}
        onThemeChange={setTheme}
      />

      {/* Main Full-Width Content Area (No vertical sidebar) */}
      <main className={`flex-1 overflow-y-auto ${currentBgClass} pb-16 transition-colors duration-500 w-full`}>
        {activeTab === 'dashboard' && <DashboardPage onNavigate={setActiveTab} />}
        {activeTab === 'pipeline-dag' && <ArchitecturePage onNavigate={setActiveTab} />}
        {activeTab === 'add-source' && <AddSourcePage onSuccess={setActiveTab} />}
        {activeTab === 'live-stream' && <LiveIngestionPage />}
        {activeTab === 'threat-radar' && <ThreatRadarPage onNavigate={setActiveTab} />}
        {activeTab === 'log-explorer' && <LogExplorerPage />}
        {activeTab === 'parser-manager' && <ParserManagerPage />}
        {activeTab === 'audit-trail' && <AuditTrailPage />}
        {activeTab === 'demo-walkthrough' && <InteractiveDemoPage onNavigate={setActiveTab} />}
      </main>

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(tab) => {
          setActiveTab(tab as NavTab);
          setIsCommandPaletteOpen(false);
        }}
      />
    </div>
  );
}

export default App;
