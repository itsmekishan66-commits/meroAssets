import api from '../../../lib/api-client.js';

// Authentication / session endpoints. Used by the setup flow, the OTP modal
// and the app shell, so it lives in its own feature instead of lib/.
export const authAPI = {
  getStatus: () => api.get('/auth/status'),
  register: ({ name, phone, address, email }) => api.post('/auth/register', { name, phone, address, email }),
  start: (email) => api.post('/auth/start', { email }),
  verify: (email, code) => api.post('/auth/verify', { email, code }),
  getMe: () => api.get('/auth/me'),
};
