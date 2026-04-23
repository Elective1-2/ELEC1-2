import React, { useState } from 'react';
import { useAllRoutes, useScheduleData } from '../hooks/useScheduleData';
import Navbar from '../components/menu/Navbar'; 
import heroImage from '../assets/herohome.png'; 
import '../css/Schedule.css'; 
import Footer from '../components/menu/Footer';

function SchedulePage() {
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [selectedRouteName, setSelectedRouteName] = useState('');
  const [selectedStartLocation, setSelectedStartLocation] = useState('');
  const [selectedEndLocation, setSelectedEndLocation] = useState('');

  const { routes, loading: routesLoading } = useAllRoutes();
  const { schedule, loading: scheduleLoading } = useScheduleData(selectedRouteId, 'weekday');

  const handleRouteChange = (e) => {
    const routeId = e.target.value;
    const selectedRoute = routes.find(r => r.route_id.toString() === routeId);
    
    setSelectedRouteId(routeId);
    if (selectedRoute) {
      setSelectedRouteName(selectedRoute.name);
      setSelectedStartLocation(selectedRoute.start_location);
      setSelectedEndLocation(selectedRoute.end_location);
    }
  };

  // Format time from HH:MM:SS to 12-hour format
  const formatTime = (timeString) => {
    if (!timeString) return '—';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Get the table data (first 20 schedules to avoid overflow)
  const getTableData = () => {
    if (!schedule?.schedules) return { rows: [], toEndCount: 0, toStartCount: 0 };
    
    const toEndTimes = schedule.schedules.toEnd || [];
    const toStartTimes = schedule.schedules.toStart || [];
    
    const maxRows = Math.max(toEndTimes.length, toStartTimes.length);
    const rows = [];
    
    for (let i = 0; i < maxRows; i++) {
      rows.push({
        toEnd: toEndTimes[i] || null,
        toStart: toStartTimes[i] || null,
      });
    }
    
    return { rows, toEndCount: toEndTimes.length, toStartCount: toStartTimes.length };
  };

  const tableData = getTableData();

  return (
    <div className="schedule-page">
      <Navbar />
      
      {/* Hero Section - Updated with Aboutus style */}
      <div className="schedule-hero">
        <h1 className="schedule-hero-title">SCHEDULE</h1>
      </div>

      {/* Schedule Content */}
      <div className="schedule-content">
        {/* Dropdown Container */}
        <div className="dropdown-container">
          <select 
            className="station-select" 
            value={selectedRouteId} 
            onChange={handleRouteChange}
            disabled={routesLoading}
          >
            <option value="">Select Station / Destination</option>
            {routes.map(route => (
              <option key={route.route_id} value={route.route_id}>
                {route.name}
              </option>
            ))}
          </select>
        </div>

        {/* Table Card - Only show when a route is selected */}
        {selectedRouteId && !scheduleLoading && schedule && (
          <div className="table-card">
            <div className="table-title">
              {selectedRouteName}
            </div>
            
            <div className="table-responsive">
              <table className="schedule-table">
                <thead>
                  <tr>
                    <th>{selectedStartLocation || 'Origin'} → {selectedEndLocation || 'Destination'}</th>
                    <th>{selectedEndLocation || 'Destination'} → {selectedStartLocation || 'Origin'}</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.rows.length > 0 ? (
                    tableData.rows.map((row, idx) => (
                      <tr key={idx}>
                        <td>{row.toEnd ? formatTime(row.toEnd) : '—'}</td>
                        <td>{row.toStart ? formatTime(row.toStart) : '—'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" style={{ textAlign: 'center', padding: '2rem' }}>
                        No schedules available for this route
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Loading State */}
        {selectedRouteId && scheduleLoading && (
          <div className="table-card">
            <div className="table-title">Loading schedule...</div>
          </div>
        )}

        {/* No Selection State */}
        {!selectedRouteId && !routesLoading && (
          <div className="table-card">
            <div className="table-title">Please select a route to view schedule</div>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default SchedulePage;