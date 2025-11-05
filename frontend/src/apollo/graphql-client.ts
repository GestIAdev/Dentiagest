// 🔥 APOLLO NUCLEAR GRAPHQL CLIENT
// Date: September 22, 2025
// Mission: Apollo Client Configuration for GraphQL Federation
// Target: Seamless integration with existing Apollo Nuclear system

import {
  ApolloClient,
  createHttpLink,
  split,
} from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { gql } from '@apollo/client';
import { createAdvancedCache } from './advanced-cache';

// ============================================================================
// APOLLO CLIENT CONFIGURATION
// ============================================================================

// 🎯 HTTP LINK - Core GraphQL endpoint with auth
const httpLink = createHttpLink({
  uri: process.env.REACT_APP_GRAPHQL_URI || 'http://localhost:8000/graphql', // Load Balancer port for PM2 cluster
  credentials: 'include',
  headers: {
    'x-apollo-nuclear-version': '3.0',
    'x-client-type': 'frontend',
  },
  fetch: (input: RequestInfo | URL, init?: RequestInit) => {
    // Add auth token to headers
    const token = localStorage.getItem('accessToken');
    const options = init || {};

    if (token) {
      options.headers = {
        ...options.headers,
        authorization: `Bearer ${token}`,
      };
    }

    return fetch(input, options);
  }
});

// ============================================================================
// CACHE CONFIGURATION - Advanced Apollo Nuclear Caching
// ============================================================================

const cache = createAdvancedCache();

// ============================================================================
// WEBSOCKET LINK - Real-time subscriptions
// ============================================================================

const wsLink = new GraphQLWsLink(
  createClient({
    url: process.env.REACT_APP_GRAPHQL_WS_URI || 'ws://localhost:8000/graphql', // Load Balancer WebSocket port
    connectionParams: () => {
      const token = localStorage.getItem('accessToken');
      return {
        authorization: token ? `Bearer ${token}` : '',
        'x-apollo-nuclear-version': '3.0',
        'x-client-type': 'frontend',
      };
    },
    on: {
      connected: () => console.log('🔗 GraphQL WebSocket connected'),
      error: (error: any) => console.error('🔗 GraphQL WebSocket error:', error),
      closed: () => console.log('🔗 GraphQL WebSocket closed'),
    },
  })
);

// ============================================================================
// SPLIT LINK - Route queries/mutations to HTTP, subscriptions to WebSocket
// ============================================================================

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

// ============================================================================
// APOLLO CLIENT INSTANCE
// ============================================================================

export const apolloClient = new ApolloClient({
  link: splitLink,  // 🔥 APOLLO NUCLEAR: Split link for subscriptions
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all'
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all'
    },
    mutate: {
      errorPolicy: 'all'
    }
  }
});

// 🎯 Health check for GraphQL endpoint
export const checkGraphQLHealth = async (): Promise<boolean> => {
  try {
    const result = await apolloClient.query({
      query: gql`
        query HealthCheck {
          health
        }
      `,
      fetchPolicy: 'network-only'
    });
    return (result.data as any)?.health === 'ok';
  } catch (error) {
    console.error('GraphQL health check failed:', error);
    return false;
  }
};

// 🎯 Clear cache utility
export const clearApolloCache = async () => {
  await apolloClient.clearStore();
  console.log('🧹 Apollo cache cleared');
};

// 🎯 Reset client (useful for logout)
export const resetApolloClient = async () => {
  await apolloClient.resetStore();
  console.log('🔄 Apollo client reset');
};

// Export gql for convenience
export { gql };

// Export default client
export default apolloClient;