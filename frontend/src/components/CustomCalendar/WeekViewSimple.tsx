/**
 * 🏴‍☠️ IAnarkalendar © GestIA Dev + PunkClaude 2025
 */

import React, { useState } from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { parseClinicDateTime } from '../../utils/timezone';
import { AppointmentCard } from './AppointmentCard';
import { updateAppointmentTime } from '../../utils/appointmentService';
import { centralMappingService } from '../../services/mapping';
// APOLLO NUCLEAR: CentralMappingService disabled

interface WeekViewProps {
  currentDate: Date;
  onDateClick?: (date: Date) => void;
  onTimeSlotClick?: (date: Date, time: string) => void;
  onAppointmentClick?: (appointment: any) => void; // 🎯 CLICK HANDLER FOR EDITING!
  onAppointmentUpdate?: () => void; // 🔄 NEW: Callback to refresh data
  appointments?: any[];
  className?: string;
}

export function WeekViewSimple({ 
  currentDate, 
  onDateClick,
  onTimeSlotClick,
  onAppointmentClick, // 🎯 RECEIVE CLICK HANDLER!
  onAppointmentUpdate, // 🔄 NEW: Callback to refresh appointments
  appointments = [],
  className = '' 
}: WeekViewProps) {

  // 🎯 DRAG & DROP STATE (copied from Daily View)
  const [draggedAppointment, setDraggedAppointment] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false); // 🔥 NEW: Loading state for API calls

  // Generate week days starting from Monday
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  // Working hours: 7am to 9pm
  const workingHours = Array.from({ length: 14 }, (_, i) => i + 7);

  // 🎯 DRAG & DROP HANDLERS (copied from Daily View)
  const handleDragStart = (appointment: any) => {
    setDraggedAppointment(appointment);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setDraggedAppointment(null);
    setIsDragging(false);
  };

  const handleDropOnSlot = async (day: Date, hour: number) => {
    if (!draggedAppointment) return;
    
    
    // 🚫 NO MORE ANNOYING ALERTS! UI will prevent bad drops
    
    try {
      // Set loading state
      setIsUpdating(true);
      
      // Parse the original appointment date
      const originalDate = parseClinicDateTime(draggedAppointment.scheduled_date);
      if (!originalDate) {
        throw new Error('Invalid appointment date format');
      }
      
      // 🗓️ WEEKLY VIEW: Change both DATE and HOUR 
      const targetDate = new Date(day); // Use target day
      targetDate.setHours(hour, 0, 0, 0); // Set new hour (00 minutes for weekly)
      
      
      // Call the API to update appointment time
      const result = await updateAppointmentTime(
        draggedAppointment.id,
        targetDate,
        hour,
        0 // Weekly view = exact hour (no quarters)
      );
      
      if (result.success) {
        
        // 🔥 REFRESH APPOINTMENTS DATA TO SHOW VISUAL UPDATE
        if (onAppointmentUpdate) {
          onAppointmentUpdate();
        }
        
      } else {
        console.error('💥 WEEKLY DRAG & DROP FAILED:', result.error);
        console.error(`❌ Error moviendo la cita: ${result.error}`);
      }
      
    } catch (error: any) {
      console.error('❌ Error in weekly handleDropOnSlot:', error);
      console.error(`❌ Error inesperado: ${error.message}`);
    } finally {
      // Always reset states
      setIsUpdating(false);
      handleDragEnd();
    }
  };

  // 🎯 Convert appointment to AppointmentCard format
  const convertToAppointmentData = (apt: any) => {
    // 🛡️ DEFENSIVE DATE VALIDATION - Prevent "Invalid time value"
    if (!apt?.scheduled_date) {
      console.warn('⚠️ Appointment missing scheduled_date:', apt);
      return null;
    }

    const appointmentDate = parseClinicDateTime(apt.scheduled_date);
    
    // 🛡️ CHECK IF DATE IS VALID - Prevent runtime crashes
    if (!appointmentDate || isNaN(appointmentDate.getTime())) {
      console.warn('⚠️ Invalid appointment date:', apt.scheduled_date, '→', appointmentDate);
      return null;
    }

    //  HYBRID PRIORITY SYSTEM - Manual OVERRIDES Automatic
    const determinePriority = (apt: any): 'normal' | 'high' | 'urgent' => {
      // 🎯 RULE 1: Manual priority ALWAYS wins (if valid)
      if (apt.priority && ['normal', 'high', 'urgent'].includes(apt.priority)) {
        return apt.priority;
      }
      
      // 🤖 RULE 2: Automatic detection as fallback
      // 🚀 OPERACIÓN UNIFORM - Central Mapping Service (with emergency support for WeekView)
      const mappingResult = centralMappingService.mapAppointmentType(apt.appointment_type, true);
      const mappedType = mappingResult.success && mappingResult.result ? 
        mappingResult.result : 'consultation';
      
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

    return {
      id: apt.id,
      patientName: apt.patient_name || 'Paciente',
      patientId: apt.patient_id || '',
      startTime: appointmentDate,
      endTime: new Date(appointmentDate.getTime() + (apt.duration || 30) * 60000),
      duration: apt.duration || 30,
      // 🚀 OPERACIÓN UNIFORM - Central Mapping Service usage #2
      type: (() => {
        const mappingResult = centralMappingService.mapAppointmentType(apt.appointment_type, true);
        return (mappingResult.success && mappingResult.result ? 
          mappingResult.result : 'consultation') as 'consultation' | 'cleaning' | 'treatment' | 'emergency';
      })(),
      // 🚀 OPERACIÓN UNIFORM - Central status mapping
      status: (() => {
        const mappingResult = centralMappingService.mapAppointmentStatus(apt.status);
        return (mappingResult.success && mappingResult.result ? 
          mappingResult.result : 'pending') as 'confirmed' | 'pending' | 'cancelled' | 'completed';
      })(),
      priority: determinePriority(apt), // 🚨 SMART PRIORITY WITH DEBUGGING!
      notes: apt.notes || '',
      phone: apt.patient_phone || '',
      doctorName: apt.doctor_name || '',
      treatmentCode: apt.treatment_code || '',
      estimatedCost: apt.estimated_cost || 0
    };
  };

  // 🎯 SIMPLE APPOINTMENT FILTER - COPY FROM MONTHLY VIEW SUCCESS
  const getAppointmentsForDayAndHour = (day: Date, hour: number) => {
    return appointments.filter(apt => {
      if (!apt?.scheduled_date) return false;
      
      try {
        const aptDate = parseClinicDateTime(apt.scheduled_date);
        
        // 🛡️ DEFENSIVE DATE VALIDATION - Prevent crashes
        if (!aptDate || isNaN(aptDate.getTime())) {
          console.warn('⚠️ Invalid date in filter:', apt.scheduled_date, '→', aptDate);
          return false;
        }
        
        const sameDay = format(aptDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
        const sameHour = aptDate.getHours() === hour;
        
        return sameDay && sameHour;
      } catch (error) {
        return false;
      }
    });
  };

  return (
    <div className={`week-view-compact ${className}`} style={{ 
      backgroundColor: '#f8fafc', // 🎨 Actually gray background
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
    }}>
      {/* ✨ MAGICAL AINARKLENDAR HEADER */}
      <div className="grid grid-cols-8 gap-2 mb-4">
        <div className="text-sm p-3 rounded-xl text-center font-bold text-gray-700" style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          border: '1px solid #e2e8f0'
        }}>
          Hora
        </div>
        {weekDays.map(day => (
          <div key={day.toISOString()} className="text-sm p-3 rounded-xl text-center border-2 border-gray-100 shadow-sm" style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
          }}>
            <div className="font-bold text-gray-700">{format(day, 'EEE', { locale: es })}</div>
            <div className="text-xs text-gray-600 font-medium">{format(day, 'd')}</div>
          </div>
        ))}
      </div>

      {/* 🎯 OPTIMIZED GRID - Perfect balance of compact & functional */}
      <div className="week-grid">
        {workingHours.map(hour => (
          <div key={hour} className="grid grid-cols-8 gap-1 mb-1">
            {/* Time label - AINARKLENDAR Gray Style */}
        <div className="text-sm p-3 rounded-xl text-center font-bold text-gray-700 shadow-sm" style={{
          background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
          border: '1px solid #cbd5e0'
        }}>
          {hour}:00
        </div>

            {/* ✨ MAGICAL Day columns */}
            {weekDays.map(day => {
              const dayAppointments = getAppointmentsForDayAndHour(day, hour);

              // 🚫 CHECK IF SLOT IS IN THE PAST (Weekly View validation)
              const slotDateTime = new Date(day);
              slotDateTime.setHours(hour, 0, 0, 0);
              const now = new Date();
              const isPastSlot = slotDateTime < now;

              return (
                <div 
                  key={`${day.toISOString()}-${hour}`}
                  className={`relative border-2 rounded-xl cursor-pointer group transition-all duration-300`}
                  style={{ 
                    height: '65px', // ⚡ Slightly taller for better visual
                    overflow: 'visible',
                    zIndex: dayAppointments.length > 1 ? 40 : 1, // Higher z-index for multi-appointment slots
                    // ✨ MAGICAL STYLING based on state
                    background: isPastSlot 
                      ? 'linear-gradient(135deg, #fefbfb 0%, #fef2f2 100%)' // 🌸 SUPER soft pink for past (matching MonthView)
                      : dayAppointments.length > 0 
                        ? 'linear-gradient(135deg, #dbeafe 0%, #f0f9ff 100%)' // Blue gradient for appointments
                        : 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)', // Clean gradient for empty
                    borderColor: isPastSlot 
                      ? '#f87171' // 🌸 Soft pink border (matching MonthView)
                      : dayAppointments.length > 0 
                        ? '#3b82f6' // blue-500 for appointments  
                        : '#e2e8f0', // gray-300 for empty
                    opacity: isPastSlot ? 0.7 : 1,
                    cursor: isPastSlot ? 'not-allowed' : 'pointer',
                    transform: dayAppointments.length > 0 ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: dayAppointments.length > 0 
                      ? '0 4px 15px rgba(59, 130, 246, 0.15)' 
                      : '0 2px 8px rgba(0,0,0,0.05)'
                  }}
                  onClick={() => {
                    if (!isPastSlot) {
                      onTimeSlotClick?.(day, `${hour}:00`);
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (isDragging && !isPastSlot) {
                      // 🎨 VALID DRAG FEEDBACK - Blue inline styling
                      e.currentTarget.style.transition = 'all 0.15s ease-out';
                      e.currentTarget.style.backgroundColor = '#dbeafe'; // blue-50
                      e.currentTarget.style.borderColor = '#93c5fd'; // blue-300
                      e.currentTarget.style.transform = 'scale(1.02)';
                    } else if (isDragging && isPastSlot) {
                      // 🚫 PROHIBITED ZONE FEEDBACK - Red inline styling
                      e.currentTarget.style.transition = 'all 0.15s ease-out';
                      e.currentTarget.style.backgroundColor = '#fecaca'; // red-200
                      e.currentTarget.style.borderColor = '#f87171'; // red-400
                      e.currentTarget.style.cursor = 'not-allowed';
                      e.currentTarget.style.transform = 'scale(0.98)'; // Slight shrink for rejection
                    }
                  }}
                  onDragLeave={(e) => {
                    // 🎨 RESET to original past slot styling
                    e.currentTarget.style.transition = 'all 0.15s ease-out';
                    e.currentTarget.style.backgroundColor = isPastSlot ? '#fef2f2' : ''; // red-50 or normal
                    e.currentTarget.style.borderColor = isPastSlot ? '#ef4444' : ''; // red-500 or normal
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.cursor = isPastSlot ? 'not-allowed' : 'pointer';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    
                    // 🚫 PREVENT DROP ON PAST SLOTS - No annoying alerts!
                    if (isPastSlot) {
                      // Reset to past slot styling
                      e.currentTarget.style.backgroundColor = '#fef2f2'; // red-50
                      e.currentTarget.style.borderColor = '#ef4444'; // red-500
                      return;
                    }
                    
                    // 🎬 SUCCESS ANIMATION (only for valid drops)
                    const target = e.currentTarget;
                    target.style.transition = 'all 0.2s ease-out';
                    target.style.transform = '';
                    
                    // Green success flash
                    target.style.backgroundColor = '#dcfce7'; // green-100
                    target.style.borderColor = '#16a34a'; // green-600
                    setTimeout(() => {
                      if (target && target.style) {
                        target.style.backgroundColor = '';
                        target.style.borderColor = '';
                      }
                    }, 400);
                    
                    // Handle the drop
                    handleDropOnSlot(day, hour);
                  }}
                >
                  {/* EMPTY SLOT - AINARKLENDAR Style */}
                  {dayAppointments.length === 0 && (
                    <div className="h-full flex items-center justify-center text-sm text-gray-400">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-lg">+</span>
                    </div>
                  )}

                  {/* SINGLE APPOINTMENT - Full size, elegant */}
                  {dayAppointments.length === 1 && (
                    <div className="h-full p-1">
                      {(() => {
                        const appointmentData = convertToAppointmentData(dayAppointments[0]);
                        if (!appointmentData) return null;
                        
                        return (
                          <AppointmentCard
                            appointment={appointmentData}
                            isCompact={true}
                            onClick={(clickedApt) => onAppointmentClick?.(dayAppointments[0])} // 🎯 PASS ORIGINAL!
                            onDragStart={handleDragStart} // 🚀 DRAG & DROP ENABLED
                            onDragEnd={handleDragEnd} // 🚀 DRAG & DROP ENABLED
                            className="h-full text-sm"
                          />
                        );
                      })()}
                    </div>
                  )}

                  {/* 🗂️ MULTIPLE APPOINTMENTS - SIMPLE BUT ELEGANT HOVER REVEAL */}
                  {dayAppointments.length > 1 && (
                    <div 
                      className="absolute inset-0"
                      style={{ 
                        overflow: 'visible',
                        zIndex: 50 // MUCH HIGHER: Above all other slots
                      }}
                      onMouseEnter={() => {
                        // 🚀 MANUAL HOVER REVEAL - 100% reliable
                        const cards = document.querySelectorAll(`[data-stack-id="${day.toISOString()}-${hour}"]`);
                        cards.forEach((card, index) => {
                          const yOffset = index === 0 ? 0 : index === 1 ? 20 : index === 2 ? 40 : index === 3 ? 64 : index === 4 ? 80 : 96;
                          (card as HTMLElement).style.transform = `translateY(${yOffset}px)`;
                        });
                      }}
                      onMouseLeave={() => {
                        // Return to compact state
                        const cards = document.querySelectorAll(`[data-stack-id="${day.toISOString()}-${hour}"]`);
                        cards.forEach((card) => {
                          (card as HTMLElement).style.transform = 'translateY(0px)';
                        });
                      }}
                    >
                      {dayAppointments.map((apt, index) => {
                        const appointmentData = convertToAppointmentData(apt);
                        if (!appointmentData) return null;

                        const isTopCard = index === dayAppointments.length - 1;
                        const baseTop = index * 4;
                        const baseLeft = index * 3;
                        const zIndex = 60 + index; // VERY HIGH z-index
                        
                        return (
                          <div
                            key={`${apt.id}-${index}`}
                            data-stack-id={`${day.toISOString()}-${hour}`}
                            className="absolute cursor-pointer transition-all duration-300 ease-out"
                            style={{
                              top: `${baseTop}px`,
                              left: `${baseLeft}px`,
                              right: `${Math.max(0, baseLeft - 2)}px`,
                              height: 'calc(100% - 8px)',
                              zIndex: zIndex,
                              transform: 'translateY(0px)', // Start position
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              // 🎯 PASS ORIGINAL APPOINTMENT - Not converted data!
                              onAppointmentClick?.(apt);
                            }}
                          >
                            {/* 🎯 REAL APPOINTMENTCARD - CLEAN AND CLICKEABLE */}
                            <AppointmentCard
                              appointment={appointmentData}
                              isCompact={true}
                              onClick={(clickedApt) => onAppointmentClick?.(apt)} // 🎯 PASS ORIGINAL APT!
                              onDragStart={handleDragStart} // 🚀 DRAG & DROP ENABLED
                              onDragEnd={handleDragEnd} // 🚀 DRAG & DROP ENABLED
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
                      
                      {/* 📊 COUNTER - ALWAYS ON TOP */}
                      <div 
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-sm px-2 py-1 rounded-full font-bold shadow-md transition-all duration-300"
                        style={{ 
                          zIndex: 100 // HIGHEST Z-INDEX: Always visible on top
                        }}
                      >
                        {dayAppointments.length}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
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
          <div className="flex items-center gap-1 ml-4 border-l pl-4">
            <span>{isUpdating ? '⏳ Actualizando...' : '🎯 Arrastra para reprogramar'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeekViewSimple;
