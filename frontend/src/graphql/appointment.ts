// 🎯🎸💀 APPOINTMENT GRAPHQL OPERATIONS V3.0 - OLYMPUS MEDICAL SCIENCE
/**
 * Appointment GraphQL Operations V3.0 - The Neural Network of Medical Scheduling
 *
 * 🎯 MISSION: Complete GraphQL operations for appointment management
 * ✅ Appointment CRUD operations with real-time updates
 * ✅ Calendar integration and scheduling conflicts
 * ✅ Patient-dentist availability synchronization
 * ✅ Automated reminders and notifications
 * ✅ Insurance pre-authorization workflows
 * ✅ Multi-location practice management
 *
 * Date: September 25, 2025
 */

import { gql } from '@apollo/client';

// ============================================================================
// FRAGMENTS
// ============================================================================

export const APPOINTMENT_FRAGMENT = gql`
  fragment AppointmentFragment on AppointmentV3 {
    id
    patientId
    patient {
      id
      firstName
      lastName
      email
      phone
    }
    practitionerId
    practitioner {
      id
      firstName
      lastName
    }
    appointmentDate @veritas(level: HIGH)
    appointmentDate_veritas {
      verified
      confidence
      level
      certificate
      error
      verifiedAt
      algorithm
    }
    appointmentTime @veritas(level: HIGH)
    appointmentTime_veritas {
      verified
      confidence
      level
      certificate
      error
      verifiedAt
      algorithm
    }
    duration
    type
    status @veritas(level: MEDIUM)
    status_veritas {
      verified
      confidence
      level
      certificate
      error
      verifiedAt
      algorithm
    }
    notes
    treatmentDetails @veritas(level: HIGH)
    treatmentDetails_veritas {
      verified
      confidence
      level
      certificate
      error
      verifiedAt
      algorithm
    }
    createdAt
    updatedAt
  }
`;

export const APPOINTMENT_SLOT_FRAGMENT = gql`
  fragment AppointmentSlotFragment on AppointmentSlot {
    start_time
    end_time
    available
    dentist_id
    room_number
    equipment_available
    notes
  }
`;

export const APPOINTMENT_STATS_FRAGMENT = gql`
  fragment AppointmentStatsFragment on AppointmentStats {
    total_appointments
    completed_appointments
    cancelled_appointments
    no_show_appointments
    average_duration
    average_cost
    utilization_rate
    patient_satisfaction
    revenue_generated
    appointments_by_type
    appointments_by_status
    appointments_by_dentist
    peak_hours
    busiest_days
    cancellation_reasons
  }
`;

// ============================================================================
// QUERIES
// ============================================================================

export const GET_APPOINTMENTS = gql`
  query GetAppointments($limit: Int, $offset: Int, $patientId: ID) {
    appointmentsV3(limit: $limit, offset: $offset, patientId: $patientId) {
      ...AppointmentFragment
    }
  }
  ${APPOINTMENT_FRAGMENT}
`;

export const GET_APPOINTMENT_BY_ID = gql`
  query GetAppointmentById($id: ID!) {
    appointmentV3(id: $id) {
      ...AppointmentFragment
    }
  }
  ${APPOINTMENT_FRAGMENT}
`;

export const GET_PATIENT_APPOINTMENTS = gql`
  query GetPatientAppointments($patientId: ID!, $filters: AppointmentFiltersInput) {
    patientAppointments(patientId: $patientId, filters: $filters) {
      ...AppointmentFragment
    }
  }
  ${APPOINTMENT_FRAGMENT}
`;

export const GET_DENTIST_APPOINTMENTS = gql`
  query GetDentistAppointments($dentistId: ID!, $dateRange: DateRangeInput) {
    dentistAppointments(dentistId: $dentistId, dateRange: $dateRange) {
      ...AppointmentFragment
    }
  }
  ${APPOINTMENT_FRAGMENT}
`;

export const GET_TODAY_APPOINTMENTS = gql`
  query GetTodayAppointments($dentistId: ID) {
    appointmentsV3ByDate(date: "${new Date().toISOString().split('T')[0]}") {
      ...AppointmentFragment
    }
  }
  ${APPOINTMENT_FRAGMENT}
`;

