/**
 * 🏥 DENTIAGEST CUSTOM CALENDAR - MAIN EXPORTS - PHASE 2.5
 * 
 * Phase 1: ✅ Month view with navigation
 * Phase 2: ✅ Week & Day views with 2x2 grid  
 * Phase 2.5: 🚧 Drag & Drop + Appointment Cards
 * 
 * @author Punk Claude & Platform Gestia Developer
 */

// Main calendar container (recommended for most use cases)
export { CalendarContainer as default } from './CalendarContainerSimple';
export { CalendarContainer } from './CalendarContainerSimple';

// Individual view components (for custom implementations)
export { WeekViewSimple } from './WeekViewSimple';
export { DayViewSimple } from './DayViewSimple';

// Drag & Drop components (Phase 2.5)
export { AppointmentCard } from './AppointmentCard';
export { DroppableTimeSlot } from './DroppableTimeSlot';

// Hooks for state management
export { useCalendarState } from './hooks/useCalendarStateSimple';

// Utilities and mock data
export { 
  generateMockAppointments,
  filterAppointmentsByHour,
  getAppointmentsForHour,
  hasTimeConflict,
  getAvailableSlots,
  getDailyStats 
} from './utils/mockAppointments';

// Types for TypeScript users
export type { CalendarView } from './hooks/useCalendarStateSimple';
export type { AppointmentData } from './AppointmentCard';

