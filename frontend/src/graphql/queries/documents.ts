import { gql } from "@apollo/client";

// TypeScript Interfaces
export interface Document {
  id: string;
  patientId: string;
  patientName: string;
  documentType: string;
  title: string;
  description: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  tags: string[];
  metadata: Record<string, any>;
  uploadedBy: string;
  uploadedAt: string;
  lastModified: string;
}

export interface GetDocumentsData {
  documents: Document[];
}

export interface GetDocumentData {
  document: Document;
}

export interface CreateDocumentData {
  createDocument: Document;
}

export interface UpdateDocumentData {
  updateDocument: Document;
}

export interface DeleteDocumentData {
  deleteDocument: boolean;
}

// GET ALL DOCUMENTS
export const GET_DOCUMENTS = gql`
  query GetDocuments($limit: Int, $offset: Int, $patientId: ID, $documentType: String, $uploadedBy: ID) {
    documents(limit: $limit, offset: $offset, patientId: $patientId, documentType: $documentType, uploadedBy: $uploadedBy) {
      id
      patientId
      patientName
      documentType
      title
      description
      fileName
      filePath
      fileSize
      mimeType
      tags
      metadata
      uploadedBy
      uploadedAt
      lastModified
    }
  }
`;

// GET SINGLE DOCUMENT
export const GET_DOCUMENT = gql`
  query GetDocument($id: ID!) {
    document(id: $id) {
      id
      patientId
      patientName
      documentType
      title
      description
      fileName
      filePath
      fileSize
      mimeType
      tags
      metadata
      uploadedBy
      uploadedAt
      lastModified
    }
  }
`;

// CREATE DOCUMENT
export const CREATE_DOCUMENT = gql`
  mutation CreateDocument($input: DocumentInput!) {
    createDocument(input: $input) {
      id
      patientId
      patientName
      documentType
      title
      description
      fileName
      filePath
      fileSize
      mimeType
      tags
      metadata
      uploadedBy
      uploadedAt
      lastModified
    }
  }
`;

// UPDATE DOCUMENT
export const UPDATE_DOCUMENT = gql`
  mutation UpdateDocument($id: ID!, $input: DocumentInput!) {
    updateDocument(id: $id, input: $input) {
      id
      patientId
      patientName
      documentType
      title
      description
      fileName
      filePath
      fileSize
      mimeType
      tags
      metadata
      uploadedBy
      uploadedAt
      lastModified
    }
  }
`;

// DELETE DOCUMENT
export const DELETE_DOCUMENT = gql`
  mutation DeleteDocument($id: ID!) {
    deleteDocument(id: $id)
  }
`;

// ============================================================================
// 🎯 V3 UNIFIED DOCUMENTS - Apollo Nuclear Integration
// ============================================================================

// GET UNIFIED DOCUMENTS V3 (Used by DocumentManagerV3)
export const GET_UNIFIED_DOCUMENTS = gql`
  query GetUnifiedDocumentsV3(
    $patientId: ID
    $limit: Int
    $offset: Int
  ) {
    unifiedDocumentsV3(
      patientId: $patientId
      limit: $limit
      offset: $offset
    ) {
      id
      patient_id
      title
      description
      file_name
      file_size_mb
      mime_type
      is_image
      is_xray
      ai_analyzed
      ai_confidence_scores
      ocr_extracted_text
      ai_tags
      ai_analysis_results
      download_url
      thumbnail_url
      created_at
      document_date
      unified_type
      legal_category
      smart_tags
      compliance_status
      patient {
        id
        first_name
        last_name
      }
    }
  }
`;

// CREATE DOCUMENT V3
export const CREATE_DOCUMENT_V3 = gql`
  mutation CreateDocumentV3($input: DocumentV3Input!) {
    createDocumentV3(input: $input) {
      id
      patientId
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

// UPDATE DOCUMENT V3
export const UPDATE_DOCUMENT_V3 = gql`
  mutation UpdateDocumentV3($id: ID!, $input: UpdateDocumentV3Input!) {
    updateDocumentV3(id: $id, input: $input) {
      id
      patientId
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

// DELETE DOCUMENT V3
export const DELETE_DOCUMENT_V3 = gql`
  mutation DeleteDocumentV3($id: ID!) {
    deleteDocumentV3(id: $id) {
      id
      patientId
      fileName
      filePath
      updatedAt
    }
  }
`;

