import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ExternalLink, 
  Send, 
  Scale, 
  ChevronRight, 
  ShieldCheck, 
  Filter,
  History,
  RotateCcw
} from 'lucide-react';
import LegalNoticeModal from './LegalNoticeModal';

export default function RemovalsView({ 
  removals = [], 
  onUpdateStatus, 
  user 
}) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const statusCategories = [
    { id: 'all', label: 'All Requests', count: removals.length },
    { id: 'submitted', label: 'Submitted (Pending)', count: removals.filter((r) => r.status === 'submitted').length, color: 'text-amber-400' },
    { id: 'in_progress', label: 'In Progress', count: removals.filter((r) => r.status === 'in_progress').length, color: 'text-cyan-400' },
    { id: 'verified_removed', label: 'Verified Removed', count: removals.filter((r) => r.status === 'verified_removed').length, color: 'text-emerald-400' },
    { id: 'manual_required', label: 'Manual Action Required', count: removals.filter((r) => r.status === 'manual_required').length, color: 'text-rose-400' },
  ];

  const filtered = removals.filter((r) => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  const handleStatusChange = async (requestId, newStatus) => {
    setUpdatingId(requestId);
    try {
      await onUpdateStatus(requestId, newStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-950 px-2.5 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-800/60 mb-2">
            <Scale className="h-3 w-3" />
            <span>Stages 3 & 4: Consent Remediation & Monitoring</span>
          </div>
          <h2 className="text-xl font-bold text-white">Removal & Progress Tracking Hub</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage authorized deletion requests, monitor statutory compliance deadlines, and record verified removals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Tracked Items:</span>
          <span className="font-mono text-sm font-bold text-cyan-400">{removals.length}</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {statusCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterStatus(cat.id)}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
              filterStatus === cat.id
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <span>{cat.label}</span>
            <span className={`rounded-full px-2 py-0.2 text-[10px] font-mono font-bold bg-slate-950 border border-slate-800 ${cat.color || 'text-slate-400'}`}>
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Removals List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-slate-500 mb-3">
            <FileText className="h-7 w-7 text-slate-400" />
          </div>
          <h3 className="text-sm font-bold text-white">No Removal Requests in this Category</h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
            {removals.length === 0
              ? 'Run a scan and click "Request Removal" on any finding to initiate a lawful erasure notice.'
              : 'Select another filter tab above to view your other active removal requests.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isVerified = item.status === 'verified_removed';
            const isSubmitted = item.status === 'submitted';
            const isInProgress = item.status === 'in_progress';
            const isManual = item.status === 'manual_required';

            const statusBadge = isVerified
              ? { text: 'Verified Removed', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' }
              : isInProgress
              ? { text: 'In Progress', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' }
              : isManual
              ? { text: 'Manual Action Required', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' }
              : { text: 'Submitted (Awaiting DPO)', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm transition-all hover:border-slate-700"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Left Column */}
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-cyan-400 border border-slate-700/80">
                      <Scale className="h-4 w-4" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{item.target_domain}</h4>
                        <span className={`rounded px-2 py-0.5 text-[10px] font-bold border uppercase tracking-wider ${statusBadge.bg} ${statusBadge.color} ${statusBadge.border}`}>
                          {statusBadge.text}
                        </span>
                        <span className="rounded bg-slate-950 px-2 py-0.5 text-[10px] font-mono text-cyan-300 border border-slate-800">
                          {item.legal_framework || 'DPDP_2023'}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span>Submitted: <strong className="text-slate-300 font-mono">{new Date(item.submitted_at).toLocaleDateString()}</strong></span>
                        {item.target_contact_email && (
                          <span>• DPO: <strong className="text-slate-300 font-mono">{item.target_contact_email}</strong></span>
                        )}
                        {item.verified_at && (
                          <span className="text-emerald-400">• Confirmed Deleted: {new Date(item.verified_at).toLocaleDateString()}</span>
                        )}
                      </div>

                      {item.notes && (
                        <p className="mt-2 text-xs text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                          Note: {item.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex shrink-0 flex-wrap sm:flex-nowrap items-center gap-2">
                    
                    {/* View Legal Notice button */}
                    <button
                      onClick={() => setSelectedNotice(item)}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      <FileText className="h-3.5 w-3.5 text-cyan-400" />
                      <span>View Notice</span>
                    </button>

                    {/* Direct Opt Out Link */}
                    {item.direct_opt_out_url && (
                      <a
                        href={item.direct_opt_out_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                      >
                        <span>Portal</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}

                    {/* Status updater dropdown */}
                    <select
                      value={item.status}
                      disabled={updatingId === item.id}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className="rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-2 text-xs font-semibold text-cyan-300 focus:border-cyan-500 focus:outline-none cursor-pointer"
                    >
                      <option value="submitted">Submitted</option>
                      <option value="in_progress">In Progress</option>
                      <option value="verified_removed">✓ Verified Removed</option>
                      <option value="manual_required">⚠ Manual Action Required</option>
                    </select>

                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Notice Viewer Modal */}
      {selectedNotice && (
        <LegalNoticeModal
          isOpen={!!selectedNotice}
          onClose={() => setSelectedNotice(null)}
          noticeData={selectedNotice}
          user={user}
        />
      )}

    </div>
  );
}
