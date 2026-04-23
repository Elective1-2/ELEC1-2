import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../components/menu/AdminNavbar";
import MobileHeader from "../components/menu/MobileHeader";
import Sidebar from "../components/menu/Sidebar";
import Footer from "../components/menu/Footer";
import "../css/tracking.css";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function Tracking() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState("Live Tracking");

  const [searchTerm, setSearchTerm] = useState("");
  
  // Active trips state
  const [activeTrips, setActiveTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  // Fetch active trips from backend
  const fetchActiveTrips = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/trips/active`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch active trips');
      }
      
      const data = await response.json();
      setActiveTrips(data.trips || []);
      setFilteredTrips(data.trips || []);
      setError(null);
    } catch (err) {
      console.error('Fetch active trips error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and auto-refresh every 30 seconds
  useEffect(() => {
    fetchActiveTrips();
    
    const interval = setInterval(fetchActiveTrips, 30000);
    return () => clearInterval(interval);
  }, [fetchActiveTrips]);

  // Filter trips based on search term
  useEffect(() => {
    if (!searchTerm || !searchTerm.trim()) {
      setFilteredTrips(activeTrips);
      return;
    }

    const lowerSearch = searchTerm.toLowerCase().trim();
    const filtered = activeTrips.filter(trip => {
      return (
        String(trip.bus_number).toLowerCase().includes(lowerSearch) ||
        (trip.plate_number && String(trip.plate_number).toLowerCase().includes(lowerSearch)) ||
        String(trip.driver_name || '').toLowerCase().includes(lowerSearch) ||
        String(trip.route_name || '').toLowerCase().includes(lowerSearch)
      );
    });
    
    setFilteredTrips(filtered);
  }, [activeTrips, searchTerm]);

  // Handle search from AdminNavbar
  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  // Format time helper
  const formatTime = (datetimeString) => {
    if (!datetimeString) return '—';
    const date = new Date(datetimeString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Open passenger view in new tab
  const handleViewTrip = (trip) => {
    // Store the bus number in sessionStorage for the passenger page
    sessionStorage.setItem('trackingBusNumber', trip.bus_number);
    
    // Open passenger page in new tab
    const passengerUrl = '/passenger';
    window.open(passengerUrl, '_blank');
  };

  // Get status display info
  const getStatusInfo = (trip) => {
    // Check if delayed (you can add delay logic here based on schedule vs actual)
    const isDelayed = trip.status === 'delayed';
    return {
      text: isDelayed ? 'Delayed' : 'On Track',
      class: isDelayed ? 'delayed' : 'ontrack'
    };
  };

  return (
    <div className="track-root">
      {/* Mobile header (< 768 px) */}
      <MobileHeader setMenuOpen={setMenuOpen} />

      <div className="track-body">
        {/* Sidebar */}
        <Sidebar
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          activePage={activePage}
          setActivePage={setActivePage}
        />

        {/* Main scrollable column */}
        <div className="track-main">
          {/* Top navbar */}
          <AdminNavbar/>

          {/* Page content */}
          <div className="track-content">

            {/* ── Active Buses ── */}
            <div className="track-card">
              <div className="track-card-header">
                <span className="track-card-title">Active Trips</span>
                <span className="track-badge">{activeTrips.length}</span>
              </div>

              {loading ? (
                <div className="track-empty">Loading active trips...</div>
              ) : error ? (
                <div className="track-empty" style={{ color: '#ef4444' }}>Error: {error}</div>
              ) : filteredTrips.length === 0 ? (
                <div className="track-empty">
                  {searchTerm ? "No trips match your search." : "No active trips at the moment."}
                </div>
              ) : (
                filteredTrips.map((trip) => {
                  const statusInfo = getStatusInfo(trip);
                  return (
                    <div key={trip.trip_id} className="track-bus-item">
                      <div className="track-bus-info">
                        <div className="track-bus-number">
                          Bus #{trip.bus_number}
                          {trip.plate_number && <span className="track-bus-plate"> ({trip.plate_number})</span>}
                        </div>
                        <div className="track-bus-route">{trip.route_name || '—'}</div>
                        {trip.driver_name && (
                          <div className="track-bus-driver">Driver: {trip.driver_name}</div>
                        )}
                        <div className="track-bus-status-row">
                          <span className={`track-status-badge ${statusInfo.class}`}>
                            {statusInfo.text}
                          </span>
                          <span className="track-eta">
                            <strong>Departed:</strong> {formatTime(trip.actual_departure || trip.scheduled_departure)}
                          </span>
                        </div>
                        {trip.passenger_count !== null && (
                          <div className="track-bus-occupancy">
                            <span className="track-occupancy-label">Occupancy:</span>
                            <span className="track-occupancy-value">
                              {trip.passenger_count} / {trip.capacity}
                            </span>
                          </div>
                        )}
                      </div>
                      <button 
                        className="track-view-btn"
                        onClick={() => handleViewTrip(trip)}
                        title="Open in new tab"
                      >
                        VIEW ↗
                      </button>
                    </div>
                  );
                })
              )}
            </div>


          </div>{/* /track-content */}

          {/* Footer */}
          <Footer />
        </div>{/* /track-main */}
      </div>{/* /track-body */}
    </div>
  );
}

export default Tracking;