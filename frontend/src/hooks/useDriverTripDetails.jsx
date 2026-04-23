import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function useDriverTripDetails(tripId) {
  const { token } = useAuth();
  const [tripDetails, setTripDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const fetchTripDetails = useCallback(async () => {
    if (!tripId || !token) return;

    try {
      const response = await fetch(`${API_URL}/driver/trips/${tripId}/details`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch trip details');
      }

      setTripDetails(data.trip);
      setError(null);
    } catch (err) {
      console.error('Error fetching trip details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tripId, token]);

  // Initial fetch and polling every 30 seconds
  useEffect(() => {
    if (!tripId) return;

    fetchTripDetails();
    intervalRef.current = setInterval(fetchTripDetails, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [tripId, fetchTripDetails]);

  return {
    tripDetails,
    loading,
    error,
    refetch: fetchTripDetails
  };
}