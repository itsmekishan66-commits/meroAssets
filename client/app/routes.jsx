import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Setup } from '../features/setup/index.js';
import { Register } from '../features/auth/index.js';
import { Dashboard } from '../features/credentials/index.js';

export default function AppRoutes({ authenticated, email, onSetupComplete }) {
  return (
    <Routes>
      <Route path="/setup" element={<Setup onComplete={onSetupComplete} />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/app"
        element={authenticated ? <Dashboard userEmail={email} /> : <Navigate to="/setup" />}
      />
      <Route path="/" element={<Navigate to="/setup" />} />
      <Route path="*" element={<Navigate to="/setup" />} />
    </Routes>
  );
}
