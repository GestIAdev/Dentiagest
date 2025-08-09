// Simple test AuthContext
import React from 'react';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export const useAuth = () => {
  return {
    state: { isAuthenticated: false, isLoading: false, user: null },
    login: async () => false,
    logout: () => {},
    refreshAccessToken: async () => false
  };
};
