/**
 * 🎯 APOLLO CLIENT - CENTRALIZED EXPORT
 * Unified Apollo Client instance for GraphQL operations
 * 
 * This module exports the configured Apollo Client instance
 * used across the entire frontend application.
 */

import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

// GraphQL endpoint (Selene Song Core)
const GRAPHQL_URI = import.meta.env.VITE_GRAPHQL_URI || 'http://localhost:8005/graphql';

// 🔐 AUTH LINK - Adds Bearer token to every request
const authLink = setContext((_, { headers }) => {
  // Get token from localStorage (supports both 'accessToken' and 'token' keys)
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// HTTP link
const httpLink = new HttpLink({
  uri: GRAPHQL_URI,
  credentials: 'include', // 🔐 Changed to 'include' for CORS with credentials
});

// Apollo Client instance - 🔐 authLink added to chain
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          patients: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
          appointments: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
          inventory: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
          documents: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

// Default export for convenience
export default apolloClient;
