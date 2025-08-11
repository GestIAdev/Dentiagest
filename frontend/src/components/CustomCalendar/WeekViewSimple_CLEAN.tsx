/**
 * 🗓️ DENTIAGEST WEEK VIEW - CLEAN VERSION
 * 
 * Simple, functional week view without complex stacking
 * Focus: Clarity over complexity
 * 
 * @author Claude & Raul - Emergency Clean Version
 */

import React from 'react';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

interface AppointmentForCalendar {
  id: string;
  patient_name: string;
  scheduled_date: string;
  appointment_type: 'consulta' | 'limpieza' | 'tratamiento' | 'emergencia';
  notes?: string;
}

interface WeekViewSimpleProps {
  weekStart: Date;
  appointments: AppointmentForCalendar[];
  onTimeSlotClick?: (date: Date, time: string) => void;
  onAppointmentClick?: (appointment: AppointmentForCalendar) => void;
}

export default function WeekViewSimple({
  weekStart,
  appointments,
  onTimeSlotClick,
  onAppointmentClick
}: WeekViewSimpleProps) {

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  // Generate hours (8 AM to 6 PM)
  const hours = Array.from({ length: 10 }, (_, i) => i + 8);
  
  const rowHeight = 80; // Fixed height for each hour row

  // Get appointments for specific day and hour
  const getAppointmentsForDayAndHour = (day: Date, hour: number): AppointmentForCalendar[] => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.scheduled_date);
      const aptHour = aptDate.getHours();
      return (
        aptDate.toDateString() === day.toDateString() &&
        aptHour === hour
      );
    });
  };

  // Get appointment colors
  const getAppointmentStyles = (type: string) => {
    switch (type) {
      case 'consulta':
        return 'bg-green-50 border-green-400 text-green-800 hover:bg-green-100';
      case 'limpieza':
        return 'bg-blue-50 border-blue-400 text-blue-800 hover:bg-blue-100';
      case 'tratamiento':
        return 'bg-orange-50 border-orange-400 text-orange-800 hover:bg-orange-100';
      case 'emergencia':
        return 'bg-red-50 border-red-400 text-red-800 hover:bg-red-100';
      default:
        return 'bg-gray-50 border-gray-400 text-gray-800 hover:bg-gray-100';
    }
  };

  const getAvatarColor = (type: string) => {
    switch (type) {
      case 'consulta': return 'bg-green-500';
      case 'limpieza': return 'bg-blue-500';
      case 'tratamiento': return 'bg-orange-500';
      case 'emergencia': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPatientInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="week-view-simple bg-white rounded-lg shadow-sm border border-gray-200">
      
      {/* Header with days */}
      <div className="week-header grid grid-cols-8 gap-1 p-4 bg-gray-50 border-b border-gray-200">
        <div className="time-header text-center text-sm font-medium text-gray-700">
          Hora
        </div>
        {weekDays.map(day => (
          <div key={day.toISOString()} className="day-header text-center">
            <div className="text-sm font-medium text-gray-700">
              {format(day, 'EEEE', { locale: es })}
            </div>
            <div className="text-lg font-bold text-gray-900">
              {format(day, 'd')}
            </div>
            <div className="text-xs text-gray-500">
              {format(day, 'MMM', { locale: es })}
            </div>
          </div>
        ))}
      </div>

      {/* Time slots grid */}
      <div className="week-grid p-4">
        {hours.map(hour => (
          <div key={hour} className="hour-row grid grid-cols-8 gap-1 mb-2">
            
            {/* Time column */}
            <div 
              className="time-column bg-gray-100 border border-gray-300 rounded flex items-center justify-center"
              style={{ height: `${rowHeight}px` }}
            >
              <div className="text-center">
                <div className="text-sm font-medium text-gray-700">{hour}:00</div>
                <div className="text-xs text-gray-500">{hour + 1}:00</div>
              </div>
            </div>

            {/* Day columns */}
            {weekDays.map(day => {
              const hourAppointments = getAppointmentsForDayAndHour(day, hour);
              
              return (
                <div 
                  key={`${day.toISOString()}-${hour}`}
                  className="day-slot border border-gray-300 rounded bg-white hover:bg-blue-50 transition-colors cursor-pointer p-1"
                  style={{ height: `${rowHeight}px` }}
                  onClick={() => onTimeSlotClick?.(day, `${hour}:00`)}
                >
                  
                  {/* No appointments */}
                  {hourAppointments.length === 0 && (
                    <div className="h-full flex items-center justify-center text-xs text-gray-400">
                      Libre
                    </div>
                  )}

                  {/* Single appointment */}
                  {hourAppointments.length === 1 && (
                    <div 
                      className={`h-full w-full rounded border-l-4 p-2 cursor-pointer transition-all duration-200 ${getAppointmentStyles(hourAppointments[0].appointment_type)}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAppointmentClick?.(hourAppointments[0]);
                      }}
                    >
                      {/* Patient info */}
                      <div className="flex items-center space-x-2 mb-1">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white ${getAvatarColor(hourAppointments[0].appointment_type)}`}>
                          {getPatientInitials(hourAppointments[0].patient_name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-xs truncate">{hourAppointments[0].patient_name}</div>
                        </div>
                      </div>
                      
                      {/* Appointment details */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium capitalize">{hourAppointments[0].appointment_type}</span>
                        <span className="text-gray-500">
                          {new Date(hourAppointments[0].scheduled_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Multiple appointments */}
                  {hourAppointments.length > 1 && (
                    <div className="h-full w-full relative">
                      
                      {/* Main appointment display */}
                      <div 
                        className={`h-full w-full rounded border-l-4 p-2 cursor-pointer transition-all duration-200 ${getAppointmentStyles(hourAppointments[0].appointment_type)}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAppointmentClick?.(hourAppointments[0]);
                        }}
                      >
                        {/* Patient info */}
                        <div className="flex items-center space-x-2 mb-1">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white ${getAvatarColor(hourAppointments[0].appointment_type)}`}>
                            {getPatientInitials(hourAppointments[0].patient_name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-xs truncate">{hourAppointments[0].patient_name}</div>
                          </div>
                        </div>
                        
                        {/* Appointment details */}
                        <div className="text-xs mb-1">
                          <span className="font-medium capitalize">{hourAppointments[0].appointment_type}</span>
                        </div>
                        
                        {/* Additional appointments info */}
                        <div className="text-xs text-gray-600">
                          +{hourAppointments.length - 1} más
                        </div>
                      </div>
                      
                      {/* Counter badge */}
                      <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                        {hourAppointments.length}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="week-footer p-4 text-center border-t border-gray-200 bg-gray-50">
        <div className="text-sm text-gray-600">
          📅 Semana del {format(weekStart, 'd MMM', { locale: es })} al {format(addDays(weekStart, 6), 'd MMM yyyy', { locale: es })}
        </div>
      </div>
    </div>
  );
}
