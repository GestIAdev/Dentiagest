import React, { useEffect, useState } from 'react';
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useAppointmentsStore, APPOINTMENT_TYPES, type DentalAppointment } from '../stores/appointmentsStore';
import { useAuthStore } from '../stores/authStore';

// ============================================================================
// COMPONENTE: APPOINTMENTS MANAGEMENT V3 - REAL-TIME
// ============================================================================

const AppointmentsManagementV3: React.FC = () => {
  const { auth } = useAuthStore();
  const {
    appointments,
    availableSlots,
    isLoading,
    error,
    setAppointments,
    getUpcomingAppointments,
    getTodayAppointments,
    setLoading,
    setError,
  } = useAppointmentsStore();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'today' | 'history'>('upcoming');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<DentalAppointment | null>(null);

  // Mock data loading (replace with GraphQL subscription)
  useEffect(() => {
    if (auth?.isAuthenticated) {
      setLoading(true);
      // Simulate loading appointments from Apollo Nuclear
      setTimeout(() => {
        const mockAppointments: DentalAppointment[] = [
          {
            id: 'apt-001',
            patientId: auth.patientId,
            clinicId: auth.clinicId,
            dentistId: 'dentist-001',
            serviceType: 'cleaning',
            status: 'scheduled',
            scheduledDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
            duration: 60,
            price: 150,
            currency: 'ARS',
            notes: 'Limpieza rutinaria',
            isEmergency: false,
            reminderSent: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'apt-002',
            patientId: auth.patientId,
            clinicId: auth.clinicId,
            dentistId: 'dentist-002',
            serviceType: 'checkup',
            status: 'confirmed',
            scheduledDate: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
            duration: 30,
            price: 100,
            currency: 'ARS',
            notes: 'Control post limpieza',
            isEmergency: false,
            reminderSent: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'apt-003',
            patientId: auth.patientId,
            clinicId: auth.clinicId,
            dentistId: 'dentist-001',
            serviceType: 'cleaning',
            status: 'completed',
            scheduledDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            duration: 60,
            price: 150,
            currency: 'ARS',
            notes: 'Limpieza completada exitosamente',
            isEmergency: false,
            reminderSent: true,
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ];
        setAppointments(mockAppointments);
        setLoading(false);
      }, 1000);
    }
  }, [auth, setAppointments, setLoading]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency === 'ARS' ? 'ARS' : 'USD',
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <ClockIcon className="w-5 h-5 text-neon-yellow" />;
      case 'confirmed':
        return <CheckCircleIcon className="w-5 h-5 text-neon-green" />;
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-neon-blue" />;
      case 'cancelled':
        return <XCircleIcon className="w-5 h-5 text-red-400" />;
      case 'no-show':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-cyber-light" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'border-neon-yellow bg-neon-yellow/10';
      case 'confirmed':
        return 'border-neon-green bg-neon-green/10';
      case 'completed':
        return 'border-neon-blue bg-neon-blue/10';
      case 'cancelled':
        return 'border-red-400 bg-red-900/20';
      case 'no-show':
        return 'border-red-500 bg-red-900/30';
      default:
        return 'border-cyber-light bg-cyber-gray';
    }
  };

  const getServiceTypeInfo = (serviceType: string) => {
    return APPOINTMENT_TYPES.find(type => type.id === serviceType) || APPOINTMENT_TYPES[0];
  };

  const upcomingAppointments = getUpcomingAppointments();
  const todayAppointments = getTodayAppointments();
  const completedAppointments = appointments.filter(apt => apt.status === 'completed');

  const renderAppointmentCard = (appointment: DentalAppointment) => {
    const serviceInfo = getServiceTypeInfo(appointment.serviceType);

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
                {serviceInfo.name}
              </h3>
              <p className="text-sm text-cyber-light capitalize">{appointment.status.replace('-', ' ')}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-neon-cyan">
              {formatCurrency(appointment.price, appointment.currency)}
            </p>
            <p className="text-xs text-cyber-light">{appointment.duration} min</p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm">
            <CalendarIcon className="w-4 h-4 text-cyber-light mr-2" />
            <span className="text-white">{formatDate(appointment.scheduledDate)}</span>
          </div>
          <div className="flex items-center text-sm">
            <ClockIcon className="w-4 h-4 text-cyber-light mr-2" />
            <span className="text-white">{formatTime(appointment.scheduledDate)}</span>
          </div>
          <div className="flex items-center text-sm">
            <UserIcon className="w-4 h-4 text-cyber-light mr-2" />
            <span className="text-cyber-light">Dr. {appointment.dentistId.split('-')[1]}</span>
          </div>
        </div>

        {appointment.notes && (
          <p className="text-sm text-cyber-light italic mb-4">
            "{appointment.notes}"
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {appointment.status === 'scheduled' && (
              <>
                <button className="px-3 py-1 text-xs bg-neon-green/20 text-neon-green border border-neon-green rounded hover:bg-neon-green/30 transition-colors">
                  Confirmar
                </button>
                <button className="px-3 py-1 text-xs bg-red-500/20 text-red-400 border border-red-400 rounded hover:bg-red-500/30 transition-colors">
                  Cancelar
                </button>
              </>
            )}
            {appointment.status === 'confirmed' && (
              <button className="px-3 py-1 text-xs bg-neon-blue/20 text-neon-blue border border-neon-blue rounded hover:bg-neon-blue/30 transition-colors">
                Modificar
              </button>
            )}
          </div>

          {appointment.reminderSent && (
            <div className="flex items-center text-xs text-neon-green">
              <CheckCircleIcon className="w-3 h-3 mr-1" />
              Recordatorio enviado
            </div>
          )}
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