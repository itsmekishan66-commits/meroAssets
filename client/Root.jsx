import React, { useState, useEffect } from 'react';
import { authAPI } from './features/auth/index.js';
import AppRoutes from './app/routes.jsx';
import { isSessionValid } from './shared/utils/session.js';

export default function App() {
  const [status, setStatus] = useState(null); // null | { authenticated, email, isAdmin }

  useEffect(() => {
    if (!isSessionValid()) {
      setStatus({ authenticated: false, email: null, isAdmin: false });
      return;
    }
    authAPI.getStatus()
      .then(r => setStatus({ authenticated: r.data.authenticated, email: r.data.email || null, isAdmin: Boolean(r.data.isAdmin) }))
      .catch(() => setStatus({ authenticated: false, email: null, isAdmin: false }));
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
    <AppRoutes
      authenticated={status.authenticated}
      email={status.email}
      isAdmin={status.isAdmin}
      onSetupComplete={(email, isAdmin) => setStatus({ authenticated: true, email, isAdmin: Boolean(isAdmin) })}
    />
  );
}
