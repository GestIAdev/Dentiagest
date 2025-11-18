/**
 * 🔔 NOTIFICATIONS GRAPHQL OPERATIONS
 * Conexión REAL a Selene Song Core - Notification Management System
 * By PunkClaude - Directiva PRE-007 GeminiEnder
 */

import { gql } from '@apollo/client';

// ============================================================================
// QUERIES
// ============================================================================

export const GET_PATIENT_NOTIFICATIONS = gql`
  query GetPatientNotifications(
    $patientId: ID!
    $status: NotificationStatus
    $limit: Int
    $offset: Int
  ) {
    patientNotifications(
      patientId: $patientId
      status: $status
      limit: $limit
      offset: $offset
    ) {
      id
      patientId
      type
      channel
      title
      message
      priority
      status
      sentAt
      readAt
      metadata
      createdAt
      updatedAt
    }
  }
`;

export const GET_NOTIFICATION_PREFERENCES = gql`
  query GetNotificationPreferences($patientId: ID!) {
    notificationPreferences(patientId: $patientId) {
      id
      patientId
      smsEnabled
      emailEnabled
      pushEnabled
      appointmentReminders
      billingAlerts
      treatmentUpdates
      marketingEmails
      updatedAt
    }
  }
`;

// ============================================================================
// MUTATIONS
// ============================================================================

export const MARK_NOTIFICATION_AS_READ = gql`
  mutation MarkNotificationAsRead($id: ID!) {
    markNotificationAsRead(id: $id) {
      id
      status
      readAt
      updatedAt
    }
  }
`;

export const UPDATE_NOTIFICATION_PREFERENCES = gql`
  mutation UpdateNotificationPreferences(
    $patientId: ID!
    $input: NotificationPreferencesInput!
  ) {
    updateNotificationPreferences(patientId: $patientId, input: $input) {
      id
      patientId
      smsEnabled
      emailEnabled
      pushEnabled
      appointmentReminders
      billingAlerts
      treatmentUpdates
      marketingEmails
      updatedAt
    }
  }
`;

// ============================================================================
// TYPES (TypeScript Interfaces - Aligned with Selene Schema)
// ============================================================================

export type NotificationType =
  | 'APPOINTMENT_REMINDER'
  | 'APPOINTMENT_CONFIRMED'
  | 'APPOINTMENT_CANCELLED'
  | 'BILLING_DUE'
  | 'BILLING_PAID'
  | 'TREATMENT_UPDATED'
  | 'DOCUMENT_SHARED'
  | 'SYSTEM_ALERT'
  | 'PRESCRIPTION_READY';

export type NotificationChannel =
  | 'EMAIL'
  | 'SMS'
  | 'IN_APP'
  | 'PUSH';

export type NotificationPriority =
  | 'LOW'
  | 'NORMAL'
  | 'HIGH'
  | 'URGENT';

export type NotificationStatus =
  | 'PENDING'
  | 'SENT'
  | 'READ'
  | 'FAILED';

export interface Notification {
  id: string;
  patientId: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  message: string;
  priority: NotificationPriority;
  status: NotificationStatus;
  sentAt: string; // ISO 8601
  readAt?: string; // ISO 8601 (null if not read)
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferences {
  id: string;
  patientId: string;
  smsEnabled: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
  appointmentReminders: boolean;
  billingAlerts: boolean;
  treatmentUpdates: boolean;
  marketingEmails: boolean;
  updatedAt: string;
}
