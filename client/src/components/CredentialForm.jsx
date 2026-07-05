import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, RefreshCw, Globe, User, Mail, Lock, Tag, FileText, ChevronDown } from 'lucide-react';
import { credentialAPI, generatePassword, getPasswordStrength, CATEGORIES } from '../utils/api';
import toast from 'react-hot-toast';

export default function CredentialForm({ credential, onClose, onSave }) {
  const isEdit = !!credential?._id;

  const [form, setForm] = useState({
    site: '', url: '', username: '', email: '',
    password: '', notes: '', category: 'General'
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [genOptions] = useState({ uppercase: true, lowercase: true, numbers: true, symbols: true });
  const [genLength, setGenLength] = useState(16);
  const [catOpen, setCatOpen] = useState(false);

  useEffect(() => {
    if (credential) {
      setForm({
        site: credential.site || '',
        url: credential.url || '',
        username: credential.username || '',
        email: credential.email || '',
        password: '',
        notes: credential.notes || '',
        category: credential.category || 'General',
      });
    }
  }, [credential]);

  const strength = getPasswordStrength(form.password);

  const handleGenerate = () => {
    const pw = generatePassword(genLength, genOptions);
    setForm(f => ({ ...f, password: pw }));
    setShowPw(true);
  };

  const handleSubmit = async () => {
    if (!form.site) return toast.error('Site name is required');
    if (!form.password && !isEdit) return toast.error('Password is required');
    setLoading(true);
    try {
      const data = { ...form };
      if (isEdit && !data.password) delete data.password;
      const res = isEdit
        ? await credentialAPI.update(credential._id, data)
        : await credentialAPI.create(data);
      toast.success(isEdit ? 'Credential updated!' : 'Credential saved!');
      onSave(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const selectedCat = CATEGORIES.find(c => c.value === form.category) || CATEGORIES[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.92, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: 24, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="glass-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-vault-border sticky top-0 glass-card z-10">
          <div>
            <h2 className="font-display text-xl font-bold text-vault-text">
              {isEdit ? 'Update Credential' : 'Add New Credential'}
            </h2>
            <p className="text-vault-muted text-xs mt-0.5">All passwords are AES-256 encrypted</p>
          </div>
          <button onClick={onClose} className="text-vault-muted hover:text-vault-text transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Site + URL */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-vault-muted mb-1.5">Site Name *</label>
              <div className="relative">
                <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-vault-muted" />
                <input
                  type="text" value={form.site}
                  onChange={e => setForm(f => ({ ...f, site: e.target.value }))}
                  placeholder="Google, GitHub..."
                  className="vault-input w-full pl-9 pr-3 py-2.5 rounded-xl text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-vault-muted mb-1.5">URL</label>
              <input
                type="text" value={form.url}
                onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                placeholder="https://..."
                className="vault-input w-full px-3 py-2.5 rounded-xl text-sm"
              />
            </div>
          </div>

          {/* Username + Email */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-vault-muted mb-1.5">Username</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-vault-muted" />
                <input
                  type="text" value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  placeholder="Username"
                  className="vault-input w-full pl-9 pr-3 py-2.5 rounded-xl text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-vault-muted mb-1.5">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-vault-muted" />
                <input
                  type="email" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="email@..."
                  className="vault-input w-full pl-9 pr-3 py-2.5 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-vault-muted mb-1.5">
              Password {isEdit && <span className="text-vault-accent">(leave blank to keep current)</span>}
            </label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-vault-muted" />
              <input
                type={showPw ? 'text' : 'password'} value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder={isEdit ? 'New password (optional)' : 'Enter password...'}
                className="vault-input w-full pl-9 pr-20 py-2.5 rounded-xl text-sm font-mono"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <button type="button" onClick={handleGenerate}
                  className="p-1.5 text-vault-muted hover:text-white transition-colors"
                  title="Generate password"
                >
                  <RefreshCw size={14} />
                </button>
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="p-1.5 text-vault-muted hover:text-white transition-colors"
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Strength meter */}
            {form.password && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 space-y-1">
                <div className="h-1 bg-vault-border rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${strength.pct}%` }}
                    transition={{ type: 'spring', damping: 20 }}
                    className="strength-bar h-full rounded-full"
                    style={{ background: strength.color }}
                  />
                </div>
                <p className="text-xs" style={{ color: strength.color }}>
                  {strength.label} password
                </p>
              </motion.div>
            )}

            {/* Generator length */}
            <div className="mt-2 flex items-center gap-3">
              <span className="text-xs text-vault-muted">Generate length:</span>
              <input
                type="range" min="8" max="32" value={genLength}
                onChange={e => setGenLength(Number(e.target.value))}
                className="flex-1 h-1 accent-vault-accent cursor-pointer"
                style={{ accentColor: '#ffffff' }}
              />
              <span className="text-xs font-mono text-vault-accent w-6">{genLength}</span>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-vault-muted mb-1.5">Category</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setCatOpen(!catOpen)}
                className="vault-input w-full px-3 py-2.5 rounded-xl text-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: selectedCat.color }} />
                  <span>{form.category}</span>
                </div>
                <motion.div animate={{ rotate: catOpen ? 180 : 0 }}>
                  <ChevronDown size={14} className="text-vault-muted" />
                </motion.div>
              </button>
              <AnimatePresence>
                {catOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full mt-1 left-0 right-0 glass-card rounded-xl overflow-hidden z-20"
                  >
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => { setForm(f => ({ ...f, category: cat.value })); setCatOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-black/30 transition-colors text-left"
                      >
                        <div className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                        <span className="text-vault-text">{cat.value}</span>
                        {form.category === cat.value && <span className="ml-auto text-vault-accent">✓</span>}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-vault-muted mb-1.5">Notes</label>
            <div className="relative">
              <FileText size={14} className="absolute left-3 top-3 text-vault-muted" />
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Optional notes..."
                rows={3}
                className="vault-input w-full pl-9 pr-3 py-2.5 rounded-xl text-sm resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-vault-border text-vault-muted hover:text-vault-text hover:border-black/30 transition-all font-medium text-sm"
          >
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="btn-glow flex-1 py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 relative z-10 disabled:opacity-50"
          >
            {loading
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : isEdit ? 'Update' : 'Save Credential'
            }
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
