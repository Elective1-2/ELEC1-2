import { useState, useEffect, useCallback } from 'react';

// No API_URL variable needed - use relative paths everywhere
// Development: Vite proxy handles /api -> http://localhost:5000
// Production: Same-origin requests to /api work natively

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
      // Relative path - works in dev (via Vite proxy) and prod (same origin)
      const response = await fetch(`/api/schedules/${routeId}?day_type=${dayType}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch schedule');
      }

      setSchedule(data);
    } catch (err) {
      console.error('Schedule fetch error:', err);
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
        // Relative path - works in dev and prod
        const response = await fetch('/api/schedules/routes');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch routes');
        }

        setRoutes(data.routes || []);
      } catch (err) {
        console.error('Routes fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  return { routes, loading, error };
}