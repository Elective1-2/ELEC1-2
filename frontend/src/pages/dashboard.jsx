import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/menu/Sidebar";
import AdminNavbar from "../components/menu/AdminNavbar";
import MobileHeader from "../components/menu/MobileHeader";
import Footer from "../components/menu/Footer";
import StatCard from "../components/dashboard/StatCard";
import QuickActions from "../components/dashboard/QuickActions";
import { BusIcon, PassengerIcon, TripIcon, DelayIcon } from "../components/dashboard/DashboardIcons";
import { useDashboard } from "../hooks/useDashboard";
import "../css/dashboard.css";

function M2BDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activePage, setActivePage] = useState("Dashboard");

  
  const { stats, loading } = useDashboard(true);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      if (link && link.parentNode) {
        link.parentNode.removeChild(link);
      }
    };
  }, []);

  const renderContent = () => {
    if (activePage === "Dashboard") {
      return (
        <div className="m2b-content">
          <div className="m2b-page-title">Welcome back, M2B Admin!</div>
          
          {/* Stats Grid */}
          <div className="m2b-stats">
            <StatCard 
              label="Active Buses"
              value={stats.activeBuses}
              icon={<BusIcon />}
              color="ic-green"
              loading={loading}
            />
            <StatCard 
              label="Total Passengers (today)"
              value={stats.totalPassengersToday.toLocaleString()}
              icon={<PassengerIcon />}
              color="ic-navy"
              loading={loading}
            />
            <StatCard 
              label="Active Trips"
              value={stats.activeTrips}
              icon={<TripIcon />}
              color="ic-red"
              loading={loading}
            />
            <StatCard 
              label="Avg Delay (today)"
              value={`${stats.averageDelayMinutes} min`}
              icon={<DelayIcon />}
              color="ic-orange"
              loading={loading}
            />
          </div>

          {/* Quick Actions */}
          <QuickActions />

          {/* Live Transit Map - Placeholder */}
          <div className="m2b-map-card">
            <div className="m2b-map-title">Live Transit</div>
            <div className="m2b-map-body m2b-map-placeholder">
              <div className="m2b-placeholder-content">
                <div className="m2b-placeholder-icon">🗺️</div>
                <div className="m2b-placeholder-title">Live Map Coming Soon</div>
                <div className="m2b-placeholder-text">
                  Track all active buses in real-time on an interactive map
                </div>
                <Link to="/tracking" className="m2b-placeholder-link">
                  Go to Live Tracking →
                </Link>
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
          <AdminNavbar/>
          {renderContent()}
          <Footer />
        </div>
      </div>
    </>
  );
}

export default M2BDashboard;