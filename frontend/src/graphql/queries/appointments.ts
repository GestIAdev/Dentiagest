/**
 * 🔥💀🎸 DENTIAGEST GRAPHQL QUERIES - APPOINTMENTS V3
 * 
 * ARCHITECT: PunkClaude (The Verse Libre)
 * DATE: 2025-11-08
 * MISSION: Appointment Management with @veritas quantum verification
 */

//  GRAPHQL QUERIES - APPOINTMENTS (ALINEADO CON SELENE)
// Date: November 6, 2025 - GraphQL Migration v1.0
// Schema: Appointment { id, patientId, patient, practitionerId, date, time, appointmentDate, appointmentTime, duration, type, status, notes, createdAt, updatedAt }

import { gql } from '@apollo/client';

// ============================================================================
// APPOINTMENT QUERIES V3 - WITH @VERITAS QUANTUM VERIFICATION 🔥
// ============================================================================

export const GET_APPOINTMENTS_V3 = gql`
  query GetAppointmentsV3($limit: Int, $offset: Int, $patientId: ID, $startDate: String, $endDate: String) {
    appointmentsV3(limit: $limit, offset: $offset, patientId: $patientId, startDate: $startDate, endDate: $endDate) {
      id
      patientId
      patientId_veritas
      patient {
        firstName
        lastName
        email
        phone
      }
      practitionerId
      practitionerId_veritas
      appointmentDate
      appointmentDate_veritas
      appointmentTime
      appointmentTime_veritas
      duration
      duration_veritas
      type
      type_veritas
      status
      status_veritas
      notes
      notes_veritas
      createdAt
      updatedAt
      
      # @veritas quantum verification metadata
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

export const GET_APPOINTMENT_V3 = gql`
  query GetAppointmentV3($id: ID!) {
    appointmentV3(id: $id) {
      id
      patientId
      patientId_veritas
      patient {
        firstName
        lastName
        email
        phone
      }
      practitionerId
      practitionerId_veritas
      appointmentDate
      appointmentDate_veritas
      appointmentTime
      appointmentTime_veritas
      duration
      duration_veritas
      type
      type_veritas
      status
      status_veritas
      notes
      notes_veritas
      treatmentDetails
      treatmentDetails_veritas
      createdAt
      updatedAt
      
      # @veritas quantum verification metadata
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

export const CREATE_APPOINTMENT_V3 = gql`
  mutation CreateAppointmentV3($input: AppointmentInputV3!) {
    createAppointmentV3(input: $input) {
      id
      patientId
      appointmentDate
      appointmentTime
      duration
      type
      status
      createdAt
      
      _veritas {
        verified
        confidence
        level
      }
    }
  }
`;

export const UPDATE_APPOINTMENT_V3 = gql`
  mutation UpdateAppointmentV3($id: ID!, $input: UpdateAppointmentInputV3!) {
    updateAppointmentV3(id: $id, input: $input) {
      id
      appointmentDate
      appointmentTime
      status
      updatedAt
      
      _veritas {
        verified
        confidence
        level
      }
    }
  }
`;

//  DELETE APPOINTMENT V3 - Delete with verification
export const DELETE_APPOINTMENT_V3 = gql`
  mutation DeleteAppointmentV3($id: ID!) {
    deleteAppointmentV3(id: $id) {
      success
      message
      id
    }
  }
`;

// ============================================================================
// APPOINTMENT QUERIES (LEGACY - BACKWARD COMPATIBILITY)
// ============================================================================

export const GET_APPOINTMENTS = gql`
  query GetAppointments($limit: Int, $offset: Int, $patientId: ID) {
    appointments(limit: $limit, offset: $offset, patientId: $patientId) {
      id
      patientId
      patient {
        firstName
        lastName
        email
        phone
      }
      practitionerId
      date
      time
      appointmentDate
      appointmentTime
      duration
      type
      status
      notes
      createdAt
      updatedAt
    }
  }
`;

export const GET_APPOINTMENT = gql`
  query GetAppointment($id: ID!) {
    appointment(id: $id) {
      id
      patientId
      patient {
        firstName
        lastName
        email
        phone
      }
      practitionerId
      date
      time
      appointmentDate
      appointmentTime
      duration
      type
      status
      notes
      treatmentDetails
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_APPOINTMENT = gql`
  mutation CreateAppointment($input: AppointmentInput!) {
    createAppointment(input: $input) {
      id
      patientId
      appointmentDate
      appointmentTime
      duration
      type
      status
      notes
      createdAt
    }
  }
`;

export const UPDATE_APPOINTMENT = gql`
  mutation UpdateAppointment($id: ID!, $input: UpdateAppointmentInput!) {
    updateAppointment(id: $id, input: $input) {
      id
      patientId
      appointmentDate
      appointmentTime
      duration
      type
      status
      notes
      updatedAt
    }
  }
`;

export const DELETE_APPOINTMENT = gql`
  mutation DeleteAppointment($id: ID!) {
    deleteAppointment(id: $id)
  }
`;

export const CANCEL_APPOINTMENT = gql`
  mutation CancelAppointment($id: ID!) {
    updateAppointment(id: $id, input: { status: "cancelled" }) {
      id
      status
      updatedAt
    }
  }
`;

export const CONFIRM_APPOINTMENT = gql`
  mutation ConfirmAppointment($id: ID!) {
    updateAppointment(id: $id, input: { status: "confirmed" }) {
      id
      status
      updatedAt
    }
  }
`;

export const COMPLETE_APPOINTMENT = gql`
  mutation CompleteAppointment($id: ID!) {
    updateAppointment(id: $id, input: { status: "completed" }) {
      id
      status
      updatedAt
    }
  }
`;

export interface Appointment {
  id: string;
  patientId: string;
  patient?: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
  practitionerId?: string;
  date?: string;
  time?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  duration: number;
  type: string;
  status: string;
  notes?: string;
  treatmentDetails?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentInput {
  patientId: string;
  practitionerId?: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  type: string;
  status?: string;
  notes?: string;
}

export interface UpdateAppointmentInput {
  appointmentDate?: string;
  appointmentTime?: string;
  duration?: number;
  type?: string;
  status?: string;
  notes?: string;
}

