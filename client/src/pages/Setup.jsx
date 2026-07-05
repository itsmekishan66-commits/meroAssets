import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { ShieldCheck, Mail, ChevronRight, Lock } from 'lucide-react';

export default function Setup({ onComplete }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    const token = sessionStorage.getItem('meroassets_session');
    const expires = sessionStorage.getItem('meroassets_session_expires');
    if (token && expires && Date.now() <= Number(expires)) {
      navigate('/app');
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
      setTimeout(() => inputRefs.current[0]?.focus(), 200);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && idx > 0) inputRefs.current[idx - 1]?.focus();
    if (e.key === 'ArrowRight' && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) {
      setOtp(paste.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) return toast.error('Enter the full 6-digit code');
    setLoading(true);
    try {
      const res = await authAPI.verify(email, code);
      sessionStorage.setItem('meroassets_session', res.data.sessionToken);
      const expires = Date.now() + 5 * 60 * 1000;
      sessionStorage.setItem('meroassets_session_expires', String(expires));
      toast.success('Verified!');
      setTimeout(() => { onComplete(email); navigate('/app'); }, 800);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid code');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

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
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="email"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="font-display text-2xl font-bold text-vault-text">Sign in to your vault</h2>
                  <p className="text-vault-muted text-sm mt-1">Enter your email to receive a verification code. New emails will be registered automatically.</p>
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

                <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                  {otp.map((d, i) => (
                    <input
                      key={i}
                      ref={el => inputRefs.current[i] = el}
                      type="text" inputMode="numeric"
                      value={d}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
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

                <button onClick={() => { setStep(0); setOtp(['', '', '', '', '', '']); }} className="w-full text-sm text-vault-muted hover:text-vault-text transition-colors">
                  ← Use a different email
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
