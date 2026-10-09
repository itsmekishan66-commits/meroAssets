export const generatePassword = (length = 16, options = {}) => {
  const {
    uppercase = true, lowercase = true,
    numbers = true, symbols = true
  } = options;
  let chars = '';
  if (uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
  if (numbers) chars += '0123456789';
  if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz';

  return Array.from({ length }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
};

export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, max: 7, label: 'Weak', color: '#555555', pct: (score/7)*100 };
  if (score <= 4) return { score, max: 7, label: 'Fair', color: '#777777', pct: (score/7)*100 };
  if (score <= 6) return { score, max: 7, label: 'Strong', color: '#aaaaaa', pct: (score/7)*100 };
  return { score, max: 7, label: 'Excellent', color: '#ffffff', pct: 100 };
};
