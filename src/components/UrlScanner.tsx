import React, { useState } from 'react';
import { Search, Play, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';

interface UrlScannerProps {
  onScan: (url: string) => Promise<void>;
  onRunDemo: (url?: string) => Promise<void>;
  isScanning: boolean;
  error: string | null;
  activeStep?: number;
}

export const UrlScanner: React.FC<UrlScannerProps> = ({
  onScan,
  onRunDemo,
  isScanning,
  error,
  activeStep = 1,
}) => {
  const [urlInput, setUrlInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() || isScanning) return;
    onScan(urlInput.trim());
  };

  const sampleUrls = [
    { label: 'Legitimate (Wikipedia)', url: 'https://www.wikipedia.org', type: 'SAFE' },
    { label: 'Brand Mismatch (PayPal Fake)', url: 'http://paypal-security-update.account-verify.test/login', type: 'PHISHING' },
    { label: 'IP Address Host', url: 'http://192.0.2.10/login/paypal/verify', type: 'HIGH_RISK' },
    { label: 'Suspicious Keywords', url: 'http://login-verification-bank.test/secure/account', type: 'SUSPICIOUS' },
    { label: 'Clean (Python.org)', url: 'https://www.python.org/downloads', type: 'SAFE' },
  ];

  return (
    <div className={`bg-slate-900 border ${activeStep === 1 ? 'border-blue-500/50 ring-1 ring-blue-500/20' : 'border-slate-800'} rounded-lg p-3.5 shadow-md space-y-3`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
            <h1 className="text-lg sm:text-xl font-black text-white font-mono tracking-wide uppercase">
              PHISHSHIELD
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/80 text-blue-400 border border-blue-800">
              3-Module Security Pipeline
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 font-mono mt-0.5">
            Phishing URL Detection & Website Validation
          </p>
          <p className="text-[11px] text-slate-500 font-mono">
            Analyze a website before trusting it.
          </p>
        </div>

        <div className="text-right hidden md:block font-mono text-[10px] text-slate-500">
          <div>Module 1: Finite Automata (DFA)</div>
          <div>Module 2: Website Validation & Content</div>
          <div>Module 3: Threat Classification & Alert</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste URL here (e.g. https://example.com/login or http://paypal-verify.test)..."
              disabled={isScanning}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 px-3.5 text-xs sm:text-sm font-mono text-blue-300 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
            />
            {urlInput && (
              <button
                type="button"
                onClick={() => setUrlInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500 hover:text-slate-300"
              >
                CLEAR
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isScanning || !urlInput.trim()}
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0 cursor-pointer"
          >
            {isScanning ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>ANALYZING URL...</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4" />
                <span>ANALYZE URL</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => onRunDemo()}
            disabled={isScanning}
            className="flex items-center justify-center space-x-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-mono font-semibold text-xs uppercase tracking-wider px-3.5 py-2.5 rounded-lg transition-colors shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>DEMO SCAN</span>
          </button>
        </div>
      </form>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-900/30 border border-red-500/40 rounded p-2 flex items-center space-x-2 text-xs text-red-300 font-mono">
          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Sample Test Chips */}
      <div className="pt-2 border-t border-slate-800/80">
        <div className="flex items-center space-x-2 mb-1.5">
          <Play className="w-3 h-3 text-slate-500" />
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono">
            Quick Test Payloads:
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {sampleUrls.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setUrlInput(sample.url);
                onScan(sample.url);
              }}
              disabled={isScanning}
              className="group text-left px-2 py-1 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 transition-all text-[11px] font-mono flex items-center space-x-1.5"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  sample.type === 'SAFE'
                    ? 'bg-emerald-500'
                    : sample.type === 'SUSPICIOUS'
                    ? 'bg-amber-500'
                    : sample.type === 'HIGH_RISK'
                    ? 'bg-orange-500'
                    : 'bg-red-500'
                }`}
              />
              <span className="text-slate-300 group-hover:text-blue-400">{sample.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

