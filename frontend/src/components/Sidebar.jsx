import React from "react";
import "../css/Sidebar.css";

function Sidebar({ menuOpen, setMenuOpen, activePage, setActivePage }) {
  const navItems = ["Dashboard", "Live Tracking", "Analytics", "Management"];

  const handleNavClick = (page) => {
    setActivePage(page);
    setMenuOpen(false);
  };

  return (
    <div className={`sidebar ${menuOpen ? "open" : ""}`}>
      <div className="sidebar-logo">
        <div className="sidebar-logo-seg seg-m">M</div>
        <div className="sidebar-logo-seg seg-2">2</div>
        <div className="sidebar-logo-seg seg-b">B</div>
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