import React, { useState, useEffect, useRef } from "react";
import "../css/drivermain.css";

/* LIVE CLOCK */
function LiveClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const time = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const date = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="dm-clock-widget">
      <div className="dm-clock-time">{time}</div>
      <div className="dm-clock-date">{date}</div>
    </div>
  );
}

/* DATA */
const BUSES = [
  {
    id: 1,
    number: "BUS #101",
    from: "Trinoma",
    to: "Malolos",
    departure: "12:45 PM",
    status: "On Time",
  },
  {
    id: 2,
    number: "BUS #101",
    from: "Malolos",
    to: "Trinoma",
    departure: "1:30 PM",
    status: "On Time",
  },
];

const INITIAL_NOTIFICATIONS = [
  { id: 1, message: "Your trip to Malolos is scheduled for 12:45 PM.", time: "10 mins ago", read: false },
  { id: 2, message: "Bus #101 has been assigned to you.", time: "30 mins ago", read: false },
  { id: 3, message: "Reminder: Complete your trip report.", time: "1 hour ago", read: true },
];

/* BUS ROW */
function BusRow({ bus }) {
  return (
    <div className="dm-bus-row">
      <div className="dm-bus-number">{bus.number}</div>

      <div className="dm-bus-route">
        <div className="dm-route-item">
          <span className="dm-route-label">FROM</span>
          <span className="dm-route-value">{bus.from}</span>
        </div>
        <div className="dm-route-item">
          <span className="dm-route-label">BOUND FOR</span>
          <span className="dm-route-value">{bus.to}</span>
        </div>
      </div>

      <div className="dm-bus-meta">
        <div className="dm-departure">
          <div className="dm-departure-label">DEPARTURE</div>
          <div className="dm-departure-time">{bus.departure}</div>
        </div>
        <div className="dm-status-block">
          <div className="dm-status-label">STATUS</div>
          <div className="dm-status-pill">{bus.status}</div>
        </div>
        <button className="dm-start-btn">START TRIP</button>
      </div>
    </div>
  );
}

/* MAIN COMPONENT */
export default function DriverMain() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const notifRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="dm-root">

      {/* ── NAVBAR ── */}
      <nav className="dm-nav">

        {/* Logo */}
        <div className="dm-nav-logo">
          <div className="dm-logo-seg m">M</div>
          <div className="dm-logo-seg two">2</div>
          <div className="dm-logo-seg b">B</div>
        </div>

        {/* Right side */}
        <div className="dm-nav-right">

          {/* User info + avatar */}
          <div className="dm-nav-user">
            <div className="dm-nav-user-info">
              <span className="dm-nav-username">Admin123</span>
              <span className="dm-nav-role">Admin</span>
            </div>
            <div className="dm-nav-avatar">
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                <circle cx="8.5" cy="6" r="3.2" fill="#111827"/>
                <path d="M1.5 16c0-3.5 3.1-5.5 7-5.5s7 2 7 5.5" stroke="#111827" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          {/* Divider */}
          <div className="dm-nav-divider" />

          {/* Notification bell + dropdown */}
          <div ref={notifRef} className="dm-notif-container">
            <button
              className="dm-nav-bell"
              onClick={(e) => {
                e.stopPropagation();
                setShowNotifications(!showNotifications);
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2a6 6 0 00-6 6v3.5L2.5 14h15L16 11.5V8a6 6 0 00-6-6z" fill="#111827"/>
                <path d="M8 15.5a2 2 0 004 0" fill="#111827"/>
              </svg>
              {unreadCount > 0 && (
                <div className="dm-bell-dot">{unreadCount > 9 ? "9+" : ""}</div>
              )}
            </button>

            {/* Dropdown */}
            {showNotifications && (
              <div className="dm-notif-dropdown">
                <div className="dm-notif-header">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <button className="dm-notif-mark-all" onClick={markAllAsRead}>
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="dm-notif-list">
                  {notifications.length === 0 ? (
                    <div className="dm-notif-empty">No notifications</div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`dm-notif-item ${!notif.read ? "unread" : ""}`}
                        onClick={() => markAsRead(notif.id)}
                      >
                        <div className="dm-notif-content">
                          <div className="dm-notif-message">{notif.message}</div>
                          <div className="dm-notif-time">{notif.time}</div>
                        </div>
                        {!notif.read && <div className="dm-notif-dot" />}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </nav>

      {/* ── BODY ── */}
      <main className="dm-body">

        {/* Welcome card */}
        <div className="dm-welcome-card">
          <div className="dm-welcome-left">
            <div className="dm-welcome-name">Welcome back, Capt. Arnold</div>
            <div className="dm-welcome-hub">
              <div className="dm-hub-dot" />
              <div className="dm-hub-text">
                Current Hub: <span>Trinoma</span>
              </div>
            </div>
          </div>
          <LiveClock />
        </div>

        {/* Assigned buses */}
        <div className="dm-section">
          <div className="dm-section-label">Assigned Buses</div>
          <div className="dm-bus-list">
            {BUSES.map((bus) => (
              <BusRow key={bus.id} bus={bus} />
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
