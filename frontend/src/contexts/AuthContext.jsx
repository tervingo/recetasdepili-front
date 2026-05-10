import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    localStorage.removeItem('token');
    const token = sessionStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        setIsAdmin(tokenData.is_admin || false);
        setUser({ username: tokenData.sub });
      } catch {
        sessionStorage.removeItem('token');
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUser(null);
      }
    }
  }, []);

  const login = async (formData) => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');

    const response = await axiosInstance.post('/token', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const { access_token } = response.data;
    sessionStorage.setItem('token', access_token);

    const tokenData = JSON.parse(atob(access_token.split('.')[1]));
    setIsAdmin(tokenData.is_admin || false);
    setIsAuthenticated(true);
    setUser({ username: tokenData.sub });
    return true;
  };

  const logout = (navigate) => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUser(null);
    if (navigate) navigate('/');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  return context;
};
