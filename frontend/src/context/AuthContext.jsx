import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  
  // Store pending Google data for signup flow
  const [pendingGoogleData, setPendingGoogleData] = useState(() => {
    // Try to restore from sessionStorage on page refresh
    const saved = sessionStorage.getItem('pendingGoogleData');
    return saved ? JSON.parse(saved) : null;
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Load user data if token exists
  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Fetch user error:', error);
      logout();
    }
  };

  const login = async (googleToken) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: googleToken }),
      });

      const data = await res.json();

      if (data.token) {
        // Existing user - login successful
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        sessionStorage.removeItem('pendingGoogleData');
        setPendingGoogleData(null);
        return { success: true, user: data.user };
      } else if (data.needsSignup) {
        // New user - store Google data for signup flow
        setPendingGoogleData(data.googleData);
        sessionStorage.setItem('pendingGoogleData', JSON.stringify(data.googleData));
        return { success: false, needsSignup: true, googleData: data.googleData };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  const completeSignup = async (secretCode) => {
    if (!pendingGoogleData) {
      return { success: false, error: 'No pending signup data' };
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secretCode,
          googleData: pendingGoogleData
        }),
      });

      const data = await res.json();

      if (data.success && data.token) {
        // Signup successful - log user in
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        // Clear pending data
        sessionStorage.removeItem('pendingGoogleData');
        setPendingGoogleData(null);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('pendingGoogleData');
    setToken(null);
    setUser(null);
    setPendingGoogleData(null);
  };

  const value = {
    user,
    token,
    loading,
    pendingGoogleData,
    login,
    completeSignup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};