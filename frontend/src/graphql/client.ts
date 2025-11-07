// frontend/src/graphql/client.ts
import { ApolloClient, InMemoryCache, HttpLink, from, split } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

// ⚡ Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// 🔗 HTTP link (queries + mutations)
const httpLink = new HttpLink({
  uri: process.env.REACT_APP_GRAPHQL_URL || 'http://localhost:8005/graphql',
  fetch: (input: RequestInfo | URL, init?: RequestInit) => {
    // Add auth token to headers dynamically
    const token = localStorage.getItem('accessToken');
    const options = init || {};

    if (token) {
      options.headers = {
        ...options.headers,
        authorization: `Bearer ${token}`,
      };
    }

    return fetch(input, options);
  },
});

// 🔔 WebSocket link (subscriptions)
const wsLink = new GraphQLWsLink(
  createClient({
    url: process.env.REACT_APP_WS_URL || 'ws://localhost:8005/graphql', // <-- PUERTO CORREGIDO
    connectionParams: () => {
      const token = localStorage.getItem('accessToken');
      return {
        authorization: token ? `Bearer ${token}` : '',
      };
    },
  })
);

// Split link: HTTP for queries/mutations, WebSocket for subscriptions
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

// 🚀 Create Apollo Client
export const apolloClient = new ApolloClient({
  link: from([errorLink, splitLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          patients: {
            // 🔥 FIX: Use keyArgs to cache by pagination params OR replace instead of merge
            keyArgs: ["limit", "offset"],
            merge(existing, incoming) {
              // REPLACE strategy: return incoming data directly (don't merge with existing)
              return incoming;
            },
          },
          appointments: {
            keyArgs: ["limit", "offset", "patientId"], // Cache separado por paginación
            merge(existing, incoming) {
              return incoming; // ✅ REEMPLAZA, no acumula
            },
          },
          medicalRecords: {
            keyArgs: ["limit", "offset", "patientId"], // Cache separado por paginación
            merge(existing, incoming) {
              return incoming; // ✅ REEMPLAZA, no acumula
            },
          },
          treatments: {
            keyArgs: ["limit", "offset", "patientId"],
            merge(existing, incoming) {
              return incoming; // ✅ REEMPLAZA, no acumula
            },
          },
          documents: {
            keyArgs: ["limit", "offset", "patientId", "documentType"], // Cache separado por paginación + filtros
            merge(existing, incoming) {
              return incoming; // ✅ REEMPLAZA, no acumula
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

export default apolloClient;
