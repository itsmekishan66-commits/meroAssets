import React, { useMemo } from 'react';
import {
  UserPlus, Mail, LogIn, KeyRound, Pencil, Trash2, Eye, UserX, UserCheck, UserMinus, Activity, RefreshCw,
} from 'lucide-react';

// Human-readable label + icon for each audited action.
const ACTION_META = {
  'auth.register':       { icon: UserPlus,  label: 'New account registered', color: '#3b82f6', bg: '#3b82f622' },
  'auth.code_requested': { icon: Mail,      label: 'Sign-in code requested', color: '#888888', bg: '#88888822' },
  'auth.login':          { icon: LogIn,     label: 'Signed in',              color: '#111111', bg: '#00000015' },
  'credential.create':   { icon: KeyRound,  label: 'Created a credential',   color: '#1d4ed8', bg: '#1d4ed822' },
  'credential.update':   { icon: Pencil,    label: 'Updated a credential',   color: '#2563eb', bg: '#2563eb22' },
  'credential.delete':   { icon: Trash2,    label: 'Deleted a credential',   color: '#b91c1c', bg: '#dc262622' },
  'credential.reveal':   { icon: Eye,       label: 'Revealed a password',    color: '#666666', bg: '#66666622' },
  'admin.user.disabled': { icon: UserX,     label: 'Disabled a user',        color: '#b91c1c', bg: '#dc262622' },
  'admin.user.enabled':  { icon: UserCheck, label: 'Enabled a user',         color: '#444444', bg: '#44444422' },
  'admin.user.deleted':  { icon: UserMinus, label: 'Deleted a user',         color: '#7f1d1d', bg: '#b91c1c22' },
};

const getMeta = (action) => ACTION_META[action] || { icon: Activity, label: action, color: '#888888', bg: '#88888822' };

const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

// Show the meaningful detail (site name / targeted email) for an entry.
const describe = (entry) => {
  const parts = [];
  if (entry.detail?.site) parts.push(entry.detail.site);
  if (entry.detail?.targetEmail) parts.push(entry.detail.targetEmail);
  if (!parts.length && entry.detail?.email) parts.push(entry.detail.email);
  return parts.length ? ` — ${parts.join(' · ')}` : '';
};

export default function ActivityPanel({ activity, reload }) {
  const sorted = useMemo(
    () => [...activity].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [activity],
  );

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-vault-text text-sm">Recent Activity</h3>
        <button onClick={reload}
          className="p-2 rounded-lg text-vault-muted hover:text-vault-accent hover:bg-vault-accent/10 transition-all border border-vault-border">
          <RefreshCw size={14} />
        </button>
      </div>

      {sorted.length === 0 ? (
        <p className="text-vault-muted text-sm py-10 text-center">No activity recorded yet</p>
      ) : (
        <div className="relative">
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-vault-border" />
          <ul className="space-y-4">
            {sorted.map((entry) => {
              const meta = getMeta(entry.action);
              const Icon = meta.icon;
              return (
                <li key={entry._id} className="relative flex items-start gap-3 pl-0">
                  <div className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.color}33` }}>
                    <Icon size={14} />
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-sm text-vault-text">
                      <span className="font-medium">{meta.label}</span>
                      <span className="text-vault-muted">{describe(entry)}</span>
                    </p>
                    <p className="text-xs text-vault-muted">
                      {entry.email || 'unknown'} · {timeAgo(entry.createdAt)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}