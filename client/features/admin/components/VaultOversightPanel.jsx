import React, { useState, useEffect } from 'react';
import { Search, X as XIcon, ChevronLeft, ChevronRight, Star, ShieldAlert, ExternalLink } from 'lucide-react';
import { getCategoryStyle } from '../../../shared/utils/category.js';

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

export default function VaultOversightPanel({ credentials, loadCredentials }) {
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadCredentials({ search: submittedSearch, page });
  }, [loadCredentials, submittedSearch, page]);

  const totalPages = Math.max(1, Math.ceil(credentials.total / credentials.limit));
  const empty = credentials.total === 0 && !submittedSearch;

  const runSearch = () => {
    setPage(1);
    setSubmittedSearch(search.trim());
  };

  return (
    <div className="space-y-4">
      {/* Search + note */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-64 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-vault-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runSearch()}
            placeholder="Search sites, usernames, owners…"
            className="vault-input w-full pl-10 pr-9 py-2.5 rounded-xl text-sm"
          />
          {search && (
            <button onClick={() => { setSearch(''); setSubmittedSearch(''); setPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-vault-muted hover:text-vault-text">
              <XIcon size={14} />
            </button>
          )}
        </div>
        <span className="flex items-center gap-1.5 text-xs text-vault-muted px-3 py-2 rounded-lg border border-vault-border">
          <ShieldAlert size={13} />
          Passwords are encrypted and cannot be viewed by anyone, including admins
        </span>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-vault-muted border-b border-vault-border">
                <th className="px-4 py-3 font-medium">Site</th>
                <th className="px-4 py-3 font-medium">URL</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Login</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 font-medium text-right">Fav</th>
              </tr>
            </thead>
            <tbody>
              {credentials.list.map((c) => {
                const cat = getCategoryStyle(c.category);
                return (
                  <tr key={c._id} className="border-b border-vault-border/50 last:border-0 hover:bg-black/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold font-display"
                          style={{ background: cat.bg, color: cat.color }}>
                          {c.site[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-vault-text truncate">{c.site}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {c.url ? (
                        <a href={c.url.startsWith('http') ? c.url : `https://${c.url}`}
                          target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-500 hover:underline text-xs max-w-48">
                          <ExternalLink size={12} className="flex-shrink-0" />
                          <span className="truncate">{c.url}</span>
                        </a>
                      ) : (
                        <span className="text-vault-muted text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-vault-muted text-xs">{c.userEmail}</td>
                    <td className="px-4 py-3 text-vault-muted text-xs truncate max-w-40">{c.username || c.email || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="category-badge" style={{ color: cat.color, background: cat.bg }}>{c.category}</span>
                    </td>
                    <td className="px-4 py-3 text-vault-muted text-xs">{formatDate(c.updatedAt)}</td>
                    <td className="px-4 py-3 text-right">
                      {c.favorite && <Star size={13} className="text-red-500 inline" fill="currentColor" />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {empty && (
          <p className="text-vault-muted text-sm py-10 text-center">No credentials stored yet</p>
        )}

        {credentials.total > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-vault-border text-xs text-vault-muted">
            <span>
              {credentials.list.length > 0 ? `${(page - 1) * credentials.limit + 1}–${(page - 1) * credentials.limit + credentials.list.length}` : 0} of {credentials.total}
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
                className="p-1.5 rounded-lg border border-vault-border hover:text-vault-text disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLeft size={14} />
              </button>
              <span className="font-mono">{page} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-vault-border hover:text-vault-text disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}