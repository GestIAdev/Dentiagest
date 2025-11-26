//  BILLING GRAPHQL QUERIES V4.0 - OPERACIÓN LÁZARO
// Date: November 26, 2025
// Mission: Clean billing queries aligned with Selene V5 BillingDataV3 schema
// Status: PURGED of all _veritas legacy corruption

import { gql } from '@apollo/client';

// ============================================================================
// TYPES - Aligned with Selene V5 BillingDataV3
// ============================================================================

export interface BillingData {
  id: string;
  patientId: string;
  invoiceNumber: string;
  subtotal: number;
  taxRate: number | null;
  taxAmount: number | null;
  discountAmount: number | null;
  totalAmount: number;
  currency: string;
  issueDate: string;
  dueDate: string | null;
  paidDate: string | null;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  paymentTerms: string | null;
  notes: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  treatmentId: string | null;
  materialCost: number | null;
  profitMargin: number | null;
}

export interface GetBillingDataResponse {
  billingDataV3: BillingData[];
}

export interface GetBillingDatumResponse {
  billingDatumV3: BillingData | null;
}

// ============================================================================
// QUERIES
// ============================================================================

export const GET_INVOICES = gql`
  query GetBillingData($patientId: ID, $limit: Int, $offset: Int) {
    billingDataV3(patientId: $patientId, limit: $limit, offset: $offset) {
      id
      patientId
      invoiceNumber
      subtotal
      taxRate
      taxAmount
      discountAmount
      totalAmount
      currency
      issueDate
      dueDate
      paidDate
      status
      paymentTerms
      notes
      createdBy
      createdAt
      updatedAt
      treatmentId
      materialCost
      profitMargin
    }
  }
`;

export const GET_INVOICE = gql`
  query GetBillingDatum($id: ID!) {
    billingDatumV3(id: $id) {
      id
      patientId
      invoiceNumber
      subtotal
      taxRate
      taxAmount
      discountAmount
      totalAmount
      currency
      issueDate
      dueDate
      paidDate
      status
      paymentTerms
      notes
      createdBy
      createdAt
      updatedAt
      treatmentId
      materialCost
      profitMargin
    }
  }
`;

// ============================================================================
// MUTATIONS
// ============================================================================

export const CREATE_INVOICE = gql`
  mutation CreateBillingDataV3($input: BillingDataV3Input!) {
    createBillingDataV3(input: $input) {
      id
      patientId
      invoiceNumber
      subtotal
      taxRate
      taxAmount
      discountAmount
      totalAmount
      currency
      issueDate
      dueDate
      status
      notes
      createdAt
      treatmentId
      materialCost
      profitMargin
    }
  }
`;

export const UPDATE_INVOICE = gql`
  mutation UpdateBillingDataV3($id: ID!, $input: UpdateBillingDataV3Input!) {
    updateBillingDataV3(id: $id, input: $input) {
      id
      patientId
      invoiceNumber
      subtotal
      taxRate
      taxAmount
      discountAmount
      totalAmount
      currency
      issueDate
      dueDate
      paidDate
      status
      notes
      updatedAt
      treatmentId
      materialCost
      profitMargin
    }
  }
`;

export const DELETE_INVOICE = gql`
  mutation DeleteBillingDataV3($id: ID!) {
    deleteBillingDataV3(id: $id)
  }
`;

// ============================================================================
// PAYMENT PLANS
// ============================================================================

export const GET_PAYMENT_PLANS = gql`
  query GetPaymentPlans($billingId: ID, $patientId: ID, $status: String) {
    getPaymentPlans(billingId: $billingId, patientId: $patientId, status: $status) {
      id
      billingId
      patientId
      totalAmount
      installments
      frequency
      startDate
      status
      createdAt
      updatedAt
    }
  }
`;

export const GET_PARTIAL_PAYMENTS = gql`
  query GetPartialPayments($invoiceId: ID!, $patientId: ID) {
    getPartialPayments(invoiceId: $invoiceId, patientId: $patientId) {
      id
      invoiceId
      paymentPlanId
      amount
      paymentDate
      method
      status
      reference
      createdAt
    }
  }
`;

export const CREATE_PAYMENT_PLAN = gql`
  mutation CreatePaymentPlan($input: CreatePaymentPlanInput!) {
    createPaymentPlan(input: $input) {
      id
      billingId
      patientId
      totalAmount
      installments
      frequency
      startDate
      status
      createdAt
    }
  }
`;

export const RECORD_PARTIAL_PAYMENT = gql`
  mutation RecordPartialPayment($input: RecordPartialPaymentInput!) {
    recordPartialPayment(input: $input) {
      id
      invoiceId
      amount
      paymentDate
      method
      status
      reference
      createdAt
    }
  }
`;

// ============================================================================
// LEGACY STUBS (prevent import errors)
// ============================================================================

export const GET_PAYMENTS = GET_PARTIAL_PAYMENTS;

export const GET_FINANCIAL_ANALYTICS = gql`
  query GetFinancialAnalyticsStub {
    __typename
  }
`;
