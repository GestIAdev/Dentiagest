/**
 * 🏴‍☠️ IAnarkalendar © GestIA Dev + PunkClaude 2025
 * 🔒 PHASE 3: DIGITAL FORTRESS INTEGRATION - Calendar + Security
 * 🔴 DIRECTIVA 012: MATAR AL FANTASMA - CONECTIVIDAD REAL
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useQuery } from '@apollo/client/react';
import { useAuth } from '../../context/AuthContext'; // 🔒 SECURITY INTEGRATION!
import { useCalendarState } from './hooks/useCalendarStateSimple';
import { WeekViewSimple } from './WeekViewSimple';
import { DayViewSimple } from './DayViewSimple';
import MonthViewSimple from './MonthViewSimple';
import { parseClinicDateTime } from '../../utils/timezone'; // 🌍 TIMEZONE SOLUTION!
import { GET_APPOINTMENTS_V3 } from '../../graphql/queries/appointments'; // 🔴 REAL DATA!

interface CalendarProps {
  view?: 'month' | 'week' | 'day';
  initialDate?: Date;
  onDateChange?: (date: Date) => void;
  onViewChange?: (view: 'month' | 'week' | 'day') => void;
  className?: string;
  // 🔴 DIRECTIVA 012: ELIMINADO prop appointments - Ahora cargamos con useQuery!
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
  onAppointmentClick,
  onAppointmentUpdate, // 🔥 NEW: Callback to refresh appointments
  onDateClick,
  onTimeSlotClick // 🕒 + BUTTON HANDLER
}: CalendarProps) {
  
  // 🔴 DIRECTIVA 012: CARGAR APPOINTMENTS DESDE APOLLO!
  const { data: appointmentsData, loading: appointmentsLoading, error: appointmentsError, refetch: refetchAppointments } = useQuery<{ appointmentsV3: any[] }>(GET_APPOINTMENTS_V3, {
    variables: {
      limit: 1000, // Get all appointments for the calendar
      offset: 0
    },
    pollInterval: 30000, // Refresh every 30 seconds
  });

  // Extract appointments from Apollo response
  const rawAppointments = appointmentsData?.appointmentsV3 || [];

  // 🔴 DIRECTIVA 012: Transform Apollo data to Calendar format
  const transformAppointmentData = (apt: any): any => {
    // 🔧 FIX: Use scheduled_date if available, otherwise construct from date+time
    const scheduledDateStr = apt.scheduled_date || `${apt.appointmentDate}T${apt.appointmentTime || '09:00'}`;
    const startDate = parseClinicDateTime(scheduledDateStr);
    
    const endDate = startDate ? new Date(startDate) : new Date();
    if (startDate) {
      endDate.setMinutes(endDate.getMinutes() + (apt.duration || 30));
    }

    return {
      id: apt.id,
      patientId: apt.patientId,
      patientName: apt.patient ? `${apt.patient.firstName} ${apt.patient.lastName}` : 'Unknown',
      patientPhone: apt.patient?.phone,
      patientEmail: apt.patient?.email,
      startTime: startDate || new Date(),
      endTime: endDate || new Date(),
      duration: apt.duration || 30,
      type: apt.type || 'consultation',
      status: apt.status || 'pending',
      notes: apt.notes,
      appointmentDate: apt.appointmentDate,
      appointmentTime: apt.appointmentTime,
      // 🔧 FIX: Always include scheduled_date for MonthViewSimple compatibility
      scheduled_date: scheduledDateStr,
      appointment_type: apt.type, // Also add for color mapping
      priority: apt.priority || 'normal',
      _veritas: apt._veritas,
    };
  };

  const transformedAppointments = rawAppointments.map(transformAppointmentData);
  
  // 🔒 DIGITAL FORTRESS: Get user role for security filtering
  const { state: authState } = useAuth();
  const userRole = authState.user?.role;
  
  // 🏴‍☠️ PUNKCCLAUDE SECURITY: Filter appointments by role
  const sanitizeAppointmentForRole = (appointment: any, role?: string) => {
    if (!role || role === 'professional') return appointment; // Full anarchist access
    
    if (role === 'admin') return { 
      ...appointment, 
      medical_notes: '🔒 [Medical Data Protected by Digital Fortress]',
      diagnosis: '🔒 [Protected Medical Information]',
      treatment_notes: '🔒 [Professional Access Only]'
    };
    
    if (role === 'recepcionista') return { 
      ...appointment, 
      medical_notes: '🔒 [Restricted - Contact Doctor]',
      diagnosis: '🔒 [Protected Patient Privacy]',
      treatment_plan: '🔒 [Medical Professional Only]',
      treatment_notes: '🔒 [Medical Data Protected]'
    };
    
    return appointment; // Default: no filtering
  };

  // 🎯 Apply security filtering to appointments
  const secureAppointments = transformedAppointments.map((apt: any) => 
    sanitizeAppointmentForRole(apt, userRole)
  );
  
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

  // 🔴 DIRECTIVA 012: Handle appointment refetch callback
  useEffect(() => {
    if (onAppointmentUpdate) {
      const handleUpdate = () => {
        refetchAppointments();
      };
      // Register for updates if needed
      return () => {
        // Cleanup
      };
    }
  }, [onAppointmentUpdate, refetchAppointments]);

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
    <div className={`dentiagest-calendar h-full flex flex-col overflow-hidden ${className}`}>
      {/* 🎯 AINARKLENDAR NAVIGATION - Cyberpunk Medical Theme */}
      <div className="calendar-header flex-shrink-0 flex justify-between items-center mb-4 p-4 bg-slate-900/40 backdrop-blur-md rounded-lg border border-purple-500/20 shadow-lg shadow-purple-500/10">
        <div className="flex items-center space-x-3">
          <button
            onClick={navigation.goToPrevious}
            className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700/80 border border-purple-500/30 text-cyan-400 rounded transition-all shadow-sm flex items-center justify-center min-w-[40px]"
            title="Anterior"
          >
            ←
          </button>
          
          <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 min-w-[200px] text-center">
            {currentView === 'month' && calendarData.monthName}
            {currentView === 'week' && format(currentDate, "'Semana del' d MMM yyyy", { locale: es })}
            {currentView === 'day' && format(currentDate, "EEEE, d MMM yyyy", { locale: es })}
          </h2>
          
          <button
            onClick={navigation.goToNext}
            className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700/80 border border-purple-500/30 text-cyan-400 rounded transition-all shadow-sm flex items-center justify-center min-w-[40px]"
            title="Siguiente"
          >
            →
          </button>
        </div>

        {/* 🎨 AINARKLENDAR View Selector - Cyberpunk */}
        <div className="view-selector flex space-x-1 bg-slate-900/60 backdrop-blur-sm rounded-lg p-1 border border-purple-500/20">
          {(['month', 'week', 'day'] as const).map(viewOption => (
            <button
              key={viewOption}
              onClick={() => handleViewChange(viewOption)}
              className={`
                px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                ${currentView === viewOption 
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-purple-500/25' 
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-cyan-300'
                }
              `}
            >
              {viewOption === 'month' ? 'Mes' : viewOption === 'week' ? 'Semana' : 'Día'}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Content - Switch between views */}
      <div className="calendar-content flex-1 overflow-y-auto">
        {currentView === 'month' && (
          <MonthViewSimple
            currentDate={currentDate}
            appointments={secureAppointments} // 🔒 SECURE APPOINTMENTS!
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
            appointments={secureAppointments} // 🔒 SECURE APPOINTMENTS!
            className="week-view-container"
          />
        )}

        {currentView === 'day' && (
          <DayViewSimple
            currentDate={currentDate}
            onTimeSlotClick={handleTimeSlotClick}
            onAppointmentClick={onAppointmentClick} // 🎯 CONECTAR CLICK EDITOR!
            onAppointmentUpdate={onAppointmentUpdate} // 🔥 Pass refresh callback
            appointments={secureAppointments} // 🔒 SECURE APPOINTMENTS!
            className="day-view-container"
          />
        )}
      </div>

      {/* Today button - Cyberpunk */}
      <div className="calendar-footer flex-shrink-0 mt-4 text-center">
        <button
          onClick={navigation.goToToday}
          className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 border border-purple-500/30 text-cyan-400 rounded transition-all shadow-sm"
        >
          Hoy
        </button>
      </div>
    </div>
  );
}

export default CalendarContainer;

