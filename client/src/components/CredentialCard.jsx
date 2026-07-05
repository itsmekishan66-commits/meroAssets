import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Copy, Edit2, Trash2, Star, ExternalLink, User, Mail, X as XIcon } from 'lucide-react';
import { credentialAPI, getCategoryStyle } from '../utils/api';
import toast from 'react-hot-toast';

export default function CredentialCard({ credential, onEdit, onFavoriteToggle, onDelete, onRevealRequest, revealedData, index }) {
  const [copying, setCopying] = useState('');
  const [toggling, setToggling] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const cat = getCategoryStyle(credential.category);

  const copyToClipboard = async (text, label) => {
    await navigator.clipboard.writeText(text);
    setCopying(label);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopying(''), 1500);
    // Clear clipboard after 30s
    setTimeout(() => navigator.clipboard.writeText(''), 30000);
  };

  const handleReveal = () => {
    if (revealedData) {
      copyToClipboard(revealedData.password, 'Password');
    } else {
      onRevealRequest(credential._id);
    }
  };

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();
    setToggling(true);
    try {
      await credentialAPI.update(credential._id, { favorite: !credential.favorite });
      onFavoriteToggle({ ...credential, favorite: !credential.favorite });
    } catch {
      toast.error('Failed to update');
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await credentialAPI.delete(credential._id);
      onDelete(credential._id);
      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete');
    }
    setShowDeleteConfirm(false);
  };

  // Favicon
  let favicon = null;
  if (credential.url) {
    try {
      const domain = new URL(credential.url.startsWith('http') ? credential.url : `https://${credential.url}`).hostname;
      favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {}
  }

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      layout
      className="glass-card rounded-xl p-4 hover:border-black/20 transition-all duration-300 group cursor-default"
      style={{ '--cat-color': cat.color }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar / favicon */}
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold font-display"
            style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.color}33` }}
          >
            {favicon
              ? <img src={favicon} alt="" className="w-5 h-5 object-contain" onError={e => e.target.style.display = 'none'} />
              : credential.site[0]?.toUpperCase()
            }
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-vault-text truncate">{credential.site}</h3>
              {credential.url && (
                <a href={credential.url.startsWith('http') ? credential.url : `https://${credential.url}`}
                  target="_blank" rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="text-vault-muted hover:text-white transition-colors flex-shrink-0"
                >
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
            <div className="category-badge mt-1 inline-block" style={{ color: cat.color, background: cat.bg }}>
              {credential.category}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 opacity-100 transition-opacity duration-150">
          <button
            onClick={handleToggleFavorite}
            className={`p-1.5 rounded-lg transition-colors ${credential.favorite ? 'text-red-500' : 'text-vault-muted hover:text-red-500'}`}
          >
            <Star size={14} fill={credential.favorite ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onEdit(credential); }}
            className="p-1.5 rounded-lg text-vault-muted hover:text-blue-500 transition-colors"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-lg text-vault-muted hover:text-black transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Credentials */}
      <div className="space-y-1.5">
        {credential.username && (
          <div className="flex items-center gap-2 text-xs">
            <User size={11} className="text-vault-muted flex-shrink-0" />
            <span className="text-vault-muted truncate">{credential.username}</span>
            <button
              onClick={() => copyToClipboard(credential.username, 'Username')}
              className={`ml-auto p-0.5 rounded transition-all flex-shrink-0 ${copying === 'Username' ? 'text-vault-accent' : 'text-vault-muted hover:text-vault-text'}`}
            >
              <Copy size={11} />
            </button>
          </div>
        )}
        {credential.email && (
          <div className="flex items-center gap-2 text-xs">
            <Mail size={11} className="text-vault-muted flex-shrink-0" />
            <span className="text-vault-muted truncate">{credential.email}</span>
            <button
              onClick={() => copyToClipboard(credential.email, 'Email')}
              className={`ml-auto p-0.5 rounded transition-all flex-shrink-0 ${copying === 'Email' ? 'text-vault-accent' : 'text-vault-muted hover:text-vault-text'}`}
            >
              <Copy size={11} />
            </button>
          </div>
        )}

        {/* Password row */}
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-vault-border">
          <div className="flex-1 font-mono text-xs text-vault-muted tracking-widest truncate">
            {revealedData ? (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-vault-text"
              >
                {revealedData.password}
              </motion.span>
            ) : '••••••••••••'}
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleReveal}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-vault-muted hover:text-white hover:bg-black/30 transition-all"
            >
              <Eye size={11} />
              {revealedData ? 'Copy' : 'Reveal'}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Notes */}
      {credential.notes && (
        <p className="text-xs text-vault-muted mt-2 pt-2 border-t border-vault-border truncate">{credential.notes}</p>
      )}
      </motion.div>

      {/* Delete confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowDeleteConfirm(false)}>
            <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="glass-card rounded-2xl p-8 w-full max-w-sm relative" onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowDeleteConfirm(false)} className="absolute top-4 right-4 text-vault-muted hover:text-vault-text transition-colors">
                <XIcon size={20} />
              </button>
              <div className="flex flex-col items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 flex items-center justify-center">
                  <Trash2 size={28} className="text-red-500" />
                </div>
                <div className="text-center">
                  <h3 className="font-display text-xl font-bold text-vault-text">Delete Credential</h3>
                  <p className="text-vault-muted text-sm mt-1">Are you sure you want to delete the credentials for <strong className="text-vault-text">{credential.site}</strong>? This cannot be undone.</p>
                </div>
                <div className="w-full flex gap-3">
                  <button onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-3 rounded-xl border border-vault-border text-vault-muted hover:text-vault-text hover:border-black/30 transition-all font-medium text-sm">
                    Cancel
                  </button>
                  <button onClick={confirmDelete}
                    className="flex-1 py-3 rounded-xl text-white font-semibold text-sm relative z-10"
                    style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
