import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

// Shared background + brand card used by every auth screen (login, register)
// so they stay visually consistent.
export default function AuthShell({ children }) {
  return (
    <div className="min-h-screen vault-bg-mesh hex-pattern flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute w-96 h-96 rounded-full bg-vault-accent/10 blur-3xl -top-20 -left-20 animate-float" />
      <div className="absolute w-80 h-80 rounded-full bg-vault-accent2/10 blur-3xl -bottom-20 -right-20 animate-float" style={{ animationDelay: '3s' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-vault-accent to-vault-accent2 flex items-center justify-center animate-pulse-glow">
              <Lock size={22} className="text-white" />
            </div>
          </div>
          <span className="font-display text-2xl font-bold text-vault-text tracking-tight">MeroAssets</span>
        </div>

        <div className="glass-card rounded-2xl p-8">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
