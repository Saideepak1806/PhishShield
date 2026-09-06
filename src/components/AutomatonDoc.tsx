import React from 'react';
import { Terminal, BookOpen } from 'lucide-react';

export const AutomatonDoc: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-md space-y-4">
      {/* Header */}
      <div className="border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-blue-500/10 border border-blue-500/30 rounded text-blue-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white font-mono uppercase tracking-wide">
              Formal Finite Automata (DFA) Specification
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              Academic formulation of deterministic finite-state machine for lexical URL pattern recognition
            </p>
          </div>
        </div>
      </div>

      {/* Formal Definition */}
      <div className="bg-slate-950 p-3.5 rounded border border-slate-800 space-y-2.5 font-mono text-xs">
        <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center space-x-2">
          <Terminal className="w-3.5 h-3.5" />
          <span>Formal 5-Tuple Definition: M = (Q, Σ, δ, q0, F)</span>
        </h3>

        <div className="space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
          <p>
            <strong className="text-purple-400">Q (States):</strong> {'{'}{' '}
            <span className="text-slate-200">
              q0_START, q1_PROTOCOL, q2_HOSTNAME, q3_SUBDOMAIN_EVAL, q4_KEYWORD_EVAL, q5_PATH_EVAL, q6_SUSPICIOUS_PATTERN, q7_HIGH_RISK_PATTERN, q8_ACCEPT_CLEAN, q9_ACCEPT_SUSPICIOUS
            </span>{' '}
            {'}'}
          </p>

          <p>
            <strong className="text-blue-400">Σ (Input Alphabet Tokens):</strong> {'{'}{' '}
            <span className="text-slate-200">
              PROTOCOL_HTTP, PROTOCOL_HTTPS, DOMAIN, IP_HOSTNAME, EXCESSIVE_SUBDOMAINS, AT_SYMBOL, PERCENT_ENCODING, PUNYCODE, SUSPICIOUS_KEYWORD, SENSITIVE_PATH, ABNORMAL_LENGTH, EOF
            </span>{' '}
            {'}'}
          </p>

          <p>
            <strong className="text-emerald-400">q0 (Initial State):</strong> q0_START
          </p>

          <p>
            <strong className="text-amber-400">F (Accepting Clean States):</strong> {'{'} q8_ACCEPT_CLEAN {'}'}
          </p>

          <p>
            <strong className="text-red-400">F_suspicious (Accepting Suspicious States):</strong> {'{'}{' '}
            q6_SUSPICIOUS_PATTERN, q7_HIGH_RISK_PATTERN, q9_ACCEPT_SUSPICIOUS {'}'}
          </p>
        </div>
      </div>

      {/* State Descriptions Grid */}
      <div className="space-y-2">
        <h3 className="text-[10px] font-mono uppercase text-slate-500 font-bold tracking-wider">
          State Dictionary & Transition Intent:
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-xs">
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-0.5">
            <span className="text-blue-400 font-bold block text-[11px]">q0_START → q1_PROTOCOL</span>
            <p className="text-slate-400 text-[10px]">
              Entry state. Reads protocol prefix (http/https) and transitions to host evaluation.
            </p>
          </div>

          <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-0.5">
            <span className="text-blue-400 font-bold block text-[11px]">q1_PROTOCOL → q2_HOSTNAME</span>
            <p className="text-slate-400 text-[10px]">
              Validates hostname token. If token is IP host or @ symbol, transitions immediately to q7_HIGH_RISK.
            </p>
          </div>

          <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-0.5">
            <span className="text-amber-400 font-bold block text-[11px]">q2_HOSTNAME → q3_SUBDOMAIN_EVAL</span>
            <p className="text-slate-400 text-[10px]">
              Evaluates deep subdomain nesting (&gt;2 subdomains). Accumulates risk score.
            </p>
          </div>

          <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-0.5">
            <span className="text-amber-400 font-bold block text-[11px]">q2_HOSTNAME → q4_KEYWORD_EVAL</span>
            <p className="text-slate-400 text-[10px]">
              Identifies target authentication/security keywords (login, verify, bank, wallet).
            </p>
          </div>

          <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-0.5">
            <span className="text-red-400 font-bold block text-[11px]">q6_SUSPICIOUS_PATTERN</span>
            <p className="text-slate-400 text-[10px]">
              State reached when multiple suspicious lexical tokens coincide in path or host.
            </p>
          </div>

          <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-0.5">
            <span className="text-red-400 font-bold block text-[11px]">q7_HIGH_RISK_PATTERN</span>
            <p className="text-slate-400 text-[10px]">
              Critical threat state triggered by direct IP hosting, @ trickery, or combined phishing indicators.
            </p>
          </div>
        </div>
      </div>

      {/* Academic Rationale */}
      <div className="bg-slate-950 p-3 rounded border border-slate-800 text-xs text-slate-300 space-y-1.5 font-mono">
        <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">
          Academic Value of Finite Automata in Cybersecurity:
        </h4>
        <p className="leading-relaxed text-[11px] text-slate-400">
          Finite Automata provide deterministic, order-sensitive, O(N) linear time complexity evaluation of input URL strings. Unlike ad-hoc rule engines or opaque ML models, DFAs guarantee verifiable state transitions, zero-shot explainability, and mathematically predictable execution paths suitable for edge router and firewall URL filtering.
        </p>
      </div>

    </div>
  );
};

