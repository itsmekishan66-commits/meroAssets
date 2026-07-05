import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Mail } from 'lucide-react';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function OTPModal({ isOpen, onClose, onSuccess, userEmail }) {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState(userEmail || '');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    if (isOpen) {
      setEmail(userEmail || '');
      setOtp(['', '', '', '', '', '']);
      setError('');
      if (userEmail) {
        setStep('code');
        authAPI.start(userEmail).then(() => toast.success('Code sent to your email')).catch(() => {});
        setTimeout(() => inputRefs.current[0]?.focus(), 200);
      } else {
        setStep('email');
      }
    }
  }, [isOpen, userEmail]);

  const handleSendCode = async () => {
    if (!email || !email.includes('@')) {
      return toast.error('Enter a valid email address');
    }
    setLoading(true);
    try {
      await authAPI.start(email);
      setStep('code');
      toast.success('Code sent to your email');
      setTimeout(() => inputRefs.current[0]?.focus(), 200);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    setError('');
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
    if (val && idx === 5) handleVerify(next.join(''));
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
    if (e.key === 'Enter' && step === 'email') handleSendCode();
    if (e.key === 'Enter' && step === 'code') handleVerify(otp.join(''));
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) {
      const digits = paste.split('');
      setOtp(digits);
      inputRefs.current[5]?.focus();
      setTimeout(() => handleVerify(paste), 100);
    }
  };

  const handleVerify = async (code) => {
    const finalCode = code || otp.join('');
    if (finalCode.length < 6) return;
    setLoading(true);
    try {
      const res = await authAPI.verify(email, finalCode);
      sessionStorage.setItem('meroassets_session', res.data.sessionToken);
      sessionStorage.setItem('meroassets_session_expires', Date.now() + 5 * 60 * 1000);
      toast.success('Identity verified');
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid code');
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="glass-card rounded-2xl p-8 w-full max-w-sm relative"
          >
            <div className="absolute inset-0 rounded-2xl bg-vault-accent/5 pointer-events-none" />

            <button onClick={onClose} className="absolute top-4 right-4 text-vault-muted hover:text-vault-text transition-colors">
              <X size={20} />
            </button>

            <div className="flex flex-col items-center gap-5">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-vault-accent/20 to-vault-accent2/20 border border-vault-accent/30 flex items-center justify-center"
              >
                <Shield size={28} className="text-vault-accent" />
              </motion.div>

              <div className="text-center">
                <h3 className="font-display text-xl font-bold text-vault-text">Verify Identity</h3>
                <p className="text-vault-muted text-sm mt-1 flex items-center justify-center gap-1.5">
                  <Mail size={13} />
                  {step === 'email' ? 'Enter your email address' : 'Enter the 6-digit code sent to'}
                </p>
                {step === 'code' && userEmail && (
                  <p className="text-vault-text text-xs font-medium mt-1.5 px-3 py-1 rounded-lg bg-white/5 inline-block">{userEmail}</p>
                )}
              </div>

              {step === 'email' && !userEmail ? (
                <div className="w-full space-y-4">
                  <input type="email" value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => handleKeyDown(null, e)}
                    placeholder="you@example.com"
                    className="vault-input w-full px-4 py-3 rounded-xl text-sm"
                    autoFocus
                  />
                  <button onClick={handleSendCode} disabled={loading}
                    className="btn-glow w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 relative z-10"
                  >
                    {loading
                      ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : 'Send Code'
                    }
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2" onPaste={handlePaste}>
                    {otp.map((d, i) => (
                      <motion.input
                        key={i}
                        ref={el => inputRefs.current[i] = el}
                        type="text" inputMode="numeric"
                        value={d}
                        onChange={e => handleChange(i, e.target.value)}
                        onKeyDown={e => handleKeyDown(i, e)}
                        className={`otp-input w-11 h-13 rounded-xl transition-all ${error ? 'border-vault-accent2' : ''}`}
                        style={{ height: '52px' }}
                        maxLength={1}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      />
                    ))}
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-vault-accent2 text-sm text-center"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <button onClick={() => handleVerify(otp.join(''))}
                    disabled={loading || otp.join('').length < 6}
                    className="btn-glow w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 relative z-10 disabled:opacity-40"
                  >
                    {loading
                      ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : 'Verify Identity'
                    }
                  </button>

                  {!userEmail && (
                    <button onClick={() => { setStep('email'); setError(''); }}
                      className="w-full text-sm text-vault-muted hover:text-vault-text transition-colors">
                      ← Change email
                    </button>
                  )}
                </>
              )}

              <p className="text-xs text-vault-muted text-center">
                Session valid for <span className="text-vault-accent">5 minutes</span> after verification
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}