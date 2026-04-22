import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function useBuses() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBuses = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/buses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch buses');
      
      const data = await response.json();
      setBuses(data.buses || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBuses();
  }, [fetchBuses]);

  return { buses, loading, error, refetch: fetchBuses };
}

export function useDrivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/drivers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch drivers');
      
      const data = await response.json();
      setDrivers(data.drivers || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  return { drivers, loading, error, refetch: fetchDrivers };
}

// Updated filter hook with more flexible field matching
export function useFilteredData(data, searchTerm, searchFields = ['bus_number', 'plate_number']) {
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    if (!searchTerm || !searchTerm.trim()) {
      setFilteredData(data);
      return;
    }

    const lowerSearch = searchTerm.toLowerCase().trim();
    const filtered = data.filter(item => {
      return searchFields.some(field => {
        const value = item[field];
        if (!value) return false;
        
        // Handle arrays (like drivers array)
        if (Array.isArray(value)) {
          return value.some(v => 
            String(v.name || v).toLowerCase().includes(lowerSearch)
          );
        }
        
        return String(value).toLowerCase().includes(lowerSearch);
      });
    });
    
    setFilteredData(filtered);
  }, [data, searchTerm, searchFields]);

  return filteredData;
}