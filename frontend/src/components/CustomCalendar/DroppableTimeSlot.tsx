/**
 * 🏥 DENTIAGEST DROPPABLE TIME SLOT - PHASE 2.5
 * 
 * Purpose: Enhanced time slot component with drag & drop capabilities
 * Created: August 9, 2025 - Phase 2.5 - DRAG & DROP MAGIC
 * Status: IN DEVELOPMENT - NATIVE HTML5 DRAG & DROP
 * 
 * Key Features:
 * - Native HTML5 drop zone (NO EXTERNAL LIBS!)
 * - Visual feedback during drag over
 * - Smart conflict detection
 * - 15-minute precision snapping
 * - Touch-friendly for tablets
 * 
 * PlatformGest Extraction Notes:
 * - Universal time slot pattern for all scheduling systems
 * - DentiaGest: 15min dental appointment slots
 * - VetGest: 15-30min vet consultation slots  
 * - MechaGest: 30min-2h repair time blocks
 * - RestaurantGest: 1-2h table reservation slots
 * 
 * Dependencies:
 * - date-fns: Time calculations
 * - AppointmentCard: For rendering dropped appointments
 * 
 * @author Punk Claude & Platform Gestia Developer
 */

import React, { useState, useRef } from 'react';
import { format, isSameMinute } from 'date-fns';
import { AppointmentData, AppointmentCard } from './AppointmentCard';
// import { useMicroInteractions } from './hooks';
import './styles/animations.css';

interface DroppableTimeSlotProps {
  slotTime: Date;
  appointments: AppointmentData[];
  onAppointmentDrop?: (appointment: AppointmentData, newTime: Date) => void;
  onSlotClick?: (time: Date) => void;
  isAvailable?: boolean;
  className?: string;
}

