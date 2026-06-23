// context/AuthContext.js
'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, blogAPI } from '../config/api';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Initialize auth from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.login(email, password);
      
      if (response.success || response.accessToken) {
        const accessToken = response.accessToken || response.token;
        const userData = response.user;
        
        // Store in localStorage
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('refreshToken', response.refreshToken || '');
        
        setToken(accessToken);
        setUser(userData);
        
        return { success: true, user: userData };
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Register function
  const register = useCallback(async (username, email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.register(username, email, password);
      
      if (response.success || response.data) {
        return { success: true, user: response.data || response.user };
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      if (token) {
        await authAPI.logout(token);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
      
      setToken(null);
      setUser(null);
      router.push('/');
    }
  }, [token, router]);

  // Check if user is authenticated
  const isAuthenticated = !!token && !!user;

  // Get auth headers for API calls
  const getAuthHeaders = useCallback(() => {
    if (!token) return {};
    return {
      'Authorization': `Bearer ${token}`,
    };
  }, [token]);

  // Refresh token function
  const refreshAuthToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await authAPI.refreshToken(refreshToken);
      
      if (response.accessToken) {
        localStorage.setItem('accessToken', response.accessToken);
        setToken(response.accessToken);
        return response.accessToken;
      }
      
      throw new Error('Failed to refresh token');
    } catch (error) {
      console.error('Refresh token error:', error);
      // If refresh fails, logout
      await logout();
      throw error;
    }
  }, [logout]);

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
    getAuthHeaders,
    refreshAuthToken,
    setError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}