import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';  // ← Removed AuthProvider
import ProtectedSignupRoute from '../hooks/ProtectedSignupRoute';
//? Hooks

//? Pages
import Aboutus from '../pages/Aboutus';
import LandingPage from '../pages/LandingPage';
import Login from '../pages/Login';
import Passenger from '../pages/passenger';
import Schedule from '../pages/Schedule';
import Analytics from '../pages/analytics';
import M2BDashboard from '../pages/dashboard';
import Management from '../pages/management';
import DriverMap from '../pages/drivermap';
import DriverMain from '../pages/drivermain';
import UserTracking from '../pages/Tracking';
import Tracking from '../pages/Tracking';

function AppRoutes() {
  console.log('AppRoutes rendering');
  return (
    <Routes>
      {/* Logins */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup-secret" element={<ProtectedSignupRoute />} />

      {/* Infos */}
      <Route path="/about-us" element={<Aboutus />} />
      <Route path="/" element={<LandingPage />} />

      {/* Main Pages - All Accessible */}
      <Route path="/passenger" element={<Passenger />} />
      <Route path="/schedule" element={<Schedule />} />
      <Route path="/dashboard" element={<M2BDashboard />} />
      <Route path="/tracking" element={<UserTracking />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/management" element={<Management />} />
      <Route path="/drivermap" element={<DriverMap/>} />
      <Route path="/drivermain" element={<DriverMain/>} />
      <Route path="/tracking" element={<Tracking />} />

      <Route
        path="/analytics"
        element={
            <Analytics />
        }
      />

      <Route 
        path='/management' 
        element={
            <Management />
        }
      />

      
      <Route path="/" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;