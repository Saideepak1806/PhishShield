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
import { BarChart3, PieChart as PieChartIcon, TrendingUp, ShieldAlert } from 'lucide-react';

interface AnalyticsChartsProps {
  stats: DashboardStats;
}

const COLORS = {
  SAFE: '#10b981',        // emerald
  SUSPICIOUS: '#f59e0b',  // amber
  HIGH_RISK: '#f97316',   // orange
  PHISHING: '#ef4444',    // red
  UNAVAILABLE: '#64748b', // slate
};

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ stats }) => {
  // Chart 1: Threat Distribution Data
  const threatData = [
    { name: 'SAFE', count: stats.threatDistribution.SAFE, fill: COLORS.SAFE },
    { name: 'SUSPICIOUS', count: stats.threatDistribution.SUSPICIOUS, fill: COLORS.SUSPICIOUS },
    { name: 'HIGH RISK', count: stats.threatDistribution.HIGH_RISK, fill: COLORS.HIGH_RISK },
    { name: 'PHISHING', count: stats.threatDistribution.PHISHING, fill: COLORS.PHISHING },
    { name: 'UNAVAILABLE', count: stats.threatDistribution.UNAVAILABLE, fill: COLORS.UNAVAILABLE },
  ].filter(d => d.count > 0 || stats.totalScans > 0);

  // Chart 2: Risk Score Timeline
  const timelineData = stats.recentScans
    .slice()
    .reverse()
    .map((scan, idx) => ({
      index: `#${idx + 1}`,
      url: scan.rawUrl.length > 20 ? scan.rawUrl.substring(0, 20) + '...' : scan.rawUrl,
      score: scan.riskScore,
    }));

  // Chart 3: Top Indicators Data
  const indicatorData = stats.topIndicators;

  // Chart 4: Module Comparison Data
  const moduleData = [
    { name: 'Module 1 (DFA Flags)', count: stats.moduleThreatCounts.module1Flags, fill: '#8b5cf6' },
    { name: 'Module 2 (Domain/HTML Flags)', count: stats.moduleThreatCounts.module2Flags, fill: '#3b82f6' },
  ];

  if (stats.totalScans === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 text-center text-slate-400 font-mono space-y-2">
        <BarChart3 className="w-6 h-6 text-slate-600 mx-auto" />
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">No Scan Analytics Available</h3>
        <p className="text-xs text-slate-500">Run a URL scan or click "DEMO SCAN" to populate real analytics charts.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Scanned URLs</span>
          <div className="text-2xl font-black text-white mt-0.5">{stats.totalScans}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Average Risk Score</span>
          <div className="text-2xl font-black text-blue-400 mt-0.5">{stats.averageRiskScore} <span className="text-xs text-slate-500 font-normal">/ 100</span></div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Phishing Detected</span>
          <div className="text-2xl font-black text-red-400 mt-0.5">{stats.threatDistribution.PHISHING + stats.threatDistribution.HIGH_RISK}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Safe Domains</span>
          <div className="text-2xl font-black text-emerald-400 mt-0.5">{stats.threatDistribution.SAFE}</div>
        </div>
      </div>

      {/* Grid of 4 Real Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Chart 1: Threat Level Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 shadow-md space-y-2">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
            <PieChartIcon className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Chart 1: Threat Classification Breakdown
            </h3>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={threatData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '4px', color: '#f8fafc', fontSize: '11px' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {threatData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Risk Score Timeline */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 shadow-md space-y-2">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Chart 2: Risk Score History Trend
            </h3>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="index" stroke="#64748b" fontSize={10} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '4px', color: '#f8fafc', fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#2563eb' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Top Detected Threat Indicators */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 shadow-md space-y-2">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Chart 3: Top Detected Threat Indicators
            </h3>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={indicatorData}>
                <XAxis type="number" stroke="#64748b" fontSize={10} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={9} width={120} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '4px', color: '#f8fafc', fontSize: '11px' }}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Module Findings Comparison */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 shadow-md space-y-2">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Chart 4: Module 1 vs Module 2 Findings
            </h3>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moduleData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '4px', color: '#f8fafc', fontSize: '11px' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {moduleData.map((entry, index) => (
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

