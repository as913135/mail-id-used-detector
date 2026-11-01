import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import ScanView from './components/ScanView';
import RemovalsView from './components/RemovalsView';
import IdentifiersView from './components/IdentifiersView';
import BrokersView from './components/BrokersView';
import ConsentView from './components/ConsentView';
import PricingView from './components/PricingView';
import SettingsView from './components/SettingsView';
import AuthModal from './components/AuthModal';
import LegalNoticeModal from './components/LegalNoticeModal';
import { api, getUser, setUser, getToken, setToken } from './api';
import { Shield, Sparkles, Scale, Lock, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [user, setCurrentUser] = useState(getUser());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  
  // App state
  const [summary, setSummary] = useState(null);
  const [identifiers, setIdentifiers] = useState([]);
  const [scans, setScans] = useState([]);
  const [removals, setRemovals] = useState([]);
  const [activeScan, setActiveScan] = useState(null);
  const [findings, setFindings] = useState([]);
  const [scanLoading, setScanLoading] = useState(false);
  const [activeNoticeModal, setActiveNoticeModal] = useState(null);

  // Load user data on startup if logged in
  const loadAllData = async () => {
    if (!getToken()) return;
    try {
      const [sumRes, idRes, scanRes, remRes] = await Promise.all([
        api.getSummary().catch(() => null),
        api.listIdentifiers().catch(() => ({ identifiers: [] })),
        api.listScans().catch(() => ({ scans: [] })),
        api.listRemovals().catch(() => ({ removal_requests: [] }))
      ]);

      if (sumRes) setSummary(sumRes);
      if (idRes) setIdentifiers(idRes.identifiers || []);
      if (scanRes) setScans(scanRes.scans || []);
      if (remRes) setRemovals(remRes.removal_requests || []);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  // Quick initial demo check: if no user, auto-prompt or load public stats
  useEffect(() => {
    if (!user) {
      // Prompt user or let them explore
    }
  }, []);

  const handleAuthSuccess = (authenticatedUser) => {
    setCurrentUser(authenticatedUser);
    loadAllData();
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setCurrentUser(null);
    setSummary(null);
    setIdentifiers([]);
    setScans([]);
    setRemovals([]);
    setFindings([]);
    setActiveTab('dashboard');
  };

  // Run live scan
  const handleRunScan = async (params) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    setScanLoading(true);
    setActiveTab('scanner');
    try {
      // 1. Grant consent record
      await api.grantConsent({
        scope: 'scan',
        approved_action: `Authorized public scan for ${params.target_value || 'monitored identifier'}`
      }).catch(() => null);

      // 2. Start real scan
      const res = await api.startScan(params);
      setActiveScan(res.scan);
      setFindings(res.findings || []);
      
      // 3. Reload dashboard summary & scans
      await loadAllData();
    } catch (err) {
      alert('Scan error: ' + err.message);
    } finally {
      setScanLoading(false);
    }
  };

  // Request Removal Workflow
  const handleRequestRemoval = async (finding) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    try {
      // 1. Grant consent for removal action
      await api.grantConsent({
        finding_id: finding.id,
        scope: 'dpdp_legal_notice',
        approved_action: `Authorized statutory erasure request against ${finding.source_name}`
      }).catch(() => null);

      // 2. Create removal request
      const res = await api.createRemoval({
        finding_id: finding.id,
        legal_framework: 'DPDP_2023',
        custom_notes: `Initiated via Exposure Finding: ${finding.page_reference || finding.source_name}`
      });

      // 3. Update findings status in memory
      setFindings((prev) =>
        prev.map((f) => (f.id === finding.id ? { ...f, status: 'removal_requested' } : f))
      );

      // 4. Open notice viewer modal
      setActiveNoticeModal(res.removal_request);

      // 5. Reload removals list & summary
      await loadAllData();
    } catch (err) {
      alert('Error initiating removal request: ' + err.message);
    }
  };

  // Update status of removal request
  const handleUpdateStatus = async (requestId, status) => {
    try {
      await api.updateRemovalStatus(requestId, { status });
      await loadAllData();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  // Add identifier
  const handleAddIdentifier = async (body) => {
    const res = await api.addIdentifier(body);
    setIdentifiers((prev) => [res.identifier, ...prev]);
    await loadAllData();
  };

  // Delete identifier
  const handleDeleteIdentifier = async (id) => {
    if (!window.confirm('Remove this identifier from active monitoring?')) return;
    try {
      await api.deleteIdentifier(id);
      setIdentifiers((prev) => prev.filter((i) => i.id !== id));
      await loadAllData();
    } catch (err) {
      alert('Error removing identifier: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 font-sans">
      
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content View Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        
        {activeTab === 'dashboard' && (
          <DashboardView
            summary={summary}
            scans={scans}
            onNavigate={(tab) => {
              if (!user && (tab === 'scanner' || tab === 'removals' || tab === 'identifiers')) {
                setIsAuthOpen(true);
              } else {
                setActiveTab(tab);
              }
            }}
            onQuickScan={(val, type) => {
              handleRunScan({ target_value: val, target_type: type });
            }}
          />
        )}

        {activeTab === 'scanner' && (
          <ScanView
            identifiers={identifiers}
            onRunScan={handleRunScan}
            onRequestRemoval={handleRequestRemoval}
            activeScan={activeScan}
            findings={findings}
            loading={scanLoading}
          />
        )}

        {activeTab === 'removals' && (
          <RemovalsView
            removals={removals}
            onUpdateStatus={handleUpdateStatus}
            user={user}
          />
        )}

        {activeTab === 'identifiers' && (
          <IdentifiersView
            identifiers={identifiers}
            onAddIdentifier={handleAddIdentifier}
            onDeleteIdentifier={handleDeleteIdentifier}
            onScanIdentifier={(idItem) => {
              handleRunScan({ identifier_id: idItem.id });
            }}
          />
        )}

        {activeTab === 'brokers' && (
          <BrokersView />
        )}

        {activeTab === 'consent' && (
          <ConsentView />
        )}

        {activeTab === 'pricing' && (
          <PricingView user={user} />
        )}

        {activeTab === 'settings' && (
          <SettingsView user={user} onLogout={handleLogout} />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-8 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/80">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <span className="font-mono font-bold text-slate-300">PrivaScan Platform</span>
              <p className="text-[11px] text-slate-400">Personal Data Exposure Discovery & Legal Erasure Management</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Real-Time OSINT Sources Online</span>
            </span>
            <span>•</span>
            <span className="text-slate-400">India DPDP Act 2023 Compliant</span>
            <span>•</span>
            <span className="text-slate-400">EU GDPR Art. 17 Ready</span>
            <span>•</span>
            <span className="text-slate-400">Zero Simulated/Mock Data</span>
          </div>

          <div className="text-slate-400 text-[11px]">
            © 2026 PrivaScan Technologies. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Notice Viewer Modal */}
      {activeNoticeModal && (
        <LegalNoticeModal
          isOpen={!!activeNoticeModal}
          onClose={() => setActiveNoticeModal(null)}
          noticeData={activeNoticeModal}
          user={user}
        />
      )}

    </div>
  );
}
