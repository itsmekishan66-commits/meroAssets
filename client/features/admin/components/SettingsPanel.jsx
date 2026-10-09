import React from 'react';
import { Timer, KeyRound, ShieldCheck, Server, FileLock2 } from 'lucide-react';

const fmtMinutes = (ms) => (ms / 60000).toFixed(0);

function SettingRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className="w-8 h-8 rounded-lg bg-vault-accent/10 text-vault-accent flex items-center justify-center flex-shrink-0">
        <Icon size={15} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-vault-text">{label}</p>
        <div className="text-xs text-vault-muted mt-0.5">{children}</div>
      </div>
    </div>
  );
}

export default function SettingsPanel({ settings }) {
  if (!settings) return null;

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-xl divide-y divide-vault-border overflow-hidden">
        <SettingRow icon={Timer} label="Session Duration">
          <span className="font-mono text-vault-text">{fmtMinutes(settings.sessionTtlMs)} minutes</span> — how long a vault session stays unlocked before requiring OTP again.
        </SettingRow>
        <SettingRow icon={KeyRound} label="Verification Code Lifetime">
          <span className="font-mono text-vault-text">{fmtMinutes(settings.otpTtlMs)} minutes</span> — an emailed 6-digit code expires after this.
        </SettingRow>
        <SettingRow icon={ShieldCheck} label="Max Code Attempts">
          <span className="font-mono text-vault-text">{settings.maxOtpAttempts}</span> — wrong codes at or above this lock the code and demand a fresh one.
        </SettingRow>
        <SettingRow icon={Server} label="SMTP">
          {settings.smtpConfigured ? (
            <span className="text-blue-500">Configured</span>
          ) : (
            <span>Not configured — codes are printed to the server console.</span>
          )}
        </SettingRow>
      </div>

      <div className="glass-card rounded-xl p-4">
        <h3 className="text-sm font-medium text-vault-text mb-2 flex items-center gap-2">
          <FileLock2 size={15} className="text-vault-accent" />
          Where settings live
        </h3>
        <p className="text-xs text-vault-muted leading-relaxed">
          These values are read-only from the admin panel. Session/OTP constants are code in{' '}
          <code className="font-mono">server/shared/constants</code>, and admin access comes from{' '}
          <code className="font-mono">ADMIN_EMAILS</code> in <code className="font-mono">client/.env</code>.
          Edit those files and restart the server to change them.
        </p>
      </div>
    </div>
  );
}