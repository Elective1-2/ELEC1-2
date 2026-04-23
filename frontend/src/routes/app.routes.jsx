import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';  
import ProtectedSignupRoute from '../hooks/ProtectedSignupRoute';

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

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, token } = useAuth();
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function AppRoutes() {
  console.log('AppRoutes rendering');
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup-secret" element={<ProtectedSignupRoute />} />

      <Route path="/about-us" element={<Aboutus />} />
      <Route path="/" element={<LandingPage />} />

      <Route path="/passenger" element={<Passenger />} />
      <Route path="/schedule" element={<Schedule />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={['admin']}>
        <M2BDashboard />
        </ProtectedRoute>
      } />
      <Route path="/analytics" element={
        <ProtectedRoute allowedRoles={['admin']}>
        <Analytics />
        </ProtectedRoute>
      } />
      
      <Route path="/management" element={
        <ProtectedRoute allowedRoles={['admin']}>
        <Management />
        </ProtectedRoute>
      } />

      <Route path="/tracking" element={
        <ProtectedRoute allowedRoles={['admin']}>
        <Tracking />
        </ProtectedRoute>
      } />
      
      <Route path="/driver" element={
        <ProtectedRoute allowedRoles={['driver']}>
          <DriverMain />
        </ProtectedRoute>
      } />
      <Route path="/driver/map/:tripId" element={
        <ProtectedRoute allowedRoles={['driver']}>
          <DriverMap />
        </ProtectedRoute>
      } />

      <Route path="/drivermap" element={<Navigate to="/driver" replace />} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;