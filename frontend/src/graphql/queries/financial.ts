// 💰🎸 GRAPHQL QUERIES - FINANCIAL MANAGER V3.0
/**
 * GraphQL Queries for Financial Manager V3.0
 *
 * 🎯 MISSION: Provide unified financial operations with V3.0 features
 * ✅ Invoice management with AI insights
 * ✅ Payment processing with blockchain integration
 * ✅ Financial analytics and reporting
 * ✅ Automated billing workflows
 * ✅ Compliance and audit trails
 */

import { gql } from '@apollo/client';

// 🎯 GET INVOICES - V3.0 FINANCIAL MANAGEMENT
export const GET_INVOICES = gql`
  query GetInvoices(
    $patientId: String
    $status: String
    $dateFrom: DateTime
    $dateTo: DateTime
    $searchTerm: String
    $limit: Int
    $offset: Int
  ) {
    invoices(
      patientId: $patientId
      status: $status
      dateFrom: $dateFrom
      dateTo: $dateTo
      searchTerm: $searchTerm
      limit: $limit
      offset: $offset
    ) {
      id
      patient_id
      patient_name
      invoice_number
      issue_date
      due_date
      status
      subtotal
      tax_rate
      tax_amount
      discount_amount
      total_amount
      notes
      payment_terms
      created_at
      updated_at

      # V3.0 ENHANCED FIELDS
      ai_insights
      risk_score
      payment_probability
      overdue_risk
      compliance_status
      blockchain_tx_hash

      # RELATIONS
      patient {
        id
        first_name
        last_name
        email
        phone
      }

      # ITEMS
      items {
        id
        description
        quantity
        unit_price
        total
        treatment_id
        product_id
      }
    }
  }
`;

// 🎯 GET PAYMENTS - V3.0 PAYMENT MANAGEMENT
export const GET_PAYMENTS = gql`
  query GetPayments(
    $patientId: String
    $status: String
    $dateFrom: DateTime
    $dateTo: DateTime
    $searchTerm: String
    $limit: Int
    $offset: Int
  ) {
    payments(
      patientId: $patientId
      status: $status
      dateFrom: $dateFrom
      dateTo: $dateTo
      searchTerm: $searchTerm
      limit: $limit
      offset: $offset
    ) {
      id
      invoice_id
      invoice_number
      patient_id
      patient_name
      amount
      payment_date
      payment_method
      reference_number
      notes
      status
      processed_by
      created_at

      # V3.0 ENHANCED FIELDS
      blockchain_tx_hash
      crypto_amount
      exchange_rate
      processing_fee
      risk_assessment
      compliance_check
    }
  }
`;

// 🎯 GET INVOICE BY ID - V3.0 DETAILED VIEW
export const GET_INVOICE_BY_ID = gql`
  query GetInvoiceById($id: ID!) {
    invoice(id: $id) {
      id
      patient_id
      patient_name
      invoice_number
      issue_date
      due_date
      status
      subtotal
      tax_rate
      tax_amount
      discount_amount
      total_amount
      notes
      payment_terms
      created_at
      updated_at

      # V3.0 ENHANCED FIELDS
      ai_insights
      risk_score
      payment_probability
      overdue_risk
      compliance_status
      blockchain_tx_hash

      # RELATIONS
      patient {
        id
        first_name
        last_name
        email
        phone
        address
        insurance_provider
        insurance_number
      }

      # ITEMS
      items {
        id
        description
        quantity
        unit_price
        total
        treatment_id
        product_id
        treatment {
          id
          name
          category
          cost
        }
        product {
          id
          name
          category
          price
        }
      }

      # PAYMENT HISTORY
      payments {
        id
        amount
        payment_date
        payment_method
        reference_number
        status
        processed_by
        blockchain_tx_hash
      }
    }
  }
`;

// 🎯 CREATE INVOICE MUTATION - V3.0 SMART INVOICING
export const CREATE_INVOICE = gql`
  mutation CreateInvoice($input: CreateInvoiceInput!) {
    createInvoice(input: $input) {
      id
      patient_id
      patient_name
      invoice_number
      issue_date
      due_date
      status
      subtotal
      tax_rate
      tax_amount
      discount_amount
      total_amount
      notes
      payment_terms
      created_at
      updated_at

      # V3.0 ENHANCED FIELDS
      ai_insights
      risk_score
      payment_probability
      compliance_status

      # ITEMS
      items {
        id
        description
        quantity
        unit_price
        total
        treatment_id
        product_id
      }
    }
  }
`;

// 🎯 UPDATE INVOICE MUTATION - V3.0 FLEXIBLE EDITING
export const UPDATE_INVOICE = gql`
  mutation UpdateInvoice($id: ID!, $input: UpdateInvoiceInput!) {
    updateInvoice(id: $id, input: $input) {
      id
      patient_id
      patient_name
      invoice_number
      issue_date
      due_date
      status
      subtotal
      tax_rate
      tax_amount
      discount_amount
      total_amount
      notes
      payment_terms
      updated_at

      # V3.0 ENHANCED FIELDS
      ai_insights
      risk_score
      payment_probability
      compliance_status
    }
  }
`;

