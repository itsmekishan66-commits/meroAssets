import React from 'react';
import { Search, Plus, Star, Grid, List, RefreshCw, X as XIcon } from 'lucide-react';
import { getCategoryStyle } from '../../../shared/utils/category.js';

export default function VaultToolbar({
  search,
  onSearchChange,
  onAdd,
  categories,
  activeCategory,
  onCategoryChange,
  showFavorites,
  onToggleFavorites,
  viewMode,
  onViewModeChange,
  onReload,
  loading,
  shownCount,
  totalCount,
}) {
  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-vault-muted" />
          <input type="text" value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search sites, usernames, notes…"
            className="vault-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
          />
          {search && (
            <button onClick={() => onSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-vault-muted hover:text-vault-text">
              <XIcon size={14}/>
            </button>
          )}
        </div>

        <button onClick={onAdd}
          className="btn-glow px-4 py-2.5 rounded-xl text-white font-semibold text-sm flex items-center gap-2 relative z-10 flex-shrink-0">
          <Plus size={16}/> Add
        </button>
      </div>

      {/* Filters row */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <div className="flex gap-1.5 flex-wrap flex-1">
          {categories.map(cat => {
            const style = cat === 'All' ? { color: '#3b82f6', bg: '#3b82f622' } : getCategoryStyle(cat);
            const active = activeCategory === cat;
            return (
              <button key={cat} onClick={() => onCategoryChange(cat)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={active
                  ? { background: style.color, color: '#fff' }
                  : { background: 'rgba(0,0,0,0.04)', color: '#3b82f6', border: '1px solid #e5e5e5' }
                }>
                {cat}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={onToggleFavorites}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              showFavorites
                ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                : 'text-vault-muted hover:text-vault-text border border-vault-border'
            }`}>
            <Star size={12} fill={showFavorites ? 'currentColor' : 'none'}/> Favorites
          </button>
          <div className="flex rounded-lg overflow-hidden border border-vault-border">
            <button onClick={() => onViewModeChange('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-vault-accent/20 text-vault-accent' : 'text-vault-muted hover:text-vault-text'}`}>
              <Grid size={14}/>
            </button>
            <button onClick={() => onViewModeChange('list')}
              className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-vault-accent/20 text-vault-accent' : 'text-vault-muted hover:text-vault-text'}`}>
              <List size={14}/>
            </button>
          </div>
          <button onClick={onReload} className="p-2 rounded-lg text-vault-muted hover:text-vault-accent hover:bg-vault-accent/10 transition-all border border-vault-border">
            <RefreshCw size={14}/>
          </button>
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-xs text-vault-muted mb-3">
          {shownCount} of {totalCount} credential{totalCount !== 1 ? 's' : ''}
          {search && ` matching "${search}"`}
        </p>
      )}
    </>
  );
}
