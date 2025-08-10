/**
 * 🏴‍☠️ AInarkalendar - Week View SIMPLE VERSION
 * 
 * ⚡ Built by: PunkClaude (RESURRECTED MODE)
 * 🎯 Mission: Make it work, make it punk, make it fast
 * 💀 Strategy: Copy what works from monthly view
 * 
 * "Sometimes you gotta burn it down to build it right"
 * - PunkClaude, The Phoenix Coder
 */

import React from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { parseClinicDateTime } from '../../utils/timezone.ts';

interface WeekViewProps {
  currentDate: Date;
  onDateClick?: (date: Date) => void;
  onTimeSlotClick?: (date: Date, time: string) => void;
  appointments?: any[];
  className?: string;
}

export function WeekViewSimple({ 
  currentDate, 
  onDateClick,
  onTimeSlotClick,
  appointments = [],
  className = '' 
}: WeekViewProps) {

  // Generate week days starting from Monday
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  // Working hours: 7am to 9pm
  const workingHours = Array.from({ length: 14 }, (_, i) => i + 7);

  // 🎯 SIMPLE APPOINTMENT FILTER - COPY FROM MONTHLY VIEW SUCCESS
  const getAppointmentsForDayAndHour = (day: Date, hour: number) => {
    return appointments.filter(apt => {
      if (!apt.scheduled_date) return false;
      
      try {
        const aptDate = parseClinicDateTime(apt.scheduled_date);
        if (!aptDate) return false;
        
        const sameDay = format(aptDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
        const sameHour = aptDate.getHours() === hour;
        
        return sameDay && sameHour;
      } catch (error) {
        return false;
      }
    });
  };

  return (
    <div className={`week-view-simple ${className}`}>
      {/* Week Header */}
      <div className="week-header grid grid-cols-8 gap-1 mb-2">
        <div className="time-header p-2 bg-gray-100 border rounded text-center font-semibold">
          Hora
        </div>
        {weekDays.map(day => (
          <div key={day.toISOString()} className="day-header p-2 bg-blue-50 border rounded text-center">
            <div className="font-semibold">{format(day, 'EEE', { locale: es })}</div>
            <div className="text-sm">{format(day, 'd')}</div>
          </div>
        ))}
      </div>

      {/* Week Grid */}
      <div className="week-grid">
        {workingHours.map(hour => (
          <div key={hour} className="hour-row grid grid-cols-8 gap-1 mb-1">
            {/* Time label */}
            <div className="time-label p-2 bg-gray-50 border rounded text-center text-sm font-medium">
              {hour}:00
            </div>

            {/* Day columns */}
            {weekDays.map(day => {
              const dayAppointments = getAppointmentsForDayAndHour(day, hour);

              return (
                <div 
                  key={`${day.toISOString()}-${hour}`}
                  className="day-cell p-2 bg-white border rounded min-h-[60px] cursor-pointer hover:bg-gray-50"
                  onClick={() => onTimeSlotClick?.(day, `${hour}:00`)}
                >
                  {dayAppointments.map(apt => (
                    <div 
                      key={apt.id}
                      className="appointment-block mb-1 p-1 bg-blue-100 border border-blue-300 rounded text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle appointment click here
                      }}
                    >
                      <div className="font-semibold truncate">
                        {apt.patient_name || 'Paciente'}
                      </div>
                      <div className="text-gray-600 truncate">
                        {apt.title || apt.appointment_type}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="week-footer mt-4 text-center text-sm text-gray-500">
        📅 Semana del {format(weekStart, 'd MMM yyyy', { locale: es })}
      </div>
    </div>
  );
}
