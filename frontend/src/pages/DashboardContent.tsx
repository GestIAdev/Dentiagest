import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';

const DashboardContent: React.FC = () => {
  const { state } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Proteger la ruta - redirigir si no está autenticado
  useEffect(() => {
    if (!state.isLoading && !state.isAuthenticated) {
      navigate('/login');
    }
  }, [state.isAuthenticated, state.isLoading, navigate]);

  // Mock data - en el futuro vendrá de la API
  const todayAppointments = [
    { id: 1, time: '09:00', patient: 'Juan Pérez', reason: 'Limpieza dental', status: 'confirmed' },
    { id: 2, time: '10:30', patient: 'María García', reason: 'Revisión general', status: 'pending' },
    { id: 3, time: '14:00', patient: 'Carlos López', reason: 'Endodoncia', status: 'confirmed' },
    { id: 4, time: '15:30', patient: 'Ana Martínez', reason: 'Ortodoncia', status: 'confirmed' },
    { id: 5, time: '17:00', patient: 'Luis Rodríguez', reason: 'Extracción', status: 'pending' }
  ];

  const todayStats = {
    appointments: 5,
    newPatients: 2,
    estimatedRevenue: '$2,450'
  };

  const notifications = [
    { id: 1, message: 'Análisis de radiografía completado para Juan Pérez', time: '10 min ago', type: 'success' },
    { id: 2, message: 'Recordatorio: Cita con María García en 30 minutos', time: '25 min ago', type: 'warning' },
    { id: 3, message: 'Nuevo paciente registrado: Carlos López', time: '2 horas ago', type: 'info' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Columna Izquierda - Agenda */}
      <div className="lg:col-span-2 space-y-6">
        {/* Agenda Diaria */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Agenda Diaria</h2>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm font-medium text-gray-900">
                {selectedDate.toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Lista de Citas */}
          <div className="space-y-3">
            {todayAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center space-x-4 p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors cursor-pointer">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <span className="text-primary-600 font-medium text-sm">{appointment.time}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{appointment.patient}</p>
                  <p className="text-sm text-gray-500 truncate">{appointment.reason}</p>
                </div>
                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    appointment.status === 'confirmed' 
                      ? 'bg-success-100 text-success-800' 
                      : 'bg-accent-100 text-accent-800'
                  }`}>
                    {appointment.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Panel - Específico para dentistas */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🦷 Acciones Dentales Rápidas</h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => navigate('/dashboard/patients')}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Nuevo Paciente</span>
            </button>
            <button className="bg-accent-500 hover:bg-accent-600 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
              </svg>
              <span>Nueva Cita</span>
            </button>
            <button className="bg-success-500 hover:bg-success-600 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span>Asistente IA</span>
            </button>
            <button className="bg-secondary-500 hover:bg-secondary-600 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 002 2v14a2 2 0 002 2z" />
              </svg>
              <span>Facturación</span>
            </button>
          </div>
        </div>
      </div>

      {/* Columna Derecha - Resumen y Acciones */}
      <div className="space-y-6">
        {/* Barra de Búsqueda */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Búsqueda Rápida</h3>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar pacientes..."
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Resumen de la Jornada Dental */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">📊 Resumen de la Jornada</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Citas para hoy</span>
              <span className="text-lg font-semibold text-primary-600">{todayStats.appointments}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pacientes nuevos</span>
              <span className="text-lg font-semibold text-success-600">{todayStats.newPatients}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Ingresos estimados</span>
              <span className="text-lg font-semibold text-accent-600">{todayStats.estimatedRevenue}</span>
            </div>
          </div>
        </div>

        {/* Notificaciones del Consultorio */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">🔔 Notificaciones</h3>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className="p-3 bg-secondary-50 rounded-lg">
                <p className="text-sm text-gray-800">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Widget IA - Específico para dentistas */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg shadow-soft p-6 text-white">
          <h3 className="text-lg font-medium mb-2">🤖 Asistente IA Dental</h3>
          <p className="text-sm text-primary-100 mb-4">
            Próximas funciones: Análisis de radiografías, diagnósticos asistidos, y más.
          </p>
          <button className="bg-white text-primary-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-50 transition-colors">
            Activar IA
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
