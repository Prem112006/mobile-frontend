import { API_BASE_URL } from '../config';
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalType, setAuthModalType] = useState('login'); // 'login' | 'register'
  const [googleClientId, setGoogleClientId] = useState(null);

  useEffect(() => {
    // Check for tokens on mount
    const storedUser = localStorage.getItem('user');
    const storedAdmin = localStorage.getItem('admin');

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.email === 'premkardani2006@gmail.com') {
        setAdmin({ ...parsedUser, isAdmin: true });
      }
    }
    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/auth/google/config`)
      .then(res => res.json())
      .then(data => {
        if (data.googleClientId) {
          setGoogleClientId(data.googleClientId);
        }
      })
      .catch(err => console.error('Failed to fetch Google config:', err));
  }, []);

  const loginUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (userData.email === 'premkardani2006@gmail.com') {
      const adminData = { ...userData, isAdmin: true };
      setAdmin(adminData);
      localStorage.setItem('admin', JSON.stringify(adminData));
    }
  };

  const logoutUser = () => {
    const isSpecialAdmin = user && user.email === 'premkardani2006@gmail.com';
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    if (isSpecialAdmin) {
      setAdmin(null);
      localStorage.removeItem('admin');
    }
  };

  const loginAdmin = (adminData) => {
    setAdmin(adminData);
    localStorage.setItem('admin', JSON.stringify(adminData));
  };

  const logoutAdmin = () => {
    setAdmin(null);
    localStorage.removeItem('admin');
  };

  const openAuthModal = (type = 'login') => {
    console.log('openAuthModal executing for type:', type);
    setAuthModalType(type);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    console.log('closeAuthModal executing');
    setAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        loading,
        loginUser,
        logoutUser,
        loginAdmin,
        logoutAdmin,
        setUser,
        authModalOpen,
        authModalType,
        openAuthModal,
        closeAuthModal,
        setAuthModalType,
        googleClientId
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
