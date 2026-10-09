import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI } from '../../auth/services/auth-api.js';
import AuthShell from '../../auth/components/AuthShell.jsx';
import useOtpInput from '../../otp/hooks/useOtpInput.js';
import { isSessionValid, saveSession } from '../../../shared/utils/session.js';
import toast from 'react-hot-toast';
import { ShieldCheck, Mail, ChevronRight } from 'lucide-react';

export default function Setup({ onComplete }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { otp, inputRefs, focus, reset, handleChange, handleKeyDown, handlePaste } = useOtpInput();

  useEffect(() => {
    if (isSessionValid()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSendCode = async () => {
    if (!email || !email.includes('@')) {
      return toast.error('Enter a valid email address');
    }
    setLoading(true);
    try {
      await authAPI.start(email);
      setStep(1);
      toast.success('Code sent to your email');
      setTimeout(() => focus(0), 200);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) return toast.error('Enter the full 6-digit code');
    setLoading(true);
    try {
      const res = await authAPI.verify(email, code);
      saveSession(res.data.sessionToken);
      toast.success('Verified!');
      // Admins (ADMIN_EMAILS in client/.env) land in the admin panel.
      const nextPath = res.data.isAdmin ? '/admin' : '/dashboard';
      setTimeout(() => { onComplete(email, res.data.isAdmin); navigate(nextPath); }, 800);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid code');
      reset(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="email"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="font-display text-2xl font-bold text-vault-text">Sign in to your vault</h2>
              <p className="text-vault-muted text-sm mt-1">Enter your email to receive a verification code.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-vault-muted font-medium flex items-center gap-2">
                <Mail size={14}/> Email Address
              </label>
              <input type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="vault-input w-full px-4 py-3 rounded-xl text-sm"
                onKeyDown={e => e.key === 'Enter' && handleSendCode()}
                autoFocus
              />
            </div>

            <button onClick={handleSendCode} disabled={loading || !email}
              className="btn-glow w-full py-3.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 relative z-10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Send Code <ChevronRight size={18}/></>}
            </button>

            <p className="text-sm text-vault-muted text-center">
              Don't have an account?
              <Link to="/register" className="text-vault-text font-medium hover:underline ml-1">
                Create one
              </Link>
            </p>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="verify"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="font-display text-2xl font-bold text-vault-text">Verify Code</h2>
              <p className="text-vault-muted text-sm mt-1">Enter the 6-digit code sent to <strong className="text-vault-text">{email}</strong></p>
            </div>

            <div className="flex gap-2 justify-center" onPaste={handlePaste}>
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={el => inputRefs.current[i] = el}
                  type="text" inputMode="numeric"
                  value={d}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  className="otp-input w-12 h-14 rounded-xl"
                  maxLength={1}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            <button onClick={handleVerify} disabled={loading || otp.join('').length < 6}
              className="btn-glow w-full py-3.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 relative z-10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Verify <ShieldCheck size={18}/></>}
            </button>

            <button onClick={() => { setStep(0); reset(); }} className="w-full text-sm text-vault-muted hover:text-vault-text transition-colors">
              ← Use a different email
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthShell>
  );
}
