import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  History,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { api } from '../api';

export default function ConsentView() {
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState(null);

  const loadConsents = async () => {
    try {
      const res = await api.listConsents();
      setConsents(res.consents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsents();
  }, []);

  const handleRevoke = async (id) => {
    setRevokingId(id);
    try {
      await api.revokeConsent(id);
      await loadConsents();
    } catch (err) {
      alert(err.message || 'Revocation failed');
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-950 px-2.5 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-800/60 mb-2">
            <Lock className="h-3 w-3" />
            <span>DPDP Act 2023 & GDPR Consent Compliance</span>
          </div>
          <h2 className="text-xl font-bold text-white">Consent & Authorization Ledger</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable, timestamped audit log of all explicit permissions granted for scanning, data matching, and removal requests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Recorded Consents:</span>
          <span className="font-mono text-sm font-bold text-emerald-400">{consents.length}</span>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Consent ID</th>
                <th className="px-5 py-3.5 font-semibold">Scope of Action</th>
                <th className="px-5 py-3.5 font-semibold">Approved Action</th>
                <th className="px-5 py-3.5 font-semibold">Timestamp (UTC)</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold text-right">Revocation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">
                    Loading consent audit records...
                  </td>
                </tr>
              ) : consents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    No consent authorizations recorded yet. Every scan or removal request will generate a verifiable entry here.
                  </td>
                </tr>
              ) : (
                consents.map((item) => {
                  const isRevoked = !!item.revoked;
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-slate-400 text-[11px]">
                        {item.id.slice(0, 8)}...
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="rounded bg-slate-950 px-2 py-0.5 text-[10px] font-mono text-cyan-300 border border-slate-800">
                          {item.scope}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-200">
                        {item.approved_action}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-400 text-[11px]">
                        {new Date(item.authorized_at).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5">
                        {isRevoked ? (
                          <span className="inline-flex items-center gap-1 rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/20">
                            <XCircle className="h-3 w-3" />
                            <span>Revoked</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Active & Authorized</span>
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {!isRevoked ? (
                          <button
                            onClick={() => handleRevoke(item.id)}
                            disabled={revokingId === item.id}
                            className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-rose-300 hover:bg-rose-950/40 hover:border-rose-900/60 transition-colors cursor-pointer"
                          >
                            {revokingId === item.id ? 'Revoking...' : 'Revoke'}
                          </button>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-500">Revoked at {new Date(item.revoked_at).toLocaleDateString()}</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
