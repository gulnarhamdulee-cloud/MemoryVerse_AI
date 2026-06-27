import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../utils/firebase';

const AuthContext = createContext(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Synchronize Axios default headers when token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
      setIsAuthenticated(true);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUser(null);
    }
  }, [token]);

  // Validate active token on startup
  useEffect(() => {
    const initAuth = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${API_URL}/api/auth/me`);
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (err) {
        // Token is invalid/expired
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      const { access_token, user: userData } = response.data;
      setToken(access_token);
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Sign in failed. Check credentials.';
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, { name, email, password });
      const { access_token, user: userData } = response.data;
      setToken(access_token);
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Registration failed. Check inputs.';
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const response = await axios.post(`${API_URL}/api/auth/google`, {
        id_token: idToken,
        email: result.user.email,
        name: result.user.displayName || 'Google User'
      });
      const { access_token, user: userData } = response.data;
      setToken(access_token);
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Google Sign In failed.';
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/logout`);
    } catch (err) {
      // Ignore failures on logout API, clear state regardless
    } finally {
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  const updateProfile = async (name) => {
    try {
      const response = await axios.put(`${API_URL}/api/auth/profile?name=${encodeURIComponent(name)}`);
      setUser(response.data);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to update profile name.';
      throw new Error(errorMsg);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, register, loginWithGoogle, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
