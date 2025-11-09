// 🦷💀 ODONTOGRAM 3D V3 QUERIES - QUANTUM DENTAL VISUALIZATION
// Date: November 9, 2025
// Version: V3.0 - @veritas Enhanced
// Architecture: GraphQL V3 + Real-time Subscriptions

import { gql } from '@apollo/client';

// ============================================================================
// QUERIES
// ============================================================================

export const GET_ODONTOGRAM_DATA_V3 = gql`
  query GetOdontogramDataV3($patientId: ID!) {
    odontogramDataV3(patientId: $patientId) {
      id
      patientId
      lastUpdated
      createdAt
      teeth {
        id
        toothNumber
        toothNumber_veritas {
          verified
          confidence
          level
          certificate
          verifiedAt
          algorithm
        }
        status
        status_veritas {
          verified
          confidence
          level
          certificate
          verifiedAt
          algorithm
        }
        condition
        condition_veritas {
          verified
          confidence
          level
          certificate
          verifiedAt
          algorithm
        }
        surfaces {
          surface
          status
          status_veritas {
            verified
            confidence
            level
            certificate
            verifiedAt
            algorithm
          }
          notes
        }
        notes
        lastTreatmentDate
        color
        position {
          x
          y
          z
        }
      }
    }
  }
`;

// ============================================================================
// MUTATIONS
// ============================================================================

export const UPDATE_TOOTH_STATUS_V3 = gql`
  mutation UpdateToothStatusV3($patientId: ID!, $input: UpdateToothStatusV3Input!) {
    updateToothStatusV3(patientId: $patientId, input: $input) {
      id
      toothNumber
      status
      status_veritas {
        verified
        confidence
        level
        certificate
        verifiedAt
        algorithm
      }
      condition
      notes
      lastTreatmentDate
      color
      position {
        x
        y
        z
      }
    }
  }
`;

// ============================================================================
// SUBSCRIPTIONS
// ============================================================================

export const ODONTOGRAM_UPDATED_V3 = gql`
  subscription OdontogramUpdatedV3($patientId: ID!) {
    odontogramUpdatedV3(patientId: $patientId) {
      id
      patientId
      lastUpdated
      teeth {
        id
        toothNumber
        status
        color
        condition
        notes
        lastTreatmentDate
        position {
          x
          y
          z
        }
      }
    }
  }
`;
