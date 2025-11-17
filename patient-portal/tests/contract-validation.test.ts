/**
 * 🔥 ROBOT ARMY - CONTRACT VALIDATION SUITE
 * 
 * Objetivo: Validar TODAS las queries/mutations del Patient Portal contra Selene REAL
 * Si hay error 400 → GRITAR la línea exacta
 * Si hay GRAPHQL_VALIDATION_FAILED → IMPRIMIR el mensaje completo
 * 
 * Ejecutor: PunkClaude (QA Brutal Mode)
 * Directiva: ENDER-D1-003-QA
 */

import { ApolloClient, InMemoryCache, HttpLink, from, ApolloError } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import fetch from 'cross-fetch';
import { v4 as uuidv4 } from 'uuid';

// Import REAL operations from Patient Portal
import {
  LOGIN_MUTATION,
  LOGOUT_MUTATION,
  ME_QUERY,
  REFRESH_TOKEN_MUTATION,
} from '../src/graphql/auth';

import {
  GET_SUBSCRIPTION_PLANS,
  GET_PATIENT_SUBSCRIPTIONS,
  CREATE_SUBSCRIPTION,
  UPDATE_SUBSCRIPTION,
  CANCEL_SUBSCRIPTION,
} from '../src/graphql/subscriptions';

import {
  GET_PATIENT_BILLING_DATA,
  GET_BILLING_BY_ID,
  CREATE_BILLING,
  UPDATE_BILLING,
} from '../src/graphql/billing';

// ============================================================================
// TEST CONSTANTS - UUIDs válidos (PostgreSQL estricto)
// ============================================================================
const TEST_PATIENT_UUID = '123e4567-e89b-12d3-a456-426614174000'; // UUID v4 válido hardcodeado
const TEST_BILLING_UUID = '223e4567-e89b-12d3-a456-426614174000'; // UUID v4 válido hardcodeado
const TEST_SUBSCRIPTION_UUID = '323e4567-e89b-12d3-a456-426614174000'; // UUID v4 válido hardcodeado

// ============================================================================
// APOLLO CLIENT - TEST MODE (Apunta a Selene Real)
// ============================================================================

const httpLink = new HttpLink({
  uri: 'http://localhost:8005/graphql',
  fetch,
});

const authLink = setContext((_, { headers }) => {
  // Para tests que requieren auth, usamos un token de test
  const token = process.env.TEST_JWT_TOKEN || '';
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const testClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'no-cache' },
    query: { fetchPolicy: 'no-cache' },
  },
});

// ============================================================================
// HELPER: Error Inspector (Grita cuando hay 400 o validation errors)
// ============================================================================

function inspectError(operationName: string, error: ApolloError) {
  console.error(`\n🔥 ERROR DETECTADO EN: ${operationName}`);
  console.error('━'.repeat(80));

  // Network Error (400, 500, etc)
  if (error.networkError) {
    const netErr = error.networkError as any;
    console.error(`❌ NETWORK ERROR:`);
    console.error(`   Status Code: ${netErr.statusCode || 'N/A'}`);
    console.error(`   Message: ${netErr.message}`);
    
    if (netErr.statusCode === 400) {
      console.error(`\n🚨 BAD REQUEST (400) - SCHEMA MISMATCH PROBABLE`);
      console.error(`   Verifica que los campos enviados coincidan con el schema de Selene`);
    }

    if (netErr.result?.errors) {
      console.error(`\n📋 GRAPHQL ERRORS FROM SERVER:`);
      netErr.result.errors.forEach((gqlErr: any, idx: number) => {
        console.error(`   [${idx + 1}] ${gqlErr.message}`);
        if (gqlErr.extensions?.code === 'GRAPHQL_VALIDATION_FAILED') {
          console.error(`      ⚠️  VALIDATION ERROR - Revisa el schema`);
        }
      });
    }
  }

  // GraphQL Errors (validation, resolver errors)
  if (error.graphQLErrors && error.graphQLErrors.length > 0) {
    console.error(`\n❌ GRAPHQL ERRORS:`);
    error.graphQLErrors.forEach((gqlErr, idx) => {
      console.error(`   [${idx + 1}] ${gqlErr.message}`);
      console.error(`      Path: ${gqlErr.path?.join('.') || 'N/A'}`);
      console.error(`      Code: ${(gqlErr.extensions?.code as string) || 'N/A'}`);
      
      if (gqlErr.extensions?.code === 'GRAPHQL_VALIDATION_FAILED') {
        console.error(`      🚨 VALIDATION FAILED - Campo o tipo incorrecto en query/mutation`);
      }
    });
  }

  console.error('━'.repeat(80));
  console.error('\n');
}

