import { create } from 'zustand';
import { apolloClient } from '../config/apollo';
import {
  GET_SUBSCRIPTION_PLANS,
  GET_PATIENT_SUBSCRIPTIONS,
  CREATE_SUBSCRIPTION,
  UPDATE_SUBSCRIPTION,
  CANCEL_SUBSCRIPTION,
  type SubscriptionPlan as GraphQLPlan,
  type PatientSubscription as GraphQLSubscription,
  type CreateSubscriptionInput
} from '../graphql/subscriptions';

// ============================================================================
// INTERFACES Y TIPOS - NETFLIX DENTAL MODEL V3
// ============================================================================

export interface DentalPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
  isPopular: boolean;
  maxAppointments: number;
  validityDays: number;
}

export interface PatientSubscription {
  id: string;
  planId: string;
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  remainingAppointments: number;
  usedAppointments: number;
  plan: DentalPlan;
}

export interface SubscriptionState {
  subscriptions: PatientSubscription[];
  currentPlan: PatientSubscription | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setSubscriptions: (subscriptions: PatientSubscription[]) => void;
  addSubscription: (subscription: PatientSubscription) => void;
  updateSubscription: (id: string, updates: Partial<PatientSubscription>) => void;
  cancelSubscription: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Computed
  getActiveSubscriptions: () => PatientSubscription[];
  getTotalSpent: () => number;
  getUpcomingRenewals: () => PatientSubscription[];
}

// ============================================================================
// ZUSTAND STORE - SUBSCRIPTION MANAGEMENT
// ============================================================================

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscriptions: [],
  currentPlan: null,
  isLoading: false,
  error: null,

  setSubscriptions: (subscriptions: PatientSubscription[]) => {
    const activeSubs = subscriptions.filter(sub => sub.status === 'active');
    const currentPlan = activeSubs.length > 0 ? activeSubs[0] : null;

    set({
      subscriptions,
      currentPlan,
      isLoading: false,
      error: null,
    });
  },

  addSubscription: (subscription: PatientSubscription) => {
    set((state) => ({
      subscriptions: [...state.subscriptions, subscription],
      currentPlan: subscription.status === 'active' ? subscription : state.currentPlan,
    }));
  },

  updateSubscription: (id: string, updates: Partial<PatientSubscription>) => {
    set((state) => {
      const updatedSubscriptions = state.subscriptions.map(sub =>
        sub.id === id ? { ...sub, ...updates } : sub
      );

      const activeSubs = updatedSubscriptions.filter(sub => sub.status === 'active');
      const currentPlan = activeSubs.length > 0 ? activeSubs[0] : null;

      return {
        subscriptions: updatedSubscriptions,
        currentPlan,
      };
    });
  },

  cancelSubscription: (id: string) => {
    set((state) => {
      const updatedSubscriptions = state.subscriptions.map(sub =>
        sub.id === id ? { ...sub, status: 'cancelled' as const } : sub
      );

      const activeSubs = updatedSubscriptions.filter(sub => sub.status === 'active');
      const currentPlan = activeSubs.length > 0 ? activeSubs[0] : null;

      return {
        subscriptions: updatedSubscriptions,
        currentPlan,
      };
    });
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  setError: (error: string | null) => set({ error }),

  getActiveSubscriptions: () => {
    return get().subscriptions.filter(sub => sub.status === 'active');
  },

  getTotalSpent: () => {
    return get().subscriptions
      .filter(sub => sub.status !== 'cancelled')
      .reduce((total, sub) => total + sub.plan.price, 0);
  },

  getUpcomingRenewals: () => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));

    return get().subscriptions
      .filter(sub =>
        sub.status === 'active' &&
        sub.autoRenew &&
        new Date(sub.endDate) <= thirtyDaysFromNow
      );
  },
}));

// ============================================================================
// REAL GRAPHQL FUNCTIONS - NO MORE MOCKS
// By PunkClaude - Directiva #003 GeminiEnder
// ============================================================================

/**
 * 📦 Fetch available subscription plans from Selene
 */
