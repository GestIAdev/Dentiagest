/**
 * 💰 BILLING GRAPHQL OPERATIONS
 * Conexión REAL a Selene Song Core - Payment & Invoice System
 * By PunkClaude - Directiva #003 GeminiEnder
 */

import { gql } from '@apollo/client';

// ============================================================================
// QUERIES
// ============================================================================

export const GET_PATIENT_BILLING_DATA = gql`
  query GetPatientBillingData(
    $patientId: ID
    $limit: Int
    $offset: Int
  ) {
    billingDataV3(
      patientId: $patientId
      limit: $limit
      offset: $offset
    ) {
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
      veritasSignature
      blockchainTxHash
      createdBy
      createdAt
      updatedAt
    }
  }
`;

export const GET_BILLING_BY_ID = gql`
  query GetBillingById($id: ID!) {
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
      veritasSignature
      blockchainTxHash
      createdBy
      createdAt
      updatedAt
    }
  }
`;

// ============================================================================
// MUTATIONS
// ============================================================================

export const CREATE_BILLING = gql`
  mutation CreateBilling($input: BillingDataV3Input!) {
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
      paidDate
      status
      paymentTerms
      notes
      createdBy
      createdAt
      updatedAt
    }
  }
`;

// ❌ REMOVED: createBillingFromSubscriptionV3 NO EXISTE en Selene schema
// Esta mutation fue inventada en el frontend sin implementación en backend
// Si necesitas crear billing desde subscription, usa createBillingDataV3 con los datos correctos

export const UPDATE_BILLING = gql`
  mutation UpdateBilling($id: ID!, $input: UpdateBillingDataV3Input!) {
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
      paymentTerms
      notes
      updatedAt
    }
  }
`;

// ❌ REMOVED: markBillingPaidV3 NO EXISTE en Selene schema
// Para marcar como pagado, usar updateBillingDataV3 con status: PAID y paidDate

// ============================================================================
// TYPES (para TypeScript)
// ============================================================================

// ============================================================================
// TYPES - ALIGNED WITH SELENE SCHEMA (BillingDataV3)
// ============================================================================

export type BillingStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface BillingData {
  id: string;
  patientId: string;
  invoiceNumber: string;
  subtotal: number;
  taxRate?: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount: number;
  currency: string;
  issueDate: string;
  dueDate?: string;
  paidDate?: string;
  status: BillingStatus;
  paymentTerms?: string;
  notes?: string;
  veritasSignature?: string;
  blockchainTxHash?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBillingInput {
  patientId: string;
  invoiceNumber: string;
  subtotal: number;
  taxRate?: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount: number;
  currency?: string;
  issueDate?: string;
  dueDate?: string;
  status?: BillingStatus;
  paymentTerms?: string;
  notes?: string;
  createdBy?: string;
}

export interface UpdateBillingInput {
  subtotal?: number;
  taxRate?: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount?: number;
  currency?: string;
  issueDate?: string;
  dueDate?: string;
  status?: BillingStatus;
  paymentTerms?: string;
  notes?: string;
}
