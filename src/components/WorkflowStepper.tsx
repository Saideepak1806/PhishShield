import React from 'react';
import { DashboardStats, ScanResult, ThreatLevel } from '../types';
import { 
  Link2, 
  Cpu, 
  Globe, 
  Layers, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw,
  Sparkles,
  Check,
  AlertTriangle,
  Lock,
  Layers as LayersIcon,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { ModuleCard1 } from './ModuleCard1';
import { ModuleCard2 } from './ModuleCard2';
import { ModuleCard3 } from './ModuleCard3';
import { ThreatGauge } from './ThreatGauge';
import { ExplainabilityTimeline } from './ExplainabilityTimeline';

interface WorkflowStepperProps {
  currentScan: ScanResult | null;
  activeStep: number;
  setActiveStep: (step: number) => void;
  workflowMode: 'guided' | 'full';
  setWorkflowMode: (mode: 'guided' | 'full') => void;
  onResetScan?: () => void;
  scansHistory?: ScanResult[];
  stats?: DashboardStats | null;
  onSelectScan?: (scan: ScanResult) => void;
  onClearHistory?: () => void;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  currentScan,
  activeStep,
  setActiveStep,
  workflowMode,
  setWorkflowMode,
  onResetScan,
  scansHistory = [],
  stats,
  onSelectScan,
  onClearHistory,
}) => {
  const steps = [
    {
      num: 1,
      title: 'URL Link & Intake',
      shortTitle: 'URL Intake',
      icon: Link2,
      desc: 'URL normalization, protocol & component parsing',
      badge: currentScan ? 'READY' : 'INPUT REQUIRED',
      status: currentScan ? 'completed' : 'pending',
    },
    {
      num: 2,
      title: 'Module 1: DFA Automaton',
      shortTitle: 'DFA Automaton',
      icon: Cpu,
      desc: 'Lexical finite state-machine transition trace',
      badge: currentScan ? currentScan.module1.status : 'LOCKED',
      status: currentScan 
        ? currentScan.module1.status === 'CLEAN' ? 'success' : 'warning'
        : 'locked',
    },
    {
      num: 3,
      title: 'Module 2: Live Network & DOM',
      shortTitle: 'Live Domain',
      icon: Globe,
      desc: 'DNS, HTTPS, brand matching & credential inputs',
      badge: currentScan ? currentScan.module2.status : 'LOCKED',
      status: currentScan
        ? currentScan.module2.status === 'VALIDATED' ? 'success' : 'warning'
        : 'locked',
    },
    {
      num: 4,
      title: 'Module 3: Risk Scoring Engine',
      shortTitle: 'Risk Engine',
      icon: Layers,
      desc: 'Itemized mathematical evidence weighting',
      badge: currentScan ? `${currentScan.riskScore}/100` : 'LOCKED',
      status: currentScan ? 'completed' : 'locked',
    },
    {
      num: 5,
      title: 'Final Verdict & Recommendations',
      shortTitle: 'Threat Verdict',
      icon: ShieldAlert,
      desc: 'Security classification & mitigation actions',
      badge: currentScan ? currentScan.threatLevel : 'LOCKED',
      status: currentScan
        ? currentScan.threatLevel === 'SAFE' ? 'success' : 'danger'
        : 'locked',
    },
  ];

  const getStepColor = (status: string, isActive: boolean) => {
    if (isActive) {
      return 'bg-blue-600 text-white border-blue-400 ring-2 ring-blue-500/40 shadow-lg';
    }
    switch (status) {
      case 'completed':
      case 'success':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40 hover:bg-emerald-900/60';
      case 'warning':
        return 'bg-amber-950/80 text-amber-400 border-amber-500/40 hover:bg-amber-900/60';
      case 'danger':
        return 'bg-red-950/80 text-red-400 border-red-500/40 hover:bg-red-900/60';
      case 'locked':
      default:
        return 'bg-slate-900/80 text-slate-500 border-slate-800 opacity-60 cursor-not-allowed';
    }
  };

  return (
    <div className="space-y-4">
      {/* Stepper Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center space-x-2 font-mono">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Analysis Workflow Pipeline:
            </span>
            <span className="text-xs font-bold text-blue-400">
              {currentScan ? `Step ${activeStep} of 5: ${steps[activeStep - 1]?.title}` : 'Step 1: Enter URL Link to Start'}
            </span>
          </div>

          {/* Mode Switcher (Guided vs Full) */}
          <div className="flex items-center space-x-1.5 font-mono text-xs">
            <span className="text-[10px] text-slate-500 hidden md:inline">View Mode:</span>
            <button
              type="button"
              onClick={() => setWorkflowMode('guided')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-all flex items-center space-x-1 ${
                workflowMode === 'guided'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Step-by-Step</span>
            </button>
            <button
              type="button"
              onClick={() => setWorkflowMode('full')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-all flex items-center space-x-1 ${
                workflowMode === 'full'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Full Pipeline</span>
            </button>
          </div>
        </div>

        {/* 5-Step Horizontal Breadcrumb Tracker */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 font-mono">
          {steps.map((step) => {
            const Icon = step.icon;
            const isClickable = !!currentScan || step.num === 1;
            const isActive = activeStep === step.num;

            return (
              <button
                key={step.num}
                type="button"
                disabled={!isClickable}
                onClick={() => {
                  if (isClickable) setActiveStep(step.num);
                }}
                className={`p-2 rounded border text-left transition-all relative flex flex-col justify-between ${getStepColor(
                  step.status,
                  isActive
                )}`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="flex items-center space-x-1.5">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isActive ? 'bg-white text-blue-600' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {step.num}
                    </span>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-[8px] font-bold uppercase px-1 rounded ${
                    isActive ? 'bg-blue-800 text-white' : 'bg-slate-950 text-slate-400'
                  }`}>
                    {step.badge}
                  </span>
                </div>

                <div>
                  <span className="block text-[11px] font-bold truncate">
                    {step.shortTitle}
                  </span>
                  <span className={`block text-[9px] truncate ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                    {step.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Guided View: Content based on activeStep */}
      {workflowMode === 'guided' && (
        <div className="space-y-4">
          {/* If no scan is loaded yet */}
          {!currentScan && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center text-slate-400 font-mono space-y-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto">
                <Link2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold uppercase text-white tracking-wider">
                Step 1: Input URL Link to Start Pipeline
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Enter any target URL in the console above or click one of the quick test payloads to run through the 5-step detection workflow.
              </p>
            </div>
          )}

          {/* If scan is loaded, render the selected active step */}
          {currentScan && (
            <>
              {/* Step 1: URL Link & Normalization Decomposition */}
              {activeStep === 1 && (
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-md space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-1.5 bg-blue-500/10 border border-blue-500/30 rounded text-blue-400">
                        <Link2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                          Step 1: URL Intake & Component Decomposition
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          Lexical parsing, canonical normalization, and structural token isolation
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 uppercase">
                      ✓ Intake Ready
                    </span>
                  </div>

                  {/* URL Canonical Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                    <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Raw Input URL:</span>
                      <p className="text-blue-400 font-bold break-all text-xs">{currentScan.rawUrl}</p>
                    </div>

                    <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Normalized Canonical URL:</span>
                      <p className="text-emerald-400 font-bold break-all text-xs">{currentScan.normalizedUrl}</p>
                    </div>
                  </div>

                  {/* Components Breakdown Grid */}
                  <div className="space-y-1.5 font-mono">
                    <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">
                      Extracted Lexical Structure:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
                      <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                        <span className="text-slate-500 text-[9px] uppercase font-bold block">Protocol</span>
                        <span className="font-bold text-slate-200">{currentScan.module1.components.protocol || 'http'}</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                        <span className="text-slate-500 text-[9px] uppercase font-bold block">Hostname</span>
                        <span className="font-bold text-slate-200 truncate block">{currentScan.module1.components.hostname}</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                        <span className="text-slate-500 text-[9px] uppercase font-bold block">Main Domain</span>
                        <span className="font-bold text-slate-200 truncate block">{currentScan.module1.components.mainDomain}</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                        <span className="text-slate-500 text-[9px] uppercase font-bold block">TLD Extension</span>
                        <span className="font-bold text-slate-200">.{currentScan.module1.components.tld || 'com'}</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                        <span className="text-slate-500 text-[9px] uppercase font-bold block">Subdomains</span>
                        <span className={`font-bold ${currentScan.module1.components.subdomains.length > 2 ? 'text-amber-400' : 'text-slate-200'}`}>
                          {currentScan.module1.components.subdomains.length} ({currentScan.module1.components.subdomains.join('.') || 'None'})
                        </span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                        <span className="text-slate-500 text-[9px] uppercase font-bold block">Path Length</span>
                        <span className="font-bold text-slate-200">{currentScan.module1.components.path.length} chars</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Callout & Next Step Trigger */}
                  <div className="bg-blue-950/30 border border-blue-500/30 rounded p-3 text-xs font-mono text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-blue-400 font-bold uppercase tracking-wider block text-[10px]">
                        URL Intake Complete:
                      </span>
                      <p className="text-slate-400 text-[11px]">
                        URL components ready for feeding into the Module 1 Deterministic Finite Automaton.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveStep(2)}
                      className="inline-flex items-center justify-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded text-xs tracking-wider transition-colors shrink-0"
                    >
                      <span>Next: Module 1 (DFA Automaton)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Module 1 - Finite Automata */}
              {activeStep === 2 && (
                <div className="space-y-3">
                  <ModuleCard1 m1={currentScan.module1} />
                  
                  {/* Stepper Navigation Controls */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveStep(1)}
                      className="inline-flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-3 py-1.5 rounded font-mono text-xs transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>← Back to Step 1: URL Intake</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveStep(3)}
                      className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold px-4 py-1.5 rounded text-xs transition-colors"
                    >
                      <span>Next: Step 3 (Live Domain Check) →</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Module 2 - Live Domain & Content */}
              {activeStep === 3 && (
                <div className="space-y-3">
                  <ModuleCard2 m2={currentScan.module2} />

                  {/* Stepper Navigation Controls */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveStep(2)}
                      className="inline-flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-3 py-1.5 rounded font-mono text-xs transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>← Back to Step 2: DFA Automaton</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveStep(4)}
                      className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold px-4 py-1.5 rounded text-xs transition-colors"
                    >
                      <span>Next: Step 4 (Risk Scoring Engine) →</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Module 3 - Risk Scoring Engine */}
              {activeStep === 4 && (
                <div className="space-y-3">
                  <ModuleCard3
                    m3={currentScan.module3}
                    scansHistory={scansHistory}
                    stats={stats}
                    onSelectScan={onSelectScan}
                    onClearHistory={onClearHistory}
                  />

                  {/* Stepper Navigation Controls */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveStep(3)}
                      className="inline-flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-3 py-1.5 rounded font-mono text-xs transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>← Back to Step 3: Live Domain</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveStep(5)}
                      className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold px-4 py-1.5 rounded text-xs transition-colors"
                    >
                      <span>Next: Step 5 (Final Verdict) →</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 5: Final Verdict & Actions */}
              {activeStep === 5 && (
                <div className="space-y-4">
                  <ThreatGauge
                    riskScore={currentScan.riskScore}
                    threatLevel={currentScan.threatLevel}
                    rawUrl={currentScan.rawUrl}
                    finalUrl={currentScan.finalUrl}
                    timestamp={currentScan.timestamp}
                    isDemo={currentScan.isDemo}
                    alertMessage={currentScan.module3.alertMessage}
                  />

                  <ExplainabilityTimeline scan={currentScan} />

                  {/* Stepper Navigation Controls */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveStep(4)}
                      className="inline-flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-3 py-1.5 rounded font-mono text-xs transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>← Back to Step 4: Risk Scoring</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveStep(1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono font-bold px-3 py-1.5 rounded text-xs transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
                      <span>Restart Workflow from Step 1</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Full View: Render all modules stacked sequentially with step banners */}
      {workflowMode === 'full' && currentScan && (
        <div className="space-y-4">
          {/* Overall Threat Gauge */}
          <ThreatGauge
            riskScore={currentScan.riskScore}
            threatLevel={currentScan.threatLevel}
            rawUrl={currentScan.rawUrl}
            finalUrl={currentScan.finalUrl}
            timestamp={currentScan.timestamp}
            isDemo={currentScan.isDemo}
            alertMessage={currentScan.module3.alertMessage}
          />

          {/* Sequential Modules */}
          <div className="space-y-4">
            <div className="border-l-2 border-blue-500 pl-3 py-1">
              <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-wider">
                Step 2 / Pipeline Stage 1
              </span>
              <h4 className="text-xs font-bold text-white uppercase font-mono">Module 1: Finite Automata Lexical Analysis</h4>
            </div>
            <ModuleCard1 m1={currentScan.module1} />

            <div className="border-l-2 border-blue-500 pl-3 py-1">
              <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-wider">
                Step 3 / Pipeline Stage 2
              </span>
              <h4 className="text-xs font-bold text-white uppercase font-mono">Module 2: Domain & Live Website Validation</h4>
            </div>
            <ModuleCard2 m2={currentScan.module2} />

            <div className="border-l-2 border-blue-500 pl-3 py-1">
              <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-wider">
                Step 4 / Pipeline Stage 3
              </span>
              <h4 className="text-xs font-bold text-white uppercase font-mono">Module 3: Explainable Risk Scoring Engine</h4>
            </div>
            <ModuleCard3
              m3={currentScan.module3}
              scansHistory={scansHistory}
              stats={stats}
              onSelectScan={onSelectScan}
              onClearHistory={onClearHistory}
            />

            <div className="border-l-2 border-blue-500 pl-3 py-1">
              <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-wider">
                Step 5 / Decision Audit Trail
              </span>
              <h4 className="text-xs font-bold text-white uppercase font-mono">Explainability Pipeline Audit</h4>
            </div>
            <ExplainabilityTimeline scan={currentScan} />
          </div>
        </div>
      )}
    </div>
  );
};
