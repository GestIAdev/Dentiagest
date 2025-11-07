import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apolloClient } from '../graphql/client';
import { GET_ME_QUERY } from '../graphql/queries/auth';
import apollo from '../apollo'; // Para autenticación REST

// Tipos según documentación del backend
interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'professional' | 'assistant' | 'receptionist'; // 🔧 ROLES CORRECTOS DEL BACKEND
  is_active: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  accessToken: string | null;
}

interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Estado inicial
const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  accessToken: null,
};

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider simple
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);

  // Restaurar sesión desde localStorage al cargar
  useEffect(() => {
    const restoreSession = () => {
      const accessToken = localStorage.getItem('accessToken');
      const userStr = localStorage.getItem('user');

      if (accessToken && userStr) {
        try {
          const user = JSON.parse(userStr);
          setState({
            isAuthenticated: true,
            isLoading: false,
            user,
            accessToken,
          });
          
          // Verify token is still valid with backend
          apolloClient.query({ query: GET_ME_QUERY })
            .then((result: any) => {
              if (!result.data?.me) {
                console.log('🔄 Token expired, clearing session');
                logout();
              }
            })
            .catch(() => {
              console.log('🔄 Token validation failed, clearing session');
              logout();
            });
            
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      } else {
        // No stored credentials - go straight to clean state
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // 🚀 REST AUTHENTICATION - Authentication login with FormData (SELENE NODE 1)
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const response = await apollo.api.post('/auth/login', formData);

      if (!response.success || !response.data) {
        setState(prev => ({ ...prev, isLoading: false }));
        return false;
      }

      // Extract tokens from login response
      const loginData = response.data as any;
      const accessToken = loginData.access_token;
      const refreshToken = loginData.refresh_token || '';

      if (!accessToken) {
        setState(prev => ({ ...prev, isLoading: false }));
        return false;
      }

      // 🎯 Store tokens in localStorage so GraphQL can use them
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // 🚀 CREATE BASIC USER INFO FROM LOGIN DATA
      // Since GraphQL schema doesn't have 'me' query, we'll use basic info
      // and fetch full user data later when needed
      const basicUser = {
        id: 'current-user', // Placeholder - will be updated when full data is fetched
        username: email,
        email: email,
        first_name: email.split('@')[0], // Basic name from email
        last_name: '',
        role: 'professional', // Default role - will be updated from actual data
        is_active: true
      };

      // Store basic user data
      localStorage.setItem('user', JSON.stringify(basicUser));

      // Update state with authenticated user (basic info)
      setState({
        isAuthenticated: true,
        isLoading: false,
        user: basicUser,
        accessToken: accessToken,
      });

      return true;

    } catch (error) {
      console.error('Login error:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    // Clear Apollo cache on logout
    apolloClient.clearStore();
    setState(initialState);
  };

  return (
    <AuthContext.Provider
      value={{
        state,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

