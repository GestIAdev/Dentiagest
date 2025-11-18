/**
 * 🛡️ STAFF ROLE-BASED ACCESS GUARD
 * Enforces role segregation - STAFF/ADMIN/DENTIST only
 * 
 * SECURITY RULES:
 * - STAFF/ADMIN/DENTIST roles → Dashboard access allowed
 * - PATIENT role → Blocked (should use Patient Portal)
 * - Invalid role → Auto-logout + redirect to login
 * 
 * By PunkClaude - November 2025
 * Directiva #006.5 - Gateway Repair Complete
 */

import React from 'react';
import { Navigate } from 'react-router-dom';

// ============================================================================
// TYPES
// ============================================================================

export type StaffRole = 'STAFF' | 'ADMIN' | 'DENTIST' | 'RECEPTIONIST';

export interface StaffGuardProps {
  children: React.ReactNode;
  allowedRoles?: StaffRole[];
  redirectTo?: string;
}

// ============================================================================
// ACCESS DENIED SCREEN (Patient trying to access Staff Dashboard)
// ============================================================================

const PatientAccessDeniedScreen: React.FC = () => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const goToPatientPortal = () => {
    // Redirect to Patient Portal on port 3001
    window.location.href = 'http://localhost:3001';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">🚑</span>
        </div>
        
        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Portal Incorrecto
        </h1>
        
        {/* Message */}
        <p className="text-gray-600 mb-6">
          Has iniciado sesión como <strong className="text-blue-600">PACIENTE</strong>.
          <br />
          <br />
          Este es el <strong>Dashboard Administrativo</strong>, exclusivo para personal clínico.
          <br />
          <br />
          Por favor, accede al <strong>Portal de Pacientes</strong> para gestionar tus citas, 
          documentos y suscripciones.
        </p>
        
        {/* GDPR Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-gray-700">
            <strong>🔒 Seguridad GDPR:</strong> La segregación de roles protege tus datos 
            según el Artículo 9 del RGPD. Como paciente, solo puedes acceder a tus propios 
            datos a través del Portal de Pacientes.
          </p>
        </div>
        
        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={goToPatientPortal}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            🚀 Ir al Portal de Pacientes
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
// UNAUTHORIZED ACCESS SCREEN (No auth or invalid role)
// ============================================================================

const UnauthorizedAccessScreen: React.FC = () => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
          Acceso No Autorizado
        </h1>
        
        {/* Message */}
        <p className="text-gray-600 mb-6">
          No tienes los permisos necesarios para acceder al Dashboard Administrativo.
          <br />
          <br />
          Esta sección es exclusiva para personal clínico (Dentistas, Recepcionistas, Administradores).
        </p>
        
        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            Cerrar Sesión e Intentar de Nuevo
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
// STAFF GUARD COMPONENT
// ============================================================================

/**
 * StaffGuard - Protects Dashboard routes (STAFF/ADMIN/DENTIST only)
 * 
 * @example
 * ```tsx
 * // In frontend/src/App.tsx
 * <Route path="/patients" element={
 *   <StaffGuard>
 *     <PatientsPage />
 *   </StaffGuard>
 * } />
 * ```
 */
export const StaffGuard: React.FC<StaffGuardProps> = ({ 
  children, 
  allowedRoles = ['STAFF', 'ADMIN', 'DENTIST', 'RECEPTIONIST'],
  redirectTo = '/login',
}) => {
  // Check authentication
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    return <Navigate to={redirectTo} replace />;
  }

  // Decode user
  let user: any;
  try {
    user = JSON.parse(userStr);
  } catch {
    return <Navigate to={redirectTo} replace />;
  }

  // Get role from user object or JWT
  let userRole: string | null = user.role || null;

  // If not in user object, try JWT
  if (!userRole) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userRole = payload.role;
    } catch {
      return <UnauthorizedAccessScreen />;
    }
  }

  // Normalize role (map backend roles to frontend)
  const roleMap: Record<string, StaffRole> = {
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

  const normalizedRole = userRole ? roleMap[userRole] : null;

  // Special case: PATIENT role → Show different screen
  if (userRole === 'PATIENT' || userRole === 'patient') {
    return <PatientAccessDeniedScreen />;
  }

  // Check if role is allowed
  if (!normalizedRole || !allowedRoles.includes(normalizedRole)) {
    return <UnauthorizedAccessScreen />;
  }

  // Authorized - render children
  return <>{children}</>;
};

/**
 * AdminOnlyGuard - Only ADMIN role allowed
 */
export const AdminOnlyGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <StaffGuard allowedRoles={['ADMIN']}>
    {children}
  </StaffGuard>
);

/**
 * DentistOrAdminGuard - DENTIST or ADMIN roles allowed
 */
export const DentistOrAdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <StaffGuard allowedRoles={['DENTIST', 'ADMIN']}>
    {children}
  </StaffGuard>
);
