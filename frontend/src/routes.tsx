// frontend/src/routes.tsx
import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { MedicalSecurityProvider } from './components/MedicalRecords/MedicalSecurity';
import MedicalRouter from './components/MedicalRecords/MedicalRouter';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SettingsPage from './pages/SettingsPage';
import DashboardLayout from './components/Layout/DashboardLayout';
import DashboardPageV4 from './pages/DashboardPageV4'; // 🎮 TORRE DE CONTROL V4
import PatientsPageGraphQL from './pages/PatientsPageGraphQL';
import AppointmentsPage from './pages/AppointmentsPage'; // 🆕 UNIFIED APPOINTMENTS
import { DocumentsPage } from './pages/DocumentsPage';
import { StaffGuard } from './components/StaffGuard'; // 🔒 GDPR ROLE SEGREGATION
// 🔥 V3 ARSENAL COMPLETE - POST-VITE ACTIVATION - 14 JEWELS AWAKENED
// import FinancialManagerV3 from './components/Billing/FinancialManagerV3'; // 💀 DEPRECATED by LÁZARO
import BillingPageV4 from './pages/BillingPageV4'; // 🎯💰 OPERACIÓN LÁZARO FASE 4
import TreatmentManagementV3 from './components/Treatments/TreatmentManagementV3';
import InventoryManagementV3 from './components/Inventory/InventoryManagementV3';
import SupplierManagerV3 from './components/MarketplacePage/SupplierManagerV3';
import PurchaseOrderManagerV3 from './components/MarketplacePage/PurchaseOrderManagerV3';
import ComplianceManagementV3 from './components/Compliance/ComplianceManagementV3';
import AppointmentManagementV3 from './components/Appointments/AppointmentManagementV3';
import SubscriptionPlansManager from './components/Subscription/SubscriptionPlansManager';

// Página de inicio - redirige automáticamente según estado de autenticación
function HomePage() {
  const { state } = useAuth();
  const navigate = useNavigate();
  const [initialMount, setInitialMount] = React.useState(true);

  React.useEffect(() => {
    // 🛡️ SOLO redirigir si estamos exactamente en la ruta raíz
    const currentPath = window.location.pathname;

    if (currentPath !== '/') {
      // Si no estamos en la raíz, no hacer nada (evita redirects no deseados)
      // CRITICAL: This includes /dashboard, /login, etc.
      return;
    }

    // 🔥 CRITICAL: Skip if we just mounted (gives time for router to settle)
    if (initialMount) {
      setInitialMount(false);
      return;
    }

    if (state.isAuthenticated && state.user) {
      // Check role to redirect to correct portal
      const userRole = state.user.role;
      
      if (userRole === 'PATIENT') {
        // Redirect patients to Patient Portal on port 3001
        console.log('📍 [HOME] Paciente detectado, redirigiendo al Patient Portal...');
        window.location.href = 'http://localhost:3001';
      } else {
        // Redirect staff to dashboard
        console.log('📍 [HOME] Personal clínico detectado, redirigiendo al dashboard...');
        navigate('/dashboard');
      }
    } else if (!state.isLoading) {
      // Si no está autenticado y terminó de cargar, ir al login
      navigate('/login');
    }
  }, [state.isAuthenticated, state.user, state.isLoading, navigate, initialMount]);

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

// Componente de rutas principales
function AppRoutes() {
  return (
    <MedicalSecurityProvider>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Dashboard con rutas anidadas - STAFF/ADMIN ONLY */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <StaffGuard>
              <DashboardLayout />
            </StaffGuard>
          </ProtectedRoute>
        }>
          <Route index element={<DashboardPageV4 />} />
          <Route path="patients" element={<PatientsPageGraphQL />} /> {/* 🆕 UNIFIED ROUTE - PATIENTS */}
          <Route path="appointments" element={<AppointmentsPage />} /> {/* 🆕 UNIFIED ROUTE - APPOINTMENTS */}
          <Route path="medical-records/*" element={<MedicalRouter />} />
          <Route path="documents" element={<DocumentsPage />} />
          
          {/* 🔥 V3 ARSENAL COMPLETE - 8 JEWELS ACTIVATED (74% DORMIDOS → 100% BRILLANDO) */}
          <Route path="treatments" element={<TreatmentManagementV3 />} />
          <Route path="billing" element={<BillingPageV4 />} /> {/* 🎯💰 OPERACIÓN LÁZARO FASE 4 */}
          {/* Legacy route removed - now using BillingPageV4 directly */}
          <Route path="inventory" element={<InventoryManagementV3 />} />
          <Route path="marketplace" element={<SupplierManagerV3 />} />
          <Route path="purchase-orders" element={<PurchaseOrderManagerV3 />} />
          <Route path="compliance" element={<ComplianceManagementV3 />} />
          {/* ❌ DELETED: "Citas Avanzadas" route - now unified in /appointments */}
          <Route path="subscriptions" element={<SubscriptionPlansManager />} />
        </Route>

        {/* Settings también protegida */}
        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />
      </Routes>
    </MedicalSecurityProvider>
  );
}

export default AppRoutes;
