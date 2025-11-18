import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apolloClient } from '../config/apollo';
import { LOGIN_MUTATION, LOGOUT_MUTATION, REFRESH_TOKEN_MUTATION, type LoginInput, type AuthResponse } from '../graphql/auth';

// ============================================================================
// INTERFACES Y TIPOS - TITAN V3 AUTH SYSTEM
// ============================================================================

export interface PatientAuth {
  patientId: string;
  clinicId: string;
  token: string;
  expiresAt: number;
  isAuthenticated: boolean;
}

export interface AuthState {
  auth: PatientAuth | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (patientId: string, clinicId: string, token: string, expiresIn: number) => void;
  logout: () => void;
  refreshToken: (newToken: string, expiresIn: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Computed
  isTokenExpired: () => boolean;
  timeUntilExpiry: () => number;
}

// ============================================================================
// ZUSTAND STORE - PERSISTENT AUTH STATE
// ============================================================================

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      auth: null,
      isLoading: false,
      error: null,

      login: (patientId: string, clinicId: string, token: string, expiresIn: number) => {
        const expiresAt = Date.now() + (expiresIn * 1000); // Convert to milliseconds

        set({
          auth: {
            patientId,
            clinicId,
            token,
            expiresAt,
            isAuthenticated: true,
          },
          isLoading: false,
          error: null,
        });

        // Store token in localStorage for Apollo Client
        localStorage.setItem('patient_portal_token', token);
      },

      logout: () => {
        set({
          auth: null,
          isLoading: false,
          error: null,
        });

        // Clear token from localStorage
        localStorage.removeItem('patient_portal_token');
      },

      refreshToken: (newToken: string, expiresIn: number) => {
        const currentAuth = get().auth;
        if (!currentAuth) return;

        const expiresAt = Date.now() + (expiresIn * 1000);

        set({
          auth: {
            ...currentAuth,
            token: newToken,
            expiresAt,
          },
          error: null,
        });

        // Update token in localStorage
        localStorage.setItem('patient_portal_token', newToken);
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      setError: (error: string | null) => set({ error }),

      clearError: () => set({ error: null }),

      isTokenExpired: () => {
        const auth = get().auth;
        if (!auth) return true;
        return Date.now() >= auth.expiresAt;
      },

      timeUntilExpiry: () => {
        const auth = get().auth;
        if (!auth) return 0;
        return Math.max(0, auth.expiresAt - Date.now());
      },
    }),
    {
      name: 'patient-portal-auth-v3',
      partialize: (state) => ({
        auth: state.auth,
      }),
    }
  )
);

// ============================================================================
// REAL AUTHENTICATION UTILITIES - SELENE GRAPHQL INTEGRATION
// ============================================================================

/**
 * 🔐 REAL LOGIN - Conecta a Selene Song Core via GraphQL
 * By PunkClaude - Directiva #003 GeminiEnder
 */
export const loginWithCredentials = async (email: string, password: string): Promise<void> => {
  try {
    const { data } = await apolloClient.mutate<{ login: AuthResponse }>({
      mutation: LOGIN_MUTATION,
      variables: {
        input: {
          email,
          password
        } as LoginInput
      }
    });

    if (!data?.login) {
      throw new Error('Invalid response from server');
    }

    const { accessToken, refreshToken, expiresIn, user } = data.login;

    // 🔐 ROLE SEGREGATION: Only PATIENT role can access Patient Portal (3001)
    // If someone with STAFF/DENTIST/ADMIN role tries to login here → redirect to dashboard
    if (user.role !== 'PATIENT') {
      console.warn('❌ Non-patient role tried to access Patient Portal:', user.role);
      // Redirect to staff dashboard instead
      window.location.href = 'http://localhost:3000/login?redirectFrom=patient-portal';
      throw new Error(`${user.role} role cannot access Patient Portal. Redirecting to Staff Dashboard...`);
    }

    // Store in authStore (which persists to localStorage)
    useAuthStore.getState().login(
      user.id,
      'default-clinic', // TODO: Get from user data if available
      accessToken,
      expiresIn
    );

    // Store refresh token separately
    localStorage.setItem('patient_portal_refresh_token', refreshToken);
    
    // Also store role and email for session restoration
    localStorage.setItem('patient_portal_user_role', user.role);
    localStorage.setItem('patient_portal_user_email', user.email);

    console.log('✅ Login successful:', user.email, '(role:', user.role + ')');
  } catch (error) {
    console.error('❌ Login failed:', error);
    useAuthStore.getState().setError(error instanceof Error ? error.message : 'Login failed');
    throw error;
  }
};

/**
 * 🔓 REAL LOGOUT - Calls Selene logout mutation
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await apolloClient.mutate({
      mutation: LOGOUT_MUTATION
    });

    // Clear local storage and auth state
    useAuthStore.getState().logout();
    localStorage.removeItem('patient_portal_refresh_token');

    console.log('✅ Logout successful');
  } catch (error) {
    console.error('❌ Logout error:', error);
    // Even if server logout fails, clear local state
    useAuthStore.getState().logout();
    localStorage.removeItem('patient_portal_refresh_token');
  }
};

/**
 * 🔄 TOKEN REFRESH - Refreshes expired access token
 */
export const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const refreshToken = localStorage.getItem('patient_portal_refresh_token');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const { data } = await apolloClient.mutate<{ refreshToken: AuthResponse }>({
      mutation: REFRESH_TOKEN_MUTATION,
      variables: {
        input: {
          refreshToken
        }
      }
    });

    if (!data?.refreshToken) {
      throw new Error('Invalid refresh response');
    }

    const { accessToken, refreshToken: newRefreshToken, expiresIn, user } = data.refreshToken;

    // Update tokens
    useAuthStore.getState().refreshToken(accessToken, expiresIn);
    localStorage.setItem('patient_portal_refresh_token', newRefreshToken);

    console.log('✅ Token refreshed successfully');
    return true;
  } catch (error) {
    console.error('❌ Token refresh failed:', error);
    // Force logout on refresh failure
    useAuthStore.getState().logout();
    localStorage.removeItem('patient_portal_refresh_token');
    return false;
  }
};