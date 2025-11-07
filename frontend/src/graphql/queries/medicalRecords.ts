//  GRAPHQL QUERIES - MEDICAL RECORDS (ALINEADO CON SELENE)
// Date: November 6, 2025 - GraphQL Migration v1.0
// Schema: MedicalRecord { id, patientId, patient, practitionerId, recordType, title, content, diagnosis, treatment, medications, attachments, createdAt, updatedAt }

import { gql } from '@apollo/client';

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

