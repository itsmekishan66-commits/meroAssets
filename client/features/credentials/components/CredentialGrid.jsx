import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Plus } from 'lucide-react';
import CredentialCard from './CredentialCard.jsx';

export default function CredentialGrid({
  loading,
  viewMode,
  credentials,
  search,
  activeCategory,
  showFavorites,
  revealedMap,
  onEdit,
  onFavoriteToggle,
  onDelete,
  onRevealRequest,
  onAdd,
}) {
  const hasActiveFilters = Boolean(search) || activeCategory !== 'All' || showFavorites;

  if (loading) {
    return (
      <div className={`grid gap-3 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
        {[...Array(6)].map((_, i) => <div key={i} className="glass-card rounded-xl p-4 h-36 shimmer" />)}
      </div>
    );
  }

  if (credentials.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-2xl bg-vault-accent/10 flex items-center justify-center mb-4 animate-float">
          <Lock size={32} className="text-vault-accent/50"/>
        </div>
        <h3 className="font-display text-xl font-bold text-vault-text mb-2">
          {hasActiveFilters ? 'No results found' : 'No credentials yet'}
        </h3>
        <p className="text-vault-muted text-sm max-w-xs mb-6">
          {search ? 'Try a different search term' :
           showFavorites ? 'Star credentials to mark them as favorites' :
           'Add your first credential to get started'}
        </p>
        {!search && !showFavorites && (
          <button onClick={onAdd}
            className="btn-glow px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2 relative z-10">
            <Plus size={16}/> Add First Credential
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div layout
      className={`grid gap-3 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 max-w-2xl'}`}>
      <AnimatePresence mode="popLayout">
        {credentials.map((c, i) => (
          <CredentialCard
            key={c._id}
            credential={c}
            index={i}
            revealedData={revealedMap[c._id]}
            onEdit={onEdit}
            onFavoriteToggle={onFavoriteToggle}
            onDelete={onDelete}
            onRevealRequest={onRevealRequest}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