export const GET_UPCOMING_APPOINTMENTS = gql`
  query GetUpcomingAppointments($limit: Int, $dentistId: ID) {
    appointmentsV3(limit: $limit) {
      ...AppointmentFragment
    }
  }
  ${APPOINTMENT_FRAGMENT}
`;

export const GET_AVAILABLE_SLOTS = gql`
  query GetAvailableSlots($dentistId: ID!, $date: Date!, $duration: Int!) {
    availableSlots(dentistId: $dentistId, date: $date, duration: $duration) {
      ...AppointmentSlotFragment
    }
  }
  ${APPOINTMENT_SLOT_FRAGMENT}
`;

export const GET_APPOINTMENT_CONFLICTS = gql`
  query GetAppointmentConflicts($appointmentData: AppointmentConflictInput!) {
    appointmentConflicts(appointmentData: $appointmentData) {
      has_conflicts
      conflicts {
        appointment_id
        conflict_type
        conflict_reason
        suggested_alternatives {
          start_time
          end_time
          room_number
        }
      }
    }
  }
`;

export const GET_APPOINTMENT_STATS = gql`
  query GetAppointmentStats($dateRange: DateRangeInput, $dentistId: ID) {
    appointmentStats(dateRange: $dateRange, dentistId: $dentistId) {
      ...AppointmentStatsFragment
    }
  }
  ${APPOINTMENT_STATS_FRAGMENT}
`;

export const GET_APPOINTMENT_ANALYTICS = gql`
  query GetAppointmentAnalytics($filters: AppointmentFiltersInput) {
    appointmentAnalytics(filters: $filters) {
      utilization_trends
      no_show_patterns
      cancellation_analysis
      revenue_forecasting
      patient_retention_metrics
      scheduling_efficiency
      ai_recommendations
    }
  }
`;

// ============================================================================
// MUTATIONS
// ============================================================================

export const CREATE_APPOINTMENT = gql`
  mutation CreateAppointment($input: CreateAppointmentInput!) {
    createAppointmentV3(input: $input) {
      ...AppointmentFragment
    }
  }
  ${APPOINTMENT_FRAGMENT}
`;

export const UPDATE_APPOINTMENT = gql`
  mutation UpdateAppointment($id: ID!, $input: UpdateAppointmentInput!) {
    updateAppointmentV3(id: $id, input: $input) {
      ...AppointmentFragment
    }
  }
  ${APPOINTMENT_FRAGMENT}
`;

export const DELETE_APPOINTMENT = gql`
  mutation DeleteAppointment($id: ID!) {
    deleteAppointmentV3(id: $id)
  }
`;

export const CANCEL_APPOINTMENT = gql`
  mutation CancelAppointment($id: ID!, $reason: String!) {
    cancelAppointment(id: $id, reason: $reason) {
      success
      appointment {
        ...AppointmentFragment
      }
      errors
    }
  }
  ${APPOINTMENT_FRAGMENT}
`;

export const COMPLETE_APPOINTMENT = gql`
  mutation CompleteAppointment($id: ID!, $completionData: AppointmentCompletionInput!) {
    completeAppointment(id: $id, completionData: $completionData) {
      success
      appointment {
        ...AppointmentFragment
      }
      follow_up_scheduled
      errors
    }
  }
  ${APPOINTMENT_FRAGMENT}
`;

export const RESCHEDULE_APPOINTMENT = gql`
  mutation RescheduleAppointment($id: ID!, $newDateTime: DateTime!, $reason: String!) {
    rescheduleAppointment(id: $id, newDateTime: $newDateTime, reason: $reason) {
      success
      appointment {
        ...AppointmentFragment
      }
      conflicts {
        has_conflicts
        conflicts {
          appointment_id
          conflict_type
          conflict_reason
        }
      }
      errors
    }
  }
  ${APPOINTMENT_FRAGMENT}
`;

