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
  uri: import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:8005/graphql', // <-- PUERTO CORREGIDO
  headers: {
    authorization: localStorage.getItem('token') 
      ? `Bearer ${localStorage.getItem('token')}` 
      : '',
  },
});

// 🔔 WebSocket link (subscriptions)
const wsLink = new GraphQLWsLink(
  createClient({
    url: import.meta.env.VITE_WS_URL || 'ws://localhost:8005/graphql', // <-- PUERTO CORREGIDO
    connectionParams: {
      authorization: localStorage.getItem('token') 
        ? `Bearer ${localStorage.getItem('token')}` 
        : '',
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
            keyArgs: false,
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
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