export function DroppableTimeSlot({
  slotTime,
  appointments,
  onAppointmentDrop,
  onSlotClick,
  isAvailable = true,
  className = ''
}: DroppableTimeSlotProps) {

  const [isDragOver, setIsDragOver] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  
  // 🎪 ANIMATION HOOKS
  // const microInteractions = useMicroInteractions();

  // Find appointments that start in this exact time slot
  const slotAppointments = appointments.filter(apt => 
    isSameMinute(apt.startTime, slotTime)
  );

  const hasAppointments = slotAppointments.length > 0;
  const isOccupied = !isAvailable || hasAppointments;

  // 🎯 DRAG & DROP HANDLERS
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Allow drop
    e.dataTransfer.dropEffect = 'move';
    
    if (!isDragOver) {
      setIsDragOver(true);
      setDragError(null);
      
      // ⚡ Trigger hover animation
      if (slotRef.current) {
        slotRef.current.classList.add('drag-over');
      }
      
      // Check if slot is available
      if (isOccupied) {
        setDragError('Slot ocupado');
        if (slotRef.current) {
          slotRef.current.classList.add('drag-error');
          setTimeout(() => {
            slotRef.current?.classList.remove('drag-error');
          }, 500);
        }
      }
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only trigger if we're actually leaving the slot (not entering a child)
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
      setDragError(null);
      
      // ⚡ Remove hover animation
      if (slotRef.current) {
        slotRef.current.classList.remove('drag-over');
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setDragError(null);

    // ⚡ Remove drag animations
    if (slotRef.current) {
      slotRef.current.classList.remove('drag-over');
    }

    try {
      // Get appointment data from drag
      const appointmentData = e.dataTransfer.getData('application/json');
      const appointment: AppointmentData = JSON.parse(appointmentData);

      // Check if drop is valid
      if (isOccupied) {
        setDragError('No se puede colocar aquí - slot ocupado');
        
        // ⚡ Trigger error animation
        if (slotRef.current) {
          // microInteractions.triggerClick(slotRef.current, 'error');
          slotRef.current.classList.add('micro-error');
          setTimeout(() => {
            slotRef.current?.classList.remove('micro-error');
          }, 200);
        }
        
        setTimeout(() => setDragError(null), 3000);
        return;
      }

      // ⚡ Trigger success animation
      if (slotRef.current) {
        // microInteractions.triggerClick(slotRef.current, 'success');
        slotRef.current.classList.add('micro-success');
        setTimeout(() => {
          slotRef.current?.classList.remove('micro-success');
        }, 200);
      }

      // Execute drop callback
      if (onAppointmentDrop) {
        onAppointmentDrop(appointment, slotTime);
      }

    } catch (error) {
      console.error('Error handling drop:', error);
      setDragError('Error al mover la cita');
      
      // ⚡ Trigger error animation
      if (slotRef.current) {
        // microInteractions.triggerClick(slotRef.current, 'error');
        slotRef.current.classList.add('micro-error');
        setTimeout(() => {
          slotRef.current?.classList.remove('micro-error');
        }, 200);
      }
      
      setTimeout(() => setDragError(null), 3000);
    }
  };

  const handleSlotClick = () => {
    // ⚡ Trigger click animation
    if (slotRef.current) {
      // microInteractions.triggerClick(slotRef.current, 'success');
      slotRef.current.classList.add('micro-success');
      setTimeout(() => {
        slotRef.current?.classList.remove('micro-success');
      }, 200);
    }
    
    if (onSlotClick && !hasAppointments) {
      onSlotClick(slotTime);
    }
  };

  // 🎨 DYNAMIC STYLING
  const getSlotClasses = () => {
    const baseClasses = `
      droppable-time-slot relative transition-all duration-200 cursor-pointer
      border border-gray-200 p-1 min-h-[60px] flex flex-col
    `;

    const stateClasses = [
      // Default state
      !hasAppointments && isAvailable ? 'bg-gray-50 hover:bg-blue-50' : '',
      
      // Occupied state
      hasAppointments ? 'bg-white' : '',
      
      // Unavailable state  
      !isAvailable && !hasAppointments ? 'bg-gray-100 cursor-not-allowed' : '',
      
      // Drag over states
      isDragOver && isAvailable && !hasAppointments ? 'bg-green-100 border-green-400 border-2' : '',
      isDragOver && isOccupied ? 'bg-red-100 border-red-400 border-2' : '',
      
      // Error state
      dragError ? 'bg-red-50 border-red-300' : ''
    ].filter(Boolean).join(' ');

    return `${baseClasses} ${stateClasses} ${className}`;
  };

  return (
    <div
      ref={slotRef}
      className={getSlotClasses()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleSlotClick}
      title={`${format(slotTime, 'HH:mm')} - ${isAvailable ? 'Disponible' : 'No disponible'}`}
    >
      {/* Time label (only show on quarters) */}
      {slotTime.getMinutes() % 15 === 0 && (
        <div className="time-label text-xs text-gray-500 mb-1">
          {format(slotTime, 'HH:mm')}
        </div>
      )}

      {/* Appointment cards */}
      {slotAppointments.map(appointment => (
        <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          className="mb-1 last:mb-0"
        />
      ))}

      {/* Drop zone indicator */}
      {isDragOver && !hasAppointments && (
        <div className="drop-indicator flex-1 flex items-center justify-center">
          {dragError ? (
            <span className="text-red-600 text-xs font-medium">
              ❌ {dragError}
            </span>
          ) : (
            <span className="text-green-600 text-xs font-medium">
              ✅ Soltar aquí
            </span>
          )}
        </div>
      )}

      {/* Empty slot indicator */}
      {!hasAppointments && !isDragOver && isAvailable && (
        <div className="empty-slot flex-1 flex items-center justify-center text-gray-300">
          <span className="text-xs">+</span>
        </div>
      )}

      {/* Error message display */}
      {dragError && !isDragOver && (
        <div className="error-message absolute top-0 left-0 right-0 bg-red-100 border border-red-300 rounded p-1 z-10">
          <span className="text-red-700 text-xs font-medium">
            {dragError}
          </span>
        </div>
      )}
    </div>
  );
}

export default DroppableTimeSlot;
