// Export all utilities for easy importing
export { logger, LogLevel, CyberpunkLogger, createModuleLogger, PerformanceMonitor } from './logger';
export { CLINIC_TIMEZONE, SUPPORTED_TIMEZONES, formatLocalDateTime, parseClinicDateTime, getUserTimezone, checkTimezoneWarning } from './timezone';
export { DocumentLogger } from './documentLogger';
export { AIErrorHandler } from './aiErrorHandler';
// export { updateAppointment } from './appointmentService'; // REMOVED: updateAppointment export
export { exportToPDF } from './exportUtils';
export { generateTimeSlots } from './timeSlots';
export type { TimeSlot } from './timeSlots';
