import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function SecretCodeSignup() {
  const { completeSignup, pendingGoogleData, loading } = useAuth();
  const [secretCode, setSecretCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!secretCode.trim()) {
      alert('Please enter the secret code');
      return;
    }

    setIsSubmitting(true);
    const success = await completeSignup(secretCode);
    setIsSubmitting(false);

    if (success) {
      navigate('/dashboard');
    }
  };

  if (!pendingGoogleData) {
    return (
      <div className="signup-container">
        <div className="signup-card">
          <h2>Session Expired</h2>
          <p>Please go back and try logging in with Google again.</p>
          <button onClick={() => navigate('/login')}>Back to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2>Complete Your Account Setup</h2>
        <p className="signup-email">
          Welcome, <strong>{pendingGoogleData.fullName}</strong> ({pendingGoogleData.email})
        </p>
        <p className="signup-instruction">
          Please enter the administrator-provided secret code to complete your registration.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Enter secret code"
            value={secretCode}
            onChange={(e) => setSecretCode(e.target.value)}
            disabled={isSubmitting || loading}
            autoFocus
          />
          <button type="submit" disabled={isSubmitting || loading}>
            {isSubmitting ? 'Verifying...' : 'Complete Signup'}
          </button>
        </form>
        <small>
          Don't have a secret code? Contact your system administrator.
        </small>
      </div>
    </div>
  );
}

export default SecretCodeSignup;