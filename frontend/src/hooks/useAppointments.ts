import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { formatLocalDateTime, parseClinicDateTime } from '../utils/timezone.ts';

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

  const API_BASE = 'http://localhost:8002/api/v1/appointments';

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
      const response = await fetch(API_BASE, {
        headers: {
          'Authorization': `Bearer ${state.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar las citas');
      }

      const data = await response.json();
      // Si la respuesta es un objeto con appointments, extraer el array
      let appointmentsArray: Appointment[] = [];
      if (Array.isArray(data)) {
        appointmentsArray = data;
      } else if (Array.isArray(data.appointments)) {
        appointmentsArray = data.appointments;  // ← ESTRUCTURA CORRECTA DEL BACKEND
      } else if (data && typeof data === 'object') {
        // Si la respuesta es un objeto con claves, buscar arrays
        for (const key of Object.keys(data)) {
          if (Array.isArray(data[key])) {
            appointmentsArray = data[key];
            break;
          }
        }
      }
      
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
      // ✅ CREATE APPOINTMENT: Send to backend
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${state.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentData)
      });

      if (!response.ok) {
        // 🚨 PRESERVAR INFO DEL ERROR HTTP PARA MANEJO ESPECÍFICO
        const errorData = await response.text();
        const error = new Error(`Error al crear la cita: ${response.status}`);
        (error as any).response = { status: response.status };
        (error as any).data = errorData;
        throw error;
      }

      const newAppointment = await response.json();
      
      // ✅ Priority values now match backend format
      const mappedAppointment = {
        ...newAppointment,
        priority: newAppointment.priority || 'normal'
      };
      
      setAppointments(prev => [...prev, mappedAppointment]);
      return mappedAppointment;
    } catch (err) {
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
      // 🔄 UPDATE APPOINTMENT: Send changes to backend  
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${state.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ PUT Error response:', errorText);
        throw new Error('Error al actualizar la cita');
      }

      const updatedAppointment = await response.json();
      
      // ✅ Priority values now match backend format
      const mappedAppointment = {
        ...updatedAppointment,
        priority: updatedAppointment.priority || 'normal'
      };
      
      setAppointments(prev => 
        prev.map(apt => apt.id === id ? mappedAppointment : apt)
      );
      return mappedAppointment;
    } catch (err) {
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
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${state.accessToken}`,
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        // 🚨 PRESERVAR INFO DEL ERROR HTTP PARA MANEJO ESPECÍFICO
        const error = new Error(`Error al eliminar la cita: ${response.status}`);
        (error as any).response = { status: response.status };
        (error as any).data = errorText;
        throw error;
      }

      setAppointments(prev => prev.filter(apt => apt.id !== id));
    } catch (err) {
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
