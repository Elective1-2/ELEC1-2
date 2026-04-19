import React from "react";
import "../css/Sidebar.css";
import logoImage from "../assets/M2B logo.png";

function Sidebar({ menuOpen, setMenuOpen, activePage, setActivePage }) {
  const navItems = ["Dashboard", "Live Tracking", "Analytics", "Management"];

  const handleNavClick = (page) => {
    setActivePage(page);
    setMenuOpen(false);
  };

  return (
    <div className={`sidebar ${menuOpen ? "open" : ""}`}>
      <div className="sidebar-logo">
        <img src={logoImage} alt="M2B Logo" className="sidebar-logo-img" />
      </div>
      
      {navItems.map((item) => (
        <div
          key={item}
          className={`sidebar-nav-item ${activePage === item ? "active" : ""}`}
          onClick={() => handleNavClick(item)}
        >
          {item}
        </div>
      ))}
    </div>
  );
}

export default Sidebar;