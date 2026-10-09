import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, User, Phone, MapPin, ChevronRight, ShieldCheck, LogIn } from 'lucide-react';
import { authAPI } from '../services/auth-api.js';
import AuthShell from '../components/AuthShell.jsx';
import useOtpInput from '../../otp/hooks/useOtpInput.js';
import { isSessionValid, saveSession } from '../../../shared/utils/session.js';
import { validateRegistration } from '../../../shared/utils/validation.js';
import toast from 'react-hot-toast';

const Required = () => <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>;

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: '', phone: '', address: '', email: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { otp, inputRefs, focus, reset, handleChange, handleKeyDown, handlePaste } = useOtpInput();

  useEffect(() => {
    if (isSessionValid()) navigate('/dashboard');
  }, [navigate]);

  const setField = (key) => (e) => {
    const value = e.target.value;
    setForm(f => ({ ...f, [key]: value }));
    setErrors(prev => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const inputStyle = (key) => (errors[key] ? { borderColor: '#ef4444' } : undefined);

  const handleRegister = async () => {
    const nextErrors = validateRegistration(form);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return toast.error('Please fix the highlighted fields');
    }

    setLoading(true);
    try {
      await authAPI.register(form);
      setStep(1);
      toast.success('Account created — code sent to your email');
      setTimeout(() => focus(0), 200);
    } catch (err) {
      const fieldErrors = err.response?.data?.errors;
      if (fieldErrors) setErrors(fieldErrors);
      toast.error(err.response?.data?.error || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) return toast.error('Enter the full 6-digit code');
    setLoading(true);
    try {
      const res = await authAPI.verify(form.email, code);
      saveSession(res.data.sessionToken);
      toast.success('Verified!');
      setTimeout(() => { navigate('/dashboard'); }, 800);
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
          <motion.div key="details"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <h2 className="font-display text-2xl font-bold text-vault-text">Create your vault</h2>
              <p className="text-vault-muted text-sm mt-1">No password needed — we verify you by email code.</p>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-vault-muted font-medium flex items-center gap-2">
                <User size={14}/> Name<Required/>
              </label>
              <input type="text" value={form.name}
                onChange={setField('name')}
                placeholder="Ada Lovelace"
                className="vault-input w-full px-4 py-3 rounded-xl text-sm"
                style={inputStyle('name')}
                onKeyDown={e => e.key === 'Enter' && handleRegister()}
                autoFocus
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm text-vault-muted font-medium flex items-center gap-2">
                <Phone size={14}/> Phone Number<Required/>
              </label>
              <input type="tel" value={form.phone}
                onChange={setField('phone')}
                placeholder="+1 555 010 0100"
                className="vault-input w-full px-4 py-3 rounded-xl text-sm"
                style={inputStyle('phone')}
                onKeyDown={e => e.key === 'Enter' && handleRegister()}
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm text-vault-muted font-medium flex items-center gap-2">
                <Mail size={14}/> Email Address<Required/>
              </label>
              <input type="email" value={form.email}
                onChange={setField('email')}
                placeholder="you@example.com"
                className="vault-input w-full px-4 py-3 rounded-xl text-sm"
                style={inputStyle('email')}
                onKeyDown={e => e.key === 'Enter' && handleRegister()}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm text-vault-muted font-medium flex items-center gap-2">
                <MapPin size={14}/> Address <span className="text-vault-muted/70">(optional)</span>
              </label>
              <input type="text" value={form.address}
                onChange={setField('address')}
                placeholder="123 Main St, City"
                className="vault-input w-full px-4 py-3 rounded-xl text-sm"
                onKeyDown={e => e.key === 'Enter' && handleRegister()}
              />
            </div>

            <p className="text-xs text-vault-muted"><span className="text-red-500">*</span> Required field</p>

            <button onClick={handleRegister} disabled={loading}
              className="btn-glow w-full py-3.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 relative z-10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Create Account <ChevronRight size={18}/></>}
            </button>

            <p className="text-sm text-vault-muted text-center flex items-center justify-center gap-1.5">
              Already have an account?
              <Link to="/setup" className="text-vault-text font-medium hover:underline flex items-center gap-1">
                <LogIn size={13}/> Sign in
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
              <p className="text-vault-muted text-sm mt-1">Enter the 6-digit code sent to <strong className="text-vault-text">{form.email}</strong></p>
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
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Verify & Enter <ShieldCheck size={18}/></>}
            </button>

            <button onClick={() => { setStep(0); reset(); }} className="w-full text-sm text-vault-muted hover:text-vault-text transition-colors">
              ← Edit details
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthShell>
  );
}
