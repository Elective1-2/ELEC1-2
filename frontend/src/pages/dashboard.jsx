import { useState, useEffect } from "react";
import "../css/dashboard.css";
import Sidebar from "../components/Sidebar";
import AdminNavbar from "../components/AdminNavbar";
import MobileHeader from "../components/MobileHeader";

function M2BDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activePage, setActivePage] = useState("Dashboard");
  const [notifications, setNotifications] = useState([
    { id: 1, message: "Bus #102 is arriving in 5 minutes", read: false, time: "Just now" },
    { id: 2, message: "Delay detected on Route 7: +8 minutes", read: false, time: "2 mins ago" },
    { id: 3, message: "Congestion level increased to HEAVY", read: false, time: "5 mins ago" },
    { id: 4, message: "Bus #42 has completed its route", read: true, time: "15 mins ago" },
  ]);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Fix: Added cleanup function to remove the link element
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      // Cleanup: remove the link when component unmounts
      if (link && link.parentNode) {
        link.parentNode.removeChild(link);
      }
    };
  }, []);

  // SVG Icons
  const IcoPassenger = () => (
    <svg viewBox="0 0 48 48" width="32" height="32" fill="none">
      <circle cx="30" cy="9" r="5" fill="white"/>
      <rect x="8" y="14" width="13" height="22" rx="3.5" fill="white"/>
      <rect x="8" y="32" width="24" height="6" rx="3" fill="white"/>
      <rect x="30" y="20" width="5" height="13" rx="2.5" fill="white"/>
      <path d="M21 14 Q26 10 32 14" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M21 32 L35 30" stroke="white" strokeWidth="4" strokeLinecap="round"/>
      <path d="M35 30 L35 40" stroke="white" strokeWidth="4" strokeLinecap="round"/>
    </svg>
  );

  const IcoBus = () => (
    <svg viewBox="0 0 52 52" width="34" height="34" fill="none">
      <rect x="5" y="9" width="42" height="28" rx="5" fill="white"/>
      <rect x="10" y="6" width="32" height="6" rx="3" fill="white"/>
      <rect x="8" y="13" width="15" height="10" rx="2" fill="#22c55e" opacity="0.5"/>
      <rect x="29" y="13" width="15" height="10" rx="2" fill="#22c55e" opacity="0.5"/>
      <rect x="24" y="13" width="4" height="10" rx="1" fill="#22c55e" opacity="0.3"/>
      <path d="M5 18 Q1 18 1 22 L1 26 Q1 28 4 28 L5 28 Z" fill="white" opacity="0.8"/>
      <path d="M47 18 Q51 18 51 22 L51 26 Q51 28 48 28 L47 28 Z" fill="white" opacity="0.8"/>
      <rect x="19" y="29" width="14" height="4" rx="2" fill="#22c55e" opacity="0.4"/>
      <ellipse cx="13" cy="30" rx="5" ry="3.5" fill="#bbf7d0" opacity="0.9"/>
      <ellipse cx="39" cy="30" rx="5" ry="3.5" fill="#bbf7d0" opacity="0.9"/>
      <rect x="7" y="37" width="38" height="4" rx="2" fill="white" opacity="0.75"/>
      <circle cx="15" cy="46" r="5" fill="white"/>
      <circle cx="15" cy="46" r="2" fill="#22c55e"/>
      <circle cx="37" cy="46" r="5" fill="white"/>
      <circle cx="37" cy="46" r="2" fill="#22c55e"/>
    </svg>
  );

  const IcoClock = () => (
    <svg viewBox="0 0 48 48" width="30" height="30" fill="none">
      <circle cx="24" cy="24" r="19" stroke="white" strokeWidth="4" fill="none"/>
      <line x1="24" y1="24" x2="24" y2="10" stroke="white" strokeWidth="4" strokeLinecap="round"/>
      <line x1="24" y1="24" x2="35" y2="24" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
      <circle cx="24" cy="24" r="2.5" fill="white"/>
    </svg>
  );

  const IcoCongestion = () => (
    <svg viewBox="0 0 62 50" width="40" height="32" fill="none">
      <g opacity="0.72">
        <path d="M17 17 C18 11 44 11 45 17" fill="white"/>
        <rect x="15" y="16" width="30" height="12" rx="3" fill="white"/>
        <rect x="18" y="12" width="9" height="6" rx="1.5" fill="#ef4444" opacity="0.35"/>
        <rect x="35" y="12" width="9" height="6" rx="1.5" fill="#ef4444" opacity="0.35"/>
        <circle cx="21" cy="29" r="4" fill="white"/>
        <circle cx="21" cy="29" r="1.6" fill="#ef4444"/>
        <circle cx="41" cy="29" r="4" fill="white"/>
        <circle cx="41" cy="29" r="1.6" fill="#ef4444"/>
      </g>
      <g>
        <path d="M1 37 C2 30 25 30 25 37" fill="white"/>
        <rect x="0" y="36" width="27" height="12" rx="3" fill="white"/>
        <rect x="3" y="31" width="7" height="6" rx="1.5" fill="#ef4444" opacity="0.35"/>
        <rect x="17" y="31" width="7" height="6" rx="1.5" fill="#ef4444" opacity="0.35"/>
        <rect x="1" y="44" width="4" height="3" rx="1" fill="#fde68a" opacity="0.9"/>
        <rect x="22" y="44" width="4" height="3" rx="1" fill="#fde68a" opacity="0.9"/>
        <circle cx="6" cy="49" r="3.5" fill="white"/>
        <circle cx="6" cy="49" r="1.4" fill="#ef4444"/>
        <circle cx="21" cy="49" r="3.5" fill="white"/>
        <circle cx="21" cy="49" r="1.4" fill="#ef4444"/>
      </g>
      <g>
        <path d="M36 37 C36 30 60 30 61 37" fill="white"/>
        <rect x="35" y="36" width="27" height="12" rx="3" fill="white"/>
        <rect x="38" y="31" width="7" height="6" rx="1.5" fill="#ef4444" opacity="0.35"/>
        <rect x="52" y="31" width="7" height="6" rx="1.5" fill="#ef4444" opacity="0.35"/>
        <rect x="36" y="44" width="4" height="3" rx="1" fill="#fde68a" opacity="0.9"/>
        <rect x="57" y="44" width="4" height="3" rx="1" fill="#fde68a" opacity="0.9"/>
        <circle cx="41" cy="49" r="3.5" fill="white"/>
        <circle cx="41" cy="49" r="1.4" fill="#ef4444"/>
        <circle cx="56" cy="49" r="3.5" fill="white"/>
        <circle cx="56" cy="49" r="1.4" fill="#ef4444"/>
      </g>
    </svg>
  );

  const BUSES = [
    { id: "Bus #102", sub: "On Time", subCls: "sub-green", dot: "dot-blue", left: "56%", top: "28%" },
    { id: "Bus #42", sub: "En Route", subCls: "sub-blue", dot: "dot-blue", left: "32%", top: "50%" },
    { id: "Bus #88", sub: "+5m Late", subCls: "sub-red", dot: "dot-red", left: "68%", top: "65%" },
  ];

  const renderContent = () => {
    if (activePage === "Dashboard") {
      return (
        <div className="m2b-content">
          <div className="m2b-page-title">Welcome back, Admin123!</div>
          <div className="m2b-stats">
            <div className="m2b-stat-card">
              <div>
                <div className="m2b-stat-lbl">Total Passengers</div>
                <div className="m2b-stat-val">1,284</div>
              </div>
              <div className="m2b-stat-icon ic-navy"><IcoPassenger /></div>
            </div>
            <div className="m2b-stat-card">
              <div>
                <div className="m2b-stat-lbl">Active Buses</div>
                <div className="m2b-stat-val">24</div>
              </div>
              <div className="m2b-stat-icon ic-green"><IcoBus /></div>
            </div>
            <div className="m2b-stat-card">
              <div>
                <div className="m2b-stat-lbl">Average Delay</div>
                <div className="m2b-stat-val">4.2 mins</div>
              </div>
              <div className="m2b-stat-icon ic-orange"><IcoClock /></div>
            </div>
            <div className="m2b-stat-card">
              <div>
                <div className="m2b-stat-lbl">Congestion Level</div>
                <div className="m2b-stat-val">HEAVY</div>
              </div>
              <div className="m2b-stat-icon ic-red"><IcoCongestion /></div>
            </div>
          </div>
          <div className="m2b-map-card">
            <div className="m2b-map-title">Live Transit Map</div>
            <div className="m2b-map-body">
              <div className="m2b-route" />
              {BUSES.map(b => (
                <div key={b.id} className="m2b-pin" style={{ left: b.left, top: b.top }}>
                  <div className="m2b-pin-label">
                    {b.id}
                    <span className={`m2b-pin-sub ${b.subCls}`}>{b.sub}</span>
                  </div>
                  <div className={`m2b-pin-dot ${b.dot}`} />
                </div>
              ))}
              <div className="m2b-legend">
                <div className="m2b-legend-title">Legend</div>
                <div className="m2b-leg-row">
                  <div className="m2b-leg-dot" style={{ background: "#3b82f6" }} />
                  Moving Bus
                </div>
                <div className="m2b-leg-row">
                  <div className="m2b-leg-dot" style={{ background: "#ef4444" }} />
                  Heavy Congestion
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="m2b-content">
        <div className="m2b-page-title">{activePage}</div>
        <div className="placeholder-content">
          <p>{activePage} content goes here</p>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={`m2b-overlay ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(false)} />
      
      <div className="m2b-app">
        <MobileHeader setMenuOpen={setMenuOpen} />
        <Sidebar 
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          activePage={activePage}
          setActivePage={setActivePage}
        />
        
        <div className="m2b-main">
          <AdminNavbar 
            showNotifications={showNotifications}
            setShowNotifications={setShowNotifications}
            notifications={notifications}
            setNotifications={setNotifications}
            unreadCount={unreadCount}
          />
          {renderContent()}
          <div className="m2b-footer">
            2026, M2B. Developed by BSCpE Students, Bulacan State University.
          </div>
        </div>
      </div>
    </>
  );
}

export default M2BDashboard;
