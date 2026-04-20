import { useState, useEffect, useCallback } from 'react';

// Use relative paths - works in dev and prod
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
      // Relative path - Vite proxy handles in dev, same-origin in prod
      const response = await fetch(`/api/schedules/${routeId}?day_type=${dayType}`);
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
        // Relative path
        const response = await fetch('/api/schedules/routes');
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