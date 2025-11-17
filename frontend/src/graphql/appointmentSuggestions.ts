/**
 * Appointment Suggestions GraphQL (Admin)
 * DIRECTIVA #004 - GeminiEnder CEO
 * Fecha: 17-Nov-2025
 */

import { gql } from '@apollo/client';

export const GET_PENDING_SUGGESTIONS = gql`
  query GetPendingSuggestions($status: String!) {
    appointmentSuggestionsV3(status: $status) {
      id
      patient_id
      patient {
        id
        first_name
        last_name
        phone_primary
        email
      }
      appointment_type
      suggested_date
      suggested_time
      suggested_duration
      suggested_practitioner_id
      confidence_score
      reasoning
      ia_diagnosis
      patient_request
      status
      created_at
    }
  }
`;

export const APPROVE_SUGGESTION = gql`
  mutation ApproveAppointmentSuggestion(
    $suggestionId: ID!
    $adjustments: AppointmentAdjustments
  ) {
    approveAppointmentSuggestion(
      suggestionId: $suggestionId
      adjustments: $adjustments
    ) {
      id
      appointment_date
      appointment_time
      status
    }
  }
`;

export const REJECT_SUGGESTION = gql`
  mutation RejectAppointmentSuggestion(
    $suggestionId: ID!
    $reason: String!
  ) {
    rejectAppointmentSuggestion(
      suggestionId: $suggestionId
      reason: $reason
    )
  }
`;
