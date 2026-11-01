import React, { useState } from 'react';
import { 
  Settings, 
  Download, 
  Trash2, 
  ShieldCheck, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  FileText,
  HelpCircle,
  X
} from 'lucide-react';
import { api, setToken, setUser } from '../api';

export default function SettingsView({ user, onLogout }) {
  const [exporting, setExporting] = useState(false);
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [purging, setPurging] = useState(false);
  const [purgeSuccess, setPurgeSuccess] = useState(false);

  const handleExportData = async () => {
    setExporting(true);
    try {
      const data = await api.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PrivaScan_Data_Portability_${user?.id || 'export'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Export failed: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  const handlePurgeAccount = async () => {
    setPurging(true);
    try {
      await api.purgeAccount();
      setPurgeSuccess(true);
      setTimeout(() => {
        setToken(null);
        setUser(null);
        onLogout();
      }, 2000);
    } catch (err) {
      alert('Purge failed: ' + err.message);
      setPurging(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-950 px-2.5 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-800/60 mb-2">
            <Settings className="h-3 w-3" />
            <span>DPDP Section 12 & GDPR Rights</span>
          </div>
          <h2 className="text-xl font-bold text-white">Privacy Controls & Data Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Exercise your statutory rights to data portability, consent review, and permanent erasure of account records.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Data Portability Export */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                <Download className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Data Portability Export</h3>
                <p className="text-xs text-slate-400">Download your complete privacy archive</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Export an encrypted, machine-readable JSON archive containing all your monitored identifiers, scan histories, discovered exposure findings, consent logs, and removal notices.
            </p>

            <div className="mt-4 rounded-xl bg-slate-950 p-3 border border-slate-800/80 text-[11px] text-slate-400 space-y-1 font-mono">
              <div>• Format: JSON (RFC 8259 Compliant)</div>
              <div>• Legal Basis: DPDP Act 2023 / GDPR Art. 20</div>
              <div>• Scope: Full Relational History</div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={handleExportData}
              disabled={exporting}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Download className="h-4 w-4 text-cyan-400" />
              <span>{exporting ? 'Generating JSON Package...' : 'Download My Privacy Archive (.json)'}</span>
            </button>
          </div>
        </div>

        {/* Card 2: Right to Erasure / Purge */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-950 text-rose-400 border border-rose-800/60">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Permanent Account Erasure</h3>
                <p className="text-xs text-rose-400/80">Irrevocable data purge</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Exercise your Right to Erasure under Section 12 of the DPDP Act 2023. Permanently destroy your account, monitored identifiers, past scan records, and active removal trackers from PrivaScan servers.
            </p>

            <div className="mt-4 rounded-xl bg-rose-950/20 p-3 border border-rose-900/40 text-[11px] text-rose-300 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Zero Retention Guarantee</span>
              </div>
              <p>Once confirmed, your encryption keys and database records are purged immediately.</p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={() => setShowPurgeModal(true)}
              className="flex items-center gap-2 rounded-xl bg-rose-950/40 border border-rose-800/80 px-4 py-2.5 text-xs font-bold text-rose-300 hover:bg-rose-900/60 transition-colors cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              <span>Purge All Records & Delete Account</span>
            </button>
          </div>
        </div>

      </div>

      {/* Realistic Service Boundaries Box */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-xs text-slate-400 space-y-2">
        <h4 className="font-bold text-slate-200 flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-cyan-400" />
          <span>Statutory Transparency & Realistic Boundaries</span>
        </h4>
        <p className="leading-relaxed">
          PrivaScan facilitates lawful removal requests and queries publicly available directories, authorized breach indices, and public search engines. No automated system can promise universal erasure of all internet data, as third-party backups or offshore uncooperative databases may exist beyond statutory reach. We provide verified tracking, official DPO links, and statutory demand generation to maximize your legal rights under applicable privacy laws.
        </p>
      </div>

      {/* Confirmation Modal */}
      {showPurgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-rose-900/80 bg-slate-900 p-6 shadow-2xl">
            <button
              onClick={() => setShowPurgeModal(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-950 text-rose-400 border border-rose-800">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirm Permanent Erasure</h3>
                <p className="text-xs text-rose-300">This action cannot be undone</p>
              </div>
            </div>

            {purgeSuccess ? (
              <div className="py-4 text-center text-xs font-bold text-emerald-400">
                Account and all associated records permanently purged. Redirecting...
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-300 mb-5 leading-relaxed">
                  Are you absolutely certain you want to purge all identifiers, scan logs, consent records, and removal requests associated with <strong className="text-white font-mono">{user?.email}</strong>?
                </p>

                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setShowPurgeModal(false)}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePurgeAccount}
                    disabled={purging}
                    className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 transition-colors disabled:opacity-50"
                  >
                    {purging ? 'Purging All Data...' : 'Yes, Permanently Delete'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