// 🎯 DELETE INVOICE MUTATION - V3.0 SAFE DELETION
export const DELETE_INVOICE = gql`
  mutation DeleteInvoice($id: ID!) {
    deleteInvoice(id: $id) {
      success
      message
      invoice_id
    }
  }
`;

// 🎯 CREATE PAYMENT MUTATION - V3.0 ADVANCED PAYMENT PROCESSING
export const CREATE_PAYMENT = gql`
  mutation CreatePayment($input: CreatePaymentInput!) {
    createPayment(input: $input) {
      id
      invoice_id
      invoice_number
      patient_id
      patient_name
      amount
      payment_date
      payment_method
      reference_number
      notes
      status
      processed_by
      created_at

      # V3.0 ENHANCED FIELDS
      blockchain_tx_hash
      crypto_amount
      exchange_rate
      processing_fee
      risk_assessment
      compliance_check
    }
  }
`;

// 🎯 UPDATE PAYMENT MUTATION - V3.0 PAYMENT MANAGEMENT
export const UPDATE_PAYMENT = gql`
  mutation UpdatePayment($id: ID!, $input: UpdatePaymentInput!) {
    updatePayment(id: $id, input: $input) {
      id
      invoice_id
      invoice_number
      amount
      payment_date
      payment_method
      reference_number
      notes
      status
      processed_by

      # V3.0 ENHANCED FIELDS
      blockchain_tx_hash
      crypto_amount
      exchange_rate
      processing_fee
    }
  }
`;

// 🎯 DELETE PAYMENT MUTATION - V3.0 PAYMENT CONTROL
export const DELETE_PAYMENT = gql`
  mutation DeletePayment($id: ID!) {
    deletePayment(id: $id) {
      success
      message
      payment_id
    }
  }
`;

// 🎯 GENERATE INVOICE PDF - V3.0 DOCUMENT GENERATION
export const GENERATE_INVOICE_PDF = gql`
  mutation GenerateInvoicePDF($invoiceId: ID!) {
    generateInvoicePDF(invoiceId: $invoiceId) {
      success
      message
      download_url
      file_size
      generated_at
    }
  }
`;

// 🎯 SEND INVOICE EMAIL - V3.0 COMMUNICATION
export const SEND_INVOICE_EMAIL = gql`
  mutation SendInvoiceEmail($invoiceId: ID!, $emailData: EmailInput) {
    sendInvoiceEmail(invoiceId: $invoiceId, emailData: $emailData) {
      success
      message
      email_id
      sent_at
      recipient
    }
  }
`;

// 🎯 FINANCIAL ANALYTICS - V3.0 INSIGHTS
export const GET_FINANCIAL_ANALYTICS = gql`
  query GetFinancialAnalytics(
    $dateFrom: DateTime
    $dateTo: DateTime
    $patientId: String
  ) {
    financialAnalytics(
      dateFrom: $dateFrom
      dateTo: $dateTo
      patientId: $patientId
    ) {
      total_revenue
      total_outstanding
      total_overdue
      payment_rate
      average_payment_time
      top_payment_methods
      revenue_by_month {
        month
        revenue
        invoice_count
      }
      outstanding_by_age {
        range
        amount
        count
      }
      payment_method_distribution {
        method
        amount
        percentage
        count
      }
      patient_payment_history {
        patient_id
        patient_name
        total_paid
        total_outstanding
        last_payment_date
        payment_count
      }
    }
  }
`;

// 🎯 OUTSTANDING INVOICES - V3.0 MONITORING
export const GET_OUTSTANDING_INVOICES = gql`
  query GetOutstandingInvoices(
    $overdueOnly: Boolean
    $limit: Int
    $offset: Int
  ) {
    outstandingInvoices(
      overdueOnly: $overdueOnly
      limit: $limit
      offset: $offset
    ) {
      id
      patient_id
      patient_name
      invoice_number
      issue_date
      due_date
      total_amount
      outstanding_amount
      days_overdue
      status
      last_payment_date
      risk_score
      ai_recommendations
    }
  }
`;

// 🎯 PATIENT STATEMENT - V3.0 REPORTING
export const GENERATE_PATIENT_STATEMENT = gql`
  mutation GeneratePatientStatement($patientId: ID!, $dateFrom: DateTime, $dateTo: DateTime) {
    generatePatientStatement(
      patientId: $patientId
      dateFrom: $dateFrom
      dateTo: $dateTo
    ) {
      success
      message
      download_url
      statement_period
      total_amount
      paid_amount
      outstanding_amount
    }
  }
`;

