import React, { useState } from 'react';
import { ScanResult } from '../types';
import { 
  Cpu, 
  Terminal, 
  BookOpen, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  AlertOctagon, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { ActivePage } from './Header';

interface DfaInspectorPageProps {
  currentScan: ScanResult | null;
  scansHistory: ScanResult[];
  onSelectScan: (scan: ScanResult) => void;
  onNavigate: (page: ActivePage) => void;
}

export const DfaInspectorPage: React.FC<DfaInspectorPageProps> = ({
  currentScan,
  scansHistory,
  onSelectScan,
  onNavigate,
}) => {
  const [selectedScanId, setSelectedScanId] = useState<string>(currentScan?.id || '');

  // Keep selected scan in sync
  const activeScan = scansHistory.find((s) => s.id === selectedScanId) || currentScan;

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center space-x-2 text-purple-400 text-xs font-semibold uppercase tracking-wider">
              <Cpu className="w-4 h-4" />
              <span>Advanced Technical Inspection</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              Deterministic Finite Automaton (DFA) Inspector
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Academic deterministic state-machine implementation for deterministic URL lexical parsing, token categorization, and structural anomaly detection.
            </p>
          </div>

          {/* Scan Selector Dropdown */}
          {scansHistory.length > 0 && (
            <div className="space-y-1 shrink-0">
              <label className="text-[10px] uppercase font-mono text-slate-400 font-bold block">
                Select Scan to Trace:
              </label>
              <select
                value={activeScan?.id || ''}
                onChange={(e) => {
                  setSelectedScanId(e.target.value);
                  const found = scansHistory.find((s) => s.id === e.target.value);
                  if (found) onSelectScan(found);
                }}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-purple-300 focus:outline-none focus:border-purple-500 max-w-xs truncate"
              >
                {scansHistory.map((s) => (
                  <option key={s.id} value={s.id}>
                    [{s.riskScore}/100] {s.rawUrl.substring(0, 36)}...
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Selected Scan Info Banner */}
        {activeScan ? (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 font-mono text-xs">
            <div className="flex items-center space-x-2 text-slate-300 truncate">
              <span className="text-slate-500">Active URL:</span>
              <span className="text-purple-300 font-bold truncate max-w-md">{activeScan.normalizedUrl}</span>
            </div>
            <div className="flex items-center space-x-3 text-[11px]">
              <span className="text-slate-400">
                Transitions: <strong className="text-white">{activeScan.module1.automaton.trace.length}</strong>
              </span>
              <span className="text-slate-400">
                Final State: <strong className="text-purple-400">{activeScan.module1.automaton.finalState}</strong>
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>No scan is currently loaded. You can view the formal DFA specification below or run a scan.</span>
            <button
              onClick={() => onNavigate('scan')}
              className="text-xs text-blue-400 hover:text-blue-300 underline font-medium"
            >
              Go to Scan →
            </button>
          </div>
        )}
      </section>

      {/* 1. Formal 5-Tuple DFA Specification */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
          <Terminal className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Formal 5-Tuple Definition: M = (Q, Σ, δ, q0, F)
          </h3>
        </div>

        <div className="bg-slate-950 border border-purple-500/20 rounded-xl p-4 font-mono text-xs space-y-3 leading-relaxed">
          <div>
            <strong className="text-purple-400 block text-[11px] uppercase">Q (States):</strong>
            <span className="text-slate-300 text-[11px]">
              {'{'} q0_START, q1_PROTOCOL, q2_HOSTNAME, q3_SUBDOMAIN_EVAL, q4_KEYWORD_EVAL, q5_PATH_EVAL, q6_SUSPICIOUS_PATTERN, q7_HIGH_RISK_PATTERN, q8_ACCEPT_CLEAN, q9_ACCEPT_SUSPICIOUS {'}'}
            </span>
          </div>

          <div>
            <strong className="text-blue-400 block text-[11px] uppercase">Σ (Input Alphabet Tokens):</strong>
            <span className="text-slate-300 text-[11px]">
              {'{'} PROTOCOL_HTTP, PROTOCOL_HTTPS, DOMAIN, IP_HOSTNAME, EXCESSIVE_SUBDOMAINS, AT_SYMBOL, PERCENT_ENCODING, PUNYCODE, SUSPICIOUS_KEYWORD, SENSITIVE_PATH, ABNORMAL_LENGTH, EOF {'}'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <strong className="text-emerald-400 block text-[11px] uppercase">q0 (Initial State):</strong>
              <span className="text-slate-200">q0_START</span>
            </div>

            <div>
              <strong className="text-amber-400 block text-[11px] uppercase">F_clean (Clean Accepting):</strong>
              <span className="text-slate-200">{'{'} q8_ACCEPT_CLEAN {'}'}</span>
            </div>

            <div>
              <strong className="text-red-400 block text-[11px] uppercase">F_suspicious (Suspicious Accepting):</strong>
              <span className="text-slate-200">{'{'} q6_SUSPICIOUS, q7_HIGH_RISK, q9_ACCEPT_SUSPICIOUS {'}'}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <strong className="text-cyan-400 block text-[11px] uppercase">δ (Sample Transition Function Rules):</strong>
            <div className="text-slate-400 text-[11px] space-y-0.5 mt-1">
              <div>• δ(q0_START, PROTOCOL_HTTPS) → q1_PROTOCOL</div>
              <div>• δ(q1_PROTOCOL, DOMAIN) → q2_HOSTNAME</div>
              <div>• δ(q2_HOSTNAME, IP_HOSTNAME) → q7_HIGH_RISK_PATTERN</div>
              <div>• δ(q2_HOSTNAME, AT_SYMBOL) → q7_HIGH_RISK_PATTERN</div>
              <div>• δ(q2_HOSTNAME, EXCESSIVE_SUBDOMAINS) → q3_SUBDOMAIN_EVAL</div>
              <div>• δ(q2_HOSTNAME, SUSPICIOUS_KEYWORD) → q4_KEYWORD_EVAL</div>
              <div>• δ(q5_PATH_EVAL, EOF) → q8_ACCEPT_CLEAN</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Step-by-step Trace for the Selected Scan */}
      {activeScan && (
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-purple-400" />
                <span>Automaton Step-by-Step Transition Trace</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Exact sequential state transitions produced by analyzing the input tokens
              </p>
            </div>

            <span
              className={`text-xs font-mono font-bold px-3 py-1 rounded-lg border uppercase shrink-0 ${
                activeScan.module1.automaton.status === 'CLEAN'
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40'
                  : activeScan.module1.automaton.status === 'SUSPICIOUS'
                  ? 'bg-amber-950 text-amber-400 border-amber-500/40'
                  : 'bg-red-950 text-red-400 border-red-500/40'
              }`}
            >
              Verdict: {activeScan.module1.automaton.status}
            </span>
          </div>

          {/* Transitions Table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
            <div className="overflow-x-auto max-h-[380px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] sticky top-0 bg-slate-950">
                    <th className="py-2 px-3">Step</th>
                    <th className="py-2 px-3">From State</th>
                    <th className="py-2 px-3">Token Category</th>
                    <th className="py-2 px-3">Input Token</th>
                    <th className="py-2 px-3">To Next State</th>
                    <th className="py-2 px-3">Automaton Logic / Transition Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {activeScan.module1.automaton.trace.map((t) => (
                    <tr key={t.step} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-2 px-3 text-slate-500 font-bold">#{t.step}</td>
                      <td className="py-2 px-3 text-slate-300 font-bold">{t.currentState}</td>
                      <td className="py-2 px-3 text-blue-400">{t.tokenCategory}</td>
                      <td className="py-2 px-3 text-amber-300 max-w-[160px] truncate">{t.inputToken}</td>
                      <td
                        className={`py-2 px-3 font-bold ${
                          t.nextState.includes('HIGH_RISK')
                            ? 'text-red-400'
                            : t.nextState.includes('SUSPICIOUS')
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {t.nextState}
                      </td>
                      <td className="py-2 px-3 text-slate-400 text-[11px]">{t.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Lexical features */}
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-mono uppercase text-slate-400 font-bold block">
              Extracted Lexical Metrics for this URL:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[9px] uppercase">URL Length</span>
                <span className="text-white font-bold">{activeScan.module1.features.urlLength} chars</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[9px] uppercase">Subdomain Levels</span>
                <span className="text-white font-bold">{activeScan.module1.features.subdomainCount}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[9px] uppercase">Special Chars</span>
                <span className="text-white font-bold">{activeScan.module1.features.specialCharacterCount}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[9px] uppercase">IP Address Host</span>
                <span className={`font-bold ${activeScan.module1.features.hasIpAddress ? 'text-red-400' : 'text-emerald-400'}`}>
                  {activeScan.module1.features.hasIpAddress ? 'YES' : 'NO'}
                </span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[9px] uppercase">Keyword Matches</span>
                <span className={`font-bold ${activeScan.module1.features.suspiciousKeywordCount > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                  {activeScan.module1.features.suspiciousKeywordCount} matched
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

    </div>
  );
};
