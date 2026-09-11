import React from 'react';
import { ArrowRight, Sparkles, Plus, Trash2 } from 'lucide-react';
import { FieldMapping } from '../types';
import { soundFx } from '../utils/audio';

interface Props {
  mappings: FieldMapping[];
  onChange: (mappings: FieldMapping[]) => void;
  readOnly?: boolean;
}

const COMMON_OCSF_TARGETS = [
  'timestamp',
  'event.category',
  'event.type',
  'event.action',
  'event.severity',
  'event.outcome',
  'source.ip',
  'source.port',
  'source.hostname',
  'destination.ip',
  'destination.port',
  'destination.hostname',
  'user.name',
  'user.id',
  'user.email',
  'network.protocol',
  'network.bytes_in',
  'network.bytes_out',
  'network.direction',
  'http.method',
  'http.url',
  'http.status_code',
  'http.user_agent',
  'observer.vendor',
  'observer.product',
];

export const FieldMappingVisualizer: React.FC<Props> = ({ mappings, onChange, readOnly = false }) => {
  const handleUpdate = (index: number, key: keyof FieldMapping, value: any) => {
    const updated = [...mappings];
    updated[index] = { ...updated[index], [key]: value };
    onChange(updated);
  };

  const handleAdd = () => {
    soundFx.playClick();
    onChange([
      ...mappings,
      { source_field: '', target_field: 'unmapped.field', data_type: 'string', confidence: 1.0 },
    ]);
  };

  const handleRemove = (index: number) => {
    soundFx.playClick();
    onChange(mappings.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            Detected Field Mappings ({mappings.length})
          </span>
        </div>
        {!readOnly && (
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-white bg-cyan-950/60 border border-cyan-800 hover:border-cyan-400 hover:bg-cyan-900/80 px-3 py-1.5 rounded-lg transition-all hover:scale-105 hover:shadow-[0_0_10px_rgba(6,182,212,0.3)]"
          >
            <Plus className="w-3.5 h-3.5" /> Add Custom Mapping
          </button>
        )}
      </div>

      <div className="border border-slate-800 rounded-xl overflow-hidden bg-[#131b2e] shadow-xl">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#171f33] border-b border-slate-800 text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-3.5">Source Log Key</th>
              <th className="py-3 px-2 text-center w-8"></th>
              <th className="py-3 px-3.5">OCSF Target Field</th>
              <th className="py-3 px-3.5 w-28">Type</th>
              <th className="py-3 px-3.5 w-24 text-center">Confidence</th>
              {!readOnly && <th className="py-3 px-2 w-10"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {mappings.map((m, idx) => (
              <tr
                key={idx}
                className="hover:bg-[#1e293b]/70 border-l-2 border-l-transparent hover:border-l-cyan-400 transition-all duration-150 group"
              >
                <td className="py-2.5 px-3.5">
                  {readOnly ? (
                    <span className="text-amber-300 font-semibold group-hover:text-amber-200 transition-colors">{m.source_field}</span>
                  ) : (
                    <input
                      type="text"
                      value={m.source_field}
                      onChange={(e) => handleUpdate(idx, 'source_field', e.target.value)}
                      placeholder="e.g. src_ip"
                      className="w-full bg-[#0b1326] border border-slate-700 hover:border-slate-600 focus:border-cyan-400 rounded-lg px-2.5 py-1 text-amber-300 focus:outline-none transition-colors"
                    />
                  )}
                </td>

                <td className="py-2.5 px-2 text-center text-slate-500">
                  <ArrowRight className="w-3.5 h-3.5 mx-auto text-cyan-500 group-hover:translate-x-0.5 transition-transform" />
                </td>

                <td className="py-2.5 px-3.5">
                  {readOnly ? (
                    <span className="text-cyan-300 font-semibold group-hover:text-cyan-200 transition-colors">{m.target_field}</span>
                  ) : (
                    <div className="relative">
                      <input
                        list={`ocsf-targets-${idx}`}
                        type="text"
                        value={m.target_field}
                        onChange={(e) => handleUpdate(idx, 'target_field', e.target.value)}
                        placeholder="e.g. source.ip"
                        className="w-full bg-[#0b1326] border border-slate-700 hover:border-slate-600 focus:border-cyan-400 rounded-lg px-2.5 py-1 text-cyan-300 focus:outline-none transition-colors"
                      />
                      <datalist id={`ocsf-targets-${idx}`}>
                        {COMMON_OCSF_TARGETS.map((t) => (
                          <option key={t} value={t} />
                        ))}
                      </datalist>
                    </div>
                  )}
                </td>

                <td className="py-2.5 px-3.5">
                  {readOnly ? (
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] group-hover:bg-slate-700 transition-colors">
                      {m.data_type}
                    </span>
                  ) : (
                    <select
                      value={m.data_type}
                      onChange={(e) => handleUpdate(idx, 'data_type', e.target.value)}
                      className="bg-[#0b1326] border border-slate-700 hover:border-slate-600 focus:border-cyan-400 rounded-lg px-2 py-1 text-slate-300 text-xs focus:outline-none transition-colors"
                    >
                      <option value="string">string</option>
                      <option value="ip">ip</option>
                      <option value="integer">integer</option>
                      <option value="datetime">datetime</option>
                      <option value="enum">enum</option>
                    </select>
                  )}
                </td>

                <td className="py-2.5 px-3.5 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold transition-transform group-hover:scale-110 ${
                      m.confidence >= 0.9
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 shadow-sm'
                        : 'bg-amber-950 text-amber-400 border border-amber-800 shadow-sm'
                    }`}
                  >
                    {Math.round(m.confidence * 100)}%
                  </span>
                </td>

                {!readOnly && (
                  <td className="py-2.5 px-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      className="text-slate-500 hover:text-red-400 hover:scale-125 p-1 transition-all"
                      title="Delete mapping"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
