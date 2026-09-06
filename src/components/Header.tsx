import React from 'react';
import { Shield, ShieldAlert, Cpu, History, BarChart3, Globe, Search, FileText } from 'lucide-react';

export type ActivePage = 'scan' | 'analysis' | 'validation' | 'dfa' | 'analytics' | 'history';

interface HeaderProps {
  activeTab: ActivePage;
  setActiveTab: (tab: ActivePage) => void;
  totalScans: number;
  hasCurrentScan: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  totalScans,
  hasCurrentScan,
}) => {
  const navItems: Array<{ id: ActivePage; label: string; icon: React.FC<{ className?: string }>; disabled?: boolean; badge?: string }> = [
    { id: 'scan', label: 'Scan', icon: Search },
    { id: 'analysis', label: 'Analysis', icon: FileText, badge: hasCurrentScan ? undefined : undefined },
    { id: 'validation', label: 'Website Validation', icon: Globe },
    { id: 'dfa', label: 'DFA Inspector', icon: Cpu },
    { id: 'analytics', label: 'Threat Analytics', icon: BarChart3 },
    { id: 'history', label: 'Scan History', icon: History, badge: totalScans > 0 ? String(totalScans) : undefined },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5">
          
          {/* Logo & Branding */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveTab('scan')}
              className="flex items-center space-x-2.5 text-left group transition-all"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:bg-blue-500 transition-colors shrink-0">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-base font-bold tracking-tight text-white font-sans">
                    PHISH<span className="text-blue-500">SHIELD</span>
                  </h1>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border border-blue-500/30 bg-blue-950/60 text-blue-300">
                    Safety Shield
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                  Real-Time Website Safety Shield & Phishing Protection
                </p>
              </div>
            </button>

            {/* Quick status indicator on mobile */}
            <div className="flex items-center space-x-2 lg:hidden text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-400">Shield Active</span>
            </div>
          </div>

          {/* Navigation Bar */}
          <nav className="flex items-center space-x-1 overflow-x-auto pb-1 lg:pb-0 custom-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-blue-800 text-blue-100' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Shield Status Indicator (Desktop) */}
          <div className="hidden lg:flex items-center space-x-3 text-[11px] font-mono">
            <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-300">Protection: Active</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
