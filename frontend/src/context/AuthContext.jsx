import React, { createContext, useContext, useState, useEffect } from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import { API_BASE } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsSignup, setNeedsSignup] = useState(false);
  const [pendingGoogleData, setPendingGoogleData] = useState(null);

  // Check for existing session on load
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      verifyToken(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (storedToken) => {
    try {
      // ✅ UPDATED: Uses API_BASE
      const response = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${storedToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setToken(storedToken);
      } else {
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  // Google Login handler
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // ✅ UPDATED: Uses API_BASE
        const response = await fetch(`${API_BASE}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: tokenResponse.access_token })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          localStorage.setItem('auth_token', data.token);
          setUser(data.user);
          setToken(data.token);
          setNeedsSignup(false);
          setPendingGoogleData(null);
          window.location.href = '/dashboard';
        } else if (response.status === 404 && data.needsSignup) {
          setPendingGoogleData(data.googleData);
          setNeedsSignup(true);
        } else {
          console.error('Login failed:', data.error);
          alert(data.error || 'Login failed');
        }
      } catch (error) {
        console.error('Google auth error:', error);
        alert('Authentication failed. Please try again.');
      }
    },
    onError: () => {
      console.error('Google Login Failed');
      alert('Google login failed. Please try again.');
    }
  });

  // Complete signup with secret code
  const completeSignup = async (secretCode, role = 'driver') => {
    if (!pendingGoogleData) {
      alert('No pending signup data. Please try logging in again.');
      return false;
    }

    try {
      // ✅ UPDATED: Uses API_BASE
      const response = await fetch(`${API_BASE}/api/auth/verify-secret`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secretCode,
          googleData: { ...pendingGoogleData, role }
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('auth_token', data.token);
        setUser(data.user);
        setToken(data.token);
        setNeedsSignup(false);
        setPendingGoogleData(null);
        return true;
      } else {
        alert(data.error || 'Signup failed');
        return false;
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Signup failed. Please try again.');
      return false;
    }
  };

  const logout = () => {
    googleLogout();
    localStorage.removeItem('auth_token');
    setUser(null);
    setToken(null);
    setNeedsSignup(false);
    setPendingGoogleData(null);
    window.location.href = '/login';
  };

  const value = {
    user,
    token,
    loading,
    needsSignup,
    pendingGoogleData,
    googleLogin,
    completeSignup,
    logout,
    isAuthenticated: !!user,
    isDriver: user?.role === 'driver',
    isAdmin: user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};