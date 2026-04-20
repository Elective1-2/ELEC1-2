import React from 'react';
import Navbar from "../components/NavBar"; 
import '../css/Schedule.css';

// Import the map background image
import heroImage from '../assets/herohome.png'; 

function Schedule() {
  // Dummy data for the schedule table
  const scheduleData = [
    { id: 1, destination: "Malolos", time: "04:00 AM", remarks: "Departed" },
    { id: 2, destination: "Guiguinto", time: "04:30 AM", remarks: "Departed" },
    { id: 3, destination: "Pandi", time: "05:00 AM", remarks: "Departed" },
    { id: 4, destination: "Santa Maria", time: "05:30 AM", remarks: "Departed" },
    { id: 5, destination: "Bocaue", time: "06:00 AM", remarks: "Departed" },
    { id: 6, destination: "Balagtas", time: "06:30 AM", remarks: "Departed" },
    { id: 7, destination: "Malolos", time: "07:00 AM", remarks: "Departed" },
    { id: 8, destination: "Guiguinto", time: "07:30 AM", remarks: "Departed" },
    { id: 9, destination: "Pandi", time: "08:00 AM", remarks: "Departed" },
    { id: 10, destination: "Santa Maria", time: "08:30 AM", remarks: "Departed" },
    { id: 11, destination: "Bocaue", time: "09:00 AM", remarks: "Departed" },
    { id: 12, destination: "Balagtas", time: "09:30 AM", remarks: "Departed" },
  ];

  return (
    <div className="schedule-page">
      {/* Navigation Bar */}
      <Navbar />


      {/* Banner Section */}
      <div 
        className="banner-section"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <h1 className="banner-title">SCHEDULE</h1>
      </div>

      {/* Main Content Section */}
      <div className="schedule-content">
        
        {/* Dropdown Selector */}
        <div className="dropdown-container">
          <select className="station-select" defaultValue="default">
            <option value="default" disabled>Select Station</option>
            <option value="trinoma">Trinoma</option>
            <option value="malolos">Malolos</option>
            <option value="bocaue">Bocaue</option>
          </select>
        </div>

        {/* Schedule Table Card */}
        <div className="table-card">
          <h2 className="table-title">TRINOMA</h2>
          
          <div className="table-responsive">
            <table className="schedule-table">
              <thead>
                <tr>
                  <th>Destination</th>
                  <th>Departure Time</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {scheduleData.map((row) => (
                  <tr key={row.id}>
                    <td>{row.destination}</td>
                    <td>{row.time}</td>
                    <td className="remarks-text">{row.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Custom Footer */}
      <footer className="simple-footer">
        <p>© 2026, M2B. Developed by BSCpE Students, Bulacan State University.</p>
      </footer>
    </div>
  );
}

export default Schedule;