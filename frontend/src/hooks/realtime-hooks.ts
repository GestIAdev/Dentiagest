// 🔥 APOLLO NUCLEAR SUBSCRIPTION HOOKS
// Date: September 22, 2025
// Mission: React Hooks for Real-time GraphQL Subscriptions
// Target: Seamless integration with Zustand stores

import { useEffect } from 'react';
import { usePatientUpdates, useAppointmentUpdates, useNewAppointments } from '../graphql/subscriptions';
import { useUIStore } from '../stores';

// ============================================================================
// CLINIC SUBSCRIPTION MANAGER
// ============================================================================

export const useClinicSubscriptions = (clinicId?: string) => {
  // Get current user from localStorage or context
  const currentUserId = localStorage.getItem('userId');

  // Initialize all subscription hooks
  const patientUpdatesConnected = usePatientUpdates(clinicId);
  const appointmentUpdatesConnected = useAppointmentUpdates(clinicId, currentUserId || undefined);
  const newAppointmentsConnected = useNewAppointments(clinicId);

  // Return connection status
  return {
    isConnected: patientUpdatesConnected && appointmentUpdatesConnected && newAppointmentsConnected,
    patientUpdates: patientUpdatesConnected,
    appointmentUpdates: appointmentUpdatesConnected,
    newAppointments: newAppointmentsConnected,
  };
};

// ============================================================================
// REAL-TIME DASHBOARD HOOK
// ============================================================================

export const useRealtimeDashboard = (clinicId?: string) => {
  const { isConnected } = useClinicSubscriptions(clinicId);

  // This hook ensures all subscriptions are active for dashboard components
  useEffect(() => {
    if (isConnected) {
      console.log('📊 Dashboard real-time updates active');
    }
  }, [isConnected]);

  return { isConnected };
};

// ============================================================================
// PATIENT MANAGEMENT HOOK
// ============================================================================

export const useRealtimePatientManagement = (clinicId?: string) => {
  const { isConnected } = useClinicSubscriptions(clinicId);

  useEffect(() => {
    if (isConnected) {
      console.log('👥 Patient management real-time updates active');
    }
  }, [isConnected]);

  return { isConnected };
};

// ============================================================================
// APPOINTMENT CALENDAR HOOK
// ============================================================================

export const useRealtimeAppointmentCalendar = (clinicId?: string, dentistId?: string) => {
  const appointmentUpdatesConnected = useAppointmentUpdates(clinicId, dentistId);
  const newAppointmentsConnected = useNewAppointments(clinicId);

  const isConnected = appointmentUpdatesConnected && newAppointmentsConnected;

  useEffect(() => {
    if (isConnected) {
      console.log('📅 Appointment calendar real-time updates active');
    }
  }, [isConnected]);

  return { isConnected };
};

// ============================================================================
// NOTIFICATION SYSTEM INTEGRATION
// ============================================================================

export const useRealtimeNotifications = (clinicId?: string) => {
  const { isConnected } = useClinicSubscriptions(clinicId);

  useEffect(() => {
    if (isConnected) {
      console.log('🔔 Real-time notifications active');
    }
  }, [isConnected]);

  return { isConnected };
};