import React, { useEffect, useState } from 'react';
import { History, ShieldCheck, RefreshCw, FileText, CheckCircle2, RotateCcw, PlusCircle } from 'lucide-react';
import { api } from '../services/api';
import { AuditLog } from '../types';

export const AuditTrailPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getAuditLogs();
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const getActionBadge = (action: string) => {
    const a = action.toUpperCase();
    if (a === 'CREATED') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-mono text-[11px] font-semibold">
          <PlusCircle className="w-3 h-3" /> CREATED
        </span>
      );
    } else if (a === 'UPDATED') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-400 font-mono text-[11px] font-semibold">
          <CheckCircle2 className="w-3 h-3" /> UPDATED
        </span>
      );
    } else if (a === 'ROLLED_BACK') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800 text-amber-400 font-mono text-[11px] font-semibold">
          <RotateCcw className="w-3 h-3" /> ROLLED_BACK
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px]">
        {a}
      </span>
    );
  };

  return (
    <div className="py-8 px-6 sm:px-10 space-y-6 max-w-[1720px] w-full mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-mono text-white tracking-wide flex items-center gap-3">
            <span>SOC Compliance & Governance Audit Trail</span>
            <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Immutable Audit Log
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Cryptographic ledger tracking all parser creations, modifications, version bumps, and rollbacks.
          </p>
        </div>

        <button
          onClick={fetchAuditLogs}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#171f33] hover:bg-[#222a3d] border border-slate-700 text-slate-300 rounded-lg text-xs font-mono transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Refresh Audit Logs</span>
        </button>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-[#171f33] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#131b2e] border-b border-slate-800 text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Parser Target</th>
                <th className="py-3 px-3">Version</th>
                <th className="py-3 px-3">Operator</th>
                <th className="py-3 px-4">Details / Diff Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-mono">
                    <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mx-auto mb-2" />
                    Loading audit records...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-mono">
                    No audit records recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {item.timestamp}
                    </td>
                    <td className="py-3 px-3">
                      {getActionBadge(item.action)}
                    </td>
                    <td className="py-3 px-3 font-semibold text-white">
                      {item.parser_name}
                    </td>
                    <td className="py-3 px-3 text-cyan-400 font-semibold">
                      {item.version}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {item.performed_by}
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-md">
                      {item.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