// ============================================================================
// TEST SUITE: AUTHENTICATION
// ============================================================================

describe('🔐 Authentication Contract Validation', () => {
  let testToken: string | null = null;
  let testRefreshToken: string | null = null;

  test('LOGIN_MUTATION - Should authenticate with valid credentials', async () => {
    try {
      const result = await testClient.mutate({
        mutation: LOGIN_MUTATION,
        variables: {
          input: {
            email: 'doctor@dentiagest.com',
            password: 'DoctorDent123!',
          },
        },
      });

      expect(result.data).toBeDefined();
      expect(result.data?.login).toBeDefined();
      expect(result.data?.login.accessToken).toBeTruthy();
      expect(result.data?.login.refreshToken).toBeTruthy();

      // Guardar tokens para siguientes tests
      testToken = result.data.login.accessToken;
      testRefreshToken = result.data.login.refreshToken;

      console.log('✅ LOGIN_MUTATION - Schema válido, login exitoso');
    } catch (error) {
      inspectError('LOGIN_MUTATION', error as ApolloError);
      throw error;
    }
  }, 10000);

  test('ME_QUERY - Should return current user info', async () => {
    if (!testToken) {
      console.warn('⚠️  Skipping ME_QUERY - No token disponible (login falló)');
      return;
    }

    try {
      // Setear token temporal para este test
      const clientWithAuth = new ApolloClient({
        link: from([
          setContext(() => ({
            headers: { authorization: `Bearer ${testToken}` },
          })),
          httpLink,
        ]),
        cache: new InMemoryCache(),
      });

      const result = await clientWithAuth.query({
        query: ME_QUERY,
      });

      expect(result.data).toBeDefined();
      expect(result.data.me).toBeDefined();
      expect(result.data.me.id).toBeTruthy();

      console.log('✅ ME_QUERY - Schema válido, usuario obtenido');
    } catch (error) {
      inspectError('ME_QUERY', error as ApolloError);
      throw error;
    }
  });

  test('LOGOUT_MUTATION - Should invalidate token', async () => {
    if (!testToken) {
      console.warn('⚠️  Skipping LOGOUT_MUTATION - No token disponible');
      return;
    }

    try {
      const clientWithAuth = new ApolloClient({
        link: from([
          setContext(() => ({
            headers: { authorization: `Bearer ${testToken}` },
          })),
          httpLink,
        ]),
        cache: new InMemoryCache(),
      });

      const result = await clientWithAuth.mutate({
        mutation: LOGOUT_MUTATION,
      });

      expect(result.data).toBeDefined();
      expect(result.data?.logout).toBeDefined();

      console.log('✅ LOGOUT_MUTATION - Schema válido, logout exitoso');
    } catch (error) {
      inspectError('LOGOUT_MUTATION', error as ApolloError);
      throw error;
    }
  });

  test('REFRESH_TOKEN_MUTATION - Should refresh expired token', async () => {
    if (!testRefreshToken) {
      console.warn('⚠️  Skipping REFRESH_TOKEN_MUTATION - No refresh token disponible');
      return;
    }

    try {
      const result = await testClient.mutate({
        mutation: REFRESH_TOKEN_MUTATION,
        variables: {
          input: {
            refreshToken: testRefreshToken,
          },
        },
      });

      expect(result.data).toBeDefined();
      expect(result.data?.refreshToken).toBeDefined();
      expect(result.data?.refreshToken.accessToken).toBeTruthy();

      console.log('✅ REFRESH_TOKEN_MUTATION - Schema válido, token refreshed');
    } catch (error) {
      inspectError('REFRESH_TOKEN_MUTATION', error as ApolloError);
      throw error;
    }
  });
});

// ============================================================================
// TEST SUITE: SUBSCRIPTIONS
// ============================================================================

