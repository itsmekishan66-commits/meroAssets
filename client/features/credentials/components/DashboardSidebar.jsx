import React from 'react';
import { Lock, Star, Database, Tag, Shield, LogOut, Mail, ChevronRight, Activity } from 'lucide-react';

const NAV = [
  { id: 'vault',  label: 'My Vault',         icon: Lock },
  { id: 'health', label: 'Password Health',  icon: Activity },
];

export default function DashboardSidebar({
  mobile = false,
  activePage,
  onNavigate,
  stats,
  sessionValid,
  onLockSession,
  userEmail,
  onLogout,
}) {
  return (
    <aside className={`${mobile ? 'w-full' : 'w-60 hidden lg:flex'} flex-col gap-1 py-6 px-3`}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-vault-accent to-vault-accent2 flex items-center justify-center animate-pulse-glow flex-shrink-0">
          <Lock size={17} className="text-white" />
        </div>
        <div>
          <span className="font-display text-xl font-bold text-vault-text">MeroAssets</span>
          <p className="text-xs text-vault-muted -mt-0.5">Password Manager</p>
        </div>
      </div>

      {/* Nav items */}
      <nav className="space-y-1 flex-1">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button key={id}
            onClick={() => onNavigate(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activePage === id
                ? 'bg-vault-accent/15 text-vault-accent border border-vault-accent/20'
                : 'text-vault-muted hover:text-vault-text hover:bg-black/20'
            }`}
          >
            <Icon size={17} />
            {label}
            {activePage === id && <ChevronRight size={14} className="ml-auto" />}
          </button>
        ))}
      </nav>

      {/* Stats at bottom */}
      <div className="mt-auto space-y-2 px-1">
        <div className="p-3 rounded-xl bg-vault-accent/5 border border-vault-border space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-vault-muted flex items-center gap-1.5"><Database size={11}/> Total</span>
            <span className="font-mono text-vault-accent font-medium">{stats.total}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-red-500 flex items-center gap-1.5"><Star size={11}/> Favorites</span>
            <span className="font-mono text-red-500 font-medium">{stats.favorites}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-blue-500 flex items-center gap-1.5"><Tag size={11}/> Categories</span>
            <span className="font-mono text-blue-500 font-medium">{stats.categories}</span>
          </div>
        </div>

        {/* Session status */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${
          sessionValid
            ? 'bg-vault-accent/10 text-vault-accent border border-vault-accent/20'
            : 'bg-vault-border/50 text-vault-muted border border-vault-border'
        }`}>
          <Shield size={13} />
          <span>{sessionValid ? 'Session active' : 'Session locked'}</span>
          {sessionValid && (
            <button onClick={onLockSession} className="ml-auto hover:text-white transition-colors" title="Lock session">
              <LogOut size={12} />
            </button>
          )}
        </div>

        {/* Email */}
        <div className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-vault-muted border border-vault-border">
          <Mail size={13} />
          <span className="truncate">{userEmail || 'Not set'}</span>
        </div>

        {/* Logout */}
        <button onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-vault-muted hover:text-red-500 hover:bg-red-500/10 transition-all border border-vault-border">
          <LogOut size={13} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
