/**
 * 🏥 DENTIAGEST TIME CALCULATIONS UTILITY
 * 
 * Purpose: Core time math for 2x2 grid and calendar operations
 * Created: Session Aug 9, 2025 - Phase 1
 * Status: Base time utilities
 * 
 * Key Decisions:
 * - 15min base unit for time slots
 * - 2x2 grid mapping (4 slots per hour)
 * - 7am-9pm working hours (14 hours total)
 * - Reuse existing timezone utilities
 * 
 * Dependencies:
 * - date-fns: Date calculations
 * - timezone.ts: Existing timezone handling
 * 
 * @author Punk Claude & Platform Gestia Developer
 */

import { 
  startOfDay, 
  endOfDay, 
  addMinutes, 
  format, 
  isWithinInterval,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  setHours,
  setMinutes
} from 'date-fns';
import { TimeSlot, CalendarDay } from '../types/calendar.types';

// 🏥 DENTIAGEST WORKING HOURS CONSTANTS
export const WORKING_HOURS = {
  START: 7, // 7:00 AM
  END: 21,  // 9:00 PM
  TOTAL: 14 // 14 hours per day
};

export const TIME_SLOT = {
  DURATION_MINUTES: 15,
  SLOTS_PER_HOUR: 4,
  TOTAL_SLOTS_PER_DAY: WORKING_HOURS.TOTAL * 4 // 56 slots
};

/**
 * Generate 2x2 grid time slots for a specific hour
 * Returns 4 TimeSlot objects positioned in 2x2 grid
 */
export function generateHourTimeSlots(date: Date, hour: number): TimeSlot[] {
  const slots: TimeSlot[] = [];
  
  for (let slotIndex = 0; slotIndex < 4; slotIndex++) {
    const minuteOffset = slotIndex * 15;
    const startTime = setMinutes(setHours(date, hour), minuteOffset);
    const endTime = addMinutes(startTime, 15);
    
    // 2x2 Grid positioning
    const row = Math.floor(slotIndex / 2) + 1; // 1 or 2
    const col = (slotIndex % 2) + 1; // 1 or 2
    
    slots.push({
      id: `${format(date, 'yyyy-MM-dd')}-${hour}-${slotIndex}`,
      startTime,
      endTime,
      isAvailable: true, // Will be updated based on appointments
      gridPosition: { row, col }
    });
  }
  
  return slots;
}

/**
 * Generate all time slots for a day (7am - 9pm)
 * Returns 56 TimeSlot objects (14 hours × 4 slots)
 */
export function generateDayTimeSlots(date: Date): TimeSlot[] {
  const allSlots: TimeSlot[] = [];
  
  for (let hour = WORKING_HOURS.START; hour < WORKING_HOURS.END; hour++) {
    const hourSlots = generateHourTimeSlots(date, hour);
    allSlots.push(...hourSlots);
  }
  
  return allSlots;
}

/**
 * Calculate which time slots an appointment occupies
 * Based on appointment start time and duration
 */
export function calculateAppointmentSlots(
  appointmentStart: Date, 
  durationMinutes: number,
  daySlots: TimeSlot[]
): TimeSlot[] {
  const appointmentEnd = addMinutes(appointmentStart, durationMinutes);
  
  return daySlots.filter(slot => {
    return isWithinInterval(slot.startTime, {
      start: appointmentStart,
      end: appointmentEnd
    }) || isWithinInterval(appointmentStart, {
      start: slot.startTime,
      end: slot.endTime
    });
  });
}

/**
 * Get week dates for week view
 */
export function getWeekDates(date: Date): Date[] {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday start
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
  
  return eachDayOfInterval({ start: weekStart, end: weekEnd });
}

/**
 * Get month dates for month view (includes partial weeks)
 */
export function getMonthDates(date: Date): Date[] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  
  // Include partial weeks at beginning and end
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
}

/**
 * Format time for display in grid
 */
export function formatTimeSlot(slot: TimeSlot): string {
  return format(slot.startTime, 'HH:mm');
}

/**
 * Check if time slot is within working hours
 */
export function isWorkingHour(hour: number): boolean {
  return hour >= WORKING_HOURS.START && hour < WORKING_HOURS.END;
}

