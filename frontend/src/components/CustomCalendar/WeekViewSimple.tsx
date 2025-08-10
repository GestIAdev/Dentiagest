/**
 * 🏴‍☠️ AInarkalendar - Week View FICHERO DESIGN
 * 
 * ⚡ Built by: PunkClaude (FICHERO MODE ACTIVATED)
 * 🎯 Mission: 2x2 Grid Smart + Hora Colapsada Inteligente
 * 💀 Strategy: Aesthetic fichero design with professional UX
 * 
 * "Build the fichero armario that makes dentists weep with joy"
 * - PunkClaude, The Aesthetic Anarchist
 */

import React from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { parseClinicDateTime } from '../../utils/timezone.ts';
import { TIME_SLOTS } from '../../utils/timeSlots.ts';
import { AppointmentCard, AppointmentData } from './AppointmentCard.tsx';

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
  
  // Working hours: 7am to 8pm (from TIME_SLOTS)
  const workingHours = Array.from({ length: 14 }, (_, i) => i + 7);

  // 🎯 SMART APPOINTMENT FILTER - POR 15-MINUTE SLOT
  const getAppointmentsForDayAndSlot = (day: Date, hour: number, minute: number) => {
    return appointments.filter(apt => {
      if (!apt.scheduled_date) return false;
      
      try {
        const aptDate = parseClinicDateTime(apt.scheduled_date);
        if (!aptDate) return false;
        
        const sameDay = format(aptDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
        const sameHour = aptDate.getHours() === hour;
        const slotMinute = Math.floor(aptDate.getMinutes() / 15) * 15; // Round to 15-min slot
        
        return sameDay && sameHour && slotMinute === minute;
      } catch (error) {
        return false;
      }
    });
  };

  // 🎨 CONVERT TO APPOINTMENTDATA FOR EPIC CARDS
  const convertToAppointmentData = (apt: any): AppointmentData => {
    const startTime = parseClinicDateTime(apt.scheduled_date) || new Date();
    const duration = apt.duration || 30; // Default 30 minutes
    const endTime = new Date(startTime.getTime() + duration * 60000);

    return {
      id: apt.id || Math.random().toString(),
      patientName: apt.patient_name || 'Paciente Sin Nombre',
      patientId: apt.patient_id || '',
      patientPhone: apt.patient_phone,
      patientEmail: apt.patient_email,
      startTime,
      endTime,
      duration,
      type: apt.type || 'consulta',
      status: apt.status || 'pendiente',
      priority: apt.priority || 'normal',
      notes: apt.notes || apt.title,
      doctorName: apt.doctor_name,
      treatmentCode: apt.treatment_code,
      estimatedCost: apt.estimated_cost
    };
  };

  return (
    <div className={`week-view-simple ${className} bg-gray-50 p-3`}>
      {/* Week Header - ESTILO DIARIO MINIMALISTA */}
      <div className="week-header grid grid-cols-8 gap-1 mb-3">
        <div className="time-header p-2 bg-gray-100 border border-gray-300 rounded text-center font-medium text-sm">
          Hora
        </div>
        {weekDays.map(day => (
          <div key={day.toISOString()} className="day-header p-2 bg-white border border-gray-300 rounded text-center">
            <div className="font-medium text-gray-700 text-sm">{format(day, 'EEE', { locale: es })}</div>
            <div className="text-lg font-semibold text-gray-800">{format(day, 'd')}</div>
          </div>
        ))}
      </div>

      {/* Week Grid - SIN CONTAINERS, ESTILO DIARIO COMPACTO */}
      <div className="week-grid space-y-1">
        {workingHours.map(hour => (
          <div key={hour} className="hour-row grid grid-cols-8 gap-1">
            {/* Time column - ESTILO DIARIO */}
            <div className="time-column bg-gray-100 border border-gray-300 rounded flex items-center justify-center py-1">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-700">{hour}</div>
                <div className="text-xs text-gray-500">-{hour + 1}</div>
              </div>
            </div>

            {/* Day columns with 2x2 grid - ESTILO DIARIO COMPACTO */}
            {weekDays.map(day => (
              <div 
                key={`slots-${day.toISOString()}-${hour}`}
                className="day-column border border-gray-300 rounded bg-white"
              >
                <div className="grid grid-cols-2 grid-rows-2 h-20 gap-0">
                  {/* Top-left: 00-15 */}
                  <div 
                    className="time-slot bg-gray-50 border-r border-b border-gray-200 p-1 cursor-pointer hover:bg-blue-50 transition-colors relative overflow-hidden"
                    onClick={() => onTimeSlotClick?.(day, `${hour}:00`)}
                  >
                    {getAppointmentsForDayAndSlot(day, hour, 0).map(apt => (
                      <AppointmentCard 
                        key={apt.id}
                        appointment={convertToAppointmentData(apt)}
                        isCompact={true}
                        showQuickActions={false}
                        className="absolute inset-0 m-0.5 text-xs transform scale-95 z-10"
                      />
                    ))}
                    <div className="slot-indicator text-xs text-gray-400 absolute bottom-0 right-0 p-0.5 z-0">00</div>
                  </div>

                  {/* Top-right: 15-30 */}
                  <div 
                    className="time-slot bg-gray-50 border-b border-gray-200 p-1 cursor-pointer hover:bg-blue-50 transition-colors relative overflow-hidden"
                    onClick={() => onTimeSlotClick?.(day, `${hour}:15`)}
                  >
                    {getAppointmentsForDayAndSlot(day, hour, 15).map(apt => (
                      <AppointmentCard 
                        key={apt.id}
                        appointment={convertToAppointmentData(apt)}
                        isCompact={true}
                        showQuickActions={false}
                        className="absolute inset-0 m-0.5 text-xs transform scale-95 z-10"
                      />
                    ))}
                    <div className="slot-indicator text-xs text-gray-400 absolute bottom-0 right-0 p-0.5 z-0">15</div>
                  </div>

                  {/* Bottom-left: 30-45 */}
                  <div 
                    className="time-slot bg-gray-50 border-r border-gray-200 p-1 cursor-pointer hover:bg-blue-50 transition-colors relative overflow-hidden"
                    onClick={() => onTimeSlotClick?.(day, `${hour}:30`)}
                  >
                    {getAppointmentsForDayAndSlot(day, hour, 30).map(apt => (
                      <AppointmentCard 
                        key={apt.id}
                        appointment={convertToAppointmentData(apt)}
                        isCompact={true}
                        showQuickActions={false}
                        className="absolute inset-0 m-0.5 text-xs transform scale-95 z-10"
                      />
                    ))}
                    <div className="slot-indicator text-xs text-gray-400 absolute bottom-0 right-0 p-0.5 z-0">30</div>
                  </div>

                  {/* Bottom-right: 45-60 */}
                  <div 
                    className="time-slot bg-gray-50 p-1 cursor-pointer hover:bg-blue-50 transition-colors relative overflow-hidden"
                    onClick={() => onTimeSlotClick?.(day, `${hour}:45`)}
                  >
                    {getAppointmentsForDayAndSlot(day, hour, 45).map(apt => (
                      <AppointmentCard 
                        key={apt.id}
                        appointment={convertToAppointmentData(apt)}
                        isCompact={true}
                        showQuickActions={false}
                        className="absolute inset-0 m-0.5 text-xs transform scale-95 z-10"
                      />
                    ))}
                    <div className="slot-indicator text-xs text-gray-400 absolute bottom-0 right-0 p-0.5 z-0">45</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Footer - ESTILO DIARIO MINIMALISTA */}
      <div className="week-footer mt-4 text-center">
        <div className="text-sm text-gray-600">
          📅 Semana del {format(weekStart, 'd MMM', { locale: es })} al {format(addDays(weekStart, 6), 'd MMM yyyy', { locale: es })}
        </div>
      </div>
    </div>
  );
}
