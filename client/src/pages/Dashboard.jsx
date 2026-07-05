import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Lock, Star, Grid, List, RefreshCw,
  Shield, Database, Tag, LogOut, ShieldCheck,
  Activity, ChevronRight, Menu, X as XIcon, Mail
} from 'lucide-react';
import { credentialAPI, CATEGORIES, getCategoryStyle } from '../utils/api';
import CredentialCard from '../components/CredentialCard';
import CredentialForm from '../components/CredentialForm';
import OTPModal from '../components/OTPModal';
import PasswordHealth from '../components/PasswordHealth';
import toast from 'react-hot-toast';

const NAV = [
  { id: 'vault',   label: 'My Vault',      icon: Lock },
  { id: 'health',  label: 'Password Health', icon: Activity },
];

export default function Dashboard({ userEmail }) {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState([]);
  const [stats, setStats] = useState({ total: 0, favorites: 0, categories: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showFavorites, setShowFavorites] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [showForm, setShowForm] = useState(false);
  const [editCred, setEditCred] = useState(null);
  const [showOTP, setShowOTP] = useState(false);
  const [pendingRevealId, setPendingRevealId] = useState(null);
  const [revealedMap, setRevealedMap] = useState({});
  const [activePage, setActivePage] = useState('vault');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const checkSession = () => {
    const token = sessionStorage.getItem('meroassets_session');
    const expires = sessionStorage.getItem('meroassets_session_expires');
    if (!token || !expires) return false;
    if (Date.now() > Number(expires)) {
      sessionStorage.removeItem('meroassets_session');
      sessionStorage.removeItem('meroassets_session_expires');
      return false;
    }
    return true;
  };

  const [sessionValid, setSessionValid] = useState(checkSession());

  const handleAutoLogout = useCallback(() => {
    if (!checkSession()) {
      setRevealedMap({});
      setSessionValid(false);
      navigate('/setup');
    }
  }, [navigate]);

  const hasCheckedSession = useRef(false);

  useEffect(() => {
    const token = sessionStorage.getItem('meroassets_session');
    const expires = sessionStorage.getItem('meroassets_session_expires');
    const valid = token && expires && Date.now() <= Number(expires);

    if (valid) {
      setSessionValid(true);
      setShowOTP(false);
      const msLeft = Number(expires) - Date.now();
      const timer = setTimeout(handleAutoLogout, msLeft);
      return () => clearTimeout(timer);
    }

    if (!hasCheckedSession.current) {
      hasCheckedSession.current = true;
      setSessionValid(false);
      setShowOTP(true);
    }
  }, [handleAutoLogout]);

  const loadData = useCallback(async () => {
    if (!sessionValid) { setLoading(false); return; }
    try {
      const [credsRes, statsRes] = await Promise.all([
        credentialAPI.getAll(),
        credentialAPI.getStats()
      ]);
      setCredentials(credsRes.data);
      setStats(statsRes.data);
    } catch {
      toast.error('Failed to load data. Is the server running?');
    } finally {
      setLoading(false);
    }
  }, [sessionValid]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleRevealRequest = (id) => {
    setPendingRevealId(id);
    setShowOTP(true);
  };

  const doReveal = async (id) => {
    try {
      const res = await credentialAPI.reveal(id);
      setRevealedMap(m => ({ ...m, [id]: res.data }));
      setTimeout(() => setRevealedMap(m => { const n = { ...m }; delete n[id]; return n; }), 30000);
    } catch (err) {
      if (err.response?.status === 401) {
        setPendingRevealId(id); setShowOTP(true);
        toast.error('Session expired — re-verify OTP');
      } else {
        toast.error(err.response?.data?.error || 'Failed to reveal');
      }
    }
  };

  const handleOTPSuccess = () => {
    setSessionValid(true);
    if (pendingRevealId) {
      setTimeout(() => doReveal(pendingRevealId), 200);
      setPendingRevealId(null);
    }
  };

  const handleClearSession = () => {
    sessionStorage.removeItem('meroassets_session');
    sessionStorage.removeItem('meroassets_session_expires');
    setRevealedMap({});
    setSessionValid(false);
    toast.success('Session locked');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('meroassets_session');
    sessionStorage.removeItem('meroassets_session_expires');
    setRevealedMap({});
    setSessionValid(false);
    setShowLogoutConfirm(false);
    navigate('/setup');
  };

  const openEdit = (cred) => { setEditCred(cred); setShowForm(true); };

  // Filter credentials
  const filtered = credentials.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      c.site.toLowerCase().includes(q) ||
      (c.username || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.notes || '').toLowerCase().includes(q);
    const matchCat = activeCategory === 'All' || c.category === activeCategory;
    const matchFav = !showFavorites || c.favorite;
    return matchSearch && matchCat && matchFav;
  });

  const usedCategories = ['All', ...new Set(credentials.map(c => c.category))];

  // ── Sidebar ──────────────────────────────────────────────────────────────
  const Sidebar = ({ mobile = false }) => (
    <aside className={`${mobile ? 'w-full' : 'w-60 hidden lg:flex'} flex-col gap-1 py-6 px-3`}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-vault-accent to-vault-accent2 flex items-center justify-center animate-pulse-glow flex-shrink-0">
          <Lock size={17} className="text-white" />
        </div>
        <div>
          <span className="font-display text-xl font-bold text-vault-text">MeroAssets</span>
          <p className="text-xs text-vault-muted -mt-0.5">Password Manager</p>
        </div>
      </div>

      {/* Nav items */}
      <nav className="space-y-1 flex-1">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button key={id}
            onClick={() => { setActivePage(id); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activePage === id
                ? 'bg-vault-accent/15 text-vault-accent border border-vault-accent/20'
                : 'text-vault-muted hover:text-vault-text hover:bg-black/20'
            }`}
          >
            <Icon size={17} />
            {label}
            {activePage === id && <ChevronRight size={14} className="ml-auto" />}
          </button>
        ))}
      </nav>

      {/* Stats at bottom */}
      <div className="mt-auto space-y-2 px-1">
        <div className="p-3 rounded-xl bg-vault-accent/5 border border-vault-border space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-vault-muted flex items-center gap-1.5"><Database size={11}/> Total</span>
            <span className="font-mono text-vault-accent font-medium">{stats.total}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-red-500 flex items-center gap-1.5"><Star size={11}/> Favorites</span>
            <span className="font-mono text-red-500 font-medium">{stats.favorites}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-blue-500 flex items-center gap-1.5"><Tag size={11}/> Categories</span>
            <span className="font-mono text-blue-500 font-medium">{stats.categories}</span>
          </div>
        </div>

        {/* Session status */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${
          sessionValid
            ? 'bg-vault-accent/10 text-vault-accent border border-vault-accent/20'
            : 'bg-vault-border/50 text-vault-muted border border-vault-border'
        }`}>
          <Shield size={13} />
          <span>{sessionValid ? 'Session active' : 'Session locked'}</span>
          {sessionValid && (
            <button onClick={handleClearSession} className="ml-auto hover:text-white transition-colors" title="Lock session">
              <LogOut size={12} />
            </button>
          )}
        </div>

        {/* Email */}
        <div className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-vault-muted border border-vault-border">
          <Mail size={13} />
          <span className="truncate">{userEmail || 'Not set'}</span>
        </div>

        {/* Logout */}
        <button onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-vault-muted hover:text-red-500 hover:bg-red-500/10 transition-all border border-vault-border">
          <LogOut size={13} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );

  // ── Dashboard page ───────────────────────────────────────────────────────
  const VaultPage = () => (
    <>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-vault-muted" />
          <input type="text" value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search sites, usernames, notes…"
            className="vault-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-vault-muted hover:text-vault-text">
              <XIcon size={14}/>
            </button>
          )}
        </div>

        <button onClick={() => { setEditCred(null); setShowForm(true); }}
          className="btn-glow px-4 py-2.5 rounded-xl text-white font-semibold text-sm flex items-center gap-2 relative z-10 flex-shrink-0">
          <Plus size={16}/> Add
        </button>
      </div>

      {/* Filters row */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <div className="flex gap-1.5 flex-wrap flex-1">
          {usedCategories.map(cat => {
            const style = cat === 'All' ? { color: '#3b82f6', bg: '#3b82f622' } : getCategoryStyle(cat);
            const active = activeCategory === cat;
            return (
              <button key={cat} onClick={() => setActiveCategory(cat)}
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
          <button onClick={() => setShowFavorites(!showFavorites)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              showFavorites
                ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                : 'text-vault-muted hover:text-vault-text border border-vault-border'
            }`}>
            <Star size={12} fill={showFavorites ? 'currentColor' : 'none'}/> Favorites
          </button>
          <div className="flex rounded-lg overflow-hidden border border-vault-border">
            <button onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-vault-accent/20 text-vault-accent' : 'text-vault-muted hover:text-vault-text'}`}>
              <Grid size={14}/>
            </button>
            <button onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-vault-accent/20 text-vault-accent' : 'text-vault-muted hover:text-vault-text'}`}>
              <List size={14}/>
            </button>
          </div>
          <button onClick={loadData} className="p-2 rounded-lg text-vault-muted hover:text-vault-accent hover:bg-vault-accent/10 transition-all border border-vault-border">
            <RefreshCw size={14}/>
          </button>
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-xs text-vault-muted mb-3">
          {filtered.length} of {credentials.length} credential{credentials.length !== 1 ? 's' : ''}
          {search && ` matching "${search}"`}
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className={`grid gap-3 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
          {[...Array(6)].map((_, i) => <div key={i} className="glass-card rounded-xl p-4 h-36 shimmer" />)}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-vault-accent/10 flex items-center justify-center mb-4 animate-float">
            <Lock size={32} className="text-vault-accent/50"/>
          </div>
          <h3 className="font-display text-xl font-bold text-vault-text mb-2">
            {search || activeCategory !== 'All' || showFavorites ? 'No results found' : 'No credentials yet'}
          </h3>
          <p className="text-vault-muted text-sm max-w-xs mb-6">
            {search ? 'Try a different search term' :
             showFavorites ? 'Star credentials to mark them as favorites' :
             'Add your first credential to get started'}
          </p>
          {!search && !showFavorites && (
            <button onClick={() => { setEditCred(null); setShowForm(true); }}
              className="btn-glow px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2 relative z-10">
              <Plus size={16}/> Add First Credential
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div layout
          className={`grid gap-3 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 max-w-2xl'}`}>
          <AnimatePresence mode="popLayout">
            {filtered.map((c, i) => (
              <CredentialCard
                key={c._id}
                credential={c}
                index={i}
                revealedData={revealedMap[c._id]}
                onEdit={openEdit}
                onFavoriteToggle={(updated) => setCredentials(cs => cs.map(x => x._id === updated._id ? updated : x))}
                onDelete={(id) => {
                  setCredentials(cs => cs.filter(x => x._id !== id));
                  setStats(s => ({ ...s, total: s.total - 1 }));
                }}
                onRevealRequest={handleRevealRequest}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </>
  );

  // ── Page content map ──────────────────────────────────────────────────────
  const pageTitle = { vault: 'My Vault', health: 'Password Health' };

  return (
    <div className="min-h-screen vault-bg-mesh flex">
      {/* Desktop sidebar */}
      <div className="border-r border-vault-border flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
            onClick={() => setSidebarOpen(false)}>
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              className="absolute left-0 top-0 bottom-0 w-72 glass-card border-r border-vault-border flex"
              onClick={e => e.stopPropagation()}>
              <Sidebar mobile />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 glass-card border-b border-vault-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-vault-muted hover:text-vault-text">
            <Menu size={20}/>
          </button>
          <h1 className="font-display text-lg font-bold text-vault-text">{pageTitle[activePage]}</h1>

          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setShowOTP(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
              style={sessionValid
                ? { background: '#00000010', color: '#000000', borderColor: '#00000030' }
                : { background: 'rgba(0,0,0,0.04)', color: '#6b6b6b', borderColor: '#e5e5e5' }}>
              <ShieldCheck size={13}/>
              {sessionValid ? 'Unlocked' : 'Verify OTP'}
            </button>
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div key={activePage}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}>
              {activePage === 'vault' && <VaultPage />}
              {activePage === 'health' && (
                <PasswordHealth
                  credentials={credentials}
                  revealedMap={revealedMap}
                  onEdit={openEdit}
                  onRevealRequest={handleRevealRequest}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* OTP Modal */}
      <OTPModal
        isOpen={showOTP}
        onClose={() => { setShowOTP(false); setPendingRevealId(null); }}
        onSuccess={handleOTPSuccess}
        userEmail={userEmail}
      />

      {/* Logout Confirmation */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowLogoutConfirm(false)}>
            <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="glass-card rounded-2xl p-8 w-full max-w-sm relative">
              <div className="flex flex-col items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 flex items-center justify-center">
                  <LogOut size={28} className="text-red-500" />
                </div>

                <div className="text-center">
                  <h3 className="font-display text-xl font-bold text-vault-text">Log out</h3>
                  <p className="text-vault-muted text-sm mt-1">Are you sure you want to log out? You will need to re-verify via email.</p>
                </div>

                <div className="w-full flex gap-3">
                  <button onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 py-3 rounded-xl border border-vault-border text-vault-muted hover:text-vault-text hover:border-black/30 transition-all font-medium text-sm">
                    Cancel
                  </button>
                  <button onClick={handleLogout}
                    className="flex-1 py-3 rounded-xl text-white font-semibold text-sm relative z-10"
                    style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
                    Log out
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Credential Form */}
      <AnimatePresence>
        {showForm && (
          <CredentialForm
            credential={editCred}
            onClose={() => { setShowForm(false); setEditCred(null); }}
            onSave={(saved) => {
              if (editCred) {
                setCredentials(cs => cs.map(x => x._id === saved._id ? saved : x));
              } else {
                setCredentials(cs => [saved, ...cs]);
                setStats(s => ({ ...s, total: s.total + 1 }));
              }
              setShowForm(false);
              setEditCred(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
