import React from 'react';
import { ScanResult, ThreatLevel } from '../types';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  XCircle,
  ExternalLink,
  HelpCircle,
  Info,
} from 'lucide-react';

interface ImmediateResultCardProps {
  scan: ScanResult;
}

export const ImmediateResultCard: React.FC<ImmediateResultCardProps> = ({ scan }) => {
  const { riskScore, threatLevel, rawUrl, finalUrl, module3 } = scan;

  const getThreatVisuals = (level: ThreatLevel) => {
    switch (level) {
      case 'PHISHING':
        return {
          cardBg: 'bg-red-950/40 border-red-500/50',
          badgeBg: 'bg-red-900/90 text-red-100 border-red-500',
          scoreColor: 'text-red-400',
          iconColor: 'text-red-400',
          dotColor: 'bg-red-500',
          title: '🚨 PHISHING WEBSITE DETECTED',
          icon: ShieldAlert,
        };
      case 'HIGH_RISK':
        return {
          cardBg: 'bg-orange-950/40 border-orange-500/50',
          badgeBg: 'bg-orange-900/90 text-orange-100 border-orange-500',
          scoreColor: 'text-orange-400',
          iconColor: 'text-orange-400',
          dotColor: 'bg-orange-500',
          title: '🔴 HIGH RISK THREAT',
          icon: AlertOctagon,
        };
      case 'SUSPICIOUS':
        return {
          cardBg: 'bg-amber-950/40 border-amber-500/50',
          badgeBg: 'bg-amber-900/90 text-amber-100 border-amber-500',
          scoreColor: 'text-amber-400',
          iconColor: 'text-amber-400',
          dotColor: 'bg-amber-500',
          title: '⚠️ SUSPICIOUS WEBSITE',
          icon: AlertTriangle,
        };
      case 'SAFE':
      default:
        return {
          cardBg: 'bg-emerald-950/40 border-emerald-500/50',
          badgeBg: 'bg-emerald-900/90 text-emerald-100 border-emerald-500',
          scoreColor: 'text-emerald-400',
          iconColor: 'text-emerald-400',
          dotColor: 'bg-emerald-500',
          title: '✓ NO MAJOR PHISHING INDICATORS DETECTED',
          icon: ShieldCheck,
        };
    }
  };

  const visuals = getThreatVisuals(threatLevel);
  const IconComponent = visuals.icon;

  // Derive score contributions
  const m1Points = module3.contributions
    .filter((c) => c.module === 'MODULE_1')
    .reduce((acc, c) => acc + Math.max(0, c.points), 0);

  const m2Points = module3.contributions
    .filter((c) => c.module === 'MODULE_2')
    .reduce((acc, c) => acc + Math.max(0, c.points), 0);

  const positiveDeductions = module3.contributions
    .filter((c) => c.points < 0)
    .reduce((acc, c) => acc + Math.abs(c.points), 0);

  // Dynamic "What Should You Do?" items based on threat level
  const getActionItems = () => {
    if (threatLevel === 'PHISHING' || threatLevel === 'HIGH_RISK') {
      return [
        '🚫 Do not enter your password',
        '🚫 Do not share OTPs (one-time passwords)',
        '🚫 Do not enter card or banking details',
        '🚫 Do not upload personal identity documents',
        '🚫 Do not make payments through this site',
      ];
    }
    if (threatLevel === 'SUSPICIOUS') {
      return [
        '⚠️ Verify the website address carefully before continuing',
        '⚠️ Do not enter credentials until authenticity is confirmed',
        '⚠️ Look for verified official domain names of the organization',
      ];
    }
    return [
      '✓ No immediate credential harvesting threats detected',
      '✓ Exercise standard browsing caution before entering personal data',
      '✓ Confirm website domain matches expected official address',
    ];
  };

  const actionItems = getActionItems();

  return (
    <section className={`bg-slate-900 border ${visuals.cardBg} rounded-xl p-5 shadow-2xl space-y-5 transition-all`}>
      {/* 1. Header Banner with Score & Threat Level */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${visuals.dotColor} animate-pulse`} />
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400">
              Immediate Threat Result
            </span>
            {scan.isDemo && (
              <span className="bg-blue-950 text-blue-400 border border-blue-800 text-[9px] uppercase font-mono px-2 py-0.2 rounded">
                DEMO TEST DATA
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white flex items-center space-x-2">
            <span>{visuals.title}</span>
          </h2>
          <p className="text-xs sm:text-sm font-mono text-slate-300">
            {module3.alertMessage.summary}
          </p>
        </div>

        {/* Large Threat Score Display */}
        <div className="flex items-center space-x-4 bg-slate-950/80 border border-slate-800 p-3 rounded-xl shrink-0 self-start md:self-auto">
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
            <IconComponent className={`w-8 h-8 ${visuals.iconColor}`} />
          </div>
          <div className="font-mono">
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Threat Risk Score
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className={`text-3xl sm:text-4xl font-black ${visuals.scoreColor}`}>
                {riskScore}
              </span>
              <span className="text-xs text-slate-500 font-bold">/ 100</span>
            </div>
            <div className="text-[10px] font-extrabold uppercase mt-0.5">
              <span className={`px-2 py-0.5 rounded border text-[9px] ${visuals.badgeBg}`}>
                {threatLevel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Target URL Reference */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-2.5 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono text-slate-400 gap-2">
        <div className="flex items-center space-x-2 truncate">
          <span className="text-slate-500 uppercase font-bold text-[10px]">Scanned URL:</span>
          <span className="text-blue-400 font-semibold truncate">{rawUrl}</span>
          {finalUrl && finalUrl !== rawUrl && (
            <span className="text-amber-400 flex items-center space-x-1 text-[11px] truncate">
              <ExternalLink className="w-3 h-3 shrink-0" />
              <span>→ {finalUrl}</span>
            </span>
          )}
        </div>
        <div className="text-slate-500 text-[10px] shrink-0">
          Timestamp: {new Date(scan.timestamp).toLocaleTimeString()}
        </div>
      </div>

      {/* 2. Three Key Analytical Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        
        {/* WHY IS THIS RISKY? / WHAT LOOKS NORMAL? */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/90 space-y-3">
          <div>
            <span className="text-[11px] uppercase font-bold text-amber-400 tracking-wider flex items-center space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>WHY IS THIS RISKY? ({module3.primaryReasons.length} Findings)</span>
            </span>
            {module3.primaryReasons.length === 0 ? (
              <p className="text-slate-500 text-[11px] mt-1.5 italic">
                No major suspicious indicators detected during scan.
              </p>
            ) : (
              <ul className="mt-2 space-y-1.5 text-slate-200">
                {module3.primaryReasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-[11px]">
                    <span className="text-red-400 font-bold shrink-0">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Positive Normal Factors */}
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center space-x-1.5">
              <CheckCircle2 className="w-3 h-3" />
              <span>WHAT LOOKS NORMAL? ({module3.positiveFactors.length} Factors)</span>
            </span>
            <ul className="mt-1.5 space-y-1 text-slate-300">
              {module3.positiveFactors.map((factor, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-[11px]">
                  <span className="text-emerald-400 font-bold shrink-0">✓</span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* WHAT SHOULD YOU DO? */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/90 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[11px] uppercase font-bold text-blue-400 tracking-wider flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5" />
              <span>WHAT SHOULD YOU DO?</span>
            </span>
            <ul className="space-y-1.5 text-slate-200">
              {actionItems.map((action, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-[11px]">
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded text-[11px] text-slate-300">
            <span className="text-slate-500 uppercase font-bold block text-[9px] mb-0.5">
              Recommended Action:
            </span>
            <p className="leading-relaxed">{module3.alertMessage.recommendation}</p>
          </div>
        </div>

      </div>

      {/* 3. HOW WAS THIS SCORE CALCULATED? (Transparent Risk Breakdown) */}
      <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 font-mono text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            HOW WAS THIS SCORE CALCULATED?
          </span>
          <span className="text-[10px] text-slate-500">
            Evidence-based weighted accumulation (0–100 scale)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-slate-200">
          <div className="bg-slate-900 p-2 rounded border border-slate-800">
            <span className="text-slate-500 block text-[9px] uppercase font-bold">
              Module 1 (URL DFA Patterns)
            </span>
            <span className="font-extrabold text-sm text-blue-400">+{m1Points} pts</span>
          </div>

          <div className="bg-slate-900 p-2 rounded border border-slate-800">
            <span className="text-slate-500 block text-[9px] uppercase font-bold">
              Module 2 (Website Validation)
            </span>
            <span className="font-extrabold text-sm text-purple-400">+{m2Points} pts</span>
          </div>

          <div className="bg-slate-900 p-2 rounded border border-slate-800">
            <span className="text-slate-500 block text-[9px] uppercase font-bold">
              Positive Security Signals
            </span>
            <span className="font-extrabold text-sm text-emerald-400">
              {positiveDeductions > 0 ? `-${positiveDeductions}` : '0'} pts
            </span>
          </div>

          <div className="bg-slate-900 p-2 rounded border border-slate-800">
            <span className="text-slate-500 block text-[9px] uppercase font-bold">
              Final Evidence Risk Score
            </span>
            <span className={`font-black text-sm ${visuals.scoreColor}`}>
              {riskScore} / 100 ({threatLevel})
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
