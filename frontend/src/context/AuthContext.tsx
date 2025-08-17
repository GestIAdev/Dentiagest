import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apollo from '../apollo.ts'; // 🚀 APOLLO NUCLEAR - WEBPACK EXTENSION EXPLICIT!

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
  refreshToken: string | null;
}

interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshAccessToken: () => Promise<boolean>;
}

// Estado inicial
const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  accessToken: null,
  refreshToken: null,
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
      const refreshToken = localStorage.getItem('refreshToken');
      const userStr = localStorage.getItem('user');

      if (accessToken && refreshToken && userStr) {
        try {
          const user = JSON.parse(userStr);
          setState({
            isAuthenticated: true,
            isLoading: false,
            user,
            accessToken,
            refreshToken,
          });
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // 🚀 APOLLO API - Authentication login with FormData
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      
      const response = await apollo.api.post('/auth/login', formData);

      if (!response.success || !response.data) {
        throw new Error('Login failed');
      }

      // 🚀 APOLLO API - Get user info after login
      const userResponse = await apollo.api.get('/auth/me');

      if (response.success && response.data) {
        const userData = response.data as any;

        // Mapear rol 'dentist' a 'professional' para backend
        if (userData.role === 'dentist') {
          userData.role = 'professional';
        }
        
        // Almacenar en localStorage
        localStorage.setItem('accessToken', (response.data as any).access_token);
        localStorage.setItem('refreshToken', (response.data as any).refresh_token || '');
        localStorage.setItem('user', JSON.stringify(userData));

        setState({
          isAuthenticated: true,
          isLoading: false,
          user: userData as any,
          accessToken: (response.data as any).access_token,
          refreshToken: (response.data as any).refresh_token || '',
        });

        return true;
      }
    } catch (error) {
      console.error('Login error:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setState(initialState);
  };

  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        return false;
      }

      // 🚀 APOLLO API - Refresh access token
      const response = await apollo.api.post('/auth/refresh', {}, {
        requiresAuth: false,
        headers: {
          'Authorization': `Bearer ${refreshToken}`
        }
      });

      if (!response.success || !response.data) {
        logout();
        return false;
      }

      localStorage.setItem('accessToken', response.data.access_token);

      setState(prev => ({
        ...prev,
        accessToken: response.data.access_token,
      }));

      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        state,
        login,
        logout,
        refreshAccessToken,
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
