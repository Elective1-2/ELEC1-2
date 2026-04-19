import React, { useState } from 'react';
import '../css/passenger.css';

const App = () => {
  const [activeTab, setActiveTab] = useState('details');
  const [selectedStop, setSelectedStop] = useState(null);

  const tripData = {
    busNumber: "101",
    plateNumber: "GBC-0021",
    origin: "Malolos",
    destination: "Trinoma",
    status: "On Time",
    congestion: "Moderate",
    departureTime: "10:15 AM",
    arrivalTime: "11:15 AM",
    driver: "Mario Santos",
    stops: [
      { name: "Shell of Asia", type: "stop", time: "10:15 AM" },
      { name: "WalterMart Guiguinto", type: "stop", time: "10:25 AM" },
      { name: "TABANG", type: "stop", time: "10:32 AM" },
      { name: "ILANG ILANG", type: "stop", time: "10:38 AM" },
      { name: "Guigu", type: "stop", time: "10:45 AM" },
      { name: "KUSU SIRI", type: "stop", time: "10:52 AM" },
      { name: "POBLACION", type: "stop", time: "11:00 AM" },
      { name: "Trinoma", type: "destination", time: "11:15 AM" }
    ]
  };

  const handleEmergencyCall = () => {
    alert("Emergency call initiated to: 911");
  };

  const handleStopClick = (stop) => {
    setSelectedStop(stop);
  };

  return (
    <div className="app">
      {/* Header Section */}
      <header className="header">
        <button className="menu-button">☰</button>
        <h1 className="app-title">M2 B</h1>
        <button className="profile-button">👤</button>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Active Trip Details Section */}
        <details className="trip-details" open>
          <summary className="details-summary">
            <span className="summary-title">ACTIVE TRIP DETAILS</span>
            <span className="summary-icon">▼</span>
          </summary>
          
          <div className="details-content">
            {/* Bus Info */}
            <div className="bus-info">
              <div className="bus-number-section">
                <span className="bus-icon">🚌</span>
                <span className="bus-number">{tripData.busNumber}</span>
              </div>
              <div className="plate-number">{tripData.plateNumber}</div>
            </div>

            {/* Route Info */}
            <div className="route-info">
              <div className="info-card">
                <label>ORIGIN</label>
                <span className="value">{tripData.origin}</span>
              </div>
              <div className="route-arrow">→</div>
              <div className="info-card">
                <label>DESTINATION</label>
                <span className="value">{tripData.destination}</span>
              </div>
            </div>

            {/* Status & Congestion */}
            <div className="status-info">
              <div className="info-card">
                <label>STATUS</label>
                <span className={`status-badge ${tripData.status.toLowerCase().replace(' ', '-')}`}>
                  {tripData.status}
                </span>
              </div>
              <div className="info-card">
                <label>CONGESTION LEVEL</label>
                <span className={`congestion-badge ${tripData.congestion.toLowerCase()}`}>
                  {tripData.congestion}
                </span>
              </div>
            </div>

            {/* Time Info */}
            <div className="time-info">
              <div className="info-card">
                <span className="time-icon">🕐</span>
                <div>
                  <label>DEPARTURE TIME</label>
                  <span className="value">{tripData.departureTime}</span>
                </div>
              </div>
              <div className="info-card">
                <span className="time-icon">🏁</span>
                <div>
                  <label>EXPECTED ARRIVAL</label>
                  <span className="value">{tripData.arrivalTime}</span>
                </div>
              </div>
            </div>

            {/* Driver Info */}
            <div className="driver-info">
              <span className="driver-icon">👨‍✈️</span>
              <div>
                <label>DRIVER</label>
                <span className="driver-name">{tripData.driver}</span>
              </div>
            </div>

            {/* Emergency Button */}
            <button className="emergency-button" onClick={handleEmergencyCall}>
              <span className="emergency-icon">📞</span>
              Emergency Call
            </button>
          </div>
        </details>

        {/* Map Section */}
        <div className="map-section">
          <div className="map-header">
            <h3>Route Map</h3>
            <div className="map-controls">
              <button className="map-control">📍</button>
              <button className="map-control">🔍+</button>
              <button className="map-control">🔍-</button>
            </div>
          </div>
          
          <div className="map-container">
            {/* Route visualization */}
            <div className="route-visualization">
              <div className="route-line">
                {tripData.stops.map((stop, index) => (
                  <div 
                    key={index} 
                    className={`route-point ${stop.type === 'destination' ? 'destination' : ''}`}
                    style={{ left: `${(index / (tripData.stops.length - 1)) * 100}%` }}
                  >
                    <div className="point-marker"></div>
                    <div className="point-label">{stop.name}</div>
                  </div>
                ))}
                <div className="bus-animation" style={{ left: '35%' }}>
                  <span className="bus-marker">🚌</span>
                </div>
              </div>
            </div>
            
            {/* Map placeholder with route path */}
            <div className="map-placeholder">
              <svg className="route-svg" viewBox="0 0 800 400">
                {/* Background grid */}
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="800" height="400" fill="url(#grid)" />
                
                {/* Route path */}
                <path 
                  d="M 50 200 Q 150 150, 250 180 T 450 160 T 650 200 T 750 180" 
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="4"
                  strokeDasharray="10 5"
                />
                
                {/* Origin marker */}
                <circle cx="50" cy="200" r="8" fill="#22c55e" stroke="white" strokeWidth="2"/>
                <text x="40" y="180" fontSize="12" fill="#166534">🚌 Malolos</text>
                
                {/* Destination marker */}
                <circle cx="750" cy="180" r="8" fill="#ef4444" stroke="white" strokeWidth="2"/>
                <text x="710" y="165" fontSize="12" fill="#991b1b">🏁 Trinoma</text>
                
                {/* Stop markers */}
                {[150, 250, 350, 450, 550, 650].map((x, i) => (
                  <g key={i}>
                    <circle cx={x} cy={i % 2 === 0 ? 180 : 200} r="4" fill="#64748b" stroke="white" strokeWidth="1.5"/>
                    <text x={x - 20} y={i % 2 === 0 ? 170 : 215} fontSize="10" fill="#475569">
                      {tripData.stops[i + 1]?.name.substring(0, 12)}
                    </text>
                  </g>
                ))}
                
                {/* Bus icon */}
                <g transform="translate(350, 190)">
                  <rect x="-12" y="-10" width="24" height="20" rx="3" fill="#3b82f6" stroke="#1e40af" strokeWidth="1.5"/>
                  <circle cx="-6" cy="12" r="4" fill="#1e293b"/>
                  <circle cx="6" cy="12" r="4" fill="#1e293b"/>
                  <text x="-3" y="4" fontSize="14" fill="white">🚌</text>
                </g>
              </svg>
              
              <div className="map-overlay">
                <div className="map-message">
                  <span className="map-icon">🗺️</span>
                  <p>Interactive Map Integration</p>
                  <small>Google Maps / Leaflet API ready</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stops List Section */}
        <div className="stops-section">
          <div className="stops-header">
            <h3>Stops & Waypoints</h3>
            <span className="stop-count">{tripData.stops.length} stops</span>
          </div>
          
          <div className="stops-list">
            {tripData.stops.map((stop, index) => (
              <div 
                key={index} 
                className={`stop-item ${stop.type === 'destination' ? 'destination-stop' : ''} ${selectedStop === stop ? 'selected' : ''}`}
                onClick={() => handleStopClick(stop)}
              >
                <div className="stop-timeline">
                  <div className={`stop-dot ${index === 0 ? 'origin' : stop.type === 'destination' ? 'destination' : ''}`}>
                    {index === 0 && <span className="dot-icon">🚌</span>}
                    {stop.type === 'destination' && <span className="dot-icon">🏁</span>}
                  </div>
                  {index < tripData.stops.length - 1 && <div className="stop-line"></div>}
                </div>
                
                <div className="stop-content">
                  <div className="stop-info">
                    <span className="stop-name">{stop.name}</span>
                    <span className="stop-time">{stop.time}</span>
                  </div>
                  {stop.type === 'destination' && (
                    <span className="destination-badge">Destination</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button className={`nav-item ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>
          <span className="nav-icon">📋</span>
          <span>Details</span>
        </button>
        <button className={`nav-item ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')}>
          <span className="nav-icon">🗺️</span>
          <span>Map</span>
        </button>
        <button className={`nav-item ${activeTab === 'stops' ? 'active' : ''}`} onClick={() => setActiveTab('stops')}>
          <span className="nav-icon">📍</span>
          <span>Stops</span>
        </button>
        <button className={`nav-item ${activeTab === 'emergency' ? 'active' : ''}`} onClick={() => setActiveTab('emergency')}>
          <span className="nav-icon">🆘</span>
          <span>Emergency</span>
        </button>
      </nav>
    </div>
  );
};

export default App;