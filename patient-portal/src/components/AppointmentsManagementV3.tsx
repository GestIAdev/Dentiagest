import React, { useEffect, useState } from 'react';
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { apolloClient } from '../config/apollo';
import { useAuthStore } from '../stores/authStore';
import {
  GET_PATIENT_APPOINTMENTS,
  type Appointment,
  type AppointmentStatus
} from '../graphql/appointments';

// ============================================================================
// COMPONENTE: APPOINTMENTS MANAGEMENT V3 - REAL DATA
// By PunkClaude - Directiva PRE-007 GeminiEnder
// NO MORE MOCKS - Conectado a appointmentsV3 de Selene
// ============================================================================

const AppointmentsManagementV3: React.FC = () => {
  const { auth } = useAuthStore();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'today' | 'history'>('upcoming');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // 📅 LOAD REAL APPOINTMENTS from Selene
  useEffect(() => {
    if (auth?.isAuthenticated && auth.patientId) {
      loadAppointments();
    }
  }, [auth]);

  const loadAppointments = async () => {
    if (!auth?.patientId) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data } = await apolloClient.query<{ appointmentsV3: Appointment[] }>({
        query: GET_PATIENT_APPOINTMENTS,
        variables: {
          patientId: auth.patientId,
          limit: 100
        },
        fetchPolicy: 'network-only'
      });

      if (data?.appointmentsV3) {
        setAppointments(data.appointmentsV3);
        console.log('✅ Appointments loaded:', data.appointmentsV3.length, 'records');
      }
    } catch (err) {
      console.error('❌ Error loading appointments:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar citas');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string): string => {
    // timeString is HH:MM:SS format, extract HH:MM
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  const getStatusIcon = (status: AppointmentStatus) => {
    switch (status) {
      case 'PENDING':
        return <ClockIcon className="w-5 h-5 text-neon-yellow" />;
      case 'CONFIRMED':
        return <CheckCircleIcon className="w-5 h-5 text-neon-green" />;
      case 'COMPLETED':
        return <CheckCircleIcon className="w-5 h-5 text-neon-blue" />;
      case 'CANCELLED':
        return <XCircleIcon className="w-5 h-5 text-red-400" />;
      case 'NO_SHOW':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      case 'REJECTED':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-cyber-light" />;
    }
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'PENDING':
        return 'border-neon-yellow bg-neon-yellow/10';
      case 'CONFIRMED':
        return 'border-neon-green bg-neon-green/10';
      case 'COMPLETED':
        return 'border-neon-blue bg-neon-blue/10';
      case 'CANCELLED':
      case 'REJECTED':
        return 'border-red-400 bg-red-900/20';
      case 'NO_SHOW':
        return 'border-red-500 bg-red-900/30';
      default:
        return 'border-cyber-light bg-cyber-gray';
    }
  };

  const getStatusLabel = (status: AppointmentStatus) => {
    const labels = {
      'PENDING': 'Pendiente',
      'CONFIRMED': 'Confirmada',
      'REJECTED': 'Rechazada',
      'CANCELLED': 'Cancelada',
      'COMPLETED': 'Completada',
      'NO_SHOW': 'No Asistió',
      'FOLLOWUP': 'Seguimiento'
    };
    return labels[status] || status;
  };

  // Filter appointments by date
  const today = new Date().toISOString().split('T')[0];
  const now = Date.now();
  
  const upcomingAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointmentDate + 'T' + apt.appointmentTime);
    return aptDate.getTime() > now && apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED';
  });

  const todayAppointments = appointments.filter(apt => 
    apt.appointmentDate === today && apt.status !== 'COMPLETED'
  );

  const completedAppointments = appointments.filter(apt => 
    apt.status === 'COMPLETED' || apt.status === 'NO_SHOW'
  );

  const renderAppointmentCard = (appointment: Appointment) => {
    return (
      <div
        key={appointment.id}
        className={`bg-cyber-gray rounded-lg p-6 border ${getStatusColor(appointment.status)} hover:border-neon-cyan transition-all duration-300 cursor-pointer group`}
        onClick={() => setSelectedAppointment(appointment)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            {getStatusIcon(appointment.status)}
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-white group-hover:text-neon-cyan transition-colors">
                {appointment.type}
              </h3>
              <p className="text-sm text-cyber-light">{getStatusLabel(appointment.status)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-cyber-light">{appointment.duration} min</p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm">
            <CalendarIcon className="w-4 h-4 text-cyber-light mr-2" />
            <span className="text-white">{formatDate(appointment.appointmentDate)}</span>
          </div>
          <div className="flex items-center text-sm">
            <ClockIcon className="w-4 h-4 text-cyber-light mr-2" />
            <span className="text-white">{formatTime(appointment.appointmentTime)}</span>
          </div>
          {appointment.practitionerId && (
            <div className="flex items-center text-sm">
              <UserIcon className="w-4 h-4 text-cyber-light mr-2" />
              <span className="text-cyber-light">Dr. {appointment.practitionerId}</span>
            </div>
          )}
        </div>

        {appointment.notes && (
          <p className="text-sm text-cyber-light italic mb-4">
            "{appointment.notes}"
          </p>
        )}

        {appointment.treatmentDetails && (
          <p className="text-xs text-cyan-400 mb-4">
            {appointment.treatmentDetails}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {appointment.status === 'PENDING' && (
              <>
                <button className="px-3 py-1 text-xs bg-neon-green/20 text-neon-green border border-neon-green rounded hover:bg-neon-green/30 transition-colors">
                  Confirmar
                </button>
                <button className="px-3 py-1 text-xs bg-red-500/20 text-red-400 border border-red-400 rounded hover:bg-red-500/30 transition-colors">
                  Cancelar
                </button>
              </>
            )}
            {appointment.status === 'CONFIRMED' && (
              <button className="px-3 py-1 text-xs bg-neon-blue/20 text-neon-blue border border-neon-blue rounded hover:bg-neon-blue/30 transition-colors">
                Modificar
              </button>
            )}
          </div>

          <div className="text-xs text-cyber-light">
            ID: {appointment.id.substring(0, 8)}
          </div>
        </div>
      </div>
    );
  };

  if (!auth?.isAuthenticated) {
    return (
      <div className="min-h-screen bg-cyber-black flex items-center justify-center">
        <div className="text-center">
          <ClockIcon className="w-16 h-16 text-neon-cyan mx-auto mb-4 animate-pulse-neon" />
          <h2 className="text-2xl font-bold text-neon-cyan mb-2">Acceso Requerido</h2>
          <p className="text-cyber-light">Inicia sesión para gestionar tus citas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-gradient text-white">
      {/* Header */}
      <div className="bg-cyber-dark border-b border-neon-cyan/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-cyan to-neon-blue bg-clip-text text-transparent">
                Gestión de Citas
              </h1>
              <p className="text-cyber-light mt-1">Sistema de Tiempo Real - Titan V3</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowBookingModal(true)}
                className="bg-neon-cyan hover:bg-neon-cyan/80 text-cyber-black px-6 py-3 rounded-lg font-bold transition-colors flex items-center"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Nueva Cita
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex flex-col sm:flex-row gap-1 sm:gap-0 sm:space-x-1 mb-6 sm:mb-8 bg-cyber-dark p-1 rounded-lg">
          {[
            { key: 'upcoming', label: 'Próximas', count: upcomingAppointments.length },
            { key: 'today', label: 'Hoy', count: todayAppointments.length },
            { key: 'history', label: 'Historial', count: completedAppointments.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-300 text-sm sm:text-base ${
                activeTab === tab.key
                  ? 'bg-neon-cyan text-cyber-black shadow-neon-cyan'
                  : 'text-cyber-light hover:bg-cyber-light hover:text-white'
              }`}
            >
              <span className="block sm:hidden">{tab.label.split(' ')[0]}</span>
              <span className="hidden sm:block">{tab.label}</span>
              <span className="ml-1">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan"></div>
            <span className="ml-4 text-neon-cyan">Cargando citas en tiempo real...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-400">{error}</span>
            </div>
          </div>
        )}

        {/* Appointments Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {activeTab === 'upcoming' && upcomingAppointments.map(renderAppointmentCard)}
          {activeTab === 'today' && todayAppointments.map(renderAppointmentCard)}
          {activeTab === 'history' && completedAppointments.map(renderAppointmentCard)}
        </div>

        {/* Empty States */}
        {!isLoading && (
          <>
            {activeTab === 'upcoming' && upcomingAppointments.length === 0 && (
              <div className="text-center py-12">
                <CalendarIcon className="w-16 h-16 text-cyber-light mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No hay citas próximas</h3>
                <p className="text-cyber-light mb-6">
                  Programa tu próxima visita dental
                </p>
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="bg-neon-cyan hover:bg-neon-cyan/80 text-cyber-black px-6 py-3 rounded-lg font-bold transition-colors"
                >
                  Agendar Cita
                </button>
              </div>
            )}

            {activeTab === 'today' && todayAppointments.length === 0 && (
              <div className="text-center py-12">
                <CheckCircleIcon className="w-16 h-16 text-neon-green mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Sin citas para hoy</h3>
                <p className="text-cyber-light">
                  ¡Disfruta tu día libre!
                </p>
              </div>
            )}

            {activeTab === 'history' && completedAppointments.length === 0 && (
              <div className="text-center py-12">
                <ClockIcon className="w-16 h-16 text-cyber-light mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Sin historial</h3>
                <p className="text-cyber-light">
                  Tus citas completadas aparecerán aquí
                </p>
              </div>
            )}
          </>
        )}

        {/* Real-time Status Indicator */}
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-cyber-dark border border-neon-cyan rounded-lg p-2 sm:p-4 shadow-neon-cyan">
          <div className="flex items-center">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-neon-green rounded-full animate-pulse mr-2 sm:mr-3"></div>
            <span className="text-xs sm:text-sm text-neon-cyan font-mono">TIEMPO REAL</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsManagementV3;