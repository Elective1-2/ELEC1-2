import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../css/Login.css";

function Login() {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const res = await fetch(`${API_URL.replace('/api', '')}/health`);
      if (res.ok) {
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
      }
    } catch (error) {
      setBackendStatus('offline');
    }
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const initGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('googleSignInButton'),
          { theme: 'outline', size: 'large' }
        );
      } else {
        setTimeout(initGoogle, 100);
      }
    };
    
    const timer = setTimeout(initGoogle, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleGoogleResponse = async (response) => {
    setLoading(true);
    setError("");

    try {
      console.log('1. Sending token to backend...');
      
      const res = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: response.credential }),
      });

      const data = await res.json();
      console.log('2. Backend response:', data);

      if (data.token) {
        console.log('3. Token received, saving to localStorage');
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log('4. User role:', data.user.role);
        
        // Redirect based on role
        if (data.user.role === 'admin') {
          if (data.user.role === 'admin') {
            console.log('5. Redirecting to /management');
            try {
              setTimeout(() => {
                navigate('/management');
              }, 100);
              console.log('6. Navigate called successfully');
            } catch (err) {
              console.error('Navigate error:', err);
            }
          }
        } else if (data.user.role === 'driver') {
          console.log('5. Redirecting to /tracking');
          navigate('/tracking');
        } else {
          console.log('5. Redirecting to /passenger');
          navigate('/passenger');
        }
      } else if (data.needsSignup) {
        console.log('User not found, redirecting to signup');
        const params = new URLSearchParams({
          email: data.googleData.email,
          google_sub: data.googleData.googleSub,
          name: data.googleData.fullName,
          verified: data.googleData.isEmailVerified
        });
        navigate(`/signup-secret?${params.toString()}`);
      } else {
        console.log('Login failed:', data.error);
        setError(data.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <div className="login-page">
        <div className="login-card">
          <h1 className="login-card-title">LOGIN</h1>

          <div style={{ marginBottom: '20px', fontSize: '12px', textAlign: 'center' }}>
            Backend: {backendStatus === 'online' ? '✅ Online' : '❌ Offline'}
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <div id="googleSignInButton"></div>
          
          {loading && <p style={{ textAlign: 'center', marginTop: '20px' }}>Loading...</p>}
        </div>
      </div>
    </div>
  );
}

export default Login;