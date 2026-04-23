import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDriverRoutes } from '../hooks/useDriverRoutes';
import DriverNavbar from '../components/driver/DriverNavbar';
import RouteCard from '../components/driver/RouteCard';
import '../css/drivermain.css';

const DriverMain = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { routes, loading, error, activeTrip, checkingTrip, refetch } = useDriverRoutes();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Redirect to map if there's an active trip
  useEffect(() => {
    if (!checkingTrip && activeTrip) {
      // If trip is en_route or delayed, go directly to map
      // If trip is scheduled, we might want to show it differently
      if (activeTrip.status === 'en_route' || activeTrip.status === 'delayed') {
        navigate(`/driver/map/${activeTrip.trip_id}`);
      }
    }
  }, [checkingTrip, activeTrip, navigate]);

  const handleTripCreated = (tripId) => {
    console.log('Trip created:', tripId);
    // Navigation happens in the modal component
  };

  const handleContinueTrip = () => {
    if (activeTrip) {
      navigate(`/driver/map/${activeTrip.trip_id}`);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTripTime = (datetime) => {
    const date = new Date(datetime);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const getGreeting = () => {
    const hour = currentDateTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Show loading state while checking for active trip
  if (checkingTrip || loading) {
    return (
      <div className="dm-root">
        <DriverNavbar />
        <div className="dm-body">
          <div className="loading-container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh'
          }}>
            <div className="loading-spinner" style={{
              width: '48px',
              height: '48px',
              border: '4px solid #e5e7eb',
              borderTopColor: '#1e2d3d',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ marginTop: '20px', color: '#6b7280' }}>
              {checkingTrip ? 'Checking for active trips...' : 'Loading your routes...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dm-root">
      <DriverNavbar />
      
      <div className="dm-body">
        <div className="dm-welcome-card">
          <div>
            <div className="dm-welcome-name">
              {getGreeting()}, {user?.full_name?.split(' ')[0] || 'Driver'}
            </div>
            <div className="dm-welcome-hub">
              <span className="dm-hub-dot"></span>
              <span className="dm-hub-text">
                Ready for your <span>next trip</span>
              </span>
            </div>
          </div>
          
          <div className="dm-clock-widget">
            <div className="dm-clock-time">{formatTime(currentDateTime)}</div>
            <div className="dm-clock-date">{formatDate(currentDateTime)}</div>
          </div>
        </div>

        {/* Active Trip Card - Show if there's a scheduled trip that hasn't started */}
        {activeTrip && activeTrip.status === 'scheduled' && (
          <div className="dm-section">
            <div className="dm-section-label">CURRENT TRIP</div>
            <div className="dm-bus-row" style={{ borderLeft: '4px solid #4aafd5' }}>
              <div className="dm-bus-number">
                {activeTrip.bus.bus_number}
              </div>
              
              <div className="dm-bus-route">
                <div className="dm-route-item">
                  <span className="dm-route-label">Route</span>
                  <span className="dm-route-value">{activeTrip.route.route_name}</span>
                </div>
                <div className="dm-route-item">
                  <span className="dm-route-label">From</span>
                  <span className="dm-route-value">{activeTrip.route.start_location}</span>
                </div>
                <div className="dm-route-item">
                  <span className="dm-route-label">To</span>
                  <span className="dm-route-value">{activeTrip.route.end_location}</span>
                </div>
              </div>
              
              <div className="dm-bus-meta">
                <div className="dm-departure">
                  <div className="dm-departure-label">Departure</div>
                  <div className="dm-departure-time">{formatTripTime(activeTrip.scheduled_departure)}</div>
                </div>
                
                <div className="dm-status-block">
                  <div className="dm-status-label">Status</div>
                  <div className="dm-status-pill" style={{background: '#fef3c7', color: '#d97706'}}>
                    Scheduled
                  </div>
                </div>
                
                <button className="dm-start-btn" onClick={handleContinueTrip}>
                  CONTINUE TRIP
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="dm-section">
          <div className="dm-section-label">
            {activeTrip ? 'OTHER ASSIGNED ROUTES' : 'ASSIGNED ROUTES'}
          </div>
          
          {error ? (
            <div className="error-container" style={{padding: '40px', textAlign: 'center', color: '#ef4444'}}>
              <p>{error}</p>
              <button onClick={refetch} className="dm-start-btn" style={{marginTop: '16px'}}>
                Try Again
              </button>
            </div>
          ) : routes.length === 0 ? (
            <div className="empty-container" style={{padding: '40px', textAlign: 'center', color: '#6b7280'}}>
              <p>No routes assigned yet.</p>
              <p style={{fontSize: '13px', marginTop: '8px'}}>
                Contact your administrator to get assigned to a route.
              </p>
            </div>
          ) : (
            <div className="dm-bus-list">
              {routes
                .filter(route => {
                  // If there's an active trip, filter out that route from the list
                  if (activeTrip) {
                    return route.route_id !== activeTrip.route.route_id;
                  }
                  return true;
                })
                .map(route => (
                  <RouteCard 
                    key={route.route_id} 
                    route={route}
                    onTripCreated={handleTripCreated}
                  />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverMain;