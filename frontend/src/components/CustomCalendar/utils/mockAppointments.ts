/**
 * 🏥 DENTIAGEST MOCK APPOINTMENTS - PHASE 2.5
 * 
 * Purpose: Realistic appointment data for testing drag & drop functionality
 * Created: August 9, 2025 - Phase 2.5 - DRAG & DROP MAGIC
 * Status: MOCK DATA FOR DEVELOPMENT
 * 
 * PlatformGest Extraction Notes:
 * - Universal appointment patterns for all verticals
 * - DentiaGest: dental procedures and timing
 * - VetGest: veterinary appointments and treatments  
 * - MechaGest: repair slots and service types
 * - RestaurantGest: table reservations and events
 * 
 * @author Punk Claude & Platform Gestia Developer
 */

import { addMinutes, setHours, setMinutes } from 'date-fns';
import { AppointmentData } from '../AppointmentCard.tsx';
import { parseClinicDateTime } from '../../../utils/timezone.ts'; // 🌍 TIMEZONE SOLUTION!

/**
 * Generate mock appointments for testing
 * @param baseDate - The date to generate appointments for
 * @returns Array of realistic dental appointments
 */
export function generateMockAppointments(baseDate: Date): AppointmentData[] {
  const appointments: AppointmentData[] = [];

  // Helper function to create appointment
  const createAppointment = (
    id: string,
    patientName: string,
    startHour: number,
    startMinute: number,
    duration: number,
    type: AppointmentData['type'],
    status: AppointmentData['status'] = 'confirmada',
    priority: AppointmentData['priority'] = 'normal',
    notes?: string,
    doctorName?: string,
    treatmentCode?: string,
    estimatedCost?: number
  ): AppointmentData => {
    const startTime = setMinutes(setHours(baseDate, startHour), startMinute);
    const endTime = addMinutes(startTime, duration);

    return {
      id,
      patientName,
      patientId: `patient-${id}`,
      patientPhone: `+34 6${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
      patientEmail: `${patientName.toLowerCase().replace(/\s+/g, '.')}@email.com`,
      startTime,
      endTime,
      duration,
      type,
      status,
      priority,
      notes,
      phone: `+34 6${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
      doctorName,
      treatmentCode,
      estimatedCost
    };
  };

  // 🌅 MORNING APPOINTMENTS (8:00 - 12:00)
  appointments.push(
    createAppointment('apt001', 'María García López', 8, 0, 30, 'consulta', 'confirmada', 'normal', 'Revisión rutinaria', 'Martínez', 'CON001', 45),
    createAppointment('apt002', 'Carlos Rodríguez Ruiz', 8, 45, 60, 'limpieza', 'confirmada', 'normal', 'Limpieza + fluorización', 'Sánchez', 'LIM002', 75),
    createAppointment('apt003', 'Ana Martínez Sánchez', 9, 30, 45, 'consulta', 'pendiente', 'alta', 'Dolor muela del juicio', 'Martínez', 'CON003', 60),
    createAppointment('apt004', 'Pedro Fernández Díaz', 10, 30, 90, 'tratamiento', 'confirmada', 'normal', 'Endodoncia molar', 'López', 'TRT004', 280),
    createAppointment('apt005', 'Laura Jiménez Torres', 11, 45, 30, 'consulta', 'confirmada', 'normal', 'Revisión post-tratamiento', 'Martínez', 'CON005', 35)
  );

  // 🌞 AFTERNOON APPOINTMENTS (14:00 - 18:00)  
  appointments.push(
    createAppointment('apt006', 'José Luis Gómez', 14, 0, 45, 'limpieza', 'confirmada', 'normal', 'Limpieza profesional', 'Sánchez', 'LIM006', 65),
    createAppointment('apt007', 'Elena Ruiz Morales', 15, 0, 120, 'tratamiento', 'confirmada', 'alta', 'Implante dental + cirugía', 'López', 'TRT007', 850),
    createAppointment('apt008', 'Manuel Torres Vega', 16, 15, 30, 'emergencia', 'pendiente', 'urgente', '🚨 Dolor agudo - URGENTE', 'Martínez', 'EMR008', 90),
    createAppointment('apt009', 'Carmen López Silva', 17, 0, 60, 'tratamiento', 'confirmada', 'normal', 'Blanqueamiento dental', 'Sánchez', 'TRT009', 320),
    createAppointment('apt010', 'Ricardo Moreno Paz', 17, 30, 30, 'consulta', 'completada', 'normal', 'Entrega de prótesis', 'López', 'CON010', 1200)
  );

  // 🌆 EVENING APPOINTMENTS (18:30 - 20:00)
  appointments.push(
    createAppointment('apt011', 'Sofía Herrera Ramos', 18, 30, 45, 'consulta', 'confirmada', 'normal', 'Primera visita - ortodóncia', 'Martínez', 'CON011', 85),
    createAppointment('apt012', 'Diego Vargas Castro', 19, 15, 30, 'consulta', 'pendiente', 'normal', 'Revisión brackets', 'López', 'CON012', 40),
    createAppointment('apt013', 'Valentina Cruz Mendoza', 19, 45, 15, 'emergencia', 'cancelada', 'normal', 'Cancelada por paciente', 'Sánchez', 'EMR013', 0)
  );

  return appointments;
}

/**
 * Filter appointments by time range
 * @param appointments - All appointments
 * @param startHour - Start hour (24h format)
 * @param endHour - End hour (24h format)
 * @returns Filtered appointments
 */
export function filterAppointmentsByHour(
  appointments: AppointmentData[], 
  startHour: number, 
  endHour: number
): AppointmentData[] {
  return appointments.filter(apt => {
    const hour = apt.startTime.getHours();
    return hour >= startHour && hour < endHour;
  });
}

/**
 * Get appointments for a specific hour
 * @param appointments - All appointments
 * @param hour - Specific hour to get appointments for
 * @returns Appointments starting in that hour
 */
/**
 * Get the Date object from an appointment (handles both mock and real formats)
 */
export function getAppointmentDate(apt: any): Date | null {
  try {
    // Mock appointments format
    if (apt.startTime && apt.startTime.getHours) {
      return apt.startTime;
    }
    
    // Real appointments format
    if (apt.scheduled_date) {
      // Try parseClinicDateTime first
      const parsedDate = parseClinicDateTime(apt.scheduled_date);
      if (parsedDate && !isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
      
      // Fallback to native Date
      const fallbackDate = new Date(apt.scheduled_date);
      if (!isNaN(fallbackDate.getTime())) {
        return fallbackDate;
      }
    }
    
    // Fallback formats
    if (apt.date) {
      const date = new Date(apt.date);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

export function getAppointmentsForHour(
  appointments: any[], // 🔧 TEMPORARY ANY FOR MIXED FORMATS
  hour: number
): any[] {
  
  const filtered = appointments.filter(apt => {
    // 🔧 HANDLE BOTH MOCK AND REAL APPOINTMENT FORMATS
    if (apt.startTime && apt.startTime.getHours) {
      // Mock appointments format
      const aptHour = apt.startTime.getHours();
      return aptHour === hour;
    } else if (apt.scheduled_date) {
      // 🏥 REAL APPOINTMENTS FORMAT - ISO string with CORRECT TIMEZONE PARSING
      const appointmentDate = parseClinicDateTime(apt.scheduled_date);
      if (appointmentDate && !isNaN(appointmentDate.getTime())) {
        const aptHour = appointmentDate.getHours();
        return aptHour === hour;
      } else {
        console.warn(`🚨 Failed to parse scheduled_date: ${apt.scheduled_date}`);
        return false;
      }
    } else if (apt.time) {
      // Alternative format - parse time string like "14:30"
      const timeHour = parseInt(apt.time.split(':')[0], 10);
      return timeHour === hour;
    } else if (apt.appointment_time) {
      // Alternative real format
      const timeHour = parseInt(apt.appointment_time.split(':')[0], 10);
      return timeHour === hour;
    }
    
    console.warn('🚨 Appointment has no valid time format:');
    console.warn('🔍 Appointment keys:', Object.keys(apt));
    console.warn('🔍 Appointment data:', JSON.stringify(apt, null, 2));
    return false;
  });
  
  return filtered;
}

/**
 * Check if a time slot has conflicts
 * @param appointments - Existing appointments
 * @param newStart - New appointment start time
 * @param newEnd - New appointment end time
 * @returns Boolean indicating if there's a conflict
 */
export function hasTimeConflict(
  appointments: AppointmentData[],
  newStart: Date,
  newEnd: Date
): boolean {
  return appointments.some(apt => {
    // Check if new appointment overlaps with existing one
    return (newStart < apt.endTime && newEnd > apt.startTime);
  });
}

/**
 * Get available time slots for an hour
 * @param appointments - Existing appointments for the hour
 * @param hour - The hour to check
 * @param baseDate - Base date for calculations
 * @returns Array of available 15-minute slots
 */
export function getAvailableSlots(
  appointments: AppointmentData[],
  hour: number,
  baseDate: Date
): Date[] {
  const availableSlots: Date[] = [];
  const hourAppointments = getAppointmentsForHour(appointments, hour);
  
  // Generate all 15-minute slots for the hour
  for (let minute = 0; minute < 60; minute += 15) {
    const slotTime = setMinutes(setHours(baseDate, hour), minute);
    const slotEnd = addMinutes(slotTime, 15);
    
    // Check if this slot conflicts with any appointment
    const hasConflict = hasTimeConflict(hourAppointments, slotTime, slotEnd);
    
    if (!hasConflict) {
      availableSlots.push(slotTime);
    }
  }
  
  return availableSlots;
}

// 🎨 APPOINTMENT TYPE STATS FOR DASHBOARD
export const APPOINTMENT_STATS = {
  consulta: { count: 6, duration: 30, color: 'green' },
  limpieza: { count: 3, duration: 50, color: 'blue' },
  tratamiento: { count: 3, duration: 90, color: 'orange' },
  emergencia: { count: 3, duration: 25, color: 'red' }
};

// 📊 DAILY SCHEDULE SUMMARY
export function getDailyStats(appointments: AppointmentData[]) {
  const stats = {
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === 'confirmada').length,
    pending: appointments.filter(a => a.status === 'pendiente').length,
    completed: appointments.filter(a => a.status === 'completada').length,
    cancelled: appointments.filter(a => a.status === 'cancelada').length,
    totalDuration: appointments.reduce((sum, a) => sum + a.duration, 0),
    byType: {
      consulta: appointments.filter(a => a.type === 'consulta').length,
      limpieza: appointments.filter(a => a.type === 'limpieza').length,
      tratamiento: appointments.filter(a => a.type === 'tratamiento').length,
      emergencia: appointments.filter(a => a.type === 'emergencia').length,
    }
  };

  return stats;
}
