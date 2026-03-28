import React, { createContext, useContext, useState, useEffect } from 'react';
import { getToken, getUser, isLoggedIn, login as saveLogin, logout as clearLogout } from '../utils/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getUser());
  const [token, setToken] = useState(getToken());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initial check handled by state initialization
  }, [token]);

  const login = (newToken, userData) => {
    saveLogin(newToken, userData);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    clearLogout();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
