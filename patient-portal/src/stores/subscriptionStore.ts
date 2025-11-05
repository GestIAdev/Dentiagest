import { create } from 'zustand';

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
// AVAILABLE DENTAL PLANS - TITAN V3 CATALOG
// ============================================================================

export const AVAILABLE_PLANS: DentalPlan[] = [
  {
    id: 'basic-cleaning',
    name: 'Limpieza Básica',
    description: 'Limpieza dental profesional cada 6 meses',
    price: 150,
    currency: 'ARS',
    features: [
      'Limpieza profesional',
      'Chequeo general',
      'Aplicación de flúor',
      '2 consultas al año',
    ],
    isPopular: false,
    maxAppointments: 2,
    validityDays: 365,
  },
  {
    id: 'premium-care',
    name: 'Cuidado Premium',
    description: 'Atención dental completa con beneficios exclusivos',
    price: 450,
    currency: 'ARS',
    features: [
      'Limpieza profesional',
      'Chequeo completo',
      'Tratamientos preventivos',
      'Radiografías digitales',
      'Blanqueamiento dental',
      'Descuento en tratamientos',
      '4 consultas al año',
      'Emergencias 24/7',
    ],
    isPopular: true,
    maxAppointments: 4,
    validityDays: 365,
  },
  {
    id: 'family-plan',
    name: 'Plan Familiar',
    description: 'Cobertura completa para toda la familia',
    price: 850,
    currency: 'ARS',
    features: [
      'Hasta 4 miembros',
      'Limpieza profesional',
      'Chequeo completo',
      'Tratamientos preventivos',
      'Radiografías digitales',
      'Blanqueamiento dental',
      'Ortodoncia descuento 30%',
      'Implantes descuento 20%',
      '8 consultas al año',
      'Emergencias 24/7',
    ],
    isPopular: false,
    maxAppointments: 8,
    validityDays: 365,
  },
];