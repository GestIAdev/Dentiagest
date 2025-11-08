/**
 * 🔥💀🎸 DENTIAGEST APOLLO CLIENT V3 - QUANTUM GRAPHQL EDITION
 * 
 * ARCHITECT: PunkClaude (The Verse Libre)
 * DATE: 2025-11-08
 * MISSION: GraphQL V3 perfection with @veritas quantum verification
 * 
 * FEATURES:
 * ✅ WebSocket subscriptions (GraphQLWsLink)
 * ✅ HTTP queries/mutations (HttpLink)
 * ✅ Error handling (onError link)
 * ✅ Smart caching (InMemoryCache with V3 type policies)
 * ✅ Authentication (Bearer token injection)
 * ✅ Split link routing (HTTP vs WebSocket)
 * 
 * CACHE STRATEGY:
 * - watchQuery: cache-and-network (real-time updates)
 * - query: network-only (always fresh data)
 * - mutate: refetch active queries (auto-update UI)
 * 
 * V3 MODULES SUPPORTED:
 * - Patients, Appointments, MedicalRecords, Treatments
 * - Documents, Inventory, Billing, Compliance
 * - Marketplace, Subscriptions, CustomCalendar
 * 
 * ENDPOINTS:
 * - GraphQL HTTP: http://localhost:8005/graphql
 * - GraphQL WS:   ws://localhost:8005/graphql
 */

// frontend/src/graphql/client.ts
import { ApolloClient, InMemoryCache, HttpLink, from, split } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

