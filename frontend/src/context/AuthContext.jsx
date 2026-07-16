import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('shahi_poshak_token'));
  const [loading, setLoading] = useState(true);

  // Setup Axios defaults when token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('shahi_poshak_token', token);
      
      // Fetch user profile
      axios.get(`${API_BASE_URL}/api/auth/me`)
        .then(response => {
          setUser(response.data.user);
          setLoading(false);
        })
        .catch(err => {
          console.error('Invalid token or server down', err);
          logout();
          setLoading(false);
        });
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('shahi_poshak_token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const login = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('shahi_poshak_token');
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAdmin: user?.role === 'Admin',
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
