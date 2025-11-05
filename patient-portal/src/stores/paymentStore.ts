import { create } from 'zustand';

// ============================================================================
// INTERFACES Y TIPOS - AGNOSTIC PAYMENT BRIDGE V3
// ============================================================================

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_transfer' | 'qr' | 'bizum';
  provider: 'visa' | 'mastercard' | 'bizum' | 'bank' | 'clinic_gateway';
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  isVerified: boolean;
}

export interface PaymentHistory {
  id: string;
  patientId: string;
  clinicId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  type: 'subscription' | 'appointment' | 'manual' | 'refund';
  description: string;
  transactionId?: string;
  qrCode?: string;
  bizumId?: string;
  veritasSignature: string; // @veritas quantum signature
  createdAt: string;
  processedAt?: string;
}

export interface PaymentOrder {
  id: string;
  patientId: string;
  clinicId: string;
  amount: number;
  currency: string;
  description: string;
  qrCode?: string;
  bizumId?: string;
  expiresAt: string;
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  createdAt: string;
}

export interface PaymentState {
  paymentMethods: PaymentMethod[];
  paymentHistory: PaymentHistory[];
  activeOrder: PaymentOrder | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setPaymentMethods: (methods: PaymentMethod[]) => void;
  addPaymentMethod: (method: PaymentMethod) => void;
  removePaymentMethod: (id: string) => void;
  setDefaultPaymentMethod: (id: string) => void;
  setPaymentHistory: (history: PaymentHistory[]) => void;
  addPaymentHistory: (payment: PaymentHistory) => void;
  setActiveOrder: (order: PaymentOrder | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Computed
  getDefaultPaymentMethod: () => PaymentMethod | undefined;
  getPendingPayments: () => PaymentHistory[];
  getTotalPaid: () => number;
}

// ============================================================================
// ZUSTAND STORE - AGNOSTIC PAYMENT MANAGEMENT
// ============================================================================

export const usePaymentStore = create<PaymentState>((set, get) => ({
  paymentMethods: [],
  paymentHistory: [],
  activeOrder: null,
  isLoading: false,
  error: null,

  setPaymentMethods: (methods: PaymentMethod[]) => {
    set({
      paymentMethods: methods,
      isLoading: false,
      error: null,
    });
  },

  addPaymentMethod: (method: PaymentMethod) => {
    set((state) => ({
      paymentMethods: [...state.paymentMethods, method],
    }));
  },

  removePaymentMethod: (id: string) => {
    set((state) => ({
      paymentMethods: state.paymentMethods.filter(method => method.id !== id),
    }));
  },

  setDefaultPaymentMethod: (id: string) => {
    set((state) => ({
      paymentMethods: state.paymentMethods.map(method => ({
        ...method,
        isDefault: method.id === id,
      })),
    }));
  },

  setPaymentHistory: (history: PaymentHistory[]) => {
    set({
      paymentHistory: history,
      isLoading: false,
      error: null,
    });
  },

  addPaymentHistory: (payment: PaymentHistory) => {
    set((state) => ({
      paymentHistory: [payment, ...state.paymentHistory],
    }));
  },

  setActiveOrder: (order: PaymentOrder | null) => {
    set({ activeOrder: order });
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  setError: (error: string | null) => set({ error }),

  getDefaultPaymentMethod: () => {
    return get().paymentMethods.find(method => method.isDefault);
  },

  getPendingPayments: () => {
    return get().paymentHistory.filter(payment => payment.status === 'pending');
  },

  getTotalPaid: () => {
    return get().paymentHistory
      .filter(payment => payment.status === 'completed')
      .reduce((total, payment) => total + payment.amount, 0);
  },
}));

// ============================================================================
// PAYMENT PROCESSING - GRAPHQL MUTATIONS
// ============================================================================

export const PROCESS_RECURRING_PAYMENT_MUTATION = `
  mutation ProcessRecurringPayment($input: RecurringPaymentInput!) {
    processRecurringPayment(input: $input) {
      id
      patientId
      clinicId
      amount
      currency
      method {
        id
        type
        provider
        last4
        isDefault
        isVerified
      }
      status
      type
      description
      transactionId
      veritasSignature
      createdAt
      processedAt
    }
  }
`;

export const GENERATE_PAYMENT_ORDER_MUTATION = `
  mutation GeneratePaymentOrder($input: PaymentOrderInput!) {
    generatePaymentOrder(input: $input) {
      id
      patientId
      clinicId
      amount
      currency
      description
      qrCode
      bizumId
      expiresAt
      status
      createdAt
    }
  }
`;

export const CONFIRM_MANUAL_PAYMENT_MUTATION = `
  mutation ConfirmManualPayment($orderId: ID!, $confirmationData: ManualPaymentConfirmation!) {
    confirmManualPayment(orderId: $orderId, confirmationData: $confirmationData) {
      id
      patientId
      clinicId
      amount
      currency
      method {
        id
        type
        provider
      }
      status
      type
      description
      transactionId
      veritasSignature
      createdAt
      processedAt
    }
  }
`;

export const GET_PAYMENT_HISTORY_QUERY = `
  query GetPaymentHistory($patientId: ID!, $limit: Int, $offset: Int) {
    paymentHistory(patientId: $patientId, limit: $limit, offset: $offset) {
      id
      patientId
      clinicId
      amount
      currency
      method {
        id
        type
        provider
        last4
        isDefault
        isVerified
      }
      status
      type
      description
      transactionId
      qrCode
      bizumId
      veritasSignature
      createdAt
      processedAt
    }
  }
`;

// ============================================================================
// PAYMENT UTILITIES - AGNOSTIC BRIDGE
// ============================================================================

export const generateVeritasSignature = (data: any): string => {
  // Simulate @veritas quantum signature generation
  // In production, this would use quantum-resistant cryptography
  const dataString = JSON.stringify(data);
  const mockSignature = btoa(dataString).substring(0, 64);
  return `veritas:${mockSignature}`;
};

export const validatePaymentData = (payment: PaymentHistory): boolean => {
  // Validate @veritas signature
  const expectedSignature = generateVeritasSignature({
    id: payment.id,
    amount: payment.amount,
    patientId: payment.patientId,
    clinicId: payment.clinicId,
  });

  return payment.veritasSignature === expectedSignature;
};

export const processRecurringPayment = async (
  patientId: string,
  clinicId: string,
  amount: number,
  currency: string,
  paymentMethodId: string
): Promise<PaymentHistory> => {
  // Simulate API call to Apollo Nuclear
  const paymentData = {
    id: `payment-${Date.now()}`,
    patientId,
    clinicId,
    amount,
    currency,
    methodId: paymentMethodId,
    type: 'subscription' as const,
    description: 'Pago recurrente de suscripción dental',
  };

  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const payment: PaymentHistory = {
    ...paymentData,
    method: {
      id: paymentMethodId,
      type: 'card',
      provider: 'visa',
      last4: '4242',
      isDefault: true,
      isVerified: true,
    },
    status: 'completed',
    transactionId: `txn_${Date.now()}`,
    veritasSignature: generateVeritasSignature(paymentData),
    createdAt: new Date().toISOString(),
    processedAt: new Date().toISOString(),
  };

  return payment;
};

export const generatePaymentOrder = async (
  patientId: string,
  clinicId: string,
  amount: number,
  currency: string,
  method: 'qr' | 'bizum'
): Promise<PaymentOrder> => {
  // Simulate API call to generate payment order
  const orderData = {
    id: `order-${Date.now()}`,
    patientId,
    clinicId,
    amount,
    currency,
    method,
    description: `Orden de pago ${method.toUpperCase()}`,
  };

  const order: PaymentOrder = {
    ...orderData,
    qrCode: method === 'qr' ? `qr_code_data_${Date.now()}` : undefined,
    bizumId: method === 'bizum' ? `bizum_${Date.now().toString(36).substring(2, 8)}` : undefined,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  return order;
};

export const confirmManualPayment = async (
  orderId: string,
  confirmationData: any
): Promise<PaymentHistory> => {
  // Simulate manual payment confirmation
  const paymentData = {
    id: `payment-${Date.now()}`,
    orderId,
    type: 'manual' as const,
    description: 'Pago manual confirmado',
  };

  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const payment: PaymentHistory = {
    id: paymentData.id,
    patientId: confirmationData.patientId,
    clinicId: confirmationData.clinicId,
    amount: confirmationData.amount,
    currency: confirmationData.currency,
    method: {
      id: 'manual',
      type: 'bank_transfer',
      provider: 'bank',
      isDefault: false,
      isVerified: true,
    },
    status: 'completed',
    type: 'manual',
    description: paymentData.description,
    transactionId: `manual_txn_${Date.now()}`,
    veritasSignature: generateVeritasSignature(paymentData),
    createdAt: new Date().toISOString(),
    processedAt: new Date().toISOString(),
  };

  return payment;
};