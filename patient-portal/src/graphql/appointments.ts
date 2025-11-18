/**
 * 📅 APPOINTMENTS GRAPHQL OPERATIONS
 * Conexión REAL a Selene Song Core - Appointment Management System
 * By PunkClaude - Directiva PRE-007 GeminiEnder
 */

import { gql } from '@apollo/client';

// ============================================================================
// QUERIES
// ============================================================================

export const GET_PATIENT_APPOINTMENTS = gql`
  query GetPatientAppointments(
    $patientId: ID
    $limit: Int
    $offset: Int
  ) {
    appointmentsV3(
      patientId: $patientId
      limit: $limit
      offset: $offset
    ) {
      id
      patientId
      practitionerId
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

export const GET_APPOINTMENT_BY_ID = gql`
  query GetAppointmentById($id: ID!) {
    appointmentV3(id: $id) {
      id
      patientId
      practitionerId
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

export const GET_APPOINTMENTS_BY_DATE = gql`
  query GetAppointmentsByDate($date: String!) {
    appointmentsV3ByDate(date: $date) {
      id
      patientId
      practitionerId
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

// ============================================================================
// MUTATIONS
// ============================================================================

export const CREATE_APPOINTMENT = gql`
  mutation CreateAppointment($input: AppointmentInput!) {
    createAppointmentV3(input: $input) {
      id
      patientId
      practitionerId
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

export const UPDATE_APPOINTMENT = gql`
  mutation UpdateAppointment($id: ID!, $input: UpdateAppointmentInput!) {
    updateAppointmentV3(id: $id, input: $input) {
      id
      patientId
      practitionerId
      appointmentDate
      appointmentTime
      duration
      type
      status
      notes
      treatmentDetails
      updatedAt
    }
  }
`;

export const CANCEL_APPOINTMENT = gql`
  mutation CancelAppointment($id: ID!) {
    deleteAppointmentV3(id: $id)
  }
`;

// ============================================================================
// SUBSCRIPTIONS
// ============================================================================

export const APPOINTMENT_CREATED = gql`
  subscription OnAppointmentCreated {
    appointmentV3Created {
      id
      patientId
      practitionerId
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

export const APPOINTMENT_UPDATED = gql`
  subscription OnAppointmentUpdated {
    appointmentV3Updated {
      id
      patientId
      status
      notes
      updatedAt
    }
  }
`;

export const APPOINTMENT_CANCELLED = gql`
  subscription OnAppointmentCancelled {
    appointmentV3Cancelled {
      id
      status
    }
  }
`;

// ============================================================================
// TYPES (TypeScript Interfaces - Aligned with Selene Schema)
// ============================================================================

export type AppointmentStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'REJECTED' 
  | 'CANCELLED' 
  | 'COMPLETED' 
  | 'NO_SHOW';

export type AppointmentType = 
  | 'CONSULTATION' 
  | 'CLEANING' 
  | 'CHECKUP' 
  | 'TREATMENT' 
  | 'EMERGENCY' 
  | 'FOLLOWUP';

export interface Appointment {
  id: string;
  patientId: string;
  practitionerId?: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:MM:SS
  duration: number; // minutes
  type: AppointmentType;
  status: AppointmentStatus;
  notes?: string;
  treatmentDetails?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentInput {
  patientId: string;
  practitionerId?: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  type: AppointmentType;
  status?: AppointmentStatus;
  notes?: string;
}

export interface UpdateAppointmentInput {
  practitionerId?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  duration?: number;
  type?: AppointmentType;
  status?: AppointmentStatus;
  notes?: string;
}
