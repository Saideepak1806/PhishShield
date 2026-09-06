import React from 'react';
import { DashboardStats } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Cell,
} from 'recharts';
import { BarChart3, TrendingUp, ShieldAlert, PieChart as PieChartIcon, ArrowRight } from 'lucide-react';
import { ActivePage } from './Header';

interface ThreatAnalyticsPageProps {
  stats: DashboardStats;
  onNavigate: (page: ActivePage) => void;
}

const COLORS = {
  SAFE: '#10b981',        // emerald (Low Risk)
  SUSPICIOUS: '#f59e0b',  // amber
  HIGH_RISK: '#f97316',   // orange
  PHISHING: '#ef4444',    // red
  UNAVAILABLE: '#64748b', // slate
};

export const ThreatAnalyticsPage: React.FC<ThreatAnalyticsPageProps> = ({ stats, onNavigate }) => {
  // Chart 1: Threat Distribution Data (using user-friendly labels)
  const threatData = [
    { name: 'Low Risk', count: stats.threatDistribution.SAFE, fill: COLORS.SAFE },
    { name: 'Suspicious', count: stats.threatDistribution.SUSPICIOUS, fill: COLORS.SUSPICIOUS },
    { name: 'High Risk', count: stats.threatDistribution.HIGH_RISK, fill: COLORS.HIGH_RISK },
    { name: 'Phishing', count: stats.threatDistribution.PHISHING, fill: COLORS.PHISHING },
    { name: 'Inaccessible', count: stats.threatDistribution.UNAVAILABLE, fill: COLORS.UNAVAILABLE },
  ].filter((d) => d.count > 0 || stats.totalScans > 0);

  // Chart 2: Risk Score Timeline
  const timelineData = stats.recentScans
    .slice()
    .reverse()
    .map((scan, idx) => ({
      index: `#${idx + 1}`,
      url: scan.rawUrl.length > 22 ? scan.rawUrl.substring(0, 22) + '...' : scan.rawUrl,
      score: scan.riskScore,
    }));

  // Chart 3: Top Indicators Data
  const indicatorData = stats.topIndicators;

  // Chart 4: Detection Layer Distribution
  const detectionLayerData = [
    { name: 'Address Anomalies (DFA)', count: stats.moduleThreatCounts.module1Flags, fill: '#8b5cf6' },
    { name: 'Website Inspection (HTML/DNS)', count: stats.moduleThreatCounts.module2Flags, fill: '#3b82f6' },
  ];

  if (stats.totalScans === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-xl">
        <div className="w-12 h-12 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 mx-auto">
          <BarChart3 className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">No Scan Analytics Available Yet</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Real database analytics will automatically generate as you scan websites. Run a test scan from the Scan page to begin populating real security statistics.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('scan')}
          className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-colors shadow-md"
        >
          <span>Run First Website Scan</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl space-y-1">
        <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider block">
          Telemetry & Security Trends
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Threat Analytics
        </h2>
        <p className="text-xs text-slate-400 max-w-2xl">
          Aggregated detection metrics and risk distributions derived directly from the persistent SQLite security database.
        </p>
      </section>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-md">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Total Scans Run</span>
          <div className="text-2xl font-black text-white mt-1 font-mono">{stats.totalScans}</div>
          <span className="text-[11px] text-slate-500">Persistent database records</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-md">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Average Risk Score</span>
          <div className="text-2xl font-black text-blue-400 mt-1 font-mono">
            {stats.averageRiskScore} <span className="text-xs text-slate-500 font-normal">/ 100</span>
          </div>
          <span className="text-[11px] text-slate-500">Mean across all scans</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-md">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Phishing & High Risk</span>
          <div className="text-2xl font-black text-red-400 mt-1 font-mono">
            {stats.threatDistribution.PHISHING + stats.threatDistribution.HIGH_RISK}
          </div>
          <span className="text-[11px] text-slate-500">Dangerous threats caught</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-md">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Low Risk Websites</span>
          <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
            {stats.threatDistribution.SAFE}
          </div>
          <span className="text-[11px] text-slate-500">Verified clean domains</span>
        </div>
      </div>

      {/* Grid of 4 Real Database Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Chart 1: Threat Level Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-3">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <PieChartIcon className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Threat Classification Breakdown
            </h3>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={threatData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {threatData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Risk Score Timeline */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-3">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Risk Score History Trend
            </h3>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="index" stroke="#64748b" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '11px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#2563eb' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Top Detected Threat Indicators */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-3">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Common Detected Warning Indicators
            </h3>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={indicatorData}>
                <XAxis type="number" stroke="#64748b" fontSize={11} allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} width={130} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Detection Layer Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-3">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Detection Layer Distribution
            </h3>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={detectionLayerData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {detectionLayerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
