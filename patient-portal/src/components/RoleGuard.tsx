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
 */

import React from 'react';
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
// ACCESS DENIED SCREEN
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

  // Not authenticated → Redirect to login
  if (!auth?.isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Get user role from JWT (stored in localStorage during login)
  // NOTE: In Patient Portal, we don't have a direct `role` field in auth state
  // We need to decode the JWT or fetch user data
  
  // For now, we'll check if user is in Patient Portal context
  // Patient Portal users will have patientId, Staff won't
  const userRole = getUserRoleFromAuth(auth);

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
