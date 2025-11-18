/**
 * 📄 DOCUMENTS GRAPHQL OPERATIONS
 * Conexión REAL a Selene Song Core - Document Management System
 * By PunkClaude - Directiva PRE-007 GeminiEnder
 */

import { gql } from '@apollo/client';

// ============================================================================
// QUERIES
// ============================================================================

export const GET_PATIENT_DOCUMENTS = gql`
  query GetPatientDocuments(
    $patientId: ID
    $limit: Int
    $offset: Int
  ) {
    documentsV3(
      patientId: $patientId
      limit: $limit
      offset: $offset
    ) {
      id
      patientId
      appointmentId
      medicalRecordId
      treatmentId
      uploaderId
      fileName
      filePath
      fileHash
      fileSize
      mimeType
      documentType
      category
      tags
      description
      isEncrypted
      accessLevel
      downloadCount
      lastAccessedAt
      createdAt
      updatedAt
    }
  }
`;

export const GET_DOCUMENT_BY_ID = gql`
  query GetDocumentById($id: ID!) {
    documentV3(id: $id) {
      id
      patientId
      appointmentId
      medicalRecordId
      treatmentId
      uploaderId
      fileName
      filePath
      fileHash
      fileSize
      mimeType
      documentType
      category
      tags
      description
      isEncrypted
      encryptionKey
      accessLevel
      expiresAt
      downloadCount
      lastAccessedAt
      createdAt
      updatedAt
    }
  }
`;

// ============================================================================
// MUTATIONS
// ============================================================================

export const UPLOAD_DOCUMENT = gql`
  mutation UploadDocument($input: DocumentV3Input!) {
    createDocumentV3(input: $input) {
      id
      patientId
      fileName
      filePath
      fileSize
      mimeType
      documentType
      category
      tags
      description
      isEncrypted
      accessLevel
      createdAt
    }
  }
`;

export const UPDATE_DOCUMENT = gql`
  mutation UpdateDocument($id: ID!, $input: UpdateDocumentV3Input!) {
    updateDocumentV3(id: $id, input: $input) {
      id
      fileName
      category
      tags
      description
      accessLevel
      updatedAt
    }
  }
`;

export const DELETE_DOCUMENT = gql`
  mutation DeleteDocument($id: ID!) {
    deleteDocumentV3(id: $id)
  }
`;

// ============================================================================
// TYPES (TypeScript Interfaces - Aligned with Selene Schema)
// ============================================================================

export type DocumentType = 
  | 'XRAY' 
  | 'SCAN' 
  | 'PHOTO' 
  | 'CONSENT_FORM' 
  | 'PRESCRIPTION' 
  | 'LAB_REPORT' 
  | 'INVOICE' 
  | 'OTHER';

export type AccessLevel = 
  | 'PUBLIC' 
  | 'PRIVATE' 
  | 'RESTRICTED' 
  | 'CONFIDENTIAL';

export interface Document {
  id: string;
  patientId: string;
  appointmentId?: string;
  medicalRecordId?: string;
  treatmentId?: string;
  uploaderId: string;
  fileName: string;
  filePath: string;
  fileHash: string;
  fileSize: number;
  mimeType: string;
  documentType: DocumentType;
  category?: string;
  tags?: string[];
  description?: string;
  isEncrypted: boolean;
  encryptionKey?: string;
  accessLevel: AccessLevel;
  expiresAt?: string;
  downloadCount: number;
  lastAccessedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentInput {
  patientId: string;
  appointmentId?: string;
  medicalRecordId?: string;
  treatmentId?: string;
  uploaderId: string;
  fileName: string;
  filePath: string;
  fileHash: string;
  fileSize: number;
  mimeType: string;
  documentType: DocumentType;
  category?: string;
  tags?: string[];
  description?: string;
  isEncrypted?: boolean;
  accessLevel?: AccessLevel;
}

export interface UpdateDocumentInput {
  fileName?: string;
  category?: string;
  tags?: string[];
  description?: string;
  accessLevel?: AccessLevel;
}