// ⚡ Error handling link - V3 QUANTUM ERROR TRACKING
const errorLink = onError(({ graphQLErrors, networkError }: any) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }: any) => {
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

// 🚀 Create Apollo Client V3 - DENTIAGEST QUANTUM EDITION
export const apolloClient = new ApolloClient({
  link: from([errorLink, splitLink]),
  cache: new InMemoryCache({
    possibleTypes: {}, // ✅ Empty but defined for fragment matching tests
    typePolicies: {
      Query: {
        fields: {
          // 🔥 V3 QUERIES - PATIENTS MODULE
          patients: {
            keyArgs: ["limit", "offset"],
            merge(existing, incoming) {
              return incoming; // REPLACE strategy
            },
          },
          patientsV3: {
            keyArgs: ["limit", "offset"],
            merge(existing, incoming) {
              return incoming;
            },
          },
          patientV3: {
            keyArgs: ["id"],
            merge(existing, incoming) {
              return incoming;
            },
          },
          
          // 🔥 V3 QUERIES - APPOINTMENTS MODULE
          appointments: {
            keyArgs: ["limit", "offset", "patientId"],
            merge(existing, incoming) {
              return incoming;
            },
          },
          appointmentsV3: {
            keyArgs: ["limit", "offset", "patientId", "startDate", "endDate"],
            merge(existing, incoming) {
              return incoming;
            },
          },
          appointmentV3: {
            keyArgs: ["id"],
            merge(existing, incoming) {
              return incoming;
            },
          },
          
          // 🔥 V3 QUERIES - MEDICAL RECORDS MODULE
          medicalRecords: {
            keyArgs: ["limit", "offset", "patientId"],
            merge(existing, incoming) {
              return incoming;
            },
          },
          medicalRecordsV3: {
            keyArgs: ["limit", "offset", "patientId"],
            merge(existing, incoming) {
              return incoming;
            },
          },
          medicalRecordV3: {
            keyArgs: ["id"],
            merge(existing, incoming) {
              return incoming;
            },
          },
          
          // 🔥 V3 QUERIES - TREATMENTS MODULE
          treatments: {
            keyArgs: ["limit", "offset", "patientId"],
            merge(existing, incoming) {
              return incoming;
            },
          },
          treatmentsV3: {
            keyArgs: ["limit", "offset", "patientId"],
            merge(existing, incoming) {
              return incoming;
            },
          },
          treatmentV3: {
            keyArgs: ["id"],
            merge(existing, incoming) {
              return incoming;
            },
          },
          
          // 🔥 V3 QUERIES - DOCUMENTS MODULE
          documents: {
            keyArgs: ["limit", "offset", "patientId", "documentType"],
            merge(existing, incoming) {
              return incoming;
            },
          },
          documentsV3: {
            keyArgs: ["limit", "offset", "patientId", "documentType"],
            merge(existing, incoming) {
              return incoming;
            },
          },
          unifiedDocumentsV3: {
            keyArgs: ["limit", "offset", "patientId"],
            merge(existing, incoming) {
              return incoming;
            },
          },
          
          // 🔥 V3 QUERIES - INVENTORY MODULE
          inventoryV3: {
            keyArgs: ["limit", "offset"],
            merge(existing, incoming) {
              return incoming;
            },
          },
          inventoryDashboardV3: {
            keyArgs: false, // No args, singleton
            merge(existing, incoming) {
              return incoming;
            },
          },
          inventoryAlertsV3: {
            keyArgs: false,
            merge(existing, incoming) {
              return incoming;
            },
          },
          dentalMaterialsV3: {
            keyArgs: ["limit", "offset"],
            merge(existing, incoming) {
              return incoming;
            },
          },
          equipmentV3: {
            keyArgs: ["limit", "offset"],
            merge(existing, incoming) {
              return incoming;
            },
          },
          suppliersV3: {
            keyArgs: ["limit", "offset"],
            merge(existing, incoming) {
              return incoming;
            },
          },
          purchaseOrdersV3: {
            keyArgs: ["limit", "offset"],
            merge(existing, incoming) {
              return incoming;
            },
          },
          
          // 🔥 V3 QUERIES - BILLING MODULE
          billingInvoicesV3: {
            keyArgs: ["limit", "offset", "patientId"],
            merge(existing, incoming) {
              return incoming;
            },
          },
          billingPaymentsV3: {
            keyArgs: ["limit", "offset"],
            merge(existing, incoming) {
              return incoming;
            },
          },
          billingAnalyticsV3: {
            keyArgs: false,
            merge(existing, incoming) {
              return incoming;
            },
          },
          
          // 🔥 V3 QUERIES - COMPLIANCE MODULE
          complianceAuditsV3: {
            keyArgs: ["limit", "offset"],
            merge(existing, incoming) {
              return incoming;
            },
          },
          complianceRegulationsV3: {
            keyArgs: ["limit", "offset"],
            merge(existing, incoming) {
              return incoming;
            },
          },
          complianceDashboardV3: {
            keyArgs: false,
            merge(existing, incoming) {
              return incoming;
            },
          },
          
          // 🔥 V3 QUERIES - MARKETPLACE MODULE
          marketplaceProductsV3: {
            keyArgs: ["limit", "offset", "category"],
            merge(existing, incoming) {
              return incoming;
            },
          },
          shoppingCartV3: {
            keyArgs: ["clinicId"],
            merge(existing, incoming) {
              return incoming;
            },
          },
          
          // 🔥 V3 QUERIES - SUBSCRIPTIONS MODULE
          subscriptionPlansV3: {
            keyArgs: false,
            merge(existing, incoming) {
              return incoming;
            },
          },
          subscriptionV3: {
            keyArgs: ["clinicId"],
            merge(existing, incoming) {
              return incoming;
            },
          },
          billingCyclesV3: {
            keyArgs: ["subscriptionId"],
            merge(existing, incoming) {
              return incoming;
            },
          },
          
          // 🔥 V3 QUERIES - CUSTOM CALENDAR MODULE
          customCalendarViewsV3: {
            keyArgs: ["userId"],
            merge(existing, incoming) {
              return incoming;
            },
          },
          calendarEventsV3: {
            keyArgs: ["startDate", "endDate", "dentistId"],
            merge(existing, incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network', // ✅ Best for real-time updates
      errorPolicy: 'all', // ✅ Return partial data + errors
      nextFetchPolicy: 'cache-first', // ✅ Subsequent queries use cache
    },
    query: {
      fetchPolicy: 'network-only', // ✅ Always fresh data
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
      refetchQueries: 'active', // ✅ Refetch active queries after mutation
    },
  },
});

export default apolloClient;
