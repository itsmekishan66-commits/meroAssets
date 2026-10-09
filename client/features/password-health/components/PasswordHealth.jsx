import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ShieldCheck, AlertTriangle, Clock, Copy, Edit2, X } from 'lucide-react';
import { getCategoryStyle } from '../../../shared/utils/category.js';
import { getPasswordStrength } from '../../../shared/utils/password.js';

function daysSince(dateStr) {
  return Math.floor((Date.now() - new Date(dateStr)) / 86400000);
}

export default function PasswordHealth({ credentials, revealedMap, onEdit, onRevealRequest }) {
  const [dismissed, setDismissed] = useState(new Set());

  const issues = useMemo(() => {
    const list = [];

    // Group by password to find duplicates
    const pwGroups = {};
    Object.entries(revealedMap).forEach(([id, data]) => {
      if (!pwGroups[data.password]) pwGroups[data.password] = [];
      pwGroups[data.password].push(id);
    });

    credentials.forEach(c => {
      if (dismissed.has(c._id)) return;

      const age = daysSince(c.updatedAt || c.createdAt);
      const revealed = revealedMap[c._id];
      const strength = revealed ? getPasswordStrength(revealed.password) : null;

      if (age > 180) {
        list.push({ id: c._id + '_age', credId: c._id, cred: c, type: 'old', severity: age > 365 ? 'high' : 'medium', message: `Password is ${age} days old`, detail: age > 365 ? 'Over a year — strongly consider rotating.' : 'Over 6 months old.' });
      }

      if (strength && strength.score <= 2) {
        list.push({ id: c._id + '_weak', credId: c._id, cred: c, type: 'weak', severity: 'high', message: 'Weak password detected', detail: `Strength score: ${strength.score}/7 (${strength.label})` });
      } else if (strength && strength.score <= 4) {
        list.push({ id: c._id + '_fair', credId: c._id, cred: c, type: 'weak', severity: 'medium', message: 'Fair password strength', detail: 'Could be stronger — add symbols or length.' });
      }

      if (revealed) {
        const dupIds = pwGroups[revealed.password];
        if (dupIds && dupIds.length > 1 && dupIds[0] === c._id) {
          const others = credentials.filter(x => dupIds.includes(x._id) && x._id !== c._id).map(x => x.site).join(', ');
          list.push({ id: c._id + '_dup', credId: c._id, cred: c, type: 'duplicate', severity: 'high', message: 'Password reused', detail: `Same password used on: ${others}` });
        }
      }
    });

    return list.sort((a, b) => {
      const sev = { high: 0, medium: 1, low: 2 };
      return sev[a.severity] - sev[b.severity];
    });
  }, [credentials, revealedMap, dismissed]);

  const highCount = issues.filter(i => i.severity === 'high').length;
  const medCount = issues.filter(i => i.severity === 'medium').length;

  const severityStyle = {
    high:   { color: '#444444', bg: '#44444420', icon: <ShieldAlert size={15}/> },
    medium: { color: '#666666', bg: '#66666620', icon: <AlertTriangle size={15}/> },
    low:    { color: '#888888', bg: '#88888820', icon: <ShieldCheck size={15}/> },
  };

  const typeIcon = { old: <Clock size={13}/>, weak: <ShieldAlert size={13}/>, duplicate: <Copy size={13}/> };

  if (issues.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-vault-accent/10 flex items-center justify-center mb-4">
          <ShieldCheck size={28} className="text-vault-accent" />
        </div>
        <h3 className="font-display text-lg font-bold text-vault-text mb-1">All clear!</h3>
        <p className="text-vault-muted text-sm max-w-xs">
          {Object.keys(revealedMap).length === 0
            ? 'Reveal some passwords via OTP to run a full health check.'
            : 'No weak, old, or duplicate passwords detected.'}
        </p>
        <div className="mt-6 text-xs text-vault-muted text-left max-w-xs space-y-1">
          <p><span className="text-vault-text font-medium">1.</span> Weak passwords — strength ≤4/7</p>
          <p><span className="text-vault-text font-medium">2.</span> Old passwords — over 6 months old</p>
          <p><span className="text-vault-text font-medium">3.</span> Reused passwords — same on multiple sites</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex gap-3">
        {highCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium"
            style={{ background: '#44444420', color: '#444444', border: '1px solid #44444440' }}>
            <ShieldAlert size={15}/> {highCount} critical
          </div>
        )}
        {medCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium"
            style={{ background: '#66666620', color: '#666666', border: '1px solid #66666640' }}>
            <AlertTriangle size={15}/> {medCount} warnings
          </div>
        )}
        <p className="ml-auto text-xs text-vault-muted self-center">
          Reveal passwords via OTP for full analysis
        </p>
      </div>

      {/* Issue list */}
      <AnimatePresence>
        {issues.map((issue, i) => {
          const sty = severityStyle[issue.severity];
          const cat = getCategoryStyle(issue.cred.category);
          return (
            <motion.div
              key={issue.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass-card rounded-xl p-4 flex items-start gap-4"
              style={{ borderLeft: `3px solid ${sty.color}` }}
            >
              {/* Site avatar */}
              <div className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center text-sm font-bold font-display"
                style={{ background: cat.bg, color: cat.color }}>
                {issue.cred.site[0]?.toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-medium text-vault-text text-sm">{issue.cred.site}</span>
                  <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                    style={{ background: sty.bg, color: sty.color }}>
                    {sty.icon} {issue.message}
                  </span>
                </div>
                <p className="text-vault-muted text-xs">{issue.detail}</p>
                {issue.cred.username && (
                  <p className="text-vault-muted text-xs mt-0.5">User: {issue.cred.username}</p>
                )}
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                {!revealedMap[issue.credId] && (
                  <button onClick={() => onRevealRequest(issue.credId)}
                    className="px-2.5 py-1.5 rounded-lg text-xs text-vault-muted hover:text-white hover:bg-black/30 transition-all border border-vault-border">
                    Reveal
                  </button>
                )}
                <button onClick={() => onEdit(issue.cred)}
                  className="p-1.5 rounded-lg text-vault-muted hover:text-white hover:bg-black/30 transition-all"
                  title="Edit credential">
                  <Edit2 size={14}/>
                </button>
                <button onClick={() => setDismissed(d => new Set([...d, issue.credId]))}
                  className="p-1.5 rounded-lg text-vault-muted hover:text-white hover:bg-black/20 transition-all"
                  title="Dismiss">
                  <X size={14}/>
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <div className="text-xs text-vault-muted space-y-1 pt-2 border-t border-vault-border/30">
        <p><span className="text-vault-text font-medium">1.</span> Weak passwords — strength ≤4/7</p>
        <p><span className="text-vault-text font-medium">2.</span> Old passwords — over 6 months old</p>
        <p><span className="text-vault-text font-medium">3.</span> Reused passwords — same on multiple sites</p>
      </div>
    </div>
  );
}
