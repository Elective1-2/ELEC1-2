import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE } from '../config/api';

export function useTripData(busNumber, isTracking = true) {
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const fetchTripData = useCallback(async () => {
    if (!busNumber || !isTracking) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/buses/${busNumber}/active-trip`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch trip data');
      }

      setTripData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setTripData(null);
    } finally {
      setLoading(false);
    }
  }, [busNumber, isTracking]);

  // Start polling every 10 seconds
  useEffect(() => {
    if (!busNumber || !isTracking) return;

    // Initial fetch
    fetchTripData();

    // Set up polling
    intervalRef.current = setInterval(fetchTripData, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [busNumber, isTracking, fetchTripData]);

  const stopTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  return { tripData, loading, error, stopTracking, refetch: fetchTripData };
}