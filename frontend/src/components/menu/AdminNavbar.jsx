import React, { useState, useEffect } from "react";
import "../../css/AdminNavbar.css";

function AdminNavbar({ onSearchChange, initialSearchValue = "" }) {
  const [searchValue, setSearchValue] = useState(initialSearchValue);

  useEffect(() => {
    setSearchValue(initialSearchValue);
  }, [initialSearchValue]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const handleSearchClear = () => {
    setSearchValue("");
    if (onSearchChange) {
      onSearchChange("");
    }
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
          placeholder="Search bus or driver"
          value={searchValue}
          onChange={handleSearchChange}
        />
        {searchValue && (
          <span className="admin-search-clear" onClick={handleSearchClear}>✕</span>
        )}
      </div>
      

    </div>
  );
}

export default AdminNavbar;