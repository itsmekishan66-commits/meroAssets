import { useCallback, useRef, useState } from 'react';

const DEFAULT_LENGTH = 6;

/**
 * Shared OTP input behaviour for the six single-digit boxes used by the
 * setup page and the OTP modal: controlled digits, auto-advance, backspace /
 * arrow navigation and paste distribution.
 *
 * @param {object}   [options]
 * @param {number}   [options.length]   Number of digits (default 6).
 * @param {Function} [options.onChange] Called with (code, index) after each edit.
 * @param {Function} [options.onComplete] Called with the full code when the last
 *   digit is filled or a full code is pasted.
 * @param {Function} [options.onEnter]  Called with the current code on Enter.
 */
export default function useOtpInput({
  length = DEFAULT_LENGTH,
  onChange,
  onComplete,
  onEnter,
} = {}) {
  const [otp, setOtp] = useState(Array(length).fill(''));
  const inputRefs = useRef([]);

  const focus = useCallback((index) => {
    inputRefs.current[index]?.focus();
  }, []);

  const reset = useCallback((autoFocus = false) => {
    setOtp(Array(length).fill(''));
    if (autoFocus) setTimeout(() => focus(0), 50);
  }, [length, focus]);

  const handleChange = useCallback((index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    onChange?.(next.join(''), index);
    if (value && index < length - 1) focus(index + 1);
    if (value && index === length - 1) onComplete?.(next.join(''));
  }, [otp, length, focus, onChange, onComplete]);

  const handleKeyDown = useCallback((index, event) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) focus(index - 1);
    if (event.key === 'ArrowLeft' && index > 0) focus(index - 1);
    if (event.key === 'ArrowRight' && index < length - 1) focus(index + 1);
    if (event.key === 'Enter') onEnter?.(otp.join(''));
  }, [otp, length, focus, onEnter]);

  const handlePaste = useCallback((event) => {
    const paste = event.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, length);
    if (paste.length !== length) return;
    setOtp(paste.split(''));
    focus(length - 1);
    if (onComplete) setTimeout(() => onComplete(paste), 100);
  }, [length, focus, onComplete]);

  return { otp, setOtp, inputRefs, focus, reset, handleChange, handleKeyDown, handlePaste };
}
