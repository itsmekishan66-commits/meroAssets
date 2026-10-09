import React, { useState, useEffect } from 'react';
import { authAPI } from './features/auth/index.js';
import AppRoutes from './app/routes.jsx';
import { isSessionValid } from './shared/utils/session.js';

export default function App() {
  const [status, setStatus] = useState(null); // null | { authenticated, email }

  useEffect(() => {
    if (!isSessionValid()) {
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
    <AppRoutes
      authenticated={status.authenticated}
      email={status.email}
      onSetupComplete={(email) => setStatus({ authenticated: true, email })}
    />
  );
}
