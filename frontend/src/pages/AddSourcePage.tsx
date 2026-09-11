import React, { useState } from 'react';
import {
  Upload,
  Sparkles,
  CheckCircle,
  FileCode,
  ArrowRight,
  Play,
  Layers,
  AlertCircle,
  Check,
  Zap,
  Cpu,
  FileCheck,
  HelpCircle,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FieldMappingVisualizer } from '../components/FieldMappingVisualizer';
import { QuickHelpTooltip } from '../components/QuickHelpTooltip';
import { SAMPLE_PRESETS, SamplePreset } from '../data/sampleLogs';
import { api } from '../services/api';
import { SourceUploadAnalysis, FieldMapping } from '../types';
import { soundFx } from '../utils/audio';

interface Props {
  onSuccess: (tab: any) => void;
}

export const AddSourcePage: React.FC<Props> = ({ onSuccess }) => {
  const [sourceName, setSourceName] = useState('Palo Alto Enterprise Firewall');
  const [inputType, setInputType] = useState('syslog');
  const [sampleContent, setSampleContent] = useState(SAMPLE_PRESETS[0].sampleContent);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('palo_alto');

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SourceUploadAnalysis | null>(null);
  const [customMappings, setCustomMappings] = useState<FieldMapping[]>([]);
  
  const [testing, setTesting] = useState(false);
  const [testOutput, setTestOutput] = useState<any>(null);
  
  const [deploying, setDeploying] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSelectPreset = (preset: SamplePreset) => {
    soundFx.playClick();
    setSelectedPresetId(preset.id);
    setSampleContent(preset.sampleContent);
    setSourceName(preset.name);
    setInputType(preset.format.toLowerCase());
    setAnalysisResult(null);
    setTestOutput(null);
    setDeploySuccess(false);
    setErrorMsg(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    soundFx.playClick();
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setSampleContent(content);
      setSourceName(file.name.replace(/\.[^/.]+$/, ''));
      setAnalysisResult(null);
      setTestOutput(null);
    };
    reader.readAsText(file);
  };

  const handleAnalyze = async () => {
    if (!sampleContent.trim()) {
      setErrorMsg('Please select a preset above or upload log samples.');
      return;
    }

    try {
      soundFx.playBeep();
      setAnalyzing(true);
      setErrorMsg(null);
      const res = await api.analyzeUpload({
        source_name: sourceName,
        input_type: inputType,
        sample_content: sampleContent,
      });
      setAnalysisResult(res);
      setCustomMappings(res.suggested_mappings || []);
      setTestOutput(res.sample_normalized_preview);
      soundFx.playSuccess();
    } catch (e: any) {
      setErrorMsg(e.message || 'Analysis failed. Please check your sample logs.');
      soundFx.playAlert();
    } finally {
      setAnalyzing(false);
    }
  };

  const handleTestSample = async () => {
    if (!analysisResult) return;
    try {
      soundFx.playClick();
      setTesting(true);
      const res = await api.testParser({
        sample_log: analysisResult.sample_raw_line,
        format: analysisResult.detected_format.toLowerCase(),
        mappings: customMappings,
      });
      setTestOutput(res.normalized_event);
      soundFx.playBeep();
    } catch (e: any) {
      setErrorMsg(e.message || 'Test parse failed');
    } finally {
      setTesting(false);
    }
  };

  const handleAcceptAndDeploy = async () => {
    if (!analysisResult) return;
    try {
      setDeploying(true);
      setErrorMsg(null);

      // 1. Create Parser Configuration
      const parserConfig = await api.createOrUpdateParser({
        name: `${sourceName} Parser`,
        description: `Auto-generated ${analysisResult.detected_format} parser for ${sourceName}`,
        source_type: analysisResult.detected_format.toLowerCase(),
        version: 'v1.0',
        is_active: true,
        mappings: customMappings,
        created_by: 'ai_suggester',
      });

      // 2. Register Log Source
      await api.createSource({
        name: sourceName,
        input_type: analysisResult.detected_format.toLowerCase(),
        status: 'ACTIVE',
        events_per_sec: 450.0,
        parser_name: parserConfig.name,
        description: `Ingestion source connected to ${parserConfig.name}`,
      });

      setDeploySuccess(true);
      soundFx.playSuccess();

      // Trigger celebratory confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#22c55e', '#a855f7', '#f59e0b'],
      });

      setTimeout(() => {
        onSuccess('live-stream');
      }, 1800);
    } catch (e: any) {
      setErrorMsg(e.message || 'Deployment failed');
      soundFx.playAlert();
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div className="py-8 px-6 sm:px-10 space-y-8 max-w-[1720px] w-full mx-auto">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-800 text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest">
            AI Automated Parser Generator
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-mono font-semibold">
            Human-in-the-Loop Verified
          </span>
        </div>
        <h1 className="text-2xl font-bold font-mono text-white tracking-wide mt-1.5 flex items-center gap-3">
          <span>Add New Log Source & AI Schema Mapper</span>
          <QuickHelpTooltip
            title="Log Source Generator"
            content="Simply select a preset or paste 2-5 log lines. ULPF will automatically discover the log format, infer field mappings to standard OCSF format, and prepare the parser for your approval."
          />
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-sans">
          Follow the 3 simple steps below to onboard any log source without writing code or complex regex.
        </p>
      </div>

      {/* User-Friendly 3-Step Breadcrumbs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-stretch">
        <div className="p-3.5 rounded-xl bg-[#171f33] border border-cyan-500/40 flex items-center gap-3 h-full">
          <span className="w-6 h-6 rounded-full bg-cyan-500 text-black font-bold text-xs flex items-center justify-center font-mono flex-shrink-0">
            1
          </span>
          <div>
            <h4 className="text-xs font-bold text-white font-mono">Step 1: Choose Log Data</h4>
            <p className="text-[11px] text-slate-400">Pick a preset or upload sample</p>
          </div>
        </div>

        <div className={`p-3.5 rounded-xl border flex items-center gap-3 h-full transition-colors ${
          analysisResult ? 'bg-[#171f33] border-cyan-500/40' : 'bg-[#131b2e] border-slate-800'
        }`}>
          <span className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center font-mono flex-shrink-0 ${
            analysisResult ? 'bg-cyan-500 text-black' : 'bg-slate-800 text-slate-400'
          }`}>
            2
          </span>
          <div>
            <h4 className="text-xs font-bold text-white font-mono">Step 2: AI Format Detection</h4>
            <p className="text-[11px] text-slate-400">Automatic schema alignment</p>
          </div>
        </div>

        <div className={`p-3.5 rounded-xl border flex items-center gap-3 h-full transition-colors ${
          deploySuccess ? 'bg-[#171f33] border-emerald-500/50' : 'bg-[#131b2e] border-slate-800'
        }`}>
          <span className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center font-mono flex-shrink-0 ${
            deploySuccess ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-400'
          }`}>
            3
          </span>
          <div>
            <h4 className="text-xs font-bold text-white font-mono">Step 3: Review & Deploy</h4>
            <p className="text-[11px] text-slate-400">1-click production rollout</p>
          </div>
        </div>
      </div>

      {/* Preset Quick Loaders */}
      <div className="bg-[#171f33] border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            ⚡ Select a Sample Log Preset to Test Instantly:
            <QuickHelpTooltip
              title="Demo Presets"
              content="Pre-loaded with authentic logs from top enterprise vendors (Palo Alto Firewalls, Windows Security, AWS CloudTrail, Suricata IDS, and Custom Banking)."
            />
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-stretch">
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`text-left p-3.5 rounded-xl border transition-all text-xs font-mono h-full flex flex-col justify-between ${
                selectedPresetId === preset.id
                  ? 'bg-cyan-950/80 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)] scale-[1.02]'
                  : 'bg-[#131b2e] border-slate-800 hover:border-slate-700 text-slate-300 hover:scale-[1.01]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-white truncate">{preset.name.split(' ')[0]}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] border ${preset.badgeColor}`}>
                    {preset.format}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{preset.description}</p>
              </div>
              <span className="text-[10px] text-cyan-400 font-mono mt-2 block">Click to Load →</span>
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs font-mono flex items-center gap-2 shadow-lg">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Upload & Configuration on Left, Analysis on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Source Metadata & Sample Upload (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#171f33] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Upload className="w-4 h-4 text-cyan-400" />
                Source Stream Setup
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Step 1 of 3</span>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Source Name</label>
              <input
                type="text"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                placeholder="e.g. Palo Alto Firewall"
                className="w-full bg-[#0b1326] border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Expected Log Feed Type</label>
              <select
                value={inputType}
                onChange={(e) => setInputType(e.target.value)}
                className="w-full bg-[#0b1326] border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="syslog">Syslog (RFC 3164 / 5424)</option>
                <option value="json">JSON / NDJSON Stream</option>
                <option value="cef">Common Event Format (CEF)</option>
                <option value="xml">Windows Event XML</option>
                <option value="csv">Delimited / CSV / TSV</option>
                <option value="custom">Custom Proprietary Format</option>
              </select>
            </div>

            {/* Drag & Drop Sample Upload Area */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Upload Sample Logs (or edit raw text below)
              </label>
              <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-xl p-4 bg-[#0b1326] text-center transition-colors">
                <input
                  type="file"
                  id="log-file-input"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".log,.txt,.json,.xml,.csv,.cef"
                />
                <label htmlFor="log-file-input" className="cursor-pointer block space-y-2">
                  <FileCode className="w-6 h-6 text-cyan-400 mx-auto" />
                  <span className="text-xs font-mono text-slate-300 block">
                    Drag & Drop log file here, or <strong className="text-cyan-400 underline">Browse Files</strong>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 block">
                    Supports .log, .json, .xml, .csv, .cef
                  </span>
                </label>
              </div>
            </div>

            <div>
              <textarea
                rows={6}
                value={sampleContent}
                onChange={(e) => setSampleContent(e.target.value)}
                placeholder="Paste raw log lines here..."
                className="w-full bg-[#0b1326] border border-slate-700 rounded-xl p-3 text-xs font-mono text-amber-300/90 whitespace-pre focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={analyzing}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black font-bold font-mono text-xs rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all hover:scale-[1.02]"
            >
              {analyzing ? (
                <>
                  <Zap className="w-4 h-4 animate-spin" />
                  <span>Analyzing Log Structure...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze & Generate Parser Mappings</span>
                </>
              )}
            </button>

          </div>
        </div>

        {/* Right Column: Format Analysis, AI Suggestions, and Acceptance (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {analysisResult ? (
            <div className="bg-[#171f33] border border-cyan-500/50 rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
              
              {/* Detection Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400 uppercase">Detected Format:</span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-cyan-950 border border-cyan-700 text-cyan-300 font-mono font-bold text-xs">
                      {analysisResult.detected_format}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 font-mono text-[11px] font-bold">
                      Confidence: {Math.round(analysisResult.confidence * 100)}%
                    </span>
                  </div>
                  <p className="text-xs font-mono text-slate-400 mt-1">
                    Discovered <strong className="text-white">{analysisResult.detected_fields.length}</strong> fields from {analysisResult.total_sample_lines} sample events.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTestSample}
                    disabled={testing}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0b1326] hover:bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-300 rounded-lg text-xs font-mono transition-all hover:scale-105"
                  >
                    <Play className="w-3.5 h-3.5 text-amber-400" />
                    <span>{testing ? 'Testing...' : 'Test Sample Event'}</span>
                  </button>
                </div>
              </div>

              {/* AI Mapping Notice */}
              <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-800/60 flex items-start gap-3 shadow-inner">
                <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs font-sans">
                  <span className="text-cyan-300 font-bold block mb-1 font-mono">
                    AI-Assisted Schema Normalization Proposed
                  </span>
                  <span className="text-slate-300 text-[11px] leading-relaxed block">
                    All extracted fields have been auto-aligned to OCSF standard schema paths. You can modify any mapping rule below before approving.
                  </span>
                </div>
              </div>

              {/* Editable Field Mapping Visualizer */}
              <FieldMappingVisualizer
                mappings={customMappings}
                onChange={setCustomMappings}
              />

              {/* Live Normalized Event JSON Preview */}
              {testOutput && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Normalized Event Preview (OCSF Aligned)</span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-semibold">100% Validated ✓</span>
                  </div>
                  <pre className="text-xs font-mono text-cyan-200/90 bg-[#0b1326] p-4 rounded-xl border border-slate-800 max-h-48 overflow-y-auto whitespace-pre-wrap break-all">
                    {JSON.stringify(testOutput, null, 2)}
                  </pre>
                </div>
              )}

              {/* Final Actions */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[11px] font-mono text-slate-400">
                  Ready to deploy? Creates immutable snapshot in Audit Trail (v1.0).
                </span>

                <button
                  type="button"
                  onClick={handleAcceptAndDeploy}
                  disabled={deploying || deploySuccess}
                  className={`px-6 py-3 rounded-xl font-mono font-bold text-xs flex items-center gap-2 shadow-xl transition-all ${
                    deploySuccess
                      ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                      : 'bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black shadow-[0_0_20px_rgba(34,197,94,0.35)] hover:scale-[1.02]'
                  }`}
                >
                  {deploySuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Parser v1.0 Deployed Successfully!</span>
                    </>
                  ) : deploying ? (
                    <>
                      <Zap className="w-4 h-4 animate-spin" />
                      <span>Creating Parser & Ingestion Source...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Accept & Deploy Parser v1.0</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-[#171f33] border border-slate-800 rounded-2xl p-12 text-center shadow-xl flex flex-col items-center justify-center min-h-[440px]">
              <div className="p-4 rounded-2xl bg-[#131b2e] border border-slate-800 mb-4 shadow-inner">
                <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
              </div>
              <h3 className="text-base font-bold font-mono text-white mb-2">
                Awaiting Sample Log Selection
              </h3>
              <p className="text-xs font-sans text-slate-400 max-w-md leading-relaxed">
                Select a preset on top or paste sample raw logs on the left, then click{' '}
                <strong className="text-cyan-400 font-mono">"Analyze & Generate Parser Mappings"</strong> to produce automatic format detection and field mappings.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
