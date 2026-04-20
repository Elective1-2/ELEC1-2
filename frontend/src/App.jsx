import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import SecretCodeSignup from './hooks/SecretCodeSignup';
// import Dashboard from './pages/Dashboard';
// import Tracking from './pages/Tracking';
import GoogleAuthTest from './pages/test/GoogleAuthTest';  // ← Import test page

// Protected route wrapper
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
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup-secret" element={<SecretCodeSignup />} />
      
      {/* Test route - accessible without auth */}
      <Route path="/test-auth" element={<GoogleAuthTest />} />
      
      {/* <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'driver']}>
            <Dashboard />
          </ProtectedRoute>
        } 
      /> */}
      {/* <Route 
        path="/tracking" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'driver']}>
            <Tracking />
          </ProtectedRoute>
        } 
      /> */}
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;