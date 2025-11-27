/**
 * 🔥💀🎸 DENTIAGEST GRAPHQL QUERIES - TREATMENTS V5
 * 
 * ARCHITECT: PunkClaude (The Verse Libre)
 * DATE: 2025-11-26
 * MISSION: Treatment Planning - SCHEMA MATCHING (PURGED)
 * 
 * ⚠️ SANEAMIENTO COMPLETO:
 * - NO _veritas fields
 * - NO veritasScore  
 * - NO legacy metadata
 * - SOLO campos del Schema V5
 */

import { gql } from "@apollo/client";

// ============================================================================
// TREATMENT QUERIES V5 - SCHEMA MATCHED 🎯
// ============================================================================

export const GET_TREATMENTS_V3 = gql`
  query GetTreatmentsV3($limit: Int, $offset: Int, $patientId: ID) {
    treatmentsV3(limit: $limit, offset: $offset, patientId: $patientId) {
      id
      patientId
      treatmentType
      description
      status
      startDate
      endDate
      cost
      notes
      createdAt
      updatedAt
    }
  }
`;

export const GET_TREATMENT_V3 = gql`
  query GetTreatmentV3($id: ID!) {
    treatmentV3(id: $id) {
      id
      patientId
      treatmentType
      description
      status
      startDate
      endDate
      cost
      notes
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_TREATMENT_V3 = gql`
  mutation CreateTreatmentV3($input: TreatmentV3Input!) {
    createTreatmentV3(input: $input) {
      id
      patientId
      treatmentType
      description
      status
      startDate
      cost
      createdAt
    }
  }
`;

export const UPDATE_TREATMENT_V3 = gql`
  mutation UpdateTreatmentV3($id: ID!, $input: UpdateTreatmentV3Input!) {
    updateTreatmentV3(id: $id, input: $input) {
      id
      treatmentType
      description
      status
      cost
      updatedAt
    }
  }
`;

// ============================================================================
// TYPESCRIPT INTERFACES - CLEAN 🎯
// ============================================================================

export interface Treatment {
  id: string;
  patientId: string;
  treatmentType: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string | null;
  cost: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface TreatmentInput {
  patientId: string;
  treatmentType: string;
  description?: string;
  status?: string;
  startDate: string;
  endDate?: string | null;
  cost?: number;
  notes?: string;
}

export interface GetTreatmentsData {
  treatmentsV3: Treatment[];
}

export interface GetTreatmentData {
  treatmentV3: Treatment;
}

export interface CreateTreatmentData {
  createTreatmentV3: Treatment;
}

export interface UpdateTreatmentData {
  updateTreatmentV3: Treatment;
}

export interface DeleteTreatmentData {
  deleteTreatment: boolean;
}

// ============================================================================
// LEGACY QUERIES (DEPRECATED - USE V3/V5)
// ============================================================================

export const GET_TREATMENTS = gql`
  query GetTreatments($limit: Int, $offset: Int, $patientId: ID) {
    treatments(limit: $limit, offset: $offset, patientId: $patientId) {
      id
      patientId
      treatmentType
      description
      status
      startDate
      endDate
      cost
      notes
      createdAt
      updatedAt
    }
  }
`;

export const GET_TREATMENT = gql`
  query GetTreatment($id: ID!) {
    treatment(id: $id) {
      id
      patientId
      treatmentType
      description
      status
      startDate
      endDate
      cost
      notes
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_TREATMENT = gql`
  mutation CreateTreatment($input: TreatmentInput!) {
    createTreatment(input: $input) {
      id
      patientId
      treatmentType
      description
      status
      startDate
      cost
      createdAt
    }
  }
`;

export const UPDATE_TREATMENT = gql`
  mutation UpdateTreatment($id: ID!, $input: TreatmentInput!) {
    updateTreatment(id: $id, input: $input) {
      id
      treatmentType
      description
      status
      cost
      updatedAt
    }
  }
`;

export const DELETE_TREATMENT = gql`
  mutation DeleteTreatment($id: ID!) {
    deleteTreatmentV3(id: $id) {
      success
      message
    }
  }
`;

// ============================================================================
// TREATMENT SUBSCRIPTIONS V5 - CLEAN 🎯
// ============================================================================

export const TREATMENT_V3_UPDATED = gql`
  subscription TreatmentV3Updated {
    treatmentV3Updated {
      id
      patientId
      treatmentType
      description
      status
      startDate
      endDate
      cost
      notes
      createdAt
      updatedAt
    }
  }
`;