// 🎯 BULK INVOICE OPERATIONS - V3.0 ENTERPRISE
export const BULK_UPDATE_INVOICES = gql`
  mutation BulkUpdateInvoices(
    $invoiceIds: [ID!]!
    $operation: String!
    $data: JSON
  ) {
    bulkUpdateInvoices(
      invoiceIds: $invoiceIds
      operation: $operation
      data: $data
    ) {
      success
      message
      affected_count
      updated_invoices {
        id
        status
        updated_at
      }
    }
  }
`;

// 🎯 PAYMENT PROCESSING STATUS - V3.0 REAL-TIME
export const GET_PAYMENT_PROCESSING_STATUS = gql`
  query GetPaymentProcessingStatus($paymentId: ID!) {
    paymentProcessingStatus(paymentId: $paymentId) {
      payment_id
      status
      progress
      current_step
      estimated_completion_time
      blockchain_confirmations
      risk_checks_passed
      compliance_checks_passed
      errors
      retry_count
      processing_started_at
      last_updated_at
    }
  }
`;

// 🎯 BLOCKCHAIN PAYMENT INTEGRATION - V3.0 CRYPTO
export const PROCESS_BLOCKCHAIN_PAYMENT = gql`
  mutation ProcessBlockchainPayment($input: BlockchainPaymentInput!) {
    processBlockchainPayment(input: $input) {
      payment_id
      blockchain_tx_hash
      crypto_amount
      exchange_rate
      network_fee
      confirmations_required
      confirmations_current
      status
      estimated_completion_time
      wallet_address
      qr_code_url
    }
  }
`;

// 🎯 AI FINANCIAL INSIGHTS - V3.0 PREDICTIVE ANALYTICS
export const GET_AI_FINANCIAL_INSIGHTS = gql`
  query GetAIFinancialInsights(
    $patientId: String
    $timeframe: String
  ) {
    aiFinancialInsights(
      patientId: $patientId
      timeframe: $timeframe
    ) {
      patient_payment_probability
      predicted_payment_date
      risk_factors
      recommended_actions
      payment_pattern_analysis
      seasonal_trends
      comparative_analysis
      confidence_score
      insights_generated_at
    }
  }
`;

// 🎯 COMPLIANCE REPORTING - V3.0 REGULATORY
export const GET_FINANCIAL_COMPLIANCE_REPORT = gql`
  query GetFinancialComplianceReport(
    $dateFrom: DateTime
    $dateTo: DateTime
    $regulatoryFramework: String
  ) {
    financialComplianceReport(
      dateFrom: $dateFrom
      dateTo: $dateTo
      regulatoryFramework: $regulatoryFramework
    ) {
      compliance_status
      violations_found
      violations_list {
        type
        description
        severity
        affected_records
        remediation_required
        deadline
      }
      audit_trail_complete
      data_retention_compliant
      gdpr_compliant
      hipaa_compliant
      local_regulations_compliant
      report_generated_at
      next_audit_due
    }
  }
`;

// 🎯 FINANCIAL DASHBOARD DATA - V3.0 EXECUTIVE VIEW
export const GET_FINANCIAL_DASHBOARD = gql`
  query GetFinancialDashboard(
    $timeframe: String
    $compareWith: String
  ) {
    financialDashboard(
      timeframe: $timeframe
      compareWith: $compareWith
    ) {
      kpis {
        total_revenue
        revenue_growth
        outstanding_amount
        collection_rate
        average_payment_time
        overdue_percentage
      }
      charts {
        revenue_trend {
          date
          revenue
          target
        }
        payment_methods {
          method
          amount
          percentage
        }
        aging_analysis {
          range
          amount
          percentage
        }
        top_patients {
          patient_id
          patient_name
          total_revenue
          outstanding_amount
        }
      }
      alerts {
        type
        message
        severity
        action_required
        affected_count
      }
      predictions {
        next_month_revenue
        confidence_interval
        risk_factors
        opportunities
      }
    }
  }
`;

// 🎯 EXPORT FINANCIAL DATA - V3.0 DATA PORTABILITY
export const EXPORT_FINANCIAL_DATA = gql`
  mutation ExportFinancialData(
    $dataType: String!
    $format: String!
    $filters: FinancialExportFiltersInput
    $includeRelatedData: Boolean
  ) {
    exportFinancialData(
      dataType: $dataType
      format: $format
      filters: $filters
      includeRelatedData: $includeRelatedData
    ) {
      export_id
      status
      download_url
      file_size
      record_count
      format
      estimated_completion_time
      checksum
    }
  }
`;

// 🎯 FINANCIAL SYSTEM HEALTH - V3.0 MONITORING
export const GET_FINANCIAL_SYSTEM_HEALTH = gql`
  query GetFinancialSystemHealth {
    financialSystemHealth {
      service_name
      status
      response_time_ms
      last_check
      uptime_percentage
      error_rate
      active_payments
      pending_invoices
      blockchain_sync_status
      ai_service_status
      compliance_service_status
      backup_status
      version
    }
  }
`;