// 🔥 APOLLO NUCLEAR GRAPHQL QUERIES - MOUTH SCANS
// Date: September 22, 2025
// Mission: GraphQL Queries for 3D Mouth Scan Management
// Target: Mouth3DViewerPage V3 Integration

import { gql } from '@apollo/client';

// ============================================================================
// MOUTH SCAN QUERIES
// ============================================================================

// 🎯 GET MOUTH SCANS - Main mouth scans listing query
export const GET_MOUTH_SCANS = gql`
  query GetMouthScans(
    $filters: MouthScanSearchFilters
  ) {
    mouthScans(filters: $filters) {
      items {
        id
        patientId
        scanName
        scanType
        scanDate
        scanQuality
        scanStatus
        filePath
        fileSize
        fileFormat
        metadata
        notes
        isActive
        createdAt
        updatedAt
        uploadedBy
        processedAt
        processingStatus
        processingErrors

        # Patient relation
        patient {
          id
          firstName
          lastName
          fullName
          dateOfBirth
          age
        }

        # ⚡ VERITAS FIELDS - Quantum Truth Verification
        scanIntegrity_veritas {
          verified
          confidence
          level
          certificate
          error
          verifiedAt
          algorithm
        }
        patientMatch_veritas {
          verified
          confidence
          level
          certificate
          error
          verifiedAt
          algorithm
        }
      }
      total
      page
      size
      pages
      hasNext
      hasPrev
    }
  }
`;

// 🎯 GET MOUTH SCAN - Single mouth scan query
export const GET_MOUTH_SCAN = gql`
  query GetMouthScan($id: UUID!) {
    mouthScan(id: $id) {
      id
      patientId
      scanName
      scanType
      scanDate
      scanQuality
      scanStatus
      filePath
      fileSize
      fileFormat
      metadata
      notes
      isActive
      createdAt
      updatedAt
      uploadedBy
      processedAt
      processingStatus
      processingErrors

      # Patient relation
      patient {
        id
        firstName
        lastName
        fullName
        email
        phone
        dateOfBirth
        age
        gender
        medicalConditions
        allergies
        anxietyLevel
        specialNeeds
      }

      # ⚡ VERITAS FIELDS - Quantum Truth Verification
      scanIntegrity_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      patientMatch_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }

      # Relations
      treatments {
        id
        treatmentType
        status
        priority
        scheduledDate
        dentistName
        notes
      }
    }
  }
`;

// 🎯 GET PATIENT MOUTH SCANS - All scans for a specific patient
export const GET_PATIENT_MOUTH_SCANS = gql`
  query GetPatientMouthScans($patientId: UUID!, $limit: Int, $offset: Int) {
    patientMouthScans(patientId: $patientId, limit: $limit, offset: $offset) {
      id
      patientId
      scanName
      scanType
      scanDate
      scanQuality
      scanStatus
      filePath
      fileSize
      fileFormat
      metadata
      notes
      isActive
      createdAt
      updatedAt
      uploadedBy
      processedAt
      processingStatus
      processingErrors

      # ⚡ VERITAS FIELDS - Quantum Truth Verification
      scanIntegrity_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      patientMatch_veritas {
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

// 🎯 GET MOUTH SCAN METADATA - Technical scan information
export const GET_MOUTH_SCAN_METADATA = gql`
  query GetMouthScanMetadata($scanId: UUID!) {
    mouthScanMetadata(scanId: $scanId) {
      scanId
      technicalInfo {
        scannerModel
        scannerVersion
        scanResolution
        scanDuration
        lightingConditions
        calibrationData
      }
      qualityMetrics {
        overallQuality
        surfaceDetail
        occlusionAccuracy
        colorAccuracy
        artifactLevel
      }
      processingInfo {
        processedBy
        processingVersion
        processingTime
        algorithmsUsed
      }
      fileInfo {
        originalFormat
        compressedFormat
        compressionRatio
        fileIntegrity
      }
    }
  }
`;

// ============================================================================
// MOUTH SCAN MUTATIONS
// ============================================================================

// 🎯 CREATE MOUTH SCAN - Upload new 3D scan
export const CREATE_MOUTH_SCAN = gql`
  mutation CreateMouthScan($input: MouthScanCreateInput!) {
    createMouthScan(input: $input) {
      id
      patientId
      scanName
      scanType
      scanDate
      scanQuality
      scanStatus
      filePath
      fileSize
      fileFormat
      metadata
      notes
      isActive
      createdAt
      updatedAt
      uploadedBy
      processedAt
      processingStatus
      processingErrors

      # ⚡ VERITAS FIELDS - Quantum Truth Verification
      scanIntegrity_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      patientMatch_veritas {
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

// 🎯 UPDATE MOUTH SCAN - Modify scan information
export const UPDATE_MOUTH_SCAN = gql`
  mutation UpdateMouthScan($id: UUID!, $input: MouthScanUpdateInput!) {
    updateMouthScan(id: $id, input: $input) {
      id
      patientId
      scanName
      scanType
      scanDate
      scanQuality
      scanStatus
      filePath
      fileSize
      fileFormat
      metadata
      notes
      isActive
      updatedAt
      uploadedBy
      processedAt
      processingStatus
      processingErrors

      # ⚡ VERITAS FIELDS - Quantum Truth Verification
      scanIntegrity_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      patientMatch_veritas {
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

// 🎯 DELETE MOUTH SCAN - Remove scan (soft delete)
export const DELETE_MOUTH_SCAN = gql`
  mutation DeleteMouthScan($id: UUID!) {
    deleteMouthScan(id: $id)
  }
`;

// 🎯 PROCESS MOUTH SCAN - Trigger scan processing
export const PROCESS_MOUTH_SCAN = gql`
  mutation ProcessMouthScan($id: UUID!, $options: ScanProcessingOptions) {
    processMouthScan(id: $id, options: $options) {
      id
      processingStatus
      processedAt
      processingErrors
      updatedAt
    }
  }
`;

// 🎯 VALIDATE MOUTH SCAN - Run integrity validation
export const VALIDATE_MOUTH_SCAN = gql`
  mutation ValidateMouthScan($id: UUID!) {
    validateMouthScan(id: $id) {
      id
      scanStatus
      processingStatus
      updatedAt

      # ⚡ VERITAS FIELDS - Quantum Truth Verification
      scanIntegrity_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      patientMatch_veritas {
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

// 🎯 UPLOAD MOUTH SCAN FILE - Handle file upload
export const UPLOAD_MOUTH_SCAN_FILE = gql`
  mutation UploadMouthScanFile($file: Upload!, $metadata: ScanUploadMetadata!) {
    uploadMouthScanFile(file: $file, metadata: $metadata) {
      id
      filePath
      fileSize
      fileFormat
      uploadStatus
      uploadedBy
      createdAt
    }
  }
`;