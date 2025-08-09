import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext.tsx';

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
    patient_name: string;
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
    const startDate = new Date(appointment.scheduled_date);
    const endDate = new Date(startDate.getTime() + appointment.duration_minutes * 60000);
    
    return {
      id: appointment.id,
      title: `${appointment.patient_name} - ${appointment.title}`,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      backgroundColor: STATUS_COLORS[appointment.status],
      borderColor: STATUS_COLORS[appointment.status],
      extendedProps: {
        patient_name: appointment.patient_name,
        appointment_type: appointment.appointment_type,
        status: appointment.status,
        priority: appointment.priority,
        notes: appointment.notes
      }
    };
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
      setAppointments(data);
      return data;
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
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${state.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentData)
      });

      if (!response.ok) {
        throw new Error('Error al crear la cita');
      }

      const newAppointment = await response.json();
      setAppointments(prev => [...prev, newAppointment]);
      return newAppointment;
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
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${state.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentData)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la cita');
      }

      const updatedAppointment = await response.json();
      setAppointments(prev => 
        prev.map(apt => apt.id === id ? updatedAppointment : apt)
      );
      return updatedAppointment;
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
        throw new Error('Error al eliminar la cita');
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
    return (appointments || []).map(appointmentToEvent);
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
