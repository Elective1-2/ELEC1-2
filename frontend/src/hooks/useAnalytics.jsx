// src/hooks/useAnalytics.js
import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function useAnalyticsSummary(date) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (date) params.append('date', date);
      
      const response = await fetch(`${API_URL}/admin/analytics/summary?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setSummary(data.summary);
        setError(null);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, loading, error, refetch: fetchSummary };
}

export function useWeeklyRidership(weekOffset = 0) {
  const [data, setData] = useState({ data: [], weekStart: '', weekEnd: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/analytics/weekly-ridership?weekOffset=${weekOffset}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      
      if (result.success) {
        setData(result);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [weekOffset]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useDelayHistory(weekOffset = 0) {
  const [data, setData] = useState({ data: [], weekStart: '', weekEnd: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/analytics/delay-history?weekOffset=${weekOffset}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      
      if (result.success) {
        setData(result);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [weekOffset]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useRoutePerformance(days = 7) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/analytics/route-performance?days=${days}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useTripHistory(filters) {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: filters.page,
        limit: filters.limit,
        ...(filters.bus && { bus: filters.bus }),
        ...(filters.route && { route: filters.route }),
        ...(filters.dateStart && { dateStart: filters.dateStart }),
        ...(filters.dateEnd && { dateEnd: filters.dateEnd })
      });
      
      const response = await fetch(`${API_URL}/admin/analytics/trip-history?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        setPagination(result.pagination);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, pagination, loading, error, refetch: fetchData };
}

export function useRoutesWithTrips() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRoutes = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/analytics/routes-with-trips`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      
      if (result.success) {
        setRoutes(result.routes);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  return { routes, loading, error, refetch: fetchRoutes };
}