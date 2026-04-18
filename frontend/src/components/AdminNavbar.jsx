import React, { useState, useEffect, useRef } from "react";
import "../css/AdminNavbar.css";

function AdminNavbar({ 
  showNotifications, 
  setShowNotifications, 
  notifications, 
  setNotifications,
  unreadCount 
}) {
  const [searchValue, setSearchValue] = useState("");
  const notifRef = useRef(null);

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowNotifications]);

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
        
        <div className="admin-divider" />
        
        <div ref={notifRef} className="admin-notif-container">
          <button 
            className="admin-notif-btn" 
            onClick={(e) => { 
              e.stopPropagation(); 
              setShowNotifications(!showNotifications); 
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2a6 6 0 00-6 6v3.5L2.5 14h15L16 11.5V8a6 6 0 00-6-6z" fill="#374151"/>
              <path d="M8 15.5a2 2 0 004 0" fill="#374151"/>
            </svg>
            {unreadCount > 0 && (
              <span className="admin-notif-badge">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="admin-notif-dropdown">
              <div className="admin-notif-header">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <button className="admin-mark-all-btn" onClick={markAllAsRead}>
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="admin-notif-list">
                {notifications.length === 0 ? (
                  <div className="admin-empty-notif">No notifications</div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`admin-notif-item ${!notif.read ? "unread" : ""}`}
                      onClick={() => markAsRead(notif.id)}
                    >
                      <div className="admin-notif-content">
                        <div className="admin-notif-message">{notif.message}</div>
                        <div className="admin-notif-time">{notif.time}</div>
                      </div>
                      {!notif.read && <div className="admin-notif-dot" />}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminNavbar;