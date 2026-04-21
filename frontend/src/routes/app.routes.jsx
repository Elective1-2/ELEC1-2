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
import Tracking from '../pages/Tracking';
import Analytics from '../pages/analytics';
import M2BDashboard from '../pages/dashboard';
import Management from '../pages/management';

function AppRoutes() {
  console.log('AppRoutes rendering');
  return (
    <Routes>
      {/* Logins */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup-secret" element={<ProtectedSignupRoute />} />

      {/* Infos */}
      <Route path="/about-us" element={<Aboutus />} />
      <Route path="/M2B" element={<LandingPage />} />

      {/* Main Pages - All Accessible */}
      <Route path="/passenger" element={<Passenger />} />
      <Route path="/schedule" element={<Schedule />} />
      <Route path="/dashboard" element={<M2BDashboard />} />
      <Route path="/tracking" element={<Tracking />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/management" element={<Management />} />

      <Route 
        path='/tracking' 
        element={
          // <ProtectedRoute allowedRoles={['admin']}>
            <Tracking />
          // </ProtectedRoute>
        } 
      />

      <Route
        path="/analytics"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Analytics />
          </ProtectedRoute>
        }
      />

      <Route 
        path='/management' 
        element={
          // <ProtectedRoute allowedRoles={['admin']}>
            <Management />
          // </ProtectedRoute>
        }
      />

      {/* Test route - accessible without auth */}
      <Route path="/test-auth" element={<GoogleAuthTest />} />
      
      <Route path="/" element={<Navigate to="/M2B" replace />} />
    </Routes>
  );
}

export default AppRoutes;