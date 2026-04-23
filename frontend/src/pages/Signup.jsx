import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import "../css/Signup.css";

function SecretCodeSignup() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSecretCode, setShowSecretCode] = useState(false);
  const [secretCode, setSecretCode] = useState("");
  const [googleData, setGoogleData] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const email = params.get("email");
    const googleSub = params.get("google_sub");
    const name = params.get("name");
    const verified = params.get("verified") === "true";

    console.log('URL Params:', { email, googleSub, name, verified });

    if (email && googleSub) {
      setGoogleData({
        googleSub: googleSub,
        email: email,
        fullName: name || "",
        isEmailVerified: verified,
      });
    } else {
      console.error('Missing required Google data, redirecting to login');
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
      console.log('Sending verification request...');
      
      const res = await fetch(`${API_URL}/auth/verify-secret`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secretCode: secretCode,
          googleData: googleData,
        }),
      });

      const data = await res.json();
      console.log('Backend response:', { status: res.status, data });

      if (res.ok && data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log('Signup successful! Redirecting...');

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
          <p className="signup-hint" style={{ fontSize: '12px', color: '#666', marginBottom: '20px' }}>
             Default secret code: <code style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: '4px' }}>M2B2024</code>
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
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
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