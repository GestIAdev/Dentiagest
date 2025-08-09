import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';

const DashboardPage: React.FC = () => {
  const { state, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Función para manejar logout con navegación
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
    <div className="min-h-screen bg-secondary-100">
      {/* Barra Superior */}
      <header className="bg-white shadow-soft border-b border-secondary-200">
        <div className="w-full px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo de la Clínica */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-primary-500">DentiaGest</h1>
              </div>
            </div>
            
            {/* Información del Usuario */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {state.user?.first_name} {state.user?.last_name}
                </p>
                <p className="text-xs text-gray-500 capitalize">{state.user?.role}</p>
              </div>
              <div className="relative">
                <button className="flex items-center space-x-2 bg-secondary-50 hover:bg-secondary-100 px-3 py-2 rounded-lg transition-colors">
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {state.user?.first_name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {/* Aquí iría el menú desplegable */}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Barra de Navegación Lateral */}
        <nav className="w-64 bg-white shadow-soft h-screen">
          <div className="p-6">
            <ul className="space-y-3">
              <li>
                <a href="#" className="flex items-center space-x-3 text-primary-600 bg-primary-50 px-3 py-2 rounded-lg font-medium">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  </svg>
                  <span>Dashboard</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center space-x-3 text-gray-600 hover:text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                  </svg>
                  <span>Agenda</span>
                </a>
              </li>
              <li>
                <Link to="/patients" className="flex items-center space-x-3 text-gray-600 hover:text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Pacientes</span>
                </Link>
              </li>
              <li>
                <a href="#" className="flex items-center space-x-3 text-gray-600 hover:text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 002 2v14a2 2 0 002 2z" />
                  </svg>
                  <span>Facturación</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center space-x-3 text-gray-600 hover:text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Configuración</span>
                </a>
              </li>
            </ul>
            
            {/* Botón de Cerrar Sesión */}
            <div className="mt-8 pt-6 border-t border-secondary-200">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg w-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Área Central */}
        <main className="flex-1 p-6">
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

              {/* Resumen de la Jornada */}
              <div className="bg-white rounded-lg shadow-soft p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen de la Jornada</h3>
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

              {/* Acceso Rápido */}
              <div className="bg-white rounded-lg shadow-soft p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Acceso Rápido</h3>
                <div className="space-y-3">
                  <button className="w-full bg-primary-500 hover:bg-primary-600 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Añadir Nuevo Paciente</span>
                  </button>
                  <button className="w-full bg-accent-500 hover:bg-accent-600 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    <span>Asistente de Voz</span>
                  </button>
                </div>
              </div>

              {/* Notificaciones */}
              <div className="bg-white rounded-lg shadow-soft p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notificaciones</h3>
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-3 bg-secondary-50 rounded-lg">
                      <p className="text-sm text-gray-800">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
