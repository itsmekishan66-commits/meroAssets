import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { authAPI } from './utils/api';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [status, setStatus] = useState(null); // null | { authenticated, email }

  useEffect(() => {
    const token = sessionStorage.getItem('meroassets_session');
    const expires = sessionStorage.getItem('meroassets_session_expires');
    if (!token || !expires || Date.now() > Number(expires)) {
      setStatus({ authenticated: false, email: null });
      return;
    }
    authAPI.getStatus()
      .then(r => setStatus({ authenticated: r.data.authenticated, email: r.data.email || null }))
      .catch(() => setStatus({ authenticated: false, email: null }));
  }, []);

  if (status === null) {
    return (
      <div className="min-h-screen vault-bg-mesh flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-vault-accent border-t-transparent animate-spin" />
          <p className="text-vault-muted font-mono text-sm">Initializing MeroAssets...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/setup" element={<Setup onComplete={(email) => setStatus({ authenticated: true, email })} />} />
      <Route path="/app" element={status.authenticated ? <Dashboard userEmail={status.email} /> : <Navigate to="/setup" />} />
      <Route path="/" element={<Navigate to="/setup" />} />
      <Route path="*" element={<Navigate to="/setup" />} />
    </Routes>
  );
}
