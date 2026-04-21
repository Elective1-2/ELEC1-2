import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import "../css/Signup.css";
import { API_BASE } from '../config/api';

function SecretCodeSignup() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSecretCode, setShowSecretCode] = useState(false);
  const [secretCode, setSecretCode] = useState("");
  const [googleData, setGoogleData] = useState(null);

  // Extract Google data from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const email = params.get("email");
    const googleSub = params.get("google_sub");
    const name = params.get("name");
    const verified = params.get("verified") === "true";

    if (email && googleSub) {
      setGoogleData({
        googleSub: googleSub,
        email: email,
        fullName: name || "",
        isEmailVerified: verified,
      });
    } else {
      // No Google data, redirect to login
      navigate("/login");
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!secretCode.trim()) {
      setError("Please enter the secret code");
      return;
    }

    if (!googleData) {
      setError("Session expired. Please login again.");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/auth/verify-secret`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secretCode: secretCode,
          googleData: googleData,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Account created successfully
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect based on role
        if (data.user.role === 'admin') {
          navigate('/management');
        } else if (data.user.role === 'driver') {
          navigate('/tracking');
        } else {
          navigate('/passenger');
        }
      } else {
        setError(data.error || 'Signup failed. Check your secret code.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking Google data
  if (!googleData) {
    return (
      <div className="signup-root">
        <div className="signup-page">
          <div className="signup-card">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="signup-root">
      <div className="signup-page">
        <div className="signup-card">
          <h1 className="signup-card-title">COMPLETE SIGNUP</h1>
          
          <p className="signup-subtitle">
            Welcome, <strong>{googleData.fullName}</strong> ({googleData.email})
          </p>
          <p className="signup-instruction">
            Please enter the administrator-provided secret code to complete your registration.
          </p>

          {error && (
            <div className="signup-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="signup-input-wrap">
              <input
                type={showSecretCode ? "text" : "password"}
                placeholder="Enter secret code"
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
                className="signup-input"
                autoFocus
                disabled={loading}
              />
              <button 
                type="button"
                className="signup-eye-btn" 
                onClick={() => setShowSecretCode(!showSecretCode)}
              >
                {showSecretCode ? "🙈" : "👁"}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="signup-submit-btn"
            >
              {loading ? "Verifying..." : "COMPLETE SIGNUP"}
            </button>

            <div className="signup-footer">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="signup-link"
              >
                ← Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SecretCodeSignup;