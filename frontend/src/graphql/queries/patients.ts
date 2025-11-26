/**
 * 🔥💀🎸 DENTIAGEST GRAPHQL QUERIES - PATIENTS V3
 * 
 * ARCHITECT: PunkClaude (The Verse Libre)
 * DATE: 2025-11-08
 * MISSION: Patient Management with @veritas quantum verification
 * 
 * FEATURES:
 * ✅ Legacy queries (GET_PATIENTS, GET_PATIENT) - backward compatibility
 * ✅ V3 queries (GET_PATIENTS_V3, GET_PATIENT_V3) - with @veritas fields
 * ✅ Dual-field patterns (firstName + firstName_veritas)
 * ✅ VeritasMetadata (_veritas object)
 */

//  APOLLO NUCLEAR GRAPHQL QUERIES - PATIENTS (ALIGNED WITH SELENE SCHEMA)
// Date: 2025-11-06
// Mission: GraphQL Queries for Patient Management
//  ALINEADO 100% CON SCHEMA REAL DE SELENE - NO FIELDS THAT DON'T EXIST

import { gql } from '@apollo/client';

// ============================================================================
// PATIENT QUERIES V3 - WITH @VERITAS QUANTUM VERIFICATION 🔥
// ============================================================================

//  GET PATIENTS V3 - Main patient listing query with verification
export const GET_PATIENTS_V3 = gql`
  query GetPatientsV3($limit: Int, $offset: Int) {
    patientsV3(limit: $limit, offset: $offset) {
      id
      firstName
      firstName_veritas
      lastName
      lastName_veritas
      email
      email_veritas
      phone
      phone_veritas
      dateOfBirth
      dateOfBirth_veritas
      address
      address_veritas
      emergencyContact
      emergencyContact_veritas
      insuranceProvider
      insuranceProvider_veritas
      policyNumber
      policyNumber_veritas
      medicalHistory
      medicalHistory_veritas
      billingStatus
      billingStatus_veritas
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

//  GET PATIENT V3 - Single patient query with verification
export const GET_PATIENT_V3 = gql`
  query GetPatientV3($id: ID!) {
    patientV3(id: $id) {
      id
      firstName
      firstName_veritas
      lastName
      lastName_veritas
      email
      email_veritas
      phone
      phone_veritas
      dateOfBirth
      dateOfBirth_veritas
      address
      address_veritas
      emergencyContact
      emergencyContact_veritas
      insuranceProvider
      insuranceProvider_veritas
      policyNumber
      policyNumber_veritas
      medicalHistory
      medicalHistory_veritas
      billingStatus
      billingStatus_veritas
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

// ============================================================================
// PATIENT MUTATIONS V3 - WITH @VERITAS QUANTUM VERIFICATION 🔥
// ============================================================================

//  CREATE PATIENT V3 - Add new patient with verification
export const CREATE_PATIENT_V3 = gql`
  mutation CreatePatientV3($input: PatientInputV3!) {
    createPatientV3(input: $input) {
      id
      firstName
      firstName_veritas
      lastName
      lastName_veritas
      email
      email_veritas
      phone
      phone_veritas
      createdAt
      
      _veritas {
        verified
        confidence
        level
      }
    }
  }
`;

//  UPDATE PATIENT V3 - Modify existing patient with verification
export const UPDATE_PATIENT_V3 = gql`
  mutation UpdatePatientV3($id: ID!, $input: UpdatePatientInputV3!) {
    updatePatientV3(id: $id, input: $input) {
      id
      firstName
      firstName_veritas
      lastName
      lastName_veritas
      email
      email_veritas
      phone
      phone_veritas
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
// PATIENT QUERIES (LEGACY - BACKWARD COMPATIBILITY)
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
      emergencyContactName
      emergencyContactPhone
      emergencyContactRelationship
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
      emergencyContactName
      emergencyContactPhone
      emergencyContactRelationship
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
      emergencyContactName
      emergencyContactPhone
      emergencyContactRelationship
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
      emergencyContactName
      emergencyContactPhone
      emergencyContactRelationship
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

//  ACTIVATE PATIENT - Reactivate deactivated patient
export const ACTIVATE_PATIENT = gql`
  mutation ActivatePatient($id: ID!) {
    activatePatient(id: $id) {
      id
      firstName
      lastName
      isActive
      updatedAt
    }
  }
`;

//  DEACTIVATE PATIENT - Soft delete patient
export const DEACTIVATE_PATIENT = gql`
  mutation DeactivatePatient($id: ID!) {
    deactivatePatient(id: $id) {
      id
      firstName
      lastName
      isActive
      updatedAt
    }
  }
`;

// ============================================================================
// TYPESCRIPT TYPES (ALIGNED WITH SELENE SCHEMA)
// ============================================================================

export interface Patient {
  id: string;
  name?: string; // Combined name from apollo_patients view
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  // 🔥 EMERGENCY CONTACT - Campos separados (fix arquitectónico)
  emergencyContact?: string; // DEPRECATED: JSON legacy
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
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
  // 🔥 EMERGENCY CONTACT - Campos separados (fix arquitectónico)
  emergencyContact?: string; // DEPRECATED: JSON legacy
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
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
  // 🔥 EMERGENCY CONTACT - Campos separados (fix arquitectónico)
  emergencyContact?: string; // DEPRECATED: JSON legacy
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
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

