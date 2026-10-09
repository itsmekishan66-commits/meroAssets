import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { credentialAPI } from '../services/credential-api.js';

export default function useCredentials(enabled) {
  const [credentials, setCredentials] = useState([]);
  const [stats, setStats] = useState({ total: 0, favorites: 0, categories: 0 });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!enabled) { setLoading(false); return; }
    try {
      const [credsRes, statsRes] = await Promise.all([
        credentialAPI.getAll(),
        credentialAPI.getStats()
      ]);
      setCredentials(credsRes.data);
      setStats(statsRes.data);
    } catch {
      toast.error('Failed to load data. Is the server running?');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => { loadData(); }, [loadData]);

  return { credentials, setCredentials, stats, setStats, loading, reload: loadData };
}
