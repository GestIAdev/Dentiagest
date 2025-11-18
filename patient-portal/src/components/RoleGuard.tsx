/**
 * 🛡️ ROLE-BASED ACCESS GUARD
 * Enforces role segregation between Patient Portal and Staff Dashboard
 * 
 * SECURITY RULES:
 * - PATIENT role → Only Patient Portal
 * - STAFF/ADMIN roles → Only Dashboard
 * - Invalid role → Auto-logout + redirect to login
 * 
 * By PunkClaude - November 2025
 * Directiva #006.5 - Gateway Repair Complete
 * FIXED: Anti-loop navigation + Staff block screen
 */

import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

// ============================================================================
// TYPES
// ============================================================================

export type UserRole = 'PATIENT' | 'STAFF' | 'ADMIN' | 'DENTIST' | 'RECEPTIONIST';

export interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
  showAccessDenied?: boolean;
}

// ============================================================================
// ACCESS DENIED SCREEN (Patient Portal - Staff Blocked)
// ============================================================================

const StaffBlockedScreen: React.FC = () => {
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const goToStaffDashboard = () => {
    // Redirect to Staff Dashboard on port 3000
    window.location.href = 'http://localhost:3000';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">🏥</span>
        </div>
        
        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Portal Incorrecto
        </h1>
        
        {/* Message */}
        <p className="text-gray-600 mb-6">
          Has iniciado sesión como <strong className="text-orange-600">PERSONAL CLÍNICO</strong>.
          <br />
          <br />
          Este es el <strong>Portal de Pacientes</strong>, exclusivo para usuarios que reciben atención dental.
          <br />
          <br />
          Por favor, accede al <strong>Dashboard Administrativo</strong> para gestionar pacientes, 
          citas y tratamientos.
        </p>
        
        {/* GDPR Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-gray-700">
            <strong>🔒 Seguridad GDPR:</strong> La segregación de roles protege los datos 
            según el Artículo 9 del RGPD. El personal clínico no debe acceder al Portal de Pacientes.
          </p>
        </div>
        
        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={goToStaffDashboard}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            🚀 Ir al Dashboard Administrativo
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// ACCESS DENIED SCREEN (Generic - Invalid Role)
// ============================================================================

const AccessDeniedScreen: React.FC<{ userRole?: string; requiredRoles: UserRole[] }> = ({ 
  userRole, 
  requiredRoles 
}) => {
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">🚫</span>
        </div>
        
        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Acceso Denegado
        </h1>
        
        {/* Message */}
        <p className="text-gray-600 mb-6">
          {userRole ? (
            <>
              Tu rol <strong className="text-red-600">{userRole}</strong> no tiene permiso para acceder a esta sección.
              <br />
              <br />
              Roles permitidos: <strong>{requiredRoles.join(', ')}</strong>
            </>
          ) : (
            <>
              No tienes los permisos necesarios para acceder a esta sección.
            </>
          )}
        </p>
        
        {/* GDPR Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-gray-700">
            <strong>🔒 Seguridad GDPR:</strong> La segregación de roles protege tus datos 
            según el Artículo 9 del RGPD. Los pacientes solo acceden al Portal de Pacientes, 
            y el personal clínico solo al Dashboard Administrativo.
          </p>
        </div>
        
        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            Cerrar Sesión
          </button>
          
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            Volver Atrás
          </button>
        </div>
        
        {/* Footer */}
        <p className="text-xs text-gray-500 mt-6">
          Si crees que esto es un error, contacta al administrador del sistema.
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// ROLE GUARD COMPONENT
// ============================================================================

/**
 * RoleGuard - Protects routes based on user role
 * 
 * @example
 * ```tsx
 * // Patient Portal route
 * <Route path="/patient-dashboard" element={
 *   <RoleGuard allowedRoles={['PATIENT']}>
 *     <PatientDashboard />
 *   </RoleGuard>
 * } />
 * 
 * // Staff Dashboard route
 * <Route path="/admin-dashboard" element={
 *   <RoleGuard allowedRoles={['STAFF', 'ADMIN', 'DENTIST']}>
 *     <AdminDashboard />
 *   </RoleGuard>
 * } />
 * ```
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedRoles,
  redirectTo = '/login',
  showAccessDenied = true,
}) => {
  const { auth } = useAuthStore();
  
  // Estado para controlar si ya verificamos el rol (evitar bucle)
  const [roleChecked, setRoleChecked] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isStaff, setIsStaff] = useState(false);

  // Effect para verificar rol UNA SOLA VEZ
  useEffect(() => {
    if (!roleChecked && auth?.isAuthenticated) {
      const role = getUserRoleFromAuth(auth);
      setUserRole(role);
      
      // Detectar si es personal clínico (STAFF, ADMIN, DENTIST, RECEPTIONIST)
      const staffRoles: UserRole[] = ['STAFF', 'ADMIN', 'DENTIST', 'RECEPTIONIST'];
      setIsStaff(role ? staffRoles.includes(role) : false);
      
      setRoleChecked(true);
      
      console.log('🛡️ RoleGuard checked:', { role, allowedRoles, isStaff: staffRoles.includes(role!) });
    }
  }, [auth?.isAuthenticated, roleChecked, allowedRoles]);

  // Not authenticated → Redirect to login
  if (!auth?.isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Esperando verificación de rol
  if (!roleChecked) {
    return (
      <div className="min-h-screen bg-cyber-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan mx-auto mb-4"></div>
          <p className="text-cyber-light">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Special case: Staff trying to access Patient Portal
  if (isStaff && allowedRoles.includes('PATIENT')) {
    return <StaffBlockedScreen />;
  }

  // Check if user role is allowed
  if (!userRole || !allowedRoles.includes(userRole)) {
    if (showAccessDenied) {
      return <AccessDeniedScreen userRole={userRole || undefined} requiredRoles={allowedRoles} />;
    }
    return <Navigate to={redirectTo} replace />;
  }

  // Authorized - render children
  return <>{children}</>;
};

// ============================================================================
// HELPER: Extract role from auth state
// ============================================================================

/**
 * Extracts user role from JWT token stored in auth state
 * 
 * In Patient Portal:
 * - If patientId exists → PATIENT role
 * - Otherwise → Try to decode JWT token to get role
 */
function getUserRoleFromAuth(auth: any): UserRole | null {
  // Patient Portal specific: if patientId exists, it's a patient
  if (auth.patientId) {
    return 'PATIENT';
  }

  // Try to decode JWT token from localStorage
  try {
    const token = localStorage.getItem('patient_portal_token');
    if (!token) return null;

    // Decode JWT (simple base64 decode, NOT cryptographic verification)
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // Map backend roles to frontend roles
    const roleMap: Record<string, UserRole> = {
      'PATIENT': 'PATIENT',
      'patient': 'PATIENT',
      'STAFF': 'STAFF',
      'staff': 'STAFF',
      'ADMIN': 'ADMIN',
      'admin': 'ADMIN',
      'DENTIST': 'DENTIST',
      'dentist': 'DENTIST',
      'professional': 'DENTIST',
      'RECEPTIONIST': 'RECEPTIONIST',
      'receptionist': 'RECEPTIONIST',
    };

    return roleMap[payload.role] || null;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

// ============================================================================
// CONVENIENCE GUARDS
// ============================================================================

/**
 * PatientOnlyGuard - Only allows PATIENT role
 */
export const PatientOnlyGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleGuard allowedRoles={['PATIENT']}>
    {children}
  </RoleGuard>
);

/**
 * StaffOnlyGuard - Only allows STAFF, ADMIN, DENTIST, RECEPTIONIST roles
 */
export const StaffOnlyGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleGuard allowedRoles={['STAFF', 'ADMIN', 'DENTIST', 'RECEPTIONIST']}>
    {children}
  </RoleGuard>
);

/**
 * AdminOnlyGuard - Only allows ADMIN role
 */
export const AdminOnlyGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleGuard allowedRoles={['ADMIN']}>
    {children}
  </RoleGuard>
);
