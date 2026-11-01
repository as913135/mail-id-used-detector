import React, { useState, useEffect } from 'react';
import { 
  Database, 
  ExternalLink, 
  Mail, 
  Clock, 
  Search, 
  Filter, 
  ShieldCheck, 
  Scale, 
  Globe2,
  ChevronRight
} from 'lucide-react';
import { api } from '../api';

export default function BrokersView() {
  const [brokers, setBrokers] = useState([]);
  const [filterRegion, setFilterRegion] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBrokers() {
      try {
        const res = await api.listBrokers();
        setBrokers(res.brokers || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadBrokers();
  }, []);

  const filtered = brokers.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.procedure.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterRegion === 'all') return true;
    if (filterRegion === 'india') return b.region.toLowerCase().includes('india');
    if (filterRegion === 'us') return b.region.toLowerCase().includes('us');
    if (filterRegion === 'b2b') return b.category.toLowerCase().includes('b2b');
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-950 px-2.5 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-800/60 mb-2">
            <Database className="h-3 w-3" />
            <span>Supported Source Connectors & Brokers</span>
          </div>
          <h2 className="text-xl font-bold text-white">Public Directory & Broker Registry</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Curated database of people search engines, telecom directories, and commercial aggregators with official removal procedures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Total Integrations:</span>
          <span className="font-mono text-sm font-bold text-cyan-400">{brokers.length}</span>
        </div>
      </div>

      {/* Search & Region Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search brokers (e.g. Truecaller, Justdial, Spokeo, B2B)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Global' },
            { id: 'india', label: 'India Focused' },
            { id: 'us', label: 'US Directories' },
            { id: 'b2b', label: 'B2B Sales Data' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterRegion(tab.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                filterRegion === tab.id
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading Broker Directory...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((b) => (
            <div
              key={b.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm transition-all hover:border-slate-700"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>{b.name}</span>
                    </h3>
                    <p className="text-[11px] text-cyan-400 font-medium mt-0.5">{b.category}</p>
                  </div>

                  <span className="rounded bg-slate-950 px-2 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-800">
                    {b.region}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
                  <span>Turnaround: <strong className="text-slate-200 font-mono">{b.turnaround_days} {b.turnaround_days === 1 ? 'day' : 'days'}</strong></span>
                </div>

                <div className="mt-3 rounded-xl bg-slate-950 p-3 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Standard Procedure
                  </span>
                  {b.procedure}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-800/80 pt-3">
                <span className="text-[10px] font-mono text-slate-500 truncate max-w-[140px]">
                  {b.jurisdiction}
                </span>

                <div className="flex items-center gap-2">
                  {b.privacy_email && (
                    <a
                      href={`mailto:${b.privacy_email}?subject=Personal%20Data%20Erasure%20Request&body=Please%20delete%20all%20my%20personal%20information%20from%20your%20records.`}
                      title={`Email DPO: ${b.privacy_email}`}
                      className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-300 hover:text-white transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                    </a>
                  )}

                  <a
                    href={b.opt_out_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-lg bg-cyan-950 border border-cyan-800/80 px-2.5 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/60 transition-colors"
                  >
                    <span>Opt-Out Portal</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
