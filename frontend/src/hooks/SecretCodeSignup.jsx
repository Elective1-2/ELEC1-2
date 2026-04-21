import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import "../css/Signup.css";

function SecretCodeSignup() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [googleData, setGoogleData] = useState(null);
  const [adminEmailMasked, setAdminEmailMasked] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const email = params.get("email");
    const googleSub = params.get("google_sub");
    const name = params.get("name");
    const verified = params.get("verified") === "true";

    if (email && googleSub) {
      const data = {
        googleSub,
        email,
        fullName: name || "",
        isEmailVerified: verified,
      };
      setGoogleData(data);
      initiateSignup(data);
    } else {
      navigate("/login");
    }
  }, [location, navigate]);

  const initiateSignup = async (data) => {
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch(`${API_URL}/auth/signup/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ googleData: data }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setCodeSent(true);
        setAdminEmailMasked(result.adminEmailMasked);
        setSuccess(`A verification code has been sent to the administrator (${result.adminEmailMasked}). Please enter the code below.`);
      } else {
        setError(result.error || 'Failed to send verification code. Please try again.');
      }
    } catch (error) {
      console.error('Initiate signup error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    if (!verificationCode.trim()) {
      setError("Please enter the verification code");
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
      const res = await fetch(`${API_URL}/auth/signup/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: verificationCode,
          email: googleData.email,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/tracking');
      } else {
        setError(data.error || 'Verification failed. Please check your code.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!googleData || resendDisabled) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_URL}/auth/signup/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: googleData.email }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setSuccess(`A new verification code has been sent to ${result.adminEmailMasked}.`);
        setResendDisabled(true);
        setCountdown(60);
      } else {
        setError(result.error || 'Failed to resend code.');
      }
    } catch (error) {
      console.error('Resend error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);

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
          
          {!codeSent ? (
            <p className="signup-instruction">
              Sending verification request to administrator...
            </p>
          ) : (
            <>
              <p className="signup-instruction">
                Please enter the verification code provided by your administrator.
              </p>
              <p className="signup-admin-hint">
                Code sent to: <strong>{adminEmailMasked}</strong>
              </p>
            </>
          )}

          {error && <div className="signup-error">{error}</div>}
          {success && <div className="signup-success">{success}</div>}

          {codeSent && (
            <form onSubmit={handleVerifyCode}>
              <div className="signup-input-wrap">
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="signup-input"
                  autoFocus
                  disabled={loading}
                  maxLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !verificationCode}
                className="signup-submit-btn"
              >
                {loading ? "Verifying..." : "VERIFY & COMPLETE SIGNUP"}
              </button>

              <div className="signup-footer">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={loading || resendDisabled}
                  className="signup-link"
                >
                  {resendDisabled ? `Resend code (${countdown}s)` : "Resend verification code"}
                </button>
                <span className="signup-separator">|</span>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="signup-link"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default SecretCodeSignup;