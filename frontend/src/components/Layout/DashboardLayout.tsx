import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LegalTransparencyModule from '../Legal/LegalTransparencyModule';

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
  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Configuración de navegación
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        </svg>
      )
    },
    {
      name: 'Citas',  // 🆕 RENAMED: Was "Agenda", now "Citas" (cleaner)
      href: '/dashboard/appointments',  // 🆕 UNIFIED: Was /agenda, now /appointments
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      name: 'Pacientes',
      href: '/dashboard/patients',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      name: 'Historiales Médicos',
      href: '/dashboard/medical-records',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      badge: '🔒' // Indicador de que requiere permisos especiales
    },
    {
      name: 'Documentos',
      href: '/dashboard/documents',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      name: 'Tratamientos',
      href: '/dashboard/treatments',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      name: 'Facturación',
      href: '/dashboard/billing',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 002 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    // 🔥 V3 ARSENAL NAVIGATION - 7 NEW MODULES ACTIVATED
    {
      name: 'Inventario',
      href: '/dashboard/inventory',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      badge: '🎯' // AI Insights
    },
    {
      name: 'Marketplace B2B',
      href: '/dashboard/marketplace',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      badge: '🛒' // BlackMarket
    },
    {
      name: 'Compliance',
      href: '/dashboard/compliance',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      badge: '🛡️' // GDPR
    },
    {
      name: 'Órdenes de Compra',
      href: '/dashboard/purchase-orders',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      name: 'Suscripciones',
      href: '/dashboard/subscriptions',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      badge: '🎬' // Netflix-Dental
    },
    {
      name: 'Configuración',
      href: '/settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ];

  // 🎯 VIEWPORT CONTROL PATTERN - SINGLE SCROLL ARCHITECTURE
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* 📌 FIXED HEADER - NO SCROLL */}
      <header className="flex-shrink-0 h-16 bg-card border-b border-border shadow-sm">
        <div className="h-full px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary">🦷 DentiaGest</h1>
          </div>
          
          {/* Center Bar */}
          <div className="flex items-center space-x-4">
            <LegalTransparencyModule />
          </div>
          
          {/* User Info */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                {state.user?.firstName} {state.user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground capitalize">{state.user?.role}</p>
            </div>
            <button className="flex items-center space-x-2 bg-secondary hover:bg-accent px-3 py-2 rounded-lg transition-colors">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-medium">
                  {state.user?.firstName?.charAt(0).toUpperCase()}
                  {state.user?.lastName?.charAt(0).toUpperCase()}
                </span>
              </div>
              <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* 🏗️ MAIN CONTAINER - FLEX ROW */}
      <div className="flex-1 flex overflow-hidden">
        {/* 📌 FIXED SIDEBAR - INDEPENDENT SCROLL */}
        <nav className="w-64 flex-shrink-0 bg-card border-r border-border overflow-y-auto">
          <div className="p-6">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const isActive = isActiveRoute(item.href);
                return (
                  <li key={item.name}>
                    <button
                      onClick={() => navigate(item.href)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium w-full text-left transition-all duration-200 ${
                        isActive
                          ? 'text-primary-foreground bg-primary shadow-sm'
                          : 'text-foreground hover:text-primary hover:bg-accent'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {item.icon}
                        <span className="text-sm">{item.name}</span>
                      </div>
                      {(item as any).badge && (
                        <span className="text-xs">
                          {(item as any).badge}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
            
            {/* Logout */}
            <div className="mt-8 pt-6 border-t border-border">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 text-destructive hover:text-destructive-foreground hover:bg-destructive/10 px-3 py-2 rounded-lg w-full transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="text-sm">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </nav>

        {/* 🎯 MAIN CONTENT - SINGLE SCROLL ZONE */}
        <main className="flex-1 overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

