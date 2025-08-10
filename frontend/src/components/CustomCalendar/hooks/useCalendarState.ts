/**
 * 🏥 DENTIAGEST CALimport { useState, useEffect, useMemo } from 'react';
import { CalendarView, CalendarState, CalendarDay } from '../types/calendar.types.ts';
import { Appointment, useAppointments } from '../../../hooks/useAppointments.ts';
import { 
  generateDayTimeSlots, 
  calculateAppointmentSlots,
  getWeekDates,
  getMonthDates 
} from 'components/CustomCalendar/utils/timeCalculations.ts';
import { format, isSameDay } from 'date-fns';E HOOK
 * 
 * Purpose: Main state management for custom calendar
 * Created: Session Aug 9, 2025 - Phase 1
 * Status: Base state management
 * 
 * Key Decisions:
 * - Centralized calendar state management
 * - Integration with existing useAppointments hook
 * - Support for month/week/day view modes
 * - Reuse existing timezone utilities
 * 
 * Dependencies:
 * - useAppointments: Existing appointment CRUD hook
 * - timeCalculations: Custom time utilities
 * 
 * Next Session TODO:
 * - Add drag & drop state management
 * - Implement appointment filtering by date range
 * - Add optimistic updates for better UX
 * 
 * @author Punk Claude & Platform Gestia Developer
 */

import { useState, useEffect, useMemo } from 'react';
import { CalendarView, CalendarState, CalendarDay } from '../types/calendar.types';
import { Appointment, useAppointments } from '../../../hooks';
import { 
  generateDayTimeSlots, 
  calculateAppointmentSlots,
  getWeekDates,
  getMonthDates 
} from '../utils/timeCalculations';
import { format, isSameDay } from 'date-fns';

interface UseCalendarStateProps {
  initialView?: CalendarView;
  initialDate?: Date;
}

export function useCalendarState({ 
  initialView = 'month', 
  initialDate = new Date() 
}: UseCalendarStateProps = {}) {
  
  // 📅 Core calendar state
  const [state, setState] = useState<CalendarState>({
    currentDate: initialDate,
    view: initialView,
    isLoading: false,
    error: undefined
  });

  // 🔄 Integrate with existing appointments hook
  const { appointments, loading: appointmentsLoading, error: appointmentsError } = useAppointments();

  // 📊 Calculate dates to display based on current view
  const displayDates = useMemo(() => {
    switch (state.view) {
      case 'week':
        return getWeekDates(state.currentDate);
      case 'month':
        return getMonthDates(state.currentDate);
      case 'day':
        return [state.currentDate];
      default:
        return getMonthDates(state.currentDate);
    }
  }, [state.currentDate, state.view]);

  // 🏥 Transform appointments into calendar day objects
  const calendarDays = useMemo<CalendarDay[]>(() => {
    return displayDates.map(date => {
      // Filter appointments for this specific day
      const dayAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.scheduled_date);
        return isSameDay(aptDate, date);
      });

      // Generate time slots for this day
      const timeSlots = generateDayTimeSlots(date);

      // Mark slots as unavailable if they have appointments
      const updatedTimeSlots = timeSlots.map(slot => {
        const hasAppointment = dayAppointments.some(apt => {
          const aptStart = new Date(apt.scheduled_date);
          const aptSlots = calculateAppointmentSlots(aptStart, apt.duration_minutes, timeSlots);
          return aptSlots.some(aptSlot => aptSlot.id === slot.id);
        });

        return {
          ...slot,
          isAvailable: !hasAppointment
        };
      });

      return {
        date,
        isToday: isSameDay(date, new Date()),
        isCurrentMonth: date.getMonth() === state.currentDate.getMonth(),
        appointments: dayAppointments,
        timeSlots: updatedTimeSlots
      };
    });
  }, [displayDates, appointments]);

  // 🎯 State update functions
  const setCurrentDate = (date: Date) => {
    setState(prev => ({ ...prev, currentDate: date }));
  };

  const setView = (view: CalendarView) => {
    setState(prev => ({ ...prev, view }));
  };

  const setSelectedDate = (date: Date) => {
    setState(prev => ({ ...prev, selectedDate: date }));
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    setState(prev => {
      const currentDate = prev.currentDate;
      let newDate: Date;

      switch (prev.view) {
        case 'day':
          newDate = new Date(currentDate);
          newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
          break;
        case 'week':
          newDate = new Date(currentDate);
          newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
          break;
        case 'month':
          newDate = new Date(currentDate);
          newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
          break;
        default:
          newDate = currentDate;
      }

      return { ...prev, currentDate: newDate };
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // 📊 Derived state
  const currentDateFormatted = format(state.currentDate, 'MMMM yyyy');
  const isLoading = state.isLoading || appointmentsLoading;
  const error = state.error || appointmentsError;

  // 🔄 Update loading state when appointments change
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isLoading: appointmentsLoading,
      error: appointmentsError
    }));
  }, [appointmentsLoading, appointmentsError]);

  return {
    // State
    currentDate: state.currentDate,
    view: state.view,
    selectedDate: state.selectedDate,
    isLoading,
    error,
    
    // Computed data
    calendarDays,
    displayDates,
    currentDateFormatted,
    
    // Actions
    setCurrentDate,
    setView,
    setSelectedDate,
    navigateDate,
    goToToday,
    
    // Raw data (for advanced use cases)
    appointments
  };
}
