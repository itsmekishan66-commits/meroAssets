import React from 'react';

// Small glass stat tile used across the admin overview.
export default function StatCard({ label, value, icon: Icon, sub, tone = 'text-vault-accent' }) {
  return (
    <div className="glass-card rounded-xl p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl bg-vault-accent/10 flex items-center justify-center flex-shrink-0 ${tone}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-vault-muted font-medium truncate">{label}</p>
        <p className={`font-mono text-xl font-bold leading-tight ${tone}`}>{value}</p>
        {sub && <p className="text-xs text-vault-muted truncate">{sub}</p>}
      </div>
    </div>
  );
}