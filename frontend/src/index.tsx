import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { MedicalSecurityProvider } from './components/MedicalRecords/MedicalSecurity.tsx';
import MedicalRouter from './components/MedicalRecords/MedicalRouter.tsx';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import SettingsPage from './pages/SettingsPage.tsx';
import DashboardLayout from './components/Layout/DashboardLayout.tsx';
import DashboardContent from './pages/DashboardContent.tsx';
import PatientsPage from './pages/PatientsPage.tsx';
import CalendarPage from './pages/CalendarPage.tsx';
import './styles/globals.css';
import './styles/calendar-anti-blue.css';

// Página de inicio - redirige automáticamente según estado de autenticación
function HomePage() {
  const { state } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    // 🛡️ SOLO redirigir si estamos exactamente en la ruta raíz
    const currentPath = window.location.pathname;
    
    if (currentPath !== '/') {
      // Si no estamos en la raíz, no hacer nada (evita redirects no deseados)
      return;
    }

    if (state.isAuthenticated) {
      // Solo redirigir a dashboard si estamos en la raíz
      navigate('/dashboard');
    } else if (!state.isLoading) {
      // Si no está autenticado y terminó de cargar, ir al login
      navigate('/login');
    }
  }, [state.isAuthenticated, state.isLoading, navigate]);

  // Mostrar loading mientras determina el estado
  return (
    <div className="min-h-screen bg-secondary-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary-500 mb-4">🦷 DentiaGest</h1>
        <p className="text-gray-600 mb-6">Sistema de Gestión Odontológica</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="text-sm text-gray-500 mt-4">Cargando...</p>
      </div>
    </div>
  );
}

// Componente para proteger rutas que requieren autenticación
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { state } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    // 🛡️ SOLO redirigir si NO está cargando Y NO está autenticado
    // Esto evita redirects durante el refresh cuando temporalmente pierde auth
    if (!state.isLoading && !state.isAuthenticated) {
      // 🎯 PLUS: Solo redirigir si llevamos más de 100ms sin auth
      // Esto da tiempo al AuthContext para recargar desde localStorage
      const timer = setTimeout(() => {
        if (!state.isAuthenticated) {
          navigate('/login');
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [state.isAuthenticated, state.isLoading, navigate]);

  // Mostrar loading mientras verifica autenticación
  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-secondary-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-4">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, no renderizar nada (el useEffect redirigirá)
  if (!state.isAuthenticated) {
    return null;
  }

  // Si está autenticado, mostrar el contenido
  return <>{children}</>;
}

// Aplicación principal con nested routing
function App() {
  return (
    <AuthProvider>
      <MedicalSecurityProvider>
        <Router>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Dashboard con rutas anidadas - TODAS PROTEGIDAS */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardContent />} />
              <Route path="patients" element={<PatientsPage />} />
              <Route path="agenda" element={<CalendarPage />} />
              <Route path="medical-records/*" element={<MedicalRouter />} />
              <Route path="treatments" element={<ComingSoonPage pageName="Tratamientos" />} />
              <Route path="billing" element={<ComingSoonPage pageName="Facturación" />} />
            </Route>
            
            {/* Settings también protegida */}
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </MedicalSecurityProvider>
    </AuthProvider>
  );
}

// Página temporal para rutas no implementadas
function ComingSoonPage({ pageName }: { pageName: string }) {
  return (
    <div className="bg-white rounded-lg shadow-soft p-8 text-center">
      <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{pageName}</h1>
      <p className="text-gray-600 mb-4">Esta funcionalidad estará disponible próximamente.</p>
      <p className="text-sm text-gray-500">
        Siguiendo el ACTION_PLAN.md, priorizamos Patient Management primero.
      </p>
    </div>
  );
}

const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);