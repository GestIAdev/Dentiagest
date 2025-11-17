/**
 * 🔐 AUTHENTICATION GRAPHQL OPERATIONS
 * Conexión REAL a Selene Song Core
 * By PunkClaude - Directiva #003 GeminiEnder
 */

import { gql } from '@apollo/client';

// ============================================================================
// MUTATIONS
// ============================================================================

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      refreshToken
      expiresIn
      user {
        id
        username
        email
        role
        firstName
        lastName
        isActive
        lastLoginAt
        createdAt
      }
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken($input: RefreshTokenInput!) {
    refreshToken(input: $input) {
      accessToken
      refreshToken
      expiresIn
      user {
        id
        username
        email
        role
        firstName
        lastName
        isActive
        createdAt
      }
    }
  }
`;

// ============================================================================
// QUERIES
// ============================================================================

export const ME_QUERY = gql`
  query Me {
    me {
      id
      username
      email
      role
      firstName
      lastName
      fullName
      isActive
      createdAt
    }
  }
`;

// ============================================================================
// TYPES (para TypeScript)
// ============================================================================

export interface LoginInput {
  email: string;
  password: string;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'DENTIST' | 'RECEPTIONIST' | 'PATIENT';
  firstName?: string;
  lastName?: string;
  fullName?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}
