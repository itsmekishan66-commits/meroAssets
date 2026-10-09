import React from 'react';
import { Shield, FileLock2, RefreshCw } from 'lucide-react';

const formatDate = (iso) => iso
  ? new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  : '—';

export default function AdminsPanel({ admins, reload }) {
  return (
    <div className="space-y-4">
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-vault-text text-sm flex items-center gap-2">
            <Shield size={16} /> Admin Accounts
          </h3>
          <button onClick={reload}
            className="p-2 rounded-lg text-vault-muted hover:text-vault-accent hover:bg-vault-accent/10 transition-all border border-vault-border">
            <RefreshCw size={14} />
          </button>
        </div>

        {admins.length === 0 ? (
          <p className="text-vault-muted text-sm py-10 text-center">
            No admins configured. Add emails to <span className="font-mono">ADMIN_EMAILS</span> in{' '}
            <span className="font-mono">client/.env</span> and restart the server.
          </p>
        ) : (
          <div className="space-y-2">
            {admins.map((admin) => (
              <div key={admin.email} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-vault-accent/5 border border-vault-border">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-vault-accent/20 to-vault-accent2/20 flex items-center justify-center flex-shrink-0">
                  <Shield size={15} className="text-vault-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-vault-text font-medium truncate flex items-center gap-2">
                    {admin.email}
                    {!admin.registered && (
                      <span className="text-xs text-vault-muted font-normal">(no account yet)</span>
                    )}
                  </p>
                  <p className="text-xs text-vault-muted">
                    {admin.name || '—'} · joined {formatDate(admin.createdAt)}
                  </p>
                </div>
                <span className={`category-badge flex-shrink-0 ${admin.disabled ? 'text-red-500' : 'text-blue-500'}`}
                  style={{ background: admin.disabled ? '#dc262622' : '#3b82f622' }}>
                  {admin.disabled ? 'Disabled' : 'Admin'}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-start gap-2 text-xs text-vault-muted px-1">
          <FileLock2 size={13} className="mt-0.5 flex-shrink-0" />
          <p>
            Admin access comes from <span className="font-mono">ADMIN_EMAILS</span> in{' '}
            <span className="font-mono">client/.env</span> (or{' '}
            <span className="font-mono">client/.env.example</span> as a
            template). It is never stored in the database.
          </p>
        </div>
      </div>
    </div>
  );
}