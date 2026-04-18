import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../css/Tracking.css";

function Tracking() {
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 1024; // Changed to 1024px for tablet breakpoint
      setIsMobile(mobile);
      // Auto-close sidebar when switching to mobile
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true); // Keep sidebar open on desktop
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const allBuses = [
    { id: 101, route: "Malolos – Trinoma Route", eta: "10:45 AM", delay: false },
    { id: 102, route: "Guiguinto – Trinoma Route", eta: "11:00 AM", delay: true },
    { id: 103, route: "Trinoma – Santa Maria Route", eta: "12:00 PM", delay: false },
    { id: 88, route: "Malolos – Trinoma Route", eta: "10:45 AM", delay: false },
    { id: 67, route: "Malolos – Trinoma Route", eta: "10:45 AM", delay: false },
  ];

  const filteredBuses = allBuses.filter(
    (bus) => searchTerm === "" || bus.id.toString().includes(searchTerm)
  );

  const navItems = [
    { label: "Dashboard", icon: "📊", path: "/dashboard" },
    { label: "Live Tracking", icon: "📍", path: "/tracking" },
    { label: "Analytics", icon: "📈", path: "/analytics" },
    { label: "Management", icon: "⚙️", path: "/management" },
  ];

  const logoCircle = (bg, text, textColor = "white") => ({
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    background: bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "14px",
    color: textColor,
  });

  return (
    <div className="tracking-container">
      {/* Overlay - only show on mobile when sidebar is open */}
      {isMobile && sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar - different behavior for desktop vs mobile */}
      <div className={`sidebar ${isMobile ? (sidebarOpen ? "sidebar-visible" : "sidebar-hidden") : "sidebar-desktop"}`}>
        <div className="sidebar-logo-row">
          <div style={logoCircle("#1A2B3C", "M")}>M</div>
          <div style={logoCircle("#3498db", "2")}>2</div>
          <div style={logoCircle("#f1c40f", "B", "#333")}>B</div>
        </div>

        <div className="nav-list">
          {navItems.map(({ label, icon, path }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={label}
                className={`nav-btn ${isActive ? "nav-btn-active" : ""}`}
                onClick={() => {
                  navigate(path);
                  if (isMobile) setSidebarOpen(false);
                }}
              >
                <span className="nav-icon">{icon}</span>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Header */}
      <div className="header">
        {/* Only show hamburger button on mobile/tablet */}
        {isMobile && (
          <button className="hamburger-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
        )}

        <div className="logo">
          <div style={logoCircle("#1A2B3C", "M")}>M</div>
          <div style={logoCircle("#3498db", "2")}>2</div>
          <div style={logoCircle("#f1c40f", "B", "#333")}>B</div>
        </div>

        <div className="admin-area">
          <div className="admin-badge">Admin123</div>
          <div className="bell-icon">🔔</div>
        </div>
      </div>

      {/* Main Content - adjust margin based on screen size */}
      <div className={`main-content ${!isMobile ? "main-content-desktop" : ""}`}>
        <h2 className="page-title">Tracking</h2>

        <div className="topbar">
          <div className={`search-wrap ${isMobile ? "search-wrap-mobile" : ""}`}>
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Search bus number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Active Buses */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Active Buses</h3>
            <span className="badge-count">24</span>
          </div>

          {filteredBuses.map((bus) => (
            <div key={bus.id} className="bus-item">
              <div className="bus-info">
                <div className="bus-number">Bus #{bus.id}</div>
                <div className="route-text">{bus.route}</div>
                <div className="status-row">
                  <span className={`badge ${bus.delay ? "badge-delayed" : "badge-ontrack"}`}>
                    {bus.delay ? "Delayed" : "On Track"}
                  </span>
                  <span className="eta-text">ETA: {bus.eta}</span>
                </div>
              </div>
              <button className="view-btn">VIEW</button>
            </div>
          ))}
        </div>

        {/* Live Transit */}
        <div className="card">
          <h3 className="card-title">Live Transit</h3>

          <div className="transit-box">
            <svg
              className="transit-svg"
              viewBox="0 0 600 260"
              preserveAspectRatio="none"
            >
              <line x1="30" y1="210" x2="480" y2="110" className="transit-line-green" />
              <line x1="400" y1="135" x2="490" y2="110" className="transit-line-red" />
            </svg>

            {/* Bus #42 */}
            <div className="bus-marker" style={{ top: "162px", left: "130px" }}>
              <div className="bus-tooltip">
                Bus #42<br /><span className="bus-status-ontime">En Route</span>
              </div>
              <div className="bus-dot bus-dot-moving" />
            </div>

            {/* Bus #102 */}
            <div className="bus-marker" style={{ top: "100px", left: "295px" }}>
              <div className="bus-tooltip">
                Bus #102<br /><span className="bus-status-ontime">On Time</span>
              </div>
              <div className="bus-dot bus-dot-moving" />
            </div>

            {/* Bus #88 */}
            <div className="bus-marker" style={{ top: "118px", left: "435px" }}>
              <div className="bus-tooltip">
                Bus #88<br /><span className="bus-status-delayed">+15 Late</span>
              </div>
              <div className="bus-dot bus-dot-delayed" />
            </div>
          </div>

          <div className="legend">
            <div className="legend-item">
              <div className="dot-moving" /><span>Moving Bus</span>
            </div>
            <div className="legend-item">
              <div className="dot-congested" /><span>Heavy Congestion</span>
            </div>
          </div>
        </div>

        <div className="footer">
          © 2026, M2B. Developed by BSCPE Students, Bulacan State University.
        </div>
      </div>
    </div>
  );
}

export default Tracking;