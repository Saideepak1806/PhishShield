import React from 'react';
import { ScanResult } from '../types';
import { ShieldAlert, Cpu, Globe, Layers, ArrowDown } from 'lucide-react';

interface ExplainabilityTimelineProps {
  scan: ScanResult;
}

export const ExplainabilityTimeline: React.FC<ExplainabilityTimelineProps> = ({ scan }) => {
  const steps = [
    {
      num: 1,
      title: 'URL Normalization & Component Decomposition',
      icon: <Globe className="w-3.5 h-3.5 text-blue-400" />,
      desc: `Normalized URL to ${scan.normalizedUrl}. Extracted hostname '${scan.module1.components.hostname}', ${scan.module1.components.subdomains.length} subdomains, protocol '${scan.module1.components.protocol}'.`,
      status: 'COMPLETED',
    },
    {
      num: 2,
      title: 'Module 1: Finite Automaton State Transitions',
      icon: <Cpu className="w-3.5 h-3.5 text-purple-400" />,
      desc: `Engine evaluated ${scan.module1.automaton.trace.length} tokens. Final state: '${scan.module1.automaton.finalState}' (${scan.module1.automaton.status}). Detected ${scan.module1.automaton.detectedPatterns.length} structural patterns.`,
      status: scan.module1.automaton.status === 'CLEAN' ? 'PASSED' : 'FLAGGED',
    },
    {
      num: 3,
      title: 'Module 2: Live Website & Content Inspection',
      icon: <Globe className="w-3.5 h-3.5 text-blue-400" />,
      desc: scan.module2.validation.accessible
        ? `Domain resolved to IP ${scan.module2.validation.ipAddress}. HTTPS: ${scan.module2.validation.isHttps ? 'Active' : 'Insecure'}. Brand relationship: '${scan.module2.brand.relationship}'. Password forms: ${scan.module2.validation.content?.hasPasswordFields ? 'Yes' : 'No'}.`
        : `Live validation unavailable (${scan.module2.validation.error || 'Connection timeout'}). Fallback to URL pattern score.`,
      status: scan.module2.brand.relationship === 'MISMATCH' ? 'FLAGGED' : 'COMPLETED',
    },
    {
      num: 4,
      title: 'Module 3: Evidence Weighting & Risk Calculation',
      icon: <Layers className="w-3.5 h-3.5 text-amber-400" />,
      desc: `Aggregated ${scan.module3.contributions.length} risk factor weights across Module 1 and Module 2. Total normalized risk score: ${scan.riskScore}/100.`,
      status: 'COMPLETED',
    },
    {
      num: 5,
      title: 'Threat Classification & Security Verdict',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-red-400" />,
      desc: `Classification: ${scan.threatLevel}. Verdict summary: ${scan.summaryReason}`,
      status: scan.threatLevel === 'SAFE' ? 'PASSED' : 'WARNING',
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-md space-y-3">
      <div className="border-b border-slate-800 pb-2.5">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
          Decision Audit Trail (Explainability Pipeline)
        </h3>
        <p className="text-[11px] text-slate-400">
          Sequential execution flow from raw input parsing to final classification
        </p>
      </div>

      <div className="space-y-2 font-mono text-xs">
        {steps.map((s, idx) => (
          <div key={s.num} className="relative">
            <div className="bg-slate-950 border border-slate-800 rounded p-2.5 flex items-start space-x-2.5 hover:border-slate-700 transition-all">
              <div className="p-1.5 rounded bg-slate-900 border border-slate-800 shrink-0">
                {s.icon}
              </div>

              <div className="flex-1 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-[11px]">
                    Step {s.num}: {s.title}
                  </span>
                  <span
                    className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                      s.status === 'PASSED' || s.status === 'COMPLETED'
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30'
                        : s.status === 'FLAGGED' || s.status === 'WARNING'
                        ? 'bg-red-950 text-red-400 border-red-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-snug">{s.desc}</p>
              </div>
            </div>

            {idx < steps.length - 1 && (
              <div className="flex justify-center my-0.5">
                <ArrowDown className="w-3 h-3 text-slate-600" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

