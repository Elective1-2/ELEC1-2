import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function useTripActions(tripId) {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updatePassengerCount = async (passengerCount, isOverflow = false) => {
    if (!tripId || !token) return { success: false, error: 'No trip or token' };

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/trips/${tripId}/passengers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          passenger_count: passengerCount,
          is_overflow: isOverflow ? 1 : 0
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update passenger count');
      }

      return { success: true, data };
    } catch (err) {
      console.error('Error updating passenger count:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const reportCongestion = async (routeId, congestionLevel) => {
    if (!routeId || !token) return { success: false, error: 'No route or token' };

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/admin/congestion/report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route_id: routeId,
          trip_id: tripId,
          congestion_level: congestionLevel
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to report congestion');
      }

      return { success: true, data };
    } catch (err) {
      console.error('Error reporting congestion:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const completeTrip = async () => {
    if (!tripId || !token) return { success: false, error: 'No trip or token' };

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/trips/${tripId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete trip');
      }

      // Redirect to driver main page after completion
      setTimeout(() => {
        navigate('/driver');
      }, 1500);

      return { success: true, data };
    } catch (err) {
      console.error('Error completing trip:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    updatePassengerCount,
    reportCongestion,
    completeTrip,
    loading,
    error
  };
}