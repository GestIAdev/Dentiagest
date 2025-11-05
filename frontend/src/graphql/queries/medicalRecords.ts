// 🎯 MEDICAL RECORDS GRAPHQL QUERIES
// Date: September 22, 2025
// Mission: GraphQL queries for medical records management
// Status: V3.0 - Apollo Nuclear integration

import { gql } from '@apollo/client';

// ============================================================================
// MEDICAL RECORDS QUERIES
// ============================================================================

export const GET_MEDICAL_RECORDS = gql`
  query GetMedicalRecords($filters: MedicalRecordFilters) {
    medicalRecordsV3(filters: $filters) {
      items {
        id
        patientId
        recordType
        title
        title_veritas
        description
        description_veritas
        diagnosis
        diagnosis_veritas
        treatmentPlan
        treatmentPlan_veritas
        medications
        medications_veritas
        notes
        notes_veritas
        vitalSigns {
          bloodPressure
          heartRate
          temperature
          weight
          height
        }
        attachments {
          id
          filename
          url
          contentType
          size
        }
        createdBy
        createdAt
        updatedAt
        tags
        priority
        status
        status_veritas

        # V3.0 @veritas QUANTUM TRUTH VERIFICATION
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
      total
      page
      size
      pages
      hasNext
      hasPrev
    }
  }
`;

export const GET_MEDICAL_RECORD = gql`
  query GetMedicalRecord($id: ID!) {
    medicalRecordV3(id: $id) {
      id
      patientId
      recordType
      title
      title_veritas
      description
      description_veritas
      diagnosis
      diagnosis_veritas
      treatmentPlan
      treatmentPlan_veritas
      medications
      medications_veritas
      notes
      notes_veritas
      vitalSigns {
        bloodPressure
        heartRate
        temperature
        weight
        height
      }
      attachments {
        id
        filename
        url
        contentType
        size
      }
      createdBy
      createdAt
      updatedAt
      tags
      priority
      status
      status_veritas

      # V3.0 @veritas QUANTUM TRUTH VERIFICATION
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

export const CREATE_MEDICAL_RECORD = gql`
  mutation CreateMedicalRecord($input: CreateMedicalRecordInput!) {
    createMedicalRecordV3(input: $input) {
      id
      patientId
      recordType
      title
      title_veritas
      description
      description_veritas
      diagnosis
      diagnosis_veritas
      treatmentPlan
      treatmentPlan_veritas
      medications
      medications_veritas
      notes
      notes_veritas
      vitalSigns {
        bloodPressure
        heartRate
        temperature
        weight
        height
      }
      attachments {
        id
        filename
        url
        contentType
        size
      }
      createdBy
      createdAt
      updatedAt
      tags
      priority
      status
      status_veritas

      # V3.0 @veritas QUANTUM TRUTH VERIFICATION
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

export const UPDATE_MEDICAL_RECORD = gql`
  mutation UpdateMedicalRecord($id: ID!, $input: UpdateMedicalRecordInput!) {
    updateMedicalRecordV3(id: $id, input: $input) {
      id
      patientId
      recordType
      title
      title_veritas
      description
      description_veritas
      diagnosis
      diagnosis_veritas
      treatmentPlan
      treatmentPlan_veritas
      medications
      medications_veritas
      notes
      notes_veritas
      vitalSigns {
        bloodPressure
        heartRate
        temperature
        weight
        height
      }
      attachments {
        id
        filename
        url
        contentType
        size
      }
      createdBy
      createdAt
      updatedAt
      tags
      priority
      status
      status_veritas

      # V3.0 @veritas QUANTUM TRUTH VERIFICATION
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

export const DELETE_MEDICAL_RECORD = gql`
  mutation DeleteMedicalRecord($id: ID!) {
    deleteMedicalRecordV3(id: $id) {
      id
      patientId
      recordType
      title
      title_veritas
      description
      description_veritas
      diagnosis
      diagnosis_veritas
      treatmentPlan
      treatmentPlan_veritas
      medications
      medications_veritas
      notes
      notes_veritas
      vitalSigns {
        bloodPressure
        heartRate
        temperature
        weight
        height
      }
      attachments {
        id
        filename
        url
        contentType
        size
      }
      createdBy
      createdAt
      updatedAt
      tags
      priority
      status
      status_veritas

      # V3.0 @veritas QUANTUM TRUTH VERIFICATION
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