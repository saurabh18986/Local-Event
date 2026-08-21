import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { io } from 'socket.io-client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Initialise socket when logged in
  useEffect(() => {
    if (token && user) {
      const s = io(window.location.origin, { auth: { token } });
      s.emit('join_user_room', user._id);
      s.on('rsvp_notification', (data) => {
        setNotifications((prev) => [data, ...prev]);
      });
      setSocket(s);
      return () => s.disconnect();
    }
  }, [token, user]);

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setSocket(null);
    setNotifications([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const clearNotification = (idx) => setNotifications((prev) => prev.filter((_, i) => i !== idx));

  return (
    <AuthContext.Provider value={{ user, token, loading, socket, notifications, login, register, logout, clearNotification }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
