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
  
  // DEBUG: Log current week range
  console.log(`📅 CURRENT WEEK RANGE:`, {
    currentDate: format(currentDate, 'yyyy-MM-dd'),
    weekStart: format(weekStart, 'yyyy-MM-dd'),
    weekDays: weekDays.map(d => format(d, 'yyyy-MM-dd'))
  });
  
  // Working hours: 7am to 8pm (from TIME_SLOTS)
  const workingHours = Array.from({ length: 14 }, (_, i) => i + 7);

  // 🎯 SMART APPOINTMENT FILTER - POR HORA COMPLETA (HORA COLAPSADA)
  const getAppointmentsForDayAndHour = (day: Date, hour: number) => {
    return appointments.filter(apt => {
      if (!apt.scheduled_date) return false;
      
      try {
        const aptDate = parseClinicDateTime(apt.scheduled_date);
        if (!aptDate) return false;
        
        const dayFormatted = format(day, 'yyyy-MM-dd');
        const aptFormatted = format(aptDate, 'yyyy-MM-dd');
        const sameDay = aptFormatted === dayFormatted;
        const sameHour = aptDate.getHours() === hour;
        
        // DEBUG: Log filtering process
        if (apt.patient_name && aptDate.getHours() === hour) {
          console.log(`🔍 FILTER DEBUG: ${apt.patient_name}`, {
            aptDate: aptFormatted,
            dayLooking: dayFormatted,
            sameDay,
            hour,
            aptHour: aptDate.getHours(),
            sameHour,
            willShow: sameDay && sameHour
          });
        }
        
        return sameDay && sameHour;
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

    // 🎨 SMART TYPE MAPPING based on appointment data
    let appointmentType: 'consulta' | 'limpieza' | 'tratamiento' | 'emergencia' = 'consulta';
    
    if (apt.type) {
      appointmentType = apt.type;
    } else if (apt.title) {
      const title = apt.title.toLowerCase();
      if (title.includes('limpieza') || title.includes('profilaxis')) {
        appointmentType = 'limpieza';
      } else if (title.includes('tratamiento') || title.includes('endodoncia') || title.includes('implante')) {
        appointmentType = 'tratamiento';
      } else if (title.includes('emergencia') || title.includes('urgencia') || title.includes('dolor')) {
        appointmentType = 'emergencia';
      }
    }

    return {
      id: apt.id || Math.random().toString(),
      patientName: apt.patient_name || 'Paciente Sin Nombre',
      patientId: apt.patient_id || '',
      patientPhone: apt.patient_phone,
      patientEmail: apt.patient_email,
      startTime,
      endTime,
      duration,
      type: appointmentType,
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
        {workingHours.map(hour => {
          // 🎯 CALCULATE MAX HEIGHT FOR ROW ALIGNMENT
          const maxAppointmentsInRow = Math.max(
            ...weekDays.map(day => getAppointmentsForDayAndHour(day, hour).length),
            1
          );
          const rowHeight = maxAppointmentsInRow > 1 ? 70 + (maxAppointmentsInRow - 1) * 12 : 70;
          
          return (
            <div key={hour} className="hour-row grid grid-cols-8 gap-1">
              {/* Time column - ESTILO DIARIO */}
              <div 
                className="time-column bg-gray-100 border border-gray-300 rounded flex items-center justify-center py-1"
                style={{ height: `${rowHeight}px` }}
              >
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-700">{hour}</div>
                  <div className="text-xs text-gray-500">-{hour + 1}</div>
                </div>
              </div>

              {/* Day columns - HORA COLAPSADA INTELIGENTE */}
              {weekDays.map(day => {
                const hourAppointments = getAppointmentsForDayAndHour(day, hour);
                
                // DEBUG: Log appointments array before mapping with RAW dates
                if (hourAppointments.length > 0) {
                  console.log(`Hour ${hour}:00 - Found ${hourAppointments.length} appointments:`, 
                    hourAppointments.map(apt => `${apt.patient_name} (${apt.scheduled_date})`));
                }
                
                return (
                  <div 
                    key={`hour-${day.toISOString()}-${hour}`}
                    className="day-column border border-gray-300 rounded bg-white hover:bg-blue-50 transition-all duration-200 cursor-pointer relative overflow-hidden"
                    style={{ 
                      height: `${rowHeight}px`,
                      paddingBottom: hourAppointments.length > 1 ? '8px' : '0px' // CONDITIONAL: Only add padding for multiple appointments
                    }}
                    onClick={() => onTimeSlotClick?.(day, `${hour}:00`)}
                  >
                    {/* APPOINTMENTS OVERLAP STACK - FICHERO STYLE */}
                    <div className="appointments-overlap-stack relative h-full p-1">
                      {hourAppointments.length === 0 && (
                        <div className="text-xs text-gray-400 text-center py-4">
                          {hour}:00 - {hour + 1}:00
                        </div>
                      )}
                      
                      {hourAppointments.map((apt, index) => {
                        const isFirst = index === 0; // First card is fully visible at bottom
                        const baseZIndex = 100; // HIGHER BASE for better visibility
                        const zIndex = baseZIndex - index; // FORCE REFRESH: First card (index 0) has highest z-index
                        const bottomOffset = 4 + (index * 36); // INCREASED SPACING: Start 4px from bottom, then stack upwards with more space
                        
                        // DEBUG: Log z-index values and positioning
                        console.log(`🎯 Appointment ${apt.patient_name}:`, {
                          index,
                          zIndex,
                          bottomOffset: `${bottomOffset}px`,
                          height: isFirst ? `${rowHeight - 20}px` : '28px',
                          isFirst,
                          appointmentType: apt.appointment_type
                        });
                        
                        return (
                          <div
                            key={`${apt.id}-${hour}-${index}`} // UNIQUE KEY: Include hour to prevent conflicts
                            className="absolute left-1 right-1 transition-all duration-200 hover:z-50"
                            style={{ 
                              bottom: `${bottomOffset}px`,
                              zIndex: zIndex,
                              height: isFirst ? `${rowHeight - 30}px` : '32px', // Better heights: first card gets space, tabs are visible
                            }}
                          >
                            {/* FICHERO-STYLE APPOINTMENT CARD - Simplified but Beautiful */}
                            <div className={`
                              w-full h-full rounded-md border-l-4 p-2 shadow-sm transition-all duration-200 relative
                              ${apt.appointment_type === 'consulta' ? 'bg-green-50 border-green-400 text-green-800' : ''}
                              ${apt.appointment_type === 'limpieza' ? 'bg-blue-50 border-blue-400 text-blue-800' : ''}
                              ${apt.appointment_type === 'tratamiento' ? 'bg-orange-50 border-orange-400 text-orange-800' : ''}
                              ${apt.appointment_type === 'emergencia' ? 'bg-red-50 border-red-400 text-red-800' : ''}
                              hover:shadow-md hover:scale-105 cursor-pointer
                              ${!isFirst ? 'border-2 border-b-0 rounded-b-none shadow-md' : 'shadow-sm'} 
                            `}>
                              
                              {/* CONTENIDO PARA TARJETAS APILADAS */}
                              {!isFirst && (
                                <div className="flex items-center space-x-2 h-full">
                                  <div className={`
                                    w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0
                                    ${apt.appointment_type === 'consulta' ? 'bg-green-500' : ''}
                                    ${apt.appointment_type === 'limpieza' ? 'bg-blue-500' : ''}
                                    ${apt.appointment_type === 'tratamiento' ? 'bg-orange-500' : ''}
                                    ${apt.appointment_type === 'emergencia' ? 'bg-red-500' : ''}
                                  `}>
                                    {apt.patient_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                  </div>
                                  <div className="flex-1 min-w-0 flex items-center justify-between">
                                    <span className="font-semibold text-xs truncate">{apt.patient_name}</span>
                                    <span className="text-xs opacity-75 ml-2 flex-shrink-0">{new Date(apt.scheduled_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                </div>
                              )}

                              {/* CONTENIDO PRINCIPAL - Solo visible en la primera tarjeta */}
                              {isFirst && (
                                <>
                                  {/* Patient Avatar & Name */}
                                  <div className="flex items-center space-x-2 mb-1">
                                    <div className={`
                                      w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white
                                      ${apt.appointment_type === 'consulta' ? 'bg-green-500' : ''}
                                      ${apt.appointment_type === 'limpieza' ? 'bg-blue-500' : ''}
                                      ${apt.appointment_type === 'tratamiento' ? 'bg-orange-500' : ''}
                                      ${apt.appointment_type === 'emergencia' ? 'bg-red-500' : ''}
                                    `}>
                                      {apt.patient_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-semibold text-xs truncate">{apt.patient_name}</div>
                                    </div>
                                  </div>
                                  
                                  {/* Appointment Details */}
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-medium capitalize">{apt.appointment_type}</span>
                                    <span className="text-gray-500">{new Date(apt.scheduled_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Multiple appointments count */}
                      {hourAppointments.length > 1 && (
                        <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full font-medium z-50">
                          {hourAppointments.length}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
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
