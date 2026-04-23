import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logoImage from "../../assets/M2B logo for DB BG.png";
import "../../css/Sidebar.css";

function Sidebar({ menuOpen, setMenuOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Live Tracking", path: "/tracking" },
    { name: "Analytics", path: "/analytics" },
    { name: "Management", path: "/management" }
  ];

  const handleNavClick = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  const handleLogoClick = () => {
    navigate("/dashboard");
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    setMenuOpen(false);
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <div className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="sidebar-logo" onClick={handleLogoClick} style={{ cursor: "pointer" }}>
          <img src={logoImage} alt="M2B Logo" className="sidebar-logo-img" />
        </div>
        
        <div className="sidebar-nav">
          {navItems.map((item) => (
            <div
              key={item.name}
              className={`sidebar-nav-item ${isActive(item.path) ? "active" : ""}`}
              onClick={() => handleNavClick(item.path)}
            >
              {item.name}
            </div>
          ))}
        </div>

        <div className="sidebar-logout">
          <button 
            className="sidebar-logout-btn"
            onClick={() => setShowLogoutConfirm(true)}
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="logout-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="logout-modal-header">
              <h3>Confirm Logout</h3>
            </div>
            <div className="logout-modal-body">
              <p>Are you sure you want to logout?</p>
            </div>
            <div className="logout-modal-footer">
              <button 
                className="logout-btn-cancel"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="logout-btn-confirm"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;