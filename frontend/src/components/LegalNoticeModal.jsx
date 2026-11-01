import React, { useState } from 'react';
import { X, Copy, Check, Send, Download, ShieldCheck, Scale, FileText } from 'lucide-react';

export default function LegalNoticeModal({ isOpen, onClose, noticeData, user }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !noticeData) return null;

  const notice = noticeData.generated_notice || {};
  const framework = noticeData.legal_framework || 'DPDP_2023';
  const targetEmail = noticeData.target_contact_email || notice.target_email || 'privacy@domain.com';
  const subject = notice.subject || `Demand for Erasure of Personal Data - ${user?.full_name || 'Data Principal'}`;
  const body = notice.body || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([`SUBJECT: ${subject}\nRECIPIENT: ${targetEmail}\n\n${body}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PrivaScan_Legal_Notice_${framework}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const mailtoUrl = notice.mailto_url || `mailto:${targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-950 border border-cyan-800/60 text-cyan-400">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Statutory Removal Demand Notice</span>
                <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-cyan-400 border border-cyan-500/20">
                  {framework === 'DPDP_2023' ? 'India DPDP Act 2023' : framework === 'GDPR_ART17' ? 'EU GDPR Art. 17' : 'CCPA § 1798.105'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">Target Fiduciary: <span className="text-slate-200 font-semibold">{noticeData.target_domain}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Target DPO bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/80 px-6 py-3 border-b border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-500 block">Recipient DPO Email:</span>
            <span className="text-cyan-300 font-mono font-semibold">{targetEmail}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Statutory Compliance Window:</span>
            <span className="text-emerald-400 font-medium">30 Days (Statutory Right)</span>
          </div>
        </div>

        {/* Notice Preview */}
        <div className="flex-1 overflow-y-auto p-6 font-mono text-xs text-slate-300 bg-slate-950/40 select-all leading-relaxed whitespace-pre-wrap border-b border-slate-800/80">
          {body}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/90 rounded-b-2xl">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-slate-400" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Text'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Download className="h-4 w-4 text-slate-400" />
              <span>Download .txt</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {noticeData.direct_opt_out_url && (
              <a
                href={noticeData.direct_opt_out_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-cyan-800/80 bg-cyan-950/40 px-3 py-2 text-xs font-medium text-cyan-300 hover:bg-cyan-900/60 transition-colors"
              >
                <span>Direct Opt-Out Portal</span>
              </a>
            )}
            <a
              href={mailtoUrl}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-emerald-400 transition-all cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span>Dispatch via Email (mailto:)</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
