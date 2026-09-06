import React, { useState } from 'react';
import { ScanResult } from '../types';
import { 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  Globe, 
  KeyRound, 
  Layers, 
  ArrowRight,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { 
  getHumanThreatBadge, 
  humanizeReason, 
  getActionGuidance 
} from '../utils/languageHelpers';
import { ActivePage } from './Header';

interface AnalysisPageProps {
  currentScan: ScanResult | null;
  onNavigate: (page: ActivePage) => void;
}

export const AnalysisPage: React.FC<AnalysisPageProps> = ({
  currentScan,
  onNavigate,
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  if (!currentScan) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
        <div className="w-12 h-12 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 mx-auto">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">No Analysis Available Yet</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Please run a scan first to see an understandable breakdown of why a website was classified as safe or risky.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('scan')}
          className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-colors shadow-md"
        >
          <span>Go to Scan Page</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  const threatBadge = getHumanThreatBadge(currentScan.threatLevel);
  const guidance = getActionGuidance(currentScan.threatLevel);
  const m1 = currentScan.module1;
  const m2 = currentScan.module2;
  const m3 = currentScan.module3;

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider block">
              Safety Explanation
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              Why did PhishShield give me this result?
            </h2>
            <p className="text-xs font-mono text-slate-400 mt-1 break-all">
              {currentScan.normalizedUrl}
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-950 p-3 rounded-xl border border-slate-800 shrink-0">
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Score</span>
              <span className={`text-xl font-black font-mono ${threatBadge.textColor}`}>
                {currentScan.riskScore} <span className="text-xs text-slate-500 font-normal">/ 100</span>
              </span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Verdict</span>
              <span className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded border ${threatBadge.badgeClass}`}>
                {threatBadge.label}
              </span>
            </div>
          </div>
        </div>

        {/* 1. Main Reasons */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Main Reasons</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {m3.primaryReasons.length > 0 ? (
              m3.primaryReasons.map((reason, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 flex items-start space-x-2.5 text-xs text-slate-200"
                >
                  <span className="text-amber-400 font-bold shrink-0 mt-0.5">•</span>
                  <span className="leading-relaxed">{humanizeReason(reason)}</span>
                </div>
              ))
            ) : (
              <div className="col-span-2 bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 flex items-center space-x-2.5 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>No major warning signs were detected in this website address or content.</span>
              </div>
            )}
          </div>
        </div>

        {/* 2. Risk Score Breakdown */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Risk Score Breakdown</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            
            {/* Address Characteristics */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <span className="text-slate-400 font-medium block">Address Patterns</span>
              <span className="text-lg font-bold font-mono text-white">
                {m1.status === 'CLEAN' ? 'Clean' : m1.status === 'SUSPICIOUS' ? 'Suspicious' : 'High Risk'}
              </span>
              <p className="text-[11px] text-slate-500">
                {m1.automaton.detectedPatterns.length === 0
                  ? 'No unusual address formatting found.'
                  : `${m1.automaton.detectedPatterns.length} unusual pattern(s) identified in URL.`}
              </p>
            </div>

            {/* Website Checks */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <span className="text-slate-400 font-medium block">Website Inspection</span>
              <span className="text-lg font-bold font-mono text-white">
                {m2.status === 'VALIDATED' ? 'Normal' : m2.status === 'SUSPICIOUS' ? 'Flagged' : 'Unavailable'}
              </span>
              <p className="text-[11px] text-slate-500">
                {m2.brand.relationship === 'MISMATCH'
                  ? 'Brand mismatch detected between claim and domain.'
                  : m2.validation.accessible
                  ? 'Live server inspection completed.'
                  : 'Server could not be reached.'}
              </p>
            </div>

            {/* Security Protections */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <span className="text-slate-400 font-medium block">Protective Deductions</span>
              <span className="text-lg font-bold font-mono text-emerald-400">
                {m3.positiveFactors.length} Signal(s)
              </span>
              <p className="text-[11px] text-slate-500">
                {m3.positiveFactors.length > 0
                  ? m3.positiveFactors.join(', ')
                  : 'No positive legitimacy signals found.'}
              </p>
            </div>

          </div>
        </div>

        {/* 3. Website Findings */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
            <Globe className="w-4 h-4 text-blue-400" />
            <span>Website Findings</span>
          </h3>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl divide-y divide-slate-800/80 text-xs">
            
            {/* Finding 1: Domain Identity */}
            <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-medium text-slate-300">Domain Identity Verification:</span>
              <div className="text-right">
                {m2.brand.relationship === 'MISMATCH' ? (
                  <span className="text-red-400 font-bold">
                    Brand Mismatch ({m2.brand.detectedBrand} claimed on unofficial domain)
                  </span>
                ) : m2.brand.relationship === 'MATCH' ? (
                  <span className="text-emerald-400 font-bold">
                    Official Domain Match ({m2.brand.detectedBrand})
                  </span>
                ) : (
                  <span className="text-slate-400">Standard Registered Domain</span>
                )}
              </div>
            </div>

            {/* Finding 2: Encryption */}
            <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-medium text-slate-300">Connection Encryption:</span>
              <div className="text-right">
                {m2.validation.isHttps ? (
                  <span className="text-emerald-400 font-bold">HTTPS Encrypted Connection</span>
                ) : (
                  <span className="text-amber-400 font-bold">Unencrypted HTTP (Insecure)</span>
                )}
              </div>
            </div>

            {/* Finding 3: Sensitive Info Collection */}
            <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-medium text-slate-300">Sensitive Information Forms:</span>
              <div className="text-right">
                {m2.validation.content?.hasPasswordFields ? (
                  <span className="text-red-400 font-bold">Password Entry Form Detected</span>
                ) : m2.validation.content?.hasPaymentFields ? (
                  <span className="text-red-400 font-bold">Payment Entry Form Detected</span>
                ) : m2.validation.content?.hasForms ? (
                  <span className="text-amber-400 font-medium">Standard Web Form Present</span>
                ) : (
                  <span className="text-slate-400">No input forms detected</span>
                )}
              </div>
            </div>

            {/* Finding 4: Redirection */}
            <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-medium text-slate-300">Address Redirection:</span>
              <div className="text-right">
                {m2.validation.redirectCount > 0 ? (
                  <span className="text-amber-400 font-medium">
                    Redirected {m2.validation.redirectCount} time(s) to destination
                  </span>
                ) : (
                  <span className="text-slate-400">Direct connection (no redirects)</span>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* 4. Recommended Action */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Recommended Action</span>
          </h3>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
            <p className="font-bold text-white">{guidance.primaryNotice}</p>
            <ul className="space-y-1 text-slate-300 pt-1">
              {guidance.recommendations.map((r, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 5. EXPANDABLE TECHNICAL DETAILS */}
        <div className="pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-950 hover:bg-slate-800/80 rounded-xl border border-slate-800 text-xs font-medium text-blue-400 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-4 h-4" />
              <span>{showTechnicalDetails ? 'Hide technical details' : 'View technical details'}</span>
            </div>
            {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showTechnicalDetails && (
            <div className="mt-3 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4 text-xs font-mono">
              <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block border-b border-slate-800 pb-2">
                Underlying Technical Indicators & Risk Weights
              </span>

              {/* Exact points table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] text-slate-500 uppercase">
                      <th className="py-1.5 px-2">Factor / Indicator</th>
                      <th className="py-1.5 px-2">Category</th>
                      <th className="py-1.5 px-2">Severity</th>
                      <th className="py-1.5 px-2 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {m3.contributions.map((c, i) => (
                      <tr key={i} className="hover:bg-slate-900/40">
                        <td className="py-1.5 px-2 font-medium text-white">{c.indicator}</td>
                        <td className="py-1.5 px-2 text-slate-400">{c.category}</td>
                        <td className="py-1.5 px-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              c.severity === 'CRITICAL'
                                ? 'bg-red-950 text-red-400'
                                : c.severity === 'HIGH'
                                ? 'bg-orange-950 text-orange-400'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {c.severity}
                          </span>
                        </td>
                        <td className="py-1.5 px-2 text-right font-bold text-amber-400">
                          +{c.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Technical metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] text-slate-400">
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                  <span className="block text-[9px] text-slate-500 uppercase">URL Length</span>
                  <span className="font-bold text-white">{m1.features.urlLength} characters</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                  <span className="block text-[9px] text-slate-500 uppercase">Resolved IP</span>
                  <span className="font-bold text-white">{m2.validation.ipAddress || 'None'}</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                  <span className="block text-[9px] text-slate-500 uppercase">HTTP Status</span>
                  <span className="font-bold text-white">{m2.validation.httpStatusCode || 'N/A'}</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                  <span className="block text-[9px] text-slate-500 uppercase">External Links</span>
                  <span className="font-bold text-white">
                    {m2.validation.content?.externalLinksCount || 0} (
                    {Math.round((m2.validation.content?.externalLinkRatio || 0) * 100)}%)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

      </section>

    </div>
  );
};
