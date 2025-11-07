import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apolloClient } from '../graphql/client';
import { LOGIN_MUTATION, LOGOUT_MUTATION, ME_QUERY } from '../graphql/mutations/auth';

// 🔥 V3 AUTH TYPES - VERITAS INTEGRATED
// Updated to match GraphQL schema UserRole enum
interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  role: 'ADMIN' | 'DENTIST' | 'RECEPTIONIST' | 'PATIENT';
  isActive: boolean;
  lastLoginAt?: string;
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
  logout: () => Promise<void>;
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

// Provider V3 - Pure GraphQL
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);

  // 🔄 Restore session from localStorage on mount
  useEffect(() => {
    const restoreSession = async () => {
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
          
          // 🎯 Verify token with ME query (V3)
          try {
            const result = await apolloClient.query({ 
              query: ME_QUERY,
              fetchPolicy: 'network-only' // Always check server
            });
            
            if (!result.data?.me) {
              console.log('🔄 Token expired, clearing session');
              await logout();
            } else {
              // Update user data with fresh data from server
              const freshUser = result.data.me;
              localStorage.setItem('user', JSON.stringify(freshUser));
              setState(prev => ({ ...prev, user: freshUser }));
            }
          } catch (error) {
            console.log('🔄 Token validation failed, clearing session');
            await logout();
          }
            
        } catch (error) {
          console.error('❌ Error parsing stored user data:', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    restoreSession();
  }, []);

  // 🚀 V3 LOGIN - GraphQL Mutation with Veritas validation
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Execute LOGIN mutation (V3)
      const result = await apolloClient.mutate({
        mutation: LOGIN_MUTATION,
        variables: {
          input: {
            email,
            password
          }
        }
      });

      if (!result.data?.login) {
        console.error('❌ Login mutation returned no data');
        setState(prev => ({ ...prev, isLoading: false }));
        return false;
      }

      const { accessToken, refreshToken, user, expiresIn } = result.data.login;

      if (!accessToken || !user) {
        console.error('❌ Login response missing tokens or user');
        setState(prev => ({ ...prev, isLoading: false }));
        return false;
      }

      // 🎯 Store tokens in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      console.log('✅ Login successful:', {
        userId: user.id,
        role: user.role,
        expiresIn: `${expiresIn}s`
      });

      // Update state with authenticated user
      setState({
        isAuthenticated: true,
        isLoading: false,
        user,
        accessToken,
      });

      return true;

    } catch (error: any) {
      console.error('❌ Login error:', error);
      
      // GraphQL errors contain useful info
      if (error.graphQLErrors) {
        error.graphQLErrors.forEach((err: any) => {
          console.error('GraphQL Error:', err.message);
        });
      }
      
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  // 🔥 V3 LOGOUT - GraphQL Mutation with server-side token invalidation
  const logout = async (): Promise<void> => {
    try {
      // Call logout mutation to invalidate tokens server-side
      await apolloClient.mutate({
        mutation: LOGOUT_MUTATION
      });
    } catch (error) {
      console.error('❌ Logout mutation error:', error);
      // Continue with client-side cleanup even if server fails
    }

    // Clear localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Clear Apollo cache
    await apolloClient.clearStore();
    
    // Reset state
    setState(initialState);
    
    console.log('✅ Logged out successfully');
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


