/**
 * 🏴‍☠️ IAnarkalendar v1.0 - PunkClaude & Raul © 2025
 */

import React from 'react';
import { format, setHours, setMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import { parseClinicDateTime } from '../../utils/timezone.ts';
import { AppointmentCard, type AppointmentData } from './AppointmentCard.tsx';

interface DayViewProps {
  currentDate: Date;
  onTimeSlotClick?: (date: Date, time: string) => void;
  onAppointmentClick?: (appointment: any) => void;
  appointments?: any[];
  className?: string;
}

interface TimeSlot {
  hour: number;
  quarter: number; // 0, 15, 30, 45
  time: string;
  dateTime: Date;
}

// 🎯 APPOINTMENT TYPE MAPPING - SYNCHRONIZED WITH WEEKLY VIEW
const mapAppointmentType = (type: string): 'consultation' | 'cleaning' | 'treatment' | 'emergency' => {
  const typeMap: { [key: string]: 'consultation' | 'cleaning' | 'treatment' | 'emergency' } = {
    'consulta': 'consultation',
    'consultation': 'consultation',
    'followup': 'consultation',
    'limpieza': 'cleaning', 
    'cleaning': 'cleaning',
    'tratamiento': 'treatment',
    'treatment': 'treatment',
    'filling': 'treatment',
    'empaste': 'treatment',
    'extraction': 'treatment',
    'extraccion': 'treatment',
    'extracción': 'treatment',
    'corona': 'treatment',
    'crown': 'treatment',
    'implante': 'treatment',     // ⚡ ADDED!
    'implant': 'treatment',      // ⚡ ADDED!
    'endodoncia': 'treatment',
    'root_canal': 'treatment',
    'orthodontics': 'treatment',  // ⚡ ADDED!
    'ortodoncia': 'treatment',
    'surgery': 'treatment',
    'emergencia': 'emergency',
    'emergency': 'emergency',
    'urgente': 'emergency'
  };
  return typeMap[type] || 'consultation';
};

const mapAppointmentStatus = (status: string): 'confirmed' | 'pending' | 'cancelled' | 'completed' => {
  const statusMap: { [key: string]: 'confirmed' | 'pending' | 'cancelled' | 'completed' } = {
    'scheduled': 'pending',
    'confirmed': 'confirmed',
    'in_progress': 'confirmed', 
    'completed': 'completed',
    'cancelled': 'cancelled',
    'no_show': 'cancelled'
  };
  return statusMap[status] || 'pending';
};

export function DayViewSimple({ 
  currentDate, 
  onTimeSlotClick,
  onAppointmentClick,
  appointments = [],
  className = '' 
}: DayViewProps) {

  // 🎯 WORKING HOURS: 7am to 9pm (56 slots of 15min each)
  const startHour = 7;
  const endHour = 21;
  
  // Generate ALL time slots for the day
  const generateAllTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    for (let hour = startHour; hour < endHour; hour++) {
      for (let quarter of [0, 15, 30, 45]) {
        slots.push({
          hour,
          quarter,
          time: `${hour.toString().padStart(2, '0')}:${quarter.toString().padStart(2, '0')}`,
          dateTime: setMinutes(setHours(currentDate, hour), quarter)
        });
      }
    }
    return slots;
  };

  const allTimeSlots = generateAllTimeSlots();

  // 🚨 HYBRID PRIORITY SYSTEM - Manual OVERRIDES Automatic
  const determinePriority = (apt: any): 'normal' | 'high' | 'urgent' => {
    // 🎯 RULE 1: Manual priority ALWAYS wins (if valid)
    if (apt.priority && ['normal', 'high', 'urgent'].includes(apt.priority)) {
      return apt.priority;
    }
    
    // 🤖 RULE 2: Automatic detection as fallback
    const mappedType = mapAppointmentType(apt.appointment_type);
    
    // Auto-detect: Emergency appointments are urgent
    if (mappedType === 'emergency') {
      return 'urgent';
    }
    
    // Auto-detect: Pain/urgency keywords in notes
    if (apt.notes?.toLowerCase().includes('urgente') || apt.notes?.toLowerCase().includes('dolor')) {
      return 'high';
    }
    
    // Default: normal priority
    return 'normal';
  };

  // 🏥 Get appointment for specific time slot
  const getAppointmentForSlot = (hour: number, quarter: number) => {
    return appointments.find(apt => {
      if (!apt?.scheduled_date) return false;
      
      try {
        const aptDate = parseClinicDateTime(apt.scheduled_date);
        if (!aptDate || isNaN(aptDate.getTime())) return false;
        
        const sameDay = format(aptDate, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');
        const sameHour = aptDate.getHours() === hour;
        const sameQuarter = aptDate.getMinutes() === quarter;
        
        return sameDay && sameHour && sameQuarter;
      } catch (error) {
        return false;
      }
    });
  };

  // 🎯 Convert appointment to AppointmentCard format
  const convertToAppointmentData = (apt: any): AppointmentData | null => {
    if (!apt?.scheduled_date) return null;
    
    try {
      const appointmentDate = parseClinicDateTime(apt.scheduled_date);
      if (!appointmentDate || isNaN(appointmentDate.getTime())) return null;

      // ✅ PHONE INTEGRATION: AppointmentCard handles phone display
      return {
        id: apt.id,
        patientName: apt.patient_name || 'Paciente',
        patientId: apt.patient_id || '',
        startTime: appointmentDate,
        endTime: new Date(appointmentDate.getTime() + (apt.duration_minutes || 30) * 60000),
        duration: apt.duration_minutes || 30,
        type: mapAppointmentType(apt.appointment_type),
        status: mapAppointmentStatus(apt.status),
        priority: determinePriority(apt), // 🚨 SMART PRIORITY SYSTEM!
        notes: apt.notes || '',
        phone: apt.patient_phone || '', // 📞 PHONE MAPPING
        doctorName: apt.doctor_name || '',
        treatmentCode: apt.treatment_code || '',
        estimatedCost: apt.estimated_cost || 0
      };
    } catch (error) {
      return null;
    }
  };

  const handleTimeSlotClick = (slot: TimeSlot) => {
    if (onTimeSlotClick) {
      onTimeSlotClick(slot.dateTime, slot.time);
    }
  };

  const handleAppointmentClick = (appointment: any) => {
    if (onAppointmentClick) {
      onAppointmentClick(appointment);
    }
  };

  return (
    <div className={`ainarklendar-day-view ${className}`}>
      {/* Clean Header - No unnecessary text */}
      <div className="day-header mb-4 p-3 bg-gray-100 rounded-lg text-center border">
        <h2 className="text-xl font-bold text-gray-800">
          {format(currentDate, 'EEEE, d MMMM yyyy', { locale: es })}
        </h2>
      </div>

      {/* 🎯 SPECTACULAR FULL-SCREEN GRID - Single Scroll */}
      <div className="day-grid-container">
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 p-2">
          {allTimeSlots.map(slot => {
            const appointment = getAppointmentForSlot(slot.hour, slot.quarter);
            const appointmentData = appointment ? convertToAppointmentData(appointment) : null;
            
            return (
              <div
                key={`${slot.hour}-${slot.quarter}`}
                className={`
                  time-slot border rounded-lg p-2 cursor-pointer transition-all min-h-[120px] flex flex-col
                  ${appointmentData 
                    ? 'bg-white border-gray-300 shadow-sm hover:shadow-md' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-400 hover:shadow-sm'
                  }
                `}
                onClick={() => appointmentData ? handleAppointmentClick(appointment) : handleTimeSlotClick(slot)}
                title={appointmentData 
                  ? `${appointmentData.patientName} - ${slot.time}`
                  : `Crear nueva cita - ${slot.time}`
                }
              >
                {/* Time Label */}
                <div className="text-xs font-medium text-gray-600 mb-2 text-center">
                  {slot.time}
                </div>
                
                {/* Content */}
                {appointmentData ? (
                  <div className="flex-1">
                    <AppointmentCard
                      appointment={appointmentData}
                      onClick={() => handleAppointmentClick(appointment)}
                      isCompact={false}
                      showDuration={true}
                      showNotes={false}
                      className="h-full"
                    />
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center group">
                    <div className="text-gray-300 group-hover:text-gray-500 transition-colors duration-200 flex flex-col items-center">
                      <span className="text-2xl font-light">+</span>
                      <span className="text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Crear cita
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 💡 PONCIO PILATOS TIPS FOOTER */}
      <div className="calendar-footer mt-4 px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
        <div className="flex flex-wrap gap-6 justify-center">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Consultas</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Limpiezas</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-400 rounded"></div>
            <span>Tratamientos</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Emergencias</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-orange-500 font-bold">⚡</span>
            <span>Alta Prioridad</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-red-600 font-bold">🚨</span>
            <span>Urgente</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DayViewSimple;
