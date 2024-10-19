// src/context/AuthContext.js
import React, { createContext, useState } from 'react';

// Create the context
export const AuthContext = createContext();

// Create a provider component
export const AuthProvider = ({ children }) => {
  // State to store the current user and token
  const [authData, setAuthData] = useState({
    token: null,
    user: null,
  });

  // Function to log in and set user data
  const login = (userData, token) => {
    setAuthData({
      token,
      user: userData,
    });
  };

  // Function to log out and clear session data
  const logout = () => {
    setAuthData({
      token: null,
      user: null,
    });
  };

  return (
    <AuthContext.Provider value={{ authData, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
