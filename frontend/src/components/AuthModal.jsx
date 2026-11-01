import React, { useState } from 'react';
import { X, Shield, Lock, Mail, User, ArrowRight, Sparkles } from 'lucide-react';
import { api, setToken, setUser } from '../api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      if (isRegister) {
        if (!fullName.trim()) throw new Error('Please enter your full legal name');
        res = await api.register({
          email: email.trim().toLowerCase(),
          password,
          full_name: fullName.trim()
        });
      } else {
        res = await api.login({
          email: email.trim().toLowerCase(),
          password
        });
      }

      setToken(res.token);
      setUser(res.user);
      onAuthSuccess(res.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setError('');
    setLoading(true);
    const demoEmail = 'privacy.user@privascan.app';
    const demoPass = 'PrivaScanDemo2026!';
    try {
      let res;
      try {
        res = await api.login({ email: demoEmail, password: demoPass });
      } catch {
        res = await api.register({
          email: demoEmail,
          password: demoPass,
          full_name: 'Privacy Advocate'
        });
      }
      setToken(res.token);
      setUser(res.user);
      onAuthSuccess(res.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Demo access failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-cyan-500/10">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 to-emerald-500 shadow-md shadow-cyan-500/20">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-3 text-xl font-bold text-white">
            {isRegister ? 'Create Your Privacy Account' : 'Welcome to PrivaScan'}
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            {isRegister
              ? 'Secure, encrypted access to your digital exposure dashboard'
              : 'Sign in to discover exposed data and manage legal removal requests'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="mt-5 grid grid-cols-2 gap-1 rounded-xl bg-slate-950 p-1 border border-slate-800/80">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(''); }}
            className={`rounded-lg py-1.5 text-xs font-semibold transition-all ${
              !isRegister
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(''); }}
            className={`rounded-lg py-1.5 text-xs font-semibold transition-all ${
              isRegister
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-rose-900/60 bg-rose-950/40 p-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Legal Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-emerald-400 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">Processing...</span>
            ) : (
              <>
                <span>{isRegister ? 'Register & Verify Identifier' : 'Access Privacy Dashboard'}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Track */}
        <div className="mt-4 pt-4 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500 mb-2">Want to explore instantly without signing up?</p>
          <button
            type="button"
            onClick={handleQuickDemo}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Launch Instant Demo Account</span>
          </button>
        </div>

      </div>
    </div>
  );
}
