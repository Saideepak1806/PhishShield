import React from 'react';
import { ThreatLevel } from '../types';
import { ShieldCheck, ShieldAlert, AlertTriangle, HelpCircle, ExternalLink } from 'lucide-react';

interface ThreatGaugeProps {
  riskScore: number;
  threatLevel: ThreatLevel;
  rawUrl: string;
  finalUrl: string;
  timestamp: string;
  isDemo: boolean;
  alertMessage: {
    title: string;
    level: ThreatLevel;
    recommendation: string;
    summary: string;
  };
}

export const ThreatGauge: React.FC<ThreatGaugeProps> = ({
  riskScore,
  threatLevel,
  rawUrl,
  finalUrl,
  timestamp,
  isDemo,
  alertMessage,
}) => {
  const getBadgeStyle = (level: ThreatLevel) => {
    switch (level) {
      case 'SAFE':
        return {
          bg: 'bg-slate-900',
          border: 'border-emerald-500/40',
          text: 'text-emerald-400',
          strokeColor: 'border-emerald-500',
          icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
          label: 'SAFE WEBSITE',
        };
      case 'SUSPICIOUS':
        return {
          bg: 'bg-slate-900',
          border: 'border-amber-500/40',
          text: 'text-amber-400',
          strokeColor: 'border-amber-500',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
          label: 'SUSPICIOUS URL',
        };
      case 'HIGH_RISK':
        return {
          bg: 'bg-slate-900',
          border: 'border-orange-500/40',
          text: 'text-orange-400',
          strokeColor: 'border-orange-500',
          icon: <ShieldAlert className="w-5 h-5 text-orange-400" />,
          label: 'HIGH RISK THREAT',
        };
      case 'PHISHING':
        return {
          bg: 'bg-slate-900',
          border: 'border-red-500/50',
          text: 'text-red-500',
          strokeColor: 'border-red-500',
          icon: <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />,
          label: 'PHISHING DETECTED',
        };
      case 'UNAVAILABLE':
      default:
        return {
          bg: 'bg-slate-900',
          border: 'border-slate-700',
          text: 'text-slate-400',
          strokeColor: 'border-slate-600',
          icon: <HelpCircle className="w-5 h-5 text-slate-400" />,
          label: 'UNAVAILABLE SITE',
        };
    }
  };

  const badge = getBadgeStyle(threatLevel);

  return (
    <div className={`bg-slate-900 border ${badge.border} rounded-lg p-4 shadow-md relative overflow-hidden space-y-4`}>
      {isDemo && (
        <div className="absolute top-2.5 right-3 bg-slate-950 text-blue-400 border border-slate-800 text-[9px] uppercase tracking-wider font-mono px-2 py-0.5 rounded">
          DEMO MODE
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left Side: Dial Gauge */}
        <div className="flex flex-col items-center justify-center shrink-0 py-2">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">
            Threat Level Assessment
          </div>

          <div className="w-28 h-28 rounded-full border-8 border-slate-800 flex flex-col items-center justify-center relative shadow-inner">
            <div
              className={`absolute inset-0 rounded-full border-t-8 ${badge.strokeColor} transform rotate-[130deg]`}
            />
            <span className={`text-3xl font-black font-mono tracking-tight ${badge.text}`}>
              {riskScore}
            </span>
            <span className="text-[9px] text-slate-500 uppercase font-mono">Risk Score</span>
          </div>

          <div className="mt-2 text-center">
            <div className={`text-sm font-extrabold uppercase tracking-widest font-mono ${badge.text}`}>
              {badge.label}
            </div>
            <div className="text-[9px] text-slate-500 uppercase font-mono">
              0-24 SAFE | 25-49 SUSPICIOUS | 50-74 RISK | 75+ PHISH
            </div>
          </div>
        </div>

        {/* Right Side: Detailed Findings & Recommendations */}
        <div className="flex-1 space-y-3 w-full">
          <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-2">
            {badge.icon}
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              Security Evaluation Summary
            </h3>
          </div>

          <p className="text-xs font-mono text-slate-300 leading-relaxed">
            {alertMessage.summary}
          </p>

          <div className="bg-slate-950 border border-slate-800 rounded p-2.5 text-xs font-mono">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">
              Action Recommendation:
            </span>
            <p className={threatLevel === 'PHISHING' || threatLevel === 'HIGH_RISK' ? 'text-red-400 font-bold' : 'text-slate-300'}>
              {alertMessage.recommendation}
            </p>
          </div>
        </div>

      </div>

      {/* Target URL Line */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
        <div className="flex items-center space-x-2 truncate max-w-xl">
          <span className="text-slate-500">Target URL:</span>
          <span className="text-blue-400 font-semibold truncate">{rawUrl}</span>
          {finalUrl !== rawUrl && (
            <span className="text-amber-400 flex items-center space-x-1 shrink-0 text-[10px]">
              <ExternalLink className="w-3 h-3" />
              <span className="truncate">→ {finalUrl}</span>
            </span>
          )}
        </div>
        <div className="shrink-0 text-slate-500 text-[10px]">
          Timestamp: {new Date(timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

