import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2, Lock, ArrowRight } from 'lucide-react';

export default function ConsentModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  targetValue, 
  targetType, 
  scope = 'scan' 
}) {
  const [agreedScope, setAgreedScope] = useState(true);
  const [agreedTerms, setAgreedTerms] = useState(true);

  if (!isOpen) return null;

  const isScan = scope === 'scan';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-950 border border-cyan-800/80 text-cyan-400">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {isScan ? 'User Authorization & Discovery Consent' : 'Remediation Authorization Consent'}
            </h3>
            <p className="text-xs text-slate-400">Verifiable Consent Record under DPDP Act 2023 & GDPR</p>
          </div>
        </div>

        <div className="my-4 space-y-3 text-xs text-slate-300">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-2">
            <div className="flex justify-between items-center text-[11px] text-slate-400">
              <span>Target Monitored Identifier:</span>
              <span className="font-mono text-cyan-400 uppercase font-semibold">{targetType}</span>
            </div>
            <div className="font-mono text-sm font-bold text-white break-all">
              {targetValue}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-200">Scope of Permitted Activity:</h4>
            <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
              <li>Query legitimate public indices, permitted APIs, and authorized breach records.</li>
              <li>Analyze match confidence and correlate exposure evidence with verified identifiers.</li>
              <li>Index no sensitive passwords or plain-text payload content; only metadata and breach references.</li>
              <li>Maintain an immutable audit trail of this authorization with cryptographic timestamping.</li>
            </ul>
          </div>

          <div className="pt-2 space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedScope}
                onChange={(e) => setAgreedScope(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
              />
              <span className="text-slate-300">
                I hereby declare that I am the legitimate owner or authorized representative of this identifier, and I consent to PrivaScan performing privacy analysis on it.
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
              />
              <span className="text-slate-300">
                I understand this consent can be reviewed or revoked anytime in the Consent & Audit hub.
              </span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!agreedScope || !agreedTerms}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-2 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-emerald-400 transition-all disabled:opacity-50 cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Authorize & Run Live Scan</span>
          </button>
        </div>

      </div>
    </div>
  );
}
