import { gql } from "@apollo/client";

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

