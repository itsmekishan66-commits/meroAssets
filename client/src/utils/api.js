import axios from 'axios';

const BASE_URL = '/api';

const api = axios.create({ baseURL: BASE_URL });

// Inject session token and client header on every request
api.interceptors.request.use(config => {
  const token = sessionStorage.getItem('meroassets_session');
  if (token) config.headers['x-session-token'] = token;
  config.headers['x-meroassets-client'] = 'true';
  return config;
});

export const authAPI = {
  getStatus: () => api.get('/auth/status'),
  start: (email) => api.post('/auth/start', { email }),
  verify: (email, code) => api.post('/auth/verify', { email, code }),
  getMe: () => api.get('/auth/me'),
};

export const credentialAPI = {
  getAll: () => api.get('/credentials'),
  reveal: (id) => api.get(`/credentials/${id}/reveal`),
  create: (data) => api.post('/credentials', data),
  update: (id, data) => api.put(`/credentials/${id}`, data),
  delete: (id) => api.delete(`/credentials/${id}`),
  getStats: () => api.get('/stats'),
};

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

export const CATEGORIES = [
  { value: 'General', color: '#3b82f6', bg: '#3b82f622' },
  { value: 'Social', color: '#3b82f6', bg: '#3b82f622' },
  { value: 'Banking', color: '#1d4ed8', bg: '#1d4ed822' },
  { value: 'Work', color: '#2563eb', bg: '#2563eb22' },
  { value: 'Shopping', color: '#60a5fa', bg: '#60a5fa22' },
  { value: 'Email', color: '#0ea5e9', bg: '#0ea5e922' },
  { value: 'Gaming', color: '#6366f1', bg: '#6366f122' },
];

export const getCategoryStyle = (category) => {
  return CATEGORIES.find(c => c.value === category) || CATEGORIES[0];
};


