import React, { useEffect, useState } from 'react';
import {
  Cpu,
  History,
  RotateCcw,
  Sparkles,
  CheckCircle,
  FileCode,
  AlertCircle,
  Plus,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';
import { FieldMappingVisualizer } from '../components/FieldMappingVisualizer';
import { api } from '../services/api';
import { ParserConfig, ParserVersion } from '../types';

export const ParserManagerPage: React.FC = () => {
  const [parsers, setParsers] = useState<ParserConfig[]>([]);
  const [selectedParser, setSelectedParser] = useState<ParserConfig | null>(null);
  const [versions, setVersions] = useState<ParserVersion[]>([]);
  const [loading, setLoading] = useState(true);

  const [rollbackSuccess, setRollbackSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchParsers = async () => {
    try {
      setLoading(true);
      const data = await api.getParsers();
      setParsers(data);
      if (data.length > 0 && !selectedParser) {
        handleSelectParser(data[0]);
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to load parsers');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectParser = async (p: ParserConfig) => {
    setSelectedParser(p);
    setRollbackSuccess(null);
    try {
      const v = await api.getParserVersions(p.name);
      setVersions(v);
    } catch (e) {
      setVersions([]);
    }
  };

  const handleRollback = async (version: ParserVersion) => {
    if (!selectedParser || !selectedParser.id) return;
    try {
      setErrorMsg(null);
      await api.rollbackParser(selectedParser.id, version.id);
      setRollbackSuccess(`Successfully rolled back ${selectedParser.name} to ${version.version}!`);
      fetchParsers();
    } catch (e: any) {
      setErrorMsg(e.message || 'Rollback failed');
    }
  };

  useEffect(() => {
    fetchParsers();
  }, []);

  return (
    <div className="py-8 px-6 sm:px-10 space-y-8 max-w-[1720px] w-full mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-mono text-white tracking-wide flex items-center gap-3">
            <span>Parser Rulepacks & Version Governance</span>
            <span className="text-xs px-2.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono">
              Immutable Versioning
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Manage OCSF schema normalization rules with automated version snapshots and one-click rollbacks.
          </p>
        </div>
      </div>

      {rollbackSuccess && (
        <div className="p-4 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{rollbackSuccess}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-lg bg-red-950/80 border border-red-800 text-red-300 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Active Parsers List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-[#171f33] border border-slate-800 rounded-xl p-4 shadow-lg">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-400 mb-3 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Active Deployed Parsers ({parsers.length})
            </h3>

            <div className="space-y-2">
              {parsers.map((p) => {
                const isSelected = selectedParser?.name === p.name;
                return (
                  <button
                    key={p.name}
                    onClick={() => handleSelectParser(p)}
                    className={`w-full text-left p-3 rounded-lg border transition-all text-xs font-mono ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                        : 'bg-[#131b2e] border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white truncate">{p.name}</span>
                      <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-semibold">
                        {p.version}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Type: {p.source_type.toUpperCase()}</span>
                      <span>{p.mappings.length} mappings</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Selected Parser Details & Version History (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {selectedParser ? (
            <>
              {/* Active Configuration Overview */}
              <div className="bg-[#171f33] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
                      <span>{selectedParser.name}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs">
                        {selectedParser.version} (Active)
                      </span>
                    </h2>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">
                      {selectedParser.description || 'Standard OCSF mapping rulepack'}
                    </p>
                  </div>
                </div>

                {/* Read-only mapping viewer */}
                <FieldMappingVisualizer
                  mappings={selectedParser.mappings}
                  onChange={() => {}}
                  readOnly={true}
                />
              </div>

              {/* Version History & One-Click Rollback */}
              <div className="bg-[#171f33] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold font-mono text-slate-100 uppercase">
                    Version Snapshots & Rollback
                  </h3>
                </div>
                <p className="text-xs font-mono text-slate-400">
                  If an update introduces unexpected mapping regressions, you can immediately rollback to any previously verified configuration snapshot.
                </p>

                <div className="space-y-2.5">
                  {versions.length === 0 ? (
                    <div className="p-4 rounded-lg bg-[#131b2e] border border-slate-800 text-xs font-mono text-slate-500 text-center">
                      No previous version snapshots recorded. Current version is v1.0.
                    </div>
                  ) : (
                    versions.map((ver, idx) => (
                      <div
                        key={ver.id || idx}
                        className="p-3.5 rounded-lg bg-[#131b2e] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-cyan-300">{ver.version}</span>
                            <span className="text-slate-500 text-[11px]">• {ver.created_at}</span>
                            <span className="text-slate-400 text-[11px]">by {ver.created_by}</span>
                          </div>
                          <p className="text-slate-300 text-xs mt-1">{ver.changelog}</p>
                        </div>

                        <button
                          onClick={() => handleRollback(ver)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-950/60 border border-amber-800 text-amber-300 hover:bg-amber-900/60 text-xs font-mono transition-colors self-start sm:self-auto"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Rollback to {ver.version}</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-[#171f33] border border-slate-800 rounded-xl p-12 text-center text-slate-500 font-mono text-xs">
              Select a parser from the left list to view configuration and versions.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