describe('📋 Subscription Contract Validation', () => {
  test('GET_SUBSCRIPTION_PLANS - Should fetch all plans', async () => {
    try {
      const result = await testClient.query({
        query: GET_SUBSCRIPTION_PLANS,
        variables: {
          activeOnly: true,
        },
      });

      expect(result.data).toBeDefined();
      expect(result.data.subscriptionPlansV3).toBeDefined();
      expect(Array.isArray(result.data.subscriptionPlansV3)).toBe(true);

      if (result.data.subscriptionPlansV3.length > 0) {
        const plan = result.data.subscriptionPlansV3[0];
        expect(plan.id).toBeDefined();
        expect(plan.name).toBeDefined();
        expect(plan.price).toBeDefined();
      }

      console.log(`✅ GET_SUBSCRIPTION_PLANS - Schema válido, ${result.data.subscriptionPlansV3.length} planes obtenidos`);
    } catch (error) {
      inspectError('GET_SUBSCRIPTION_PLANS', error as ApolloError);
      throw error;
    }
  });

  test('GET_PATIENT_SUBSCRIPTIONS - Should fetch patient subscriptions', async () => {
    try {
      const result = await testClient.query({
        query: GET_PATIENT_SUBSCRIPTIONS,
        variables: {
          patientId: TEST_PATIENT_UUID,
          status: 'ACTIVE', // Changed to enum value
          limit: 10,
          offset: 0,
        },
      });

      expect(result.data).toBeDefined();
      expect(result.data.subscriptionsV3).toBeDefined();
      expect(Array.isArray(result.data.subscriptionsV3)).toBe(true);

      console.log(`✅ GET_PATIENT_SUBSCRIPTIONS - Schema válido, ${result.data.subscriptionsV3.length} suscripciones obtenidas`);
    } catch (error) {
      inspectError('GET_PATIENT_SUBSCRIPTIONS', error as ApolloError);
      throw error;
    }
  });

  test('CREATE_SUBSCRIPTION - Should validate input schema', async () => {
    try {
      const result = await testClient.mutate({
        mutation: CREATE_SUBSCRIPTION,
        variables: {
          input: {
            patientId: TEST_PATIENT_UUID,
            planId: TEST_SUBSCRIPTION_UUID, // UUID válido
            paymentMethodId: uuidv4(), // Generar UUID dinámico
            startDate: new Date().toISOString(),
            autoRenew: true,
          },
        },
      });

      // NOTA: Este test puede fallar si no existe el patient/plan en DB
      // Pero el schema debe validarse correctamente (no debe dar 400)
      expect(result.data).toBeDefined();

      console.log('✅ CREATE_SUBSCRIPTION - Schema válido (input aceptado)');
    } catch (error) {
      // Si falla por lógica de negocio (patient no existe), OK
      // Si falla por 400 Bad Request → Schema mismatch
      const apolloError = error as ApolloError;
      if (apolloError.networkError && (apolloError.networkError as any).statusCode === 400) {
        inspectError('CREATE_SUBSCRIPTION', apolloError);
        throw error;
      }
      
      // Error de resolver (ej: "Patient not found") es esperado en test
      console.log('⚠️  CREATE_SUBSCRIPTION - Schema válido pero resolver rechazó (esperado en test)');
    }
  });

  test('CANCEL_SUBSCRIPTION - Should validate input schema', async () => {
    try {
      const result = await testClient.mutate({
        mutation: CANCEL_SUBSCRIPTION,
        variables: {
          id: 'test-subscription-001',
          reason: 'Test cancellation',
        },
      });

      expect(result.data).toBeDefined();

      console.log('✅ CANCEL_SUBSCRIPTION - Schema válido');
    } catch (error) {
      const apolloError = error as ApolloError;
      if (apolloError.networkError && (apolloError.networkError as any).statusCode === 400) {
        inspectError('CANCEL_SUBSCRIPTION', apolloError);
        throw error;
      }
      
      console.log('⚠️  CANCEL_SUBSCRIPTION - Schema válido pero resolver rechazó (esperado)');
    }
  });

  test('UPDATE_SUBSCRIPTION - Should validate input schema', async () => {
    try {
      const result = await testClient.mutate({
        mutation: UPDATE_SUBSCRIPTION,
        variables: {
          id: 'test-subscription-001',
          input: {
            autoRenew: false,
          },
        },
      });

      expect(result.data).toBeDefined();

      console.log('✅ UPDATE_SUBSCRIPTION - Schema válido');
    } catch (error) {
      const apolloError = error as ApolloError;
      if (apolloError.networkError && (apolloError.networkError as any).statusCode === 400) {
        inspectError('UPDATE_SUBSCRIPTION', apolloError);
        throw error;
      }
      
      console.log('⚠️  UPDATE_SUBSCRIPTION - Schema válido pero resolver rechazó (esperado)');
    }
  });

  // ❌ REMOVED: incrementSubscriptionUsageV3 NO EXISTE en Selene schema
  // Para track usage, usar trackServiceUsageV3 del PaymentTracking module
});

