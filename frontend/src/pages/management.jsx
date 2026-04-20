import React, { useState } from "react";
import AdminNavbar from "../components/AdminNavbar";
import MobileHeader from "../components/MobileHeader";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import "../css/management.css";

// ── Placeholder data ──────────────────────────────────────────────────────

const busList = [
  { id: "B-0192", plate: "ABC-1231", route: "Malolos – Manila", capacity: "50 Seaters", driver: "Juan Dela Cruz" },
  { id: "B-0292", plate: "ABC-1232", route: "Malolos – Manila", capacity: "50 Seaters", driver: "Juan Dela Cruz" },
  { id: "B-0293", plate: "ABC-1233", route: "Malolos – Manila", capacity: "50 Seaters", driver: "Juan Dela Cruz" },
  { id: "B-0294", plate: "ABC-1234", route: "Malolos – Manila", capacity: "50 Seaters", driver: "Juan Dela Cruz" },
  { id: "B-0295", plate: "ABC-1235", route: "Malolos – Manila", capacity: "50 Seaters", driver: "Juan Dela Cruz" },
  { id: "B-0296", plate: "ABC-1236", route: "Malolos – Manila", capacity: "50 Seaters", driver: "Juan Dela Cruz" },
  { id: "B-0297", plate: "ABC-1237", route: "Malolos – Manila", capacity: "50 Seaters", driver: "Juan Dela Cruz" },
  { id: "B-0298", plate: "ABC-1238", route: "Malolos – Manila", capacity: "50 Seaters", driver: "Juan Dela Cruz" },
  { id: "B-0299", plate: "ABC-1239", route: "Malolos – Manila", capacity: "50 Seaters", driver: "Juan Dela Cruz" },
  { id: "B-0300", plate: "ABC-1240", route: "Malolos – Manila", capacity: "50 Seaters", driver: "Juan Dela Cruz" },
  { id: "B-0301", plate: "ABC-1241", route: "Malolos – Manila", capacity: "50 Seaters", driver: "Juan Dela Cruz" },
  { id: "B-0302", plate: "ABC-1242", route: "Malolos – Manila", capacity: "50 Seaters", driver: "Juan Dela Cruz" },
  { id: "B-0303", plate: "ABC-1243", route: "Malolos – Manila", capacity: "50 Seaters", driver: "Juan Dela Cruz" },
];

const driverList = [
  { name: "Mario Maurer", bus: "Bus No. 13", route: "Malolos – Manila" },
  { name: "Mario Maurer", bus: "Bus No. 13", route: "Malolos – Manila" },
  { name: "Mario Maurer", bus: "Bus No. 13", route: "Malolos – Manila" },
  { name: "Mario Maurer", bus: "Bus No. 13", route: "Malolos – Manila" },
  { name: "Mario Maurer", bus: "Bus No. 13", route: "Malolos – Manila" },
  { name: "Mario Maurer", bus: "Bus No. 13", route: "Malolos – Manila" },
  { name: "Mario Maurer", bus: "Bus No. 13", route: "Malolos – Manila" },
  { name: "Mario Maurer", bus: "Bus No. 13", route: "Malolos – Manila" },
  { name: "Mario Maurer", bus: "Bus No. 13", route: "Malolos – Manila" },
  { name: "Mario Maurer", bus: "Bus No. 13", route: "Malolos – Manila" },
  { name: "Mario Maurer", bus: "Bus No. 13", route: "Malolos – Manila" },
  { name: "Mario Maurer", bus: "Bus No. 13", route: "Malolos – Manila" },
  { name: "Mario Maurer", bus: "Bus No. 13", route: "Malolos – Manila" },
];

// ── Three-dot icon ────────────────────────────────────────────────────────
function DotsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="3"  r="1.4" fill="#6b7280" />
      <circle cx="8" cy="8"  r="1.4" fill="#6b7280" />
      <circle cx="8" cy="13" r="1.4" fill="#6b7280" />
    </svg>
  );
}

// ── Page component ────────────────────────────────────────────────────────

function Management() {
  const [menuOpen, setMenuOpen]                   = useState(false);
  const [activePage, setActivePage]               = useState("Management");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications]         = useState([
    { id: 1, message: "Bus #205 is running 15 min late on Cubao route.", time: "5 min ago",  read: false },
    { id: 2, message: "New driver assigned to Bus #312.",                time: "1 hr ago",   read: false },
    { id: 3, message: "Bus #101 maintenance scheduled for tomorrow.",    time: "2 hrs ago",  read: true  },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="mgmt-root">
      {/* Mobile header (< 768 px) */}
      <MobileHeader setMenuOpen={setMenuOpen} />

      <div className="mgmt-body">
        {/* Sidebar */}
        <Sidebar
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          activePage={activePage}
          setActivePage={setActivePage}
        />

        {/* Main scrollable column */}
        <div className="mgmt-main">
          {/* Top navbar */}
          <AdminNavbar
            showNotifications={showNotifications}
            setShowNotifications={setShowNotifications}
            notifications={notifications}
            setNotifications={setNotifications}
            unreadCount={unreadCount}
          />

          {/* Page content */}
          <div className="mgmt-content">

            {/* ── List of Buses ── */}
            <div className="mgmt-table-card">
              <div className="mgmt-table-header">
                <span className="mgmt-table-title">List of Buses</span>
                <button className="mgmt-add-btn">+ Add New Bus</button>
              </div>

              {/* Horizontally + vertically scrollable table */}
              <div className="mgmt-table-scroll">
                <table className="mgmt-table">
                  <thead>
                    <tr>
                      <th>Bus ID</th>
                      <th>Plate Number</th>
                      <th>Assigned Route</th>
                      <th>Capacity</th>
                      <th>Assigned Driver</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {busList.map((bus, i) => (
                      <tr key={i}>
                        <td className="mgmt-bold">{bus.id}</td>
                        <td>{bus.plate}</td>
                        <td>{bus.route}</td>
                        <td>{bus.capacity}</td>
                        <td>{bus.driver}</td>
                        <td className="mgmt-action-cell">
                          <button className="mgmt-dots-btn"><DotsIcon /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Drivers ── */}
            <div className="mgmt-table-card">
              <div className="mgmt-table-header">
                <span className="mgmt-table-title">Drivers</span>
                <button className="mgmt-add-btn">+ Add Drivers</button>
              </div>

              <div className="mgmt-table-scroll">
                <table className="mgmt-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Assigned Bus</th>
                      <th>Assigned Route</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {driverList.map((d, i) => (
                      <tr key={i}>
                        <td className="mgmt-bold">{d.name}</td>
                        <td>{d.bus}</td>
                        <td>{d.route}</td>
                        <td className="mgmt-action-cell">
                          <button className="mgmt-dots-btn"><DotsIcon /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>{/* /mgmt-content */}

          {/* Footer - Using reusable Footer component */}
          <Footer />
        </div>{/* /mgmt-main */}
      </div>{/* /mgmt-body */}
    </div>
  );
}

export default Management;