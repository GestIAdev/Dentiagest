/**
 * 📦 SUBSCRIPTION GRAPHQL OPERATIONS
 * Conexión REAL a Selene Song Core - Netflix Dental Model
 * By PunkClaude - Directiva #003 GeminiEnder
 */

import { gql } from '@apollo/client';

// ============================================================================
// QUERIES
// ============================================================================

export const GET_SUBSCRIPTION_PLANS = gql`
  query GetSubscriptionPlans($activeOnly: Boolean) {
    subscriptionPlansV3(activeOnly: $activeOnly) {
      id
      name
      description
      tier
      price
      currency
      billingCycle
      maxServicesPerMonth
      maxServicesPerYear
      popular
      recommended
      active
      createdAt
      updatedAt
      features {
        id
        name
        description
        included
        limit
        unit
      }
    }
  }
`;

export const GET_PATIENT_SUBSCRIPTIONS = gql`
  query GetPatientSubscriptions(
    $patientId: ID
    $status: SubscriptionStatus
    $planId: ID
    $limit: Int
    $offset: Int
  ) {
    subscriptionsV3(
      patientId: $patientId
      status: $status
      planId: $planId
      limit: $limit
      offset: $offset
    ) {
      id
      patientId
      planId
      status
      startDate
      endDate
      nextBillingDate
      autoRenew
      paymentMethodId
      usageThisMonth
      usageThisYear
      remainingServices
      createdAt
      updatedAt
      plan {
        id
        name
        description
        tier
        price
        currency
        billingCycle
        maxServicesPerMonth
        maxServicesPerYear
        popular
        recommended
        active
        features {
          id
          name
          description
          included
          limit
          unit
        }
      }
    }
  }
`;

export const GET_SUBSCRIPTION_BY_ID = gql`
  query GetSubscriptionById($id: ID!) {
    subscriptionV3(id: $id) {
      id
      patientId
      planId
      status
      startDate
      endDate
      nextBillingDate
      autoRenew
      paymentMethodId
      usageThisMonth
      usageThisYear
      remainingServices
      createdAt
      updatedAt
      plan {
        id
        name
        description
        tier
        price
        currency
        billingCycle
        maxServicesPerMonth
        maxServicesPerYear
        popular
        recommended
        active
        features {
          id
          name
          description
          included
          limit
          unit
        }
      }
    }
  }
`;

// ============================================================================
// MUTATIONS
// ============================================================================

export const CREATE_SUBSCRIPTION = gql`
  mutation CreateSubscription($input: CreateSubscriptionInputV3!) {
    createSubscriptionV3(input: $input) {
      id
      patientId
      planId
      status
      startDate
      endDate
      nextBillingDate
      autoRenew
      paymentMethodId
      usageThisMonth
      usageThisYear
      remainingServices
      createdAt
      plan {
        id
        name
        description
        tier
        price
        currency
        billingCycle
        maxServicesPerMonth
        maxServicesPerYear
        features {
          id
          name
          description
        }
      }
    }
  }
`;

export const UPDATE_SUBSCRIPTION = gql`
  mutation UpdateSubscription($id: ID!, $input: UpdateSubscriptionInputV3!) {
    updateSubscriptionV3(id: $id, input: $input) {
      id
      patientId
      planId
      status
      startDate
      endDate
      nextBillingDate
      autoRenew
      paymentMethodId
      usageThisMonth
      usageThisYear
      remainingServices
      updatedAt
      plan {
        id
        name
        description
        tier
        price
        currency
        billingCycle
        maxServicesPerMonth
        maxServicesPerYear
      }
    }
  }
`;

export const CANCEL_SUBSCRIPTION = gql`
  mutation CancelSubscription($id: ID!, $reason: String) {
    cancelSubscriptionV3(id: $id, reason: $reason)
  }
`;

// ❌ REMOVED: incrementSubscriptionUsageV3 NO EXISTE en Selene schema
// Para incrementar uso, debes usar trackServiceUsageV3 del PaymentTracking module

// ============================================================================
// TYPES - ALIGNED WITH SELENE SCHEMA (SubscriptionV3 & SubscriptionPlanV3)
// ============================================================================

export type SubscriptionTier = 'BASIC' | 'STANDARD' | 'PREMIUM' | 'ENTERPRISE';
export type BillingCycleType = 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL';
export type SubscriptionStatus = 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'SUSPENDED' | 'EXPIRED' | 'PENDING';

export interface SubscriptionFeature {
  id: string;
  name: string;
  description?: string;
  included: boolean;
  limit?: number;
  unit?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  tier: SubscriptionTier;
  price: number;
  currency: string;
  billingCycle: BillingCycleType;
  maxServicesPerMonth: number;
  maxServicesPerYear: number;
  features: SubscriptionFeature[];
  popular: boolean;
  recommended: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PatientSubscription {
  id: string;
  patientId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate?: string;
  nextBillingDate: string;
  autoRenew: boolean;
  paymentMethodId?: string;
  usageThisMonth: number;
  usageThisYear: number;
  remainingServices: number;
  createdAt: string;
  updatedAt: string;
  plan: SubscriptionPlan;
}

export interface CreateSubscriptionInput {
  patientId: string;
  planId: string;
  clinicId?: string;  // 🔧 OPCIONAL: Si no se envía, backend usa anclaje del paciente
  paymentMethodId?: string;
  autoRenew?: boolean;
  startDate?: string;
}

export interface UpdateSubscriptionInput {
  status?: SubscriptionStatus;
  autoRenew?: boolean;
  paymentMethodId?: string;
}
