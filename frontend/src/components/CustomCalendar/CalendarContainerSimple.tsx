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
import { parseClinicDateTime } from '../../utils/timezone.ts'; // 🌍 TIMEZONE SOLUTION!

interface CalendarProps {
  view?: 'month' | 'week' | 'day';
  initialDate?: Date;
  onDateChange?: (date: Date) => void;
  onViewChange?: (view: 'month' | 'week' | 'day') => void;
  className?: string;
  appointments?: any[]; // 🏥 REAL APPOINTMENT DATA
  onAppointmentClick?: (appointment: any) => void;
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
  } = useCalendarState(view);

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
          <div className="month-view">
            {/* Calendar Grid */}
            <div className="calendar-grid">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-600 p-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarData.days.map((date, index) => (
                  <div
                    key={index}
                    onClick={() => handleDateClick(date)}
                    className={`
                      calendar-day p-3 text-center cursor-pointer rounded border h-20 transition-all
                      ${helpers.isDateInCurrentMonth(date) 
                        ? 'bg-white text-gray-900 hover:bg-gray-50 border-gray-200' 
                        : 'bg-gray-100 text-gray-400 border-gray-300'
                      }
                      ${helpers.isDateToday(date) 
                        ? 'ring-2 ring-gray-500 bg-gray-100 font-bold' 
                        : ''
                      }
                      hover:shadow-md
                    `}
                  >
                    <div className="font-medium">
                      {format(date, 'd')}
                    </div>
                    
                    {/* � PROFESSIONAL APPOINTMENT INDICATORS */}
                    <div className="mt-1 flex flex-col items-center space-y-1">
                      {(() => {
                        const dayAppointments = appointments.filter(apt => {
                          const aptDate = parseClinicDateTime(apt.scheduled_date);
                          return format(aptDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
                        });
                        
                        const appointmentCount = dayAppointments.length;
                        
                        // ✅ APPOINTMENTS LOADED: Ready for professional display
                        if (appointmentCount === 0) {
                          return null; // Empty day - clean
                        }
                        
                        if (appointmentCount <= 3) {
                          // Show individual dots for 1-3 appointments (BIGGER & MORE VISUAL)
                          return (
                            <div className="flex space-x-1">
                              {dayAppointments.slice(0, 3).map((apt, idx) => (
                                <div 
                                  key={apt.id || idx}
                                  className={`
                                    w-3 h-3 rounded-full cursor-pointer hover:scale-125 transition-transform
                                  `}
                                  style={{
                                    backgroundColor: (() => {
                                      // 🎯 PRIORITY OVERRIDES (diferentes tonos para diferenciar!)
                                      if (apt.priority === 'urgent') return '#b91c1c'; // Rojo más oscuro (urgent)
                                      if (apt.priority === 'high') return '#f97316'; // Naranja puro (high)
                                      
                                      // 🎨 RAUL'S 4-COLOR SYSTEM (FUCK THE MAPPING!)
                                      const type = apt.appointment_type?.toLowerCase() || '';
                                      
                                      // 🔵 AZUL - Limpiezas únicamente
                                      if (type.includes('limpieza') || type.includes('higiene') || type.includes('cleaning')) {
                                        return '#2563eb'; // Blue
                                      }
                                      
                                      // 🔴 ROJO - Emergencias
                                      if (type.includes('emergencia') || type.includes('urgencia') || type.includes('emergency')) {
                                        return '#dc2626'; // Red
                                      }
                                      
                                      // 🟡 AMARILLO LIMÓN - TODO TRATAMIENTO (endodoncia, corona, extraccion, empaste, ortodoncia, etc.)
                                      if (type.includes('endodoncia') || type.includes('corona') || type.includes('extraccion') || 
                                          type.includes('empaste') || type.includes('ortodoncia') || type.includes('orthodontics') ||
                                          type.includes('implante') || type.includes('cirugia') || type.includes('tratamiento') || 
                                          type.includes('filling') || type.includes('surgery') || type.includes('treatment') || 
                                          type.includes('brackets') || type.includes('root_canal') || type.includes('crown') || 
                                          type.includes('implant') || type.includes('extraction')) {
                                        return '#ffff00'; // Pure bright yellow (limón!)
                                      }
                                      
                                      // 🟢 VERDE - TODO LO DEMÁS (consultas, seguimientos, revisiones)
                                      return '#16a34a'; // Green
                                    })()
                                  }}
                                  title={`${apt.patient_name} - ${apt.title} (${format(parseClinicDateTime(apt.scheduled_date), 'HH:mm')}) | Tipo: ${apt.appointment_type} | Prioridad: ${apt.priority}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    // 🎯 Direct appointment preview/navigation
                                    if (onAppointmentClick) {
                                      // Create modal-compatible appointment object
                                      const appointmentForModal = {
                                        id: apt.id,
                                        title: `${apt.patient_name} - ${apt.title}`,
                                        start: apt.scheduled_date,
                                        extendedProps: {
                                          id: apt.id,
                                          patient_id: apt.patient_id,
                                          patient_name: apt.patient_name,
                                          title: apt.title,
                                          scheduled_date: apt.scheduled_date,
                                          duration_minutes: apt.duration_minutes,
                                          appointment_type: apt.appointment_type,
                                          priority: apt.priority,
                                          status: apt.status,
                                          description: apt.description,
                                          notes: apt.notes
                                        }
                                      };
                                      onAppointmentClick(appointmentForModal);
                                    }
                                  }}
                                />
                              ))}
                            </div>
                          );
                        } else {
                          // Show count badge for 4+ appointments (MINIMALIST NUMBER)
                          return (
                            <div className="flex flex-col items-center">
                              <div className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center cursor-pointer transition-colors">
                                {appointmentCount}
                              </div>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentView === 'week' && (
          <WeekViewSimple
            currentDate={currentDate}
            onDateClick={handleDateClick}
            onTimeSlotClick={handleTimeSlotClick}
            onAppointmentClick={onAppointmentClick} // 🎯 CONECTAR CLICK EDITOR!
            appointments={appointments} // 🏥 PASS REAL APPOINTMENTS!
            className="week-view-container"
          />
        )}

        {currentView === 'day' && (
          <DayViewSimple
            currentDate={currentDate}
            onTimeSlotClick={handleTimeSlotClick}
            onAppointmentClick={onAppointmentClick} // 🎯 CONECTAR CLICK EDITOR!
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
