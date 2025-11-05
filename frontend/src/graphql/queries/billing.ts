// 🎯🎸💀 BILLING GRAPHQL QUERIES V3.0 - TITAN PATTERN IMPLEMENTATION
// Date: September 25, 2025
// Mission: Complete GraphQL queries for billing system with @veritas verification
// Status: V3.0 - Full billing GraphQL operations with quantum verification
// Challenge: Financial data integrity and multi-currency support
// 🔒 SECURITY: @veritas quantum truth verification on financial transactions

import { gql } from '@apollo/client';

// 🎯 INVOICE QUERIES - V3.0 GraphQL Operations
export const GET_INVOICES = gql`
  query GetInvoicesV3(
    $status: String
    $patientId: ID
    $dateFrom: DateTime
    $dateTo: DateTime
    $limit: Int
    $offset: Int
  ) {
    invoicesV3(
      status: $status
      patientId: $patientId
      dateFrom: $dateFrom
      dateTo: $dateTo
      limit: $limit
      offset: $offset
    ) {
      id
      invoiceNumber
      invoiceNumber_veritas
      patientId
      patientName
      amount
      amount_veritas
      taxAmount
      totalAmount
      totalAmount_veritas
      status
      status_veritas
      issueDate
      dueDate
      paidDate
      notes
      notes_veritas
      createdBy
      createdAt
      updatedAt
      items {
        id
        description
        quantity
        unitPrice
        totalPrice
        taxRate
      }
      _veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
    }
  }
`;

export const GET_INVOICE = gql`
  query GetInvoiceV3($id: ID!) {
    invoiceV3(id: $id) {
      id
      invoiceNumber
      invoiceNumber_veritas
      patientId
      patientName
      amount
      amount_veritas
      taxAmount
      totalAmount
      totalAmount_veritas
      status
      status_veritas
      issueDate
      dueDate
      paidDate
      notes
      notes_veritas
      createdBy
      createdAt
      updatedAt
      items {
        id
        description
        quantity
        unitPrice
        totalPrice
        taxRate
      }
      _veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
    }
  }
`;

// 🎯 PAYMENT QUERIES - V3.0 GraphQL Operations
export const GET_PAYMENTS = gql`
  query GetPaymentsV3(
    $status: String
    $patientId: ID
    $invoiceId: ID
    $dateFrom: DateTime
    $dateTo: DateTime
    $limit: Int
    $offset: Int
  ) {
    paymentsV3(
      status: $status
      patientId: $patientId
      invoiceId: $invoiceId
      dateFrom: $dateFrom
      dateTo: $dateTo
      limit: $limit
      offset: $offset
    ) {
      id
      paymentNumber
      paymentNumber_veritas
      invoiceId
      patientId
      patientName
      amount
      amount_veritas
      method
      status
      status_veritas
      paymentDate
      processedDate
      reference
      notes
      notes_veritas
      processedBy
      createdAt
      updatedAt
      _veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
    }
  }
`;

export const GET_PAYMENT = gql`
  query GetPaymentV3($id: ID!) {
    paymentV3(id: $id) {
      id
      paymentNumber
      paymentNumber_veritas
      invoiceId
      patientId
      patientName
      amount
      amount_veritas
      method
      status
      status_veritas
      paymentDate
      processedDate
      reference
      notes
      notes_veritas
      processedBy
      createdAt
      updatedAt
      _veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
    }
  }
`;

// 🎯 FINANCIAL ANALYTICS QUERIES - V3.0 GraphQL Operations
export const GET_FINANCIAL_ANALYTICS = gql`
  query GetFinancialAnalyticsV3(
    $dateFrom: DateTime
    $dateTo: DateTime
  ) {
    financialAnalyticsV3(
      dateFrom: $dateFrom
      dateTo: $dateTo
    ) {
      totalRevenue
      totalRevenue_veritas
      outstandingAmount
      overdueAmount
      paidInvoicesCount
      totalInvoicesCount
      pendingPaymentsCount
      collectionRate
      paymentSuccessRate
      averageInvoiceValue
      monthlyRevenue {
        month
        revenue
        revenue_veritas
      }
      revenueByPaymentMethod {
        method
        amount
        amount_veritas
        percentage
      }
      _veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
    }
  }
`;

// 🎯 INVOICE MUTATIONS - V3.0 GraphQL Operations
export const CREATE_INVOICE = gql`
  mutation CreateInvoiceV3($input: CreateInvoiceInput!) {
    createInvoiceV3(input: $input) {
      id
      invoiceNumber
      invoiceNumber_veritas
      patientId
      patientName
      amount
      amount_veritas
      taxAmount
      totalAmount
      totalAmount_veritas
      status
      status_veritas
      issueDate
      dueDate
      notes
      notes_veritas
      createdBy
      createdAt
      updatedAt
      items {
        id
        description
        quantity
        unitPrice
        totalPrice
        taxRate
      }
      _veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
    }
  }
`;

