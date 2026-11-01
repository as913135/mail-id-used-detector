import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Search, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Activity, 
  ChevronRight,
  Database,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';

export default function DashboardView({ 
  summary, 
  scans = [], 
  onNavigate, 
  onQuickScan 
}) {
  const metrics = summary?.metrics || {
    total_findings: 0,
    high_risk_findings: 0,
    submitted_requests: 0,
    in_progress_requests: 0,
    verified_removals: 0,
    manual_required: 0,
    scans_count: 0,
    identifiers_count: 0
  };

  const recentActivity = summary?.recent_activity || [];

  // Compute overall privacy posture score
  let riskScore = 0;
  if (metrics.total_findings > 0) {
    riskScore = Math.min(100, Math.max(10, (metrics.high_risk_findings * 25) + (metrics.total_findings * 5)));
  }

  const getRiskLabel = (score) => {
    if (score >= 70) return { text: 'Critical Risk', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' };
    if (score >= 40) return { text: 'Elevated Exposure', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    if (score > 0) return { text: 'Moderate Risk', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' };
    return { text: 'Secure & Shielded', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
  };

  const riskBadge = getRiskLabel(riskScore);

  return (
    <div className="space-y-6">
      
      {/* Top Welcome & Posture Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 p-6 sm:p-8 shadow-xl">
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-950/70 border border-cyan-800/60 px-3 py-1 text-xs font-semibold text-cyan-300 mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Real-Time OSINT & Breach Intelligence Online</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Personal Data Exposure & Removal Command
            </h1>
            <p className="mt-2 max-w-2xl text-xs sm:text-sm text-slate-300 leading-relaxed">
              Discover where your mobile numbers, email addresses, and personal profiles are publicly exposed across databases, directories, and search indexes. Enforce lawful data removal under India DPDP Act 2023 and GDPR.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('scanner')}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-emerald-400 transition-all cursor-pointer"
              >
                <Search className="h-4 w-4" />
                <span>Launch New Live Scan</span>
              </button>
              <button
                onClick={() => onNavigate('removals')}
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/90 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
              >
                <FileText className="h-4 w-4 text-cyan-400" />
                <span>View Removal Workflows ({metrics.submitted_requests + metrics.in_progress_requests})</span>
              </button>
            </div>
          </div>

          {/* Privacy Posture Meter Card */}
          <div className="flex shrink-0 items-center gap-4 rounded-xl border border-slate-800 bg-slate-950/90 p-5 shadow-inner">
            <div className="relative flex h-24 w-24 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={riskScore > 50 ? 'text-rose-500' : riskScore > 20 ? 'text-amber-500' : 'text-emerald-500'}
                  strokeDasharray={`${riskScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-white font-mono">{riskScore}</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400">Risk Score</span>
              </div>
            </div>

            <div>
              <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold border uppercase tracking-wider ${riskBadge.bg} ${riskBadge.color} ${riskBadge.border}`}>
                {riskBadge.text}
              </span>
              <p className="mt-1 text-xs text-slate-300 font-medium">Digital Exposure Index</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {metrics.total_findings === 0 
                  ? 'No public exposures identified' 
                  : `${metrics.high_risk_findings} high-severity leaks require action`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Pillars Stages Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { stage: '1. Discover', title: 'Live Source Scan', desc: 'Real-time query of breaches, Git logs & caller directories', icon: Search, color: 'text-cyan-400' },
          { stage: '2. Analyze', title: 'Exposure Report', desc: 'Verify ownership, match confidence, and compromised fields', icon: Activity, color: 'text-amber-400' },
          { stage: '3. Request Removal', title: 'Consent & Erasure', desc: 'Generate DPDP / GDPR notices with pre-filled DPO mailto', icon: FileText, color: 'text-rose-400' },
          { stage: '4. Monitor', title: 'Verify & Re-check', desc: 'Confirm de-indexing and track reappearance of listings', icon: ShieldCheck, color: 'text-emerald-400' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition-all hover:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{item.stage}</span>
                <Icon className={`h-4 w-4 ${item.color}`} />
              </div>
              <h4 className="text-xs font-bold text-white">{item.title}</h4>
              <p className="mt-1 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Exposures */}
        <div 
          onClick={() => onNavigate('scanner')}
          className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm transition-all hover:border-slate-700 hover:shadow-cyan-500/5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Exposures Found</span>
            <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-400 group-hover:scale-110 transition-transform">
              <Search className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{metrics.total_findings}</span>
            <span className="text-[11px] text-slate-500">instances</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 flex items-center gap-1 group-hover:text-cyan-400 transition-colors">
            <span>View exposure details</span>
            <ArrowUpRight className="h-3 w-3" />
          </p>
        </div>

        {/* High / Critical Risk */}
        <div 
          onClick={() => onNavigate('scanner')}
          className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm transition-all hover:border-slate-700 hover:shadow-rose-500/5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">High / Critical Risk</span>
            <div className="rounded-xl bg-rose-500/10 p-2 text-rose-400 group-hover:scale-110 transition-transform">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-400 font-mono">{metrics.high_risk_findings}</span>
            <span className="text-[11px] text-rose-500/80">urgent leaks</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 flex items-center gap-1 group-hover:text-rose-400 transition-colors">
            <span>Includes passwords / phone</span>
            <ArrowUpRight className="h-3 w-3" />
          </p>
        </div>

        {/* Pending Requests */}
        <div 
          onClick={() => onNavigate('removals')}
          className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm transition-all hover:border-slate-700 hover:shadow-amber-500/5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Removals In Progress</span>
            <div className="rounded-xl bg-amber-500/10 p-2 text-amber-400 group-hover:scale-110 transition-transform">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{metrics.submitted_requests + metrics.in_progress_requests}</span>
            <span className="text-[11px] text-slate-500">submitted</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 flex items-center gap-1 group-hover:text-amber-400 transition-colors">
            <span>Track DPO responses</span>
            <ArrowUpRight className="h-3 w-3" />
          </p>
        </div>

        {/* Verified Removals */}
        <div 
          onClick={() => onNavigate('removals')}
          className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm transition-all hover:border-slate-700 hover:shadow-emerald-500/5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Verified Removed</span>
            <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400 font-mono">{metrics.verified_removals}</span>
            <span className="text-[11px] text-emerald-500/80">confirmed</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 flex items-center gap-1 group-hover:text-emerald-400 transition-colors">
            <span>Permanently deleted</span>
            <ArrowUpRight className="h-3 w-3" />
          </p>
        </div>

      </div>

      {/* Main Grid: Recent Scans & Activity Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Recent Scans History */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Search className="h-4 w-4 text-cyan-400" />
                <span>Recent Discovery Scans</span>
              </h3>
              <p className="text-xs text-slate-400">Verified public searches across live databases and directories</p>
            </div>
            <button
              onClick={() => onNavigate('scanner')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>New Scan</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-800/80">
            {scans.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-slate-500 mb-3">
                  <Search className="h-6 w-6" />
                </div>
                <h4 className="text-xs font-bold text-slate-300">No Privacy Scans Yet</h4>
                <p className="mt-1 text-[11px] text-slate-500 max-w-sm mx-auto">
                  Run your first scan with an email, phone number, or username to discover real public exposures.
                </p>
                <button
                  onClick={() => onNavigate('scanner')}
                  className="mt-4 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-colors cursor-pointer"
                >
                  Start Discovery Scan
                </button>
              </div>
            ) : (
              scans.slice(0, 5).map((scan) => (
                <div key={scan.id} className="py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-300 text-xs font-bold font-mono uppercase">
                      {scan.target_type[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white font-mono">{scan.target_value}</span>
                        <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-mono text-slate-400 uppercase">
                          {scan.target_type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                        <span>{new Date(scan.started_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{scan.sources_checked} sources checked</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className={`text-xs font-bold font-mono ${scan.findings_count > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {scan.findings_count} {scan.findings_count === 1 ? 'Finding' : 'Findings'}
                      </span>
                      <div className="text-[10px] text-slate-500">Risk Score: {scan.risk_score}/100</div>
                    </div>
                    <button
                      onClick={() => onQuickScan(scan.target_value, scan.target_type)}
                      className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                      title="Re-run Scan"
                    >
                      <Activity className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: Immutable Audit & Consent Activity */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-400" />
                <span>Audit & Consent Trail</span>
              </h3>
              <p className="text-xs text-slate-400">Verifiable activity records</p>
            </div>
            <button
              onClick={() => onNavigate('consent')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>Full Log</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-center py-8 text-xs text-slate-500">No activity logged yet.</p>
            ) : (
              recentActivity.map((act, i) => (
                <div key={i} className="flex items-start gap-2.5 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-cyan-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider">{act.action}</span>
                      <span className="text-[9px] text-slate-500">{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">{act.details}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
