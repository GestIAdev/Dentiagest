/**
 * 🏥 DENTIAGEST DAY VIEW - PHASE 2
 * 
 * Purpose: Single day view with detailed 2x2 grid per hour
 * Created: August 9, 2025 - Phase 2
 * Status: IN DEVELOPMENT
 * 
 * Key Features:
 * - Single day detailed view
 * - 2x2 grid per hour (4 slots of 15min each)
 * - Larger slots for better appointment visualization
 * - Perfect for detailed day management
 * 
 * Dependencies:
 * - date-fns: Date calculations
 * 
 * @author Punk Claude & Platform Gestia Developer
 */

import React from 'react';
import { format, setHours, setMinutes } from 'date-fns';
import { es } from 'date-fns/locale';

interface DayViewProps {
  currentDate: Date;
  onTimeSlotClick?: (date: Date, time: string) => void;
  className?: string;
}

interface TimeSlot {
  hour: number;
  quarter: number; // 0, 15, 30, 45
  time: string;
  gridPosition: { row: number; col: number };
}

export function DayViewSimple({ 
  currentDate, 
  onTimeSlotClick,
  className = '' 
}: DayViewProps) {

  // Working hours: 7am to 9pm (14 hours)
  const startHour = 7;
  const endHour = 21;
  const workingHours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);

  // Generate time slots with 2x2 grid positions
  const generateTimeSlots = (hour: number): TimeSlot[] => {
    const quarters = [0, 15, 30, 45];
    return quarters.map((quarter, index) => ({
      hour,
      quarter,
      time: `${hour.toString().padStart(2, '0')}:${quarter.toString().padStart(2, '0')}`,
      gridPosition: {
        row: Math.floor(index / 2), // 0 or 1
        col: index % 2 // 0 or 1
      }
    }));
  };

  const handleTimeSlotClick = (timeSlot: TimeSlot) => {
    const dateTime = setMinutes(setHours(currentDate, timeSlot.hour), timeSlot.quarter);
    if (onTimeSlotClick) {
      onTimeSlotClick(dateTime, timeSlot.time);
    }
  };

  return (
    <div className={`dentiagest-day-view ${className}`}>
      {/* Day Header */}
      <div className="day-header mb-6 p-4 bg-blue-50 rounded-lg text-center">
        <h2 className="text-2xl font-bold text-blue-800">
          {format(currentDate, 'EEEE, d MMMM yyyy', { locale: es })}
        </h2>
        <p className="text-blue-600 mt-1">
          Vista detallada del día - Slots de 15 minutos
        </p>
      </div>

      {/* Day Grid */}
      <div className="day-grid max-w-2xl mx-auto">
        {workingHours.map(hour => (
          <div key={hour} className="hour-block mb-3 border rounded-lg overflow-hidden bg-white shadow-sm">
            {/* Hour Header */}
            <div className="hour-header bg-gray-100 p-3 border-b">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-700">
                  {hour}:00 - {hour + 1}:00
                </span>
                <span className="text-sm text-gray-500">
                  4 slots de 15min
                </span>
              </div>
            </div>

            {/* 2x2 Grid for this hour */}
            <div className="hour-content p-2">
              <div className="grid grid-cols-2 grid-rows-2 gap-2 h-24">
                {generateTimeSlots(hour).map(timeSlot => (
                  <div
                    key={`${timeSlot.time}-${timeSlot.gridPosition.row}-${timeSlot.gridPosition.col}`}
                    onClick={() => handleTimeSlotClick(timeSlot)}
                    className={`
                      time-slot bg-gray-50 hover:bg-blue-50 cursor-pointer transition-all
                      border border-gray-200 rounded p-2 flex flex-col justify-between
                      hover:shadow-md hover:border-blue-300
                    `}
                    title={`${format(currentDate, 'dd/MM/yyyy')} ${timeSlot.time}`}
                  >
                    {/* Time label */}
                    <div className="time-label text-xs font-medium text-gray-600">
                      {timeSlot.time}
                    </div>
                    
                    {/* Appointment placeholder */}
                    <div className="appointment-area flex-1 flex items-center justify-center">
                      <span className="text-xs text-gray-400">
                        + Cita
                      </span>
                    </div>
                    
                    {/* Grid position indicator (for debugging/development) */}
                    <div className="position-indicator text-xs text-gray-300 text-right">
                      {timeSlot.gridPosition.row + 1}.{timeSlot.gridPosition.col + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer info */}
      <div className="day-footer mt-6 p-4 bg-gray-50 rounded text-sm text-gray-600 text-center">
        💡 <strong>2x2 Grid System:</strong> Cada hora = 4 slots de 15min | 
        Perfecto para citas rápidas (15min) hasta tratamientos largos (2+ horas)
      </div>
    </div>
  );
}

export default DayViewSimple;
