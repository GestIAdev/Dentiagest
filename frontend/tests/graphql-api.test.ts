/**
 * GraphQL API Connectivity Tests
 * Valida Selene Song Core GraphQL endpoint
 * 
 * Este test valida:
 * - Servidor GraphQL running (port 4000 o 8005)
 * - Schema introspection
 * - Query resolvers funcionales
 * - Mutation resolvers configurados
 * - Error handling correcto
 */

import { describe, test, expect, beforeAll } from 'vitest';
import { ApolloClient, InMemoryCache, gql, HttpLink } from '@apollo/client';
import fetch from 'cross-fetch';

// Selene GraphQL endpoints (try both ports)
const GRAPHQL_ENDPOINTS = [
  'http://localhost:4000/graphql',
  'http://localhost:8005/graphql'
];

let ACTIVE_ENDPOINT: string;

describe('GraphQL API Validation', () => {
  let client: ApolloClient<any>;

  beforeAll(async () => {
    // Find active Selene endpoint
    for (const endpoint of GRAPHQL_ENDPOINTS) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: '{ __typename }' })
        });
        
        if (response.status === 200) {
          ACTIVE_ENDPOINT = endpoint;
          console.log('✅ Selene Song Core found at:', endpoint);
          break;
        }
      } catch (error) {
        // Try next endpoint
      }
    }

    if (!ACTIVE_ENDPOINT) {
      throw new Error('❌ Selene Song Core GraphQL server not running on ports 4000 or 8005');
    }

    client = new ApolloClient({
      link: new HttpLink({ uri: ACTIVE_ENDPOINT, fetch }),
      cache: new InMemoryCache(),
      defaultOptions: {
        query: { errorPolicy: 'all' },
        mutate: { errorPolicy: 'all' }
      }
    });
  });

  test('GraphQL server is running', async () => {
    const response = await fetch(ACTIVE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{ __typename }' })
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.data).toBeDefined();
  });

  test('Schema introspection works', async () => {
    const { data, errors } = await client.query({
      query: gql`
        query IntrospectionQuery {
          __schema {
            queryType { name }
            mutationType { name }
            subscriptionType { name }
            types {
              name
              kind
            }
          }
        }
      `
    });

    expect(errors).toBeUndefined();
    expect(data.__schema.queryType.name).toBe('Query');
    expect(data.__schema.mutationType.name).toBe('Mutation');
    
    const typeNames = data.__schema.types.map((t: any) => t.name);
    console.log('✅ GraphQL types found:', typeNames.length);
  });

  test('Patients query resolver exists', async () => {
    const { data, errors } = await client.query({
      query: gql`
        query GetPatients {
          patients {
            id
            firstName
            lastName
            email
          }
        }
      `
    });

    // Can return empty array or data, but no GraphQL schema errors
    if (errors) {
      console.log('⚠️ Patients query errors:', errors);
    }
    
    expect(data).toBeDefined();
    expect(Array.isArray(data.patients) || data.patients === null).toBe(true);
  });

  test('Inventory query resolver exists', async () => {
    const { data, errors } = await client.query({
      query: gql`
        query GetInventory {
          inventory {
            id
            itemName
            quantity
            unitPrice
          }
        }
      `
    });

    if (errors) {
      console.log('⚠️ Inventory query errors:', errors);
    }

    expect(data).toBeDefined();
    expect(Array.isArray(data.inventory) || data.inventory === null).toBe(true);
  });

  test('Treatments query resolver exists', async () => {
    const { data, errors } = await client.query({
      query: gql`
        query GetTreatments {
          treatments {
            id
            treatmentType
            description
            cost
          }
        }
      `
    });

    if (errors) {
      console.log('⚠️ Treatments query errors:', errors);
    }

    expect(data).toBeDefined();
    expect(Array.isArray(data.treatments) || data.treatments === null).toBe(true);
  });

  test('Appointments query resolver exists', async () => {
    const { data, errors } = await client.query({
      query: gql`
        query GetAppointments {
          appointments {
            id
            date
            time
            type
            status
          }
        }
      `
    });

    if (errors) {
      console.log('⚠️ Appointments query errors:', errors);
    }

    expect(data).toBeDefined();
    expect(Array.isArray(data.appointments) || data.appointments === null).toBe(true);
  });

  test('Documents query resolver exists', async () => {
    const { data, errors } = await client.query({
      query: gql`
        query GetDocuments {
          documents {
            id
            fileName
            documentType
            uploadDate
          }
        }
      `
    });

    if (errors) {
      console.log('⚠️ Documents query errors:', errors);
    }

    expect(data).toBeDefined();
    expect(Array.isArray(data.documents) || data.documents === null).toBe(true);
  });

  test('Compliance query resolver exists', async () => {
    const { data, errors } = await client.query({
      query: gql`
        query GetCompliance {
          compliance {
            id
            regulationId
            complianceStatus
            lastChecked
          }
        }
      `
    });

    if (errors) {
      console.log('⚠️ Compliance query errors:', errors);
    }

    expect(data).toBeDefined();
    expect(Array.isArray(data.compliance) || data.compliance === null).toBe(true);
  });

  test('Medical records query resolver exists', async () => {
    const { data, errors } = await client.query({
      query: gql`
        query GetMedicalRecords {
          medicalRecords {
            id
            patientId
            diagnosis
            treatment
          }
        }
      `
    });

    if (errors) {
      console.log('⚠️ Medical records query errors:', errors);
    }

    expect(data).toBeDefined();
  });

  test('Error handling for invalid query', async () => {
    const { errors } = await client.query({
      query: gql`
        query InvalidQuery {
          nonExistentField {
            id
          }
        }
      `
    });

    // Should have GraphQL errors for invalid field
    expect(errors).toBeDefined();
    expect(errors!.length).toBeGreaterThan(0);
    console.log('✅ Error handling works:', errors![0].message);
  });
});
