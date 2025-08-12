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
    
    // 🎯 RESET: Clear any residual transformations from DOM elements
    // This ensures cards return to normal size when moved to individual slots
    setTimeout(() => {
      const allCards = document.querySelectorAll('[data-stack-card]');
      allCards.forEach((card) => {
        const htmlCard = card as HTMLElement;
        htmlCard.style.transform = '';
        htmlCard.style.scale = '';
        htmlCard.style.opacity = '';
        htmlCard.style.zIndex = '';
      });
    }, 100); // Small delay to allow drop animation to complete
  };

  const handleDropOnSlot = async (hour: number, quarter: number) => {
    if (!draggedAppointment) return;
    
    console.log('🎯 Drop on slot:', hour, quarter, draggedAppointment);
    
    // 🚫 NO MORE ANNOYING ALERTS! UI prevents past drops already
    
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
            
            // 🚫 CHECK IF SLOT IS IN THE PAST
            const slotDateTime = new Date(currentDate);
            slotDateTime.setHours(slot.hour, slot.quarter, 0, 0);
            const now = new Date();
            const isToday = currentDate.toDateString() === now.toDateString();
            const isPastSlot = isToday && slotDateTime < now;
            
            return (
              <div
                key={`${slot.hour}-${slot.quarter}`}
                className={`
                  time-slot border rounded-lg p-2 cursor-pointer transition-all min-h-[120px] flex flex-col relative group/stack
                  ${hasAppointments 
                    ? 'bg-white border-gray-300 shadow-sm hover:shadow-md' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-400 hover:shadow-sm'
                  }
                  ${isDragging && !hasAppointments && !isPastSlot ? 'border-dashed border-2 border-blue-400 bg-blue-50' : ''}
                  ${isDragging && isPastSlot ? 'border-dashed border-2 border-red-400 bg-red-50 cursor-not-allowed' : ''}
                  ${isUpdating ? 'opacity-50 pointer-events-none' : ''}
                  ${slotAppointments.length > 1 ? 'min-h-[180px]' : ''}
                  ${isPastSlot ? 'opacity-60' : ''}
                `}
                style={{
                  overflow: 'visible', // 🔑 WEEKLY VIEW SECRET SAUCE!
                  zIndex: slotAppointments.length > 1 ? 40 : 1 // Higher z-index for multi-appointment slots
                }}
                onClick={() => !hasAppointments && !isPastSlot && handleTimeSlotClick(slot)}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (isDragging && !hasAppointments && !isPastSlot) {
                    // 🎨 SUBLIME DROP ZONE ANIMATION (only for valid slots)
                    e.currentTarget.style.transition = 'all 0.15s ease-out';
                    e.currentTarget.classList.add('bg-blue-50', 'border-blue-300');
                    e.currentTarget.style.transform = 'scale(1.01)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.2)';
                  } else if (isDragging && isPastSlot) {
                    // 🚫 PROHIBITED ZONE ANIMATION
                    e.currentTarget.style.transition = 'all 0.15s ease-out';
                    e.currentTarget.classList.add('bg-red-100', 'border-red-400');
                    e.currentTarget.style.cursor = 'not-allowed';
                  }
                }}
                onDragLeave={(e) => {
                  // 🎨 SMOOTH RESET (both valid and invalid slots)
                  e.currentTarget.style.transition = 'all 0.15s ease-out';
                  e.currentTarget.classList.remove('bg-blue-50', 'border-blue-300', 'bg-red-100', 'border-red-400');
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '';
                  e.currentTarget.style.cursor = '';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  
                  // 🚫 PREVENT DROP ON PAST SLOTS - No annoying alerts!
                  if (isPastSlot) {
                    console.log('🚫 Prevented drop on past slot - UX preserved');
                    return;
                  }
                  
                  // 🎬 ENHANCED SUCCESS ANIMATION (only for valid drops)
                  const target = e.currentTarget;
                  target.style.transition = 'all 0.2s ease-out';
                  target.classList.remove('bg-blue-50', 'border-blue-300');
                  target.style.transform = '';
                  target.style.boxShadow = '';
                  
                  // More visible success flash
                  target.style.backgroundColor = '#dcfce7'; // green-100
                  target.style.borderColor = '#16a34a'; // green-600
                  setTimeout(() => {
                    if (target && target.style) {
                      target.style.backgroundColor = '';
                      target.style.borderColor = '';
                    }
                  }, 400);
                  
                  if (!hasAppointments) {
                    handleDropOnSlot(slot.hour, slot.quarter);
                  } else {
                    // 🎪 ALLOW STACKING: Multiple appointments on same hour
                    console.log('🎯 Stacking appointment on occupied slot with', slotAppointments.length, 'existing appointments');
                    handleDropOnSlot(slot.hour, slot.quarter);
                  }
                }}
                title={hasAppointments 
                  ? `${slotAppointments.length} cita(s) - ${slot.time}`
                  : isPastSlot 
                    ? `Hora pasada - ${slot.time}` 
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
                    // Single appointment - original behavior with RESET STYLING
                    <div 
                      className="flex-1"
                      style={{
                        transform: 'none', // 🎯 RESET: Clear any residual transformations
                        scale: '1', // 🎯 RESET: Ensure normal scale
                        transition: 'all 0.3s ease-out' // Smooth transition to normal state
                      }}
                    >
                      <AppointmentCard
                        appointment={convertToAppointmentData(slotAppointments[0])!}
                        onClick={() => handleAppointmentClick(slotAppointments[0])}
                        isCompact={false}
                        showDuration={true}
                        showNotes={false}
                        className="h-full transform-none scale-100" // 🎯 RESET: Utility classes for normal state
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                      />
                    </div>
                  ) : (
                    // 🎨 MULTIPLE APPOINTMENTS - WEEKLY VIEW ELEGANT PATTERN COPIED! 
                    <div 
                      className="absolute inset-0"
                      style={{ 
                        overflow: 'visible',
                        zIndex: 50 // 🎯 EXACTLY LIKE WEEKLY VIEW
                      }}
                      onMouseEnter={() => {
                        // 🚀 WEEKLY VIEW PATTERN EXACT COPY
                        const cards = document.querySelectorAll(`[data-stack-id="day-${slot.hour}-${slot.quarter}"]`);
                        cards.forEach((card, index) => {
                          const yOffset = index === 0 ? 0 : index === 1 ? 18 : index === 2 ? 36 : index === 3 ? 54 : index === 4 ? 72 : 90;
                          (card as HTMLElement).style.transform = `translateY(${yOffset}px)`;
                        });
                      }}
                      onMouseLeave={() => {
                        // Return to compact state
                        const cards = document.querySelectorAll(`[data-stack-id="day-${slot.hour}-${slot.quarter}"]`);
                        cards.forEach((card) => {
                          (card as HTMLElement).style.transform = 'translateY(0px)';
                        });
                      }}
                    >
                      {slotAppointments.map((apt, index) => {
                        const appointmentData = convertToAppointmentData(apt);
                        if (!appointmentData) return null;

                        const isTopCard = index === slotAppointments.length - 1;
                        const baseTop = index * 3; // Compact stacking like weekly view
                        const baseLeft = index * 2; // Slight left offset like weekly view
                        const zIndex = 60 + index; // 🎯 EXACTLY LIKE WEEKLY VIEW
                        
                        return (
                          <div
                            key={`${apt.id}-${index}`}
                            data-stack-id={`day-${slot.hour}-${slot.quarter}`}
                            className="absolute cursor-pointer transition-all duration-300 ease-out"
                            style={{
                              top: `${baseTop}px`,
                              left: `${baseLeft}px`,
                              right: `${Math.max(0, baseLeft - 1)}px`,
                              height: 'calc(100% - 16px)', // Slightly smaller to show stack
                              zIndex: zIndex, // 🎯 BACK TO SIMPLE - no !important needed
                              transform: 'translateY(0px)', // 🎯 EXACTLY LIKE WEEKLY VIEW
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAppointmentClick(apt);
                            }}
                          >
                            <AppointmentCard
                              appointment={appointmentData}
                              isCompact={false} // Keep larger size for daily view
                              onClick={() => handleAppointmentClick(apt)}
                              onDragStart={handleDragStart}
                              onDragEnd={handleDragEnd}
                              className={`
                                h-full text-sm transition-all duration-300
                                ${isTopCard 
                                  ? 'shadow-md' 
                                  : 'shadow-sm opacity-90 scale-98'
                                }
                                group-hover/stack:shadow-lg 
                                group-hover/stack:scale-100 
                                group-hover/stack:opacity-100
                                hover:shadow-xl hover:scale-105
                                cursor-pointer
                              `}
                            />
                          </div>
                        );
                      })}
                      
                      {/* 📊 COUNTER - ALWAYS ON TOP (like weekly view) */}
                      <div 
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold shadow-md transition-all duration-300"
                        style={{ 
                          zIndex: 100 // 🎯 EXACTLY LIKE WEEKLY VIEW
                        }}
                      >
                        {slotAppointments.length}
                      </div>
                    </div>
                  )
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {isPastSlot ? (
                        <div className="text-red-400">
                          <span className="text-lg">🚫</span>
                          <span className="text-xs mt-1 block">Hora pasada</span>
                        </div>
                      ) : (
                        <span className="text-xs mt-1">
                          {isDragging ? 'Soltar aquí' : 'Crear cita'}
                        </span>
                      )}
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
