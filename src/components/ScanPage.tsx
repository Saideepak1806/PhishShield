import React, { useState, useEffect } from 'react';
import { ScanResult, ThreatLevel } from '../types';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  ExternalLink, 
  Lock, 
  KeyRound, 
  FileText, 
  Sparkles, 
  RefreshCw,
  Info,
  AlertCircle
} from 'lucide-react';
import { 
  getHumanThreatBadge, 
  humanizeReason, 
  getActionGuidance, 
  getSensitiveInfoNotice 
} from '../utils/languageHelpers';
import { ActivePage } from './Header';

interface ScanPageProps {
  currentScan: ScanResult | null;
  isScanning: boolean;
  error: string | null;
  onScan: (url: string) => Promise<void>;
  onRunDemo: (url?: string) => Promise<void>;
  onNavigate: (page: ActivePage) => void;
}

export const ScanPage: React.FC<ScanPageProps> = ({
  currentScan,
  isScanning,
  error,
  onScan,
  onRunDemo,
  onNavigate,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [scanStage, setScanStage] = useState<number>(0);

  // Progressive scanning indicators corresponding to the real scan process
  useEffect(() => {
    if (!isScanning) {
      setScanStage(0);
      return;
    }

    setScanStage(1); // Checking website address
    const t1 = setTimeout(() => setScanStage(2), 250); // Inspecting website
    const t2 = setTimeout(() => setScanStage(3), 600); // Checking for warning signs
    const t3 = setTimeout(() => setScanStage(4), 950); // Preparing safety result

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isScanning]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() || isScanning) return;
    onScan(urlInput.trim());
  };

  const sampleUrls = [
    { label: 'Wikipedia (Legitimate)', url: 'https://www.wikipedia.org' },
    { label: 'Fake PayPal (Brand Mismatch)', url: 'http://paypal-security-update.account-verify.test/login' },
    { label: 'Raw IP Address', url: 'http://192.0.2.10/login/paypal/verify' },
    { label: 'Suspicious Bank Keyword', url: 'http://login-verification-bank.test/secure/account' },
    { label: 'Python Official', url: 'https://www.python.org/downloads' },
  ];

  // Helper values for current scan result
  const threatBadge = currentScan ? getHumanThreatBadge(currentScan.threatLevel) : null;
  const actionGuidance = currentScan ? getActionGuidance(currentScan.threatLevel) : null;
  const sensitiveNotice = currentScan ? getSensitiveInfoNotice(currentScan) : null;

  return (
    <div className="space-y-6">
      
      {/* Search & Hero Card */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl space-y-5">
        <div>
          <div className="flex items-center space-x-2 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>PhishShield Safety Verification</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            Check a website before you trust it.
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Enter any link you received in an email, text message, or chat to verify its authenticity, safety status, and potential risks before entering sensitive details.
          </p>
        </div>

        {/* URL Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Enter website URL (e.g. https://example.com or suspicious link)..."
                disabled={isScanning}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-20 text-sm font-mono text-blue-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
              />
              {urlInput && (
                <button
                  type="button"
                  onClick={() => setUrlInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/80 px-2 py-0.5 rounded transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isScanning || !urlInput.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 shrink-0"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-200" />
                  <span>Analyzing Website...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Analyze Website</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Demo Payloads */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
            <span className="text-slate-400 font-medium mr-1 text-[11px]">Quick test links:</span>
            {sampleUrls.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setUrlInput(s.url);
                  onScan(s.url);
                }}
                disabled={isScanning}
                className="bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 text-[11px] px-2.5 py-1 rounded-lg transition-all"
              >
                {s.label}
              </button>
            ))}
          </div>
        </form>

        {/* Error Notice if any */}
        {error && (
          <div className="bg-red-950/40 border border-red-500/40 rounded-xl p-3.5 text-xs text-red-300 flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Unable to complete analysis</strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Real-time Scanning Progress Bar */}
        {isScanning && (
          <div className="bg-slate-950 border border-blue-500/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-blue-400 flex items-center space-x-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Analyzing website security in real time...</span>
              </span>
              <span className="text-slate-500 text-[11px] font-mono">
                {scanStage === 1 && 'Phase 1 of 4'}
                {scanStage === 2 && 'Phase 2 of 4'}
                {scanStage === 3 && 'Phase 3 of 4'}
                {scanStage === 4 && 'Phase 4 of 4'}
              </span>
            </div>

            {/* 4 sequential steps as requested by the prompt */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
              <div
                className={`p-2.5 rounded-lg border transition-all ${
                  scanStage >= 1
                    ? 'bg-blue-950/40 border-blue-500/40 text-blue-300'
                    : 'bg-slate-900/60 border-slate-800/60 text-slate-500'
                }`}
              >
                <div className="flex items-center space-x-1.5 font-medium">
                  {scanStage > 1 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center text-[10px]">
                      1
                    </span>
                  )}
                  <span>Checking website address</span>
                </div>
              </div>

              <div
                className={`p-2.5 rounded-lg border transition-all ${
                  scanStage >= 2
                    ? 'bg-blue-950/40 border-blue-500/40 text-blue-300'
                    : 'bg-slate-900/60 border-slate-800/60 text-slate-500'
                }`}
              >
                <div className="flex items-center space-x-1.5 font-medium">
                  {scanStage > 2 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center text-[10px]">
                      2
                    </span>
                  )}
                  <span>Inspecting website</span>
                </div>
              </div>

              <div
                className={`p-2.5 rounded-lg border transition-all ${
                  scanStage >= 3
                    ? 'bg-blue-950/40 border-blue-500/40 text-blue-300'
                    : 'bg-slate-900/60 border-slate-800/60 text-slate-500'
                }`}
              >
                <div className="flex items-center space-x-1.5 font-medium">
                  {scanStage > 3 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center text-[10px]">
                      3
                    </span>
                  )}
                  <span>Checking for warning signs</span>
                </div>
              </div>

              <div
                className={`p-2.5 rounded-lg border transition-all ${
                  scanStage >= 4
                    ? 'bg-blue-950/40 border-blue-500/40 text-blue-300'
                    : 'bg-slate-900/60 border-slate-800/60 text-slate-500'
                }`}
              >
                <div className="flex items-center space-x-1.5 font-medium">
                  <span className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center text-[10px]">
                    4
                  </span>
                  <span>Preparing safety result</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* PROMINENT IMMEDIATE RESULT SECTION */}
      {currentScan && threatBadge && actionGuidance && (
        <section className="space-y-4">
          
          {/* Main Risk Result Card */}
          <div className={`border rounded-2xl p-5 sm:p-7 shadow-xl space-y-6 ${threatBadge.bgCard}`}>
            
            {/* Top Row: Risk Score & Threat Level */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Scanned Website
                </span>
                <span className="text-base sm:text-lg font-mono font-bold text-white break-all">
                  {currentScan.normalizedUrl}
                </span>
                <span className="text-xs text-slate-400 block">
                  Analyzed at {new Date(currentScan.timestamp).toLocaleTimeString()} • Passive safety inspection
                </span>
              </div>

              {/* Prominent Score Block */}
              <div className="flex items-center space-x-4 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 shrink-0">
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 uppercase font-medium block">Risk Score</span>
                  <div className="flex items-baseline space-x-1">
                    <span className={`text-2xl sm:text-3xl font-black font-mono ${threatBadge.textColor}`}>
                      {currentScan.riskScore}
                    </span>
                    <span className="text-xs font-mono text-slate-500">/ 100</span>
                  </div>
                </div>

                <div className="h-10 w-px bg-slate-800" />

                <div className="text-left">
                  <span className="text-[11px] text-slate-400 uppercase font-medium block">Safety Status</span>
                  <span
                    className={`inline-flex items-center space-x-1.5 text-xs sm:text-sm font-bold font-mono px-3 py-1 rounded-lg border ${threatBadge.badgeClass}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${threatBadge.dotColor}`} />
                    <span>{threatBadge.label}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* SENSITIVE INFORMATION WARNING (Prominently Highlighted if Detected) */}
            {sensitiveNotice && sensitiveNotice.hasWarning && (
              <div
                className={`p-4 rounded-xl border flex items-start space-x-3 ${
                  sensitiveNotice.isCritical
                    ? 'bg-red-950/70 border-red-500/60 text-red-200'
                    : 'bg-amber-950/60 border-amber-500/50 text-amber-200'
                }`}
              >
                <AlertOctagon
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    sensitiveNotice.isCritical ? 'text-red-400' : 'text-amber-400'
                  }`}
                />
                <div className="space-y-1 text-xs">
                  <strong className="text-sm font-bold block flex items-center space-x-1.5">
                    <span>⚠️ Before you continue</span>
                  </strong>
                  <p className="leading-relaxed">{sensitiveNotice.message}</p>
                  {sensitiveNotice.fieldsList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {sensitiveNotice.fieldsList.map((f, i) => (
                        <span
                          key={i}
                          className="bg-black/30 border border-current px-2 py-0.5 rounded text-[11px] font-mono"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Two-Column Grid: Why are we warning you? & What should I do? */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* WHY ARE WE WARNING YOU? */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Why are we warning you?</span>
                </h3>

                <div className="space-y-2 text-xs">
                  {currentScan.module3.primaryReasons.length > 0 ? (
                    currentScan.module3.primaryReasons.map((reason, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-slate-200">
                        <span className="text-amber-400 font-bold shrink-0 mt-0.5">•</span>
                        <span className="leading-relaxed">{humanizeReason(reason)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-start space-x-2 text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">
                        No major warning signs were detected in the website address structure or content.
                      </span>
                    </div>
                  )}

                  {/* Positive safety factors if present */}
                  {currentScan.module3.positiveFactors.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-1">
                      <span className="text-[11px] text-slate-500 font-medium block">Positive safety signals:</span>
                      {currentScan.module3.positiveFactors.map((pos, idx) => (
                        <div key={idx} className="flex items-start space-x-2 text-slate-400 text-[11px]">
                          <span className="text-emerald-400 font-bold shrink-0">✓</span>
                          <span>{pos}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* WHAT SHOULD I DO? */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>What should I do?</span>
                </h3>

                <div className="space-y-2 text-xs">
                  <p className="font-semibold text-white leading-relaxed pb-1 border-b border-slate-800/60">
                    {actionGuidance.primaryNotice}
                  </p>

                  <div className="space-y-1.5 pt-1">
                    {actionGuidance.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-slate-300">
                        <span className="text-blue-400 font-bold shrink-0">•</span>
                        <span className="leading-relaxed">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Quick Links to Explore the Other Dedicated Pages */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
              <span className="text-xs text-slate-400 font-medium">
                Want to see the full reasoning or technical verification?
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate('analysis')}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-lg text-xs font-medium transition-all"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Why this result was given →</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('validation')}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-all"
                >
                  <span>Website validation checks →</span>
                </button>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* When no scan is loaded yet */}
      {!currentScan && !isScanning && (
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-3">
          <div className="w-12 h-12 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 mx-auto">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">
            Real-Time Website Safety Shield
          </h3>
          <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
            PhishShield actively verifies web addresses, checks for lookalike domain fraud, inspects secure connection status, and detects deceptive password and payment collection forms.
          </p>
        </section>
      )}

    </div>
  );
};
