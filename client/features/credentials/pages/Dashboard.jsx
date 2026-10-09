import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Menu, LogOut } from 'lucide-react';
import { credentialAPI } from '../services/credential-api.js';
import CredentialForm from '../components/CredentialForm.jsx';
import DashboardSidebar from '../components/DashboardSidebar.jsx';
import VaultToolbar from '../components/VaultToolbar.jsx';
import CredentialGrid from '../components/CredentialGrid.jsx';
import { OTPModal } from '../../otp/index.js';
import { PasswordHealth } from '../../password-health/index.js';
import ConfirmDialog from '../../../shared/components/ConfirmDialog.jsx';
import useCredentials from '../hooks/useCredentials.js';
import { isSessionValid, getSessionExpiry, clearSession } from '../../../shared/utils/session.js';
import toast from 'react-hot-toast';

export default function Dashboard({ userEmail }) {
  const navigate = useNavigate();
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

  const [sessionValid, setSessionValid] = useState(isSessionValid());

  const handleAutoLogout = useCallback(() => {
    if (!isSessionValid()) {
      setRevealedMap({});
      setSessionValid(false);
      navigate('/setup');
    }
  }, [navigate]);

  const hasCheckedSession = useRef(false);

  useEffect(() => {
    const expires = getSessionExpiry();

    if (isSessionValid()) {
      setSessionValid(true);
      setShowOTP(false);
      const timer = setTimeout(handleAutoLogout, expires - Date.now());
      return () => clearTimeout(timer);
    }

    if (!hasCheckedSession.current) {
      hasCheckedSession.current = true;
      setSessionValid(false);
      setShowOTP(true);
    }
  }, [handleAutoLogout]);

  const { credentials, setCredentials, stats, setStats, loading, reload } = useCredentials(sessionValid);

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
    clearSession();
    setRevealedMap({});
    setSessionValid(false);
    toast.success('Session locked');
  };

  const handleLogout = () => {
    clearSession();
    setRevealedMap({});
    setSessionValid(false);
    setShowLogoutConfirm(false);
    navigate('/setup');
  };

  const openCreate = () => { setEditCred(null); setShowForm(true); };
  const openEdit = (cred) => { setEditCred(cred); setShowForm(true); };

  const handleFavoriteToggle = (updated) => {
    setCredentials(cs => cs.map(x => x._id === updated._id ? updated : x));
  };

  const handleDelete = (id) => {
    setCredentials(cs => cs.filter(x => x._id !== id));
    setStats(s => ({ ...s, total: s.total - 1 }));
  };

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

  const handleNavigate = (id) => { setActivePage(id); setSidebarOpen(false); };

  const pageTitle = { vault: 'My Vault', health: 'Password Health' };

  return (
    <div className="min-h-screen vault-bg-mesh flex">
      {/* Desktop sidebar */}
      <div className="border-r border-vault-border flex-shrink-0">
        <DashboardSidebar
          activePage={activePage}
          onNavigate={handleNavigate}
          stats={stats}
          sessionValid={sessionValid}
          onLockSession={handleClearSession}
          userEmail={userEmail}
          onLogout={() => setShowLogoutConfirm(true)}
        />
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
              <DashboardSidebar
                mobile
                activePage={activePage}
                onNavigate={handleNavigate}
                stats={stats}
                sessionValid={sessionValid}
                onLockSession={handleClearSession}
                userEmail={userEmail}
                onLogout={() => setShowLogoutConfirm(true)}
              />
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
              {activePage === 'vault' && (
                <>
                  <VaultToolbar
                    search={search}
                    onSearchChange={setSearch}
                    onAdd={openCreate}
                    categories={usedCategories}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                    showFavorites={showFavorites}
                    onToggleFavorites={() => setShowFavorites(v => !v)}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    onReload={reload}
                    loading={loading}
                    shownCount={filtered.length}
                    totalCount={credentials.length}
                  />
                  <CredentialGrid
                    loading={loading}
                    viewMode={viewMode}
                    credentials={filtered}
                    search={search}
                    activeCategory={activeCategory}
                    showFavorites={showFavorites}
                    revealedMap={revealedMap}
                    onEdit={openEdit}
                    onFavoriteToggle={handleFavoriteToggle}
                    onDelete={handleDelete}
                    onRevealRequest={handleRevealRequest}
                    onAdd={openCreate}
                  />
                </>
              )}
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
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        icon={LogOut}
        title="Log out"
        message="Are you sure you want to log out? You will need to re-verify via email."
        confirmLabel="Log out"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />

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
