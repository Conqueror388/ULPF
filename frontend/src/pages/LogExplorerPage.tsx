import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Layers,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  FileCode,
  Sparkles,
  Flame,
  ShieldAlert,
  UserX,
  Globe,
  RotateCcw,
} from 'lucide-react';
import { SeverityBadge } from '../components/SeverityBadge';
import { RawNormalizedModal } from '../components/RawNormalizedModal';
import { QuickHelpTooltip } from '../components/QuickHelpTooltip';
import { api } from '../services/api';
import { LogItem } from '../types';
import { soundFx } from '../utils/audio';

export const LogExplorerPage: React.FC = () => {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const pageSize = 15;

  // Modal inspection state
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.searchLogs({
        query: searchQuery || undefined,
        severity: severityFilter,
        category: categoryFilter,
        limit: pageSize,
        offset: page * pageSize,
      });
      setLogs(res.items || []);
      setTotal(res.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [severityFilter, categoryFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playClick();
    setPage(0);
    fetchLogs();
  };

  const handleQuickFilter = (query: string, sev: string, cat: string) => {
    soundFx.playClick();
    setSearchQuery(query);
    setSeverityFilter(sev);
    setCategoryFilter(cat);
    setPage(0);
  };

  const handleResetFilters = () => {
    soundFx.playClick();
    setSearchQuery('');
    setSeverityFilter('ALL');
    setCategoryFilter('ALL');
    setPage(0);
  };

  const handleOpenInspector = async (item: LogItem) => {
    soundFx.playClick();
    try {
      const detail = await api.getRawVsNormalized(item.event_id);
      setSelectedEvent({
        ...item,
        ...detail,
      });
    } catch (e) {
      setSelectedEvent(item);
    }
    setIsModalOpen(true);
  };

  const handleExportJson = () => {
    soundFx.playSuccess();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ulpf_logs_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="py-8 px-6 sm:px-10 space-y-6 max-w-[1720px] w-full mx-auto">
      
      {/* Header & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-800 text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest">
              Unified Telemetry Index
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-mono font-semibold">
              {total.toLocaleString()} Events Indexed
            </span>
          </div>
          <h1 className="text-2xl font-bold font-mono text-white tracking-wide mt-1.5 flex items-center gap-3">
            <span>Unified OCSF Log Explorer</span>
            <QuickHelpTooltip
              title="Log Explorer"
              content="Search millions of normalized events across all log sources in one place. Click any row or the eye icon to view the side-by-side Raw vs. Normalized comparison."
            />
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Use the 1-click preset filters below, or type custom queries like <code className="text-cyan-300 font-mono">source.ip:192.168.*</code> or <code className="text-amber-300 font-mono">action:DENY</code>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundFx.playClick();
              fetchLogs();
            }}
            className="p-2.5 bg-[#171f33] hover:bg-[#222a3d] border border-slate-700 hover:border-cyan-500/60 rounded-xl text-slate-300 hover:text-white transition-all duration-200 hover:scale-105 shadow-sm"
            title="Refresh Logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-2 px-4 py-2 bg-[#171f33] hover:bg-[#222a3d] border border-slate-700 hover:border-cyan-500/60 text-slate-200 hover:text-white rounded-xl text-xs font-mono transition-all duration-200 hover:scale-105 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* User-Friendly Quick Filter Chips */}
      <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center gap-2.5 shadow-md">
        <span className="text-xs font-mono text-slate-400 font-semibold uppercase flex items-center gap-1.5 mr-2">
          ⚡ 1-Click Filters:
        </span>

        <button
          onClick={() => handleQuickFilter('', 'CRITICAL', 'ALL')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/70 hover:bg-red-900/80 border border-red-800 text-red-300 text-xs font-mono transition-all hover:scale-105"
        >
          <Flame className="w-3.5 h-3.5 text-red-400" />
          <span>Critical Threats</span>
        </button>

        <button
          onClick={() => handleQuickFilter('DENY', 'ALL', 'network')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/70 hover:bg-amber-900/80 border border-amber-800 text-amber-300 text-xs font-mono transition-all hover:scale-105"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>Blocked Network Traffic</span>
        </button>

        <button
          onClick={() => handleQuickFilter('FAILED_LOGIN', 'ALL', 'authentication')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/70 hover:bg-purple-900/80 border border-purple-800 text-purple-300 text-xs font-mono transition-all hover:scale-105"
        >
          <UserX className="w-3.5 h-3.5 text-purple-400" />
          <span>Failed User Logins</span>
        </button>

        <button
          onClick={() => handleQuickFilter('401', 'ALL', 'web')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-800 text-cyan-300 text-xs font-mono transition-all hover:scale-105"
        >
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span>HTTP 401 Web Errors</span>
        </button>

        <button
          onClick={handleResetFilters}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono ml-auto transition-all hover:scale-105"
        >
          <RotateCcw className="w-3 h-3 text-slate-400" />
          <span>Reset Filters</span>
        </button>
      </div>

      {/* Query Bar & Faceted Filter Controls */}
      <div className="bg-[#171f33] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl space-y-4 transition-colors duration-300">
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords, IP address, user, or action (e.g. 192.168.1.10, DENY, administrator)..."
              className="w-full bg-[#0b1326] border border-slate-700 hover:border-slate-600 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black font-bold font-mono text-xs rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.45)] hover:scale-105 transition-all duration-200"
          >
            Search Logs
          </button>
        </form>

        {/* Facet Filter Chips */}
        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-800/80 text-xs font-mono">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-400 text-[11px]">Severity:</span>
            <div className="flex items-center gap-1.5">
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => {
                    soundFx.playClick();
                    setSeverityFilter(sev);
                    setPage(0);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] border transition-all duration-200 hover:scale-105 ${
                    severityFilter === sev
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                      : 'bg-[#0b1326] border-slate-800 text-slate-400 hover:text-white hover:border-slate-600'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">Category:</span>
            <div className="flex items-center gap-1.5">
              {['ALL', 'network', 'authentication', 'web', 'security_alert'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    soundFx.playClick();
                    setCategoryFilter(cat);
                    setPage(0);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] border transition-all duration-200 hover:scale-105 ${
                    categoryFilter === cat
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                      : 'bg-[#0b1326] border-slate-800 text-slate-400 hover:text-white hover:border-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Logs Table with Enhanced Hover Rows */}
      <div className="bg-[#171f33] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#131b2e] border-b border-slate-800 text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-3">Event Action</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3">Source IP</th>
                <th className="py-3.5 px-3">Destination IP</th>
                <th className="py-3.5 px-3">User</th>
                <th className="py-3.5 px-3">Severity</th>
                <th className="py-3.5 px-4 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400 font-mono">
                    <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
                    Searching normalized events...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400 font-sans">
                    No matching logs found. Try clicking <button onClick={handleResetFilters} className="text-cyan-400 underline font-mono">Reset Filters</button> to see all events.
                  </td>
                </tr>
              ) : (
                logs.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => handleOpenInspector(item)}
                    className="hover:bg-[#1e293b]/80 border-l-2 border-l-transparent hover:border-l-cyan-400 hover:shadow-[inset_0_0_20px_rgba(6,182,212,0.06)] cursor-pointer transition-all duration-200 group"
                  >
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap group-hover:text-slate-200 transition-colors">
                      {item.timestamp}
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {item.action}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 text-[11px] group-hover:border-slate-700 transition-colors">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-cyan-300 font-mono group-hover:text-cyan-200 transition-colors">
                      {item.source_ip}
                      {item.source_port ? `:${item.source_port}` : ''}
                    </td>

                    <td className="py-3 px-3 text-cyan-300 font-mono group-hover:text-cyan-200 transition-colors">
                      {item.dest_ip}
                      {item.dest_port ? `:${item.dest_port}` : ''}
                    </td>

                    <td className="py-3 px-3 text-slate-300 group-hover:text-white transition-colors">
                      {item.user_name}
                    </td>

                    <td className="py-3 px-3">
                      <SeverityBadge severity={item.severity} size="sm" />
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenInspector(item);
                        }}
                        className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black group-hover:border-cyan-400 group-hover:shadow-[0_0_10px_rgba(6,182,212,0.4)] transition-all duration-200"
                        title="View Raw vs Normalized Diff"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-[#131b2e] flex items-center justify-between text-xs font-mono text-slate-400">
          <span>
            Showing <strong className="text-white">{logs.length}</strong> of{' '}
            <strong className="text-white">{total}</strong> events
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundFx.playClick();
                setPage((p) => Math.max(0, p - 1));
              }}
              disabled={page === 0}
              className="p-1.5 rounded-lg bg-[#171f33] border border-slate-700 disabled:opacity-40 hover:bg-slate-800 hover:border-cyan-500/50 hover:text-white text-slate-300 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-slate-300">
              Page {page + 1} of {Math.max(1, Math.ceil(total / pageSize))}
            </span>
            <button
              onClick={() => {
                soundFx.playClick();
                setPage((p) => p + 1);
              }}
              disabled={(page + 1) * pageSize >= total}
              className="p-1.5 rounded-lg bg-[#171f33] border border-slate-700 disabled:opacity-40 hover:bg-slate-800 hover:border-cyan-500/50 hover:text-white text-slate-300 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
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
