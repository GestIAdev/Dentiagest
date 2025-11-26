// 🗓️ APPOINTMENTS PAGE - UNIFIED V3
// Date: November 9, 2025
// Mission: Merge "Agenda" + "Citas Avanzadas" into single beautiful page
// Architecture: GraphQL V3 + CustomCalendar + Design System

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client/react';

// 🎯 GRAPHQL V3 OPERATIONS
import {
  GET_APPOINTMENTS_V3,
  CREATE_APPOINTMENT_V3,
  UPDATE_APPOINTMENT_V3,
  DELETE_APPOINTMENT
} from '../graphql/queries/appointments';

// 🔔 REAL-TIME SUBSCRIPTIONS - PHASE 4
import { APPOINTMENT_UPDATES } from '../graphql/subscriptions';

// 🎨 DESIGN SYSTEM
import { Badge } from '../design-system/Badge';

// 📅 CUSTOM CALENDAR (Beautiful UI)
import CalendarContainer from '../components/CustomCalendar/CalendarContainerSimple';

// 🔥 GRAPHQL V3 ADAPTER
import { 
  GraphQLCalendarAdapter,
  type GraphQLAppointmentV3 
} from '../components/CustomCalendar/adapters/graphqlAdapter';
import type { AppointmentData } from '../components/CustomCalendar/AppointmentCard';

// 🎨 EDIT APPOINTMENT MODAL V3
import { EditAppointmentModalV3 } from '../components/Appointments/EditAppointmentModalV3';

// � APPOINTMENT FORM SHEET - STANDARD DE ORO V4
import AppointmentFormSheet from '../components/Forms/AppointmentFormSheet';

// �📊 APPOINTMENT COMPONENTS (V3 GraphQL)
// Note: We'll extract list view from AppointmentManagementV3
// For now, we use the calendar as primary view

// 🎯 TYPES
interface Appointment {
  id: string;
  patientId: string;
  patient?: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  type: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  treatmentDetails?: string;
}

// 🎨 VIEW TYPES
type ViewMode = 'calendar' | 'list' | 'stats';

