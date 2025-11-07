import { gql } from '@apollo/client';

// 🔥 V3 AUTHENTICATION MUTATIONS - VERITAS INTEGRATED
// Date: November 7, 2025
// Mission: GraphQL-based authentication with Veritas validation

/**
 * LOGIN Mutation - V3 Authentication
 * 
 * Authenticates user with email/password credentials.
 * Returns JWT tokens (access + refresh) and user data.
 * 
 * @veritas directive validates:
 * - Email format (RFC 5322)
 * - Password strength (min 8 chars, complexity)
 * - User account status (active/blocked)
 * 
 * Response includes:
 * - accessToken: JWT for API calls (15 min expiry)
 * - refreshToken: Long-lived token for renewal (7 days)
 * - user: Full user object with role/permissions
 * - expiresIn: Token TTL in seconds
 */
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
        fullName
        isActive
        lastLoginAt
      }
    }
  }
`;

/**
 * LOGOUT Mutation - V3 Session Termination
 * 
 * Invalidates current session and tokens.
 * Server-side blacklists the tokens to prevent reuse.
 * 
 * Client should:
 * 1. Clear localStorage (tokens, user data)
 * 2. Reset Apollo cache
 * 3. Redirect to login page
 */
export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

/**
 * REFRESH TOKEN Mutation - V3 Token Renewal
 * 
 * Issues new access token using valid refresh token.
 * Extends session without re-authentication.
 * 
 * @veritas validates:
 * - Refresh token signature
 * - Token expiration
 * - User account status
 * 
 * Used automatically by Apollo error link when accessToken expires.
 */
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
        isActive
      }
    }
  }
`;

/**
 * ME Query - Current User Data
 * 
 * Fetches authenticated user's profile.
 * Requires valid accessToken in Authorization header.
 * 
 * Used for:
 * - Session restoration on app load
 * - Profile display in UI
 * - Role-based access control
 */
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
      lastLoginAt
    }
  }
`;
