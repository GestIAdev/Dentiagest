// 🗓️ APPOINTMENTS PAGE - UNIFIED V3
// Date: November 9, 2025
// Mission: Merge "Agenda" + "Citas Avanzadas" into single beautiful page
// Architecture: GraphQL V3 + CustomCalendar + Design System

import React, { useState } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client/react';

// 🎯 GRAPHQL V3 OPERATIONS
import {
  GET_APPOINTMENTS_V3,
  CREATE_APPOINTMENT_V3,
  UPDATE_APPOINTMENT_V3,
  DELETE_APPOINTMENT
} from '../graphql/queries/appointments';

// 🔔 REAL-TIME SUBSCRIPTIONS (TODO: Create subscription file)
// import { APPOINTMENT_V3_CREATED } from '../graphql/subscriptions';

// 🎨 DESIGN SYSTEM
import { Button } from '../design-system/Button';
import { Card, CardHeader, CardBody } from '../design-system/Card';
import { Badge } from '../design-system/Badge';

// 📅 CUSTOM CALENDAR (Beautiful UI)
import CalendarContainer from '../components/CustomCalendar/CalendarContainerSimple';

// 📊 APPOINTMENT COMPONENTS (V3 GraphQL)
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

  // 🔌 GRAPHQL V3 QUERY
  const { data, loading, error, refetch } = useQuery(GET_APPOINTMENTS_V3, {
    variables: {
      limit: 100,
      offset: 0
    },
    fetchPolicy: 'cache-and-network'
  });

  // 🎯 MUTATIONS
  const [createAppointment] = useMutation(CREATE_APPOINTMENT_V3);
  const [updateAppointment] = useMutation(UPDATE_APPOINTMENT_V3);
  const [deleteAppointment] = useMutation(DELETE_APPOINTMENT);

  // 📊 DATA EXTRACTION
  const appointments = (data as any)?.appointmentsV3 || [];

  // 🎨 RENDER LOADING
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // 🎨 RENDER ERROR
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card variant="elevated" className="max-w-md">
          <CardHeader>
            <h2 className="text-xl font-bold text-red-600">Error al cargar citas</h2>
          </CardHeader>
          <CardBody>
            <p className="text-gray-600">{error.message}</p>
            <Button variant="primary" onClick={() => refetch()} className="mt-4">
              Reintentar
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  // 🎨 RENDER MAIN UI
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 📱 HEADER */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                📅 Citas
              </h1>
              <Badge variant="info" size="sm">
                {appointments.length} citas
              </Badge>
            </div>

            {/* 🎨 VIEW SWITCHER */}
            <div className="flex space-x-2">
              <Button
                variant={view === 'calendar' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setView('calendar')}
              >
                📅 Calendario
              </Button>
              <Button
                variant={view === 'list' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setView('list')}
              >
                📋 Lista
              </Button>
              <Button
                variant={view === 'stats' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setView('stats')}
              >
                📊 Estadísticas
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 📊 MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 📅 CALENDAR VIEW */}
        {view === 'calendar' && (
          <div className="bg-white rounded-lg shadow-sm">
            {/* TODO Phase 2: Pass GraphQL data to CustomCalendar */}
            <CalendarContainer />
            <div className="p-4 text-center text-gray-500">
              📅 CustomCalendar integration - Phase 2 (next task)
            </div>
          </div>
        )}

        {/* 📋 LIST VIEW */}
        {view === 'list' && (
          <Card variant="elevated">
            <CardHeader>
              <h2 className="text-xl font-bold">Lista de Citas</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {appointments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No hay citas programadas
                  </p>
                ) : (
                  appointments.map((appointment: Appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div>
                        <h3 className="font-semibold">
                          {appointment.patient?.firstName} {appointment.patient?.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {appointment.appointmentDate} - {appointment.appointmentTime}
                        </p>
                        <p className="text-sm text-gray-500">
                          {appointment.type}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getStatusVariant(appointment.status)}>
                          {appointment.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardBody>
          </Card>
        )}

        {/* 📊 STATISTICS VIEW */}
        {view === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="elevated">
              <CardBody>
                <h3 className="text-lg font-semibold text-gray-700">Hoy</h3>
                <p className="text-3xl font-bold text-primary-600">
                  {getTodayAppointments(appointments).length}
                </p>
                <p className="text-sm text-gray-500">citas programadas</p>
              </CardBody>
            </Card>

            <Card variant="elevated">
              <CardBody>
                <h3 className="text-lg font-semibold text-gray-700">Esta Semana</h3>
                <p className="text-3xl font-bold text-primary-600">
                  {getThisWeekAppointments(appointments).length}
                </p>
                <p className="text-sm text-gray-500">citas programadas</p>
              </CardBody>
            </Card>

            <Card variant="elevated">
              <CardBody>
                <h3 className="text-lg font-semibold text-gray-700">Completadas</h3>
                <p className="text-3xl font-bold text-green-600">
                  {getCompletedAppointments(appointments).length}
                </p>
                <p className="text-sm text-gray-500">este mes</p>
              </CardBody>
            </Card>
          </div>
        )}
      </main>
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

function getTodayAppointments(appointments: Appointment[]): Appointment[] {
  const today = new Date().toISOString().split('T')[0];
  return appointments.filter(apt => apt.appointmentDate === today);
}

function getThisWeekAppointments(appointments: Appointment[]): Appointment[] {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return appointments.filter(apt => {
    const aptDate = new Date(apt.appointmentDate);
    return aptDate >= weekStart && aptDate <= weekEnd;
  });
}

function getCompletedAppointments(appointments: Appointment[]): Appointment[] {
  return appointments.filter(apt => apt.status === 'completed');
}

export default AppointmentsPage;
