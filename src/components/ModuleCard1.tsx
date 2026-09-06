import React, { useState } from 'react';
import { Module1Result } from '../types';
import { Cpu, ChevronDown, ChevronUp, CheckCircle, AlertOctagon, Terminal, BookOpen, FileCode } from 'lucide-react';

interface ModuleCard1Props {
  m1: Module1Result;
}

export const ModuleCard1: React.FC<ModuleCard1Props> = ({ m1 }) => {
  const [showTrace, setShowTrace] = useState(false);
  const [showDfaSpec, setShowDfaSpec] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'HIGH_RISK':
        return 'bg-red-950/80 text-red-400 border-red-500/40';
      case 'SUSPICIOUS':
        return 'bg-amber-950/80 text-amber-400 border-amber-500/40';
      case 'CLEAN':
      default:
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-md space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-blue-500/10 border border-blue-500/30 rounded text-blue-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              MODULE 1: URL PATTERN ANALYSIS USING FINITE AUTOMATA
            </h3>
            <p className="text-[11px] text-slate-400">
              Deterministic finite-state automaton (DFA) parsing lexical and structural URL tokens
            </p>
          </div>
        </div>

        <span
          className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border uppercase ${getStatusBadge(
            m1.automaton.status
          )}`}
        >
          Result: {m1.automaton.status}
        </span>
      </div>

      {/* Detected URL Indicators */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-mono uppercase text-slate-500 font-bold tracking-wider">
          Detected URL Indicators:
        </span>
        <div className="space-y-1 font-mono text-xs">
          {m1.automaton.detectedPatterns.length === 0 ? (
            <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-slate-950 border border-slate-800 rounded p-2 font-mono">
              <CheckCircle className="w-3.5 h-3.5 shrink-0" />
              <span>✓ Valid clean URL structure — no suspicious structural automaton patterns found.</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {m1.automaton.detectedPatterns.map((pat, idx) => (
                <span
                  key={idx}
                  className="flex items-center space-x-1.5 bg-red-950/60 text-red-300 border border-red-500/40 text-xs font-mono px-2.5 py-1 rounded"
                >
                  <AlertOctagon className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>⚠ {pat}</span>
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
            {m1.features.protocol === 'https' ? (
              <span className="text-emerald-400">✓ HTTPS Protocol</span>
            ) : (
              <span className="text-amber-400">⚠ Plain HTTP (Unencrypted)</span>
            )}
            <span className="text-slate-400">✓ Valid URL Syntax Form</span>
            {m1.features.subdomainCount > 2 && (
              <span className="text-amber-400">⚠ Multiple Subdomains ({m1.features.subdomainCount})</span>
            )}
            {m1.features.suspiciousKeywordCount > 0 && (
              <span className="text-red-400">⚠ Suspicious Authentication Keywords Detected</span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons: Formal DFA Specs & DFA Trace */}
      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={() => setShowDfaSpec(!showDfaSpec)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-mono font-semibold transition-all border ${
            showDfaSpec
              ? 'bg-purple-950/80 text-purple-300 border-purple-500/50'
              : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-purple-400" />
          <span>[ View Formal DFA Specification ]</span>
          {showDfaSpec ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        <button
          type="button"
          onClick={() => setShowTrace(!showTrace)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-mono font-semibold transition-all border ${
            showTrace
              ? 'bg-blue-950/80 text-blue-300 border-blue-500/50'
              : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-blue-400" />
          <span>[ View DFA Execution Trace ({m1.automaton.trace.length} Transitions) ]</span>
          {showTrace ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Formal DFA Specification Expandable Section */}
      {showDfaSpec && (
        <div className="bg-slate-950 border border-purple-500/30 rounded-lg p-3.5 font-mono text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-purple-300 flex items-center space-x-1.5">
              <FileCode className="w-3.5 h-3.5" />
              <span>Formal 5-Tuple Automaton Definition: DFA = (Q, Σ, δ, q0, F)</span>
            </span>
            <span className="text-[10px] text-slate-500">Deterministic Model</span>
          </div>

          <div className="space-y-1.5 text-[11px] leading-relaxed text-slate-300">
            <div>
              <strong className="text-purple-400">Q (States): </strong>
              <span className="text-slate-300">
                {'{'} q0_START, q1_PROTOCOL, q2_HOSTNAME, q3_SUBDOMAIN_EVAL, q4_KEYWORD_EVAL, q5_PATH_EVAL, q6_SUSPICIOUS_PATTERN, q7_HIGH_RISK_PATTERN, q8_ACCEPT_CLEAN, q9_ACCEPT_SUSPICIOUS {'}'}
              </span>
            </div>

            <div>
              <strong className="text-blue-400">Σ (Input Alphabet Tokens): </strong>
              <span className="text-slate-300">
                {'{'} PROTOCOL_HTTP, PROTOCOL_HTTPS, DOMAIN, IP_HOSTNAME, EXCESSIVE_SUBDOMAINS, AT_SYMBOL, PERCENT_ENCODING, PUNYCODE, SUSPICIOUS_KEYWORD, SENSITIVE_PATH, ABNORMAL_LENGTH, EOF {'}'}
              </span>
            </div>

            <div>
              <strong className="text-emerald-400">q0 (Initial State): </strong>
              <span className="text-slate-300">q0_START</span>
            </div>

            <div>
              <strong className="text-amber-400">F (Accepting Clean States): </strong>
              <span className="text-slate-300">{'{'} q8_ACCEPT_CLEAN {'}'}</span>
            </div>

            <div>
              <strong className="text-red-400">F_suspicious (Accepting Suspicious/Risk States): </strong>
              <span className="text-slate-300">{'{'} q6_SUSPICIOUS_PATTERN, q7_HIGH_RISK_PATTERN, q9_ACCEPT_SUSPICIOUS {'}'}</span>
            </div>

            <div>
              <strong className="text-cyan-400">δ (Transition Function Sample): </strong>
              <span className="text-slate-400 text-[10px] block mt-0.5">
                δ(q0, PROTOCOL_HTTPS) → q1 | δ(q1, DOMAIN) → q2 | δ(q2, IP_HOSTNAME) → q7_HIGH_RISK | δ(q2, EXCESSIVE_SUBDOMAINS) → q3 | δ(q3, KEYWORD) → q4 | δ(q5, EOF) → q8_ACCEPT
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Finite Automaton Trace Table */}
      {showTrace && (
        <div className="border border-slate-800 rounded overflow-hidden bg-slate-950">
          <div className="overflow-x-auto p-2 max-h-[300px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left font-mono text-[11px] border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase text-[9px] sticky top-0 bg-slate-950">
                  <th className="py-1.5 px-2">Step</th>
                  <th className="py-1.5 px-2">Current State</th>
                  <th className="py-1.5 px-2">Input Token Category</th>
                  <th className="py-1.5 px-2">Input Value</th>
                  <th className="py-1.5 px-2">Next State</th>
                  <th className="py-1.5 px-2">Transition Logic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {m1.automaton.trace.map((t) => (
                  <tr key={t.step} className="hover:bg-slate-900/60 transition-all">
                    <td className="py-1.5 px-2 text-slate-500">#{t.step}</td>
                    <td className="py-1.5 px-2 font-bold text-slate-300">{t.currentState}</td>
                    <td className="py-1.5 px-2 text-blue-400">{t.tokenCategory}</td>
                    <td className="py-1.5 px-2 text-amber-300 max-w-[150px] truncate">{t.inputToken}</td>
                    <td
                      className={`py-1.5 px-2 font-bold ${
                        t.nextState.includes('HIGH_RISK')
                          ? 'text-red-400'
                          : t.nextState.includes('SUSPICIOUS')
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {t.nextState}
                    </td>
                    <td className="py-1.5 px-2 text-slate-400 text-[10px]">{t.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Extracted URL Features Grid */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[10px] font-mono uppercase text-slate-500 font-bold tracking-wider">
          Lexical Feature Metrics:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 text-xs font-mono">
          <div className="bg-slate-950 p-2 rounded border border-slate-800">
            <span className="text-slate-500 block text-[9px] uppercase">URL Length</span>
            <span className="text-slate-200 font-bold">{m1.features.urlLength} chars</span>
          </div>

          <div className="bg-slate-950 p-2 rounded border border-slate-800">
            <span className="text-slate-500 block text-[9px] uppercase">Subdomains</span>
            <span className={`font-bold ${m1.features.subdomainCount > 2 ? 'text-amber-400' : 'text-slate-200'}`}>
              {m1.features.subdomainCount} levels
            </span>
          </div>

          <div className="bg-slate-950 p-2 rounded border border-slate-800">
            <span className="text-slate-500 block text-[9px] uppercase">Special Chars</span>
            <span className="text-slate-200 font-bold">{m1.features.specialCharacterCount}</span>
          </div>

          <div className="bg-slate-950 p-2 rounded border border-slate-800">
            <span className="text-slate-500 block text-[9px] uppercase">IP Hostname</span>
            <span className={`font-bold ${m1.features.hasIpAddress ? 'text-red-400' : 'text-emerald-400'}`}>
              {m1.features.hasIpAddress ? 'YES' : 'NO'}
            </span>
          </div>

          <div className="bg-slate-950 p-2 rounded border border-slate-800">
            <span className="text-slate-500 block text-[9px] uppercase">At Symbol (@)</span>
            <span className={`font-bold ${m1.features.hasAtSymbol ? 'text-red-400' : 'text-emerald-400'}`}>
              {m1.features.hasAtSymbol ? 'YES' : 'NO'}
            </span>
          </div>

          <div className="bg-slate-950 p-2 rounded border border-slate-800">
            <span className="text-slate-500 block text-[9px] uppercase">Punycode (xn--)</span>
            <span className={`font-bold ${m1.features.hasPunycode ? 'text-amber-400' : 'text-slate-200'}`}>
              {m1.features.hasPunycode ? 'YES' : 'NO'}
            </span>
          </div>

          <div className="bg-slate-950 p-2 rounded border border-slate-800">
            <span className="text-slate-500 block text-[9px] uppercase">Keywords Match</span>
            <span className={`font-bold ${m1.features.suspiciousKeywordCount > 0 ? 'text-amber-400' : 'text-slate-200'}`}>
              {m1.features.suspiciousKeywordCount} matched
            </span>
          </div>

          <div className="bg-slate-950 p-2 rounded border border-slate-800">
            <span className="text-slate-500 block text-[9px] uppercase">Path Depth</span>
            <span className="text-slate-200 font-bold">{m1.features.pathDepth} levels</span>
          </div>

          <div className="bg-slate-950 p-2 rounded border border-slate-800">
            <span className="text-slate-500 block text-[9px] uppercase">Query Params</span>
            <span className="text-slate-200 font-bold">{m1.features.queryParameterCount}</span>
          </div>

          <div className="bg-slate-950 p-2 rounded border border-slate-800">
            <span className="text-slate-500 block text-[9px] uppercase">Digit Count</span>
            <span className="text-slate-200 font-bold">{m1.features.digitCount}</span>
          </div>
        </div>
      </div>

    </div>
  );
};


