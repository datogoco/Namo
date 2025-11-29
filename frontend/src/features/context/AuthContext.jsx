import React, { createContext, useState, useEffect, useContext } from 'react';
import * as authService from '../../entities/auth/api';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuthed = await authService.checkAuth();
      if (!isAuthed) {
        setUser(null);
      } else {
        const me = await authService.fetchMe();
        if (me?.userId) {
          setUser({ id: me.userId });
        } else if (me?.data?.user) {
          setUser(me.data.user);
        } else {
          setUser({ isAuthenticated: true });
        }
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      if (response.status === 'success') {
        await checkAuth();
        return { success: true };
      }
      return { success: false, message: response.message || 'Login failed' };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore for now
    } finally {
      setUser(null);
    }
  };

  const signup = async (userData) => {
      try {
          const response = await authService.signup(userData);
          if (response.status === 'success') {
              await checkAuth();
              return { success: true };
          }
          // Some responses might be redirects without status property
          return { success: true };
      } catch (error) {
          return { success: false, message: error.response?.data?.message || 'Signup failed' };
      }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, loading, refresh: checkAuth }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
