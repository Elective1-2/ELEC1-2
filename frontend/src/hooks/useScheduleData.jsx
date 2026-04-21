import { useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../config/api';

export function useScheduleData(routeId, dayType = 'weekday') {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSchedule = useCallback(async () => {
    if (!routeId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/schedules/${routeId}?day_type=${dayType}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch schedule');
      }

      setSchedule(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [routeId, dayType]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  return { schedule, loading, error, refetch: fetchSchedule };
}

export function useAllRoutes() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await fetch(`${API_BASE}/schedules/routes`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch routes');
        }

        setRoutes(data.routes || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  return { routes, loading, error };
}