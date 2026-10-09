import React from 'react';
import { LayoutDashboard, Users, Database, ScrollText, Settings, Shield, LogOut, Mail, ChevronRight, ArrowLeft } from 'lucide-react';

const NAV = [
  { id: 'overview', label: 'Overview',        icon: LayoutDashboard },
  { id: 'users',    label: 'User Management', icon: Users },
  { id: 'vault',    label: 'Vault Oversight', icon: Database },
  { id: 'activity', label: 'Activity Log',    icon: ScrollText },
  { id: 'settings', label: 'Settings',        icon: Settings },
  { id: 'admins',   label: 'Admin Access',    icon: Shield },
];

export default function AdminSidebar({
  mobile = false,
  activePage,
  onNavigate,
  onBackToVault,
  userEmail,
  onLogout,
}) {
  return (
    <aside className={`${mobile ? 'w-full' : 'w-60 hidden lg:flex'} flex-col gap-1 py-6 px-3`}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-vault-accent to-vault-accent2 flex items-center justify-center animate-pulse-glow flex-shrink-0">
          <Shield size={17} className="text-white" />
        </div>
        <div>
          <span className="font-display text-xl font-bold text-vault-text">MeroAssets</span>
          <p className="text-xs text-vault-muted -mt-0.5">Admin Panel</p>
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

      {/* Bottom actions */}
      <div className="mt-auto space-y-2 px-1">
        <button onClick={onBackToVault}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-vault-text border border-vault-border hover:border-black/40 transition-all">
          <ArrowLeft size={13} />
          <span>Back to Vault</span>
        </button>

        <div className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-vault-muted border border-vault-border">
          <Mail size={13} />
          <span className="truncate">{userEmail || 'Not set'}</span>
        </div>

        <button onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-vault-muted hover:text-red-500 hover:bg-red-500/10 transition-all border border-vault-border">
          <LogOut size={13} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}