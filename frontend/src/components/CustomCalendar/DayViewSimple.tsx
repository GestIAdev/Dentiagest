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
    setDraggedAppointment(appointment);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setDraggedAppointment(null);
    setIsDragging(false);
  };

  const handleDropOnSlot = async (hour: number, quarter: number) => {
    if (!draggedAppointment) return;
    
    // console.log('🎯 Drop on slot:', hour, quarter, draggedAppointment);
    
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
      
      // console.log('🎯 Moving appointment within same day from', originalDate.toISOString(), 'to', targetDate.toISOString());
      
      // Call the API to update appointment time
      const result = await updateAppointmentTime(
        draggedAppointment.id,
        targetDate,
        hour,
        quarter
      );
      
      if (result.success) {
        // console.log('🎉 DRAG & DROP SUCCESS! Appointment updated in database');
        
        // Show success feedback
        // alert(`✅ Cita movida exitosamente a las ${hour.toString().padStart(2, '0')}:${quarter.toString().padStart(2, '0')}`);
        // console.log(`✅ Cita movida exitosamente a las ${hour.toString().padStart(2, '0')}:${quarter.toString().padStart(2, '0')}`);
        
        // 🔥 REFRESH APPOINTMENTS DATA TO SHOW VISUAL UPDATE
        if (onAppointmentUpdate) {
          // console.log('🔄 Refreshing appointments data...');
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
    // console.log('🔍 Raw appointment data:', appointment);
    // console.log('🔍 Available fields:', Object.keys(appointment));
    
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
      
      // console.log('🎯 Mapped data:', { 
      //   patientName, 
      //   appointmentType, 
      //   phone: appointment.patient_phone,
      //   originalType: appointment.appointment_type,
      //   originalName: appointment.patient_name 
      // });
      
      const mappedType = mapAppointmentType(appointmentType);
      const originalPriority = getAppointmentPriority(appointment); // 'low' | 'normal' | 'high' | 'urgent'
      
      // 🚨 CORRECTED PRIORITY MAPPING (No more everything red!): 
      // - urgent → urgent (🚨 alarma + color rojo)
      // - high → high (⚡ rayo + color por tipo)  
      // - normal/low → normal (sin icono, color según tipo)
      const mappedPriority = originalPriority === 'urgent' ? 'urgent' :
                            originalPriority === 'high' ? 'high' : 'normal';
      
      // console.log('🎨 Color mapping:', { 
      //   originalType: appointmentType, 
      //   mappedType, 
      //   originalPriority,
      //   mappedPriority,
      //   isUrgent: mappedPriority === 'urgent'
      // });
      
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
    <div className={`day-view ${className}`} style={{ 
      backgroundColor: '#f8fafc', // 🎨 Actually gray this time!
      minHeight: '100vh'
    }}>
      {/* ✨ ELEGANT HEADER with subtle gradient */}
      <div className="day-header mb-4 p-4 rounded-xl text-center border shadow-sm" style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        borderColor: '#e2e8f0'
      }}>
        <h2 className="text-xl font-bold text-gray-800 mb-1">
          {format(currentDate, 'EEEE, d MMMM yyyy', { locale: es })}
        </h2>
        <div className="text-gray-600 text-sm">
          ✨ {allTimeSlots.filter(slot => getAppointmentsForSlot(slot.hour, slot.quarter).length > 0).length} slots con citas
        </div>
      </div>

      {/* 🎯 SPECTACULAR FULL-SCREEN GRID with enhanced styling */}
      <div className="day-grid-container" style={{ 
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0',
        overflow: 'visible' // 🚀 CRITICAL: Stack animations NEED this!
      }}>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 p-2" style={{ 
          overflow: 'visible' // 🚀 DOUBLE CRITICAL: Stack needs grid overflow too!
        }}>
          {allTimeSlots.map(slot => {
            const slotAppointments = getAppointmentsForSlot(slot.hour, slot.quarter);
            const hasAppointments = slotAppointments.length > 0;
            
            // 🚫 CHECK IF SLOT IS IN THE PAST (Day View validation)
            const slotDateTime = new Date(currentDate);
            slotDateTime.setHours(slot.hour, slot.quarter, 0, 0);
            const now = new Date();
            const isPastSlot = slotDateTime < now;
            
            return (
              <div
                key={`${slot.hour}-${slot.quarter}`}
                className={`
                  time-slot border-2 rounded-xl p-3 transition-all flex flex-col relative group/stack
                  ${hasAppointments 
                    ? 'bg-gradient-to-br from-white to-gray-50/30 border-gray-300 shadow-md hover:shadow-lg transform hover:scale-[1.02]' 
                    : isPastSlot
                      ? 'border-gray-300 opacity-85'
                      : 'bg-gradient-to-br from-gray-50/50 to-white border-gray-200/60 hover:bg-gradient-to-br hover:from-gray-100 hover:to-white hover:border-gray-400 hover:shadow-md transform hover:scale-[1.01]'
                  }
                  ${isDragging && !hasAppointments && !isPastSlot ? 'border-dashed border-2 border-blue-400 bg-blue-50' : ''}
                  ${isUpdating ? 'opacity-50 pointer-events-none' : ''}
                `}
                style={{ 
                  overflow: 'visible', // 🚀 CRITICAL: Stack animations need this!
                  zIndex: hasAppointments && slotAppointments.length > 1 ? 100 : 1, // 🚀 EVEN HIGHER for multi-appointment slots
                  position: 'relative', // 🚀 Ensure proper stacking context
                  // 🎯 DYNAMIC HEIGHT: More space for stacks, normal for singles
                  minHeight: slotAppointments.length > 1 ? '180px' : '120px',
                  cursor: isPastSlot ? 'not-allowed' : 'pointer',
                  // 🌸 SUPER soft pink background for past slots (matching MonthView)
                  background: isPastSlot 
                    ? 'linear-gradient(135deg, #fefbfb 0%, #fef2f2 100%)' 
                    : undefined
                }}
                onClick={() => !hasAppointments && !isPastSlot && handleTimeSlotClick(slot)}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (isDragging && !isPastSlot) {
                    // 🎯 ALLOW DROPS ON ALL SLOTS (empty OR occupied for stacking) - BUT NOT PAST SLOTS
                    if (hasAppointments) {
                      e.currentTarget.classList.add('bg-green-100', 'border-green-500'); // Green for stacking
                    } else {
                      e.currentTarget.classList.add('bg-blue-100', 'border-blue-500'); // Blue for empty
                    }
                  } else if (isDragging && isPastSlot) {
                    // 🚫 Visual feedback for invalid drop on past slot
                    e.currentTarget.classList.add('bg-red-200', 'border-red-600');
                  }
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove('bg-blue-100', 'border-blue-500', 'bg-green-100', 'border-green-500', 'bg-red-200', 'border-red-600');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('bg-blue-100', 'border-blue-500', 'bg-green-100', 'border-green-500', 'bg-red-200', 'border-red-600');
                  
                  // 🚫 PREVENT DROP ON PAST SLOTS - No annoying alerts!
                  if (isPastSlot) {
                    return; // Silently reject drop
                  }
                  
                  // 🚀 ALLOW DROPS ON ANY FUTURE SLOT - Create stacks automatically!
                  handleDropOnSlot(slot.hour, slot.quarter);
                }}
                title={isPastSlot 
                  ? `Slot pasado - ${slot.time} (no disponible)`
                  : hasAppointments 
                    ? `${slotAppointments.length} cita(s) - ${slot.time}`
                    : `Crear nueva cita - ${slot.time}`
                }
              >
                {/* ✨ ELEGANT Time Label - Gray Theme */}
                <div className="text-xs font-bold mb-2 text-center px-2 py-1 rounded-lg" style={{
                  background: hasAppointments 
                    ? 'linear-gradient(45deg, #6b7280, #4b5563)' // gray-500 to gray-600
                    : 'linear-gradient(45deg, #d1d5db, #9ca3af)', // gray-300 to gray-400
                  color: 'white',
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                }}>
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
                    <div 
                      className="flex-1 relative group/stack"
                      onMouseEnter={() => {
                        // 🚀 MANUAL HOVER REVEAL - 100% reliable (copied from WeekView)
                        // console.log(`🔍 Hover enter: Looking for cards with ID "stack-${slot.hour}-${slot.quarter}"`);
                        const cards = document.querySelectorAll(`[data-stack-id="stack-${slot.hour}-${slot.quarter}"]`);
                        // console.log(`🔍 Found ${cards.length} cards for hover reveal`);
                        cards.forEach((card, index) => {
                          const yOffset = index === 0 ? 0 : index === 1 ? 20 : index === 2 ? 40 : index === 3 ? 64 : index === 4 ? 80 : 96;
                          (card as HTMLElement).style.transform = `translateY(${yOffset}px)`;
                          // console.log(`🔍 Card ${index}: transform to ${yOffset}px`);
                        });
                      }}
                      onMouseLeave={() => {
                        // Return to compact state
                        // console.log(`🔍 Hover leave: Returning cards to compact state`);
                        const cards = document.querySelectorAll(`[data-stack-id="stack-${slot.hour}-${slot.quarter}"]`);
                        cards.forEach((card, index) => {
                          (card as HTMLElement).style.transform = `translateY(${index * 4}px)`;
                        });
                      }}
                    >
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
                            data-stack-id={`stack-${slot.hour}-${slot.quarter}`}
                            data-stack-card // 🚀 MARKER for debugging
                            className="absolute inset-0 cursor-pointer transform transition-all duration-300 opacity-80 hover:opacity-100 hover:scale-105"
                            style={{
                              zIndex: 60 + index, // WEEKLY VIEW PATTERN: Higher than container
                              transform: `translateY(${index * 4}px)`, // COMPACT STATE: 4px stagger
                              right: `${Math.max(0, baseLeft - 2)}px`,
                              overflow: 'visible' // WEEKLY VIEW EXACT COPY
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
                              className="h-full shadow-md hover:shadow-xl hover:scale-105"
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

      {/* ✨ ELEGANT STATS FOOTER */}
      <div className="calendar-footer mt-6 px-6 py-4 rounded-xl shadow-lg border" style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        borderColor: '#e2e8f0'
      }}>
        {/* 🔄 LOADING INDICATOR */}
        {isUpdating && (
          <div className="flex items-center justify-center mb-3 text-gray-700 font-medium">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
            <span>✨ Actualizando cita en la base de datos...</span>
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
