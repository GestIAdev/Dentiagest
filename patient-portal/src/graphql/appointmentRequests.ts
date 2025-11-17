/**
 * Appointment Request GraphQL Mutations
 * DIRECTIVA #004 - GeminiEnder CEO
 * Fecha: 17-Nov-2025
 */

import { gql } from '@apollo/client';

export const REQUEST_APPOINTMENT = gql`
  mutation RequestAppointment($input: AppointmentRequestInput!) {
    requestAppointment(input: $input) {
      id
      appointment_type
      suggested_date
      suggested_time
      suggested_duration
      confidence_score
      reasoning
      status
      created_at
    }
  }
`;
