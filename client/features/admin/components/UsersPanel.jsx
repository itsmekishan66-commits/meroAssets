import React, { useState, useEffect } from 'react';
import {
  Search, Eye, UserX, UserCheck, Trash2, X as XIcon, ChevronLeft, ChevronRight, Shield, User as UserIcon,
} from 'lucide-react';
import { adminAPI } from '../services/admin-api.js';
import ConfirmDialog from '../../../shared/components/ConfirmDialog.jsx';
import UserDetailModal from './UserDetailModal.jsx';
import toast from 'react-hot-toast';

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

export default function UsersPanel({ users, loadUsers }) {
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showDetailFor, setShowDetailFor] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [busyId, setBusyId] = useState('');

  useEffect(() => {
    loadUsers({ search: submittedSearch, page });
  }, [loadUsers, submittedSearch, page]);

  const totalPages = Math.max(1, Math.ceil(users.total / users.limit));
  const empty = users.total === 0 && !submittedSearch;

  const runSearch = () => {
    setPage(1);
    setSubmittedSearch(search.trim());
  };

  const toggleDisabled = async (user) => {
    setBusyId(user._id);
    try {
      await adminAPI.updateUser(user._id, { disabled: !user.disabled });
      toast.success(user.disabled ? 'Account enabled' : 'Account disabled');
      loadUsers({ search: submittedSearch, page });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update user');
    } finally {
      setBusyId('');
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await adminAPI.deleteUser(pendingDelete._id);
      toast.success('User deleted');
      setPendingDelete(null);
      loadUsers({ search: submittedSearch, page });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-md">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-vault-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && runSearch()}
          placeholder="Search by email or name…"
          className="vault-input w-full pl-10 pr-9 py-2.5 rounded-xl text-sm"
        />
        {search && (
          <button onClick={() => { setSearch(''); setSubmittedSearch(''); setPage(1); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-vault-muted hover:text-vault-text">
            <XIcon size={14} />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-vault-muted border-b border-vault-border">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Vault</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.list.map((user) => (
                <tr key={user._id} className="border-b border-vault-border/50 last:border-0 hover:bg-black/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-vault-accent/10 text-vault-accent flex items-center justify-center text-xs font-bold font-display flex-shrink-0">
                        {(user.name || user.email)[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-vault-text truncate">{user.name || user.email}</p>
                        <p className="text-xs text-vault-muted truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`category-badge inline-flex items-center gap-1 ${
                      user.role === 'admin' ? 'text-vault-accent' : 'text-vault-muted'
                    }`}
                      style={{ background: user.role === 'admin' ? '#00000015' : 'rgba(0,0,0,0.04)' }}>
                      {user.role === 'admin' ? <Shield size={10} /> : <UserIcon size={10} />}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-vault-text">{user.credentialCount}</span>
                    <span className="text-vault-muted text-xs"> saved</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`category-badge ${user.disabled ? 'text-red-500' : 'text-blue-500'}`}
                      style={{ background: user.disabled ? '#dc262622' : '#3b82f622' }}>
                      {user.disabled ? 'Disabled' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-vault-muted text-xs">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setShowDetailFor(user._id)}
                        className="p-1.5 rounded-lg text-vault-muted hover:text-blue-500 transition-colors" title="View details">
                        <Eye size={14} />
                      </button>
                      {user.role !== 'admin' && (
                        <>
                          <button onClick={() => toggleDisabled(user)} disabled={busyId === user._id}
                            className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${
                              user.disabled ? 'text-vault-muted hover:text-blue-500' : 'text-vault-muted hover:text-red-500'
                            }`}
                            title={user.disabled ? 'Enable account' : 'Disable account'}>
                            {user.disabled ? <UserCheck size={14} /> : <UserX size={14} />}
                          </button>
                          <button onClick={() => setPendingDelete(user)}
                            className="p-1.5 rounded-lg text-vault-muted hover:text-red-500 transition-colors" title="Delete user">
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {empty && (
          <p className="text-vault-muted text-sm py-10 text-center">No users yet</p>
        )}

        {/* Pagination */}
        {users.total > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-vault-border text-xs text-vault-muted">
            <span>
              {users.list.length > 0 ? `${(page - 1) * users.limit + 1}–${(page - 1) * users.limit + users.list.length}` : 0} of {users.total}
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

      {/* User detail modal */}
      {showDetailFor && (
        <UserDetailModal userId={showDetailFor} onClose={() => setShowDetailFor(null)} />
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        icon={Trash2}
        title="Delete User"
        message={<>Permanently delete <strong className="text-vault-text">{pendingDelete?.email}</strong> and all their stored credentials? This cannot be undone.</>}
        confirmLabel="Delete User"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}