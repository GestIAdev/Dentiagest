/**
 * 🏥 DENTIAGEST CUSTOM CALENDAR TYPES
 * 
 * Purpose: Core TypeScript interfaces for custom calendar
 * Created: Session Aug 9, 2025 - Phase 1
 * Status: Base types definition
 * 
 * Key Decisions:
 * - CalendarView enum for month/week/day modes
 * - TimeSlot represents 15min intervals in 2x2 grid
 * - Following Dentiagest appointment structure
 * 
 * @author Punk Claude & Platform Gestia Developer
 */

// Import existing appointment type instead of redefining
import { Appointment } from '../../../hooks/useAppointments.ts';

export type CalendarView = 'month' | 'week' | 'day';

export interface TimeSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
  gridPosition: {
    row: number; // 1 or 2 (top/bottom of hour)
    col: number; // 1 or 2 (left/right of hour)
  };
}

export interface CalendarDay {
  date: Date;
  isToday: boolean;
  isCurrentMonth: boolean;
  appointments: Appointment[]; // Use existing type
  timeSlots: TimeSlot[]; // 4 slots per hour, 56 total per day (7am-9pm)
}

export interface CalendarWeek {
  weekStart: Date;
  weekEnd: Date;
  days: CalendarDay[];
}

export interface CalendarMonth {
  monthStart: Date;
  monthEnd: Date;
  weeks: CalendarWeek[];
}

export interface CalendarState {
  currentDate: Date;
  view: CalendarView;
  selectedDate?: Date;
  isLoading: boolean;
  error?: string | null; // Match existing error type
}

// Reuse existing appointment type with calendar-specific extensions
export interface CalendarAppointment extends Appointment {
  // Calendar-specific properties
  gridSlots?: TimeSlot[]; // Which time slots this appointment occupies
  color?: string; // Override default color based on type
}

export interface DragState {
  isDragging: boolean;
  draggedAppointment?: CalendarAppointment;
  dragOverSlot?: TimeSlot;
  originalSlot?: TimeSlot;
}

export interface CalendarProps {
  view?: CalendarView;
  initialDate?: Date;
  onDateChange?: (date: Date) => void;
  onViewChange?: (view: CalendarView) => void;
  onAppointmentClick?: (appointment: CalendarAppointment) => void;
  onSlotClick?: (slot: TimeSlot) => void;
  className?: string;
}
