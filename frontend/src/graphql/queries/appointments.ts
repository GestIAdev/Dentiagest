//  GRAPHQL QUERIES - APPOINTMENTS (ALINEADO CON SELENE)
// Date: November 6, 2025 - GraphQL Migration v1.0
// Schema: Appointment { id, patientId, patient, practitionerId, date, time, appointmentDate, appointmentTime, duration, type, status, notes, createdAt, updatedAt }

import { gql } from '@apollo/client';

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
