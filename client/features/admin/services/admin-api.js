import api from '../../../lib/api-client.js';

// Build a query string, skipping empty values entirely.
const withQuery = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  });
  const qs = query.toString();
  return qs ? `?${qs}` : '';
};

// Admin endpoints. The server enforces admin access on every one of them.
export const adminAPI = {
  getOverview: () => api.get('/admin/overview'),
  getUsers: (params = {}) => api.get(`/admin/users${withQuery(params)}`),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getCredentials: (params = {}) => api.get(`/admin/credentials${withQuery(params)}`),
  getActivity: (limit = 50) => api.get(`/admin/activity?limit=${limit}`),
  getSettings: () => api.get('/admin/settings'),
  getAdmins: () => api.get('/admin/admins'),
};