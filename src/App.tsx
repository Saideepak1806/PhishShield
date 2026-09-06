import React, { useState, useEffect } from 'react';
import { DashboardStats, ScanResult } from './types';
import { Header, ActivePage } from './components/Header';
import { ScanPage } from './components/ScanPage';
import { AnalysisPage } from './components/AnalysisPage';
import { WebsiteValidationPage } from './components/WebsiteValidationPage';
import { DfaInspectorPage } from './components/DfaInspectorPage';
import { ThreatAnalyticsPage } from './components/ThreatAnalyticsPage';
import { ScanHistoryPage } from './components/ScanHistoryPage';
import { ScanDetailModal } from './components/ScanDetailModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActivePage>('scan');
  const [currentScan, setCurrentScan] = useState<ScanResult | null>(null);
  const [scansHistory, setScansHistory] = useState<ScanResult[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedInspectScan, setSelectedInspectScan] = useState<ScanResult | null>(null);

  // Load stats and history on startup
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [scansRes, statsRes] = await Promise.all([
        fetch('/api/scans'),
        fetch('/api/dashboard/stats'),
      ]);

      if (scansRes.ok) {
        const scansData = await scansRes.json();
        const scans: ScanResult[] = scansData.scans || [];
        setScansHistory(scans);
        if (scans.length > 0 && !currentScan) {
          setCurrentScan(scans[0]);
        }
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error('Failed to fetch initial dashboard data:', err);
    }
  };

  const handleScanUrl = async (url: string) => {
    setIsScanning(true);
    setError(null);
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || errData.details || 'Failed to analyze URL');
      }

      const scanResult: ScanResult = await res.json();
      setCurrentScan(scanResult);
      setActiveTab('scan');
      await fetchDashboardData();
    } catch (err: any) {
      setError(err.message || 'An error occurred during URL analysis.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleRunDemo = async (demoUrl?: string) => {
    setIsScanning(true);
    setError(null);
    try {
      const res = await fetch('/api/scan-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: demoUrl }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to run demo scan');
      }

      const scanResult: ScanResult = await res.json();
      setCurrentScan(scanResult);
      setActiveTab('scan');
      await fetchDashboardData();
    } catch (err: any) {
      setError(err.message || 'Failed to execute demo scan.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectFromHistory = (scan: ScanResult) => {
    setCurrentScan(scan);
  };

  return (
    <div className="min-w-full min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30 selection:text-blue-200 flex flex-col">
      
      {/* Top Fixed Header with 6 Dedicated Navigation Pages */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalScans={scansHistory.length}
        hasCurrentScan={Boolean(currentScan)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6">
        
        {/* PAGE 1: SCAN (Default user-friendly screen) */}
        {activeTab === 'scan' && (
          <ScanPage
            currentScan={currentScan}
            isScanning={isScanning}
            error={error}
            onScan={handleScanUrl}
            onRunDemo={handleRunDemo}
            onNavigate={setActiveTab}
          />
        )}

        {/* PAGE 2: ANALYSIS (Understandable explanation of why the result was given) */}
        {activeTab === 'analysis' && (
          <AnalysisPage
            currentScan={currentScan}
            onNavigate={setActiveTab}
          />
        )}

        {/* PAGE 3: WEBSITE VALIDATION (Checks explained simply) */}
        {activeTab === 'validation' && (
          <WebsiteValidationPage
            currentScan={currentScan}
            onNavigate={setActiveTab}
          />
        )}

        {/* PAGE 4: DFA INSPECTOR (Advanced technical DFA information) */}
        {activeTab === 'dfa' && (
          <DfaInspectorPage
            currentScan={currentScan}
            scansHistory={scansHistory}
            onSelectScan={handleSelectFromHistory}
            onNavigate={setActiveTab}
          />
        )}

        {/* PAGE 5: THREAT ANALYTICS (Real database-driven statistics and charts) */}
        {activeTab === 'analytics' && (
          <ThreatAnalyticsPage
            stats={stats || {
              totalScans: 0,
              threatDistribution: { SAFE: 0, SUSPICIOUS: 0, HIGH_RISK: 0, PHISHING: 0, UNAVAILABLE: 0 },
              averageRiskScore: 0,
              topIndicators: [],
              moduleThreatCounts: { module1Flags: 0, module2Flags: 0 },
              recentScans: [],
            }}
            onNavigate={setActiveTab}
          />
        )}

        {/* PAGE 6: SCAN HISTORY (Previous scans and their complete results) */}
        {activeTab === 'history' && (
          <ScanHistoryPage
            scans={scansHistory}
            onSelectScan={handleSelectFromHistory}
            onNavigate={setActiveTab}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>PhishShield Safety Shield • Finite Automata & Website Validation</span>
          <span>Never enter passwords or payments on unverified websites</span>
        </div>
      </footer>

      {/* Deep Audit Modal when triggered */}
      <ScanDetailModal
        scan={selectedInspectScan}
        onClose={() => setSelectedInspectScan(null)}
      />

    </div>
  );
}
