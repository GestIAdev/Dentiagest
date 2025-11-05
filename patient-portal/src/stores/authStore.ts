import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
// SSO UTILITIES - TITAN V3 INTEGRATION
// ============================================================================

export const initiateSSO = async (patientId: string, clinicId: string): Promise<void> => {
  try {
    // Redirect to Apollo Nuclear SSO endpoint
    const ssoUrl = `http://localhost:8003/auth/sso/patient?patientId=${patientId}&clinicId=${clinicId}&redirectUri=${encodeURIComponent(window.location.origin + '/auth/callback')}`;
    window.location.href = ssoUrl;
  } catch (error) {
    console.error('SSO initiation failed:', error);
    throw new Error('Failed to initiate SSO authentication');
  }
};

export const handleSSOCallback = async (code: string, state: string): Promise<void> => {
  try {
    // Exchange code for JWT token from Apollo Nuclear
    const response = await fetch('http://localhost:8003/auth/sso/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        state,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange SSO code for token');
    }

    const data = await response.json();

    // Extract patient info from JWT (without verification for demo)
    const tokenParts = data.access_token.split('.');
    const payload = JSON.parse(atob(tokenParts[1]));

    // Login with received data
    useAuthStore.getState().login(
      payload.patientId,
      payload.clinicId,
      data.access_token,
      data.expires_in || 900 // 15 minutes default
    );

  } catch (error) {
    console.error('SSO callback failed:', error);
    useAuthStore.getState().setError('Authentication failed');
    throw error;
  }
};