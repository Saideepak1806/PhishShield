import React, { useState } from 'react';
import { ScanResult } from '../types';
import { ModuleCard1 } from './ModuleCard1';
import { ModuleCard2 } from './ModuleCard2';
import { Cpu, Globe, Layers } from 'lucide-react';

interface TechnicalAnalysisProps {
  scan: ScanResult;
}

export const TechnicalAnalysis: React.FC<TechnicalAnalysisProps> = ({ scan }) => {
  const [activeView, setActiveView] = useState<'all' | 'm1' | 'm2'>('all');

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center space-x-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>TECHNICAL ANALYSIS: UNDERLYING DETECTIONS & VERIFICATION</span>
          </h3>
          <p className="text-[11px] text-slate-400 font-mono">
            Evidence gathered across deterministic finite automata (Module 1) and passive website inspection (Module 2)
          </p>
        </div>

        {/* View Switcher Chips */}
        <div className="flex items-center space-x-1.5 font-mono text-[11px] bg-slate-950 p-1 rounded-lg border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setActiveView('all')}
            className={`px-2.5 py-1 rounded transition-all ${
              activeView === 'all'
                ? 'bg-blue-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Modules
          </button>
          <button
            type="button"
            onClick={() => setActiveView('m1')}
            className={`px-2.5 py-1 rounded transition-all flex items-center space-x-1 ${
              activeView === 'm1'
                ? 'bg-blue-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3 h-3" />
            <span>Module 1 (DFA)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView('m2')}
            className={`px-2.5 py-1 rounded transition-all flex items-center space-x-1 ${
              activeView === 'm2'
                ? 'bg-blue-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>Module 2 (Validation)</span>
          </button>
        </div>
      </div>

      {/* Module Content */}
      <div className="space-y-4">
        {(activeView === 'all' || activeView === 'm1') && (
          <ModuleCard1 m1={scan.module1} />
        )}

        {(activeView === 'all' || activeView === 'm2') && (
          <ModuleCard2 m2={scan.module2} />
        )}
      </div>
    </section>
  );
};
