// MEDICAL_RECORDS: Enhanced security component with role-based access
/**
 * Componente de seguridad que controla acceso a historiales médicos.
 * Implementa GDPR compliance y separación de poderes médicos.
 * 
 * SECURITY_LEVELS:
 * - ADMIN: NO access to medical records (privacy separation)
 * - PROFESSIONAL (doctor): FULL access to medical records
 * - RECEPTIONIST: NO access to medical records (only patient contact)
 * - ASSISTANT: LIMITED access (depends on clinic policy)
 */

import React, { createContext, useContext } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldExclamationIcon,
  LockClosedIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

// Types para control de acceso médico
interface MedicalAccessLevel {
  canViewMedicalRecords: boolean;
  canEditMedicalRecords: boolean;
  canViewDocuments: boolean;
  canUploadDocuments: boolean;
  canViewSensitiveData: boolean;
  reason?: string;
}

interface MedicalSecurityContextType {
  accessLevel: MedicalAccessLevel;
  isAuthorizedForMedicalData: boolean;
  getSecurityReason: () => string;
}

// Context para seguridad médica
const MedicalSecurityContext = createContext<MedicalSecurityContextType | null>(null);

// Hook para usar el contexto de seguridad
export const useMedicalSecurity = () => {
  const context = useContext(MedicalSecurityContext);
  if (!context) {
    throw new Error('useMedicalSecurity must be used within MedicalSecurityProvider');
  }
  return context;
};

// Provider de seguridad médica
export const MedicalSecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useAuth();
  
  // Función para determinar nivel de acceso según rol
  const getMedicalAccessLevel = (): MedicalAccessLevel => {
    if (!state.isAuthenticated || !state.user) {
      return {
        canViewMedicalRecords: false,
        canEditMedicalRecords: false,
        canViewDocuments: false,
        canUploadDocuments: false,
        canViewSensitiveData: false,
        reason: 'No autenticado'
      };
    }

    const userRole = state.user.role;

    switch (userRole) {
      case 'professional': // Profesional médico - DOCTOR LOGIN (ROL CORRECTO DEL BACKEND)
        return {
          canViewMedicalRecords: true,
          canEditMedicalRecords: true,
          canViewDocuments: true,
          canUploadDocuments: true,
          canViewSensitiveData: true,
          reason: 'Profesional médico autorizado - Acceso médico completo'
        };

      case 'admin': // Administrador - SEPARACIÓN DE PODERES
        return {
          canViewMedicalRecords: false,  // 🚨 GDPR: Admin NO accede a datos médicos
          canEditMedicalRecords: false,
          canViewDocuments: false,
          canUploadDocuments: false,
          canViewSensitiveData: false,
          reason: 'Administrador - Separación de poderes médicos (GDPR Article 5)'
        };

      case 'receptionist': // Recepcionista - SOLO AGENDA
        return {
          canViewMedicalRecords: false,  // 🚨 Solo agenda y contacto
          canEditMedicalRecords: false,
          canViewDocuments: false,
          canUploadDocuments: false,
          canViewSensitiveData: false,
          reason: 'Recepcionista - Solo acceso a agenda y contacto'
        };

      case 'assistant': // Asistente - ACCESO LIMITADO
        return {
          canViewMedicalRecords: true,   // ✅ Puede ver historiales
          canEditMedicalRecords: false,  // ❌ No puede editar
          canViewDocuments: true,        // ✅ Puede ver documentos
          canUploadDocuments: false,     // ❌ No puede subir
          canViewSensitiveData: false,   // ❌ No datos sensibles
          reason: 'Asistente - Acceso limitado de solo lectura'
        };

      default:
        return {
          canViewMedicalRecords: false,
          canEditMedicalRecords: false,
          canViewDocuments: false,
          canUploadDocuments: false,
          canViewSensitiveData: false,
          reason: 'Rol no reconocido'
        };
    }
  };

  const accessLevel = getMedicalAccessLevel();
  const isAuthorizedForMedicalData = accessLevel.canViewMedicalRecords;

  const getSecurityReason = () => accessLevel.reason || 'Sin especificar';

  return (
    <MedicalSecurityContext.Provider value={{
      accessLevel,
      isAuthorizedForMedicalData,
      getSecurityReason
    }}>
      {children}
    </MedicalSecurityContext.Provider>
  );
};

// Componente para proteger rutas médicas
interface MedicalProtectedRouteProps {
  children: React.ReactNode;
  requireEdit?: boolean;
  fallback?: React.ReactNode;
}

export const MedicalProtectedRoute: React.FC<MedicalProtectedRouteProps> = ({
  children,
  requireEdit = false,
  fallback
}) => {
  const { accessLevel, getSecurityReason } = useMedicalSecurity();
  const { state } = useAuth();

  // Verificar si tiene el nivel de acceso requerido
  const hasAccess = requireEdit 
    ? accessLevel.canEditMedicalRecords 
    : accessLevel.canViewMedicalRecords;

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    // Componente de acceso denegado por defecto
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
              <ShieldExclamationIcon className="h-8 w-8 text-red-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Acceso Restringido
          </h1>
          
          <p className="text-gray-600 mb-6">
            No tienes permisos para acceder a historiales médicos.
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Motivo de la restricción:</p>
                <p className="mt-1">{getSecurityReason()}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              <strong>Tu rol:</strong> {state.user?.role || 'No definido'}
            </p>
            
            <div className="text-xs text-gray-400 border-t pt-3">
              <p className="flex items-center justify-center">
                <LockClosedIcon className="h-3 w-3 mr-1" />
                Protegido por GDPR Article 9 - Datos de salud
              </p>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={() => window.history.back()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Hook para verificar permisos específicos
export const useMedicalPermissions = () => {
  const { accessLevel } = useMedicalSecurity();
  
  return {
    canView: accessLevel.canViewMedicalRecords,
    canEdit: accessLevel.canEditMedicalRecords,
    canViewDocs: accessLevel.canViewDocuments,
    canUploadDocs: accessLevel.canUploadDocuments,
    canViewSensitive: accessLevel.canViewSensitiveData,
    
    // Funciones helper
    requiresDoctor: (action: string) => {
      if (!accessLevel.canEditMedicalRecords) {
        throw new Error(`Acción "${action}" requiere rol de profesional médico`);
      }
    },
    
    requiresMinimal: (action: string) => {
      if (!accessLevel.canViewMedicalRecords) {
        throw new Error(`Acción "${action}" requiere acceso a historiales médicos`);
      }
    }
  };
};

// Componente de advertencia para datos sensibles
export const SensitiveDataWarning: React.FC = () => {
  const { state } = useAuth();
  
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
      <div className="flex items-start">
        <ShieldExclamationIcon className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
        <div className="text-sm text-red-800">
          <p className="font-medium">⚠️ Datos Médicos Confidenciales</p>
          <p className="mt-1">
            Esta información está protegida por leyes de privacidad médica.
            Acceso autorizado para: <strong>{state.user?.first_name} {state.user?.last_name}</strong>
          </p>
          <p className="mt-2 text-xs text-red-600">
            🔒 GDPR Article 9 - Uso restringido a fines médicos únicamente
          </p>
        </div>
      </div>
    </div>
  );
};

export default MedicalSecurityProvider;
