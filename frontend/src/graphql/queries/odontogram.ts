// 🦷💀 ODONTOGRAM 3D V3 QUERIES - QUANTUM DENTAL VISUALIZATION
// Date: November 27, 2025
// Version: V3.1 - CLEAN (no _veritas fields)
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
        status
        condition
        surfaces {
          surface
          status
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
