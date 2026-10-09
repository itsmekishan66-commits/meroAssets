import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Setup } from '../features/setup/index.js';
import { Register } from '../features/auth/index.js';
import { Dashboard } from '../features/credentials/index.js';
import { AdminPanel } from '../features/admin/index.js';

export default function AppRoutes({ authenticated, email, isAdmin, onSetupComplete }) {
  return (
    <Routes>
      <Route path="/setup" element={<Setup onComplete={onSetupComplete} />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard/:tab?"
        element={authenticated ? <Dashboard userEmail={email} isAdmin={isAdmin} /> : <Navigate to="/setup" />}
      />
      <Route
        path="/admin/:tab?"
        element={authenticated ? <AdminPanel userEmail={email} /> : <Navigate to="/setup" />}
      />
      <Route path="/" element={<Navigate to="/setup" />} />
      <Route path="*" element={<Navigate to="/setup" />} />
    </Routes>
  );
}
