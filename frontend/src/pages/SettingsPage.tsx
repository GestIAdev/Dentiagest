import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MFASetupPage from './MFASetupPage';

const SettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('security');

  const settingsSections = [
    {
      id: 'security',
      name: 'Seguridad',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    {
      id: 'appearance',
      name: 'Apariencia',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
        </svg>
      )
    },
    {
      id: 'notifications',
      name: 'Notificaciones',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 19v-7a9 9 0 0118 0v7" />
        </svg>
      )
    },
    {
      id: 'profile',
      name: 'Perfil',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      id: 'system',
      name: 'Sistema',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      id: 'clinic',
      name: 'Clínica',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'security':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Configuración de Seguridad</h3>
            
            {/* Sección 2FA */}
            <div className="bg-white p-6 rounded-lg border border-secondary-200">
              <h4 className="text-md font-medium text-gray-900 mb-4">
                🔐 Autenticación de Dos Factores (2FA)
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Añade una capa extra de seguridad a tu cuenta usando tu teléfono móvil.
              </p>
              <MFASetupPage />
            </div>

            {/* Cambiar Contraseña */}
            <div className="bg-white p-6 rounded-lg border border-secondary-200">
              <h4 className="text-md font-medium text-gray-900 mb-4">
                🔑 Cambiar Contraseña
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Actualiza tu contraseña para mantener tu cuenta segura.
              </p>
              <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Cambiar Contraseña
              </button>
            </div>

            {/* Sesiones Activas */}
            <div className="bg-white p-6 rounded-lg border border-secondary-200">
              <h4 className="text-md font-medium text-gray-900 mb-4">
                📱 Sesiones Activas
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Gestiona los dispositivos donde tienes sesión iniciada.
              </p>
              <button className="bg-secondary-500 hover:bg-secondary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Ver Sesiones
              </button>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Personalización de Apariencia</h3>
            
            {/* Tema */}
            <div className="bg-white p-6 rounded-lg border border-secondary-200">
              <h4 className="text-md font-medium text-gray-900 mb-4">
                🎨 Tema Visual
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <button className="p-4 border-2 border-primary-500 rounded-lg bg-white">
                  <div className="w-full h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded mb-2"></div>
                  <span className="text-sm font-medium">Clásico</span>
                </button>
                <button className="p-4 border-2 border-secondary-300 rounded-lg bg-white hover:border-primary-500">
                  <div className="w-full h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded mb-2"></div>
                  <span className="text-sm font-medium">Moderno</span>
                </button>
                <button className="p-4 border-2 border-secondary-300 rounded-lg bg-white hover:border-primary-500">
                  <div className="w-full h-8 bg-gradient-to-r from-green-500 to-teal-600 rounded mb-2"></div>
                  <span className="text-sm font-medium">Natural</span>
                </button>
              </div>
            </div>

            {/* Skins Personalizados */}
            <div className="bg-white p-6 rounded-lg border border-secondary-200">
              <h4 className="text-md font-medium text-gray-900 mb-4">
                ✨ Skins Personalizados
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Próximamente: Crea y guarda tus propios esquemas de colores.
              </p>
              <button className="bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-lg font-medium transition-colors" disabled>
                Crear Skin (Próximamente)
              </button>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Configuración de Notificaciones</h3>
            
            <div className="bg-white p-6 rounded-lg border border-secondary-200">
              <h4 className="text-md font-medium text-gray-900 mb-4">
                🔔 Preferencias de Notificación
              </h4>
              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded border-secondary-300" defaultChecked />
                  <span className="text-sm">Nuevas citas programadas</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded border-secondary-300" defaultChecked />
                  <span className="text-sm">Recordatorios de citas</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded border-secondary-300" />
                  <span className="text-sm">Actualizaciones del sistema</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Configuración de Perfil</h3>
            
            <div className="bg-white p-6 rounded-lg border border-secondary-200">
              <h4 className="text-md font-medium text-gray-900 mb-4">
                👤 Información Personal
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                  <input type="text" className="w-full px-3 py-2 border border-secondary-300 rounded-lg" defaultValue="Dr. Juan" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
                  <input type="text" className="w-full px-3 py-2 border border-secondary-300 rounded-lg" defaultValue="Pérez" />
                </div>
              </div>
            </div>
          </div>
        );

      case 'system':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Configuración del Sistema</h3>
            
            <div className="bg-white p-6 rounded-lg border border-secondary-200">
              <h4 className="text-md font-medium text-gray-900 mb-4">
                🌍 Idioma y Región
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Idioma</label>
                  <select className="w-full px-3 py-2 border border-secondary-300 rounded-lg">
                    <option>Español</option>
                    <option>English</option>
                    <option>Français</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zona Horaria</label>
                  <select className="w-full px-3 py-2 border border-secondary-300 rounded-lg">
                    <option>GMT-5 (América/Bogotá)</option>
                    <option>GMT-6 (América/México)</option>
                    <option>GMT+1 (Europa/Madrid)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'clinic':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Configuración de la Clínica</h3>
            
            <div className="bg-white p-6 rounded-lg border border-secondary-200">
              <h4 className="text-md font-medium text-gray-900 mb-4">
                🏥 Información de la Clínica
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Clínica</label>
                  <input type="text" className="w-full px-3 py-2 border border-secondary-300 rounded-lg" defaultValue="Clínica Dental DentiaGest" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                  <textarea className="w-full px-3 py-2 border border-secondary-300 rounded-lg" rows={3} defaultValue="Calle Principal #123, Ciudad"></textarea>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Selecciona una sección</div>;
    }
  };

  return (
    <div className="min-h-screen bg-secondary-100">
      {/* Header */}
      <header className="bg-white shadow-soft border-b border-secondary-200">
        <div className="w-full px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link 
                to="/dashboard" 
                className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Volver al Dashboard</span>
              </Link>
              <div className="h-6 w-px bg-secondary-300"></div>
              <h1 className="text-2xl font-bold text-primary-500">⚙️ Configuración</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar de Secciones */}
        <nav className="w-64 bg-white shadow-soft h-screen">
          <div className="p-6">
            <ul className="space-y-2">
              {settingsSections.map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg font-medium w-full text-left transition-colors ${
                      activeSection === section.id
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                    }`}
                  >
                    {section.icon}
                    <span>{section.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Contenido Principal */}
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;

