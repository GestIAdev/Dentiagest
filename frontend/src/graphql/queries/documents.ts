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
