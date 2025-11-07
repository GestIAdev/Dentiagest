// 💰 APOLLO FINANCIAL MANAGEMENT STORE
// Zustand Store for Complete Financial Operations
// Date: September 22, 2025

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Local type definitions (BillingService types removed during REST purge)
interface Invoice {
  id: number;
  patient_id: number;
  patient_name: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  items?: InvoiceItem[];
}

interface Payment {
  id: number;
  patient_id: number;
  patient_name: string;
  invoice_number: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  reference_number?: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

// Types for the store
interface FinancialState {
  // State - Invoices
  invoices: Invoice[];
  selectedInvoice: Invoice | null;
  invoiceFilters: {
    status: string;
    patient_id?: number;
    date_from?: string;
    date_to?: string;
    search: string;
  };

  // State - Payments
  payments: Payment[];
  selectedPayment: Payment | null;
  paymentFilters: {
    status: string;
    patient_id?: number;
    date_from?: string;
    date_to?: string;
    search: string;
  };

  // State - Invoice Items
  invoiceItems: InvoiceItem[];
  selectedInvoiceItems: InvoiceItem[];

  // UI State
  activeTab: 'invoices' | 'payments';
  isLoading: boolean;
  error: string | null;
  showInvoiceModal: boolean;
  showPaymentModal: boolean;

  // Analytics
  totalRevenue: number;
  outstandingAmount: number;
  paidInvoicesCount: number;
  pendingPaymentsCount: number;

  // Actions - Invoices
  setInvoices: (invoices: Invoice[]) => void;
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: number, updates: Partial<Invoice>) => void;
  deleteInvoice: (id: number) => void;
  setSelectedInvoice: (invoice: Invoice | null) => void;
  setInvoiceFilters: (filters: Partial<FinancialState['invoiceFilters']>) => void;
  resetInvoiceFilters: () => void;

  // Actions - Payments
  setPayments: (payments: Payment[]) => void;
  addPayment: (payment: Payment) => void;
  updatePayment: (id: number, updates: Partial<Payment>) => void;
  deletePayment: (id: number) => void;
  setSelectedPayment: (payment: Payment | null) => void;
  setPaymentFilters: (filters: Partial<FinancialState['paymentFilters']>) => void;
  resetPaymentFilters: () => void;

  // Actions - Invoice Items
  setInvoiceItems: (items: InvoiceItem[]) => void;
  addInvoiceItem: (item: InvoiceItem) => void;
  updateInvoiceItem: (id: string, updates: Partial<InvoiceItem>) => void;
  deleteInvoiceItem: (id: string) => void;
  setSelectedInvoiceItems: (items: InvoiceItem[]) => void;

  // UI Actions
  setActiveTab: (tab: 'invoices' | 'payments') => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setShowInvoiceModal: (show: boolean) => void;
  setShowPaymentModal: (show: boolean) => void;

  // Analytics Actions
  updateFinancialAnalytics: () => void;

  // Computed getters
  getFilteredInvoices: () => Invoice[];
  getFilteredPayments: () => Payment[];
  getInvoiceById: (id: number) => Invoice | undefined;
  getPaymentById: (id: number) => Payment | undefined;
  getInvoicesByPatient: (patientId: number) => Invoice[];
  getPaymentsByPatient: (patientId: number) => Payment[];
  getOutstandingInvoices: () => Invoice[];
  getOverdueInvoices: () => Invoice[];
  getTotalRevenueByPeriod: (startDate: string, endDate: string) => number;
  getPaymentMethodsStats: () => Record<string, number>;
}

