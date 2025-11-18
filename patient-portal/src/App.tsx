import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './config/apollo';
import PatientPortalLayout from './components/PatientPortalLayout';
import LoginV3 from './components/LoginV3';
import RegisterPage from './pages/RegisterPage';
import SubscriptionDashboardV3 from './components/SubscriptionDashboardV3';
import DocumentVaultV3 from './components/DocumentVaultV3';
import AppointmentsManagementV3 from './components/AppointmentsManagementV3';
import PaymentManagementV3 from './components/PaymentManagementV3';
import NotificationManagementV3 from './components/NotificationManagementV3';
import { useAuthStore } from './stores/authStore';
import { PatientOnlyGuard } from './components/RoleGuard';

// ============================================================================
// COMPONENTE: DASHBOARD PRINCIPAL
// ============================================================================

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-cyber-gradient text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-neon-cyan to-neon-blue bg-clip-text text-transparent mb-4">
            Bienvenido al Portal del Paciente
          </h1>
          <p className="text-lg sm:text-xl text-cyber-light mb-6 sm:mb-8">
            Sistema Dental Cripto-Recompensas - Titan V3
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
          {/* Subscription Card */}
          <div className="bg-cyber-dark rounded-xl p-4 sm:p-6 border border-neon-cyan/20 hover:border-neon-cyan transition-all duration-300">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neon-cyan/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
              <span className="text-neon-cyan text-xl sm:text-2xl">💎</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Suscripciones</h3>
            <p className="text-cyber-light text-sm sm:text-base mb-3 sm:mb-4">
              Gestiona tus planes dentales con el modelo Netflix Dental
            </p>
            <button className="w-full bg-neon-cyan hover:bg-neon-cyan/80 text-cyber-black py-2 px-4 rounded-lg font-semibold transition-colors text-sm sm:text-base">
              Ver Suscripciones
            </button>
          </div>

          {/* Documents Card */}
          <div className="bg-cyber-dark rounded-xl p-4 sm:p-6 border border-neon-blue/20 hover:border-neon-blue transition-all duration-300">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neon-blue/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
              <span className="text-neon-blue text-xl sm:text-2xl">🔒</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Documentos Seguros</h3>
            <p className="text-cyber-light text-sm sm:text-base mb-3 sm:mb-4">
              Accede a tus radiografías y tratamientos con encriptación
            </p>
            <button className="w-full bg-neon-blue hover:bg-neon-blue/80 text-cyber-black py-2 px-4 rounded-lg font-semibold transition-colors text-sm sm:text-base">
              Ver Documentos
            </button>
          </div>

          {/* Appointments Card */}
          <div className="bg-cyber-dark rounded-xl p-4 sm:p-6 border border-neon-green/20 hover:border-neon-green transition-all duration-300">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neon-green/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
              <span className="text-neon-green text-xl sm:text-2xl">📅</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Próximas Citas</h3>
            <p className="text-cyber-light text-sm sm:text-base mb-3 sm:mb-4">
              Programa y administra tus consultas dentales
            </p>
            <button className="w-full bg-neon-green hover:bg-neon-green/80 text-cyber-black py-2 px-4 rounded-lg font-semibold transition-colors text-sm sm:text-base">
              Ver Citas
            </button>
          </div>

          {/* Payments Card */}
          <div className="bg-cyber-dark rounded-xl p-4 sm:p-6 border border-neon-purple/20 hover:border-neon-purple transition-all duration-300">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neon-purple/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
              <span className="text-neon-purple text-xl sm:text-2xl">💳</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Pagos Agnósticos</h3>
            <p className="text-cyber-light text-sm sm:text-base mb-3 sm:mb-4">
              Sistema universal VISA/MC + QR/Bizum con @veritas
            </p>
            <button className="w-full bg-neon-purple hover:bg-neon-purple/80 text-cyber-black py-2 px-4 rounded-lg font-semibold transition-colors text-sm sm:text-base">
              Gestionar Pagos
            </button>
          </div>

          {/* Notifications Card */}
          <div className="bg-cyber-dark rounded-xl p-4 sm:p-6 border border-neon-pink/20 hover:border-neon-pink transition-all duration-300">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neon-pink/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
              <span className="text-neon-pink text-xl sm:text-2xl">🔔</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Notificaciones</h3>
            <p className="text-cyber-light text-sm sm:text-base mb-3 sm:mb-4">
              SMS/Email automatizados - Recordatorios 24h
            </p>
            <button className="w-full bg-neon-pink hover:bg-neon-pink/80 text-cyber-black py-2 px-4 rounded-lg font-semibold transition-colors text-sm sm:text-base">
              Ver Notificaciones
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mt-8 sm:mt-12 bg-cyber-dark rounded-xl p-4 sm:p-6 border border-cyber-light">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Resumen de Actividad</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-neon-cyan mb-1 sm:mb-2">12</div>
              <p className="text-cyber-light text-sm sm:text-base">Consultas este año</p>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-neon-green mb-1 sm:mb-2">98%</div>
              <p className="text-cyber-light text-sm sm:text-base">Cumplimiento del plan</p>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-neon-blue mb-1 sm:mb-2">250</div>
              <p className="text-cyber-light text-sm sm:text-base">Puntos acumulados</p>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-neon-purple mb-1 sm:mb-2">4.8</div>
              <p className="text-cyber-light text-sm sm:text-base">Calificación promedio</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE: GUARD DE AUTENTICACIÓN
