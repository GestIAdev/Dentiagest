//  APOLLO NUCLEAR GRAPHQL QUERIES - PATIENTS (ALIGNED WITH SELENE SCHEMA)
// Date: 2025-11-06
// Mission: GraphQL Queries for Patient Management
//  ALINEADO 100% CON SCHEMA REAL DE SELENE - NO FIELDS THAT DON'T EXIST

import { gql } from '@apollo/client';

// ============================================================================
// PATIENT QUERIES (SCHEMA REAL)
// ============================================================================

//  GET PATIENTS - Main patient listing query
export const GET_PATIENTS = gql`
  query GetPatients($limit: Int, $offset: Int) {
    patients(limit: $limit, offset: $offset) {
      id
      name
      firstName
      lastName
      email
      phone
      dateOfBirth
      address
      emergencyContact
      insuranceProvider
      policyNumber
      createdAt
      updatedAt
    }
  }
`;

//  GET PATIENT - Single patient query
export const GET_PATIENT = gql`
  query GetPatient($id: ID!) {
    patient(id: $id) {
      id
      firstName
      lastName
      email
      phone
      dateOfBirth
      address
      emergencyContact
      insuranceProvider
      policyNumber
      medicalHistory
      billingStatus
      createdAt
      updatedAt
    }
  }
`;

//  SEARCH PATIENTS - Autocomplete search
export const SEARCH_PATIENTS = gql`
  query SearchPatients($query: String!) {
    searchPatients(query: $query) {
      id
      firstName
      lastName
      email
      phone
    }
  }
`;

// ============================================================================
// PATIENT MUTATIONS (SCHEMA REAL)
// ============================================================================

//  CREATE PATIENT - Add new patient
export const CREATE_PATIENT = gql`
  mutation CreatePatient($input: PatientInput!) {
    createPatient(input: $input) {
      id
      firstName
      lastName
      email
      phone
      dateOfBirth
      address
      emergencyContact
      insuranceProvider
      policyNumber
      createdAt
    }
  }
`;

//  UPDATE PATIENT - Modify existing patient
export const UPDATE_PATIENT = gql`
  mutation UpdatePatient($id: ID!, $input: UpdatePatientInput!) {
    updatePatient(id: $id, input: $input) {
      id
      firstName
      lastName
      email
      phone
      dateOfBirth
      address
      emergencyContact
      insuranceProvider
      policyNumber
      medicalHistory
      billingStatus
      updatedAt
    }
  }
`;

//  DELETE PATIENT - Remove patient
export const DELETE_PATIENT = gql`
  mutation DeletePatient($id: ID!) {
    deletePatient(id: $id)
  }
`;

// ============================================================================
// TYPESCRIPT TYPES (ALIGNED WITH SELENE SCHEMA)
// ============================================================================

export interface Patient {
  id: string;
  name?: string; // 🔥 Added: Combined name from apollo_patients view
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  insuranceProvider?: string;
  policyNumber?: string;
  medicalHistory?: string;
  billingStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientInput {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  insuranceProvider?: string;
  policyNumber?: string;
}

export interface UpdatePatientInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  insuranceProvider?: string;
  policyNumber?: string;
  medicalHistory?: string;
  billingStatus?: string;
}

export interface GetPatientsData {
  patients: Patient[];
}

export interface GetPatientsVariables {
  limit?: number;
  offset?: number;
}

export interface GetPatientData {
  patient: Patient;
}

export interface GetPatientVariables {
  id: string;
}

export interface SearchPatientsData {
  searchPatients: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  }>;
}

export interface SearchPatientsVariables {
  query: string;
}

export interface CreatePatientData {
  createPatient: Patient;
}

export interface CreatePatientVariables {
  input: PatientInput;
}

export interface UpdatePatientData {
  updatePatient: Patient;
}

export interface UpdatePatientVariables {
  id: string;
  input: UpdatePatientInput;
}

export interface DeletePatientData {
  deletePatient: boolean;
}

export interface DeletePatientVariables {
  id: string;
}
