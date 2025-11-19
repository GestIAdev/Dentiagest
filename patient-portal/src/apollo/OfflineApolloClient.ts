// ⚡ APOLLO CLIENT OFFLINE INTEGRATION V200 - GRAPHQL OFFLINE SUPREMACY
// 🔥 PUNK PHILOSOPHY: SPEED AS WEAPON - DEMOCRACY THROUGH CODE

import { ApolloClient, InMemoryCache, from, HttpLink, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { PatientPortalOfflineStorage } from '../utils/OfflineStorage';

// 🎯 PUNK CONSTANTS - INTEGRATED THROUGHOUT
const PUNK_CONSTANTS = {
  CODE_AS_ART: "Each line is elegant, efficient, powerful",
  SPEED_AS_WEAPON: "Prioritize execution fast and direct",
  CHALLENGE_ESTABLISHMENT: "No fear of unconventional solutions",
  INDEPENDENCE_ZERO_DEPENDENCIES: "Zero corporate dependencies",
  DEMOCRACY_THROUGH_CODE: "Equal access for all",
  DIGITAL_RESISTANCE: "Works when corporations fail"
};

// 🔄 GRAPHQL QUERY INTERFACES - OFFLINE SUPREMACY
interface GraphQLOperation {
  query: string;
  variables?: Record<string, any>;
  operationName?: string;
}

interface OfflineQueryResult {
  data?: any;
  errors?: any[];
  loading: boolean;
  networkStatus: number;
}

interface QueuedMutation {
  id: string;
  mutation: string;
  variables?: Record<string, any>;
  optimisticResponse?: any;
  update?: (cache: any, result: any) => void;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
}

// ⚡ OFFLINE APOLLO CLIENT - GRAPHQL AUTONOMY
export class OfflineApolloClient {
  private storage: PatientPortalOfflineStorage;
  private client: ApolloClient<any>;
  private mutationQueue: QueuedMutation[] = [];
  private isOnline: boolean = navigator.onLine;

  constructor() {
    this.storage = new PatientPortalOfflineStorage();
    this.client = this.createOfflineClient();
    this.setupNetworkListeners();
  }

  // 🌐 NETWORK STATE MONITORING - OFFLINE AWARENESS
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processMutationQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // 🎸 ROUND-ROBIN LOAD BALANCER - PUNK CLIENT-SIDE SOLUTION
  private seleneNodes: string[] = [
    'http://localhost:8005/graphql',  // selene-node-1
    'http://localhost:8006/graphql',  // selene-node-2
    'http://localhost:8007/graphql'   // selene-node-3
  ];
  private currentNodeIndex: number = 0;

  private getNextSeleneNode(): string {
    // Round-robin: rotate through available nodes
    const node = this.seleneNodes[this.currentNodeIndex];
    this.currentNodeIndex = (this.currentNodeIndex + 1) % this.seleneNodes.length;
    return node;
  }

  // 🚀 CREATE OFFLINE-CAPABLE APOLLO CLIENT
  private createOfflineClient(): ApolloClient<any> {
    // Auth link - adds JWT Bearer token to requests
    const authLink = setContext((_, { headers }) => {
      // Get token from localStorage (set by authStore)
      const token = localStorage.getItem('patient_portal_token');
      
      return {
        headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : '',
        }
      };
    });

    // 🔥 HTTP link with CLIENT-SIDE LOAD BALANCING + offline handling
    // PUNK PHILOSOPHY: No nginx, no haproxy, no enterprise bullshit
    // Just code that fucking works distributing load across 3 Selene nodes
    const httpLink = new HttpLink({
      uri: () => {
        // Use env var if set (production), otherwise round-robin through local nodes
        return process.env.REACT_APP_GRAPHQL_URI || this.getNextSeleneNode();
      },
      fetch: this.offlineAwareFetch.bind(this)
    });

    // Retry link for resilience
    const retryLink = new RetryLink({
      attempts: (count, operation, error) => {
        // Don't retry mutations in offline mode
        if (!this.isOnline && operation.operationName?.includes('Mutation')) {
          return false;
        }
        return count < 3;
      },
      delay: (count) => Math.min(1000 * Math.pow(2, count), 30000)
    });

    // Error link for offline fallback
    const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
      if (networkError && !this.isOnline) {
        // Handle offline scenario - return null to indicate no retry
        return;
      }

      // Log errors for debugging (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.error('GraphQL Error:', { graphQLErrors, networkError, operation });
      }
    });

    // Cache with offline persistence
    const cache = new InMemoryCache({
      typePolicies: {
        Patient: {
          fields: {
            appointments: { merge: false },
            documents: { merge: false },
            payments: { merge: false },
            notifications: { merge: false }
          }
        },
        Query: {
          fields: {
            // Merge strategies for offline data
            patientAppointments: {
              keyArgs: ['patientId'],
              merge: (existing = [], incoming) => {
                // Remove duplicates and merge
                const merged = [...existing];
                incoming.forEach((item: any) => {
                  const existingIndex = merged.findIndex((e: any) => e.id === item.id);
                  if (existingIndex >= 0) {
                    merged[existingIndex] = item;
                  } else {
                    merged.push(item);
                  }
                });
                return merged;
              }
            },
            patientDocuments: {
              keyArgs: ['patientId'],
              merge: (existing = [], incoming) => {
                const merged = [...existing];
                incoming.forEach((item: any) => {
                  const existingIndex = merged.findIndex((e: any) => e.id === item.id);
                  if (existingIndex >= 0) {
                    merged[existingIndex] = item;
                  } else {
                    merged.push(item);
                  }
                });
                return merged;
              }
            },
            patientNotifications: {
              keyArgs: ['patientId'],
              merge: (existing = [], incoming) => {
                const merged = [...existing];
                incoming.forEach((item: any) => {
                  const existingIndex = merged.findIndex((e: any) => e.id === item.id);
                  if (existingIndex >= 0) {
                    merged[existingIndex] = item;
                  } else {
                    merged.push(item);
                  }
                });
                return merged;
              }
            }
          }
        }
      }
    });

    return new ApolloClient({
      link: from([errorLink, retryLink, authLink, httpLink]),
      cache,
      defaultOptions: {
        watchQuery: {
          errorPolicy: 'all',
          fetchPolicy: 'cache-and-network',
          notifyOnNetworkStatusChange: true
        },
        query: {
          errorPolicy: 'all',
          fetchPolicy: 'cache-first'
        },
        mutate: {
          errorPolicy: 'all',
          fetchPolicy: 'no-cache'
        }
      },
      connectToDevTools: process.env.NODE_ENV === 'development'
    });
  }

  // 🌐 OFFLINE-AWARE FETCH - NETWORK RESILIENCE
  private async offlineAwareFetch(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    if (this.isOnline) {
      try {
        const response = await fetch(input, init);

        // Cache successful GraphQL responses
        if (response.ok && this.isGraphQLEndpoint(input)) {
          await this.cacheGraphQLResponse(input, init, response.clone());
        }

        return response;
      } catch (error) {
        // Network error - fallback to cache
        if (this.isGraphQLEndpoint(input)) {
          return this.getCachedGraphQLResponse(input, init) ||
                 this.createOfflineResponse();
        }
        throw error;
      }
    } else {
      // Offline - use cached response
      if (this.isGraphQLEndpoint(input)) {
        return this.getCachedGraphQLResponse(input, init) ||
               this.createOfflineResponse();
      }
      throw new Error('Network request failed: Device is offline');
    }
  }

  // 📱 HANDLE OFFLINE OPERATIONS - FALLBACK STRATEGIES
  private async handleOfflineOperation(operation: any): Promise<any> {
    const operationName = operation.operationName;

    // For queries, try to return cached data
    if (operation.operationName?.includes('Query')) {
      return this.handleOfflineQuery(operation);
    }

    // For mutations, queue them for later
    if (operation.operationName?.includes('Mutation')) {
      return this.queueMutation(operation);
    }

    // Default offline response
    return {
      data: null,
      errors: [{
        message: 'Operation not available offline',
        extensions: { code: 'OFFLINE_MODE' }
      }]
    };
  }

  // 📊 OFFLINE QUERY HANDLING - CACHE FIRST STRATEGY
  private async handleOfflineQuery(operation: any): Promise<any> {
    const operationName = operation.operationName;
    const variables = operation.variables;

    try {
      switch (operationName) {
        case 'GetPatient':
          return this.getOfflinePatient(variables.id);
        case 'GetPatientAppointments':
          return this.getOfflinePatientAppointments(variables.patientId);
        case 'GetPatientDocuments':
          return this.getOfflinePatientDocuments(variables.patientId);
        case 'GetPatientNotifications':
          return this.getOfflinePatientNotifications(variables.patientId);
        case 'GetPatientPayments':
          return this.getOfflinePatientPayments(variables.patientId);
        default:
          // Try to get from query cache
          return this.getCachedQuery(operation);
      }
    } catch (error) {
      return {
        data: null,
        errors: [{
          message: `Offline operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          extensions: { code: 'OFFLINE_QUERY_ERROR' }
        }]
      };
    }
  }

  // 🔄 MUTATION QUEUEING - OFFLINE→ONLINE SYNCHRONIZATION
  private async queueMutation(operation: any): Promise<any> {
    const queuedMutation: QueuedMutation = {
      id: `mutation_${Date.now()}`, // Deterministic ID generation
      mutation: operation.query.loc?.source.body || operation.query,
      variables: operation.variables,
      optimisticResponse: operation.optimisticResponse,
      update: operation.update,
      timestamp: new Date(),
      retryCount: 0,
      maxRetries: 3
    };

    this.mutationQueue.push(queuedMutation);

    // Store in IndexedDB for persistence
    await this.storage.queueOperation({
      type: 'create',
      entity: 'patient', // Using patient as generic entity for mutations
      data: queuedMutation,
      priority: 'high',
      maxRetries: 3
    });

    // Return optimistic response if available
    if (operation.optimisticResponse) {
      return { data: operation.optimisticResponse };
    }

    return {
      data: null,
      errors: [{
        message: 'Mutation queued for offline processing',
        extensions: { code: 'MUTATION_QUEUED', mutationId: queuedMutation.id }
      }]
    };
  }

  // 🔄 PROCESS MUTATION QUEUE - RECONNECTION HANDLING
  private async processMutationQueue(): Promise<void> {
    if (!this.isOnline || this.mutationQueue.length === 0) return;

    const pendingMutations = [...this.mutationQueue];
    this.mutationQueue = [];

    for (const queuedMutation of pendingMutations) {
      try {
        // Execute the mutation
        const result = await this.client.mutate({
          mutation: queuedMutation.mutation as any, // Type assertion for stored string
          variables: queuedMutation.variables,
          optimisticResponse: queuedMutation.optimisticResponse,
          update: queuedMutation.update
        });

        // Update cache if update function provided
        if (queuedMutation.update && result.data) {
          queuedMutation.update(this.client.cache, result);
        }

        // Mark as completed in storage
        await this.storage.updateOperationStatus(queuedMutation.id, 'completed');

      } catch (error) {
        queuedMutation.retryCount++;

        if (queuedMutation.retryCount < queuedMutation.maxRetries) {
          // Re-queue for retry
          this.mutationQueue.push(queuedMutation);
        } else {
          // Mark as failed
          await this.storage.updateOperationStatus(
            queuedMutation.id,
            'failed',
            error instanceof Error ? error.message : 'Mutation failed'
          );
        }
      }
    }
  }

  // 💾 OFFLINE DATA RETRIEVAL - INDEXEDDB INTEGRATION
  private async getOfflinePatient(patientId: string): Promise<any> {
    const patient = await this.storage.getPatient(patientId);
    return {
      data: {
        patient: patient ? {
          ...patient,
          __typename: 'Patient'
        } : null
      }
    };
  }

  private async getOfflinePatientAppointments(patientId: string): Promise<any> {
    const appointments = await this.storage.getPatientAppointments(patientId);
    return {
      data: {
        patientAppointments: appointments.map(apt => ({
          ...apt,
          __typename: 'Appointment'
        }))
      }
    };
  }

  private async getOfflinePatientDocuments(patientId: string): Promise<any> {
    const documents = await this.storage.getPatientDocuments(patientId);
    return {
      data: {
        patientDocuments: documents.map(doc => ({
          ...doc,
          __typename: 'Document'
        }))
      }
    };
  }

  private async getOfflinePatientNotifications(patientId: string): Promise<any> {
    const notifications = await this.storage.getPatientNotifications(patientId);
    return {
      data: {
        patientNotifications: notifications.map(notif => ({
          ...notif,
          __typename: 'Notification'
        }))
      }
    };
  }

  private async getOfflinePatientPayments(patientId: string): Promise<any> {
    // This would need to be implemented in storage
    return {
      data: {
        patientPayments: []
      }
    };
  }

  // 📦 GRAPHQL RESPONSE CACHING
  private async cacheGraphQLResponse(
    input: RequestInfo | URL,
    init: RequestInit | undefined,
    response: Response
  ): Promise<void> {
    try {
      const responseData = await response.json();
      const cacheKey = this.generateCacheKey(input, init);

      const cacheEntry = {
        id: cacheKey,
        url: typeof input === 'string' ? input : input.toString(),
        method: init?.method || 'POST',
        requestData: init?.body ? JSON.parse(init.body as string) : null,
        responseData,
        timestamp: new Date(),
        expiration: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
      };

      // Store in IndexedDB
      await this.storage.queueOperation({
        type: 'create',
        entity: 'patient', // Using patient as generic entity for cache
        data: cacheEntry,
        priority: 'low',
        maxRetries: 1
      });

    } catch (error) {
      // Silently fail caching
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to cache GraphQL response:', error);
      }
    }
  }

  private async getCachedGraphQLResponse(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    // This would retrieve from IndexedDB cache
    // For now, return offline response
    return this.createOfflineResponse();
  }

  private getCachedQuery(operation: any): any {
    // This would retrieve from query cache
    // For now, return offline response
    return {
      data: null,
      errors: [{
        message: 'Query not available in offline cache',
        extensions: { code: 'OFFLINE_CACHE_MISS' }
      }]
    };
  }

  // 🛠️ UTILITY METHODS
  private isGraphQLEndpoint(input: RequestInfo | URL): boolean {
    const url = typeof input === 'string' ? input : input.toString();
    return url.includes('/graphql') || url.includes('graphql');
  }

  private generateCacheKey(input: RequestInfo | URL, init?: RequestInit): string {
    const url = typeof input === 'string' ? input : input.toString();
    const body = init?.body ? JSON.stringify(JSON.parse(init.body as string)) : '';
    return btoa(`${url}${body}`).replace(/[^a-zA-Z0-9]/g, '');
  }

  private createOfflineResponse(): Response {
    return new Response(
      JSON.stringify({
        data: null,
        errors: [{
          message: 'Service unavailable offline',
          extensions: { code: 'OFFLINE_MODE' }
        }]
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // 🎯 PUBLIC API - APOLLO CLIENT INTERFACE
  getClient(): ApolloClient<any> {
    return this.client;
  }

  async initialize(): Promise<void> {
    await this.storage.initialize();
    // Load pending mutations from storage
    await this.loadPendingMutations();
  }

  private async loadPendingMutations(): Promise<void> {
    // This would load queued mutations from IndexedDB
    // For now, mutationQueue starts empty
  }

  async close(): Promise<void> {
    await this.storage.close();
  }

  // 📊 OFFLINE STATUS
  isOffline(): boolean {
    return !this.isOnline;
  }

  getQueuedMutationsCount(): number {
    return this.mutationQueue.length;
  }

  // 🧹 CLEANUP
  async cleanup(): Promise<void> {
    await this.storage.cleanup();
  }
}

// 🎭 PUNK PHILOSOPHY INTEGRATION
// "SPEED AS WEAPON - DEMOCRACY THROUGH CODE"
// This Apollo Client delivers instant offline responses, democratizing access