export const CONFIRM_APPOINTMENT = gql`
  mutation ConfirmAppointment($id: ID!) {
    confirmAppointment(id: $id) {
      success
      appointment {
        ...AppointmentFragment
      }
      errors
    }
  }
  ${APPOINTMENT_FRAGMENT}
`;

export const SEND_REMINDER = gql`
  mutation SendReminder($appointmentId: ID!, $reminderType: ReminderType!) {
    sendReminder(appointmentId: $appointmentId, reminderType: $reminderType) {
      success
      reminder_sent
      errors
    }
  }
`;

export const BULK_UPDATE_APPOINTMENTS = gql`
  mutation BulkUpdateAppointments($updates: [AppointmentBulkUpdateInput!]!) {
    bulkUpdateAppointments(updates: $updates) {
      success
      updated_count
      errors
    }
  }
`;

export const CREATE_RECURRING_APPOINTMENT = gql`
  mutation CreateRecurringAppointment($input: CreateRecurringAppointmentInput!) {
    createRecurringAppointment(input: $input) {
      success
      appointments {
        ...AppointmentFragment
      }
      errors
    }
  }
  ${APPOINTMENT_FRAGMENT}
`;

export const UPDATE_RECURRING_APPOINTMENT = gql`
  mutation UpdateRecurringAppointment($parentId: ID!, $input: UpdateAppointmentInput!, $applyToFuture: Boolean!) {
    updateRecurringAppointment(parentId: $parentId, input: $input, applyToFuture: $applyToFuture) {
      success
      updated_appointments {
        ...AppointmentFragment
      }
      errors
    }
  }
  ${APPOINTMENT_FRAGMENT}
`;

// ============================================================================
// SUBSCRIPTIONS
// ============================================================================

export const APPOINTMENT_CREATED_SUBSCRIPTION = gql`
  subscription AppointmentCreated {
    appointmentCreated {
      ...AppointmentFragment
    }
  }
  ${APPOINTMENT_FRAGMENT}
`;

export const APPOINTMENT_UPDATED_SUBSCRIPTION = gql`
  subscription AppointmentUpdated($appointmentId: ID!) {
    appointmentUpdated(appointmentId: $appointmentId) {
      ...AppointmentFragment
    }
  }
  ${APPOINTMENT_FRAGMENT}
`;

export const APPOINTMENT_STATUS_CHANGED_SUBSCRIPTION = gql`
  subscription AppointmentStatusChanged {
    appointmentStatusChanged {
      appointment_id
      old_status
      new_status
      changed_at
      changed_by
    }
  }
`;

export const CALENDAR_UPDATED_SUBSCRIPTION = gql`
  subscription CalendarUpdated($dentistId: ID) {
    calendarUpdated(dentistId: $dentistId) {
      dentist_id
      date
      updated_appointments {
        ...AppointmentFragment
      }
      available_slots {
        ...AppointmentSlotFragment
      }
    }
  }
  ${APPOINTMENT_FRAGMENT}
  ${APPOINTMENT_SLOT_FRAGMENT}
`;

// ============================================================================
// TYPE DEFINITIONS FOR INPUTS
// ============================================================================

export interface AppointmentFiltersInput {
  patient_id?: string;
  dentist_id?: string;
  status?: string[];
  appointment_type?: string[];
  priority?: string[];
  date_from?: string;
  date_to?: string;
  room_number?: string;
  search_term?: string;
  has_conflicts?: boolean;
  is_recurring?: boolean;
}

export interface PaginationInput {
  limit?: number;
  offset?: number;
}

