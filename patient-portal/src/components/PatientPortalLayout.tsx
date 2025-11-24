import React, { useState } from 'react';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  DocumentIcon,
  CalendarIcon,
  CreditCardIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

// 🔥 OFFLINE SUPREMACY - COMPONENTES INTEGRADOS
import { OfflineIndicator } from './OfflineIndicator';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { SyncQueueManager } from './SyncQueueManager';
import { useOfflineCapabilities } from '../hooks/useOfflineCapabilities';

// ============================================================================
// COMPONENTE: NAVEGACIÓN RESPONSIVA CYBERPUNK V3
// ============================================================================

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Suscripciones', href: '/subscriptions', icon: CreditCardIcon },
  { name: 'Documentos', href: '/documents', icon: DocumentIcon },
  { name: 'Citas', href: '/appointments', icon: CalendarIcon },
  { name: 'Pagos', href: '/payments', icon: CreditCardIcon },
  { name: 'Notificaciones', href: '/notifications', icon: BellIcon },
  { name: 'Perfil', href: '/profile', icon: UserIcon },
];

const PatientPortalLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { auth, logout } = useAuthStore();
  const location = useLocation();

  // 🔥 OFFLINE SUPREMACY - CONCIENCIA DE ESTADO
  const offlineCapabilities = useOfflineCapabilities();

  const handleLogout = () => {
    logout();
    // Redirect to login would happen here
  };

  return (
    <div className="min-h-screen bg-cyber-gradient">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-cyber-black/80" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-cyber-dark border-r border-neon-cyan/20">
            <SidebarContent
              navigation={navigation}
              location={location}
              auth={auth}
              onLogout={handleLogout}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:block">
        <div className="flex flex-col h-full bg-cyber-dark border-r border-neon-cyan/20">
          <SidebarContent
            navigation={navigation}
            location={location}
            auth={auth}
            onLogout={handleLogout}
            isDesktop={true}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-cyber-dark border-b border-neon-cyan/20 lg:hidden">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-cyber-light hover:text-white"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>

            <div className="flex items-center">
              <ShieldCheckIcon className="w-6 h-6 text-neon-cyan mr-2" />
              <span className="text-lg font-bold bg-gradient-to-r from-neon-cyan to-neon-blue bg-clip-text text-transparent">
                Dentiagest V3
              </span>
            </div>

            {/* 🔥 OFFLINE SUPREMACY - INDICADOR DE CONECTIVIDAD */}
            <div className="flex items-center space-x-2">
              <OfflineIndicator />
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative">
          {children}

          {/* 🔥 OFFLINE SUPREMACY - GESTOR DE COLA DE SINCRONIZACIÓN */}
          <SyncQueueManager />

          {/* 🔥 OFFLINE SUPREMACY - PROMPT DE INSTALACIÓN PWA */}
          <PWAInstallPrompt />
        </main>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE: CONTENIDO DE LA SIDEBAR
// ============================================================================

interface SidebarContentProps {
  navigation: typeof navigation;
  location: { pathname: string };
  auth: any;
  onLogout: () => void;
  onClose?: () => void;
  isDesktop?: boolean;
}

const SidebarContent: React.FC<SidebarContentProps> = ({
  navigation,
  location,
  auth,
  onLogout,
  onClose,
  isDesktop = false
}) => {
  return (
    <>
      {/* Logo/Brand */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-cyber-light">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-neon-cyan to-neon-blue rounded-lg flex items-center justify-center">
            <span className="text-cyber-black font-bold text-lg">D</span>
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-bold text-white">VitalPass</h1>
            <p className="text-xs text-cyber-light">Salud Digital V3</p>
          </div>
        </div>
        {!isDesktop && onClose && (
          <button onClick={onClose} className="text-cyber-light hover:text-white">
            <XMarkIcon className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* User info */}
      {auth?.isAuthenticated && (
        <div className="px-6 py-4 border-b border-cyber-light">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1 min-w-0">
              <div className="w-8 h-8 bg-neon-cyan/20 rounded-full flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-neon-cyan" />
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  Paciente {auth.patientId}
                </p>
                <p className="text-xs text-cyber-light truncate">
                  Clínica {auth.clinicId}
                </p>
              </div>
            </div>

            {/* 🔥 OFFLINE SUPREMACY - INDICADOR DE CONECTIVIDAD EN DESKTOP */}
            <div className="ml-2">
              <OfflineIndicator />
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-neon-cyan/20 text-neon-cyan border-l-4 border-neon-cyan'
                  : 'text-cyber-light hover:bg-cyber-light hover:text-white'
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  isActive ? 'text-neon-cyan' : 'text-cyber-light group-hover:text-white'
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      {auth?.isAuthenticated && (
        <div className="px-4 py-4 border-t border-cyber-light">
          <button
            onClick={() => {
              onLogout();
              onClose?.();
            }}
            className="group flex items-center w-full px-3 py-3 text-sm font-medium text-cyber-light rounded-lg hover:bg-red-900/20 hover:text-red-400 transition-all duration-200"
          >
            <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 flex-shrink-0" />
            Cerrar Sesión
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-4 border-t border-cyber-light">
        <div className="text-xs text-cyber-light text-center">
          <p>Titan V3 - Pure Quantum</p>
          <p className="mt-1 text-neon-cyan">@veritas</p>
        </div>
      </div>
    </>
  );
};

export default PatientPortalLayout;