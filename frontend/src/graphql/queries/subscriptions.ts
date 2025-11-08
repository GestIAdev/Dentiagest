// 🎯 SUBSCRIPTIONS MODULE V3 - GRAPHQL QUERIES
// Date: November 8, 2025
// Mission: Complete subscription management queries with @veritas verification
// Status: V3 - Full Apollo Nuclear Integration

import { gql } from '@apollo/client';

// ============================================================================
// SUBSCRIPTION PLANS V3 - SaaS Subscription Management
// ============================================================================

export const GET_SUBSCRIPTION_PLANS_V3 = gql`
  query GetSubscriptionPlansV3($filters: SubscriptionPlanFiltersInput) {
    subscriptionPlansV3(filters: $filters) {
      id
      name
      name_veritas {
        verified
        confidence
        level
        certificate
        verifiedAt
      }
      description
      price
      price_veritas {
        verified
        confidence
        level
        certificate
        verifiedAt
      }
      billingCycle
      features
      limits
      active
      createdAt
      updatedAt
      _veritas {
        verified
        confidence
        level
        certificate
        verifiedAt
        algorithm
      }
    }
  }
`;

export const GET_SUBSCRIPTION_PLAN_V3 = gql`
  query GetSubscriptionPlanV3($id: ID!) {
    subscriptionPlanV3(id: $id) {
      id
      name
      name_veritas {
        verified
        confidence
        level
        certificate
        verifiedAt
      }
      description
      price
      price_veritas {
        verified
        confidence
        level
        certificate
        verifiedAt
      }
      billingCycle
      features
      limits
      active
      createdAt
      updatedAt
      _veritas {
        verified
        confidence
        level
        certificate
        verifiedAt
        algorithm
      }
    }
  }
`;

export const GET_SUBSCRIPTIONS_V3 = gql`
  query GetSubscriptionsV3($filters: SubscriptionFiltersInput) {
    subscriptionsV3(filters: $filters) {
      id
      clinicId
      planId
      plan {
        id
        name
        price
        billingCycle
        features
      }
      status
      status_veritas {
        verified
        confidence
        level
        certificate
        verifiedAt
      }
      startDate
      startDate_veritas {
        verified
        confidence
        level
        certificate
        verifiedAt
      }
      endDate
      currentPeriodStart
      currentPeriodEnd
      cancelAtPeriodEnd
      createdAt
      updatedAt
      _veritas {
        verified
        confidence
        level
        certificate
        verifiedAt
        algorithm
      }
    }
  }
`;

export const GET_SUBSCRIPTION_V3 = gql`
  query GetSubscriptionV3($id: ID!) {
    subscriptionV3(id: $id) {
      id
      clinicId
      planId
      plan {
        id
        name
        price
        billingCycle
        features
        limits
      }
      status
      status_veritas {
        verified
        confidence
        level
        certificate
        verifiedAt
      }
      startDate
      startDate_veritas {
        verified
        confidence
        level
        certificate
        verifiedAt
      }
      endDate
      currentPeriodStart
      currentPeriodEnd
      cancelAtPeriodEnd
      metadata
      createdAt
      updatedAt
      _veritas {
        verified
        confidence
        level
        certificate
        verifiedAt
        algorithm
      }
    }
  }
`;

export const GET_BILLING_CYCLES_V3 = gql`
  query GetBillingCyclesV3($subscriptionId: ID!) {
    billingCyclesV3(subscriptionId: $subscriptionId) {
      id
      subscriptionId
      periodStart
      periodEnd
      amount
      amount_veritas {
        verified
        confidence
        level
        certificate
        verifiedAt
      }
      status
      invoiceId
      createdAt
      _veritas {
        verified
        confidence
        level
        certificate
        verifiedAt
        algorithm
      }
    }
  }
`;

export const GET_USAGE_TRACKING_V3 = gql`
  query GetUsageTrackingV3($subscriptionId: ID!, $startDate: String, $endDate: String) {
    usageTrackingV3(subscriptionId: $subscriptionId, startDate: $startDate, endDate: $endDate) {
      id
      subscriptionId
      metric
      value
      value_veritas {
        verified
        confidence
        level
        certificate
        verifiedAt
      }
      timestamp
      metadata
      _veritas {
        verified
        confidence
        level
        certificate
        verifiedAt
        algorithm
      }
    }
  }
`;

// ============================================================================
// MUTATIONS V3
// ============================================================================

export const CREATE_SUBSCRIPTION_V3 = gql`
  mutation CreateSubscriptionV3($input: CreateSubscriptionInput!) {
    createSubscriptionV3(input: $input)
  }
`;

export const UPDATE_SUBSCRIPTION_V3 = gql`
  mutation UpdateSubscriptionV3($id: ID!, $input: UpdateSubscriptionInput!) {
    updateSubscriptionV3(id: $id, input: $input)
  }
`;

export const CANCEL_SUBSCRIPTION_V3 = gql`
  mutation CancelSubscriptionV3($id: ID!, $cancelAtPeriodEnd: Boolean) {
    cancelSubscriptionV3(id: $id, cancelAtPeriodEnd: $cancelAtPeriodEnd)
  }
`;

export const REACTIVATE_SUBSCRIPTION_V3 = gql`
  mutation ReactivateSubscriptionV3($id: ID!) {
    reactivateSubscriptionV3(id: $id)
  }
`;
