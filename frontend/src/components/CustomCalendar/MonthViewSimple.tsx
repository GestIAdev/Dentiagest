import React from 'react';
import { format } from 'date-fns';
import { parseClinicDateTime } from '../../utils/timezone';

interface MonthViewSimpleProps {
  currentDate: Date;
  appointments: any[];
  onDateClick: (date: Date) => void;
  onAppointmentClick?: (appointment: any) => void;
  calendarData: {
    days: Date[];
  };
  helpers: {
    isDateInCurrentMonth: (date: Date) => boolean;
    isDateToday: (date: Date) => boolean;
  };
}

const MonthViewSimple: React.FC<MonthViewSimpleProps> = ({
  currentDate,
  appointments,
  onDateClick,
  onAppointmentClick,
  calendarData,
  helpers
}) => {
  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <div className="month-view" style={{
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
      border: '1px solid #e2e8f0'
    }}>
      {/* Calendar Grid */}
      <div className="calendar-grid">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-3 mb-4" style={{
          background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
          borderRadius: '12px',
          padding: '16px 8px',
          border: '1px solid #cbd5e1'
        }}>
          {weekDays.map(day => (
            <div key={day} className="text-center text-sm font-bold text-gray-700" style={{
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
              letterSpacing: '0.5px'
            }}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-3">
          {calendarData.days.map((date, index) => {
            // 🚫 Past date detection for elegant styling
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const dateOnly = new Date(date);
            dateOnly.setHours(0, 0, 0, 0);
            const isPastDate = dateOnly < today;
            
            return (
              <div
                key={index}
                onClick={() => onDateClick(date)} // 📍 Allow navigation to any date
              style={{
                background: isPastDate
                  ? 'linear-gradient(135deg, #fefbfb 0%, #fef2f2 100%)' // 🌸 SUPER soft pink for past dates
                  : helpers.isDateInCurrentMonth(date) 
                    ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' 
                    : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                borderRadius: '12px',
                border: helpers.isDateToday(date) 
                  ? '3px solid #64748b' 
                  : '1px solid #e2e8f0',
                boxShadow: helpers.isDateToday(date) 
                  ? '0 8px 25px rgba(100, 116, 139, 0.15)' 
                  : '0 4px 12px rgba(0, 0, 0, 0.05)',
                height: '90px',
                cursor: 'pointer', // 📍 Always pointer - MonthView is navigator, not editor
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                color: isPastDate 
                  ? '#9ca3af' // 🌸 Subtle gray for past dates (like out-of-month)
                  : helpers.isDateInCurrentMonth(date) ? '#1f2937' : '#9ca3af',
                fontWeight: helpers.isDateToday(date) ? 'bold' : '500',
                opacity: isPastDate ? 0.85 : 1
              }}
              className="calendar-day p-3 text-center"
              onMouseEnter={(e) => {
                if (helpers.isDateInCurrentMonth(date) && !isPastDate) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 25px rgba(0, 0, 0, 0.12)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = helpers.isDateToday(date) 
                  ? '0 8px 25px rgba(100, 116, 139, 0.15)' 
                  : '0 4px 12px rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.background = isPastDate
                  ? 'linear-gradient(135deg, #fefbfb 0%, #fef2f2 100%)' // 🌸 Restore past date background
                  : helpers.isDateInCurrentMonth(date) 
                    ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' 
                    : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)';
              }}
            >
              <div className="font-medium">
                {format(date, 'd')}
              </div>
              
              {/* 🎯 PROFESSIONAL APPOINTMENT INDICATORS */}
              <div className="mt-1 flex flex-col items-center space-y-1">
                {(() => {
                  const dayAppointments = appointments.filter(apt => {
                    const aptDate = parseClinicDateTime(apt.scheduled_date);
                    return format(aptDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
                  });
                  
                  const appointmentCount = dayAppointments.length;
                  
                  // ✅ APPOINTMENTS LOADED: Ready for professional display
                  if (appointmentCount === 0) {
                    return null; // Empty day - clean
                  }
                  
                  if (appointmentCount <= 3) {
                    // Show individual dots for 1-3 appointments (BIGGER & MORE VISUAL)
                    return (
                      <div className="flex space-x-1">
                        {dayAppointments.slice(0, 3).map((apt, idx) => (
                          <div 
                            key={apt.id || idx}
                            className={`
                              w-3 h-3 rounded-full cursor-pointer hover:scale-125 transition-transform
                            `}
                            style={{
                              backgroundColor: (() => {
                                // 🎯 PRIORITY OVERRIDES (diferentes tonos para diferenciar!)
                                if (apt.priority === 'urgent') return '#b91c1c'; // Rojo más oscuro (urgent)
                                if (apt.priority === 'high') return '#f97316'; // Naranja puro (high)
                                
                                // 🎨 RAUL'S 4-COLOR SYSTEM (FUCK THE MAPPING!)
                                const type = apt.appointment_type?.toLowerCase() || '';
                                
                                // 🔵 AZUL - Limpiezas únicamente
                                if (type.includes('limpieza') || type.includes('higiene') || type.includes('cleaning')) {
                                  return '#2563eb'; // Blue
                                }
                                
                                // 🔴 ROJO - Emergencias
                                if (type.includes('emergencia') || type.includes('urgencia') || type.includes('emergency')) {
                                  return '#dc2626'; // Red
                                }
                                
                                // 🟡 AMARILLO LIMÓN - TODO TRATAMIENTO (endodoncia, corona, extraccion, empaste, ortodoncia, etc.)
                                if (type.includes('endodoncia') || type.includes('corona') || type.includes('extraccion') || 
                                    type.includes('empaste') || type.includes('ortodoncia') || type.includes('orthodontics') ||
                                    type.includes('implante') || type.includes('cirugia') || type.includes('tratamiento') || 
                                    type.includes('filling') || type.includes('surgery') || type.includes('treatment') || 
                                    type.includes('brackets') || type.includes('root_canal') || type.includes('crown') || 
                                    type.includes('implant') || type.includes('extraction')) {
                                  return '#ffff00'; // Pure bright yellow (limón!)
                                }
                                
                                // 🟢 VERDE - TODO LO DEMÁS (consultas, seguimientos, revisiones)
                                return '#16a34a'; // Green
                              })()
                            }}
                            title={`${apt.patient_name} - ${apt.title} (${format(parseClinicDateTime(apt.scheduled_date), 'HH:mm')}) | Tipo: ${apt.appointment_type} | Prioridad: ${apt.priority}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              // 🎯 Direct appointment preview/navigation
                              if (onAppointmentClick) {
                                // Create modal-compatible appointment object
                                const appointmentForModal = {
                                  id: apt.id,
                                  title: `${apt.patient_name} - ${apt.title}`,
                                  start: apt.scheduled_date,
                                  extendedProps: {
                                    id: apt.id,
                                    patient_id: apt.patient_id,
                                    patient_name: apt.patient_name,
                                    title: apt.title,
                                    scheduled_date: apt.scheduled_date,
                                    duration_minutes: apt.duration_minutes,
                                    appointment_type: apt.appointment_type,
                                    priority: apt.priority,
                                    status: apt.status,
                                    description: apt.description,
                                    notes: apt.notes
                                  }
                                };
                                onAppointmentClick(appointmentForModal);
                              }
                            }}
                          />
                        ))}
                      </div>
                    );
                  } else {
                    // Show count badge for 4+ appointments (MINIMALIST NUMBER)
                    return (
                      <div className="flex flex-col items-center">
                        <div className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center cursor-pointer transition-colors">
                          {appointmentCount}
                        </div>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          );
          })}
        </div>
      </div>
    </div>
  );
};

export default MonthViewSimple;

