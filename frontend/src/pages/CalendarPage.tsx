import React, { useState, useEffect } from 'react';
import CreateAppointmentModal from '../components/CreateAppointmentModal.tsx';
import EditAppointmentModal from '../components/EditAppointmentModal.tsx';
import { useAppointments } from '../hooks/useAppointments.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { usePatients } from '../hooks/usePatients.ts';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

// 🎨 COLORES DE ESTADO PROFESIONALES
const STATUS_COLORS = {
  scheduled: { bg: '#3b82f6', border: '#2563eb' },
  confirmed: { bg: '#10b981', border: '#059669' },
  in_progress: { bg: '#f59e0b', border: '#d97706' },
  completed: { bg: '#6b7280', border: '#4b5563' },
  cancelled: { bg: '#ef4444', border: '#dc2626' },
  no_show: { bg: '#8b5cf6', border: '#7c3aed' }
};

const CalendarPage = () => {
  const {
    appointments,
    loading,
    error,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getCalendarEvents,
    fetchAppointments
  } = useAppointments();

  // 🎯 ESTADOS DE MODALES
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // 📊 ESTADÍSTICAS DINÁMICAS
  const today = new Date().toISOString().split('T')[0];
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay() + 1);
  const thisWeekEnd = new Date(thisWeekStart);
  thisWeekEnd.setDate(thisWeekStart.getDate() + 6);

  // 🔍 FILTROS - DEFENSIVE PROGRAMMING
  // Filtrado profesional usando datos de la API
  const filteredAppointments = (appointments || []).filter(appointment => {
    const matchesSearch = appointment.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 🏥 FILTRO INTELIGENTE DE ESTADOS (case-insensitive)
    let matchesStatus = true;
    if (statusFilter === 'all') {
      // "all" muestra solo citas activas (no canceladas)
      matchesStatus = appointment.status?.toLowerCase() !== 'cancelled';
    } else {
      // Filtros específicos muestran el estado exacto
      matchesStatus = appointment.status?.toLowerCase() === statusFilter.toLowerCase();
    }
    
    return matchesSearch && matchesStatus;
  });

  // 🎯 HANDLERS PERFECTOS
  const handleDateClick = (selectInfo: any) => {
    setShowCreateModal(true);
  };

  const handleEventClick = (clickInfo: any) => {
    setSelectedAppointment(clickInfo.event);
    setShowEditModal(true);
  };

  const handleCreateAppointment = async (newAppointment: any) => {
    await createAppointment(newAppointment);
    setShowCreateModal(false);
  };

  const handleUpdateAppointment = async (appointmentId: string, appointmentData: any) => {
    try {
      await updateAppointment(appointmentId, appointmentData);
      setShowEditModal(false);
      // Recargar citas para reflejar cambios
      await fetchAppointments();
    } catch (error: any) {
      console.error('❌ Error al actualizar cita:', error);
      
      if (error?.response?.status === 404) {
        alert('⚠️ CITA NO ENCONTRADA\n\nLa cita que intentas actualizar ya no existe.');
      } else if (error?.response?.status === 403) {
        alert('⚠️ SIN PERMISOS\n\nNo tienes permisos para actualizar esta cita.');
      } else if (error?.response?.status === 409) {
        alert('⚠️ CONFLICTO DE HORARIOS\n\nYa existe una cita programada para ese horario.');
      } else {
        alert(`❌ Error al actualizar la cita: ${error?.message || 'Error desconocido'}\n\nRevisa la consola para más detalles.`);
      }
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    try {
      await deleteAppointment(id);
      setShowEditModal(false);
    } catch (error: any) {
      console.error('❌ Error al eliminar cita:', error);
      
      // 🚨 MANEJO ESPECÍFICO DE ERRORES DE ELIMINACIÓN
      if (error?.response?.status === 404) {
        alert('⚠️ CITA NO ENCONTRADA\n\nLa cita que intentas eliminar ya no existe o fue eliminada anteriormente.');
      } else if (error?.response?.status === 403) {
        alert('⚠️ SIN PERMISOS\n\nNo tienes permisos para eliminar esta cita.');
      } else {
        alert(`❌ Error al eliminar la cita: ${error?.message || 'Error desconocido'}\n\nRevisa la consola para más detalles.`);
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 🦷 HEADER ÉPICO */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
            <span className="text-white text-2xl">🦷</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Agenda Dental
            </h1>
            <p className="text-gray-600">Gestión profesional de citas</p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
        >
          <span className="text-xl">➕</span>
          <span>Nueva Cita</span>
        </button>
      </div>

      {/* 🔍 FILTROS AVANZADOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 Buscar paciente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        >
          <option value="all">📋 Todos los estados</option>
          <option value="scheduled">📅 Programadas</option>
          <option value="confirmed">✅ Confirmadas</option>
          <option value="in_progress">⏳ En progreso</option>
          <option value="completed">✅ Completadas</option>
          <option value="cancelled">❌ Canceladas</option>
        </select>
      </div>

      {/* 📅 CALENDARIO ÉPICO */}
      <div className="flex-1 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="p-6" style={{ height: '500px' }}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            buttonText={{
              today: 'Hoy',
              month: 'Mes',
              week: 'Semana',
              day: 'Día'
            }}
            events={getCalendarEvents()}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            editable={true}
            eventDrop={async (info) => {
              const apt = appointments.find(apt => apt.id === info.event.id);
              if (!apt) return;
              const updated = {
                ...apt,
                scheduled_date: info.event.startStr,
                duration_minutes: (new Date(info.event.endStr).getTime() - new Date(info.event.startStr).getTime()) / 60000
              };
              await updateAppointment(updated.id, updated);
            }}
            eventResize={async (info) => {
              const apt = appointments.find(apt => apt.id === info.event.id);
              if (!apt) return;
              const updated = {
                ...apt,
                scheduled_date: info.event.startStr,
                duration_minutes: (new Date(info.event.endStr).getTime() - new Date(info.event.startStr).getTime()) / 60000
              };
              await updateAppointment(updated.id, updated);
            }}
            eventContent={(eventInfo) => {
              const priorityIcon = {
                'urgent': '🔴',
                'high': '🟠',
                'normal': '🟢',
                'low': '🔵'
              }[eventInfo.event.extendedProps?.priority] || '🟢';
              
              return (
                <div className="flex items-center space-x-1 p-1 text-xs">
                  <span>{priorityIcon}</span>
                  <span className="font-medium truncate">
                    {eventInfo.event.title}
                  </span>
                </div>
              );
            }}
            height="100%"
            locale="es"
            firstDay={1}
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
            allDaySlot={false}
            eventDisplay="block"
            dayMaxEvents={3}
            moreLinkText="más"
            selectable={true}
            selectMirror={true}
          />
        </div>
      </div>

      {/* 📊 ESTADÍSTICAS PROFESIONALES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-xl shadow-lg text-white text-center">
          <p className="text-3xl font-bold">{(appointments || []).filter(a => a.scheduled_date?.startsWith(today)).length}</p>
          <h3 className="text-sm font-medium opacity-90">Hoy</h3>
        </div>
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-4 rounded-xl shadow-lg text-white text-center">
          <p className="text-3xl font-bold">{(appointments || []).filter(a => {
            const aptDate = new Date(a.scheduled_date);
            return aptDate >= thisWeekStart && aptDate <= thisWeekEnd;
          }).length}</p>
          <h3 className="text-sm font-medium opacity-90">Esta semana</h3>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-xl shadow-lg text-white text-center">
          <p className="text-3xl font-bold">{(appointments || []).filter(a => a.status === 'confirmed').length}</p>
          <h3 className="text-sm font-medium opacity-90">Confirmadas</h3>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-4 rounded-xl shadow-lg text-white text-center">
          <p className="text-3xl font-bold">{(appointments || []).filter(a => a.status === 'scheduled').length}</p>
          <h3 className="text-sm font-medium opacity-90">Programadas</h3>
        </div>
      </div>

      {/* 🎯 MODALES */}
      {showCreateModal && (
        <CreateAppointmentModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateAppointment}
        />
      )}

      {showEditModal && selectedAppointment && (
        <EditAppointmentModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          appointment={selectedAppointment}
          onUpdate={handleUpdateAppointment}
          onDelete={handleDeleteAppointment}
        />
      )}
    </div>
  );
};

export default CalendarPage;
