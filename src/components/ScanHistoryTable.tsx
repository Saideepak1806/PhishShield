import React, { useState } from 'react';
import { ScanResult, ThreatLevel } from '../types';
import { History, Search, Eye, Filter } from 'lucide-react';

interface ScanHistoryTableProps {
  scans: ScanResult[];
  onSelectScan: (scan: ScanResult) => void;
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
}

export const ScanHistoryTable: React.FC<ScanHistoryTableProps> = ({
  scans,
  onSelectScan,
  selectedFilter,
  setSelectedFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredScans = scans.filter((s) => {
    const matchesFilter = selectedFilter === 'ALL' || s.threatLevel === selectedFilter;
    const matchesSearch =
      s.rawUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.summaryReason.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getThreatBadge = (level: ThreatLevel) => {
    switch (level) {
      case 'SAFE':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30';
      case 'SUSPICIOUS':
        return 'bg-amber-950/80 text-amber-400 border-amber-500/30';
      case 'HIGH_RISK':
        return 'bg-orange-950/80 text-orange-400 border-orange-500/30';
      case 'PHISHING':
        return 'bg-red-950/80 text-red-400 border-red-500/30';
      case 'UNAVAILABLE':
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-md space-y-3">
      {/* Table Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-blue-500/10 border border-blue-500/30 rounded text-blue-400">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Scan Logs & Audit Repository
            </h3>
            <p className="text-[11px] text-slate-400">
              Persistent SQLite scan database ({scans.length} total records)
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2">
          {/* Search Input */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by URL or key finding..."
              className="w-full bg-slate-950 border border-slate-800 rounded pl-8 pr-2.5 py-1 text-xs text-slate-200 placeholder-slate-600 font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-slate-300 w-full sm:w-auto">
            <Filter className="w-3 h-3 text-slate-500 shrink-0" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none text-[11px]"
            >
              <option value="ALL">All Threat Levels</option>
              <option value="SAFE">SAFE</option>
              <option value="SUSPICIOUS">SUSPICIOUS</option>
              <option value="HIGH_RISK">HIGH RISK</option>
              <option value="PHISHING">PHISHING</option>
              <option value="UNAVAILABLE">UNAVAILABLE</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Body */}
      {filteredScans.length === 0 ? (
        <div className="text-center py-8 text-slate-500 font-mono text-xs bg-slate-950 rounded border border-slate-800">
          No scan records match current search filter.
        </div>
      ) : (
        <div className="border border-slate-800 rounded overflow-hidden bg-slate-950">
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase text-[9px] bg-slate-900 sticky top-0">
                  <th className="py-2 px-2.5">Time</th>
                  <th className="py-2 px-2.5">Target URL</th>
                  <th className="py-2 px-2.5">Score</th>
                  <th className="py-2 px-2.5">Classification</th>
                  <th className="py-2 px-2.5">Primary Finding</th>
                  <th className="py-2 px-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 text-[11px]">
                {filteredScans.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => onSelectScan(s)}
                    className="hover:bg-slate-900/80 transition-all cursor-pointer group"
                  >
                    <td className="py-2 px-2.5 text-slate-500 shrink-0 text-[10px]">
                      {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-2 px-2.5 max-w-xs truncate font-semibold text-slate-200 group-hover:text-blue-400">
                      {s.rawUrl}
                    </td>
                    <td className="py-2 px-2.5 font-bold font-mono">
                      {s.riskScore}
                    </td>
                    <td className="py-2 px-2.5">
                      <span
                        className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${getThreatBadge(
                          s.threatLevel
                        )}`}
                      >
                        {s.threatLevel}
                      </span>
                    </td>
                    <td className="py-2 px-2.5 text-slate-400 max-w-sm truncate text-[10px]">
                      {s.summaryReason}
                    </td>
                    <td className="py-2 px-2.5 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectScan(s);
                        }}
                        className="inline-flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 px-2 py-0.5 rounded text-[10px] transition-all font-mono"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

