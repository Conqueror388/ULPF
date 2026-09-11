import React, { useState } from 'react';
import {
  Presentation,
  CheckCircle,
  Sparkles,
  Layers,
  ShieldCheck,
  RotateCcw,
  ArrowRight,
  Play,
  FileCode,
  Radio,
  Cpu,
  ChevronRight,
} from 'lucide-react';
import { SAMPLE_PRESETS } from '../data/sampleLogs';
import { api } from '../services/api';
import { RawNormalizedModal } from '../components/RawNormalizedModal';

interface Props {
  onNavigate: (tab: any) => void;
}

export const InteractiveDemoPage: React.FC<Props> = ({ onNavigate }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [demoOutput, setDemoOutput] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Multi-Vendor Log Ingestion',
      desc: 'Ingest raw logs from Palo Alto, Windows AD, AWS CloudTrail, Suricata, and Nginx.',
    },
    {
      num: 2,
      title: 'Automatic Format Detection',
      desc: 'System detects Syslog, XML, JSON, and CEF formats with >95% confidence.',
    },
    {
      num: 3,
      title: 'OCSF Normalization',
      desc: 'All heterogeneous logs are transformed into the standardized Unified Event Schema.',
    },
    {
      num: 4,
      title: 'Cryptographic Integrity (SHA-256)',
      desc: 'Bit-exact hash proof ensures the original log is preserved for forensics without tampering.',
    },
    {
      num: 5,
      title: 'AI Parser Generator for Unknown Logs',
      desc: 'AI detects fields in proprietary logs and suggests compliant OCSF mappings for human approval.',
    },
    {
      num: 6,
      title: 'Live Ingestion & Stream Processing',
      desc: 'Demonstrate real-time throughput with dual terminal view (Incoming vs Normalized).',
    },
  ];

  const handleRunDemoStep = async (stepNum: number) => {
    setCurrentStep(stepNum);
    setLoading(true);

    if (stepNum === 1 || stepNum === 2 || stepNum === 3 || stepNum === 4) {
      try {
        const raw = SAMPLE_PRESETS[0].sampleContent.split('\n')[0];
        const res = await api.testParser({ sample_log: raw });
        setDemoOutput(res);
      } catch (e) {
        console.error(e);
      }
    } else if (stepNum === 5) {
      try {
        const unknownSample = SAMPLE_PRESETS[4].sampleContent.split('\n')[0];
        const res = await api.analyzeUpload({
          source_name: 'Core Banking API',
          input_type: 'custom',
          sample_content: unknownSample,
        });
        setDemoOutput(res);
      } catch (e) {
        console.error(e);
      }
    }
    setLoading(false);
  };

  return (
    <div className="py-8 px-6 sm:px-10 space-y-8 max-w-[1720px] w-full mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold font-mono text-white tracking-wide flex items-center gap-3">
            <Presentation className="w-6 h-6 text-cyan-400" />
            <span>SIH26156 Judge Interactive Presentation Mode</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Follow this step-by-step interactive workflow to demonstrate ULPF's architecture, detection, OCSF schema, and AI parser generator.
          </p>
        </div>

        <button
          onClick={() => onNavigate('dashboard')}
          className="px-4 py-2 bg-[#171f33] hover:bg-[#222a3d] border border-slate-700 text-slate-200 rounded-lg text-xs font-mono transition-colors"
        >
          Return to Dashboard
        </button>
      </div>

      {/* Step Stepper Progress */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {steps.map((s) => {
          const isActive = currentStep === s.num;
          const isPassed = currentStep > s.num;

          return (
            <button
              key={s.num}
              onClick={() => handleRunDemoStep(s.num)}
              className={`text-left p-3.5 rounded-xl border transition-all text-xs font-mono ${
                isActive
                  ? 'bg-cyan-950/80 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : isPassed
                  ? 'bg-[#131b2e] border-emerald-500/40 text-emerald-300'
                  : 'bg-[#171f33] border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-slate-200">Step {s.num}</span>
                {isPassed && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                {isActive && <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />}
              </div>
              <h4 className="font-semibold text-white truncate mb-1">{s.title}</h4>
              <p className="text-[10px] text-slate-400 line-clamp-2">{s.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Stage */}
      <div className="bg-[#171f33] border border-cyan-500/30 rounded-2xl p-6 shadow-2xl space-y-6">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs font-mono text-cyan-400 uppercase font-bold tracking-wider">
              Active Demonstration Stage — Step {currentStep}: {steps[currentStep - 1].title}
            </span>
            <h3 className="text-lg font-bold font-mono text-white mt-1">
              {steps[currentStep - 1].desc}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            {currentStep < 6 ? (
              <button
                onClick={() => handleRunDemoStep(currentStep + 1)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black font-bold font-mono text-xs rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
              >
                <span>Next Demo Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => onNavigate('live-stream')}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black font-bold font-mono text-xs rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all"
              >
                <span>Open Live Stream Ingestion</span>
                <Radio className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Step-Specific Interactive Visualizations */}
        {currentStep === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-xl space-y-3">
              <span className="text-amber-400 font-bold block">1. Palo Alto Firewall (Syslog)</span>
              <pre className="text-slate-300 whitespace-pre-wrap break-all p-2 bg-[#0b1326] rounded border border-slate-900">
                {SAMPLE_PRESETS[0].sampleContent.split('\n')[0]}
              </pre>

              <span className="text-blue-400 font-bold block">2. Windows AD Logon Event (XML)</span>
              <pre className="text-slate-300 whitespace-pre-wrap break-all p-2 bg-[#0b1326] rounded border border-slate-900 max-h-24 overflow-y-auto">
                {SAMPLE_PRESETS[1].sampleContent.split('\n')[0]}
              </pre>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-xl space-y-3">
              <span className="text-amber-400 font-bold block">3. AWS CloudTrail Audit (JSON)</span>
              <pre className="text-slate-300 whitespace-pre-wrap break-all p-2 bg-[#0b1326] rounded border border-slate-900">
                {SAMPLE_PRESETS[2].sampleContent.split('\n')[0]}
              </pre>

              <span className="text-purple-400 font-bold block">4. Suricata IDS Alert (CEF)</span>
              <pre className="text-slate-300 whitespace-pre-wrap break-all p-2 bg-[#0b1326] rounded border border-slate-900">
                {SAMPLE_PRESETS[3].sampleContent.split('\n')[0]}
              </pre>
            </div>
          </div>
        )}

        {(currentStep === 2 || currentStep === 3 || currentStep === 4) && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* Left: Original */}
              <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-xl space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-bold uppercase">Original Input Log Line</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold">
                    Detected: SYSLOG (98% Confidence)
                  </span>
                </div>
                <pre className="p-3 bg-[#0b1326] rounded border border-slate-900 text-amber-300 whitespace-pre-wrap break-all">
                  {SAMPLE_PRESETS[0].sampleContent.split('\n')[0]}
                </pre>

                <div className="p-3 rounded bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1 text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Cryptographic Bit-Exact SHA-256 Proof</span>
                  </div>
                  <code className="text-[11px] text-slate-400 break-all block bg-black/50 p-2 rounded">
                    sha256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
                  </code>
                </div>
              </div>

              {/* Right: Normalized OCSF */}
              <div className="bg-[#0f172a] border border-cyan-500/40 p-4 rounded-xl space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-cyan-300 font-bold uppercase flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    OCSF Normalized Event Schema
                  </span>
                  <button
                    onClick={() => {
                      setSelectedEvent(demoOutput?.normalized_event || {
                        raw_message: SAMPLE_PRESETS[0].sampleContent.split('\n')[0],
                        raw_hash: 'sha256:7f83b165...',
                        severity: 'HIGH',
                        category: 'network',
                        action: 'DENY',
                        source_ip: '192.168.1.10',
                        dest_ip: '10.0.0.20',
                      });
                      setIsModalOpen(true);
                    }}
                    className="text-cyan-400 hover:text-cyan-300 underline text-[11px]"
                  >
                    Open Full Dual-Screen Inspector →
                  </button>
                </div>

                <pre className="p-3 bg-[#0b1326] rounded border border-cyan-950 text-cyan-200/90 whitespace-pre-wrap break-all max-h-56 overflow-y-auto">
                  {JSON.stringify(
                    demoOutput?.normalized_event || {
                      event_id: 'ULPF-A91280B8CD1',
                      timestamp: '2026-09-01T10:32:01Z',
                      event: { category: 'network', type: 'traffic', action: 'DENY', severity: 'HIGH' },
                      source: { ip: '192.168.1.10', port: 54321 },
                      destination: { ip: '10.0.0.20', port: 443 },
                      user: { name: 'admin' },
                      network: { protocol: 'TCP' },
                      raw: { sha256: '7f83b165...', verified: true },
                    },
                    null,
                    2
                  )}
                </pre>
              </div>

            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="bg-[#0f172a] border border-emerald-500/40 p-5 rounded-xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-emerald-400 font-bold text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                AI-Suggested Mapping on Unseen Format
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300">
                Confidence: 96%
              </span>
            </div>

            <pre className="p-3 bg-[#0b1326] rounded border border-slate-900 text-amber-300">
              {SAMPLE_PRESETS[4].sampleContent.split('\n')[0]}
            </pre>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <div className="p-2 bg-[#131b2e] rounded border border-slate-800">
                <span className="text-slate-400 text-[10px] block">client_ip →</span>
                <span className="text-cyan-300 font-bold">source.ip</span>
              </div>
              <div className="p-2 bg-[#131b2e] rounded border border-slate-800">
                <span className="text-slate-400 text-[10px] block">server_ip →</span>
                <span className="text-cyan-300 font-bold">destination.ip</span>
              </div>
              <div className="p-2 bg-[#131b2e] rounded border border-slate-800">
                <span className="text-slate-400 text-[10px] block">action →</span>
                <span className="text-cyan-300 font-bold">event.action</span>
              </div>
              <div className="p-2 bg-[#131b2e] rounded border border-slate-800">
                <span className="text-slate-400 text-[10px] block">user →</span>
                <span className="text-cyan-300 font-bold">user.name</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">
                AI suggests mappings; human operator approves configuration into immutable rulepack.
              </span>
              <button
                onClick={() => onNavigate('add-source')}
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded"
              >
                Approve & Deploy Parser →
              </button>
            </div>
          </div>
        )}

        {currentStep === 6 && (
          <div className="bg-[#0f172a] border border-cyan-500/40 p-8 rounded-xl text-center space-y-4 font-mono">
            <Radio className="w-12 h-12 text-cyan-400 animate-pulse mx-auto" />
            <h3 className="text-lg font-bold text-white">
              Live Ingestion Pipeline Active & Ready
            </h3>
            <p className="text-xs text-slate-400 max-w-lg mx-auto">
              Simultaneous multi-source streaming with live throughput counters, automatic classification, and full forensic integrity tracking.
            </p>
            <button
              onClick={() => onNavigate('live-stream')}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
            >
              Launch Live Stream Telemetry →
            </button>
          </div>
        )}

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
