import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDriverTripDetails } from '../hooks/useDriverTripDetails';
import { useLocationTracking } from '../hooks/useLocationTracking';
import { useTripActions } from '../hooks/useTripActions';
import LiveMap from '../components/LiveMap';
import PassengerCounterModal from '../components/drivermap/PassengerCounterModal';
import CongestionReporterModal from '../components/drivermap/CongestionReporterModal';
import '../css/drivermap.css';

function LiveClock() {
  const [now, setNow] = useState(new Date());
  
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  
  const dateStr = now.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="dmp-clock-container">
      <div className="dmp-clock-time">{timeStr}</div>
      <div className="dmp-clock-date">{dateStr}</div>
    </div>
  );
}

function DriverMap() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tripDetails, loading, error } = useDriverTripDetails(tripId);
  const { currentLocation } = useLocationTracking(tripId, tripDetails?.status === 'en_route');
  const { updatePassengerCount, reportCongestion, completeTrip, loading: actionLoading } = useTripActions(tripId);
  
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [showCongestionModal, setShowCongestionModal] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);

  useEffect(() => {
    if (error) {
      alert('Error loading trip: ' + error);
      navigate('/driver');
    }
  }, [error, navigate]);

  const handlePassengerClick = () => {
    setShowPassengerModal(true);
  };

  const handleCongestionClick = () => {
    setShowCongestionModal(true);
  };

  const handleEndTrip = async () => {
    const result = await completeTrip();
    if (result.success) {
      alert('Trip completed successfully!');
    } else {
      alert('Failed to complete trip: ' + result.error);
    }
  };

  const formatTime = (datetime) => {
    if (!datetime) return '--:--';
    const date = new Date(datetime);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const calculateETA = () => {
    if (!tripDetails) return '--:--';
    
    const departureTime = tripDetails.actual_departure || tripDetails.scheduled_departure;
    if (!departureTime) return '--:--';
    
    const departure = new Date(departureTime);
    const durationMinutes = tripDetails.route.base_duration_minutes;
    const eta = new Date(departure.getTime() + durationMinutes * 60000);
    
    return formatTime(eta);
  };

  const getCongestionColor = (level) => {
    const colors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444',
      full: '#991b1b'
    };
    return colors[level] || '#10b981';
  };

  const getCongestionLabel = (level) => {
    const labels = {
      low: 'Low',
      medium: 'Moderate',
      high: 'High',
      full: 'Severe'
    };
    return labels[level] || 'Unknown';
  };

  const getStatusLabel = (status) => {
    const labels = {
      scheduled: 'Scheduled',
      en_route: 'On Time',
      delayed: 'Delayed',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: '#3b82f6',
      en_route: '#10b981',
      delayed: '#ef4444',
      completed: '#6b7280',
      cancelled: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="dmp-root">
        <div className="dmp-left" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <p>Loading trip details...</p>
        </div>
        <div className="dmp-right" />
      </div>
    );
  }

  if (!tripDetails) {
    return (
      <div className="dmp-root">
        <div className="dmp-left" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <p>Trip not found</p>
        </div>
        <div className="dmp-right" />
      </div>
    );
  }

  const busLocation = currentLocation || tripDetails.live_location;
  const mapLocation = busLocation ? {
    lat: busLocation.latitude,
    lng: busLocation.longitude
  } : null;

  return (
    <div className="dmp-root">
      <div className="dmp-left">
        <LiveClock />

        <div className="dmp-logo">
          <div className="dmp-logo-seg seg-m">M</div>
          <div className="dmp-logo-seg seg-2">2</div>
          <div className="dmp-logo-seg seg-b">B</div>
        </div>

        <div className="dmp-section-title">TRIP DETAILS</div>

        <div className="dmp-detail-card">
          <div className="dmp-detail-label">DRIVER</div>
          <div className="dmp-driver-name">{tripDetails.driver.name}</div>
        </div>

        <div className="dmp-times-row">
          <div className="dmp-time-block">
            <div className="dmp-detail-label">DEPARTURE TIME</div>
            <div className="dmp-time-value">
              {formatTime(tripDetails.actual_departure || tripDetails.scheduled_departure)}
            </div>
          </div>
          <div className="dmp-time-block">
            <div className="dmp-detail-label">EXPECTED ARRIVAL TIME</div>
            <div className="dmp-time-value">{calculateETA()}</div>
          </div>
        </div>

        <div className="dmp-tag-row">
          <div className="dmp-tag-block origin">
            <div className="dmp-tag-label">ORIGIN</div>
            <div className="dmp-tag-value">{tripDetails.route.start_location}</div>
          </div>
          <div className="dmp-tag-block destination">
            <div className="dmp-tag-label">DESTINATION</div>
            <div className="dmp-tag-value">{tripDetails.route.end_location}</div>
          </div>
        </div>

        <div className="dmp-tag-row">
          <div className="dmp-tag-block status-on">
            <div className="dmp-tag-label">STATUS</div>
            <div className="dmp-tag-value">{getStatusLabel(tripDetails.status)}</div>
          </div>
          <div 
            className="dmp-tag-block congestion" 
            onClick={handleCongestionClick}
            style={{ cursor: 'pointer' }}
          >
            <div className="dmp-tag-label">CONGESTION LEVEL</div>
            <div 
              className="dmp-tag-value"
              style={{ color: getCongestionColor(tripDetails.congestion_level) }}
            >
              {getCongestionLabel(tripDetails.congestion_level)}
            </div>
          </div>
        </div>

        <div className="dmp-info-row">
          <div className="dmp-info-block dark">
            <div className="dmp-info-top">BUS NO.</div>
            <div className="dmp-info-number">{tripDetails.bus.bus_number}</div>
            <div className="dmp-info-sub">Plate No. {tripDetails.bus.plate_number}</div>
          </div>
          <div 
            className="dmp-info-block dark" 
            onClick={handlePassengerClick}
            style={{ cursor: 'pointer' }}
          >
            <div className="dmp-info-top">NUMBER OF PASSENGERS</div>
            <div className="dmp-info-number">
              {tripDetails.passenger_count?.count || 0}
            </div>
            <div className="dmp-info-sub">
              {tripDetails.passenger_count?.is_overflow ? 'OVERFLOW' : `${tripDetails.bus.capacity - (tripDetails.passenger_count?.count || 0)} seats left`}
            </div>
          </div>
        </div>

        <button className="dmp-end-btn" onClick={() => setShowCompleteConfirm(true)}>
          END TRIP
        </button>

      </div>

      <div className="dmp-right">
        <div className="dmp-map-logo">
          <div className="dmp-logo-seg seg-m">M</div>
          <div className="dmp-logo-seg seg-2">2</div>
          <div className="dmp-logo-seg seg-b">B</div>
        </div>
        <div className="dmp-map-clock">
          <div className="dmp-clock-time">
            {new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
          </div>
          <div className="dmp-clock-date">
            {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </div>
        </div>

        <LiveMap 
          busLocation={mapLocation}
          origin={tripDetails.route.start_location}
          destination={tripDetails.route.end_location}
        />
      </div>

      <div className="dmp-bottom">
        <div className="dmp-section-title">TRIP DETAILS</div>

        <div className="dmp-tablet-grid">
          <div className="dmp-tablet-left-col">
            <div className="dmp-info-block dark">
              <div className="dmp-info-top">BUS NO.</div>
              <div className="dmp-info-number">{tripDetails.bus.bus_number}</div>
              <div className="dmp-info-sub">Plate No. {tripDetails.bus.plate_number}</div>
            </div>
            <div 
              className="dmp-info-block dark" 
              onClick={handlePassengerClick}
              style={{ cursor: 'pointer' }}
            >
              <div className="dmp-info-top">NUMBER OF PASSENGERS</div>
              <div className="dmp-info-number">
                {tripDetails.passenger_count?.count || 0}
              </div>
              <div className="dmp-info-sub">
                {tripDetails.passenger_count?.is_overflow ? 'OVERFLOW' : 'current load'}
              </div>
            </div>
          </div>

          <div className="dmp-tablet-right-col">
            <div className="dmp-detail-card">
              <div className="dmp-detail-label">DRIVER</div>
              <div className="dmp-driver-name">{tripDetails.driver.name}</div>
            </div>
            <div className="dmp-times-row">
              <div className="dmp-time-block">
                <div className="dmp-detail-label">DEPARTURE TIME</div>
                <div className="dmp-time-value">
                  {formatTime(tripDetails.actual_departure || tripDetails.scheduled_departure)}
                </div>
              </div>
              <div className="dmp-time-block">
                <div className="dmp-detail-label">EXPECTED ARRIVAL TIME</div>
                <div className="dmp-time-value">{calculateETA()}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="dmp-tag-row">
          <div className="dmp-tag-block origin">
            <div className="dmp-tag-label">ORIGIN</div>
            <div className="dmp-tag-value">{tripDetails.route.start_location}</div>
          </div>
          <div className="dmp-tag-block destination">
            <div className="dmp-tag-label">DESTINATION</div>
            <div className="dmp-tag-value">{tripDetails.route.end_location}</div>
          </div>
          <div className="dmp-tag-block status-on">
            <div className="dmp-tag-label">STATUS</div>
            <div className="dmp-tag-value">{getStatusLabel(tripDetails.status)}</div>
          </div>
          <div 
            className="dmp-tag-block congestion" 
            onClick={handleCongestionClick}
            style={{ cursor: 'pointer' }}
          >
            <div className="dmp-tag-label">CONGESTION LEVEL</div>
            <div 
              className="dmp-tag-value"
              style={{ color: getCongestionColor(tripDetails.congestion_level) }}
            >
              {getCongestionLabel(tripDetails.congestion_level)}
            </div>
          </div>
        </div>

        <button className="dmp-end-btn dmp-tablet-end-btn" onClick={() => setShowCompleteConfirm(true)}>
          END TRIP
        </button>

        <div className="dmp-mobile-stack">
          <div className="dmp-detail-card">
            <div className="dmp-detail-label">DRIVER</div>
            <div className="dmp-driver-name">{tripDetails.driver.name}</div>
          </div>
          <div className="dmp-times-row">
            <div className="dmp-time-block">
              <div className="dmp-detail-label">DEPARTURE TIME</div>
              <div className="dmp-time-value">
                {formatTime(tripDetails.actual_departure || tripDetails.scheduled_departure)}
              </div>
            </div>
            <div className="dmp-time-block">
              <div className="dmp-detail-label">EXPECTED ARRIVAL TIME</div>
              <div className="dmp-time-value">{calculateETA()}</div>
            </div>
          </div>
          <div className="dmp-tag-row">
            <div className="dmp-tag-block origin">
              <div className="dmp-tag-label">ORIGIN</div>
              <div className="dmp-tag-value">{tripDetails.route.start_location}</div>
            </div>
            <div className="dmp-tag-block destination">
              <div className="dmp-tag-label">DESTINATION</div>
              <div className="dmp-tag-value">{tripDetails.route.end_location}</div>
            </div>
          </div>
          <div className="dmp-tag-row">
            <div className="dmp-tag-block status-on">
              <div className="dmp-tag-label">STATUS</div>
              <div className="dmp-tag-value">{getStatusLabel(tripDetails.status)}</div>
            </div>
            <div 
              className="dmp-tag-block congestion" 
              onClick={handleCongestionClick}
              style={{ cursor: 'pointer' }}
            >
              <div className="dmp-tag-label">CONGESTION LEVEL</div>
              <div 
                className="dmp-tag-value"
                style={{ color: getCongestionColor(tripDetails.congestion_level) }}
              >
                {getCongestionLabel(tripDetails.congestion_level)}
              </div>
            </div>
          </div>
          
          <div className="dmp-info-row">
            <div className="dmp-info-block dark">
              <div className="dmp-info-top">BUS NO.</div>
              <div className="dmp-info-number">{tripDetails.bus.bus_number}</div>
              <div className="dmp-info-sub">Plate No. {tripDetails.bus.plate_number}</div>
            </div>
            <div 
              className="dmp-info-block dark" 
              onClick={handlePassengerClick}
              style={{ cursor: 'pointer' }}
            >
              <div className="dmp-info-top">NUMBER OF PASSENGERS</div>
              <div className="dmp-info-number">
                {tripDetails.passenger_count?.count || 0}
              </div>
              <div className="dmp-info-sub">
                {tripDetails.passenger_count?.is_overflow ? 'OVERFLOW' : 'current load'}
              </div>
            </div>
          </div>
          
          <button className="dmp-end-btn" onClick={() => setShowCompleteConfirm(true)}>
            END TRIP
          </button>
        </div>
      </div>

      <PassengerCounterModal
        isOpen={showPassengerModal}
        onClose={() => setShowPassengerModal(false)}
        onSubmit={updatePassengerCount}
        currentCount={tripDetails.passenger_count?.count || 0}
        busCapacity={tripDetails.bus.capacity}
      />

      <CongestionReporterModal
        isOpen={showCongestionModal}
        onClose={() => setShowCongestionModal(false)}
        onSubmit={(level) => reportCongestion(tripDetails.route.route_id, level)}
        currentLevel={tripDetails.congestion_level}
      />

      {showCompleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowCompleteConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>End Trip</h2>
              <button className="modal-close" onClick={() => setShowCompleteConfirm(false)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '20px' }}>
                Are you sure you want to end this trip? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-cancel" 
                onClick={() => setShowCompleteConfirm(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button 
                className="btn-confirm" 
                onClick={handleEndTrip}
                disabled={actionLoading}
                style={{ background: '#ef4444' }}
              >
                {actionLoading ? 'Ending...' : 'End Trip'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DriverMap;