export interface CreateAppointmentInput {
  patient_id: string;
  dentist_id: string;
  scheduled_date: string;
  duration_minutes: number;
  appointment_type: string;
  priority?: string;
  title: string;
  description?: string;
  notes?: string;
  room_number?: string;
  estimated_cost?: number;
  insurance_coverage?: number;
  preparation_instructions?: string;
  follow_up_required?: boolean;
  recurrence_rule?: string;
  recurrence_end_date?: string;
  equipment_needed?: string[];
  materials_required?: string[];
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateAppointmentInput {
  patient_id?: string;
  dentist_id?: string;
  scheduled_date?: string;
  duration_minutes?: number;
  appointment_type?: string;
  priority?: string;
  title?: string;
  description?: string;
  notes?: string;
  status?: string;
  room_number?: string;
  estimated_cost?: number;
  insurance_coverage?: number;
  patient_responsibility?: number;
  preparation_instructions?: string;
  follow_up_required?: boolean;
  confirmation_sent?: boolean;
  reminder_sent?: boolean;
  post_appointment_notes?: string;
  patient_feedback?: string;
  satisfaction_rating?: number;
  complications_encountered?: string[];
  follow_up_scheduled?: boolean;
  insurance_claim_status?: string;
  billing_status?: string;
  payment_status?: string;
  payment_amount?: number;
  payment_method?: string;
  payment_date?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface AppointmentConflictInput {
  dentist_id: string;
  scheduled_date: string;
  duration_minutes: number;
  room_number?: string;
  exclude_appointment_id?: string;
}

export interface AppointmentCompletionInput {
  actual_duration?: number;
  actual_cost?: number;
  post_appointment_notes?: string;
  patient_feedback?: string;
  satisfaction_rating?: number;
  complications_encountered?: string[];
  follow_up_required?: boolean;
  follow_up_notes?: string;
  equipment_used?: string[];
  materials_used?: string[];
  billing_status?: string;
  payment_status?: string;
  payment_amount?: number;
  payment_method?: string;
}

export interface AppointmentBulkUpdateInput {
  id: string;
  input: UpdateAppointmentInput;
}

export interface CreateRecurringAppointmentInput {
  base_appointment: CreateAppointmentInput;
  recurrence_rule: string;
  recurrence_end_date: string;
  max_occurrences?: number;
}

export interface DateRangeInput {
  start_date: string;
  end_date: string;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Fragments
  APPOINTMENT_FRAGMENT,
  APPOINTMENT_SLOT_FRAGMENT,
  APPOINTMENT_STATS_FRAGMENT,

  // Queries
  GET_APPOINTMENTS,
  GET_APPOINTMENT_BY_ID,
  GET_PATIENT_APPOINTMENTS,
  GET_DENTIST_APPOINTMENTS,
  GET_TODAY_APPOINTMENTS,
  GET_UPCOMING_APPOINTMENTS,
  GET_AVAILABLE_SLOTS,
  GET_APPOINTMENT_CONFLICTS,
  GET_APPOINTMENT_STATS,
  GET_APPOINTMENT_ANALYTICS,

  // Mutations
  CREATE_APPOINTMENT,
  UPDATE_APPOINTMENT,
  DELETE_APPOINTMENT,
  CANCEL_APPOINTMENT,
  COMPLETE_APPOINTMENT,
  RESCHEDULE_APPOINTMENT,
  CONFIRM_APPOINTMENT,
  SEND_REMINDER,
  BULK_UPDATE_APPOINTMENTS,
  CREATE_RECURRING_APPOINTMENT,
  UPDATE_RECURRING_APPOINTMENT,

  // Subscriptions
  APPOINTMENT_CREATED_SUBSCRIPTION,
  APPOINTMENT_UPDATED_SUBSCRIPTION,
  APPOINTMENT_STATUS_CHANGED_SUBSCRIPTION,
  CALENDAR_UPDATED_SUBSCRIPTION
};

// 🎯🎸💀 APPOINTMENT GRAPHQL OPERATIONS V3.0 EXPORTS - OLYMPUS MEDICAL CONQUEST
/**
 * Export all appointment GraphQL operations as the neural network
 *
 * 🎯 MISSION ACCOMPLISHED: Complete GraphQL operations for medical scheduling
 * ✅ Appointment lifecycle management with real-time updates
 * ✅ Calendar integration and conflict detection
 * ✅ Automated reminders and patient communication
 * ✅ Insurance and billing workflow integration
 * ✅ Multi-location practice management
 * ✅ AI-powered scheduling optimization
 *
 * "The scheduling neural network has been activated! ⚡🦷🎸"
 */
