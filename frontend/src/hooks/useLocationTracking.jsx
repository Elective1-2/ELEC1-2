import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function useLocationTracking(tripId, isActive = true) {
  const { token } = useAuth();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState(null);
  const watchIdRef = useRef(null);
  const lastReportedRef = useRef(null);
  const intervalRef = useRef(null);

  const reportLocation = useCallback(async (latitude, longitude, speed, heading, accuracy) => {
    if (!tripId || !token || !isActive) return;

    try {
      const response = await fetch(`${API_URL}/trips/${tripId}/location`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          latitude,
          longitude,
          speed: speed || null,
          heading: heading || null,
          accuracy_m: accuracy || null
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to report location');
      }

      lastReportedRef.current = { latitude, longitude, timestamp: Date.now() };
      console.log('Location reported:', { latitude, longitude });
    } catch (err) {
      console.error('Error reporting location:', err);
      setError(err.message);
    }
  }, [tripId, token, isActive]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const handlePosition = useCallback((position) => {
    const { latitude, longitude, speed, heading, accuracy } = position.coords;
    
    setCurrentLocation({
      latitude,
      longitude,
      speed: speed || 0,
      heading: heading || 0,
      accuracy,
      timestamp: position.timestamp
    });

    // Check if we should report this location
    if (!lastReportedRef.current) {
      // First location - always report
      reportLocation(latitude, longitude, speed, heading, accuracy);
    } else {
      const distance = calculateDistance(
        lastReportedRef.current.latitude,
        lastReportedRef.current.longitude,
        latitude,
        longitude
      );

      // Report if moved more than 30 meters
      if (distance >= 30) {
        reportLocation(latitude, longitude, speed, heading, accuracy);
      }
    }
  }, [reportLocation]);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsTracking(true);
    setError(null);

    // Watch position for continuous updates
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePosition,
      (err) => {
        console.error('Geolocation error:', err);
        setError(err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000, // Accept positions up to 5 seconds old
        timeout: 10000
      }
    );

    // Also report every 10 seconds regardless of movement
    intervalRef.current = setInterval(() => {
      if (currentLocation && isActive) {
        reportLocation(
          currentLocation.latitude,
          currentLocation.longitude,
          currentLocation.speed,
          currentLocation.heading,
          currentLocation.accuracy
        );
      }
    }, 10000);
  }, [handlePosition, reportLocation, currentLocation, isActive]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsTracking(false);
  }, []);

  useEffect(() => {
    if (tripId && isActive) {
      startTracking();
    }

    return () => {
      stopTracking();
    };
  }, [tripId, isActive, startTracking, stopTracking]);

  return {
    currentLocation,
    isTracking,
    error,
    startTracking,
    stopTracking
  };
}