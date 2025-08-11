import React, { useState, useEffect } from 'react';
// 🔍 TEMP DEBUG: Cambiando a named imports para detectar el problema
import { default as CreateAppointmentModal } from '../components/CreateAppointmentModal.tsx';
import { default as EditAppointmentModal } from '../components/EditAppointmentModal.tsx';
import { useAppointments } from '../hooks/useAppointments.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { usePatients } from '../hooks/usePatients.ts';
import { formatLocalDateTime } from '../utils/timezone.ts';

// 🏥 DENTIAGEST CUSTOM CALENDAR IMPORT - NOW THE ONLY CALENDAR!
import CalendarContainer from '../components/CustomCalendar/CalendarContainerSimple.tsx';
import '../components/CustomCalendar/styles/calendar.module.css';

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
    fetchAppointments
  } = useAppointments();

  // 🎯 ESTADOS DE MODALES
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  // � ESTADOS PARA PRESELECCIÓN DE FECHA/HORA
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  // �🔍 FILTROS DE BÚSQUEDA
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  //  ESTADÍSTICAS DINÁMICAS
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

  // 🗓️ CALENDAR STATE
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  // 🎯 HANDLERS PERFECTOS
  const handleDateClick = (selectInfo: any) => {
    setShowCreateModal(true);
  };

  // 🗓️ CALENDAR NAVIGATION HANDLERS
  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
  };

  const handleViewChange = (view: 'month' | 'week' | 'day') => {
    setCurrentView(view);
  };

  // 🕒 HANDLER PARA SLOTS DE TIEMPO CON PRESELECCIÓN
  const handleTimeSlotClick = (date: Date, time: string) => {
    // 🌍 TIMEZONE FIX - Use local date format instead of UTC
    const localDateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    // 🕒 FORMAT TIME WITH LEADING ZERO TO MATCH TIME_SLOTS
    const formattedTime = time.includes(':') ? 
      time.split(':').map(part => part.padStart(2, '0')).join(':') : 
      time;
    
    // ✅ TIMEZONE INTEGRATION: Local date handling
    // Store the pre-selected date and time for the modal
    setSelectedDate(date);
    setSelectedTime(formattedTime); // 🕒 USE FORMATTED TIME
    setShowCreateModal(true);
  };

  const handleEventClick = (clickInfo: any) => {
    // 🔧 HANDLE BOTH FULLCALENDAR AND CUSTOM CALENDAR FORMATS
    const appointment = clickInfo.event || clickInfo;
    setSelectedAppointment(appointment);
    setShowEditModal(true);
  };

  const handleCreateAppointment = async (newAppointment: any) => {
    await createAppointment(newAppointment);
    setShowCreateModal(false);
    // 🧹 LIMPIAR ESTADOS DE PRESELECCIÓN
    setSelectedDate(null);
    setSelectedTime(null);
  };

  // 🧹 HANDLER PARA CERRAR MODAL DE CREACIÓN
  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setSelectedDate(null);
    setSelectedTime(null);
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

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
          >
            <span className="text-xl">➕</span>
            <span>Nueva Cita</span>
          </button>
        </div>
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
          <option value="checked_in">🏥 Llegaron</option>
          <option value="in_progress">⏳ En progreso</option>
          <option value="completed">✅ Completadas</option>
          <option value="cancelled">❌ Canceladas</option>
          <option value="no_show">👻 No vinieron</option>
          <option value="rescheduled">📆 Reprogramadas</option>
        </select>
      </div>

      {/* 📅 CALENDARIO ÉPICO - SIN HEADER MOLESTO */}
      <div className="flex-1 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="h-full p-6">
          {/* 🗂️ CLEAN CALENDAR - NO CLUTTER */}
          <div className="h-full">
            <div className="bg-white h-full">
              <CalendarContainer 
                view={currentView}
                initialDate={currentDate}
                className="h-full"
                appointments={filteredAppointments || []}
                onAppointmentClick={handleEventClick}
                onAppointmentUpdate={fetchAppointments} // 🔥 REFRESH CALLBACK FOR DRAG & DROP
                onDateChange={handleDateChange} // 🗓️ SYNC DATE CHANGES
                onViewChange={handleViewChange} // 🗓️ SYNC VIEW CHANGES
                onDateClick={handleDateClick}
                onTimeSlotClick={handleTimeSlotClick} // 🕒 + BUTTON MAGIC
              />
            </div>
          </div>
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

      {/* 🎯 MODALES COMPLETAMENTE FUNCIONALES */}
      {showCreateModal && (
        <CreateAppointmentModal
          isOpen={showCreateModal}
          onClose={handleCloseCreateModal} // 🧹 USE PROPER CLEANUP HANDLER
          onCreate={handleCreateAppointment}
          selectedDate={selectedDate ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}` : null} // 🌍 LOCAL DATE FORMAT
          selectedTime={selectedTime} // 🕒 PRE-FILLED TIME
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
