import React, { useState } from "react";
import AdminNavbar from "../components/AdminNavbar";
import MobileHeader from "../components/MobileHeader";
import Sidebar from "../components/Sidebar";
import "../css/tracking.css";

// ── Bus data ──────────────────────────────────────────────────────────────

const allBuses = [
  { id: 101, route: "Malolos – Trinoma Route",     status: "On Track", eta: "10:45 AM", delay: false },
  { id: 102, route: "Guiguinto – Trinoma Route",   status: "Delayed",  eta: "11:00 AM", delay: true  },
  { id: 103, route: "Trinoma – Santa Maria Route", status: "On Track", eta: "12:00 PM", delay: false },
  { id: 88,  route: "Malolos – Trinoma Route",     status: "On Track", eta: "10:45 AM", delay: false },
  { id: 67,  route: "Malolos – Trinoma Route",     status: "On Track", eta: "10:45 AM", delay: false },
  { id: 104, route: "Malolos – Trinoma Route",     status: "On Track", eta: "10:45 AM", delay: false },
  { id: 105, route: "Malolos – Trinoma Route",     status: "On Track", eta: "10:45 AM", delay: false },
  { id: 106, route: "Malolos – Trinoma Route",     status: "On Track", eta: "10:45 AM", delay: false },
];

// ── Page component ────────────────────────────────────────────────────────

function Tracking() {
  const [menuOpen, setMenuOpen]                   = useState(false);
  const [activePage, setActivePage]               = useState("Live Tracking");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications]         = useState([
    { id: 1, message: "Bus #67 is running 20 min late on Trinoma route.", time: "3 min ago",  read: false },
    { id: 2, message: "Heavy congestion detected near EDSA-Trinoma.",     time: "10 min ago", read: false },
    { id: 3, message: "Bus #101 departed Malolos terminal on time.",      time: "30 min ago", read: true  },
  ]);
  const [searchTerm, setSearchTerm] = useState("");

  const unreadCount    = notifications.filter((n) => !n.read).length;
  const filteredBuses  = allBuses.filter(
    (b) => searchTerm === "" || b.id.toString().includes(searchTerm.trim())
  );

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
          <AdminNavbar
            showNotifications={showNotifications}
            setShowNotifications={setShowNotifications}
            notifications={notifications}
            setNotifications={setNotifications}
            unreadCount={unreadCount}
          />

          {/* Page content */}
          <div className="track-content">

            {/* ── Active Buses ── */}
            <div className="track-card">
              <div className="track-card-header">
                <span className="track-card-title">Active Buses</span>
                <span className="track-badge">24</span>
              </div>

              {filteredBuses.length === 0 ? (
                <div className="track-empty">No buses match your search.</div>
              ) : (
                filteredBuses.map((bus) => (
                  <div key={bus.id} className="track-bus-item">
                    <div className="track-bus-info">
                      <div className="track-bus-number">Bus #{bus.id}</div>
                      <div className="track-bus-route">{bus.route}</div>
                      <div className="track-bus-status-row">
                        <span className={`track-status-badge ${bus.delay ? "delayed" : "ontrack"}`}>
                          {bus.delay ? "Delayed" : "On Track"}
                        </span>
                        <span className="track-eta"><strong>ETA:</strong> {bus.eta}</span>
                      </div>
                    </div>
                    <button className="track-view-btn">VIEW</button>
                  </div>
                ))
              )}
            </div>

            {/* ── Live Transit ── */}
            <div className="track-map-card">
              <div className="track-map-title">Live Transit</div>
              <div className="track-map-body">

                {/* Diagonal road: red (congestion) → green (clear) — identical to dashboard */}
                <div className="track-route" />

                {/* Bus #42 — En Route */}
                <div className="track-pin" style={{ left: "32%", top: "50%" }}>
                  <div className="track-pin-label">
                    Bus #42
                    <span className="track-pin-sub sub-blue">En Route</span>
                  </div>
                  <div className="track-pin-dot dot-blue" />
                </div>

                {/* Bus #102 — On Time */}
                <div className="track-pin" style={{ left: "56%", top: "28%" }}>
                  <div className="track-pin-label">
                    Bus #102
                    <span className="track-pin-sub sub-green">On Time</span>
                  </div>
                  <div className="track-pin-dot dot-blue" />
                </div>

                {/* Bus #88 — +5m Late */}
                <div className="track-pin" style={{ left: "78%", top: "65%" }}>
                  <div className="track-pin-label">
                    Bus #88
                    <span className="track-pin-sub sub-red">+5m Late</span>
                  </div>
                  <div className="track-pin-dot dot-red" />
                </div>

                {/* Legend */}
                <div className="track-map-legend">
                  <div className="track-map-legend-title">Legend</div>
                  <div className="track-leg-row">
                    <div className="track-leg-dot" style={{ background: "#3b82f6" }} />
                    Moving Bus
                  </div>
                  <div className="track-leg-row">
                    <div className="track-leg-dot" style={{ background: "#ef4444" }} />
                    Heavy Congestion
                  </div>
                </div>

              </div>
            </div>

          </div>{/* /track-content */}

          {/* Footer */}
          <div className="track-footer">
            2026, M2B. Developed by BSCpE Students, Bulacan State University.
          </div>
        </div>{/* /track-main */}
      </div>{/* /track-body */}
    </div>
  );
}

export default Tracking;
