// todo: Fix delayed Google auth button
// todo: Modify Database and login to let user's sign up without google (Priority: low)

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/menu/Navbar';
import "../css/Login.css";

function Login() {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
  const { login } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  
  const googleInitialized = useRef(false);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
      }
    } catch (error) {
      setBackendStatus('offline');
    }
  };

  const handleGoogleResponse = async (response) => {
    console.log('🔵 [1] Google response received');
    setLoading(true);
    setError("");

    try {
      console.log('🔵 [2] Sending token to backend...');
      const result = await login(response.credential);
      console.log('🔵 [3] Login result:', result);

      if (result.success) {
        console.log('🔵 [4] Login successful, user role:', result.user.role);
        
        if (result.user.role === 'admin') {
          navigate('/dashboard');
        } else if (result.user.role === 'driver') {
          navigate('/drivermain');
        } else {
          navigate('/passenger');
        }
      } else if (result.needsSignup) {
        console.log('🔵 [5] New user detected, redirecting to signup');
        
        // ✅ Build URL with Google data
        const params = new URLSearchParams({
          email: result.googleData.email,
          google_sub: result.googleData.googleSub,
          name: result.googleData.fullName || '',
          verified: result.googleData.isEmailVerified ? 'true' : 'false'
        });
        
        const redirectUrl = `/signup-secret?${params.toString()}`;
        console.log('🔵 [6] Redirecting to:', redirectUrl);
        
        navigate(redirectUrl);
      } else {
        console.log('🔴 Login failed:', result.error);
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('🔴 Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (scriptLoaded.current) return;
    scriptLoaded.current = true;

    const initGoogle = () => {
      if (googleInitialized.current) return;
      
      if (window.google?.accounts?.id) {
        googleInitialized.current = true;
        console.log('✅ Initializing Google Sign-In');
        
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          auto_select: false,
        });
        
        const buttonDiv = document.getElementById('googleSignInButton');
        if (buttonDiv) {
          buttonDiv.innerHTML = '';
          window.google.accounts.id.renderButton(buttonDiv, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            text: 'signin_with',
          });
        }
      } else {
        setTimeout(initGoogle, 100);
      }
    };

    if (!document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGoogle;
      document.body.appendChild(script);
    } else {
      initGoogle();
    }

    return () => {
      const buttonDiv = document.getElementById('googleSignInButton');
      if (buttonDiv) buttonDiv.innerHTML = '';
      googleInitialized.current = false;
    };
  }, []);

  return (
    <div className="login-root">
      <Navbar />
      <div className="login-page">
        <div className="login-card">
          <h1 className="login-card-title">LOGIN</h1>

          {/* !Test */}
          {/* <div style={{ marginBottom: '20px', fontSize: '12px', textAlign: 'center' }}>
            Backend: {backendStatus === 'online' ? '✅ Online' : backendStatus === 'checking' ? '⏳ Checking...' : '❌ Offline'}
          </div> */}

          {error && <div className="login-error">{error}</div>}

          {/* todo: Signin button is delayed cause of usestate  */}
          <div id="googleSignInButton" style={{ display: 'flex', justifyContent: 'center' }}></div>
          

          {loading && <p style={{ textAlign: 'center', marginTop: '20px' }}>Loading...</p>}
        </div>
      </div>
    </div>
  );
}

export default Login;