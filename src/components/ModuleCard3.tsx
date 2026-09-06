import React, { useState } from 'react';
import { DashboardStats, Module3Result, ScanResult } from '../types';
import {
  Layers,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react';

interface ModuleCard3Props {
  m3: Module3Result;
  m1Score?: number;
  m2Score?: number;
  scansHistory?: ScanResult[];
  onSelectScan?: (scan: ScanResult) => void;
  stats?: DashboardStats | null;
  onClearHistory?: () => void;
}

export const ModuleCard3: React.FC<ModuleCard3Props> = ({
  m3,
  m1Score = 0,
  m2Score = 0,
  scansHistory = [],
  onSelectScan,
  stats,
  onClearHistory,
}) => {
  const [showItemized, setShowItemized] = useState(false);

  // Derive Module 1 vs Module 2 points from contributions if not directly passed
  const calculatedM1Score =
    m1Score ||
    m3.contributions
      .filter((c) => c.module === 'MODULE_1')
      .reduce((acc, c) => acc + Math.max(0, c.points), 0);

  const calculatedM2Score =
    m2Score ||
    m3.contributions
      .filter((c) => c.module === 'MODULE_2')
      .reduce((acc, c) => acc + Math.max(0, c.points), 0);

  const getThreatStyle = () => {
    switch (m3.threatLevel) {
      case 'PHISHING':
        return {
          bannerBg: 'bg-red-950/80 border-red-500/50 text-red-200',
          badgeBg: 'bg-red-900 text-red-100 border-red-500',
          title: 'THREAT DETECTED',
          icon: ShieldAlert,
          color: 'text-red-400',
        };
      case 'HIGH_RISK':
        return {
          bannerBg: 'bg-orange-950/80 border-orange-500/50 text-orange-200',
          badgeBg: 'bg-orange-900 text-orange-100 border-orange-500',
          title: 'HIGH RISK THREAT',
          icon: AlertTriangle,
          color: 'text-orange-400',
        };
      case 'SUSPICIOUS':
        return {
          bannerBg: 'bg-amber-950/80 border-amber-500/50 text-amber-200',
          badgeBg: 'bg-amber-900 text-amber-100 border-amber-500',
          title: 'SUSPICIOUS WEBSITE',
          icon: AlertTriangle,
          color: 'text-amber-400',
        };
      case 'SAFE':
      default:
        return {
          bannerBg: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200',
          badgeBg: 'bg-emerald-900 text-emerald-100 border-emerald-500',
          title: 'NO MAJOR THREATS FOUND',
          icon: ShieldCheck,
          color: 'text-emerald-400',
        };
    }
  };

  const style = getThreatStyle();
  const ThreatIcon = style.icon;

  const formatScanTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-md space-y-4">
      
      {/* Module 3 Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-blue-500/10 border border-blue-500/30 rounded text-blue-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Module 3: Threat Classification and User Alert Dashboard
            </h3>
            <p className="text-[11px] text-slate-400">
              Evidence-based risk aggregation, user alert notifications & persistent SQLite scan logs
            </p>
          </div>
        </div>

        <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border uppercase ${style.badgeBg}`}>
          {m3.threatLevel}
        </span>
      </div>

      {/* 1. Main Threat Result Card */}
      <div className={`border rounded-lg p-4 ${style.bannerBg} space-y-3`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-black/40 border border-white/10 shrink-0">
              <ThreatIcon className={`w-8 h-8 ${style.color}`} />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest block opacity-80">
                Threat Classification
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-mono tracking-tight">
                {style.title}
              </h2>
            </div>
          </div>

          <div className="flex items-baseline space-x-2 font-mono self-start sm:self-auto bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
            <span className="text-2xl sm:text-3xl font-black text-white">{m3.riskScore}</span>
            <span className="text-xs text-slate-400 font-bold">/ 100</span>
            <span className="text-xs font-bold uppercase ml-2 px-1.5 py-0.5 rounded bg-white/10">
              {m3.threatLevel}
            </span>
          </div>
        </div>

        {/* Dynamic Alert Header & Advice */}
        <div className="space-y-1.5">
          <p className="font-bold text-sm font-mono tracking-wide text-white">
            {m3.alertMessage.summary}
          </p>
          
          <div className="bg-black/40 rounded-lg p-3 border border-white/10 space-y-2 text-xs font-mono">
            <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider block">
              Recommendation & Actions:
            </span>
            <div className="whitespace-pre-line text-slate-200 leading-relaxed">
              {m3.alertMessage.recommendation}
            </div>
          </div>
        </div>

        {/* Score Breakdown (Module 1 + Module 2 = Total) */}
        <div className="bg-black/40 rounded-lg p-3 border border-white/10 font-mono text-xs space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider block">
            Score Breakdown:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-slate-200">
            <div className="bg-slate-900/80 p-2 rounded border border-white/10">
              <span className="text-slate-400 block text-[10px] uppercase">URL Pattern Analysis (Module 1)</span>
              <span className="font-bold text-sm text-blue-400">{calculatedM1Score} pts</span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded border border-white/10">
              <span className="text-slate-400 block text-[10px] uppercase">Website Validation (Module 2)</span>
              <span className="font-bold text-sm text-purple-400">{calculatedM2Score} pts</span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded border border-white/10">
              <span className="text-slate-400 block text-[10px] uppercase">Total Risk Score</span>
              <span className="font-bold text-sm text-white">
                {m3.riskScore} / 100 ({m3.threatLevel})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Itemized Evidence Breakdown Table */}
      <div className="border border-slate-800 rounded bg-slate-950">
        <button
          type="button"
          onClick={() => setShowItemized(!showItemized)}
          className="w-full px-3 py-2 bg-slate-900 hover:bg-slate-800/80 transition-all flex items-center justify-between text-xs font-mono font-semibold text-blue-400"
        >
          <span>ITEMIZED RISK EVIDENCE WEIGHTS ({m3.contributions.length} Factor Contributions)</span>
          {showItemized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showItemized && (
          <div className="p-2 overflow-x-auto max-h-[220px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left font-mono text-[11px] border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase text-[9px] sticky top-0 bg-slate-950">
                  <th className="py-1 px-2">Module</th>
                  <th className="py-1 px-2">Category</th>
                  <th className="py-1 px-2">Detected Indicator</th>
                  <th className="py-1 px-2">Severity</th>
                  <th className="py-1 px-2 text-right">Points Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {m3.contributions.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/60 transition-all">
                    <td className="py-1 px-2 text-slate-500 font-bold">{c.module}</td>
                    <td className="py-1 px-2 text-blue-400">{c.category}</td>
                    <td className="py-1 px-2 text-slate-200">{c.indicator}</td>
                    <td className="py-1 px-2">
                      <span className="text-[9px] uppercase font-bold px-1 py-0.5 rounded border bg-slate-900 border-slate-700">
                        {c.severity}
                      </span>
                    </td>
                    <td className="py-1 px-2 text-right font-extrabold">
                      {c.points > 0 ? (
                        <span className="text-red-400">+{c.points}</span>
                      ) : (
                        <span className="text-emerald-400">{c.points}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 2. Previous Scans Table (Stored in SQLite) */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200">
              Previous Scans (SQLite Persistent Storage)
            </span>
          </div>
          {scansHistory.length > 0 && onClearHistory && (
            <button
              onClick={onClearHistory}
              title="Reset scan history to initial empty state"
              className="text-[10px] font-mono text-slate-500 hover:text-red-400 flex items-center space-x-1 px-2 py-0.5 rounded hover:bg-slate-800 transition-all"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        <div className="border border-slate-800 rounded bg-slate-950 overflow-hidden">
          {scansHistory.length === 0 ? (
            <div className="p-4 text-center text-xs font-mono text-slate-400 space-y-1">
              <p className="text-slate-300 font-semibold">No scans yet.</p>
              <p className="text-[11px] text-slate-500">Run your first URL analysis.</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[220px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left font-mono text-[11px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px] sticky top-0 bg-slate-950">
                    <th className="py-1.5 px-3">Time</th>
                    <th className="py-1.5 px-3">URL</th>
                    <th className="py-1.5 px-3">Score</th>
                    <th className="py-1.5 px-3">Result</th>
                    <th className="py-1.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {scansHistory.map((scan) => {
                    const isPhish = scan.threatLevel === 'PHISHING';
                    const isHigh = scan.threatLevel === 'HIGH_RISK';
                    const isSusp = scan.threatLevel === 'SUSPICIOUS';
                    return (
                      <tr
                        key={scan.id}
                        onClick={() => onSelectScan?.(scan)}
                        className="hover:bg-slate-900 cursor-pointer transition-all"
                      >
                        <td className="py-1.5 px-3 text-slate-400 font-medium">
                          {formatScanTime(scan.timestamp)}
                        </td>
                        <td className="py-1.5 px-3 max-w-[240px] truncate font-medium text-slate-200">
                          {scan.rawUrl}
                        </td>
                        <td className="py-1.5 px-3 font-extrabold">{scan.riskScore}</td>
                        <td className="py-1.5 px-3">
                          <span
                            className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                              isPhish
                                ? 'bg-red-950 text-red-400 border-red-500/40'
                                : isHigh
                                ? 'bg-orange-950 text-orange-400 border-orange-500/40'
                                : isSusp
                                ? 'bg-amber-950 text-amber-400 border-amber-500/40'
                                : 'bg-emerald-950 text-emerald-400 border-emerald-500/40'
                            }`}
                          >
                            {scan.threatLevel}
                          </span>
                        </td>
                        <td className="py-1.5 px-3 text-right">
                          <span className="text-[10px] text-blue-400 hover:underline">
                            View
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 3. Summary Dashboard inside Module 3 */}
      {stats && (
        <div className="space-y-2 pt-1 border-t border-slate-800/80">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200">
              Module 3 Threat Statistics Dashboard
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-slate-500 block text-[9px] uppercase font-bold">Total Scans</span>
              <span className="text-lg font-bold text-white">{stats.totalScans}</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-slate-500 block text-[9px] uppercase font-bold">Clean / Safe</span>
              <span className="text-lg font-bold text-emerald-400">
                {stats.threatDistribution.SAFE}
              </span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-slate-500 block text-[9px] uppercase font-bold">Suspicious</span>
              <span className="text-lg font-bold text-amber-400">
                {stats.threatDistribution.SUSPICIOUS}
              </span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-slate-500 block text-[9px] uppercase font-bold">Phishing & High Risk</span>
              <span className="text-lg font-bold text-red-400">
                {stats.threatDistribution.PHISHING + stats.threatDistribution.HIGH_RISK}
              </span>
            </div>
          </div>

          {stats.topIndicators && stats.topIndicators.length > 0 && (
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800 font-mono text-xs space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">
                Top Detected Indicators Across Scans:
              </span>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {stats.topIndicators.slice(0, 5).map((ind, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[10px]"
                  >
                    {ind.indicator} ({ind.count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
