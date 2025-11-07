/**
 * 🏥 DENTIAGEST CALENDAR STATE HOOK - SIMPLIFIED VERSION
 */

import { useState, useMemo, useEffect } from 'react';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  format,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  addDays
} from 'date-fns';
import { es } from 'date-fns/locale';

export type CalendarView = 'month' | 'week' | 'day';

interface CalendarData {
  days: Date[];
  monthName: string;
  weeks: Date[][];
}

export function useCalendarState(initialView: CalendarView = 'month', initialDate?: Date) {
  const [currentDate, setCurrentDate] = useState(initialDate || new Date());
  const [view, setView] = useState<CalendarView>(initialView);

  // 🔄 SYNC WITH PARENT WHEN INITIAL DATE CHANGES
  useEffect(() => {
    if (initialDate) {
      setCurrentDate(initialDate);
    }
  }, [initialDate]);

  // Navigation functions
  const goToNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));
  const goToPreviousMonth = () => setCurrentDate(prev => subMonths(prev, 1));
  const goToToday = () => setCurrentDate(new Date());
  const goToDate = (date: Date) => setCurrentDate(date);

  // Enhanced navigation for different views
  const goToNext = () => {
    if (view === 'month') {
      goToNextMonth();
    } else if (view === 'week') {
      setCurrentDate(prev => addDays(prev, 7));
    } else if (view === 'day') {
      setCurrentDate(prev => addDays(prev, 1));
    }
  };

  const goToPrevious = () => {
    if (view === 'month') {
      goToPreviousMonth();
    } else if (view === 'week') {
      setCurrentDate(prev => addDays(prev, -7));
    } else if (view === 'day') {
      setCurrentDate(prev => addDays(prev, -1));
    }
  };

  // Calendar calculations
  const calendarData = useMemo<CalendarData>(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const weeks = Array.from({ length: Math.ceil(days.length / 7) }, (_, i) =>
      days.slice(i * 7, (i + 1) * 7)
    );

    return {
      days,
      monthName: format(currentDate, 'MMMM yyyy', { locale: es }),
      weeks
    };
  }, [currentDate]);

  // Helper functions
  const isDateInCurrentMonth = (date: Date) => 
    date.getMonth() === currentDate.getMonth() && 
    date.getFullYear() === currentDate.getFullYear();
  
  const isDateToday = (date: Date) => isToday(date);
  
  const isDateSelected = (date: Date, selectedDate?: Date) => 
    selectedDate ? isSameDay(date, selectedDate) : false;

  return {
    currentDate,
    view,
    calendarData,
    navigation: {
      goToNextMonth,
      goToPreviousMonth,
      goToNext,
      goToPrevious,
      goToToday,
      goToDate
    },
    helpers: {
      isDateInCurrentMonth,
      isDateToday,
      isDateSelected
    },
    setView
  };
}

