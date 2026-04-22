import React, { useState } from "react";
import AdminNavbar from "../components/AdminNavbar";
import MobileHeader from "../components/MobileHeader";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import "../css/analytics.css";

// ── Inline SVG chart helpers ──────────────────────────────────────────────

/** Simple bar chart rendered as inline SVG */
function BarChart({ data, color = "#3b82f6" }) {
  const W = 600, H = 220, padL = 44, padR = 16, padT = 16, padB = 40;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const maxVal = Math.max(...data.map((d) => d.value));
  const barW = innerW / data.length;
  const yTicks = [0, 400, 800, 1200, 1600];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="analytics-svg" preserveAspectRatio="xMidYMid meet">
      {/* Y grid lines + labels */}
      {yTicks.map((t) => {
        const y = padT + innerH - (t / maxVal) * innerH;
        return (
          <g key={t}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#e5e7eb" strokeWidth="1" />
            <text x={padL - 6} y={y + 4} textAnchor="end" fontSize="11" fill="#9ca3af">{t}</text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const bH = (d.value / maxVal) * innerH;
        const x = padL + i * barW + barW * 0.18;
        const y = padT + innerH - bH;
        const bw = barW * 0.64;
        return (
          <g key={d.label}>
            <rect x={x} y={y} width={bw} height={bH} rx="4" fill={color} opacity="0.88" />
            <text x={x + bw / 2} y={H - padB + 16} textAnchor="middle" fontSize="11" fill="#6b7280">{d.label}</text>
          </g>
        );
      })}

      {/* X axis line */}
      <line x1={padL} y1={padT + innerH} x2={W - padR} y2={padT + innerH} stroke="#e5e7eb" strokeWidth="1" />
    </svg>
  );
}

/** Simple line chart rendered as inline SVG */
function LineChart({ data, color = "#f5a623" }) {
  const W = 600, H = 220, padL = 44, padR = 16, padT = 16, padB = 40;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const maxVal = Math.max(...data.map((d) => d.value)) * 1.1;
  const yTicks = [0, 4, 8, 12, 16];

  const pts = data.map((d, i) => {
    const x = padL + (i / (data.length - 1)) * innerW;
    const y = padT + innerH - (d.value / maxVal) * innerH;
    return { x, y, ...d };
  });

  const polyline = pts.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="analytics-svg" preserveAspectRatio="xMidYMid meet">
      {/* Y grid + labels */}
      {yTicks.map((t) => {
        const y = padT + innerH - (t / maxVal) * innerH;
        return (
          <g key={t}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#e5e7eb" strokeWidth="1" />
            <text x={padL - 6} y={y + 4} textAnchor="end" fontSize="11" fill="#9ca3af">{t}</text>
          </g>
        );
      })}

      {/* Line */}
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />

      {/* Dots */}
      {pts.map((p) => (
        <circle key={p.label} cx={p.x} cy={p.y} r="4.5" fill="#fff" stroke={color} strokeWidth="2.2" />
      ))}

      {/* X labels */}
      {pts.map((p) => (
        <text key={p.label + "l"} x={p.x} y={H - padB + 16} textAnchor="middle" fontSize="11" fill="#6b7280">{p.label}</text>
      ))}

      {/* X axis line */}
      <line x1={padL} y1={padT + innerH} x2={W - padR} y2={padT + innerH} stroke="#e5e7eb" strokeWidth="1" />
    </svg>
  );
}

