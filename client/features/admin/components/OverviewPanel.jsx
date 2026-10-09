import React from 'react';
import { Users, Database, Star, Tag } from 'lucide-react';
import StatCard from './StatCard.jsx';
import { getCategoryStyle } from '../../../shared/utils/category.js';

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

export default function OverviewPanel({ overview }) {
  if (!overview) return null;
  const { totals, recentSignups, categoryBreakdown } = overview;

  const maxCategory = Math.max(1, ...categoryBreakdown.map((c) => c.count));

  return (
    <div className="space-y-4">
      {/* Stat tiles */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard label="Total Users" value={totals.users} icon={Users} />
        <StatCard label="Credentials Stored" value={totals.credentials} icon={Database} />
        <StatCard label="Favorites" value={totals.favorites} icon={Star} tone="text-red-500" />
        <StatCard label="Categories" value={totals.categories} icon={Tag} tone="text-blue-500" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent signups */}
        <div className="glass-card rounded-xl p-4">
          <h3 className="font-display font-bold text-vault-text text-sm mb-3">Recent Signups</h3>
          {recentSignups.length === 0 ? (
            <p className="text-vault-muted text-sm py-6 text-center">No accounts yet</p>
          ) : (
            <div className="space-y-2">
              {recentSignups.map((u) => (
                <div key={u._id} className="flex items-center gap-3 py-1.5">
                  <div className="w-8 h-8 rounded-lg bg-vault-accent/10 text-vault-accent flex items-center justify-center text-xs font-bold font-display flex-shrink-0">
                    {(u.name || u.email)[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-vault-text font-medium truncate">{u.name || '—'}</p>
                    <p className="text-xs text-vault-muted truncate">{u.email}</p>
                  </div>
                  <span className="text-xs text-vault-muted flex-shrink-0">{formatDate(u.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category breakdown */}
        <div className="glass-card rounded-xl p-4">
          <h3 className="font-display font-bold text-vault-text text-sm mb-3">Credentials by Category</h3>
          {categoryBreakdown.length === 0 ? (
            <p className="text-vault-muted text-sm py-6 text-center">No credentials stored yet</p>
          ) : (
            <div className="space-y-2.5">
              {categoryBreakdown.map(({ _id, count }) => {
                const style = getCategoryStyle(_id);
                return (
                  <div key={_id}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-vault-text font-medium flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: style.color }} />
                        {_id}
                      </span>
                      <span className="font-mono text-vault-muted">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-vault-border/50 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${(count / maxCategory) * 100}%`, background: style.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}