/**
 * 🔥💀🎸 DENTIAGEST GRAPHQL QUERIES - TREATMENTS V3
 * 
 * ARCHITECT: PunkClaude (The Verse Libre)
 * DATE: 2025-11-08
 * MISSION: Treatment Planning with @veritas quantum verification
 */

import { gql } from "@apollo/client";

// ============================================================================
// TREATMENT QUERIES V3 - WITH @VERITAS QUANTUM VERIFICATION 🔥
// ============================================================================

export const GET_TREATMENTS_V3 = gql`
  query GetTreatmentsV3($limit: Int, $offset: Int, $patientId: ID, $status: String) {
    treatmentsV3(limit: $limit, offset: $offset, patientId: $patientId, status: $status) {
      id
      patientId
      patientId_veritas
      practitionerId
      practitionerId_veritas
      treatmentType
      treatmentType_veritas
      description
      description_veritas
      status
      status_veritas
      startDate
      startDate_veritas
      endDate
      endDate_veritas
      cost
      cost_veritas
      notes
      notes_veritas
      aiRecommendations
      aiRecommendations_veritas
      veritasScore
      createdAt
      updatedAt
      
      # @veritas quantum verification metadata
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

export const GET_TREATMENT_V3 = gql`
  query GetTreatmentV3($id: ID!) {
    treatmentV3(id: $id) {
      id
      patientId
      patientId_veritas
      practitionerId
      practitionerId_veritas
      treatmentType
      treatmentType_veritas
      description
      description_veritas
      status
      status_veritas
      startDate
      startDate_veritas
      endDate
      endDate_veritas
      cost
      cost_veritas
      notes
      notes_veritas
      aiRecommendations
      aiRecommendations_veritas
      veritasScore
      createdAt
      updatedAt
      
      # @veritas quantum verification metadata
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

export const CREATE_TREATMENT_V3 = gql`
  mutation CreateTreatmentV3($input: TreatmentInputV3!) {
    createTreatmentV3(input: $input) {
      id
      treatmentType
      description
      status
      startDate
      cost
      createdAt
      
      _veritas {
        verified
        confidence
        level
      }
    }
  }
`;

export const UPDATE_TREATMENT_V3 = gql`
  mutation UpdateTreatmentV3($id: ID!, $input: TreatmentInputV3!) {
    updateTreatmentV3(id: $id, input: $input) {
      id
      treatmentType
      description
      status
      cost
      updatedAt
      
      _veritas {
        verified
        confidence
        level
      }
    }
  }
`;

// ============================================================================
// TREATMENT QUERIES (LEGACY - BACKWARD COMPATIBILITY)
// ============================================================================

// TypeScript Interfaces
export interface Treatment {
  id: string;
  patientId: string;
  practitionerId: string;
  treatmentType: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string | null;
  cost: number;
  notes: string;
  aiRecommendations: string[];
  veritasScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface GetTreatmentsData {
  treatments: Treatment[];
}

export interface GetTreatmentData {
  treatment: Treatment;
}

export interface CreateTreatmentData {
  createTreatment: Treatment;
}

export interface UpdateTreatmentData {
  updateTreatment: Treatment;
}

export interface DeleteTreatmentData {
  deleteTreatment: boolean;
}

// GET ALL TREATMENTS
export const GET_TREATMENTS = gql`
  query GetTreatments($limit: Int, $offset: Int, $patientId: ID, $status: String) {
    treatments(limit: $limit, offset: $offset, patientId: $patientId, status: $status) {
      id
      patientId
      practitionerId
      treatmentType
      description
      status
      startDate
      endDate
      cost
      notes
      aiRecommendations
      veritasScore
      createdAt
      updatedAt
    }
  }
`;

// GET SINGLE TREATMENT
export const GET_TREATMENT = gql`
  query GetTreatment($id: ID!) {
    treatment(id: $id) {
      id
      patientId
      practitionerId
      treatmentType
      description
      status
      startDate
      endDate
      cost
      notes
      aiRecommendations
      veritasScore
      createdAt
      updatedAt
    }
  }
`;

// CREATE TREATMENT
export const CREATE_TREATMENT = gql`
  mutation CreateTreatment($input: TreatmentInput!) {
    createTreatment(input: $input) {
      id
      patientId
      practitionerId
      treatmentType
      description
      status
      startDate
      endDate
      cost
      notes
      aiRecommendations
      veritasScore
      createdAt
      updatedAt
    }
  }
`;

// UPDATE TREATMENT
export const UPDATE_TREATMENT = gql`
  mutation UpdateTreatment($id: ID!, $input: TreatmentInput!) {
    updateTreatment(id: $id, input: $input) {
      id
      patientId
      practitionerId
      treatmentType
      description
      status
      startDate
      endDate
      cost
      notes
      aiRecommendations
      veritasScore
      createdAt
      updatedAt
    }
  }
`;

// DELETE TREATMENT
export const DELETE_TREATMENT = gql`
  mutation DeleteTreatment($id: ID!) {
    deleteTreatment(id: $id)
  }
`;

