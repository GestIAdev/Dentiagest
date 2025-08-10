/**
 * 🏥 DENTIAGEST CALENDAR CONTAINER
 * 
 * Purpose: Main calendar component with view switching
 * Created: Session Aug 9, 2025 - Phase 1
 * Status: Basic container with month view
 * 
 * Key Decisions:
 * - Month view with fixed cells (no resize disasters)
 * - Day click navigates to existing day agenda
 * - Following Dentiagest color palette and typography
 * 
 * Next Session TODO:
 * - Add week and day views with 2x2 grid
 * - Implement drag & drop functionality
 * - Add responsive design
 * 
 * Dependencies:
 * - useCalendarState: Custom calendar state hook
 * - useNavigate: React Router for day navigation
 * 
 * @author Punk Claude & Platform Gestia Developer
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format, isSameDay } from 'date-fns';
import { useCalendarState } from './hooks/useCalendarState.ts';
import { CalendarProps } from './types/calendar.types.ts';

export function CalendarContainer({ 
  view = 'month', 
  initialDate = new Date(),
  onDateChange,
  onViewChange,
  className = ''
}: CalendarProps) {
  
  const navigate = useNavigate();
  
  const {
    currentDate,
    view: currentView,
    calendarDays,
    currentDateFormatted,
    isLoading,
    error,
    setCurrentDate,
    setView,
    navigateDate,
    goToToday
  } = useCalendarState({ 
    initialView: view, 
    initialDate 
  });

  // 🎯 Handle day click - navigate to day agenda
  const handleDayClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    navigate(`/agenda/day/${dateStr}`);
  };

  // 🎯 Handle view change
  const handleViewChange = (newView: typeof view) => {
    setView(newView);
    onViewChange?.(newView);
  };

  // 🎯 Handle date change
  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
    onDateChange?.(date);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-600">
        <p>Error loading calendar: {error}</p>
      </div>
    );
  }

  return (
    <div className={`dentiagest-calendar ${className}`}>
      {/* 🎨 Calendar Header */}
      <div className="calendar-header flex items-center justify-between mb-6 p-4 bg-white rounded-lg shadow-sm border">
        
        {/* Navigation Controls */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateDate('prev')}
            className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Previous period"
          >
            ←
          </button>
          
          <h2 className="text-xl font-semibold text-gray-800 min-w-[180px] text-center">
            {currentDateFormatted}
          </h2>
          
          <button
            onClick={() => navigateDate('next')}
            className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Next period"
          >
            →
          </button>
        </div>

        {/* View Selector & Today Button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={goToToday}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
          >
            Hoy
          </button>
          
          <div className="flex border rounded-md overflow-hidden">
            {(['month', 'week', 'day'] as const).map((viewOption) => (
              <button
                key={viewOption}
                onClick={() => handleViewChange(viewOption)}
                className={`px-3 py-2 text-sm transition-colors ${
                  currentView === viewOption
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {viewOption === 'month' ? 'Mes' : viewOption === 'week' ? 'Semana' : 'Día'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 🗓️ Calendar Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {currentView === 'month' && (
            <MonthView 
              calendarDays={calendarDays}
              onDayClick={handleDayClick}
              currentDate={currentDate}
            />
          )}
          
          {currentView === 'week' && (
            <div className="text-center py-16 text-gray-500">
              Week view with 2x2 grid - Coming in Phase 2! 🚀
            </div>
          )}
          
          {currentView === 'day' && (
            <div className="text-center py-16 text-gray-500">
              Day view with 2x2 grid - Coming in Phase 2! 🚀
            </div>
          )}
        </>
      )}
    </div>
  );
}

// 📅 Month View Component
interface MonthViewProps {
  calendarDays: ReturnType<typeof useCalendarState>['calendarDays'];
  onDayClick: (date: Date) => void;
  currentDate: Date;
}

function MonthView({ calendarDays, onDayClick, currentDate }: MonthViewProps) {
  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  
  // Group days into weeks (7 days each)
  const weeks: typeof calendarDays[] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  return (
    <div className="month-view bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Week day headers */}
      <div className="grid grid-cols-7 bg-gray-50 border-b">
        {weekDays.map((day) => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-700">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="calendar-grid">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7">
            {week.map((day) => (
              <DayCell
                key={format(day.date, 'yyyy-MM-dd')}
                day={day}
                onClick={() => onDayClick(day.date)}
                isCurrentMonth={day.isCurrentMonth}
                isToday={day.isToday}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// 📅 Day Cell Component
interface DayCellProps {
  day: ReturnType<typeof useCalendarState>['calendarDays'][0];
  onClick: () => void;
  isCurrentMonth: boolean;
  isToday: boolean;
}

function DayCell({ day, onClick, isCurrentMonth, isToday }: DayCellProps) {
  const appointmentCount = day.appointments.length;
  const hasAppointments = appointmentCount > 0;
  
  return (
    <div
      className={`day-cell min-h-[100px] p-2 border-r border-b cursor-pointer hover:bg-gray-50 transition-colors ${
        !isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'
      } ${isToday ? 'bg-blue-50 border-blue-200' : ''}`}
      onClick={onClick}
    >
      {/* Day number */}
      <div className={`text-sm font-medium mb-1 ${
        isToday ? 'text-blue-600 font-bold' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
      }`}>
        {format(day.date, 'd')}
      </div>

      {/* Appointments preview */}
      {hasAppointments && (
        <div className="space-y-1">
          {/* Show first 3 appointments */}
          {day.appointments.slice(0, 3).map((apt, index) => (
            <div
              key={apt.id}
              className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate"
              title={`${apt.patient_name} - ${apt.appointment_type}`}
            >
              {format(new Date(apt.scheduled_date), 'HH:mm')} {apt.patient_name}
            </div>
          ))}
          
          {/* "+X more" indicator */}
          {appointmentCount > 3 && (
            <div className="text-xs text-gray-600 font-medium">
              +{appointmentCount - 3} más
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CalendarContainer;
