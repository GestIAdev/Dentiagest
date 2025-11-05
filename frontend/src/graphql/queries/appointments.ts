// 🔥 APOLLO NUCLEAR GRAPHQL QUERIES - APPOINTMENTS
// Date: September 22, 2025
// Mission: GraphQL Queries for Appointment Management
// Target: AppointmentWizard & AppointmentManagement Integration

import { gql } from '@apollo/client';

// ============================================================================
// APPOINTMENT QUERIES
// ============================================================================

// 🎯 GET APPOINTMENTS - Main appointment listing query
export const GET_APPOINTMENTS = gql`
  query GetAppointments(
    $filters: AppointmentSearchFilters
  ) {
    appointments(filters: $filters) {
      appointments {
        id
        patientId
        dentistId
        scheduledDate
        durationMinutes
        appointmentType
        priority
        title
        description
        notes
        status
        roomNumber
        estimatedCost
        insuranceCoverage
        preparationInstructions
        followUpRequired
        confirmationSent
        reminderSent
        cancelledAt
        completedAt
        createdAt
        updatedAt

        # Computed fields
        patientName
        patientPhone
        dentistName
        endTime

        # Relations
        patient {
          id
          firstName
          lastName
          phone
          email
          dateOfBirth
          medicalConditions
          allergies
          insuranceProvider
        }
        dentist {
          id
          firstName
          lastName
          fullName
        }
      }
      total
      page
      pages
      hasNext
      hasPrev
    }
  }
`;

// 🎯 GET APPOINTMENT - Single appointment query
export const GET_APPOINTMENT = gql`
  query GetAppointment($id: UUID!) {
    appointment(id: $id) {
      id
      patientId
      dentistId
      scheduledDate
      durationMinutes
      appointmentType
      priority
      title
      description
      notes
      status
      roomNumber
      estimatedCost
      insuranceCoverage
      preparationInstructions
      followUpRequired
      parentAppointmentId
      confirmationSent
      reminderSent
      cancelledAt
      completedAt
      createdAt
      updatedAt

      # Computed fields
      patientName
      patientPhone
      dentistName
      endTime

      # Relations
      patient {
        id
        firstName
        lastName
        fullName
        phone
        email
        dateOfBirth
        medicalConditions
        allergies
        insuranceProvider
        insuranceStatus
      }
      dentist {
        id
        firstName
        lastName
        fullName
      }
      parentAppointment {
        id
        title
        scheduledDate
        status
      }
      childAppointments {
        id
        title
        scheduledDate
        status
        appointmentType
      }
    }
  }
`;

// 🎯 GET APPOINTMENT AVAILABILITY - Check available slots
export const GET_APPOINTMENT_AVAILABILITY = gql`
  query GetAppointmentAvailability($request: AvailabilityRequestInput!) {
    appointmentAvailability(request: $request) {
      date
      availableSlots {
        startTime
        endTime
        durationMinutes
        isAvailable
        dentistId
        dentistName
      }
      totalSlots
      dentistSchedules
    }
  }
`;

// 🎯 GET APPOINTMENT STATS - Analytics and metrics
export const GET_APPOINTMENT_STATS = gql`
  query GetAppointmentStats($startDate: DateTime, $endDate: DateTime) {
    appointmentStats(startDate: $startDate, endDate: $endDate) {
      totalAppointments
      byStatus
      byType
      byPriority
      todayAppointments
      thisWeekAppointments
      thisMonthAppointments
      averageDuration
      noShowRate
      cancellationRate
      totalEstimatedRevenue
      completedAppointmentsValue
    }
  }
`;

// 🎯 GET UPCOMING APPOINTMENTS - For dashboard/quick view
export const GET_UPCOMING_APPOINTMENTS = gql`
  query GetUpcomingAppointments($limit: Int = 10) {
    appointments(filters: {
      status: [SCHEDULED, CONFIRMED]
      page: 1
      size: $limit
    }) {
      appointments {
        id
        scheduledDate
        appointmentType
        priority
        title
        status
        patientName
        patientPhone
        dentistName
        durationMinutes
        roomNumber
        notes
      }
    }
  }
`;

