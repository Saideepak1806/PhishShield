import React, { useState } from 'react';
import { ScanResult, ThreatLevel } from '../types';
import { History, Search, Eye, Filter, ArrowRight, ExternalLink } from 'lucide-react';
import { getHumanThreatBadge, humanizeReason } from '../utils/languageHelpers';
import { ActivePage } from './Header';

interface ScanHistoryPageProps {
  scans: ScanResult[];
  onSelectScan: (scan: ScanResult) => void;
  onNavigate: (page: ActivePage) => void;
}

export const ScanHistoryPage: React.FC<ScanHistoryPageProps> = ({
  scans,
  onSelectScan,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  const filteredScans = scans.filter((s) => {
    const matchesFilter = selectedFilter === 'ALL' || s.threatLevel === selectedFilter;
    const matchesSearch =
      s.rawUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.summaryReason.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleInspect = (scan: ScanResult, targetPage: ActivePage = 'scan') => {
    onSelectScan(scan);
    onNavigate(targetPage);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-400 text-xs font-semibold uppercase tracking-wider">
              <History className="w-4 h-4" />
              <span>Persistent Scan Repository</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              Scan History
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              All website analyses recorded in SQLite. Select any previous scan to review its full safety results, reasons, and validation status.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search web addresses..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none text-xs"
              >
                <option value="ALL">All Risk Levels</option>
                <option value="SAFE">Low Risk Only</option>
                <option value="SUSPICIOUS">Suspicious Only</option>
                <option value="HIGH_RISK">High Risk Only</option>
                <option value="PHISHING">Phishing Only</option>
                <option value="UNAVAILABLE">Inaccessible Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="text-xs text-slate-400 flex items-center justify-between">
          <span>Showing {filteredScans.length} of {scans.length} saved scans</span>
          {scans.length === 0 && (
            <button
              onClick={() => onNavigate('scan')}
              className="text-blue-400 hover:text-blue-300 underline font-medium"
            >
              Analyze a website to add history →
            </button>
          )}
        </div>

        {/* Scans Table */}
        {filteredScans.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <p>No scan records match your filter criteria.</p>
            {scans.length === 0 && (
              <button
                onClick={() => onNavigate('scan')}
                className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-3.5 py-1.5 rounded-lg transition-colors"
              >
                <span>Run a scan now</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        ) : (
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
            <div className="overflow-x-auto max-h-[480px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] sticky top-0 bg-slate-950">
                    <th className="py-2.5 px-3">Date / Time</th>
                    <th className="py-2.5 px-3">Scanned Website</th>
                    <th className="py-2.5 px-3">Risk Score</th>
                    <th className="py-2.5 px-3">Verdict</th>
                    <th className="py-2.5 px-3">Key Safety Finding</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredScans.map((s) => {
                    const badge = getHumanThreatBadge(s.threatLevel);
                    return (
                      <tr key={s.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="py-2.5 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                          {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-white max-w-[200px] truncate" title={s.rawUrl}>
                          {s.normalizedUrl}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`font-black font-mono ${badge.textColor}`}>
                            {s.riskScore}
                            <span className="text-[10px] text-slate-500 font-normal">/100</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${badge.badgeClass}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 text-[11px] max-w-[240px] truncate font-sans" title={s.summaryReason}>
                          {humanizeReason(s.summaryReason)}
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center space-x-1.5">
                            <button
                              type="button"
                              onClick={() => handleInspect(s, 'scan')}
                              className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 rounded text-[11px] font-medium transition-colors"
                            >
                              View Result
                            </button>
                            <button
                              type="button"
                              onClick={() => handleInspect(s, 'analysis')}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-[11px] font-medium transition-colors"
                            >
                              Analysis
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </section>

    </div>
  );
};
