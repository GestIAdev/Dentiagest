/**
 * 🏥 TIME SLOTS GENERATOR - AInarkalendar
 * 
 * ⚡ Built by: PunkClaude (PRECISION MODE)
 * 🎯 Mission: Generate 15-minute slots for 2x2 grid
 * 💀 Strategy: 7AM-8PM dental practice hours
 * 
 * "Time is the canvas, appointments are the art"
 * - PunkClaude, Time Grid Master
 */

export interface TimeSlot {
  hour: number;
  minute: number;
  timeString: string;
  displayTime: string;
  gridPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

/**
 * Generates time slots for dental practice (7AM - 8PM)
 * Returns 2x2 grid slots per hour (4 slots of 15 minutes each)
 */
export function generateTimeSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  
  // Working hours: 7AM to 8PM (13 hours)
  for (let hour = 7; hour <= 20; hour++) {
    // 4 slots per hour: 00, 15, 30, 45 minutes
    const minutes = [0, 15, 30, 45];
    const positions: TimeSlot['gridPosition'][] = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
    
    minutes.forEach((minute, index) => {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const displayTime = `${hour}:${minute.toString().padStart(2, '0')}`;
      
      slots.push({
        hour,
        minute,
        timeString,
        displayTime,
        gridPosition: positions[index]
      });
    });
  }
  
  return slots;
}

/**
 * Pre-generated time slots for performance
 */
export const TIME_SLOTS = generateTimeSlots();

/**
 * Get slots for a specific hour (returns 4 slots in 2x2 grid)
 */
export function getSlotsForHour(hour: number): TimeSlot[] {
  return TIME_SLOTS.filter(slot => slot.hour === hour);
}

/**
 * Get working hours array (7AM - 8PM)
 */
export function getWorkingHours(): number[] {
  return Array.from({ length: 14 }, (_, i) => i + 7);
}

