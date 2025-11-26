/**
 * 🔥💀🎸 GRAPHQL V3 → CUSTOMCALENDAR ADAPTER
 * 
 * ARCHITECT: PunkClaude (The Verse Libre)
 * DATE: 2025-11-09
 * PURPOSE: Bridge between GraphQL V3 data and CustomCalendar legacy format
 * 
 * PHILOSOPHY:
 * Don't rewrite perfection. Adapt it. 
 * CustomCalendar is beautiful art (2000+ lines). We preserve it.
 * GraphQL V3 is the new truth. We embrace it.
 * This adapter is the bridge between worlds.
 */

import { parseISO, addMinutes } from 'date-fns';
import type { AppointmentData } from '../AppointmentCard';

// ============================================================================
// GraphQL V3 Appointment Interface (from backend)
// ============================================================================
export interface GraphQLAppointmentV3 {
  id: string;
  patientId: string;
  patient?: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
  practitionerId?: string;
  appointmentDate: string;       // ISO date string: "2025-11-09"
  appointmentTime: string;       // Time string: "14:30:00"
  scheduled_date?: string;       // Combined timestamp from DB (optional)
  duration: number;              // Minutes: 30, 45, 60
  type: string;                  // Backend type: "consulta", "limpieza", etc.
  status: string;                // Backend status: "confirmed", "pending", etc.
  notes?: string;
  treatmentDetails?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Type Mapping: Backend → Calendar
// ============================================================================

/**
 * Maps backend appointment types to calendar-friendly types
 * Backend uses Spanish: "consulta", "limpieza", "tratamiento"
 * Calendar expects English enum: 'consultation', 'cleaning', 'treatment'
 */
const TYPE_MAPPING: Record<string, AppointmentData['type']> = {
  // Spanish → English
  'consulta': 'consultation',
  'limpieza': 'cleaning',
  'tratamiento': 'treatment',
  'emergencia': 'emergency',
  'relleno': 'filling',
  'extracción': 'extraction',
  'revision': 'checkup',
  'ortodoncia': 'orthodontics',
  'cirugia': 'surgery',
  
  // English (already correct)
  'consultation': 'consultation',
  'cleaning': 'cleaning',
  'treatment': 'treatment',
  'emergency': 'emergency',
  'filling': 'filling',
  'extraction': 'extraction',
  'checkup': 'checkup',
  'orthodontics': 'orthodontics',
  'surgery': 'surgery',
};

/**
 * Maps backend status to calendar status
 */
const STATUS_MAPPING: Record<string, AppointmentData['status']> = {
  'confirmed': 'confirmed',
  'confirmada': 'confirmed',
  'pending': 'pending',
  'pendiente': 'pending',
  'cancelled': 'cancelled',
  'cancelada': 'cancelled',
  'completed': 'completed',
  'completada': 'completed',
};

/**
 * Determines priority based on appointment type
 */
function calculatePriority(type: string): AppointmentData['priority'] {
  // Emergencies are always urgent
  if (type.toLowerCase().includes('emergencia') || type.toLowerCase().includes('emergency')) {
    return 'urgent';
  }
  
  // Default
  return 'normal';
}

// ============================================================================
// MAIN ADAPTER FUNCTION
// ============================================================================

/**
 * 🔥 CORE ADAPTER: GraphQL V3 → CustomCalendar AppointmentData
 * 
 * Converts GraphQL backend format to CustomCalendar legacy format
 * Preserves all features: drag & drop, color coding, tooltips, etc.
 * 
 * @param gqlAppointment - Raw GraphQL V3 appointment from backend
 * @returns AppointmentData - Calendar-ready appointment object
 */
export function adaptGraphQLToCalendar(
  gqlAppointment: GraphQLAppointmentV3
): AppointmentData {
  // 1️⃣ Parse date/time from separate fields OR scheduled_date
  const appointmentDateTime = gqlAppointment.scheduled_date
    ? parseISO(gqlAppointment.scheduled_date)
    : parseISO(`${gqlAppointment.appointmentDate}T${gqlAppointment.appointmentTime}`);
  
  // 2️⃣ Calculate end time from duration
  const endTime = addMinutes(appointmentDateTime, gqlAppointment.duration);
  
  // 3️⃣ Combine patient name
  const patientName = gqlAppointment.patient 
    ? `${gqlAppointment.patient.firstName} ${gqlAppointment.patient.lastName}`
    : 'Paciente Desconocido';
  
  // 4️⃣ Map type (Spanish → English)
  const calendarType = TYPE_MAPPING[gqlAppointment.type.toLowerCase()] || 'consultation';
  
  // 5️⃣ Map status
  const calendarStatus = STATUS_MAPPING[gqlAppointment.status.toLowerCase()] || 'pending';
  
  // 6️⃣ Calculate priority (emergency check only)
  const priority = calculatePriority(gqlAppointment.type);
  
  // 7️⃣ Assemble calendar appointment (include scheduled_date for compatibility)
  return {
    id: gqlAppointment.id,
    patientName,
    patientId: gqlAppointment.patientId,
    patientPhone: gqlAppointment.patient?.phone,
    patientEmail: gqlAppointment.patient?.email,
    startTime: appointmentDateTime,
    endTime,
    duration: gqlAppointment.duration,
    type: calendarType,
    status: calendarStatus,
    priority,
    notes: gqlAppointment.notes,
    phone: gqlAppointment.patient?.phone,
    doctorName: undefined, // TODO: Add practitioner data when available
    treatmentCode: gqlAppointment.treatmentDetails,
    // @ts-ignore - Add scheduled_date for MonthViewSimple compatibility
    scheduled_date: gqlAppointment.scheduled_date || `${gqlAppointment.appointmentDate}T${gqlAppointment.appointmentTime}`,
  };
}

/**
 * 🔥 BATCH ADAPTER: Convert array of GraphQL appointments
 * 
 * @param gqlAppointments - Array of GraphQL V3 appointments
 * @returns AppointmentData[] - Array of calendar-ready appointments
 */
export function adaptGraphQLArrayToCalendar(
  gqlAppointments: GraphQLAppointmentV3[]
): AppointmentData[] {
  return gqlAppointments
    .filter(apt => apt && apt.id) // Filter null/undefined
    .map(adaptGraphQLToCalendar);
}

// ============================================================================
// REVERSE ADAPTER: Calendar → GraphQL (for mutations)
// ============================================================================

/**
 * 🔥 REVERSE ADAPTER: CustomCalendar → GraphQL V3 Input
 * 
 * Converts calendar appointment data back to GraphQL mutation input
 * Used when creating/updating appointments via drag & drop
 * 
 * @param calendarAppointment - Calendar appointment data
 * @returns GraphQL mutation input object
 */
export function adaptCalendarToGraphQL(
  calendarAppointment: Partial<AppointmentData>
): {
  appointmentDate?: string;
  appointmentTime?: string;
  duration?: number;
  type?: string;
  status?: string;
  notes?: string;
} {
  const result: any = {};
  
  // Extract date from startTime
  if (calendarAppointment.startTime) {
    const startTime = calendarAppointment.startTime;
    result.appointmentDate = startTime.toISOString().split('T')[0]; // "2025-11-09"
    result.appointmentTime = startTime.toTimeString().split(' ')[0]; // "14:30:00"
  }
  
  // Duration
  if (calendarAppointment.duration !== undefined) {
    result.duration = calendarAppointment.duration;
  }
  
  // Type (English → Spanish or keep English)
  if (calendarAppointment.type) {
    // Reverse mapping: English → Spanish (backend prefers Spanish)
    const reverseTypeMap: Record<string, string> = {
      'consultation': 'consulta',
      'cleaning': 'limpieza',
      'treatment': 'tratamiento',
      'emergency': 'emergencia',
      'filling': 'relleno',
      'extraction': 'extracción',
      'checkup': 'revision',
      'orthodontics': 'ortodoncia',
      'surgery': 'cirugia',
    };
    result.type = reverseTypeMap[calendarAppointment.type] || calendarAppointment.type;
  }
  
  // Status
  if (calendarAppointment.status) {
    result.status = calendarAppointment.status;
  }
  
  // Notes
  if (calendarAppointment.notes !== undefined) {
    result.notes = calendarAppointment.notes;
  }
  
  return result;
}

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

export const GraphQLCalendarAdapter = {
  toCalendar: adaptGraphQLToCalendar,
  toCalendarArray: adaptGraphQLArrayToCalendar,
  toGraphQL: adaptCalendarToGraphQL,
  
  // Mapping tables (useful for debugging)
  TYPE_MAPPING,
  STATUS_MAPPING,
};

export default GraphQLCalendarAdapter;
