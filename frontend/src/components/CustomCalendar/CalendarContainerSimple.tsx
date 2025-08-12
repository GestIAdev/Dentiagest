/**
 * 🏴‍☠️ IAnarkalendar © GestIA Dev + PunkClaude 2025
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCalendarState } from './hooks/useCalendarStateSimple.ts';
import { WeekViewSimple } from './WeekViewSimple.tsx';
import { DayViewSimple } from './DayViewSimple.tsx';
import MonthViewSimple from './MonthViewSimple.tsx';
import { parseClinicDateTime } from '../../utils/timezone.ts'; // 🌍 TIMEZONE SOLUTION!

interface CalendarProps {
  view?: 'month' | 'week' | 'day';
  initialDate?: Date;
  onDateChange?: (date: Date) => void;
  onViewChange?: (view: 'month' | 'week' | 'day') => void;
  className?: string;
  appointments?: any[]; // 🏥 REAL APPOINTMENT DATA
  onAppointmentClick?: (appointment: any) => void;
  onAppointmentUpdate?: () => void; // 🔥 NEW: Callback to refresh appointments
  onDateClick?: (date: Date) => void;
  onTimeSlotClick?: (date: Date, time: string) => void; // 🕒 FOR + BUTTON FUNCTIONALITY
}

export function CalendarContainer({ 
  view = 'month', 
  initialDate = new Date(),
  onDateChange,
  onViewChange,
  className = '',
  appointments = [],
  onAppointmentClick,
  onAppointmentUpdate, // 🔥 NEW: Callback to refresh appointments
  onDateClick,
  onTimeSlotClick // 🕒 + BUTTON HANDLER
}: CalendarProps) {
  
  const navigate = useNavigate();
  const {
    currentDate,
    calendarData,
    navigation,
    helpers,
    view: currentView,
    setView
  } = useCalendarState(view, initialDate); // 🔥 PASS INITIAL DATE

  // 🔄 SYNC INTERNAL STATE CHANGES WITH PARENT
  useEffect(() => {
    if (onDateChange) {
      onDateChange(currentDate);
    }
  }, [currentDate, onDateChange]);

  useEffect(() => {
    if (onViewChange) {
      onViewChange(currentView);
    }
  }, [currentView, onViewChange]);

  // 🏴‍☠️ AINARKALENDAR - Professional calendar system
  // Built by: PunkClaude & Raul (GestIA Dev - 2025)

  /*
   * ═════════════════════════════════════════════════════════════════
   * 🏴‍☠️ PROPRIETARY SIGNATURE - DO NOT REMOVE OR MODIFY
   * ═════════════════════════════════════════════════════════════════
   * █▀█ █░█ █▄░█ █▄▀ █▀▀ █░░ ▄▀█ █░█ █▀▄ █▀▀   &   █▀█ ▄▀█ █░█ █░░
   * █▀▀ █▄█ █░▀█ █░█ █▄▄ █▄▄ █▀█ █▄█ █▄▀ ██▄   &   █▀▄ █▀█ █▄█ █▄▄
   * ═════════════════════════════════════════════════════════════════
   * 🎯 IAnarkalendar System v0.99 - Digital Freedom Calendar
   * 💰 $1000+ Annually Saved vs SaaS Solutions
   * ⚡ AI + Human Anarchism = True Innovation
   * 🚀 Custom Built, Production Ready, Metal Grade
   * ═════════════════════════════════════════════════════════════════
   * License: Proprietary - GestIA Dev Team
   * Copyright © 2025 PunkClaude & Raul - All Rights Reserved
   * ═════════════════════════════════════════════════════════════════
   */

  const handleDateClick = (date: Date) => {
    // 🎯 PROFESSIONAL SOLUTION: Switch to daily view with selected date
    navigation.goToDate(date); // Set the clicked date
    setView('day'); // Switch to daily view
    
    // Call parent callbacks (but NOT onDateClick to avoid triggering time slot modal)
    if (onDateChange) {
      onDateChange(date);
    }
    // 🚫 SKIP onDateClick to prevent unwanted modal opening
    // if (onDateClick) {
    //   onDateClick(date);
    // }
    if (onViewChange) {
      onViewChange('day'); // Notify parent of view change
    }
  };

  const handleViewChange = (newView: 'month' | 'week' | 'day') => {
    setView(newView);
    if (onViewChange) {
      onViewChange(newView);
    }
  };

  const handleTimeSlotClick = (date: Date, time: string) => {
    // 🎯 CONECTAR CON MODAL DE CREACIÓN
    if (onTimeSlotClick) {
      onTimeSlotClick(date, time);
    }
  };

  const handleAppointmentMove = (appointment: any, newTime: Date) => {
    // ✅ APPOINTMENT MOVED: Future API integration point
    // Future: API call to update appointment
  };

  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <div className={`dentiagest-calendar ${className}`}>
      {/* 🎯 AINARKLENDAR NAVIGATION - Complete Gray Theme */}
      <div className="calendar-header flex justify-between items-center mb-4 p-4 bg-gray-100 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={navigation.goToPrevious}
            className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors shadow-sm flex items-center justify-center min-w-[40px]"
            title="Anterior"
          >
            ←
          </button>
          
          <h2 className="text-xl font-semibold text-gray-800 min-w-[200px] text-center">
            {currentView === 'month' && calendarData.monthName}
            {currentView === 'week' && format(currentDate, "'Semana del' d MMM yyyy", { locale: es })}
            {currentView === 'day' && format(currentDate, "EEEE, d MMM yyyy", { locale: es })}
          </h2>
          
          <button
            onClick={navigation.goToNext}
            className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors shadow-sm flex items-center justify-center min-w-[40px]"
            title="Siguiente"
          >
            →
          </button>
        </div>

        {/* 🎨 AINARKLENDAR View Selector - NUCLEAR ANTI-BLUE ZONE */}
        <div 
          className="view-selector flex space-x-1 bg-white rounded-lg p-1 shadow-sm" 
          style={{ 
            border: '2px solid #d1d5db !important',
            borderColor: '#d1d5db !important',
            outline: 'none !important',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06) !important'
          }}
        >
          {(['month', 'week', 'day'] as const).map(viewOption => (
            <button
              key={viewOption}
              onClick={() => handleViewChange(viewOption)}
              className={`
                px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                ${currentView === viewOption 
                  ? 'bg-gray-700 text-white shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }
              `}
              style={{ 
                border: 'none !important', 
                outline: 'none !important',
                boxShadow: currentView === viewOption ? '0 1px 3px 0 rgba(0, 0, 0, 0.1) !important' : 'none !important'
              }}
            >
              {viewOption === 'month' ? 'Mes' : viewOption === 'week' ? 'Semana' : 'Día'}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Content - Switch between views */}
      <div className="calendar-content">
        {currentView === 'month' && (
          <MonthViewSimple
            currentDate={currentDate}
            appointments={appointments}
            onDateClick={handleDateClick}
            onAppointmentClick={onAppointmentClick}
            calendarData={calendarData}
            helpers={helpers}
          />
        )}

        {currentView === 'week' && (
          <WeekViewSimple
            currentDate={currentDate}
            onDateClick={handleDateClick}
            onTimeSlotClick={handleTimeSlotClick}
            onAppointmentClick={onAppointmentClick} // 🎯 CONECTAR CLICK EDITOR!
            onAppointmentUpdate={onAppointmentUpdate} // 🔄 SAME AS DAILY VIEW!
            appointments={appointments} // 🏥 PASS REAL APPOINTMENTS!
            className="week-view-container"
          />
        )}

        {currentView === 'day' && (
          <DayViewSimple
            currentDate={currentDate}
            onTimeSlotClick={handleTimeSlotClick}
            onAppointmentClick={onAppointmentClick} // 🎯 CONECTAR CLICK EDITOR!
            onAppointmentUpdate={onAppointmentUpdate} // 🔥 Pass refresh callback
            appointments={appointments} // 🏥 PASS REAL APPOINTMENTS!
            className="day-view-container"
          />
        )}
      </div>

      {/* Today button - Clean & Simple */}
      <div className="calendar-footer mt-4 text-center">
        <button
          onClick={navigation.goToToday}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          Hoy
        </button>
      </div>
    </div>
  );
}

export default CalendarContainer;
