import React, { useState } from 'react';
import { 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  ExternalLink, 
  FileText, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Lock, 
  Layers, 
  ArrowRight,
  Filter,
  Eye,
  Info,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import ConsentModal from './ConsentModal';

export default function ScanView({ 
  identifiers = [], 
  onRunScan, 
  onRequestRemoval,
  activeScan,
  findings = [],
  loading = false
}) {
  const [selectedId, setSelectedId] = useState('');
  const [customValue, setCustomValue] = useState('');
  const [customType, setCustomType] = useState('email');
  const [isConsentOpen, setIsConsentOpen] = useState(false);
  const [expandedEvidence, setExpandedEvidence] = useState({});
  const [filterRisk, setFilterRisk] = useState('all');

  const handleStartScanClick = () => {
    let target = '';
    let type = '';

    if (selectedId) {
      const match = identifiers.find((i) => i.id === selectedId);
      if (match) {
        target = match.value;
        type = match.type;
      }
    } else if (customValue.trim()) {
      target = customValue.trim();
      type = customType;
    }

    if (!target) return;
    setIsConsentOpen(true);
  };

  const handleConfirmConsent = () => {
    if (selectedId) {
      onRunScan({ identifier_id: selectedId });
    } else {
      onRunScan({ target_value: customValue.trim(), target_type: customType });
    }
  };

  const toggleEvidence = (id) => {
    setExpandedEvidence((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getTargetDisplay = () => {
    if (selectedId) {
      const match = identifiers.find((i) => i.id === selectedId);
      return { val: match?.value || '', type: match?.type || 'email' };
    }
    return { val: customValue.trim(), type: customType };
  };

  const currentTarget = getTargetDisplay();

  const filteredFindings = findings.filter((f) => {
    if (filterRisk === 'all') return true;
    return f.risk_level === filterRisk;
  });

  return (
    <div className="space-y-6">
      
      {/* Search & Discovery Configuration Box */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-950 px-2.5 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-800/60 mb-2">
              <Sparkles className="h-3 w-3" />
              <span>Stage 1: Real-Life Discovery Engine</span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Public Exposure Scanner</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select a verified identifier or enter a contact point to scan legitimate public breach databases, directories, and search indexes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-emerald-400">Public Connectors Active</span>
          </div>
        </div>

        {/* Input Selector Form */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Option A: Pick from Monitored Identifiers */}
          <div className="md:col-span-5">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Monitored Identifier
            </label>
            <select
              value={selectedId}
              onChange={(e) => {
                setSelectedId(e.target.value);
                if (e.target.value) setCustomValue('');
              }}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="">-- Choose from your monitored IDs --</option>
              {identifiers.map((id) => (
                <option key={id.id} value={id.id}>
                  [{id.type.toUpperCase()}] {id.value}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-1 flex items-center justify-center text-xs font-mono text-slate-500">
            OR
          </div>

          {/* Option B: Enter Custom Search Value */}
          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Enter Direct Contact Point
            </label>
            <div className="flex gap-2">
              <select
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                disabled={!!selectedId}
                className="rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none disabled:opacity-40"
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="username">Username</option>
                <option value="name">Name</option>
              </select>
              <input
                type="text"
                placeholder={
                  customType === 'email' ? 'e.g. user@gmail.com' :
                  customType === 'phone' ? 'e.g. +91 9876543210' :
                  customType === 'username' ? 'e.g. dev_johndoe' : 'Full Name'
                }
                value={customValue}
                onChange={(e) => {
                  setCustomValue(e.target.value);
                  if (e.target.value) setSelectedId('');
                }}
                disabled={!!selectedId}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none disabled:opacity-40"
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="md:col-span-2 flex items-end">
            <button
              type="button"
              onClick={handleStartScanClick}
              disabled={loading || (!selectedId && !customValue.trim())}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-emerald-400 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Execute Scan</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Real Data Notice */}
        <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-500">
          <Info className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
          <span>Real-life searches only: All findings reflect authentic live database and directory records. Zero simulated mock entries.</span>
        </div>
      </div>

      {/* Loading Animation Card */}
      {loading && (
        <div className="rounded-2xl border border-cyan-800/60 bg-slate-900/90 p-8 text-center shadow-2xl backdrop-blur-md">
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin" />
            <Search className="h-6 w-6 text-cyan-400" />
          </div>
          <h3 className="mt-4 text-base font-bold text-white">Scanning Live Public Sources</h3>
          <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
            Querying XposedOrNot breach analytics, Gravatar directory, Git commit logs, and search dorks for <span className="font-mono text-cyan-300 font-semibold">{currentTarget.val}</span>...
          </p>
          <div className="mt-4 max-w-sm mx-auto h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 animate-pulse w-3/4 rounded-full" />
          </div>
        </div>
      )}

      {/* Exposure Findings Report */}
      {!loading && findings.length > 0 && (
        <div className="space-y-4">
          
          {/* Header & Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/90 p-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  Stage 2: Personal Exposure Report
                </h3>
                <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-xs font-bold text-rose-400 border border-rose-500/20 font-mono">
                  {findings.length} Exposures Discovered
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Target: <span className="font-mono text-cyan-300 font-semibold">{activeScan?.target_value || currentTarget.val}</span>
              </p>
            </div>

            {/* Risk Filters */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Filter className="h-3 w-3" />
                <span>Risk:</span>
              </span>
              {['all', 'critical', 'high', 'medium', 'low'].map((risk) => (
                <button
                  key={risk}
                  onClick={() => setFilterRisk(risk)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                    filterRisk === risk
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {risk}
                </button>
              ))}
            </div>
          </div>

          {/* Findings Cards List */}
          <div className="space-y-3">
            {filteredFindings.map((finding) => {
              const isCrit = finding.risk_level === 'critical';
              const isHigh = finding.risk_level === 'high';
              const isMed = finding.risk_level === 'medium';
              const isExpanded = !!expandedEvidence[finding.id];

              const badgeColor = isCrit
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : isHigh
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                : isMed
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

              return (
                <div
                  key={finding.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm transition-all hover:border-slate-700"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    {/* Source Info */}
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${badgeColor}`}>
                        {isCrit || isHigh ? <AlertTriangle className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{finding.source_name}</h4>
                          <span className={`rounded px-2 py-0.5 text-[10px] font-bold border uppercase tracking-wider ${badgeColor}`}>
                            {finding.risk_level} Risk
                          </span>
                          <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-400">
                            Confidence: {finding.confidence_level}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                          {finding.details}
                        </p>

                        {/* Exposed Data Types Badges */}
                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] font-semibold text-slate-500 mr-1">Compromised Fields:</span>
                          {(Array.isArray(finding.exposed_data_types) ? finding.exposed_data_types : []).map((type, idx) => (
                            <span
                              key={idx}
                              className="rounded-md bg-slate-950 px-2 py-0.5 text-[10px] font-mono text-slate-300 border border-slate-800"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 flex-wrap sm:flex-nowrap items-center gap-2 pt-2 md:pt-0">
                      <button
                        onClick={() => toggleEvidence(finding.id)}
                        className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Evidence</span>
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>

                      {finding.opt_out_url && (
                        <a
                          href={finding.opt_out_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
                        >
                          <span>Direct Link</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}

                      <button
                        onClick={() => onRequestRemoval(finding)}
                        className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-rose-500/20 hover:from-rose-600 hover:to-amber-600 transition-all cursor-pointer"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Request Removal</span>
                      </button>
                    </div>

                  </div>

                  {/* Expandable Raw Evidence Panel */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-800/80 text-xs">
                      <div className="rounded-xl bg-slate-950 p-4 font-mono text-slate-400 border border-slate-800/60 space-y-1.5">
                        <div className="text-slate-300 font-semibold mb-1">Verifiable Detection Metadata:</div>
                        <div><span className="text-slate-500">Source Category:</span> {finding.source_category}</div>
                        <div><span className="text-slate-500">Page Reference:</span> {finding.page_reference}</div>
                        <div><span className="text-slate-500">Detection Date:</span> {finding.detection_date}</div>
                        <div><span className="text-slate-500">Match Evidence:</span> {finding.raw_evidence}</div>
                        {finding.privacy_email && (
                          <div><span className="text-slate-500">Designated DPO Email:</span> <span className="text-cyan-400">{finding.privacy_email}</span></div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Empty State when no findings */}
      {!loading && findings.length === 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-slate-500 mb-3">
            <ShieldCheck className="h-7 w-7 text-emerald-400" />
          </div>
          <h3 className="text-sm font-bold text-white">Ready for Real-Life Scan</h3>
          <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
            Choose a monitored identifier above or enter an email, phone number, or username to initiate a live privacy investigation.
          </p>
        </div>
      )}

      {/* Consent Authorization Modal */}
      <ConsentModal
        isOpen={isConsentOpen}
        onClose={() => setIsConsentOpen(false)}
        onConfirm={handleConfirmConsent}
        targetValue={currentTarget.val}
        targetType={currentTarget.type}
        scope="scan"
      />

    </div>
  );
}
