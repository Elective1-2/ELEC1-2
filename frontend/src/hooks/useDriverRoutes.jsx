import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useDriverRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTrip, setActiveTrip] = useState(null);
  const [checkingTrip, setCheckingTrip] = useState(true);

  const fetchRoutes = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('No authentication token found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/driver/routes/assigned`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch assigned routes');
      }

      setRoutes(data.routes || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching driver routes:', err);
      setError(err.message);
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  const checkActiveTrip = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setCheckingTrip(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/driver/trips/active`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check active trip');
      }

      if (data.hasActiveTrip) {
        setActiveTrip(data.trip);
      } else {
        setActiveTrip(null);
      }
    } catch (err) {
      console.error('Error checking active trip:', err);
      // Don't set error state here to avoid blocking the UI
    } finally {
      setCheckingTrip(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchRoutes(), checkActiveTrip()]);
  }, []);

  return {
    routes,
    loading,
    error,
    activeTrip,
    checkingTrip,
    refetch: fetchRoutes
  };
};