// ============================================================================

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { auth } = useAuthStore();

  if (!auth?.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// ============================================================================
// COMPONENTE PRINCIPAL: APP V3 - PATIENT PORTAL
// ============================================================================

const App: React.FC = () => {
  return (
    <ApolloProvider client={apolloClient}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginV3 />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes - PATIENT ONLY */}
          <Route path="/" element={
            <ProtectedRoute>
              <PatientOnlyGuard>
                <PatientPortalLayout>
                  <Dashboard />
                </PatientPortalLayout>
              </PatientOnlyGuard>
            </ProtectedRoute>
          } />

          <Route path="/subscriptions" element={
            <ProtectedRoute>
              <PatientOnlyGuard>
                <PatientPortalLayout>
                  <SubscriptionDashboardV3 />
                </PatientPortalLayout>
              </PatientOnlyGuard>
            </ProtectedRoute>
          } />

          <Route path="/documents" element={
            <ProtectedRoute>
              <PatientOnlyGuard>
                <PatientPortalLayout>
                  <DocumentVaultV3 />
                </PatientPortalLayout>
              </PatientOnlyGuard>
            </ProtectedRoute>
          } />

          <Route path="/appointments" element={
            <ProtectedRoute>
              <PatientOnlyGuard>
                <PatientPortalLayout>
                  <AppointmentsManagementV3 />
                </PatientPortalLayout>
              </PatientOnlyGuard>
            </ProtectedRoute>
          } />

          <Route path="/payments" element={
            <ProtectedRoute>
              <PatientOnlyGuard>
                <PatientPortalLayout>
                  <PaymentManagementV3 />
                </PatientPortalLayout>
              </PatientOnlyGuard>
            </ProtectedRoute>
          } />

          <Route path="/notifications" element={
            <ProtectedRoute>
              <PatientOnlyGuard>
                <PatientPortalLayout>
                  <NotificationManagementV3 />
                </PatientPortalLayout>
              </PatientOnlyGuard>
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <PatientOnlyGuard>
                <PatientPortalLayout>
                  <div className="min-h-screen bg-cyber-gradient flex items-center justify-center">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-neon-cyan mb-4">Perfil del Paciente</h2>
                      <p className="text-cyber-light">Funcionalidad en desarrollo</p>
                    </div>
                  </div>
                </PatientPortalLayout>
              </PatientOnlyGuard>
            </ProtectedRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ApolloProvider>
  );
};

export default App;