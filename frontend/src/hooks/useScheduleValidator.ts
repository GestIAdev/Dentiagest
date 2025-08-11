/**
 * 🕐 SCHEDULE CONFLICT VALIDATOR
 * Hook para prevenir conflictos de horarios ANTES de enviar al backend
 */

import { useState, useCallback } from 'react';
import { useAppointments } from './useAppointments.ts';
import { parseClinicDateTime } from '../utils/timezone.ts';

interface TimeSlotConflict {
  hasConflict: boolean;
  conflictingAppointment?: any;
  message: string;
}

export const useScheduleValidator = () => {
  const { appointments } = useAppointments();
  const [isValidating, setIsValidating] = useState(false);

  const validateTimeSlot = useCallback(async (
    date: string, 
    time: string, 
    duration: number = 30,
    excludeAppointmentId?: string
  ): Promise<TimeSlotConflict> => {
    setIsValidating(true);
    
    try {
      // Parse the proposed appointment time
      const proposedDateTime = new Date(`${date}T${time}:00`);
      const proposedEndTime = new Date(proposedDateTime.getTime() + duration * 60000);
      
      if (isNaN(proposedDateTime.getTime())) {
        return {
          hasConflict: true,
          message: '❌ Fecha u hora inválida'
        };
      }

      // Check against existing appointments
      const conflicts = appointments.filter(apt => {
        // Skip the appointment being edited
        if (excludeAppointmentId && apt.id === excludeAppointmentId) {
          return false;
        }

        if (!apt.scheduled_date) return false;

        try {
          const existingDateTime = parseClinicDateTime(apt.scheduled_date);
          if (!existingDateTime || isNaN(existingDateTime.getTime())) return false;

          const existingEndTime = new Date(existingDateTime.getTime() + (apt.duration_minutes || 30) * 60000);

          // Check for overlap
          const hasOverlap = (
            (proposedDateTime >= existingDateTime && proposedDateTime < existingEndTime) ||
            (proposedEndTime > existingDateTime && proposedEndTime <= existingEndTime) ||
            (proposedDateTime <= existingDateTime && proposedEndTime >= existingEndTime)
          );

          return hasOverlap;
        } catch (error) {
          return false;
        }
      });

      if (conflicts.length > 0) {
        const conflictingAppt = conflicts[0];
        const conflictTime = parseClinicDateTime(conflictingAppt.scheduled_date);
        const timeStr = conflictTime ? conflictTime.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }) : 'hora desconocida';

        return {
          hasConflict: true,
          conflictingAppointment: conflictingAppt,
          message: `⚠️ Ya existe una cita a las ${timeStr} con ${conflictingAppt.patient_name || 'otro paciente'}`
        };
      }

      return {
        hasConflict: false,
        message: '✅ Horario disponible'
      };

    } catch (error) {
      return {
        hasConflict: true,
        message: '❌ Error al validar horario'
      };
    } finally {
      setIsValidating(false);
    }
  }, [appointments]);

  const findAvailableSlots = useCallback((
    date: string,
    duration: number = 30,
    startHour: number = 7,
    endHour: number = 21
  ): string[] => {
    const availableSlots: string[] = [];
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const proposedDateTime = new Date(`${date}T${timeString}:00`);
        const proposedEndTime = new Date(proposedDateTime.getTime() + duration * 60000);
        
        // Don't suggest slots that go past end hour
        if (proposedEndTime.getHours() > endHour) continue;

        const hasConflict = appointments.some(apt => {
          if (!apt.scheduled_date) return false;
          
          try {
            const existingDateTime = parseClinicDateTime(apt.scheduled_date);
            if (!existingDateTime || isNaN(existingDateTime.getTime())) return false;

            const existingEndTime = new Date(existingDateTime.getTime() + (apt.duration_minutes || 30) * 60000);

            return (
              (proposedDateTime >= existingDateTime && proposedDateTime < existingEndTime) ||
              (proposedEndTime > existingDateTime && proposedEndTime <= existingEndTime) ||
              (proposedDateTime <= existingDateTime && proposedEndTime >= existingEndTime)
            );
          } catch (error) {
            return false;
          }
        });

        if (!hasConflict) {
          availableSlots.push(timeString);
        }
      }
    }

    return availableSlots;
  }, [appointments]);

  return {
    validateTimeSlot,
    findAvailableSlots,
    isValidating
  };
};
