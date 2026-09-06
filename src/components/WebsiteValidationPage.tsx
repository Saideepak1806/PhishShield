import React from 'react';
import { ScanResult } from '../types';
import { 
  Globe, 
  Lock, 
  Unlock, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  FileText, 
  KeyRound, 
  Layers, 
  ExternalLink,
  ShieldCheck,
  Server
} from 'lucide-react';
import { ActivePage } from './Header';

interface WebsiteValidationPageProps {
  currentScan: ScanResult | null;
  onNavigate: (page: ActivePage) => void;
}

export const WebsiteValidationPage: React.FC<WebsiteValidationPageProps> = ({
  currentScan,
  onNavigate,
}) => {
  if (!currentScan) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
        <div className="w-12 h-12 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 mx-auto">
          <Globe className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">No Website Validation Data Available</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Please run a scan first to see simple, clear status cards for website reachability, encryption, forms, and domain identity.
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

  const val = currentScan.module2.validation;
  const brand = currentScan.module2.brand;
  const content = val.content;

  // The 7 specific status checks requested:
  // 1. Website reachable
  // 2. HTTPS
  // 3. TLS
  // 4. Redirects
  // 5. Domain identity
  // 6. Login/password fields
  // 7. Suspicious content

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider block">
              Website Safety Checks
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              Website Validation
            </h2>
            <p className="text-xs font-mono text-slate-400 mt-1 break-all">
              {currentScan.normalizedUrl}
            </p>
          </div>

          <div className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
            <span>Response Time: </span>
            <span className="text-white font-bold">{val.fetchTimeMs} ms</span>
          </div>
        </div>
        <p className="text-xs text-slate-400 max-w-2xl pt-1">
          Each check inspects a different safety layer of the website — from transport encryption and redirection chains to identity verification and data entry forms.
        </p>
      </section>

      {/* Status Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* 1. Website Reachable */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Website Reachable</h3>
                <span className="text-[11px] text-slate-400">Server & DNS Availability</span>
              </div>
            </div>
            {val.accessible ? (
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-xs font-bold px-2.5 py-1 rounded-lg">
                Reachable (HTTP {val.httpStatusCode || 200})
              </span>
            ) : (
              <span className="bg-red-950 text-red-400 border border-red-500/40 text-xs font-bold px-2.5 py-1 rounded-lg">
                Unreachable
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {val.accessible
              ? `The server responded successfully at address ${val.ipAddress || 'online'}. Web browsers can load this page normally.`
              : `The website could not be reached (${val.error || 'Connection failed'}). Scammers frequently use disposable domains that go offline quickly.`}
          </p>
        </div>

        {/* 2. HTTPS */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">HTTPS Connection</h3>
                <span className="text-[11px] text-slate-400">Transport Security</span>
              </div>
            </div>
            {val.isHttps ? (
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-xs font-bold px-2.5 py-1 rounded-lg">
                Secure (HTTPS)
              </span>
            ) : (
              <span className="bg-amber-950 text-amber-400 border border-amber-500/40 text-xs font-bold px-2.5 py-1 rounded-lg">
                Insecure (HTTP)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {val.isHttps
              ? 'The website uses HTTPS, which scrambles your connection to prevent network eavesdropping. (Note: Many phishing sites also use HTTPS, so other checks remain crucial).'
              : 'The website uses unencrypted HTTP. Any passwords, messages, or details you enter could be intercepted by others on your Wi-Fi or network.'}
          </p>
        </div>

        {/* 3. TLS Certificate */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">TLS Certificate</h3>
                <span className="text-[11px] text-slate-400">Cryptographic Identity</span>
              </div>
            </div>
            {val.tlsValid ? (
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-xs font-bold px-2.5 py-1 rounded-lg">
                Valid TLS
              </span>
            ) : (
              <span className="bg-slate-800 text-slate-400 border border-slate-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                {val.isHttps ? 'Invalid TLS' : 'Not Applicable'}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {val.tlsValid
              ? 'A valid cryptographic certificate was verified. The browser handshake succeeded without certificate mismatch errors.'
              : 'No valid TLS certificate was detected. Avoid entering sensitive details or payments.'}
          </p>
        </div>

        {/* 4. Redirects */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Redirects</h3>
                <span className="text-[11px] text-slate-400">Navigation Hop Tracking</span>
              </div>
            </div>
            {val.redirectCount === 0 ? (
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-xs font-bold px-2.5 py-1 rounded-lg">
                Direct (0 redirects)
              </span>
            ) : val.redirectCount === 1 ? (
              <span className="bg-blue-950 text-blue-400 border border-blue-500/40 text-xs font-bold px-2.5 py-1 rounded-lg">
                1 Redirect
              </span>
            ) : (
              <span className="bg-amber-950 text-amber-400 border border-amber-500/40 text-xs font-bold px-2.5 py-1 rounded-lg">
                {val.redirectCount} Redirects
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {val.redirectCount === 0
              ? 'The link opens directly to the destination website without intermediate detour hops.'
              : `The link redirects through ${val.redirectCount} intermediate address(es). Scammers often chain redirects to bypass automated security scanners.`}
          </p>

          {/* Chain display if multiple */}
          {val.redirectChain.length > 1 && (
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Redirect Path:</span>
              {val.redirectChain.map((u, i) => (
                <div key={i} className="flex items-center space-x-1.5 truncate">
                  <span className="text-blue-400 font-bold">{i + 1}.</span>
                  <span className="truncate">{u}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 5. Domain Identity */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Domain Identity</h3>
                <span className="text-[11px] text-slate-400">Brand Impersonation Check</span>
              </div>
            </div>
            {brand.relationship === 'MISMATCH' ? (
              <span className="bg-red-950 text-red-400 border border-red-500/40 text-xs font-bold px-2.5 py-1 rounded-lg">
                Brand Mismatch
              </span>
            ) : brand.relationship === 'MATCH' ? (
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-xs font-bold px-2.5 py-1 rounded-lg">
                Official Match
              </span>
            ) : (
              <span className="bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                Standard Domain
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {brand.relationship === 'MISMATCH'
              ? `Warning: The website mimics '${brand.detectedBrand}', but its real web domain is '${brand.claimedHostname}'. The official domain is '${brand.officialDomains[0]}'.`
              : brand.relationship === 'MATCH'
              ? `Verified: This domain corresponds to the official web address for ${brand.detectedBrand}.`
              : 'No major global brand name was detected in the address or content. Standard domain verification applied.'}
          </p>
        </div>

        {/* 6. Login & Password Fields */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Login & Password Fields</h3>
                <span className="text-[11px] text-slate-400">Sensitive Credential Collection</span>
              </div>
            </div>
            {content?.hasPasswordFields ? (
              <span className="bg-red-950 text-red-400 border border-red-500/40 text-xs font-bold px-2.5 py-1 rounded-lg">
                Password Form Present
              </span>
            ) : content?.hasForms ? (
              <span className="bg-amber-950 text-amber-400 border border-amber-500/40 text-xs font-bold px-2.5 py-1 rounded-lg">
                General Form Present
              </span>
            ) : (
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-xs font-bold px-2.5 py-1 rounded-lg">
                No Login Fields
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {content?.hasPasswordFields
              ? 'This page contains a password input field. Entering credentials on an unverified site can allow attackers to steal your account access.'
              : content?.hasForms
              ? 'This webpage contains standard input forms (such as search boxes or contact forms) but no password fields were found.'
              : 'No interactive form submission inputs were identified on the inspected webpage.'}
          </p>
        </div>

        {/* 7. Suspicious Content */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md md:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Suspicious Content & Page Structure</h3>
                <span className="text-[11px] text-slate-400">External Links & Embeds</span>
              </div>
            </div>
            {(content?.externalLinkRatio || 0) > 0.6 ? (
              <span className="bg-amber-950 text-amber-400 border border-amber-500/40 text-xs font-bold px-2.5 py-1 rounded-lg">
                High External Link Ratio
              </span>
            ) : (
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-xs font-bold px-2.5 py-1 rounded-lg">
                Normal Page Structure
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Analyzed {content?.totalLinksCount || 0} total hyperlinks and page elements.{' '}
            {(content?.externalLinkRatio || 0) > 0.6
              ? `Noticeable concentration of links (${Math.round((content?.externalLinkRatio || 0) * 100)}%) lead off-site, which phishers often do to copy legitimate styling while harvesting data.`
              : 'Link structures and page references appear balanced without excessive external redirection tricks.'}
          </p>
        </div>

      </section>

    </div>
  );
};