// 🎯 GET TODAY APPOINTMENTS - For daily view
export const GET_TODAY_APPOINTMENTS = gql`
  query GetTodayAppointments {
    appointments(filters: {
      startDate: "${new Date().toISOString().split('T')[0]}T00:00:00Z"
      endDate: "${new Date().toISOString().split('T')[0]}T23:59:59Z"
      page: 1
      size: 50
    }) {
      appointments {
        id
        scheduledDate
        appointmentType
        priority
        title
        description
        status
        patientName
        patientPhone
        dentistName
        durationMinutes
        roomNumber
        estimatedCost
        notes
        preparationInstructions
      }
    }
  }
`;

// 🎯 GET APPOINTMENTS FOR WEEK - For calendar week view
export const GET_APPOINTMENTS_FOR_WEEK = gql`
  query GetAppointmentsForWeek($weekStart: Date!, $weekEnd: Date!, $dentistId: UUID) {
    appointments(filters: {
      startDate: $weekStart
      endDate: $weekEnd
      dentistId: $dentistId
      page: 1
      size: 200
    }) {
      appointments {
        id
        patientId @veritas(level: HIGH)
        dentistId @veritas(level: HIGH)
        scheduledDate @veritas(level: CRITICAL)
        durationMinutes
        appointmentType @veritas(level: HIGH)
        priority
        title
        description
        notes
        status @veritas(level: MEDIUM)
        roomNumber
        estimatedCost
        insuranceCoverage
        preparationInstructions
        followUpRequired
        confirmationSent
        reminderSent

        # Computed fields
        patientName
        patientPhone
        dentistName
        endTime

        # Relations
        patient {
          id
          firstName
          lastName
          phone
          email
        }
        dentist {
          id
          firstName
          lastName
          fullName
        }
      }
    }
  }
`;

// ============================================================================
// APPOINTMENT MUTATIONS
// ============================================================================

// 🎯 CREATE APPOINTMENT - Schedule new appointment
export const CREATE_APPOINTMENT = gql`
  mutation CreateAppointment($input: AppointmentCreateInput!) {
    createAppointment(input: $input) {
      id
      patientId
      dentistId
      scheduledDate
      durationMinutes
      appointmentType
      priority
      title
      description
      notes
      status
      roomNumber
      estimatedCost
      insuranceCoverage
      preparationInstructions
      followUpRequired
      confirmationSent
      reminderSent
      createdAt
      updatedAt

      # Computed fields
      patientName
      patientPhone
      dentistName
      endTime

      # Relations
      patient {
        id
        firstName
        lastName
        phone
        email
      }
      dentist {
        id
        firstName
        lastName
        fullName
      }
    }
  }
`;

// 🎯 UPDATE APPOINTMENT - Modify existing appointment
export const UPDATE_APPOINTMENT = gql`
  mutation UpdateAppointment($id: UUID!, $input: AppointmentUpdateInput!) {
    updateAppointment(id: $id, input: $input) {
      id
      patientId
      dentistId
      scheduledDate
      durationMinutes
      appointmentType
      priority
      title
      description
      notes
      status
      roomNumber
      estimatedCost
      insuranceCoverage
      preparationInstructions
      followUpRequired
      confirmationSent
      reminderSent
      cancelledAt
      completedAt
      updatedAt

      # Computed fields
      patientName
      patientPhone
      dentistName
      endTime

      # Relations
      patient {
        id
        firstName
        lastName
        phone
        email
      }
      dentist {
        id
        firstName
        lastName
        fullName
      }
    }
  }
`;

// 🎯 DELETE APPOINTMENT - Cancel appointment
export const DELETE_APPOINTMENT = gql`
  mutation DeleteAppointment($id: UUID!) {
    deleteAppointment(id: $id)
  }
`;

// 🎯 CANCEL APPOINTMENT - Specific cancel operation
export const CANCEL_APPOINTMENT = gql`
  mutation CancelAppointment($id: UUID!) {
    cancelAppointment(id: $id) {
      id
      status
      cancelledAt
      updatedAt
    }
  }
`;

// 🎯 CONFIRM APPOINTMENT - Confirm scheduled appointment
export const CONFIRM_APPOINTMENT = gql`
  mutation ConfirmAppointment($id: UUID!) {
    confirmAppointment(id: $id) {
      id
      status
      confirmationSent
      updatedAt
    }
  }
`;

// 🎯 COMPLETE APPOINTMENT - Mark as completed
export const COMPLETE_APPOINTMENT = gql`
  mutation CompleteAppointment($id: UUID!) {
    completeAppointment(id: $id) {
      id
      status
      completedAt
      updatedAt
    }
  }
`;