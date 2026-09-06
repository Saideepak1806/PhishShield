import React, { useState } from 'react';
import { ScanResult } from '../types';
import { X, Copy, Check, ShieldAlert } from 'lucide-react';
import { ModuleCard1 } from './ModuleCard1';
import { ModuleCard2 } from './ModuleCard2';
import { ModuleCard3 } from './ModuleCard3';
import { ExplainabilityTimeline } from './ExplainabilityTimeline';

interface ScanDetailModalProps {
  scan: ScanResult | null;
  onClose: () => void;
}

export const ScanDetailModal: React.FC<ScanDetailModalProps> = ({ scan, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'modules' | 'json'>('modules');

  if (!scan) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(scan, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-lg w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center space-x-2.5">
            <ShieldAlert className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-xs font-bold text-white font-mono uppercase tracking-wide">
                Detailed Scan Audit: {scan.id}
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Scanned at {new Date(scan.timestamp).toLocaleString()} | Risk Score: {scan.riskScore}/100
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleCopyJson}
              className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1 rounded text-xs font-mono transition-all"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="px-4 py-1.5 border-b border-slate-800 bg-slate-900 flex items-center space-x-1.5 font-mono text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('modules')}
            className={`px-2.5 py-1 rounded font-bold uppercase text-[10px] tracking-wider transition-all ${
              activeTab === 'modules' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Module Breakdown
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`px-2.5 py-1 rounded font-bold uppercase text-[10px] tracking-wider transition-all ${
              activeTab === 'json' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Raw JSON Output
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          {activeTab === 'modules' ? (
            <>
              <ExplainabilityTimeline scan={scan} />
              <ModuleCard1 m1={scan.module1} />
              <ModuleCard2 m2={scan.module2} />
              <ModuleCard3 m3={scan.module3} />
            </>
          ) : (
            <pre className="bg-slate-950 p-3 rounded border border-slate-800 text-blue-300 font-mono text-[11px] overflow-x-auto custom-scrollbar">
              {JSON.stringify(scan, null, 2)}
            </pre>
          )}
        </div>

      </div>
    </div>
  );
};

