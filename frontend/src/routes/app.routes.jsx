import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';  // ← Removed AuthProvider

//? Hooks
import SecretCodeSignup from '../hooks/SecretCodeSignup';

//? Pages
import Aboutus from '../pages/Aboutus';
import LandingPage from '../pages/LandingPage';
import Login from '../pages/Login';
import Passenger from '../pages/passenger';
import Schedule from '../pages/Schedule';
import Tracking from '../pages/Tracking';

//* Protected
import Analytics from '../pages/analytics';
import M2BDashboard from '../pages/dashboard';
import Management from '../pages/management';

//? Test
import GoogleAuthTest from '../pages/test/GoogleAuthTest';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles.length && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
};

function AppRoutes() {
  console.log('AppRoutes rendering');
  return (
    <Routes>
      {/* Logins */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup-secret" element={<SecretCodeSignup />} />

      {/* Infos */}
      <Route path='/about-us' element={<Aboutus />} />
      <Route path='/M2B' element={<LandingPage />} />

      <Route path='/passenger' element={<Passenger />} />
      <Route path='/schedule' element={<Schedule />} />

      <Route 
        path='/tracking' 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Tracking />
          </ProtectedRoute>
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
          <ProtectedRoute allowedRoles={['admin']}>
            <Management />
          </ProtectedRoute>
        }
      />

      {/* Test route - accessible without auth */}
      <Route path="/test-auth" element={<GoogleAuthTest />} />
      
      <Route path="/" element={<Navigate to="/M2B" replace />} />
    </Routes>
  );
}

export default AppRoutes;