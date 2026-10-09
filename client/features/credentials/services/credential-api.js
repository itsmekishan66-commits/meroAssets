import api from '../../../lib/api-client.js';

export const credentialAPI = {
  getAll: () => api.get('/credentials'),
  reveal: (id) => api.get(`/credentials/${id}/reveal`),
  create: (data) => api.post('/credentials', data),
  update: (id, data) => api.put(`/credentials/${id}`, data),
  delete: (id) => api.delete(`/credentials/${id}`),
  getStats: () => api.get('/stats'),
};
