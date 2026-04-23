import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function useDashboard(autoRefresh = true) {
  const [stats, setStats] = useState({
    activeBuses: 0,
    activeTrips: 0,
    tripsToday: 0,
    totalPassengersToday: 0,
    avgPassengersToday: 0,
    delayedTripsToday: 0,
    averageDelayMinutes: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch dashboard stats');
      }

      setStats(data.stats);
      setError(null);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    if (autoRefresh) {
      const interval = setInterval(fetchStats, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchStats, autoRefresh]);

  return { stats, loading, error, refetch: fetchStats };
}