// 🔥 APOLLO NUCLEAR GRAPHQL QUERIES - PATIENTS
// Date: September 22, 2025
// Mission: GraphQL Queries for Patient Management
// Target: PatientManagement Component Integration

import { gql } from '@apollo/client';

// ============================================================================
// PATIENT QUERIES
// ============================================================================

// 🎯 GET PATIENTS - Main patient listing query
export const GET_PATIENTS = gql`
  query GetPatients(
    $filters: PatientSearchFilters
  ) {
    patients(filters: $filters) {
      items {
        id
        firstName
        lastName
        fullName
        email
        phone
        phoneSecondary
        dateOfBirth
        age
        gender
        addressStreet
        addressCity
        addressState
        addressPostalCode
        addressCountry
        fullAddress
        emergencyContactName
        emergencyContactPhone
        emergencyContactRelationship
        medicalConditions
        medicationsCurrent
        allergies
        anxietyLevel
        specialNeeds
        insuranceProvider
        insurancePolicyNumber
        insuranceGroupNumber
        insuranceStatus
        consentToTreatment
        consentToContact
        preferredContactMethod
        notes
        isActive
        createdAt
        updatedAt
        hasInsurance
        requiresSpecialCare
        
        # ⚡ VERITAS FIELDS - Quantum Truth Verification
        policyNumber_veritas {
          verified
          confidence
          level
          certificate
          error
          verifiedAt
          algorithm
        }
        medicalHistory_veritas {
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

// 🎯 GET PATIENT - Single patient query
export const GET_PATIENT = gql`
  query GetPatient($id: UUID!) {
    patient(id: $id) {
      id
      firstName
      lastName
      fullName
      email
      phone
      phoneSecondary
      dateOfBirth
      age
      gender
      addressStreet
      addressCity
      addressState
      addressPostalCode
      addressCountry
      fullAddress
      emergencyContactName
      emergencyContactPhone
      emergencyContactRelationship
      medicalConditions
      medicationsCurrent
      allergies
      anxietyLevel
      specialNeeds
      insuranceProvider
      insurancePolicyNumber
      insuranceGroupNumber
        insuranceStatus
      consentToTreatment
      consentToContact
      preferredContactMethod
      notes
      isActive
      createdAt
      updatedAt
      hasInsurance
      requiresSpecialCare

      # ⚡ VERITAS FIELDS - Quantum Truth Verification
      policyNumber_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      medicalHistory_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }

      # Relations
      appointments {
        id
        scheduledDate
        appointmentType
        status
        priority
        title
        dentistName
      }
    }
  }
`;

// 🎯 GET PATIENT MEDICAL HISTORY - Detailed medical info
export const GET_PATIENT_MEDICAL_HISTORY = gql`
  query GetPatientMedicalHistory($patientId: UUID!) {
    patientMedicalHistory(patientId: $patientId) {
      patientId
      basicInfo {
        name
        dateOfBirth
        age
        gender
        bloodType
      }
      medicalConditions
      currentMedications
      allergies
      emergencyContact {
        name
        phone
        relationship
      }
      dentalSpecific {
        previousDentist
        anxietyLevel
        insuranceInfo
        insuranceStatus
      }
      consentStatus {
        treatment
        marketing
        dataSharing
      }
      preferences {
        appointmentTime
        communication
      }
    }
  }
`;

// 🎯 PATIENT SEARCH SUGGESTIONS - Autocomplete for forms
export const GET_PATIENT_SEARCH_SUGGESTIONS = gql`
  query GetPatientSearchSuggestions($query: String!, $limit: Int) {
    patientSearchSuggestions(query: $query, limit: $limit) {
      id
      name
      email
      phone
      type
    }
  }
`;

// ============================================================================
// PATIENT MUTATIONS
// ============================================================================

// 🎯 CREATE PATIENT - Add new patient
export const CREATE_PATIENT = gql`
  mutation CreatePatient($input: PatientCreateInput!) {
    createPatient(input: $input) {
      id
      firstName
      lastName
      fullName
      email
      phone
      phoneSecondary
      dateOfBirth
      age
      gender
      addressStreet
      addressCity
      addressState
      addressPostalCode
      addressCountry
      emergencyContactName
      emergencyContactPhone
      emergencyContactRelationship
      medicalConditions
      medicationsCurrent
      allergies
      anxietyLevel
      specialNeeds
      insuranceProvider
      insurancePolicyNumber
      insuranceGroupNumber
      consentToTreatment
      consentToContact
      preferredContactMethod
      notes
      isActive
      createdAt
      updatedAt
      hasInsurance
      requiresSpecialCare
      
      # ⚡ VERITAS FIELDS - Quantum Truth Verification
      policyNumber_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      medicalHistory_veritas {
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

// 🎯 UPDATE PATIENT - Modify existing patient
export const UPDATE_PATIENT = gql`
  mutation UpdatePatient($id: UUID!, $input: PatientUpdateInput!) {
    updatePatient(id: $id, input: $input) {
      id
      firstName
      lastName
      fullName
      email
      phone
      phoneSecondary
      dateOfBirth
      age
      gender
      addressStreet
      addressCity
      addressState
      addressPostalCode
      addressCountry
      emergencyContactName
      emergencyContactPhone
      emergencyContactRelationship
      medicalConditions
      medicationsCurrent
      allergies
      anxietyLevel
      specialNeeds
      insuranceProvider
      insurancePolicyNumber
      insuranceGroupNumber
      consentToTreatment
      consentToContact
      preferredContactMethod
      notes
      isActive
      updatedAt
      hasInsurance
      requiresSpecialCare
      
      # ⚡ VERITAS FIELDS - Quantum Truth Verification
      policyNumber_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      medicalHistory_veritas {
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

// 🎯 DELETE PATIENT - Soft delete patient
export const DELETE_PATIENT = gql`
  mutation DeletePatient($id: UUID!) {
    deletePatient(id: $id)
  }
`;

// 🎯 ACTIVATE PATIENT - Enable patient for appointments
export const ACTIVATE_PATIENT = gql`
  mutation ActivatePatient($id: UUID!) {
    activatePatient(id: $id) {
      id
      isActive
      updatedAt
    }
  }
`;

// 🎯 DEACTIVATE PATIENT - Disable patient appointments
export const DEACTIVATE_PATIENT = gql`
  mutation DeactivatePatient($id: UUID!) {
    deactivatePatient(id: $id) {
      id
      isActive
      updatedAt
    }
  }
`;

// 🎯 UPDATE PATIENT INSURANCE - Update insurance info
export const UPDATE_PATIENT_INSURANCE = gql`
  mutation UpdatePatientInsurance($id: UUID!, $insuranceData: JSON!) {
    updatePatientInsurance(id: $id, insuranceData: $insuranceData) {
      id
      insuranceProvider
      insurancePolicyNumber
      insuranceGroupNumber
      insuranceStatus
      updatedAt
    }
  }
`;