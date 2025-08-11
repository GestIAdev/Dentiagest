/**
 * 🏴‍☠️ AInarkalendar System
 * 
 * ⚡ Built by: PunkClaude & Raul (GestIA Dev - 2025)
 * 🎯 Mission: Create independent calendar solutions
 * 💰 Impact: $1000+ annual savings achieved
 * 🚀 Status: 100% Custom Implementation ✅
 * 
 * "AI + Anarchism = True Digital Freedom"
 * - PunkClaude, The Calendar Architect
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
}

export function CalendarContainer({ 
  view = 'month', 
  initialDate = new Date(),
  onDateChange,
  onViewChange,
  className = '',
  appointments = [],
  onAppointmentClick,
  onDateClick
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

  // 🏴‍☠️ AINARKALENDAR INITIALIZATION SIGNATURE
  useEffect(() => {
    console.log(`
    🏴‍☠️ AInarkalendar System Initialized
    ⚡ Built by: PunkClaude & Raul (GestIA Dev - 2025)
    🎯 Mission: Independent calendar development
    💰 Savings: $1000+ annually achieved
    🚀 Status: 100% Custom Implementation
    
    "AI + Anarchism = True Digital Freedom" - PunkClaude, The Calendar Architect
    `);
  }, []);

  const handleDateClick = (date: Date) => {
    if (onDateChange) {
      onDateChange(date);
    }
    if (onDateClick) {
      onDateClick(date);
    }
    // Navigate to day agenda
    navigate(`/calendar/day/${format(date, 'yyyy-MM-dd')}`);
  };

  const handleViewChange = (newView: 'month' | 'week' | 'day') => {
    setView(newView);
    if (onViewChange) {
      onViewChange(newView);
    }
  };

  const handleTimeSlotClick = (date: Date, time: string) => {
    console.log('Time slot clicked:', date, time);
    // Future: Open appointment creation modal
  };

  const handleAppointmentMove = (appointment: any, newTime: Date) => {
    console.log('🎪 APPOINTMENT MOVED IN CONTAINER:', {
      patient: appointment.patientName,
      newTime: format(newTime, 'HH:mm')
    });
    // Future: API call to update appointment
  };

  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <div className={`dentiagest-calendar ${className}`}>
      {/* Header with navigation and view selector */}
      <div className="calendar-header flex justify-between items-center mb-4 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <button
            onClick={navigation.goToPrevious}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ←
          </button>
          
          <h2 className="text-xl font-semibold text-blue-800 min-w-[200px] text-center">
            {currentView === 'month' && calendarData.monthName}
            {currentView === 'week' && format(currentDate, "'Semana del' d MMM yyyy", { locale: es })}
            {currentView === 'day' && format(currentDate, "EEEE, d MMM yyyy", { locale: es })}
          </h2>
          
          <button
            onClick={navigation.goToNext}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            →
          </button>
        </div>

        {/* View Selector */}
        <div className="view-selector flex space-x-1 bg-white rounded p-1">
          {(['month', 'week', 'day'] as const).map(viewOption => (
            <button
              key={viewOption}
              onClick={() => handleViewChange(viewOption)}
              className={`
                px-3 py-1 rounded text-sm font-medium transition-colors
                ${currentView === viewOption 
                  ? 'bg-blue-600 text-white' 
                  : 'text-blue-600 hover:bg-blue-100'
                }
              `}
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
                      calendar-day p-3 text-center cursor-pointer rounded border h-20
                      ${helpers.isDateInCurrentMonth(date) 
                        ? 'bg-white text-gray-900 hover:bg-blue-50' 
                        : 'bg-gray-100 text-gray-400'
                      }
                      ${helpers.isDateToday(date) 
                        ? 'ring-2 ring-blue-500 bg-blue-100' 
                        : ''
                      }
                      hover:shadow-md transition-all
                    `}
                  >
                    <div className="font-medium">
                      {format(date, 'd')}
                    </div>
                    
                    {/* 🏥 REAL APPOINTMENTS DISPLAY */}
                    <div className="mt-1 text-xs space-y-1">
                      {appointments
                        .filter(apt => {
                          // 🌍 USE TIMEZONE UTILITIES - CYBERPUNK SOLUTION!
                          const aptDate = parseClinicDateTime(apt.scheduled_date);
                          return format(aptDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
                        })
                        .slice(0, 2) // Show max 2 appointments per day
                        .map(apt => (
                          <div 
                            key={apt.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onAppointmentClick) {
                                // 🔧 ADAPT APPOINTMENT STRUCTURE FOR MODAL
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
                            className={`
                              px-1 py-0.5 rounded text-white cursor-pointer truncate
                              ${apt.status === 'scheduled' ? 'bg-blue-500' : 
                                apt.status === 'confirmed' ? 'bg-green-500' :
                                apt.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-500'}
                            `}
                            title={`${apt.patient_name} - ${apt.title}`}
                          >
                            {apt.patient_name}
                          </div>
                        ))
                      }
                      {appointments
                        .filter(apt => {
                          // 🌍 CONSISTENT TIMEZONE PARSING
                          const aptDate = parseClinicDateTime(apt.scheduled_date);
                          return format(aptDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
                        }).length > 2 && (
                        <div className="text-gray-500 text-xs">
                          +{appointments.filter(apt => {
                            const aptDate = parseClinicDateTime(apt.scheduled_date);
                            return format(aptDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
                          }).length - 2} más
                        </div>
                      )}
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
