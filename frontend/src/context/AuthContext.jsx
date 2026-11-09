import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

// Optional development UI preview user (strictly disabled in production builds)
const PREVIEW_USER = {
  id: 'usr_preview_01',
  fullName: 'Muhammad Usman (Preview)',
  email: 'usman.preview@example.com',
  phone: '03001234567',
  defaultCity: 'Lahore',
  defaultAddress: 'Model Town, Block C',
};

export function AuthProvider({ children }) {
  // Check if preview mode is explicitly enabled in dev mode
  const isPreviewEnabled =
    import.meta.env.DEV && import.meta.env.VITE_ACCOUNT_UI_PREVIEW === 'true';

  const [user, setUser] = useState(isPreviewEnabled ? PREVIEW_USER : null);
  const [status, setStatus] = useState(isPreviewEnabled ? 'authenticated' : 'unauthenticated');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isPreviewEnabled) return;

    let isMounted = true;
    authService
      .getCurrentUser()
      .then((data) => {
        if (isMounted && data?.user) {
          setUser(data.user);
          setStatus('authenticated');
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null);
          setStatus('unauthenticated');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isPreviewEnabled]);

  const clearError = () => setError(null);

  const login = async (credentials) => {
    setError(null);
    try {
      const res = await authService.login(credentials);
      if (res?.user) {
        setUser(res.user);
        setStatus('authenticated');
      }
      return res;
    } catch (err) {
      const message =
        err?.message || 'Unable to log in. Please check your credentials or network connection.';
      setError(message);
      throw err;
    }
  };

  const register = async (payload) => {
    setError(null);
    try {
      const res = await authService.register(payload);
      if (res?.user) {
        setUser(res.user);
        setStatus('authenticated');
      }
      return res;
    } catch (err) {
      const message =
        err?.message || 'Unable to register. Please check your details or network connection.';
      setError(message);
      throw err;
    }
  };

  const logout = async () => {
    setError(null);
    setUser(null);
    setStatus('unauthenticated');
    try {
      await authService.logout();
    } catch {
      // In Phase 7, reset state cleanly without throwing
    }
  };

  const value = {
    user,
    status,
    isAuthenticated: status === 'authenticated' && user !== null,
    isUiPreview: isPreviewEnabled,
    login,
    register,
    logout,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      status: 'unauthenticated',
      isAuthenticated: false,
      isUiPreview: false,
      login: async () => {},
      register: async () => {},
      logout: async () => {},
      error: null,
      clearError: () => {},
    };
  }
  return context;
}
