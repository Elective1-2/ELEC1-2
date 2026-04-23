import { useState } from 'react';
import DepartureSelectorModal from './DepartureSelectorModal';

const RouteCard = ({ route, onTripCreated, isActive }) => {
  const [showModal, setShowModal] = useState(false);

  const handleStartTrip = () => {
    setShowModal(true);
  };

  const handleTripCreated = (tripId) => {
    setShowModal(false);
    if (onTripCreated) {
      onTripCreated(tripId);
    }
  };

  // Don't render if this is the active route
  if (isActive) return null;

  return (
    <>
      <div className="dm-bus-row">
        <div className="dm-bus-number">
          {route.buses.map(b => b.bus_number).join(' / ')}
        </div>
        
        <div className="dm-bus-route">
          <div className="dm-route-item">
            <span className="dm-route-label">Route</span>
            <span className="dm-route-value">{route.route_name}</span>
          </div>
          <div className="dm-route-item">
            <span className="dm-route-label">From</span>
            <span className="dm-route-value">{route.start_location}</span>
          </div>
          <div className="dm-route-item">
            <span className="dm-route-label">To</span>
            <span className="dm-route-value">{route.end_location}</span>
          </div>
        </div>
        
        <div className="dm-bus-meta">
          <div className="dm-departure">
            <div className="dm-departure-label">Duration</div>
            <div className="dm-departure-time">{route.base_duration_minutes} min</div>
          </div>
          
          <div className="dm-status-block">
            <div className="dm-status-label">Status</div>
            <div className="dm-status-pill" style={{background: '#e0e7ff', color: '#4f46e5'}}>
              Ready
            </div>
          </div>
          
          <button className="dm-start-btn" onClick={handleStartTrip}>
            START TRIP
          </button>
        </div>
      </div>

      <DepartureSelectorModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        routeId={route.route_id}
        routeName={route.route_name}
        buses={route.buses}
        onTripCreated={handleTripCreated}
      />
    </>
  );
};

export default RouteCard;