/** Horizontal bar chart for route performance */
function HBarChart({ data }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="analytics-hbar-list">
      {data.map((d) => (
        <div key={d.label} className="analytics-hbar-row">
          <div className="analytics-hbar-label">{d.label}</div>
          <div className="analytics-hbar-track">
            <div
              className="analytics-hbar-fill"
              style={{ width: `${(d.value / max) * 100}%`, background: d.color || "#3b82f6" }}
            />
          </div>
          <div className="analytics-hbar-value">{d.value.toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}

// ── Data ─────────────────────────────────────────────────────────────────

const weeklyRidership = [
  { label: "Mon", value: 1200 },
  { label: "Tue", value: 1100 },
  { label: "Wed", value: 1380 },
  { label: "Thu", value: 1320 },
  { label: "Fri", value: 1620 },
  { label: "Sat", value: 820 },
  { label: "Sun", value: 560 },
];

const delayHistory = [
  { label: "Mon", value: 5 },
  { label: "Tue", value: 8 },
  { label: "Wed", value: 4 },
  { label: "Thu", value: 12 },
  { label: "Fri", value: 15 },
  { label: "Sat", value: 2 },
  { label: "Sun", value: 1 },
];

const routePerformance = [
  { label: "Malolos – Trinoma", value: 4820, color: "#3b82f6" },
  { label: "Malolos – Cubao",   value: 3940, color: "#38bdf8" },
  { label: "Guimba – Trinoma",  value: 3210, color: "#f5a623" },
  { label: "Guimba – Cubao",    value: 2750, color: "#10b981" },
  { label: "Baliuag – EDSA",    value: 1980, color: "#8b5cf6" },
];

const tripHistory = [
  { bus: "Bus #101", route: "Malolos – Trinoma Route", date: "Apr 18, 2026", time: "07:32 AM", status: "On Time" },
  { bus: "Bus #205", route: "Malolos – Cubao Route",   date: "Apr 18, 2026", time: "08:15 AM", status: "Delayed" },
  { bus: "Bus #312", route: "Guimba – Trinoma Route",  date: "Apr 18, 2026", time: "09:00 AM", status: "On Time" },
  { bus: "Bus #101", route: "Malolos – Trinoma Route", date: "Apr 17, 2026", time: "07:30 AM", status: "On Time" },
  { bus: "Bus #408", route: "Baliuag – EDSA Route",    date: "Apr 17, 2026", time: "10:45 AM", status: "Delayed" },
  { bus: "Bus #205", route: "Malolos – Cubao Route",   date: "Apr 17, 2026", time: "08:20 AM", status: "On Time" },
];

// ── Page component ────────────────────────────────────────────────────────

function Analytics() {
  const [menuOpen, setMenuOpen]                 = useState(false);
  const [activePage, setActivePage]             = useState("Analytics");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications]       = useState([
    { id: 1, message: "Bus #205 is running 15 min late on Cubao route.", time: "5 min ago",  read: false },
    { id: 2, message: "Weekly ridership report is ready.",               time: "1 hr ago",   read: false },
    { id: 3, message: "Bus #312 completed its morning trip.",            time: "2 hrs ago",  read: true  },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="analytics-root">
      {/* Mobile header (< 768 px) */}
      <MobileHeader setMenuOpen={setMenuOpen} />

      <div className="analytics-body">
        {/* Sidebar */}
        <Sidebar
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          activePage={activePage}
          setActivePage={setActivePage}
        />

        {/* Main scrollable area */}
        <div className="analytics-main">
          {/* Top navbar */}
          {/* <AdminNavbar
            showNotifications={showNotifications}
            setShowNotifications={setShowNotifications}
            notifications={notifications}
            setNotifications={setNotifications}
            unreadCount={unreadCount}
          /> */}

          {/* Page content */}
          <div className="analytics-content">

            {/* Weekly Ridership */}
            <div className="analytics-chart-card">
              <div className="analytics-chart-header">
                <div>
                  <div className="analytics-chart-title">Weekly Ridership</div>
                  <div className="analytics-chart-subtitle">April 12 – 18, 2026</div>
                </div>
              </div>
              <div className="analytics-chart-wrap">
                <BarChart data={weeklyRidership} color="#3b82f6" />
              </div>
            </div>

            {/* Delay History */}
            <div className="analytics-chart-card">
              <div className="analytics-chart-header">
                <div>
                  <div className="analytics-chart-title">Delay History</div>
                  <div className="analytics-chart-subtitle">April 12 – 18, 2026</div>
                </div>
              </div>
              <div className="analytics-chart-wrap">
                <LineChart data={delayHistory} color="#f5a623" />
              </div>
            </div>

            {/* Route Performance */}
            <div className="analytics-chart-card">
              <div className="analytics-chart-header">
                <div>
                  <div className="analytics-chart-title">Route Performance</div>
                  <div className="analytics-chart-subtitle">Total riders by route · April 12 – 18, 2026</div>
                </div>
              </div>
              <HBarChart data={routePerformance} />
            </div>

            {/* Trip History */}
            <div className="analytics-chart-card">
              <div className="analytics-chart-header">
                <div className="analytics-chart-title">Trip History</div>
              </div>

              <div className="analytics-trip-list">
                {tripHistory.map((t, i) => (
                  <div key={i} className="analytics-trip-item">
                    <div className="analytics-trip-left">
                      <div className="analytics-trip-bus">{t.bus}</div>
                      <div className="analytics-trip-route">{t.route}</div>
                    </div>
                    <div className="analytics-trip-meta">
                      <div className="analytics-trip-date">{t.date} · {t.time}</div>
                      <span className={`analytics-trip-status ${t.status === "Delayed" ? "delayed" : "ontime"}`}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>{/* /analytics-content */}

          {/* Footer - Using reusable Footer component */}
          <Footer />
        </div>{/* /analytics-main */}
      </div>{/* /analytics-body */}
    </div>
  );
}

export default Analytics;