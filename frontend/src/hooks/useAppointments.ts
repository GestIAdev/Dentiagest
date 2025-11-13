import { useState, useEffect } from 'react';
import { useApolloClient, useQuery, useMutation } from '@apollo/client/react';
import { useAuth } from '../context/AuthContext';
import { formatLocalDateTime, parseClinicDateTime } from '../utils/timezone';
import {
  GET_APPOINTMENTS_V3,
  CREATE_APPOINTMENT_V3,
  UPDATE_APPOINTMENT_V3,
  DELETE_APPOINTMENT_V3
} from '../graphql/queries/appointments';

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
  const client = useApolloClient();
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

  // ✅ GRAPHQL: GET - Listar todas las citas V3 con auditoria
  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🚀 GraphQL fetchAppointments - Starting V3 query with Four-Gate protection');
      
      // 🎯 GRAPHQL NUCLEAR FETCH - With audit trail
      const { data } = await client.query({
        query: GET_APPOINTMENTS_V3,
        variables: { limit: 100, offset: 0 },
        fetchPolicy: 'network-only' as any
      });
      
      console.log('🚀 GraphQL fetchAppointments - Response:', data);
      
      // Extraer array de appointments del response
      let appointmentsArray: Appointment[] = (data as any)?.appointmentsV3 || [];
      
      // 🏥 GUARDAR TODAS LAS CITAS (incluidas canceladas) para filtros
      const allAppointments = appointmentsArray.map((apt: any) => {
        // Mapear campos de GraphQL a formato local
        return {
          id: apt.id,
          patient_id: apt.patientId,
          dentist_id: apt.practitionerId,
          scheduled_date: apt.appointmentDate,
          duration_minutes: apt.duration,
          appointment_type: apt.type,
          priority: apt.priority || 'normal',
          title: apt.patient?.firstName ? `${apt.patient.firstName} ${apt.patient.lastName}` : 'Unnamed Patient',
          description: apt.notes,
          notes: apt.notes,
          status: apt.status,
          patient_name: apt.patient?.firstName ? `${apt.patient.firstName} ${apt.patient.lastName}` : 'Unnamed Patient',
          patient_phone: apt.patient?.phone,
          dentist_name: 'Dentist',
          created_at: apt.createdAt,
          updated_at: apt.updatedAt,
          _veritas: apt._veritas // Incluir datos de verification
        };
      });
      
      setAppointments(allAppointments);
      return allAppointments;
    } catch (err) {
      console.error('🚨 GraphQL fetchAppointments - Error:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // ✅ GRAPHQL: POST - Crear nueva cita V3 con Four-Gate security
  const createAppointment = async (appointmentData: Partial<Appointment>) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🚀 GraphQL createAppointment - Data:', appointmentData);
      
      // Mapear datos locales a formato GraphQL
      const graphqlInput = {
        patientId: appointmentData.patient_id,
        practitionerId: appointmentData.dentist_id,
        appointmentDate: appointmentData.scheduled_date,
        appointmentTime: appointmentData.scheduled_date, // Usar misma fecha para time
        duration: appointmentData.duration_minutes,
        type: appointmentData.appointment_type,
        status: appointmentData.status || 'scheduled',
        notes: appointmentData.notes
      };
      
      // 🎯 GRAPHQL MUTATION WITH FOUR-GATE PROTECTION
      const { data } = await client.mutate({
        mutation: CREATE_APPOINTMENT_V3,
        variables: { input: graphqlInput },
        refetchQueries: [{ query: GET_APPOINTMENTS_V3 }]
      });
      
      console.log('🚀 GraphQL createAppointment - Created:', data);
      
      // Mapear respuesta GraphQL a formato local
      const newAppointment: Appointment = {
        id: (data as any).createAppointmentV3.id,
        patient_id: appointmentData.patient_id || '',
        dentist_id: appointmentData.dentist_id || '',
        scheduled_date: (data as any).createAppointmentV3.appointmentDate,
        duration_minutes: (data as any).createAppointmentV3.duration,
        appointment_type: (data as any).createAppointmentV3.type,
        priority: (data as any).createAppointmentV3.priority || 'normal',
        title: appointmentData.title || '',
        notes: appointmentData.notes,
        status: (data as any).createAppointmentV3.status,
        patient_name: appointmentData.patient_name || '',
        dentist_name: appointmentData.dentist_name || '',
        created_at: (data as any).createAppointmentV3.createdAt,
        updated_at: (data as any).createAppointmentV3.updatedAt
      };
      
      setAppointments(prev => [...prev, newAppointment]);
      return newAppointment;
    } catch (err) {
      console.error('🚨 GraphQL createAppointment - Error:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ GRAPHQL: PUT - Actualizar cita V3 con Four-Gate security
  const updateAppointment = async (id: string, appointmentData: Partial<Appointment>) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🚀 GraphQL updateAppointment - ID:', id, 'Data:', appointmentData);
      
      // Mapear datos locales a formato GraphQL
      const graphqlInput = {
        ...(appointmentData.scheduled_date && { appointmentDate: appointmentData.scheduled_date }),
        ...(appointmentData.scheduled_date && { appointmentTime: appointmentData.scheduled_date }),
        ...(appointmentData.duration_minutes && { duration: appointmentData.duration_minutes }),
        ...(appointmentData.appointment_type && { type: appointmentData.appointment_type }),
        ...(appointmentData.status && { status: appointmentData.status }),
        ...(appointmentData.notes && { notes: appointmentData.notes })
      };
      
      // 🎯 GRAPHQL MUTATION WITH FOUR-GATE PROTECTION
      const { data } = await client.mutate({
        mutation: UPDATE_APPOINTMENT_V3,
        variables: { id, input: graphqlInput },
        refetchQueries: [{ query: GET_APPOINTMENTS_V3 }]
      });
      
      console.log('🚀 GraphQL updateAppointment - Updated:', data);
      
      // Mapear respuesta GraphQL a formato local
      const updatedAppointment: Appointment = {
        id: (data as any).updateAppointmentV3.id,
        patient_id: appointmentData.patient_id || '',
        dentist_id: appointmentData.dentist_id || '',
        scheduled_date: (data as any).updateAppointmentV3.appointmentDate,
        duration_minutes: appointmentData.duration_minutes || 0,
        appointment_type: appointmentData.appointment_type || '',
        priority: appointmentData.priority || 'normal',
        title: appointmentData.title || '',
        notes: appointmentData.notes,
        status: (data as any).updateAppointmentV3.status,
        patient_name: appointmentData.patient_name || '',
        dentist_name: appointmentData.dentist_name || '',
        created_at: appointmentData.created_at || '',
        updated_at: (data as any).updateAppointmentV3.updatedAt
      };
      
      setAppointments(prev => 
        prev.map(apt => apt.id === id ? updatedAppointment : apt)
      );
      return updatedAppointment;
    } catch (err) {
      console.error('🚨 GraphQL updateAppointment - Error:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ GRAPHQL: DELETE - Eliminar cita V3 con Four-Gate security
  const deleteAppointment = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🚀 GraphQL deleteAppointment - ID:', id);
      
      // 🎯 GRAPHQL MUTATION WITH FOUR-GATE PROTECTION
      await client.mutate({
        mutation: DELETE_APPOINTMENT_V3,
        variables: { id },
        refetchQueries: [{ query: GET_APPOINTMENTS_V3 }]
      });
      
      console.log('🚀 GraphQL deleteAppointment - Success for ID:', id);
      
      setAppointments(prev => prev.filter(apt => apt.id !== id));
    } catch (err) {
      console.error('🚨 GraphQL deleteAppointment - Error:', err);
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
  }, [state.accessToken, client]);

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

