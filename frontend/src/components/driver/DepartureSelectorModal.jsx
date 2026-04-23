import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DepartureSelectorModal = ({ 
  isOpen, 
  onClose, 
  routeId, 
  routeName,
  buses, 
  onTripCreated 
}) => {
  const navigate = useNavigate();
  const [departures, setDepartures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBus, setSelectedBus] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [creating, setCreating] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [dayType, setDayType] = useState('');

  useEffect(() => {
    if (isOpen && routeId) {
      fetchDepartures();
    }
  }, [isOpen, routeId]);

  const fetchDepartures = async () => {
    const token = localStorage.getItem('token');
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/driver/routes/${routeId}/departures`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch departures');
      }

      setDepartures(data.departures || []);
      setCurrentTime(data.current_time || '');
      setDayType(data.day_type || '');
      
      if (data.departures && data.departures.length > 0) {
        setSelectedSchedule(data.departures[0].schedule_id);
      }
      
      // Auto-select first bus if available
      if (buses && buses.length > 0) {
        setSelectedBus(buses[0].bus_id);
      }
    } catch (err) {
      console.error('Error fetching departures:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAndStartTrip = async () => {
    if (!selectedBus || !selectedSchedule) {
      setError('Please select a bus and departure time');
      return;
    }

    const token = localStorage.getItem('token');
    
    try {
      setCreating(true);
      setError(null);
      
      // Step 1: Create the trip
      const createResponse = await fetch(`${API_URL}/driver/trips/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bus_id: selectedBus,
          schedule_id: selectedSchedule
        })
      });

      const createData = await createResponse.json();

      if (!createResponse.ok) {
        if (createResponse.status === 409) {
          throw new Error('A trip already exists for this bus at this time');
        }
        throw new Error(createData.error || 'Failed to create trip');
      }

      const tripId = createData.trip_id;
      
      // Step 2: Immediately start the trip
      const startResponse = await fetch(`${API_URL}/trips/${tripId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!startResponse.ok) {
        const startData = await startResponse.json();
        throw new Error(startData.error || 'Failed to start trip');
      }

      // Success! Notify parent and navigate
      if (onTripCreated) {
        onTripCreated(tripId);
      }
      
      // Navigate to driver map with the active trip
      navigate(`/driver/map/${tripId}`);
      
    } catch (err) {
      console.error('Error creating/starting trip:', err);
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Start Trip - {routeName}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {currentTime && (
            <div className="time-info-banner">
              <span>Current Time: {currentTime}</span>
              <span className="day-badge">{dayType}</span>
            </div>
          )}
          
          {buses.length > 1 && (
            <div className="form-group">
              <label>Select Bus:</label>
              <select
                value={selectedBus}
                onChange={(e) => setSelectedBus(e.target.value)}
                className="form-select"
                disabled={creating}
              >
                <option value="">Choose a bus</option>
                {buses.map(bus => (
                  <option key={bus.bus_id} value={bus.bus_id}>
                    Bus {bus.bus_number} - {bus.plate_number} (Capacity: {bus.capacity})
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {buses.length === 1 && (
            <div className="selected-bus-info" style={{
              padding: '12px 16px',
              background: '#f3f4f6',
              borderRadius: '10px',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              <span style={{fontWeight: '600', color: '#374151'}}>Bus: </span>
              <span style={{color: '#111827'}}>
                {buses[0].bus_number} - {buses[0].plate_number}
              </span>
            </div>
          )}
          
          {loading ? (
            <div className="loading-indicator">Loading available departures...</div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
              <button 
                onClick={fetchDepartures} 
                className="dm-start-btn" 
                style={{marginTop: '12px', padding: '8px 16px', fontSize: '12px'}}
              >
                Try Again
              </button>
            </div>
          ) : departures.length === 0 ? (
            <div className="empty-message">
              <p>No departures available for today.</p>
              <p style={{fontSize: '13px', marginTop: '8px', color: '#9ca3af'}}>
                Please check back later or contact dispatch.
              </p>
            </div>
          ) : (
            <div className="form-group">
              <label>Select Departure Time:</label>
              <select
                value={selectedSchedule}
                onChange={(e) => setSelectedSchedule(e.target.value)}
                className="form-select"
                disabled={creating}
              >
                {departures.map(dep => (
                  <option key={dep.schedule_id} value={dep.schedule_id}>
                    {dep.departure_time} {dep.direction === 'to_end' ? '→' : '←'} 
                    {dep.day_type === 'daily' ? ' (Daily)' : ''}
                  </option>
                ))}
              </select>
              <p style={{
                marginTop: '8px',
                fontSize: '12px',
                color: '#6b7280'
              }}>
                Showing {departures.length} nearest departure{departures.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button 
            className="btn-cancel" 
            onClick={onClose}
            disabled={creating}
          >
            Cancel
          </button>
          <button 
            className="btn-confirm"
            onClick={handleCreateAndStartTrip}
            disabled={loading || departures.length === 0 || !selectedBus || !selectedSchedule || creating}
          >
            {creating ? (
              <span style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <span className="button-spinner" style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite'
                }} />
                Starting Trip...
              </span>
            ) : (
              'Start Trip'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepartureSelectorModal;