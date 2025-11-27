// ============================================================================
// 🎯 DASHBOARD WAR ROOM - GRAPHQL QUERIES & MUTATIONS
// ============================================================================
// PunkClaude x GeminiPunk - Activación Real-Time del Cuartel General
// Conexión directa con Selene para gestión de solicitudes entrantes
// ============================================================================

import { gql } from '@apollo/client';

// ============================================================================
// 📡 QUERIES
// ============================================================================

/**
 * GET_TODAY_APPOINTMENTS
 * -------------------------
 * Obtiene las citas del día actual para mostrar en el Widget Izquierdo.
 * Usa appointmentsV3ByDate que ya filtra por clinic_id via EMPIRE V2.
 * Widget: "Citas del Día" - La Agenda
 */
export const GET_TODAY_APPOINTMENTS = gql`
  query GetTodayAppointments($date: String!) {
    appointmentsV3ByDate(date: $date) {
      id
      patient_id
      patient {
        id
        firstName
        lastName
      }
      scheduled_date
      duration_minutes
      appointment_type
      status
      title
      description
      dentist_id
    }
  }
`;

/**
 * GET_PENDING_SUGGESTIONS
 * -------------------------
 * Obtiene las sugerencias de cita pendientes de revisión.
 * Filtro: status = "pending_approval" (debe coincidir con backend enum)
 * Widget: "Solicitudes Entrantes" - El Buzón de VitalPass
 * Uso: War Room Dashboard con pollInterval para real-time
 */
export const GET_PENDING_SUGGESTIONS = gql`
  query GetPendingSuggestions($clinicId: ID) {
    appointmentSuggestionsV3(status: "pending_approval", clinicId: $clinicId) {
      id
      patient_id
      patient {
        id
        firstName
        lastName
      }
      clinic_id
      appointment_type
      suggested_date
      suggested_time
      suggested_duration
      suggested_practitioner_id
      confidence_score
      reasoning
      patient_request
      status
      created_at
      updated_at
    }
  }
`;

/**
 * GET_ALL_SUGGESTIONS
 * ---------------------
 * Para históricos/reportes - todas las sugerencias sin filtro de status
 */
export const GET_ALL_SUGGESTIONS = gql`
  query GetAllSuggestions($clinicId: ID, $patientId: ID) {
    appointmentSuggestionsV3(clinicId: $clinicId, patientId: $patientId) {
      id
      patient_id
      patient {
        id
        firstName
        lastName
      }
      appointment_type
      suggested_date
      suggested_time
      confidence_score
      patient_request
      status
      reviewed_by
      reviewed_at
      rejection_reason
      created_at
    }
  }
`;

// ============================================================================
// 🎬 MUTATIONS
// ============================================================================

/**
 * APPROVE_SUGGESTION
 * --------------------
 * Aprueba una sugerencia y crea la cita correspondiente.
 * Acepta ajustes opcionales (fecha, hora, duración, profesional).
 * Retorna la cita creada para confirmar.
 */
export const APPROVE_SUGGESTION = gql`
  mutation ApproveSuggestion($suggestionId: ID!, $adjustments: AppointmentAdjustments) {
    approveAppointmentSuggestion(suggestionId: $suggestionId, adjustments: $adjustments) {
      id
      patientId
      appointmentDate
      appointmentTime
      duration
      type
      status
      createdAt
    }
  }
`;

/**
 * REJECT_SUGGESTION
 * -------------------
 * Rechaza una sugerencia con razón obligatoria.
 * Importante para auditoría y mejora del modelo IA.
 */
export const REJECT_SUGGESTION = gql`
  mutation RejectSuggestion($suggestionId: ID!, $reason: String!) {
    rejectAppointmentSuggestion(suggestionId: $suggestionId, reason: $reason)
  }
`;

// ============================================================================
// 🔧 TYPES (Para TypeScript)
// ============================================================================

export interface TodayAppointment {
  id: string;
  patient_id: string;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  scheduled_date: string;
  duration_minutes: number;
  appointment_type: string;
  status: 'CONFIRMED' | 'CHECKED_IN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  title?: string;
  description?: string;
  dentist_id?: string;
}

export interface GetTodayAppointmentsData {
  appointmentsV3ByDate: TodayAppointment[];
}

export interface GetTodayAppointmentsVars {
  date: string; // Format: YYYY-MM-DD
}

export interface AppointmentSuggestion {
  id: string;
  patient_id: string;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  clinic_id?: string;
  appointment_type: string;
  suggested_date: string;
  suggested_time: string;
  suggested_duration: number;
  suggested_practitioner_id?: string;
  confidence_score: number;
  reasoning?: string;
  patient_request?: string;
  status: 'pending_approval' | 'approved' | 'rejected';  // Match backend enum
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface AppointmentAdjustments {
  date?: string;
  time?: string;
  duration?: number;
  practitionerId?: string;
}

export interface GetPendingSuggestionsData {
  appointmentSuggestionsV3: AppointmentSuggestion[];
}

export interface GetPendingSuggestionsVars {
  clinicId?: string;
}

export interface ApproveSuggestionData {
  approveAppointmentSuggestion: {
    id: string;
    patientId: string;
    scheduledDate: string;
    appointmentDate: string;
    appointmentTime: string;
    duration: number;
    type: string;
    status: string;
    createdAt: string;
  };
}

export interface ApproveSuggestionVars {
  suggestionId: string;
  adjustments?: AppointmentAdjustments;
}

export interface RejectSuggestionData {
  rejectAppointmentSuggestion: string;
}

export interface RejectSuggestionVars {
  suggestionId: string;
  reason: string;
}

// ============================================================================
// 🎨 HELPERS - Color Coding por Urgencia (confidence_score)
// ============================================================================

/**
 * getUrgencyFromScore
 * ----------------------
 * Mapea el confidence_score (1-10) a niveles de urgencia.
 * 8-10: high (Rojo - Crítico, necesita atención inmediata)
 * 5-7:  medium (Ámbar - Moderado, revisar pronto)
 * <5:   low (Azul/Gris - Normal, puede esperar)
 */
export function getUrgencyFromScore(score: number): 'high' | 'medium' | 'low' {
  if (score >= 8) return 'high';
  if (score >= 5) return 'medium';
  return 'low';
}

/**
 * getUrgencyColor
 * ------------------
 * Retorna clases Tailwind para el color coding.
 */
export function getUrgencyColor(urgency: 'high' | 'medium' | 'low'): {
  border: string;
  bg: string;
  text: string;
  dot: string;
} {
  const colors = {
    high: {
      border: 'border-l-red-500',
      bg: 'bg-red-500/5',
      text: 'text-red-400',
      dot: 'bg-red-500'
    },
    medium: {
      border: 'border-l-amber-500',
      bg: 'bg-amber-500/5',
      text: 'text-amber-400',
      dot: 'bg-amber-500'
    },
    low: {
      border: 'border-l-slate-500',
      bg: 'bg-slate-500/5',
      text: 'text-slate-400',
      dot: 'bg-slate-400'
    }
  };
  return colors[urgency];
}

/**
 * POLL_INTERVAL
 * ---------------
 * Intervalo de polling para near real-time updates.
 * 5 segundos = balance entre responsividad y carga del servidor.
 */
export const POLL_INTERVAL = 5000;
