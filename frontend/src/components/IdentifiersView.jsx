import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Trash2, 
  Search, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  X,
  Mail,
  Phone,
  User,
  AtSign
} from 'lucide-react';

export default function IdentifiersView({ 
  identifiers = [], 
  onAddIdentifier, 
  onDeleteIdentifier, 
  onScanIdentifier 
}) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [idType, setIdType] = useState('email');
  const [idValue, setIdValue] = useState('');
  const [revealed, setRevealed] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleReveal = (id) => {
    setRevealed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!idValue.trim()) return;
    setError('');
    setLoading(true);
    try {
      await onAddIdentifier({ type: idType, value: idValue.trim() });
      setIdValue('');
      setIsAddOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to add identifier');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4 text-cyan-400" />;
      case 'phone': return <Phone className="h-4 w-4 text-emerald-400" />;
      case 'username': return <AtSign className="h-4 w-4 text-amber-400" />;
      default: return <User className="h-4 w-4 text-slate-300" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-950 px-2.5 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-800/60 mb-2">
            <Layers className="h-3 w-3" />
            <span>Monitored Digital Identifiers</span>
          </div>
          <h2 className="text-xl font-bold text-white">Identity Footprint Registry</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure the contact points and public personas actively monitored across public sources.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-emerald-400 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Monitored Identifier</span>
        </button>
      </div>

      {/* Identifiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {identifiers.map((item) => {
          const isRev = !!revealed[item.id];
          const displayVal = isRev ? item.value : item.masked_value;

          return (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm transition-all hover:border-slate-700"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 border border-slate-800">
                      {getTypeIcon(item.type)}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                      {item.type}
                    </span>
                  </div>

                  <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Verified</span>
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2 rounded-xl bg-slate-950 p-3 border border-slate-800/80">
                  <span className="font-mono text-xs font-bold text-white truncate">{displayVal}</span>
                  <button
                    onClick={() => toggleReveal(item.id)}
                    title={isRev ? 'Mask identifier' : 'Show full value'}
                    className="rounded p-1 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {isRev ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Added: {new Date(item.created_at).toLocaleDateString()}</span>
                  <span>Active Defense</span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-2 border-t border-slate-800/80 pt-3">
                <button
                  onClick={() => onScanIdentifier(item)}
                  className="flex items-center gap-1.5 rounded-lg border border-cyan-800/60 bg-cyan-950/40 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/60 transition-colors cursor-pointer"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>Scan Now</span>
                </button>

                <button
                  onClick={() => onDeleteIdentifier(item.id)}
                  title="Remove from monitoring"
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-950/40 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Identifier Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <button
              onClick={() => setIsAddOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="h-5 w-5 text-cyan-400" />
              <span>Add Identifier for Monitoring</span>
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Your sensitive data is encrypted at rest and never shared with unauthorized parties.
            </p>

            {error && (
              <div className="mt-3 rounded-lg border border-rose-900/60 bg-rose-950/40 p-2.5 text-xs text-rose-300">
                {error}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Identifier Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'email', label: 'Email' },
                    { id: 'phone', label: 'Phone' },
                    { id: 'username', label: 'Username' },
                    { id: 'name', label: 'Full Name' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setIdType(t.id)}
                      className={`rounded-xl py-2 text-xs font-semibold border transition-all ${
                        idType === t.id
                          ? 'bg-cyan-500/10 border-cyan-500/60 text-cyan-300'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Value to Monitor
                </label>
                <input
                  type="text"
                  required
                  value={idValue}
                  onChange={(e) => setIdValue(e.target.value)}
                  placeholder={
                    idType === 'email' ? 'e.g. user@gmail.com' :
                    idType === 'phone' ? 'e.g. +91 9876543210' :
                    idType === 'username' ? 'e.g. dev_johndoe' : 'e.g. Johnathan Doe'
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-emerald-400 transition-all disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Save Identifier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
