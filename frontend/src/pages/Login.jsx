import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/menu/NavBar';
import "../css/Login.css";

function Login() {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
  const { login } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  
  const googleInitialized = useRef(false);
  const buttonRendered = useRef(false);

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

  const handleGoogleResponse = useCallback(async (response) => {
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
          navigate('/driver');
        } else {
          navigate('/passenger');
        }
      } else if (result.needsSignup) {
        console.log('🔵 [5] New user detected, redirecting to signup');

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
  }, [login, navigate]);

  useEffect(() => {
    // Reset refs when component mounts (handles React Router navigation)
    googleInitialized.current = false;
    buttonRendered.current = false;

    const initGoogle = () => {
      // Check if already initialized
      if (googleInitialized.current) {
        console.log('⚠️ Google already initialized, skipping');
        return;
      }
      
      if (window.google?.accounts?.id) {
        googleInitialized.current = true;
        console.log('✅ Initializing Google Sign-In');
        
        // Clear any previous listeners
        window.google.accounts.id.cancel();
        
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          auto_select: false,
        });
        
        const buttonDiv = document.getElementById('googleSignInButton');
        if (buttonDiv && !buttonRendered.current) {
          buttonDiv.innerHTML = '';
          window.google.accounts.id.renderButton(buttonDiv, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            text: 'signin_with',
          });
          buttonRendered.current = true;
          console.log('✅ Google button rendered');
        } else {
          console.log('⚠️ Button div not found, retrying...');
          setTimeout(initGoogle, 200);
        }
      } else {
        console.log('⏳ Google API not ready, retrying...');
        setTimeout(initGoogle, 200);
      }
    };

    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    
    if (existingScript) {
      // Script already loaded, wait for it to be ready
      console.log('📜 Google script already exists, waiting for API...');
      const checkReady = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(checkReady);
          initGoogle();
        }
      }, 100);
      
      // Timeout after 5 seconds
      setTimeout(() => clearInterval(checkReady), 5000);
    } else {
      // Load script fresh
      console.log('📜 Loading Google script...');
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('📜 Google script loaded');
        initGoogle();
      };
      script.onerror = () => {
        console.error('🔴 Failed to load Google script');
        setError('Failed to load Google Sign-In. Please refresh the page.');
      };
      document.body.appendChild(script);
    }

    return () => {
      // Cleanup on unmount
      googleInitialized.current = false;
      buttonRendered.current = false;
      const buttonDiv = document.getElementById('googleSignInButton');
      if (buttonDiv) buttonDiv.innerHTML = '';
    };
  }, []); // Empty deps - runs on mount only

  return (
    <div className="login-root">
      <Navbar />
      <div className="login-page">
        <div className="login-card">
          <h1 className="login-card-title">LOGIN</h1>

          {error && <div className="login-error">{error}</div>}

          <div id="googleSignInButton" style={{ display: 'flex', justifyContent: 'center' }}></div>
          
          {loading && <p style={{ textAlign: 'center', marginTop: '20px' }}>Loading...</p>}
        </div>
      </div>
    </div>
  );
}

export default Login;