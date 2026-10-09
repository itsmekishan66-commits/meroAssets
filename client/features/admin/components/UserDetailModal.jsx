import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, MapPin, Shield, Star, Lock, User as UserIcon, ExternalLink } from 'lucide-react';
import { adminAPI } from '../services/admin-api.js';
import { getCategoryStyle } from '../../../shared/utils/category.js';
import toast from 'react-hot-toast';

const formatDate = (iso) =>
  new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function UserDetailModal({ userId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    adminAPI.getUser(userId)
      .then((res) => { if (active) setData(res.data); })
      .catch((err) => {
        toast.error(err.response?.data?.error || 'Failed to load user');
        onClose();
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [userId, onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="glass-card rounded-2xl w-full max-w-lg relative overflow-hidden"
        >
          <button onClick={onClose} className="absolute top-4 right-4 z-10 text-vault-muted hover:text-vault-text transition-colors">
            <X size={20} />
          </button>

          {loading || !data ? (
            <div className="p-8 space-y-3">
              <div className="h-6 w-32 shimmer rounded-lg" />
              <div className="h-4 w-full shimmer rounded-lg" />
              <div className="h-4 w-3/4 shimmer rounded-lg" />
            </div>
          ) : (
            <div className="p-6">
              {/* User header — pr-8 keeps the role/status badges clear of the close button */}
              <div className="flex items-center gap-4 mb-4 pr-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-vault-accent/20 to-vault-accent2/20 flex items-center justify-center text-base font-bold font-display text-vault-accent">
                  {(data.user.name || data.user.email)[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-bold text-vault-text truncate">
                    {data.user.name || data.user.email}
                  </h3>
                  <p className="text-xs text-vault-muted truncate flex items-center gap-1.5">
                    <Mail size={11} /> {data.user.email}
                  </p>
                </div>
                <div className="ml-auto flex flex-col items-end gap-1">
                  <span className="category-badge inline-flex items-center gap-1 text-vault-accent" style={{ background: '#00000015' }}>
                    {data.user.role === 'admin' ? <Shield size={10} /> : <UserIcon size={10} />}
                    {data.user.role}
                  </span>
                  <span className={`category-badge ${data.user.disabled ? 'text-red-500' : 'text-blue-500'}`}
                    style={{ background: data.user.disabled ? '#dc262622' : '#3b82f622' }}>
                    {data.user.disabled ? 'Disabled' : 'Active'}
                  </span>
                </div>
              </div>

              {/* Contact details */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                {data.user.phone && (
                  <div className="flex items-center gap-2 text-xs text-vault-muted px-3 py-2 rounded-lg bg-vault-accent/5 border border-vault-border">
                    <Phone size={12} /> {data.user.phone}
                  </div>
                )}
                {data.user.address && (
                  <div className="flex items-center gap-2 text-xs text-vault-muted px-3 py-2 rounded-lg bg-vault-accent/5 border border-vault-border col-span-2">
                    <MapPin size={12} /> {data.user.address}
                  </div>
                )}
                <div className="text-xs text-vault-muted px-3 py-2 rounded-lg bg-vault-accent/5 border border-vault-border">
                  Joined {formatDate(data.user.createdAt)}
                </div>
                <div className="flex items-center gap-2 text-xs text-vault-muted px-3 py-2 rounded-lg bg-vault-accent/5 border border-vault-border">
                  <Lock size={12} /> {data.user.credentialCount} saved · <Star size={11} className="text-red-500" /> {data.user.favoriteCount} favorites
                </div>
              </div>

              {/* Credentials */}
              <div>
                <h4 className="text-xs font-medium text-vault-muted uppercase tracking-wider mb-2">Stored Credentials</h4>
                {data.credentials.length === 0 ? (
                  <p className="text-vault-muted text-sm py-4 text-center border border-dashed border-vault-border rounded-xl">
                    No credentials stored
                  </p>
                ) : (
                  <div className="max-h-64 overflow-auto space-y-1.5 pr-1">
                    {data.credentials.map((c) => {
                      const cat = getCategoryStyle(c.category);
                      return (
                        <div key={c._id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-vault-accent/5 border border-vault-border">
                          <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold font-display"
                            style={{ background: cat.bg, color: cat.color }}>
                            {c.site[0]?.toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-vault-text font-medium truncate">{c.site}</p>
                            <p className="text-xs text-vault-muted truncate">{c.username || c.email || '—'}</p>
                            {c.url && (
                              <a href={c.url.startsWith('http') ? c.url : `https://${c.url}`}
                                target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-blue-500 hover:underline">
                                <ExternalLink size={10} className="flex-shrink-0" />
                                <span className="truncate">{c.url}</span>
                              </a>
                            )}
                          </div>
                          <span className="category-badge flex-shrink-0" style={{ color: cat.color, background: cat.bg }}>{c.category}</span>
                          {c.favorite && <Star size={12} className="text-red-500 flex-shrink-0" fill="currentColor" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}