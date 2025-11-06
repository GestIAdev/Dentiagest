// MEDICAL_ROUTER: Rutas protegidas para módulo de historiales médicos
/**
 * Router específico para historiales médicos con control de acceso GDPR.
 * Implementa protección de rutas según rol de usuario.
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MedicalProtectedRoute, useMedicalSecurity } from './MedicalSecurity';

// Páginas del módulo médico
import {
  MedicalRecordsListPage,
  NewMedicalRecordPage,
  MedicalRecordDetailPage,
  EditMedicalRecordPage,
  PatientMedicalRecordsPage
} from './MedicalPages';

// Página de información para roles sin acceso
const MedicalAccessInfo: React.FC = () => {
  const { getSecurityReason } = useMedicalSecurity();
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">
          🏥 Módulo de Historiales Médicos
        </h2>
        
        <div className="text-blue-800 space-y-3">
          <p>
            Este módulo contiene información médica confidencial y está restringido 
            según las normativas de protección de datos de salud.
          </p>
          
          <div className="bg-blue-100 p-4 rounded-md">
            <p className="font-medium">Motivo de restricción:</p>
            <p className="text-sm mt-1">{getSecurityReason()}</p>
          </div>
          
          <div className="text-sm text-blue-600">
            <h3 className="font-medium mb-2">Acceso por roles:</h3>
            <ul className="space-y-1">
              <li>✅ <strong>Dentista:</strong> Acceso completo a historiales médicos</li>
              <li>❌ <strong>Administrador:</strong> Sin acceso (separación de poderes)</li>
              <li>❌ <strong>Recepcionista:</strong> Solo agenda y contacto</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Router principal del módulo médico
const MedicalRouter: React.FC = () => {
  const { isAuthorizedForMedicalData } = useMedicalSecurity();

  return (
    <Routes>
      {/* Ruta principal - Lista de historiales */}
      <Route 
        path="/" 
        element={
          isAuthorizedForMedicalData ? (
            <MedicalProtectedRoute>
              <MedicalRecordsListPage />
            </MedicalProtectedRoute>
          ) : (
            <MedicalAccessInfo />
          )
        } 
      />
      
      {/* Crear nuevo historial - Solo dentistas */}
      <Route 
        path="/new" 
        element={
          <MedicalProtectedRoute requireEdit={true}>
            <NewMedicalRecordPage />
          </MedicalProtectedRoute>
        } 
      />
      
      {/* Ver historial específico */}
      <Route 
        path="/:recordId" 
        element={
          <MedicalProtectedRoute>
            <MedicalRecordDetailPage />
          </MedicalProtectedRoute>
        } 
      />
      
      {/* Editar historial - Solo dentistas */}
      <Route 
        path="/:recordId/edit" 
        element={
          <MedicalProtectedRoute requireEdit={true}>
            <EditMedicalRecordPage />
          </MedicalProtectedRoute>
        } 
      />
      
      {/* Historial por paciente */}
      <Route 
        path="/patient/:patientId" 
        element={
          <MedicalProtectedRoute>
            <PatientMedicalRecordsPage />
          </MedicalProtectedRoute>
        } 
      />
      
      {/* Ruta por defecto - redirigir a lista */}
      <Route path="*" element={<Navigate to="/dashboard/medical-records" replace />} />  {/* 🔧 FIXED: Added /dashboard prefix */}
    </Routes>
  );
};

export default MedicalRouter;
