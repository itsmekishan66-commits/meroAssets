import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '../services/admin-api.js';

const PAGE_SIZE = 20;

// Shared admin error handling. 401 → session gone (let the panel redirect),
// 403 → not an admin, anything else → show the server message.
const handleError = (err, onUnauthorized, fallback) => {
  const status = err.response?.status;
  if (status === 401) {
    onUnauthorized?.();
    return;
  }
  if (status === 403) {
    toast.error('Admin access required');
    return;
  }
  toast.error(err.response?.data?.error || fallback);
};

export default function useAdminData({ onUnauthorized } = {}) {
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState({ list: [], total: 0, page: 1, limit: PAGE_SIZE });
  const [credentials, setCredentials] = useState({ list: [], total: 0, page: 1, limit: PAGE_SIZE });
  const [activity, setActivity] = useState([]);
  const [settings, setSettings] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOverview = useCallback(async () => {
    try {
      const res = await adminAPI.getOverview();
      setOverview(res.data);
    } catch (err) {
      handleError(err, onUnauthorized, 'Failed to load overview');
    }
  }, [onUnauthorized]);

  const loadUsers = useCallback(async ({ search = '', page = 1 } = {}) => {
    try {
      const res = await adminAPI.getUsers({ search, page, limit: PAGE_SIZE });
      setUsers({ list: res.data.users, total: res.data.total, page: res.data.page, limit: res.data.limit });
    } catch (err) {
      handleError(err, onUnauthorized, 'Failed to load users');
    }
  }, [onUnauthorized]);

  const loadCredentials = useCallback(async ({ search = '', page = 1 } = {}) => {
    try {
      const res = await adminAPI.getCredentials({ search, page, limit: PAGE_SIZE });
      setCredentials({ list: res.data.credentials, total: res.data.total, page: res.data.page, limit: res.data.limit });
    } catch (err) {
      handleError(err, onUnauthorized, 'Failed to load credentials');
    }
  }, [onUnauthorized]);

  const loadActivity = useCallback(async () => {
    try {
      const res = await adminAPI.getActivity(50);
      setActivity(res.data);
    } catch (err) {
      handleError(err, onUnauthorized, 'Failed to load activity');
    }
  }, [onUnauthorized]);

  const loadSettings = useCallback(async () => {
    try {
      const res = await adminAPI.getSettings();
      setSettings(res.data);
    } catch (err) {
      handleError(err, onUnauthorized, 'Failed to load settings');
    }
  }, [onUnauthorized]);

  const loadAdmins = useCallback(async () => {
    try {
      const res = await adminAPI.getAdmins();
      setAdmins(res.data);
    } catch (err) {
      handleError(err, onUnauthorized, 'Failed to load admins');
    }
  }, [onUnauthorized]);

  // Load everything that drives the Overview / Activity / Settings / Admins
  // pages up front. Users and Vault Oversight load lazily per page.
  const reload = useCallback(async () => {
    setLoading(true);
    await Promise.allSettled([loadOverview(), loadActivity(), loadSettings(), loadAdmins()]);
    setLoading(false);
  }, [loadOverview, loadActivity, loadSettings, loadAdmins]);

  return {
    overview,
    users,
    credentials,
    activity,
    settings,
    admins,
    loading,
    reload,
    loadUsers,
    loadCredentials,
    loadActivity,
    loadSettings,
    loadAdmins,
  };
}