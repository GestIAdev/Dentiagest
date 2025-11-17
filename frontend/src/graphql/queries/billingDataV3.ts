// 💰🎯 BILLING DATA V3 GRAPHQL QUERIES - ECONOMIC SINGULARITY (Directiva #005)
// Date: November 17, 2025
// Mission: Complete GraphQL queries for BillingDataV3 with profit margin analysis
// Status: V1.0 - Economic Singularity integration
// Challenge: Real-time profitability tracking per invoice

import { gql } from '@apollo/client';

// 🎯 BILLING DATA V3 FRAGMENT - Complete invoice data with Economic Singularity
export const BILLING_DATA_V3_FRAGMENT = gql`
  fragment BillingDataV3Fields on BillingDataV3 {
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
    
    # 💰 ECONOMIC SINGULARITY (Directiva #005)
    treatmentId
    materialCost
    profitMargin
  }
`;

// 🎯 GET BILLING DATA V3 LIST
export const GET_BILLING_DATA_V3_LIST = gql`
  ${BILLING_DATA_V3_FRAGMENT}
  query GetBillingDataV3List(
    $patientId: ID
    $limit: Int
    $offset: Int
  ) {
    getBillingDataV3(
      patientId: $patientId
      limit: $limit
      offset: $offset
    ) {
      ...BillingDataV3Fields
    }
  }
`;

// 🎯 GET BILLING DATA V3 BY ID
export const GET_BILLING_DATA_V3_BY_ID = gql`
  ${BILLING_DATA_V3_FRAGMENT}
  query GetBillingDataV3ById($id: ID!) {
    getBillingDataV3ById(id: $id) {
      ...BillingDataV3Fields
    }
  }
`;

// 🎯 CREATE BILLING DATA V3
export const CREATE_BILLING_DATA_V3 = gql`
  ${BILLING_DATA_V3_FRAGMENT}
  mutation CreateBillingDataV3($input: BillingDataV3Input!) {
    createBillingDataV3(input: $input) {
      ...BillingDataV3Fields
    }
  }
`;

// 🎯 UPDATE BILLING DATA V3
export const UPDATE_BILLING_DATA_V3 = gql`
  ${BILLING_DATA_V3_FRAGMENT}
  mutation UpdateBillingDataV3($id: ID!, $input: UpdateBillingDataV3Input!) {
    updateBillingDataV3(id: $id, input: $input) {
      ...BillingDataV3Fields
    }
  }
`;

// 🎯 DELETE BILLING DATA V3
export const DELETE_BILLING_DATA_V3 = gql`
  mutation DeleteBillingDataV3($id: ID!) {
    deleteBillingDataV3(id: $id) {
      success
      message
    }
  }
`;

// 💰🎯 ECONOMIC SINGULARITY EXPORTS
/**
 * Export all BillingDataV3 GraphQL operations with Economic Singularity support
 *
 * ✅ Complete CRUD operations for billing_data table
 * ✅ Treatment linking (treatmentId) for profitability tracking
 * ✅ Material cost calculation from treatment_materials
 * ✅ Profit margin analysis in real-time
 * ✅ @veritas signature and blockchain TX hash support
 *
 * "Motor antes que pintura. Datos antes que diseño." 🔥
 */
