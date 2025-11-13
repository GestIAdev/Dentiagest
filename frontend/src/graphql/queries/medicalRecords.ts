/**
 * 🔥💀🎸 DENTIAGEST GRAPHQL QUERIES - MEDICAL RECORDS V3
 * 
 * ARCHITECT: PunkClaude (The Verse Libre)
 * DATE: 2025-11-08
 * MISSION: Medical Records Management with @veritas quantum verification
 */

//  GRAPHQL QUERIES - MEDICAL RECORDS (ALINEADO CON SELENE)
// Date: November 6, 2025 - GraphQL Migration v1.0
// Schema: MedicalRecord { id, patientId, patient, practitionerId, recordType, title, content, diagnosis, treatment, medications, attachments, createdAt, updatedAt }

import { gql } from '@apollo/client';

// ============================================================================
// MEDICAL RECORD QUERIES V3 - WITH @VERITAS QUANTUM VERIFICATION 🔥
// ============================================================================

export const GET_MEDICAL_RECORDS_V3 = gql`
  query GetMedicalRecordsV3($patientId: ID, $limit: Int, $offset: Int) {
    medicalRecordsV3(patientId: $patientId, limit: $limit, offset: $offset) {
      id
      patientId
      patientId_veritas
      patient {
        firstName
        lastName
      }
      practitionerId
      practitionerId_veritas
      recordType
      recordType_veritas
      title
      title_veritas
      content
      content_veritas
      diagnosis
      diagnosis_veritas
      treatment
      treatment_veritas
      medications
      medications_veritas
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

export const GET_MEDICAL_RECORD_V3 = gql`
  query GetMedicalRecordV3($id: ID!) {
    medicalRecordV3(id: $id) {
      id
      patientId
      patientId_veritas
      patient {
        firstName
        lastName
        email
        phone
      }
      practitionerId
      practitionerId_veritas
      recordType
      recordType_veritas
      title
      title_veritas
      content
      content_veritas
      diagnosis
      diagnosis_veritas
      treatment
      treatment_veritas
      medications
      medications_veritas
      attachments
      attachments_veritas
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

export const CREATE_MEDICAL_RECORD_V3 = gql`
  mutation CreateMedicalRecordV3($input: MedicalRecordInputV3!) {
    createMedicalRecordV3(input: $input) {
      id
      title
      diagnosis
      createdAt
      
      _veritas {
        verified
        confidence
        level
      }
    }
  }
`;

export const UPDATE_MEDICAL_RECORD_V3 = gql`
  mutation UpdateMedicalRecordV3($id: ID!, $input: MedicalRecordInputV3!) {
    updateMedicalRecordV3(id: $id, input: $input) {
      id
      title
      diagnosis
      updatedAt
      
      _veritas {
        verified
        confidence
        level
      }
    }
  }
`;

//  DELETE MEDICAL RECORD V3 - Delete with verification
export const DELETE_MEDICAL_RECORD_V3 = gql`
  mutation DeleteMedicalRecordV3($id: ID!) {
    deleteMedicalRecordV3(id: $id) {
      success
      message
      id
    }
  }
`;

// ============================================================================
// MEDICAL RECORD QUERIES (LEGACY - BACKWARD COMPATIBILITY)
// ============================================================================

export const GET_MEDICAL_RECORDS = gql`
  query GetMedicalRecords($patientId: ID, $limit: Int, $offset: Int) {
    medicalRecords(patientId: $patientId, limit: $limit, offset: $offset) {
      id
      patientId
      patient {
        firstName
        lastName
      }
      practitionerId
      recordType
      title
      content
      diagnosis
      treatment
      medications
      createdAt
    }
  }
`;

export const GET_MEDICAL_RECORD = gql`
  query GetMedicalRecord($id: ID!) {
    medicalRecord(id: $id) {
      id
      patientId
      patient {
        firstName
        lastName
        email
        phone
      }
      practitionerId
      recordType
      title
      content
      diagnosis
      treatment
      medications
      attachments
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_MEDICAL_RECORD = gql`
  mutation CreateMedicalRecord($input: MedicalRecordInput!) {
    createMedicalRecord(input: $input) {
      id
      title
      diagnosis
      createdAt
    }
  }
`;

export const UPDATE_MEDICAL_RECORD = gql`
  mutation UpdateMedicalRecord($id: ID!, $input: MedicalRecordInput!) {
    updateMedicalRecord(id: $id, input: $input) {
      id
      title
      diagnosis
      updatedAt
    }
  }
`;

export const DELETE_MEDICAL_RECORD = gql`
  mutation DeleteMedicalRecord($id: ID!) {
    deleteMedicalRecord(id: $id)
  }
`;

export interface MedicalRecord {
  id: string;
  patientId: string;
  patient?: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
  practitionerId?: string;
  recordType: string;
  title: string;
  content: string;
  diagnosis: string;
  treatment: string;
  medications: string[];
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecordInput {
  patientId: string;
  practitionerId?: string;
  recordType: string;
  title?: string;
  content?: string;
  diagnosis: string;
  treatment?: string;
  medications?: string[];
  attachments?: string[];
}

