// src/AuthContext.js
import React, { createContext, useContext } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children, value }) => {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};