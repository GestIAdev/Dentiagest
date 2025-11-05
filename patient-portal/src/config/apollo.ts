import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// 🔥 OFFLINE SUPREMACY - APOLLO CLIENT OFFLINE INTEGRADO
import { OfflineApolloClient } from '../apollo/OfflineApolloClient';

// 🔥 OFFLINE SUPREMACY - APOLLO CLIENT CON CAPACIDADES OFFLINE
const offlineClient = new OfflineApolloClient();
export const apolloClient = offlineClient.getClient();