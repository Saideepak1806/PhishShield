import React from 'react';
import { Module2Result } from '../types';
import { Globe, Lock, ArrowRight, ShieldAlert, KeyRound, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

interface ModuleCard2Props {
  m2: Module2Result;
}

export const ModuleCard2: React.FC<ModuleCard2Props> = ({ m2 }) => {
  const val = m2.validation;
  const brand = m2.brand;
  const content = val.content;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-md space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-blue-500/10 border border-blue-500/30 rounded text-blue-400">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Module 2: Domain & Website Validation
            </h3>
            <p className="text-[11px] text-slate-400">
              Live DNS, SSL/TLS, Redirect chain, HTML forms & Brand Mismatch inspection
            </p>
          </div>
        </div>

        <span
          className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border uppercase ${
            m2.status === 'VALIDATED'
              ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
              : m2.status === 'SUSPICIOUS'
              ? 'bg-amber-950/80 text-amber-400 border-amber-500/40'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          Status: {m2.status}
        </span>
      </div>

      {/* Primary Technical Checks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 font-mono text-xs">
        {/* DNS Status */}
        <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-0.5">
          <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase font-bold">
            <span>DNS Resolution:</span>
            {val.dnsResolved ? (
              <span className="text-emerald-400 font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>OK</span>
              </span>
            ) : (
              <span className="text-red-400 font-bold">FAILED</span>
            )}
          </div>
          <span className="text-slate-300 font-bold block truncate text-xs">
            IP: {val.ipAddress || 'Unresolved'}
          </span>
        </div>

        {/* HTTPS / TLS */}
        <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-0.5">
          <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase font-bold">
            <span>TLS Encryption:</span>
            <Lock className={`w-3 h-3 ${val.isHttps ? 'text-emerald-400' : 'text-amber-400'}`} />
          </div>
          <span className={`font-bold block text-xs ${val.isHttps ? 'text-emerald-400' : 'text-amber-400'}`}>
            {val.isHttps ? 'HTTPS Encrypted' : 'Insecure HTTP'}
          </span>
        </div>

        {/* Redirect Count */}
        <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-0.5">
          <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase font-bold">
            <span>Redirects:</span>
            <span className="text-slate-500 text-[9px]">{val.fetchTimeMs}ms</span>
          </div>
          <span className={`font-bold block text-xs ${val.redirectCount > 1 ? 'text-amber-400' : 'text-slate-200'}`}>
            {val.redirectCount} redirects
          </span>
        </div>

        {/* Reachability */}
        <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-0.5">
          <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase font-bold">
            <span>HTTP Status:</span>
            <span className="text-slate-500 text-[9px]">{val.httpStatusCode || 'N/A'}</span>
          </div>
          <span className={`font-bold block text-xs ${val.accessible ? 'text-emerald-400' : 'text-red-400'}`}>
            {val.accessible ? '200 OK (Accessible)' : 'Inaccessible'}
          </span>
        </div>
      </div>

      {/* Redirect Chain Visualization */}
      {val.redirectChain.length > 1 && (
        <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1.5">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-bold tracking-wider">
            HTTP Redirect Chain ({val.redirectChain.length - 1} Hops):
          </span>
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
            {val.redirectChain.map((url, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ArrowRight className="w-3 h-3 text-blue-400 shrink-0" />}
                <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-300 truncate max-w-xs text-[11px]">
                  {url}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Brand / Domain Mismatch Box */}
      <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-bold tracking-wider">
            Brand Claim & Domain Mismatch Analysis:
          </span>
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
              brand.relationship === 'MATCH'
                ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30'
                : brand.relationship === 'MISMATCH'
                ? 'bg-red-950 text-red-400 border-red-500/40 font-bold animate-pulse'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            Relationship: {brand.relationship}
          </span>
        </div>

        {brand.detectedBrand ? (
          <div className="space-y-1 text-xs font-mono">
            <p className="text-slate-300">
              Claimed Brand Target: <span className="text-blue-400 font-bold">{brand.detectedBrand}</span>
            </p>
            <p className="text-slate-500 text-[10px]">
              Legitimate Official Domains: {brand.officialDomains.join(', ')}
            </p>
            {brand.relationship === 'MISMATCH' && (
              <div className="bg-red-950/60 border border-red-500/40 rounded p-2 text-red-300 flex items-start space-x-2 mt-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                <span className="text-xs">{brand.warning}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs font-mono text-slate-500">
            No known major brand claim detected in page content or domain metadata.
          </p>
        )}
      </div>

      {/* Credential & HTML Form Findings */}
      {content && (
        <div className="space-y-2 pt-1">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-bold tracking-wider">
            Webpage Content & Credential Inspection:
          </span>

          {content.title && (
            <div className="bg-slate-950 p-2 rounded border border-slate-800 text-xs font-mono flex items-center space-x-2">
              <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-500 text-[10px] uppercase font-bold">Title:</span>
              <span className="text-slate-200 font-semibold truncate">"{content.title}"</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs">
            <div className={`p-2.5 rounded border ${content.hasPasswordFields ? 'bg-red-950/60 border-red-500/40 text-red-300' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
              <div className="flex items-center space-x-1.5">
                <KeyRound className="w-3.5 h-3.5 text-red-400" />
                <span className="font-bold text-[11px]">Password Fields:</span>
              </div>
              <span className="text-xs font-bold block mt-1">
                {content.hasPasswordFields ? `DETECTED (${content.passwordFieldCount})` : 'NONE'}
              </span>
            </div>

            <div className={`p-2.5 rounded border ${content.hasPaymentFields || content.hasOtpFields ? 'bg-amber-950/60 border-amber-500/40 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
              <div className="flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold text-[11px]">Financial / OTP Inputs:</span>
              </div>
              <span className="text-xs font-bold block mt-1">
                {content.hasPaymentFields || content.hasOtpFields ? 'DETECTED' : 'NONE'}
              </span>
            </div>

            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
              <span className="text-slate-500 text-[9px] uppercase font-bold block">Hyperlink Metrics</span>
              <span className="font-bold text-xs block mt-0.5">
                {content.totalLinksCount} links ({Math.round(content.externalLinkRatio * 100)}% ext)
              </span>
            </div>
          </div>

          {content.mismatchedHyperlinks.length > 0 && (
            <div className="bg-red-950/60 border border-red-500/40 rounded p-2.5 text-xs font-mono space-y-1">
              <span className="text-red-400 font-bold uppercase tracking-wider block text-[10px]">
                🚨 Deceptive Hyperlinks Detected ({content.mismatchedHyperlinks.length}):
              </span>
              {content.mismatchedHyperlinks.map((link, idx) => (
                <div key={idx} className="bg-slate-950 p-2 rounded border border-red-500/30 text-red-300 text-[11px]">
                  Visible text: <span className="font-bold text-white">"{link.visibleText}"</span> → Href: <span className="font-bold text-amber-300">{link.actualHref}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!val.accessible && (
        <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-xs font-mono text-slate-400">
          <span className="text-amber-400 font-bold block mb-1">Live Network Validation Status:</span>
          {val.error || 'Target site was unreachable. DFA lexical scan remained active.'}
        </div>
      )}

    </div>
  );
};