export const useFinancialStore = create<FinancialState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        invoices: [],
        selectedInvoice: null,
        invoiceFilters: {
          status: 'all',
          search: ''
        },

        payments: [],
        selectedPayment: null,
        paymentFilters: {
          status: 'all',
          search: ''
        },

        invoiceItems: [],
        selectedInvoiceItems: [],

        activeTab: 'invoices',
        isLoading: false,
        error: null,
        showInvoiceModal: false,
        showPaymentModal: false,

        totalRevenue: 0,
        outstandingAmount: 0,
        paidInvoicesCount: 0,
        pendingPaymentsCount: 0,

        // Invoice actions
        setInvoices: (invoices) => set((state) => {
          const newState = { invoices };
          // Update analytics after setting invoices
          setTimeout(() => get().updateFinancialAnalytics(), 0);
          return newState;
        }),

        addInvoice: (invoice) => set((state) => ({
          invoices: [...state.invoices, invoice]
        })),

        updateInvoice: (id, updates) => set((state) => ({
          invoices: state.invoices.map(inv =>
            inv.id === id ? { ...inv, ...updates } : inv
          ),
          selectedInvoice: state.selectedInvoice?.id === id
            ? { ...state.selectedInvoice, ...updates }
            : state.selectedInvoice
        })),

        deleteInvoice: (id) => set((state) => ({
          invoices: state.invoices.filter(inv => inv.id !== id),
          selectedInvoice: state.selectedInvoice?.id === id ? null : state.selectedInvoice
        })),

        setSelectedInvoice: (invoice) => set({ selectedInvoice: invoice }),

        setInvoiceFilters: (filters) => set((state) => ({
          invoiceFilters: { ...state.invoiceFilters, ...filters }
        })),

        resetInvoiceFilters: () => set({
          invoiceFilters: {
            status: 'all',
            search: ''
          }
        }),

        // Payment actions
        setPayments: (payments) => set((state) => {
          const newState = { payments };
          // Update analytics after setting payments
          setTimeout(() => get().updateFinancialAnalytics(), 0);
          return newState;
        }),

        addPayment: (payment) => set((state) => ({
          payments: [...state.payments, payment]
        })),

        updatePayment: (id, updates) => set((state) => ({
          payments: state.payments.map(pay =>
            pay.id === id ? { ...pay, ...updates } : pay
          ),
          selectedPayment: state.selectedPayment?.id === id
            ? { ...state.selectedPayment, ...updates }
            : state.selectedPayment
        })),

        deletePayment: (id) => set((state) => ({
          payments: state.payments.filter(pay => pay.id !== id),
          selectedPayment: state.selectedPayment?.id === id ? null : state.selectedPayment
        })),

        setSelectedPayment: (payment) => set({ selectedPayment: payment }),

        setPaymentFilters: (filters) => set((state) => ({
          paymentFilters: { ...state.paymentFilters, ...filters }
        })),

        resetPaymentFilters: () => set({
          paymentFilters: {
            status: 'all',
            search: ''
          }
        }),

        // Invoice Items actions
        setInvoiceItems: (items) => set({ invoiceItems: items }),

        addInvoiceItem: (item) => set((state) => ({
          invoiceItems: [...state.invoiceItems, item]
        })),

        updateInvoiceItem: (id, updates) => set((state) => ({
          invoiceItems: state.invoiceItems.map(item =>
            item.id === id ? { ...item, ...updates } : item
          )
        })),

        deleteInvoiceItem: (id) => set((state) => ({
          invoiceItems: state.invoiceItems.filter(item => item.id !== id)
        })),

        setSelectedInvoiceItems: (items) => set({ selectedInvoiceItems: items }),

        // UI actions
        setActiveTab: (activeTab) => set({ activeTab }),

        setLoading: (isLoading) => set({ isLoading }),

        setError: (error) => set({ error }),

        setShowInvoiceModal: (showInvoiceModal) => set({ showInvoiceModal }),

        setShowPaymentModal: (showPaymentModal) => set({ showPaymentModal }),

        // Analytics actions
        updateFinancialAnalytics: () => set((state) => {
          const paidInvoices = state.invoices.filter(inv => inv.status === 'paid');
          const outstandingInvoices = state.invoices.filter(inv =>
            inv.status === 'sent' || inv.status === 'overdue'
          );

          const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
          const outstandingAmount = outstandingInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
          const paidInvoicesCount = paidInvoices.length;
          const pendingPaymentsCount = state.payments.filter(pay => pay.status === 'pending').length;

          return {
            totalRevenue,
            outstandingAmount,
            paidInvoicesCount,
            pendingPaymentsCount
          };
        }),

        // Computed getters
        getFilteredInvoices: () => {
          const state = get();
          return state.invoices.filter(invoice => {
            const matchesSearch = state.invoiceFilters.search === '' ||
              invoice.patient_name.toLowerCase().includes(state.invoiceFilters.search.toLowerCase()) ||
              invoice.invoice_number.toLowerCase().includes(state.invoiceFilters.search.toLowerCase());

            const matchesStatus = state.invoiceFilters.status === 'all' || invoice.status === state.invoiceFilters.status;

            const matchesPatient = !state.invoiceFilters.patient_id || invoice.patient_id === state.invoiceFilters.patient_id;

            const matchesDate = (!state.invoiceFilters.date_from || invoice.issue_date >= state.invoiceFilters.date_from) &&
              (!state.invoiceFilters.date_to || invoice.issue_date <= state.invoiceFilters.date_to);

            return matchesSearch && matchesStatus && matchesPatient && matchesDate;
          });
        },

        getFilteredPayments: () => {
          const state = get();
          return state.payments.filter(payment => {
            const matchesSearch = state.paymentFilters.search === '' ||
              payment.patient_name.toLowerCase().includes(state.paymentFilters.search.toLowerCase()) ||
              payment.invoice_number.toLowerCase().includes(state.paymentFilters.search.toLowerCase()) ||
              (payment.reference_number?.toLowerCase().includes(state.paymentFilters.search.toLowerCase()) ?? false);

            const matchesStatus = state.paymentFilters.status === 'all' || payment.status === state.paymentFilters.status;

            const matchesPatient = !state.paymentFilters.patient_id || payment.patient_id === state.paymentFilters.patient_id;

            const matchesDate = (!state.paymentFilters.date_from || payment.payment_date >= state.paymentFilters.date_from) &&
              (!state.paymentFilters.date_to || payment.payment_date <= state.paymentFilters.date_to);

            return matchesSearch && matchesStatus && matchesPatient && matchesDate;
          });
        },

        getInvoiceById: (id) => {
          const state = get();
          return state.invoices.find(inv => inv.id === id);
        },

        getPaymentById: (id) => {
          const state = get();
          return state.payments.find(pay => pay.id === id);
        },

        getInvoicesByPatient: (patientId) => {
          const state = get();
          return state.invoices.filter(inv => inv.patient_id === patientId);
        },

        getPaymentsByPatient: (patientId) => {
          const state = get();
          return state.payments.filter(pay => pay.patient_id === patientId);
        },

        getOutstandingInvoices: () => {
          const state = get();
          return state.invoices.filter(inv =>
            inv.status === 'sent' || inv.status === 'overdue'
          );
        },

        getOverdueInvoices: () => {
          const state = get();
          const today = new Date().toISOString().split('T')[0];
          return state.invoices.filter(inv =>
            inv.status === 'overdue' ||
            (inv.status === 'sent' && inv.due_date < today)
          );
        },

        getTotalRevenueByPeriod: (startDate, endDate) => {
          const state = get();
          return state.payments
            .filter(pay =>
              pay.status === 'completed' &&
              pay.payment_date >= startDate &&
              pay.payment_date <= endDate
            )
            .reduce((sum, pay) => sum + pay.amount, 0);
        },

        getPaymentMethodsStats: () => {
          const state = get();
          return state.payments
            .filter(pay => pay.status === 'completed')
            .reduce((stats, pay) => {
              const method = pay.payment_method;
              stats[method] = (stats[method] || 0) + pay.amount;
              return stats;
            }, {} as Record<string, number>);
        }
      }),
      {
        name: 'financial-store',
        partialize: (state) => ({
          activeTab: state.activeTab,
          invoiceFilters: state.invoiceFilters,
          paymentFilters: state.paymentFilters
        })
      }
    ),
    { name: 'financial-store' }
  )
);