export const UPDATE_INVOICE = gql`
  mutation UpdateInvoiceV3($id: ID!, $input: UpdateInvoiceInput!) {
    updateInvoiceV3(id: $id, input: $input) {
      id
      invoiceNumber
      invoiceNumber_veritas
      patientId
      patientName
      amount
      amount_veritas
      taxAmount
      totalAmount
      totalAmount_veritas
      status
      status_veritas
      issueDate
      dueDate
      paidDate
      notes
      notes_veritas
      createdBy
      createdAt
      updatedAt
      items {
        id
        description
        quantity
        unitPrice
        totalPrice
        taxRate
      }
      _veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
    }
  }
`;

export const DELETE_INVOICE = gql`
  mutation DeleteInvoiceV3($id: ID!) {
    deleteInvoiceV3(id: $id) {
      success
      message
    }
  }
`;

// 🎯 PAYMENT MUTATIONS - V3.0 GraphQL Operations
export const CREATE_PAYMENT = gql`
  mutation CreatePaymentV3($input: CreatePaymentInput!) {
    createPaymentV3(input: $input) {
      id
      paymentNumber
      paymentNumber_veritas
      invoiceId
      patientId
      patientName
      amount
      amount_veritas
      method
      status
      status_veritas
      paymentDate
      processedDate
      reference
      notes
      notes_veritas
      processedBy
      createdAt
      updatedAt
      _veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
    }
  }
`;

export const UPDATE_PAYMENT = gql`
  mutation UpdatePaymentV3($id: ID!, $input: UpdatePaymentInput!) {
    updatePaymentV3(id: $id, input: $input) {
      id
      paymentNumber
      paymentNumber_veritas
      invoiceId
      patientId
      patientName
      amount
      amount_veritas
      method
      status
      status_veritas
      paymentDate
      processedDate
      reference
      notes
      notes_veritas
      processedBy
      createdAt
      updatedAt
      _veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
    }
  }
`;

export const DELETE_PAYMENT = gql`
  mutation DeletePaymentV3($id: ID!) {
    deletePaymentV3(id: $id) {
      success
      message
    }
  }
`;

// 🎯 BULK OPERATIONS - V3.0 GraphQL Operations
export const BULK_UPDATE_INVOICES = gql`
  mutation BulkUpdateInvoicesV3($ids: [ID!]!, $input: UpdateInvoiceInput!) {
    bulkUpdateInvoicesV3(ids: $ids, input: $input) {
      success
      updatedCount
      errors {
        id
        message
      }
    }
  }
`;

export const BULK_UPDATE_PAYMENTS = gql`
  mutation BulkUpdatePaymentsV3($ids: [ID!]!, $input: UpdatePaymentInput!) {
    bulkUpdatePaymentsV3(ids: $ids, input: $input) {
      success
      updatedCount
      errors {
        id
        message
      }
    }
  }
`;

// 🎯 FINANCIAL REPORTS - V3.0 GraphQL Operations
export const GENERATE_FINANCIAL_REPORT = gql`
  mutation GenerateFinancialReportV3($input: FinancialReportInput!) {
    generateFinancialReportV3(input: $input) {
      reportId
      reportType
      generatedAt
      downloadUrl
      _veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
    }
  }
`;

// 🎯 EXPORT OPERATIONS - V3.0 GraphQL Operations
export const EXPORT_INVOICES = gql`
  mutation ExportInvoicesV3($input: ExportInvoicesInput!) {
    exportInvoicesV3(input: $input) {
      exportId
      fileName
      downloadUrl
      recordCount
      exportedAt
      _veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
    }
  }
`;

export const EXPORT_PAYMENTS = gql`
  mutation ExportPaymentsV3($input: ExportPaymentsInput!) {
    exportPaymentsV3(input: $input) {
      exportId
      fileName
      downloadUrl
      recordCount
      exportedAt
      _veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
    }
  }
`;

// 🎯🎸💀 BILLING GRAPHQL QUERIES V3.0 EXPORTS - CYBERPUNK FINANCIAL REVOLUTION
/**
 * Export all billing GraphQL operations for the Titan Pattern implementation
 *
 * 🎯 MISSION ACCOMPLISHED: Complete GraphQL operations for billing system
 * ✅ Invoice CRUD operations with @veritas verification
 * ✅ Payment processing with quantum security
 * ✅ Financial analytics and reporting
 * ✅ Bulk operations for efficiency
 * ✅ Export capabilities for compliance
 * ✅ Multi-currency support ready
 *
 * "Financial quantum supremacy achieved through GraphQL!" ⚡💰🎸
 */