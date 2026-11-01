import React from 'react';
import { 
  Shield, 
  Search, 
  FileText, 
  Layers, 
  Database, 
  Lock, 
  CreditCard, 
  Settings, 
  LogOut, 
  LogIn, 
  User as UserIcon,
  Activity,
  LayoutDashboard
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  user, 
  onOpenAuth, 
  onLogout 
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scanner', label: 'Live Scanner', icon: Search, badge: 'Real OSINT' },
    { id: 'removals', label: 'Removal Hub', icon: FileText },
    { id: 'identifiers', label: 'Monitored IDs', icon: Layers },
    { id: 'brokers', label: 'Broker Directory', icon: Database },
    { id: 'consent', label: 'Consent & Audit', icon: Lock },
    { id: 'pricing', label: 'Plans & Pricing', icon: CreditCard },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo & Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 shadow-lg shadow-cyan-500/20">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white font-mono">Priva<span className="text-cyan-400">Scan</span></span>
              <span className="hidden sm:inline-flex items-center rounded-full bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                Live Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Public Exposure Discovery & Legal Erasure</p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700/80'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="rounded bg-emerald-500/10 px-1 py-0.2 text-[9px] font-bold text-emerald-400 border border-emerald-500/20">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right side Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div 
                onClick={() => setActiveTab('settings')}
                className="hidden sm:flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-1.5 cursor-pointer hover:border-slate-700 transition-colors"
              >
                <div className="h-6 w-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                  {user.full_name ? user.full_name[0].toUpperCase() : 'U'}
                </div>
                <div className="text-left text-xs">
                  <div className="font-semibold text-slate-200 leading-tight truncate max-w-[120px]">{user.full_name}</div>
                  <div className="text-[10px] text-emerald-400 uppercase tracking-wider font-mono">{user.plan || 'Free'} Plan</div>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('settings')}
                title="Settings & Data Export"
                className="rounded-lg border border-slate-800 p-2 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
              >
                <Settings className="h-4 w-4" />
              </button>

              <button
                onClick={onLogout}
                title="Sign Out"
                className="rounded-lg border border-slate-800 p-2 text-slate-400 hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-900/60 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-emerald-400 transition-all cursor-pointer"
              >
                <LogIn className="h-4 w-4" />
                <span>Get Started / Sign In</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="md:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 border-t border-slate-900 bg-slate-950/90 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                isActive ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
