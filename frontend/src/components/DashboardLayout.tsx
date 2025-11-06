import React from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardLayout: React.FC = () => {
  const { state, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Función para manejar logout con navegación
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Función para determinar si una ruta está activa
  const isActiveRoute = (path: string): boolean => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

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
                <Link 
                  to="/dashboard" 
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                    isActiveRoute('/dashboard') && location.pathname === '/dashboard'
                      ? 'text-primary-600 bg-primary-50' 
                      : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  </svg>
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/dashboard/agenda" 
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActiveRoute('/dashboard/agenda')
                      ? 'text-primary-600 bg-primary-50 font-medium' 
                      : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                  </svg>
                  <span>Agenda</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/dashboard/patients" 
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActiveRoute('/dashboard/patients')
                      ? 'text-primary-600 bg-primary-50 font-medium' 
                      : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Pacientes</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/dashboard/billing" 
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActiveRoute('/dashboard/billing')
                      ? 'text-primary-600 bg-primary-50 font-medium' 
                      : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 002 2v14a2 2 0 002 2z" />
                  </svg>
                  <span>Facturación</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/dashboard/settings" 
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActiveRoute('/dashboard/settings')
                      ? 'text-primary-600 bg-primary-50 font-medium' 
                      : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Configuración</span>
                </Link>
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

        {/* Área Central - Aquí se renderiza el contenido de cada página */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
