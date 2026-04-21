import React, { useState } from "react";
import "../css/AdminNavbar.css";

function AdminNavbar() {
  const [searchValue, setSearchValue] = useState("");

  const handleSearchClear = () => {
    setSearchValue("");
  };

  return (
    <div className="admin-navbar">
      <div className="admin-search">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="6" cy="6" r="4.2" stroke="#9ca3af" strokeWidth="1.5"/>
          <line x1="9" y1="9" x2="13" y2="13" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <input 
          type="text" 
          placeholder="Search bus number"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        {searchValue && (
          <span className="admin-search-clear" onClick={handleSearchClear}>✕</span>
        )}
      </div>
      
      <div className="admin-nav-right">
        <div className="admin-info">
          <div className="admin-name">Admin123</div>
          <div className="admin-role">Admin</div>
        </div>
        
        <div className="admin-avatar">
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
            <circle cx="8.5" cy="6" r="3.2" fill="#9ca3af"/>
            <path d="M1.5 16c0-3.5 3.1-5.5 7-5.5s7 2 7 5.5" stroke="#9ca3af" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

export default AdminNavbar;