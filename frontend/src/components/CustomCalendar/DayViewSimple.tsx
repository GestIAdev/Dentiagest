/**
 * 🏴‍☠️ IAnarkalendar © GestIA Dev + PunkClaude 2025
 * 🎯 DayViewSimple FIXED VERSION with DRAG & DROP
 */

import React, { useState } from 'react';
import { format, setHours, setMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import { parseClinicDateTime } from '../../utils/timezone.ts';
import { AppointmentCard, type AppointmentData } from './AppointmentCard.tsx';
import { updateAppointmentTime } from '../../utils/appointmentService.ts';

interface DayViewProps {
  currentDate: Date;
  onTimeSlotClick?: (date: Date, time: string) => void;
  onAppointmentClick?: (appointment: any) => void;
  onAppointmentUpdate?: () => void; // 🔄 NEW: Callback to refresh data
  appointments?: any[];
  className?: string;
}

interface TimeSlot {
  hour: number;
  quarter: number; // 0, 15, 30, 45
  time: string;
}

// 🎯 APPOINTMENT TYPE MAPPING - SIMPLIFIED (NO EMERGENCY TYPE)
const mapAppointmentType = (type: string): 'consultation' | 'cleaning' | 'treatment' => {
  const typeMap: { [key: string]: 'consultation' | 'cleaning' | 'treatment' } = {
    'consulta': 'consultation',
    'consultation': 'consultation',
    'followup': 'consultation',
    'follow_up': 'consultation',
    'checkup': 'consultation',
    'revision': 'consultation',
    
    'limpieza': 'cleaning', 
    'cleaning': 'cleaning',
    'hygiene': 'cleaning',
    'prophylaxis': 'cleaning',
    
    'tratamiento': 'treatment',
    'treatment': 'treatment',
    'filling': 'treatment',
    'empaste': 'treatment',
    'extraction': 'treatment',
    'extraccion': 'treatment',
    'root_canal': 'treatment',  
    'endodoncia': 'treatment',
    'crown': 'treatment',
    'corona': 'treatment',
    'implant': 'treatment',
    'implante': 'treatment',
    'surgery': 'treatment',
    'cirugia': 'treatment',
    
    // 🚫 REMOVED: emergency/emergencia - use priority:urgent instead!
    // Any type can be urgent via priority, no need for emergency type
  };
  
  return typeMap[type?.toLowerCase()] || 'consultation';
};

export function DayViewSimple({ 
  currentDate, 
  onTimeSlotClick,
  onAppointmentClick,
  onAppointmentUpdate,  // 🔥 NEW: Callback to refresh appointments
  appointments = [],
  className = '' 
}: DayViewProps) {

  // 🎯 DRAG & DROP STATE
  const [draggedAppointment, setDraggedAppointment] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);  // 🔥 NEW: Loading state for API calls

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
          time: `${hour.toString().padStart(2, '0')}:${quarter.toString().padStart(2, '0')}`
        });
      }
    }
    return slots;
  };

  const allTimeSlots = generateAllTimeSlots();

  // Helper to handle time slot clicks
  const handleTimeSlotClick = (slot: TimeSlot) => {
    if (onTimeSlotClick) {
      const slotDate = setMinutes(setHours(currentDate, slot.hour), slot.quarter);
      onTimeSlotClick(slotDate, slot.time);
    }
  };

  // Helper to handle appointment clicks
  const handleAppointmentClick = (appointment: any) => {
    if (onAppointmentClick) {
      onAppointmentClick(appointment);
    }
  };

  // 🎯 APPOINTMENT PRIORITY DETECTION
  const getAppointmentPriority = (appointment: any): 'low' | 'normal' | 'high' | 'urgent' => {
    // First, check if priority is already set in the appointment
    if (appointment.priority) {
      return appointment.priority;
    }
    
    // Fallback: Check type and notes for auto-detection
    const appointmentType = (appointment.appointment_type || appointment.type || '').toLowerCase();
    
    // Emergency detection → urgent
    if (appointmentType.includes('emergency') || 
        appointmentType.includes('emergencia')) {
      return 'urgent';
    }
    
    // Pain or urgent notes → high
    if (appointment.notes?.toLowerCase().includes('urgente') || 
        appointment.notes?.toLowerCase().includes('dolor')) {
      return 'high';
    }
    
    // Default: normal priority
    return 'normal';
  };

  // 🎯 DRAG & DROP HANDLERS
  const handleDragStart = (appointment: any) => {
    console.log('🎯 Drag started:', appointment);
    setDraggedAppointment(appointment);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    console.log('🎯 Drag ended');
    setDraggedAppointment(null);
    setIsDragging(false);
  };

  const handleDropOnSlot = async (hour: number, quarter: number) => {
    if (!draggedAppointment) return;
    
    console.log('🎯 Drop on slot:', hour, quarter, draggedAppointment);
    
    // 🚫 VALIDATION: No moving appointments to past time
    // Only validate if we're moving within today
    const targetDateTime = new Date(currentDate);
    targetDateTime.setHours(hour, quarter, 0, 0);
    
    const now = new Date();
    const isToday = currentDate.toDateString() === now.toDateString();
    
    if (isToday && targetDateTime < now) {
      console.error('⏰ Cannot move appointment to past time');
      alert('❌ No puedes mover una cita a una hora que ya pasó');
      handleDragEnd();
      return;
    }
    
    try {
      // Set loading state
      setIsUpdating(true);
      
      // Parse the original appointment date
      const originalDate = parseClinicDateTime(draggedAppointment.scheduled_date);
      if (!originalDate) {
        throw new Error('Invalid appointment date format');
      }
      
      // 🗓️ VISTA DIARIA: Solo cambiar HORA dentro del MISMO día
      // Para cambios de día, usar vista semanal o editor
      const targetDate = new Date(originalDate); // Keep original date
      targetDate.setHours(hour, quarter, 0, 0); // Only change time
      
      console.log('🎯 Moving appointment within same day from', originalDate.toISOString(), 'to', targetDate.toISOString());
      
      // Call the API to update appointment time
      const result = await updateAppointmentTime(
        draggedAppointment.id,
        targetDate,
        hour,
        quarter
      );
      
      if (result.success) {
        console.log('🎉 DRAG & DROP SUCCESS! Appointment updated in database');
        
        // Show success feedback
        // alert(`✅ Cita movida exitosamente a las ${hour.toString().padStart(2, '0')}:${quarter.toString().padStart(2, '0')}`);
        console.log(`✅ Cita movida exitosamente a las ${hour.toString().padStart(2, '0')}:${quarter.toString().padStart(2, '0')}`);
        
        // 🔥 REFRESH APPOINTMENTS DATA TO SHOW VISUAL UPDATE
        if (onAppointmentUpdate) {
          console.log('� Refreshing appointments data...');
          onAppointmentUpdate();
        }
        
      } else {
        console.error('💥 DRAG & DROP FAILED:', result.error);
        // alert(`❌ Error moviendo la cita: ${result.error}`);
        console.error(`❌ Error moviendo la cita: ${result.error}`);
      }
      
    } catch (error: any) {
      console.error('❌ Error in handleDropOnSlot:', error);
      // alert(`❌ Error inesperado: ${error.message}`);
      console.error(`❌ Error inesperado: ${error.message}`);
    } finally {
      // Always reset states
      setIsUpdating(false);
      handleDragEnd();
    }
  };

  // 🏥 Get appointment for specific time slot
  const getAppointmentsForSlot = (hour: number, quarter: number) => {
    return appointments.filter(apt => {
      if (!apt?.scheduled_date) return false;
      
      try {
        const aptDate = parseClinicDateTime(apt.scheduled_date);
        if (!aptDate || isNaN(aptDate.getTime())) return false;
        
        // 🗓️ FIRST: Check if appointment is on the current day being displayed
        const isSameDay = aptDate.toDateString() === currentDate.toDateString();
        if (!isSameDay) return false; // Not the same day - exclude
        
        // 🕒 SECOND: Check if appointment falls in this specific 15-minute slot
        const aptHour = aptDate.getHours();
        const aptMinute = aptDate.getMinutes();
        
        // Determine which quarter this minute falls into
        const aptQuarter = Math.floor(aptMinute / 15) * 15;
        
        return aptHour === hour && aptQuarter === quarter;
      } catch (error) {
        console.error('Error parsing appointment date:', error);
        return false;
      }
    });
  };

  // 🎯 Convert appointment to AppointmentCard format
  const convertToAppointmentData = (appointment: any): AppointmentData | null => {
    if (!appointment) return null;
    
    // 🔍 DEBUG: Let's see what data structure we're getting
    console.log('🔍 Raw appointment data:', appointment);
    console.log('🔍 Available fields:', Object.keys(appointment));
    
    try {
      const aptDate = parseClinicDateTime(appointment.scheduled_date);
      const startTime = aptDate || new Date();
      const duration = appointment.duration_minutes || 30;
      const endTime = new Date(startTime.getTime() + duration * 60000);
      
      // 🎯 FLEXIBLE PATIENT NAME MAPPING - Try different field combinations
      const patientName = appointment.patient_name ||  // 🔥 USE patient_name first! 
                         (appointment.patient_first_name && appointment.patient_last_name 
                           ? `${appointment.patient_first_name} ${appointment.patient_last_name}`.trim()
                           : null) ||
                         appointment.title || 
                         appointment.name ||
                         'Paciente';
      
      // 🏥 FLEXIBLE APPOINTMENT TYPE MAPPING
      const appointmentType = appointment.appointment_type || 
                             appointment.type || 
                             appointment.service_type ||
                             appointment.category ||
                             'consultation';
      
      console.log('🎯 Mapped data:', { 
        patientName, 
        appointmentType, 
        phone: appointment.patient_phone,
        originalType: appointment.appointment_type,
        originalName: appointment.patient_name 
      });
      
      const mappedType = mapAppointmentType(appointmentType);
      const originalPriority = getAppointmentPriority(appointment); // 'low' | 'normal' | 'high' | 'urgent'
      
      // 🚨 CORRECTED PRIORITY MAPPING (No more everything red!): 
      // - urgent → urgent (🚨 alarma + color rojo)
      // - high → high (⚡ rayo + color por tipo)  
      // - normal/low → normal (sin icono, color según tipo)
      const mappedPriority = originalPriority === 'urgent' ? 'urgent' :
                            originalPriority === 'high' ? 'high' : 'normal';
      
      console.log('🎨 Color mapping:', { 
        originalType: appointmentType, 
        mappedType, 
        originalPriority,
        mappedPriority,
        isUrgent: mappedPriority === 'urgent'
      });
      
      return {
        id: appointment.id || '',
        patientName,
        patientId: appointment.patient_id || '',
        patientPhone: appointment.patient_phone || '',
        startTime,
        endTime,
        duration,
        type: mappedType,
        status: (appointment.status === 'scheduled' ? 'pending' : appointment.status || 'pending') as 'pending' | 'confirmed' | 'completed' | 'cancelled',
        priority: mappedPriority,
        notes: appointment.notes || '',
        phone: appointment.patient_phone || '' // ✅ PHONE PASSED TO CARD
      };
    } catch (error) {
      console.error('Error converting appointment:', error);
      return null;
    }
  };

  return (
    <div className={`day-view ${className}`}>
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
            const slotAppointments = getAppointmentsForSlot(slot.hour, slot.quarter);
            const hasAppointments = slotAppointments.length > 0;
            
            return (
              <div
                key={`${slot.hour}-${slot.quarter}`}
                className={`
                  time-slot border rounded-lg p-2 cursor-pointer transition-all min-h-[120px] flex flex-col relative group/stack
                  ${hasAppointments 
                    ? 'bg-white border-gray-300 shadow-sm hover:shadow-md' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-400 hover:shadow-sm'
                  }
                  ${isDragging && !hasAppointments ? 'border-dashed border-2 border-blue-400 bg-blue-50' : ''}
                  ${isUpdating ? 'opacity-50 pointer-events-none' : ''}
                `}
                onClick={() => !hasAppointments && handleTimeSlotClick(slot)}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (isDragging && !hasAppointments) {
                    e.currentTarget.classList.add('bg-blue-100', 'border-blue-500');
                  }
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove('bg-blue-100', 'border-blue-500');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('bg-blue-100', 'border-blue-500');
                  if (!hasAppointments) {
                    handleDropOnSlot(slot.hour, slot.quarter);
                  }
                }}
                title={hasAppointments 
                  ? `${slotAppointments.length} cita(s) - ${slot.time}`
                  : `Crear nueva cita - ${slot.time}`
                }
              >
                {/* Time Label */}
                <div className="text-xs font-medium text-gray-600 mb-2 text-center">
                  {slot.time}
                </div>
                
                {/* Content */}
                {hasAppointments ? (
                  slotAppointments.length === 1 ? (
                    // Single appointment - original behavior
                    <div className="flex-1">
                      <AppointmentCard
                        appointment={convertToAppointmentData(slotAppointments[0])!}
                        onClick={() => handleAppointmentClick(slotAppointments[0])}
                        isCompact={false}
                        showDuration={true}
                        showNotes={false}
                        className="h-full"
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                      />
                    </div>
                  ) : (
                    // Multiple appointments - hover reveal like WeekViewSimple
                    <div className="flex-1 relative group/stack">
                      <div className="text-center text-sm font-medium text-gray-700 mb-1">
                        {slotAppointments.length} citas
                      </div>
                      
                      {/* Hover reveal cards */}
                      {slotAppointments.map((apt, index) => {
                        const appointmentData = convertToAppointmentData(apt);
                        if (!appointmentData) return null;
                        
                        // Calculate staggered position
                        const baseLeft = index * 8; // 8px stagger
                        
                        return (
                          <div
                            key={`${apt.id}-${index}`}
                            data-stack-id={`stack-${slot.hour}-${slot.quarter}-${index}`}
                            className="absolute inset-0 cursor-pointer transform transition-all duration-300 opacity-80 hover:opacity-100 hover:scale-105 group-hover/stack:opacity-100"
                            style={{
                              zIndex: 10 + index,
                              transform: `translateY(${index * 4}px)`,
                              right: `${Math.max(0, baseLeft - 2)}px`,
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAppointmentClick(apt);
                            }}
                          >
                            <AppointmentCard
                              appointment={appointmentData}
                              onClick={() => handleAppointmentClick(apt)}
                              isCompact={true}
                              showDuration={false}
                              showNotes={false}
                              className="h-full shadow-md group-hover/stack:shadow-lg group-hover/stack:scale-100 group-hover/stack:opacity-100 hover:shadow-xl hover:scale-105"
                              onDragStart={handleDragStart}
                              onDragEnd={handleDragEnd}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs mt-1">
                        {isDragging ? 'Soltar aquí' : 'Crear cita'}
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
        {/* 🔄 LOADING INDICATOR */}
        {isUpdating && (
          <div className="flex items-center justify-center mb-2 text-blue-600 font-medium">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span>Actualizando cita en la base de datos...</span>
          </div>
        )}
        
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
            <span>Urgencias</span>
          </div>
          <div className="flex items-center gap-1 ml-4 border-l pl-4">
            <span>⚡ Alta prioridad</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🚨 Urgencia crítica</span>
          </div>
          <div className="flex items-center gap-1 ml-4 border-l pl-4">
            <span>{isUpdating ? '⏳ Actualizando...' : '🎯 Arrastra para reprogramar'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