export const fetchSubscriptionPlans = async (activeOnly = true): Promise<DentalPlan[]> => {
  try {
    const { data } = await apolloClient.query<{ subscriptionPlansV3: GraphQLPlan[] }>({
      query: GET_SUBSCRIPTION_PLANS,
      variables: { activeOnly },
      fetchPolicy: 'network-only' // Always get fresh data
    });

    if (!data?.subscriptionPlansV3) {
      throw new Error('No subscription plans found');
    }

    // Map GraphQL response to store format
    return data.subscriptionPlansV3.map(plan => ({
      id: plan.id,
      name: plan.name,
      description: plan.description || '',
      price: plan.price,
      currency: plan.currency,
      features: plan.features || [],
      isPopular: plan.priority === 1, // Highest priority = popular
      maxAppointments: plan.maxAppointments,
      validityDays: plan.billingPeriod === 'yearly' ? 365 : 30,
    }));
  } catch (error) {
    console.error('❌ Error fetching subscription plans:', error);
    throw error;
  }
};

/**
 * 📋 Fetch patient subscriptions from Selene
 */
export const fetchPatientSubscriptions = async (
  patientId: string,
  clinicId?: string, // Not used in query, kept for backwards compatibility
  status?: string
): Promise<PatientSubscription[]> => {
  try {
    const { data } = await apolloClient.query<{ subscriptionsV3: GraphQLSubscription[] }>({
      query: GET_PATIENT_SUBSCRIPTIONS,
      variables: { patientId, status }, // clinicId removed - not in schema
      fetchPolicy: 'network-only'
    });

    if (!data?.subscriptionsV3) {
      return [];
    }

    // Map GraphQL response to store format
    return data.subscriptionsV3.map(sub => ({
      id: sub.id,
      planId: sub.plan.id,
      status: sub.status as 'active' | 'inactive' | 'cancelled' | 'expired',
      startDate: sub.startDate,
      endDate: sub.endDate,
      autoRenew: sub.autoRenew,
      remainingAppointments: sub.plan.maxAppointments - sub.usedAppointments,
      usedAppointments: sub.usedAppointments,
      plan: {
        id: sub.plan.id,
        name: sub.plan.name,
        description: sub.plan.description || '',
        price: sub.plan.price,
        currency: sub.plan.currency,
        features: sub.plan.features || [],
        isPopular: sub.plan.priority === 1,
        maxAppointments: sub.plan.maxAppointments,
        validityDays: sub.plan.billingPeriod === 'yearly' ? 365 : 30,
      },
    }));
  } catch (error) {
    console.error('❌ Error fetching patient subscriptions:', error);
    throw error;
  }
};

/**
 * ➕ Create new subscription
 */
export const createPatientSubscription = async (
  patientId: string,
  clinicId: string,
  planId: string,
  autoRenew = true
): Promise<PatientSubscription> => {
  try {
    const { data } = await apolloClient.mutate<{ createSubscriptionV3: GraphQLSubscription }>({
      mutation: CREATE_SUBSCRIPTION,
      variables: {
        input: {
          patientId,
          clinicId,
          planId,
          autoRenew,
          startDate: new Date().toISOString(),
        } as CreateSubscriptionInput
      }
    });

    if (!data?.createSubscriptionV3) {
      throw new Error('Failed to create subscription');
    }

    const sub = data.createSubscriptionV3;
    return {
      id: sub.id,
      planId: sub.plan.id,
      status: sub.status as 'active' | 'inactive' | 'cancelled' | 'expired',
      startDate: sub.startDate,
      endDate: sub.endDate,
      autoRenew: sub.autoRenew,
      remainingAppointments: sub.plan.maxAppointments - sub.usedAppointments,
      usedAppointments: sub.usedAppointments,
      plan: {
        id: sub.plan.id,
        name: sub.plan.name,
        description: sub.plan.description || '',
        price: sub.plan.price,
        currency: sub.plan.currency,
        features: sub.plan.features || [],
        isPopular: sub.plan.priority === 1,
        maxAppointments: sub.plan.maxAppointments,
        validityDays: sub.plan.billingPeriod === 'yearly' ? 365 : 30,
      },
    };
  } catch (error) {
    console.error('❌ Error creating subscription:', error);
    throw error;
  }
};

/**
 * ❌ Cancel subscription
 */
export const cancelPatientSubscription = async (
  subscriptionId: string,
  reason?: string
): Promise<void> => {
  try {
    await apolloClient.mutate({
      mutation: CANCEL_SUBSCRIPTION,
      variables: { id: subscriptionId, reason }
    });

    console.log('✅ Subscription cancelled successfully');
  } catch (error) {
    console.error('❌ Error cancelling subscription:', error);
    throw error;
  }
};