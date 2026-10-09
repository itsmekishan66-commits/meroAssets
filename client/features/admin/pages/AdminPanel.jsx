import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, ArrowLeft, LogOut } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar.jsx';
import OverviewPanel from '../components/OverviewPanel.jsx';
import UsersPanel from '../components/UsersPanel.jsx';
import VaultOversightPanel from '../components/VaultOversightPanel.jsx';
import ActivityPanel from '../components/ActivityPanel.jsx';
import SettingsPanel from '../components/SettingsPanel.jsx';
import AdminsPanel from '../components/AdminsPanel.jsx';
import ConfirmDialog from '../../../shared/components/ConfirmDialog.jsx';
import useAdminData from '../hooks/useAdminData.js';
import { isSessionValid, getSessionExpiry, clearSession } from '../../../shared/utils/session.js';
import toast from 'react-hot-toast';

const PAGE_TITLES = {
  overview: 'Overview',
  users: 'User Management',
  vault: 'Vault Oversight',
  activity: 'Activity Log',
  settings: 'Settings',
  admins: 'Admin Access',
};

// Internal page id <-> URL slug, so every tab is shareable (e.g. /admin/user-management).
const PAGE_SLUGS = {
  overview: 'overview',
  users: 'user-management',
  vault: 'vault-oversight',
  activity: 'activity-log',
  settings: 'settings',
  admins: 'admin-access',
};
const SLUG_TO_PAGE = Object.fromEntries(
  Object.entries(PAGE_SLUGS).map(([id, slug]) => [slug, id]),
);
const DEFAULT_PAGE = 'overview';

export default function AdminPanel({ userEmail }) {
  const navigate = useNavigate();
  const { tab } = useParams();
  const activePage = SLUG_TO_PAGE[tab] || DEFAULT_PAGE;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleAutoLogout = useCallback(() => {
    if (!isSessionValid()) {
      clearSession();
      navigate('/setup');
    }
  }, [navigate]);

  useEffect(() => {
    const expires = getSessionExpiry();
    if (isSessionValid()) {
      const timer = setTimeout(handleAutoLogout, expires - Date.now());
      return () => clearTimeout(timer);
    }
  }, [handleAutoLogout]);

  // Stable identity so useAdminData's reload/loaders don't churn every render.
  const handleUnauthorized = useCallback(() => {
    clearSession();
    navigate('/setup');
    toast.error('Session expired — sign in again');
  }, [navigate]);

  const handleLogout = () => {
    clearSession();
    setShowLogoutConfirm(false);
    navigate('/setup');
  };

  const {
    overview, users, credentials, activity, settings, admins, loading, reload,
    loadUsers, loadCredentials, loadActivity, loadAdmins,
  } = useAdminData({ onUnauthorized: handleUnauthorized });

  useEffect(() => { reload(); }, [reload]);

  // Keep the URL canonical: bare /admin or an unknown slug falls back to the default tab.
  useEffect(() => {
    if (tab !== PAGE_SLUGS[activePage]) {
      navigate(`/admin/${PAGE_SLUGS[activePage]}`, { replace: true });
    }
  }, [tab, activePage, navigate]);

  // Reload the feed whenever the Activity tab is opened so it reflects the
  // latest admin actions (and any events recorded since the panel loaded).
  useEffect(() => {
    if (activePage === 'activity') loadActivity();
  }, [activePage, loadActivity]);

  const handleNavigate = (id) => {
    setSidebarOpen(false);
    navigate(`/admin/${PAGE_SLUGS[id] || PAGE_SLUGS[DEFAULT_PAGE]}`);
  };

  // A passing-through "wait" while the first load completes.
  const showLoading = loading && !overview;

  return (
    <div className="min-h-screen vault-bg-mesh flex">
      {/* Desktop sidebar */}
      <div className="border-r border-vault-border flex-shrink-0">
        <AdminSidebar
          activePage={activePage}
          onNavigate={handleNavigate}
          onBackToVault={() => navigate('/dashboard')}
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
              onClick={(e) => e.stopPropagation()}>
              <AdminSidebar
                mobile
                activePage={activePage}
                onNavigate={handleNavigate}
                onBackToVault={() => navigate('/dashboard')}
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
            <Menu size={20} />
          </button>
          <h1 className="font-display text-lg font-bold text-vault-text">{PAGE_TITLES[activePage]}</h1>

          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-vault-muted hover:text-vault-text border border-vault-border transition-all">
              <ArrowLeft size={13} />
              Back to Vault
            </button>
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {showLoading ? (
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => <div key={i} className="glass-card rounded-xl p-4 h-24 shimmer" />)}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={activePage}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}>
                {activePage === 'overview' && <OverviewPanel overview={overview} />}
                {activePage === 'users' && <UsersPanel users={users} loadUsers={loadUsers} />}
                {activePage === 'vault' && <VaultOversightPanel credentials={credentials} loadCredentials={loadCredentials} />}
                {activePage === 'activity' && <ActivityPanel activity={activity} reload={loadActivity} />}
                {activePage === 'settings' && <SettingsPanel settings={settings} />}
                {activePage === 'admins' && <AdminsPanel admins={admins} reload={loadAdmins} />}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* Logout confirmation */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        icon={LogOut}
        title="Log out"
        message="Are you sure you want to log out? You will need to re-verify via email."
        confirmLabel="Log out"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}