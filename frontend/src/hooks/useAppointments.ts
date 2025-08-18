import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { formatLocalDateTime, parseClinicDateTime } from '../utils/timezone.ts';
import apollo from '../apollo.ts';

export interface Appointment {
  id: string;
  patient_id: string;
  dentist_id: string;
  scheduled_date: string;
  duration_minutes: number;
  appointment_type: string;
  priority: string;
  title: string;
  description?: string;
  notes?: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  patient_name: string;
  patient_phone?: string; // 📞 TELÉFONO DEL PACIENTE!
  dentist_name: string;
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    patient_id: string;
    patient_name: string;
    title: string;
    appointment_type: string;
    status: string;
    priority: string;
    notes?: string;
  };
}

const STATUS_COLORS = {
  scheduled: '#4a90e2',    // Azul
  confirmed: '#7ed321',    // Verde
  in_progress: '#f5a623',  // Naranja
  completed: '#50c878',    // Verde claro
  cancelled: '#d0021b',    // Rojo
  no_show: '#9b59b6'       // Púrpura
};

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { state } = useAuth();

  // Convertir appointment a evento de FullCalendar
  const appointmentToEvent = (appointment: Appointment): CalendarEvent => {
    // 🌍 SOLUCIÓN MUNDIAL: Usar utilidades de timezone
    let startDate: Date;
    let duration = appointment.duration_minutes || 30;
    
    // Parsear fecha usando utilidades de timezone
    startDate = parseClinicDateTime(appointment.scheduled_date);
    
    // Forzar duración mínima de 15 minutos
    if (duration < 15) duration = 15;
    const endDate = new Date(startDate.getTime() + duration * 60000);

    // 💥 TYLER DURDEN 2x2 GRID - SIMPLE & STABLE
    // 2 columns: first half hour vs second half hour
    const minutes = startDate.getMinutes();
    let resourceId = 'slot1'; // Default: first half (:00-:29)
    
    if (minutes >= 30) {
      resourceId = 'slot2'; // Second half (:30-:59)
    }
    
    // For appointments >= 30min, they'll span both columns naturally

    const event = {
      id: appointment.id,
      title: `${appointment.patient_name} - ${appointment.title}`,
      start: formatLocalDateTime(startDate),
      end: formatLocalDateTime(endDate),
      backgroundColor: STATUS_COLORS[appointment.status],
      borderColor: STATUS_COLORS[appointment.status],
      resourceId: resourceId, // 🚀 SIMPLE 2-COLUMN ASSIGNMENT
      extendedProps: {
        patient_id: appointment.patient_id,
        patient_name: appointment.patient_name,
        title: appointment.title, // Título real sin concatenar
        appointment_type: appointment.appointment_type,
        status: appointment.status,
        priority: appointment.priority,
        notes: appointment.notes
      }
    };
    
    return event;
  };

  // GET - Listar todas las citas
  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🚀 Apollo fetchAppointments - Starting nuclear request');
      
      // 🚀 APOLLO NUCLEAR FETCH - Clean and powerful
      const result = await apollo.appointments.list();
      
      console.log('🚀 Apollo fetchAppointments - Response:', result);
      
      // Si la respuesta es un objeto con appointments, extraer el array
      let appointmentsArray: Appointment[] = result.appointments || [];
      
      // 🏥 GUARDAR TODAS LAS CITAS (incluidas canceladas) para filtros
      const allAppointments = appointmentsArray.map((apt: any) => ({
        ...apt,
        // ✅ Priority values now match backend format
        priority: apt.priority || 'normal'
      }));
      
      // 🏥 FILTRAR CITAS CANCELADAS SOLO PARA VISTA PRINCIPAL (no para filtros)
      const activeAppointments = allAppointments.filter((apt: any) => 
        apt.status && apt.status.toLowerCase() !== 'cancelled'
      );
      
      setAppointments(allAppointments); // ← TODAS para que filtros funcionen
      return allAppointments;
    } catch (err) {
      console.error('🚨 Apollo fetchAppointments - Error:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // POST - Crear nueva cita
  const createAppointment = async (appointmentData: Partial<Appointment>) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🚀 Apollo createAppointment - Data:', appointmentData);
      
      // � APOLLO NUCLEAR CREATE - Simple and powerful
      const newAppointment = await apollo.appointments.create(appointmentData);
      
      console.log('🚀 Apollo createAppointment - Created:', newAppointment);
      
      // ✅ Priority values now match backend format  
      const mappedAppointment = {
        ...(newAppointment as any),
        priority: (newAppointment as any).priority || 'normal'
      };
      
      setAppointments(prev => [...prev, mappedAppointment]);
      return mappedAppointment;
    } catch (err) {
      console.error('🚨 Apollo createAppointment - Error:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // PUT - Actualizar cita
  const updateAppointment = async (id: string, appointmentData: Partial<Appointment>) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🚀 Apollo updateAppointment - ID:', id, 'Data:', appointmentData);
      
      // 🚀 APOLLO NUCLEAR UPDATE - Clean and powerful
      const updatedAppointment = await apollo.appointments.update(id, appointmentData);
      
      console.log('🚀 Apollo updateAppointment - Updated:', updatedAppointment);
      
      // ✅ Priority values now match backend format
      const mappedAppointment = {
        ...(updatedAppointment as any),
        priority: (updatedAppointment as any).priority || 'normal'
      };
      
      setAppointments(prev => 
        prev.map(apt => apt.id === id ? mappedAppointment : apt)
      );
      return mappedAppointment;
    } catch (err) {
      console.error('🚨 Apollo updateAppointment - Error:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // DELETE - Eliminar cita
  const deleteAppointment = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🚀 Apollo deleteAppointment - ID:', id);
      
      // 🚀 APOLLO NUCLEAR DELETE - Clean and powerful
      await apollo.appointments.delete(id);
      
      console.log('🚀 Apollo deleteAppointment - Success for ID:', id);
      
      setAppointments(prev => prev.filter(apt => apt.id !== id));
    } catch (err) {
      console.error('🚨 Apollo deleteAppointment - Error:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Convertir appointments a eventos para FullCalendar
  const getCalendarEvents = (): CalendarEvent[] => {
    const events = appointments.map(appointmentToEvent);
    
    // Solo UN log cuando cambia la cantidad (no en cada render)
    // ✅ CALENDAR EVENTS: Successfully loaded
    return events;
  };

  // Cargar citas al montar el hook
  useEffect(() => {
    if (state.accessToken) {
      fetchAppointments();
    }
  }, [state.accessToken]);

  return {
    appointments,
    loading,
    error,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getCalendarEvents
  };
};
