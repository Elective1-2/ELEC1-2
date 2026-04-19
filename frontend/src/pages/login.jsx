import React from 'react';
import { useAuth } from '../context/AuthContext';

function Login() {
  const { googleLogin, loading } = useAuth();

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>M2B Bus Tracker</h1>
        <p>Sign in to access the driver/admin portal</p>
        <button 
          onClick={googleLogin} 
          disabled={loading}
          className="google-login-btn"
        >
          <img src="/google-icon.svg" alt="Google" />
          Sign in with Google
        </button>
        <small>Only authorized personnel can create an account.</small>
      </div>
    </div>
  );
}

export default Login;