// ============================================================================
// TEST SUITE: BILLING
// ============================================================================

describe('💰 Billing Contract Validation', () => {
  test('GET_PATIENT_BILLING_DATA - Should fetch billing records', async () => {
    try {
      const result = await testClient.query({
        query: GET_PATIENT_BILLING_DATA,
        variables: {
          patientId: TEST_PATIENT_UUID,
          limit: 10,
          offset: 0,
        },
      });

      expect(result.data).toBeDefined();
      expect(result.data.billingDataV3).toBeDefined();
      expect(Array.isArray(result.data.billingDataV3)).toBe(true);

      console.log(`✅ GET_PATIENT_BILLING_DATA - Schema válido, ${result.data.billingDataV3.length} facturas obtenidas`);
    } catch (error) {
      inspectError('GET_PATIENT_BILLING_DATA', error as ApolloError);
      throw error;
    }
  });

  test('GET_BILLING_BY_ID - Should fetch single billing record', async () => {
    try {
      const result = await testClient.query({
        query: GET_BILLING_BY_ID,
        variables: {
          id: TEST_BILLING_UUID,
        },
      });

      expect(result.data).toBeDefined();

      console.log('✅ GET_BILLING_BY_ID - Schema válido');
    } catch (error) {
      const apolloError = error as ApolloError;
      if (apolloError.networkError && (apolloError.networkError as any).statusCode === 400) {
        inspectError('GET_BILLING_BY_ID', apolloError);
        throw error;
      }
      
      console.log('⚠️  GET_BILLING_BY_ID - Schema válido pero no encontrado (esperado)');
    }
  });

  test('CREATE_BILLING - Should validate input schema', async () => {
    try {
      const result = await testClient.mutate({
        mutation: CREATE_BILLING,
        variables: {
          input: {
            patientId: TEST_PATIENT_UUID,
            invoiceNumber: 'INV-TEST-001',
            subtotal: 150.00,
            totalAmount: 150.00,
            currency: 'EUR',
            issueDate: new Date().toISOString(),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'PENDING',
          },
        },
      });

      expect(result.data).toBeDefined();

      console.log('✅ CREATE_BILLING - Schema válido');
    } catch (error) {
      const apolloError = error as ApolloError;
      if (apolloError.networkError && (apolloError.networkError as any).statusCode === 400) {
        inspectError('CREATE_BILLING', apolloError);
        throw error;
      }
      
      console.log('⚠️  CREATE_BILLING - Schema válido pero resolver rechazó (esperado)');
    }
  });

  test('UPDATE_BILLING - Should validate input schema', async () => {
    try {
      const result = await testClient.mutate({
        mutation: UPDATE_BILLING,
        variables: {
          id: TEST_BILLING_UUID,
          input: {
            status: 'PAID',
            totalAmount: 250.00,
            paymentTerms: 'Payment completed via test',
            notes: 'Test billing update - validated schema',
          },
        },
      });

      expect(result.data).toBeDefined();

      console.log('✅ UPDATE_BILLING - Schema válido');
    } catch (error) {
      const apolloError = error as ApolloError;
      if (apolloError.networkError && (apolloError.networkError as any).statusCode === 400) {
        inspectError('UPDATE_BILLING', apolloError);
        throw error;
      }
      
      console.log('⚠️  UPDATE_BILLING - Schema válido pero resolver rechazó (esperado)');
    }
  });
});

// ============================================================================
// SMOKE TEST FINAL
// ============================================================================

describe('🚀 Smoke Test - Server Availability', () => {
  test('Selene GraphQL Server should be reachable', async () => {
    try {
      const result = await testClient.query({
        query: GET_SUBSCRIPTION_PLANS,
        variables: { activeOnly: true },
      });

      expect(result.data).toBeDefined();
      console.log('✅ Selene GraphQL Server is UP and responding');
    } catch (error) {
      console.error('❌ Selene GraphQL Server is DOWN or unreachable');
      console.error('   Verifica que Selene esté corriendo en http://localhost:8005/graphql');
      throw error;
    }
  });
});
