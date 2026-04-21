import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SecretCodeSignup from './SecretCodeSignup';

function ProtectedSignupRoute() {
  const { pendingGoogleData } = useAuth();

  if (!pendingGoogleData) {
    // No pending Google data - redirect back to login
    return <Navigate to="/login" replace />;
  }

  // User has pending Google data - show signup form
  return <SecretCodeSignup />;
}

export default ProtectedSignupRoute;