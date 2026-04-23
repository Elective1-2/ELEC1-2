import React, { useState, useEffect, useRef } from "react";
import { Link } from 'react-router-dom';
import { useTripData } from "../hooks/useTripData";
import LiveMap from "../components/LiveMap";
import BusNumberModal from "../components/BusNumberModal";
import TripDetails from "../components/passenger/TripDetails";
import TripDetailsBottom from "../components/passenger/TripDetailsBottom";
import LiveClock from "../components/passenger/LiveClock";
import "../css/passenger.css";

function Passenger() {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [trackingBus, setTrackingBus] = useState(null);
  const [modalError, setModalError] = useState(null);
  const [isBottomPanelOpen, setIsBottomPanelOpen] = useState(true);
  
  const { tripData, loading, error, stopTracking } = useTripData(trackingBus, !!trackingBus);

  useEffect(() => {
    const trackingBusNumber = sessionStorage.getItem('trackingBusNumber');
    if (trackingBusNumber) {
      sessionStorage.removeItem('trackingBusNumber');
      handleTrackBus(trackingBusNumber);
      setIsModalOpen(false);
    }
  }, []);

  const handleTrackBus = async (busNumber) => {
    setModalError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/buses/${busNumber}/active-trip`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Bus not found or no active trip');
      }

      setTrackingBus(busNumber);
      setIsModalOpen(false);
      setIsBottomPanelOpen(true); // Open panel when new bus is tracked
      return true;
    } catch (err) {
      setModalError(err.message);
      return false;
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setModalError(null);
  };

  const handleTrackAnotherBus = () => {
    setIsModalOpen(true);
    setModalError(null);
  };

  const toggleBottomPanel = () => {
    setIsBottomPanelOpen(prev => !prev);
  };

  const formatTime = (datetimeString) => {
    if (!datetimeString) return '—';
    const date = new Date(datetimeString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getCongestionLevel = (passengerCount, capacity) => {
    if (!passengerCount || !capacity) return 'Unknown';
    const percentage = (passengerCount / capacity) * 100;
    if (percentage >= 90) return 'Full';
    if (percentage >= 70) return 'High';
    if (percentage >= 40) return 'Moderate';
    return 'Low';
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'en_route': return { text: 'En Route', class: 'status-on' };
      case 'scheduled': return { text: 'Scheduled', class: 'status-scheduled' };
      case 'delayed': return { text: 'Delayed', class: 'status-delayed' };
      case 'completed': return { text: 'Completed', class: 'status-completed' };
      default: return { text: status || 'Unknown', class: 'status-on' };
    }
  };

  const busLocation = tripData?.liveLocation ? {
    lat: parseFloat(tripData.liveLocation.latitude),
    lng: parseFloat(tripData.liveLocation.longitude),
  } : null;

  const statusInfo = getStatusInfo(tripData?.trip?.status);
  const congestionLevel = getCongestionLevel(
    tripData?.passengerCount?.count,
    tripData?.bus?.capacity
  );

  return (
    <div className="dmp-root">
      <BusNumberModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleTrackBus}
        error={modalError}
      />

      <TripDetails
        tripData={tripData}
        formatTime={formatTime}
        statusInfo={statusInfo}
        congestionLevel={congestionLevel}
        onTrackAnother={handleTrackAnotherBus}
      />

      <div className={`dmp-right ${trackingBus && !isBottomPanelOpen ? 'expanded' : ''}`}>
        <Link to={"/"}>
          <div className="dmp-map-logo">
            <div className="dmp-logo-seg seg-m">M</div>
            <div className="dmp-logo-seg seg-2">2</div>
            <div className="dmp-logo-seg seg-b">B</div>
          </div>
        </Link>
        <div className="dmp-map-clock">
          <LiveClock />
        </div>

        <LiveMap
          busLocation={busLocation}
          origin={tripData?.trip?.startLocation}
          destination={tripData?.trip?.endLocation}
        />

        {trackingBus && (
          <button 
            className="dmp-toggle-panel-btn"
            onClick={toggleBottomPanel}
            title={isBottomPanelOpen ? 'Hide details' : 'Show details'}
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{ transform: isBottomPanelOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        )}

        {trackingBus && (
          <button 
            className="dmp-map-track-btn"
            onClick={handleTrackAnotherBus}
            title="Track another bus"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>
        )}
      </div>

      <TripDetailsBottom
        tripData={tripData}
        formatTime={formatTime}
        statusInfo={statusInfo}
        congestionLevel={congestionLevel}
        onTrackAnother={handleTrackAnotherBus}
        isOpen={isBottomPanelOpen}
        onToggle={toggleBottomPanel}
      />
    </div>
  );
}

export default Passenger;