// 🏗️ MAIN COMPONENT
const AppointmentsPage: React.FC = () => {
  // 📊 STATE
  const [view, setView] = useState<ViewMode>('calendar');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [realtimeNotification, setRealtimeNotification] = useState<string | null>(null);
  
  // 🔥 APPOINTMENT FORM SHEET STATE - V4
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetAppointment, setSheetAppointment] = useState<any | null>(null);
  const [prefilledDate, setPrefilledDate] = useState<Date | undefined>(undefined);
  const [prefilledTime, setPrefilledTime] = useState<string | undefined>(undefined);

  // 🔌 GRAPHQL V3 QUERY
  const { data, loading, error, refetch } = useQuery(GET_APPOINTMENTS_V3, {
    variables: {
      limit: 100,
      offset: 0
    },
    fetchPolicy: 'cache-and-network'
  });

  // 🔔 REAL-TIME WEBSOCKET SUBSCRIPTION - PHASE 4
  const { data: subscriptionData } = useSubscription(APPOINTMENT_UPDATES, {
    variables: {
      clinicId: undefined, // TODO: Get from user context
      dentistId: undefined
    }
  });

  // 📡 REAL-TIME UPDATE EFFECT - Auto-refetch on subscription event
  useEffect(() => {
    if (subscriptionData && (subscriptionData as any)?.appointmentUpdates) {
      const update = (subscriptionData as any).appointmentUpdates;
      console.log('🔔 Real-time appointment update received:', update.action, update.appointment);
      
      // Show toast notification
      const actionText: Record<string, string> = {
        'CREATED': 'creada',
        'UPDATED': 'actualizada',
        'DELETED': 'eliminada',
        'CONFIRMED': 'confirmada',
        'COMPLETED': 'completada',
        'CANCELLED': 'cancelada'
      };

      const message = `✨ Cita ${actionText[update.action] || 'modificada'}: ${update.appointment?.patientName || 'Sin nombre'}`;
      console.log(message);
      
      // Show realtime notification badge
      setRealtimeNotification(message);
      setTimeout(() => setRealtimeNotification(null), 5000); // Hide after 5s
      
      // Refetch to update calendar
      refetch();
    }
  }, [subscriptionData, refetch]);

  // 🎯 MUTATIONS
  const [createAppointment] = useMutation(CREATE_APPOINTMENT_V3);
  const [updateAppointment] = useMutation(UPDATE_APPOINTMENT_V3);
  const [deleteAppointment] = useMutation(DELETE_APPOINTMENT);

  // 📊 DATA EXTRACTION + ADAPTER
  const rawAppointments: GraphQLAppointmentV3[] = (data as any)?.appointmentsV3 || [];
  
  // 🔥 CONVERT GRAPHQL V3 → CALENDAR FORMAT
  const calendarAppointments: AppointmentData[] = GraphQLCalendarAdapter.toCalendarArray(
    rawAppointments
  );

  // � MODAL HANDLERS
  const handleAppointmentClick = (appointment: AppointmentData) => {
    setSelectedAppointment(appointment);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleTimeSlotClick = (date: Date, time: string) => {
    // 🔥 V4 - Open Sheet with prefilled date/time
    setSheetAppointment(null); // Create mode
    setPrefilledDate(date);
    setPrefilledTime(time);
    setSheetOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleModalSuccess = () => {
    refetch(); // Refresh appointments list
  };
  
  // 🔥 SHEET HANDLERS - V4 STANDARD DE ORO
  const handleCreateAppointment = () => {
    setSheetAppointment(null);
    setPrefilledDate(undefined);
    setPrefilledTime(undefined);
    setSheetOpen(true);
  };
  
  const handleEditAppointment = (appointment: any) => {
    setSheetAppointment(appointment);
    setSheetOpen(true);
  };
  
  const handleSheetClose = () => {
    setSheetOpen(false);
    setSheetAppointment(null);
    setPrefilledDate(undefined);
    setPrefilledTime(undefined);
  };
  
  const handleSheetSave = () => {
    refetch(); // Refresh appointments from GraphQL
  };

  // 🎨 RENDER LOADING - CYBERPUNK
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-transparent">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  // 🎨 RENDER ERROR - CYBERPUNK
  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-transparent">
        <div className="bg-slate-900/80 backdrop-blur-sm border border-red-500/50 rounded-lg p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-400 mb-4">Error al cargar citas</h2>
          <p className="text-slate-400 mb-6">{error.message}</p>
          <button 
            onClick={() => refetch()} 
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // 🎨 RENDER MAIN UI - FULL BLEED CYBERPUNK
  return (
    <div className="h-full flex flex-col overflow-hidden bg-transparent">
      {/* 🔔 REAL-TIME NOTIFICATION TOAST */}
      {realtimeNotification && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
            <span className="text-xl">🔔</span>
            <span className="font-medium">{realtimeNotification}</span>
          </div>
        </div>
      )}

      {/* 📱 COMPACT HEADER - INTEGRATED CYBERPUNK */}
      <header className="flex-shrink-0 bg-slate-900/60 backdrop-blur-sm border-b border-purple-500/20 px-4 py-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              📅 Citas
            </h1>
            <Badge variant="info" size="sm">
              {rawAppointments.length} citas
            </Badge>
            
            {/* 🔥 BOTÓN NUEVA CITA - V4 */}
            <button
              onClick={handleCreateAppointment}
              className="ml-2 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center space-x-1"
            >
              <span>+</span>
              <span>Nueva Cita</span>
            </button>
          </div>

          {/* 🎨 VIEW SWITCHER - COMPACT */}
          <div className="flex space-x-1 bg-slate-900/60 rounded-lg p-1 border border-purple-500/20">
            <button
              onClick={() => setView('calendar')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                view === 'calendar' 
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-purple-500/25' 
                  : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              📅 Calendario
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                view === 'list' 
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-purple-500/25' 
                  : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              📋
            </button>
            <button
              onClick={() => setView('stats')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                view === 'stats' 
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-purple-500/25' 
                  : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              📊
            </button>
          </div>
        </div>
      </header>

      {/* 📊 MAIN CONTENT - FULL BLEED */}
      <main className="flex-1 overflow-hidden">
        {/* 📅 CALENDAR VIEW - FULL HEIGHT */}
        {view === 'calendar' && (
          <div className="h-full">
            <CalendarContainer 
              onAppointmentClick={handleAppointmentClick}
              onTimeSlotClick={handleTimeSlotClick}
              onAppointmentUpdate={() => refetch()}
              className="h-full"
            />
          </div>
        )}

        {/* 📋 LIST VIEW - CYBERPUNK */}
        {view === 'list' && (
          <div className="p-4 overflow-y-auto h-full">
            <div className="bg-slate-900/60 backdrop-blur-sm rounded-lg border border-purple-500/20 p-4">
              <h2 className="text-xl font-bold text-cyan-400 mb-4">Lista de Citas</h2>
              <div className="space-y-3">
                {rawAppointments.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">
                    No hay citas programadas
                  </p>
                ) : (
                  rawAppointments.map((appointment) => {
                    const calendarApt = GraphQLCalendarAdapter.toCalendar(appointment);
                    
                    return (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 bg-slate-800/60 border border-slate-700 rounded-lg hover:border-purple-500/50 transition-all cursor-pointer"
                        onClick={() => handleAppointmentClick(calendarApt)}
                      >
                        <div>
                          <h3 className="font-semibold text-slate-200">
                            {appointment.patient?.firstName} {appointment.patient?.lastName}
                          </h3>
                          <p className="text-sm text-slate-400">
                            {appointment.appointmentDate} - {appointment.appointmentTime}
                          </p>
                          <p className="text-sm text-cyan-400/70">
                            {appointment.type}
                          </p>
                        </div>
                        <Badge variant={getStatusVariant(appointment.status as any)}>
                          {appointment.status}
                        </Badge>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* 📊 STATISTICS VIEW - CYBERPUNK */}
        {view === 'stats' && (
          <div className="p-4 overflow-y-auto h-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/60 backdrop-blur-sm rounded-lg border border-purple-500/20 p-6">
                <h3 className="text-lg font-semibold text-slate-400">Hoy</h3>
                <p className="text-4xl font-bold text-cyan-400">
                  {getTodayAppointments(rawAppointments).length}
                </p>
                <p className="text-sm text-slate-500">citas programadas</p>
              </div>

              <div className="bg-slate-900/60 backdrop-blur-sm rounded-lg border border-purple-500/20 p-6">
                <h3 className="text-lg font-semibold text-slate-400">Esta Semana</h3>
                <p className="text-4xl font-bold text-purple-400">
                  {getThisWeekAppointments(rawAppointments).length}
                </p>
                <p className="text-sm text-slate-500">citas programadas</p>
              </div>

              <div className="bg-slate-900/60 backdrop-blur-sm rounded-lg border border-purple-500/20 p-6">
                <h3 className="text-lg font-semibold text-slate-400">Completadas</h3>
                <p className="text-4xl font-bold text-emerald-400">
                  {getCompletedAppointments(rawAppointments).length}
                </p>
                <p className="text-sm text-slate-500">este mes</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 🎨 EDIT/CREATE MODAL */}
      <EditAppointmentModalV3
        isOpen={modalOpen}
        onClose={handleModalClose}
        appointment={selectedAppointment || undefined}
        onSuccess={handleModalSuccess}
        mode={modalMode}
      />
      
      {/* 🔥 APPOINTMENT FORM SHEET - V4 STANDARD DE ORO */}
      <AppointmentFormSheet
        appointment={sheetAppointment}
        isOpen={sheetOpen}
        onClose={handleSheetClose}
        onSave={handleSheetSave}
        prefilledDate={prefilledDate}
        prefilledTime={prefilledTime}
      />
    </div>
  );
};

// 🎯 HELPER FUNCTIONS

function getStatusVariant(status: string): 'default' | 'success' | 'warning' | 'error' | 'info' {
  switch (status) {
    case 'confirmed':
    case 'completed':
      return 'success';
    case 'in_progress':
      return 'warning';
    case 'cancelled':
    case 'no_show':
      return 'error';
    default:
      return 'info';
  }
}

function getTodayAppointments(rawAppts: GraphQLAppointmentV3[]): GraphQLAppointmentV3[] {
  const today = new Date().toISOString().split('T')[0];
  return rawAppts.filter(apt => apt.appointmentDate === today);
}

function getThisWeekAppointments(rawAppts: GraphQLAppointmentV3[]): GraphQLAppointmentV3[] {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return rawAppts.filter(apt => {
    const aptDate = new Date(apt.appointmentDate);
    return aptDate >= weekStart && aptDate <= weekEnd;
  });
}

function getCompletedAppointments(rawAppts: GraphQLAppointmentV3[]): GraphQLAppointmentV3[] {
  return rawAppts.filter(apt => apt.status === 'completed');
}

export default AppointmentsPage;
