import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useTripData } from "../hooks/useTripData";
import LiveMap from "../components/LiveMap";
import BusNumberModal from "../components/BusNumberModal";
import "../css/passenger.css";


function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="dmp-clock">
      <div className="dmp-clock-time">{timeStr}</div>
      <div className="dmp-clock-date">{dateStr}</div>
    </div>
  );
}

function Passenger() {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [trackingBus, setTrackingBus] = useState(null);
  const [modalError, setModalError] = useState(null);
  
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
      return true;
    } catch (err) {
      setModalError(err.message);
      return false;
    }
  };

  const handleModalClose = () => {
    if (!trackingBus) {
      setIsModalOpen(false);
    }
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

  const formatDate = (datetimeString) => {
    if (!datetimeString) return '—';
    const date = new Date(datetimeString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
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

      <div className="dmp-left">
        <div className="dmp-clock-wrap">
          <LiveClock />
        </div>
        <Link to={"/"}>
          <div className="dmp-logo">
            <div className="dmp-logo-seg seg-m">M</div>
            <div className="dmp-logo-seg seg-2">2</div>
            <div className="dmp-logo-seg seg-b">B</div>
          </div>
        </Link>
        <div className="dmp-section-title">ACTIVE TRIP DETAILS</div>

        {tripData && !loading ? (
          <>
            <div className="dmp-info-block dark full-width">
              <div className="dmp-info-top">BUS NO.</div>
              <div className="dmp-info-number">{tripData.bus?.busNumber || '—'}</div>
              <div className="dmp-info-sub">Capacity: {tripData.bus?.capacity || '—'} passengers</div>
            </div>

            <div className="dmp-tag-row">
              <div className="dmp-tag-block origin">
                <div className="dmp-tag-label">ORIGIN</div>
                <div className="dmp-tag-value">
                  {tripData.trip?.startLocation?.split(',')[0] || '—'}
                </div>
              </div>
              <div className="dmp-tag-block destination">
                <div className="dmp-tag-label">DESTINATION</div>
                <div className="dmp-tag-value">
                  {tripData.trip?.endLocation?.split(',')[0] || '—'}
                </div>
              </div>
            </div>

            <div className="dmp-tag-row">
              <div className={`dmp-tag-block ${statusInfo.class}`}>
                <div className="dmp-tag-label">STATUS</div>
                <div className="dmp-tag-value">{statusInfo.text}</div>
              </div>
              <div className="dmp-tag-block congestion">
                <div className="dmp-tag-label">CONGESTION LEVEL</div>
                <div className="dmp-tag-value">{congestionLevel}</div>
              </div>
            </div>

            <div className="dmp-times-container">
              <div className="dmp-times-row">
                <div className="dmp-time-block">
                  <div className="dmp-detail-label">DEPARTURE TIME</div>
                  <div className="dmp-time-value">
                    {formatTime(tripData.trip?.scheduledDeparture)}
                  </div>
                  <div className="dmp-time-underline green" />
                </div>
                <div className="dmp-time-block">
                  <div className="dmp-detail-label">EXPECTED ARRIVAL TIME</div>
                  <div className="dmp-time-value">
                    {tripData.eta?.text || '—'}
                  </div>
                  <div className="dmp-time-underline gray" />
                </div>
              </div>
            </div>

            <div className="dmp-detail-card">
              <div className="dmp-detail-label">DRIVER</div>
              <div className="dmp-driver-name">
                {tripData.driver?.name || '—'}
              </div>
            </div>
          </>
        ) : (
          <div className="dmp-info-block dark full-width">
            <div className="dmp-info-top">NO BUS TRACKED</div>
            <div className="dmp-info-number">—</div>
            <div className="dmp-info-sub">Enter a bus number to track</div>
          </div>
        )}
      </div>

      <div className="dmp-right">
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

      </div>

      <div className="dmp-bottom">
        <div className="dmp-section-title">ACTIVE TRIP DETAILS</div>

        {tripData && !loading ? (
          <>
            <div className="dmp-tablet-grid">
              <div className="dmp-tablet-left-col">
                <div className="dmp-info-block dark full-width">
                  <div className="dmp-info-top">BUS NO.</div>
                  <div className="dmp-info-number">{tripData.bus?.busNumber || '—'}</div>
                  <div className="dmp-info-sub">Capacity: {tripData.bus?.capacity || '—'}</div>
                </div>
              </div>
              <div className="dmp-tablet-right-col">
                <div className="dmp-times-container">
                  <div className="dmp-times-row">
                    <div className="dmp-time-block">
                      <div className="dmp-detail-label">DEPARTURE TIME</div>
                      <div className="dmp-time-value">
                        {formatTime(tripData.trip?.scheduledDeparture)}
                      </div>
                      <div className="dmp-time-underline green" />
                    </div>
                    <div className="dmp-time-block">
                      <div className="dmp-detail-label">EXPECTED ARRIVAL TIME</div>
                      <div className="dmp-time-value">
                        {tripData.eta?.text || '—'}
                      </div>
                      <div className="dmp-time-underline gray" />
                    </div>
                  </div>
                </div>
                <div className="dmp-detail-card">
                  <div className="dmp-detail-label">DRIVER</div>
                  <div className="dmp-driver-name">
                    {tripData.driver?.name || '—'}
                  </div>
                </div>
              </div>
            </div>

            <div className="dmp-tag-row">
              <div className="dmp-tag-block origin">
                <div className="dmp-tag-label">ORIGIN</div>
                <div className="dmp-tag-value">
                  {tripData.trip?.startLocation?.split(',')[0] || '—'}
                </div>
              </div>
              <div className="dmp-tag-block destination">
                <div className="dmp-tag-label">DESTINATION</div>
                <div className="dmp-tag-value">
                  {tripData.trip?.endLocation?.split(',')[0] || '—'}
                </div>
              </div>
              <div className={`dmp-tag-block ${statusInfo.class}`}>
                <div className="dmp-tag-label">STATUS</div>
                <div className="dmp-tag-value">{statusInfo.text}</div>
              </div>
              <div className="dmp-tag-block congestion">
                <div className="dmp-tag-label">CONGESTION LEVEL</div>
                <div className="dmp-tag-value">{congestionLevel}</div>
              </div>
            </div>

            <div className="dmp-mobile-stack">
              <div className="dmp-info-block dark full-width">
                <div className="dmp-info-top">BUS NO.</div>
                <div className="dmp-info-number">{tripData.bus?.busNumber || '—'}</div>
                <div className="dmp-info-sub">Capacity: {tripData.bus?.capacity || '—'}</div>
              </div>
              <div className="dmp-tag-row">
                <div className="dmp-tag-block origin">
                  <div className="dmp-tag-label">ORIGIN</div>
                  <div className="dmp-tag-value">
                    {tripData.trip?.startLocation?.split(',')[0] || '—'}
                  </div>
                </div>
                <div className="dmp-tag-block destination">
                  <div className="dmp-tag-label">DESTINATION</div>
                  <div className="dmp-tag-value">
                    {tripData.trip?.endLocation?.split(',')[0] || '—'}
                  </div>
                </div>
              </div>
              <div className="dmp-tag-row">
                <div className={`dmp-tag-block ${statusInfo.class}`}>
                  <div className="dmp-tag-label">STATUS</div>
                  <div className="dmp-tag-value">{statusInfo.text}</div>
                </div>
                <div className="dmp-tag-block congestion">
                  <div className="dmp-tag-label">CONGESTION LEVEL</div>
                  <div className="dmp-tag-value">{congestionLevel}</div>
                </div>
              </div>
              <div className="dmp-times-container">
                <div className="dmp-times-row">
                  <div className="dmp-time-block">
                    <div className="dmp-detail-label">DEPARTURE TIME</div>
                    <div className="dmp-time-value">
                      {formatTime(tripData.trip?.scheduledDeparture)}
                    </div>
                    <div className="dmp-time-underline green" />
                  </div>
                  <div className="dmp-time-block">
                    <div className="dmp-detail-label">EXPECTED ARRIVAL TIME</div>
                    <div className="dmp-time-value">
                      {tripData.eta?.text || '—'}
                    </div>
                    <div className="dmp-time-underline gray" />
                  </div>
                </div>
              </div>
              <div className="dmp-detail-card">
                <div className="dmp-detail-label">DRIVER</div>
                <div className="dmp-driver-name">
                  {tripData.driver?.name || '—'}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="dmp-info-block dark full-width">
            <div className="dmp-info-top">NO BUS TRACKED</div>
            <div className="dmp-info-number">—</div>
            <div className="dmp-info-sub">Enter a bus number to track</div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Passenger;