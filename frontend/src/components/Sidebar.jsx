import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../css/Sidebar.css";
import logoImage from "../assets/M2B logo for DB BG.png";

function Sidebar({ menuOpen, setMenuOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Map sidebar display names to actual routes
  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Live Tracking", path: "/tracking" },
    { name: "Analytics", path: "/analytics" },
    { name: "Management", path: "/management" }
  ];

  const handleNavClick = (path) => {
    navigate(path);  // Navigate to the route
    setMenuOpen(false);  // Close sidebar on mobile
  };

  // Handle logo click - navigate to home
  const handleLogoClick = () => {
    navigate("/M2B");
    setMenuOpen(false);
  };

  // Check if a nav item is active based on current URL
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className={`sidebar ${menuOpen ? "open" : ""}`}>
      <div className="sidebar-logo" onClick={handleLogoClick} style={{ cursor: "pointer" }}>
        <img src={logoImage} alt="M2B Logo" className="sidebar-logo-img" />
      </div>
      
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
  );
}

export default Sidebar;