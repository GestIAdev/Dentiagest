/**
 * API Configuration
 * 
 * En desarrollo, usamos rutas relativas para aprovechar el proxy configurado en package.json
 * En producción, estas se pueden cambiar a URLs absolutas según el deployment
 */

// Base URL para las API calls
// En desarrollo: usar rutas relativas para el proxy
// En producción: cambiar según sea necesario
export const API_BASE_URL = ''; // Rutas relativas para usar el proxy

// Construir URLs de API
export const buildApiUrl = (endpoint: string): string => {
  return `/api/v1${endpoint}`;
};

// URLs específicas más utilizadas
export const API_ENDPOINTS = {
  // Autenticación
  LOGIN: buildApiUrl('/auth/login'),
  REGISTER: buildApiUrl('/auth/register'),
  ME: buildApiUrl('/auth/me'),
  MFA_STATUS: buildApiUrl('/auth/mfa/status'),
  MFA_SETUP: buildApiUrl('/auth/mfa/setup'),
  MFA_VERIFY: buildApiUrl('/auth/mfa/verify'),
  MFA_DISABLE: buildApiUrl('/auth/mfa/disable'),
  
  // Pacientes
  PATIENTS: buildApiUrl('/patients'),
  
  // Citas
  APPOINTMENTS: buildApiUrl('/appointments'),
  
  // Registros médicos
  MEDICAL_RECORDS: buildApiUrl('/medical-records'),
  
  // Documentos médicos
  MEDICAL_DOCUMENTS: buildApiUrl('/medical-records/documents'),
  MEDICAL_DOCUMENTS_UPLOAD: buildApiUrl('/medical-records/documents/upload'),
};

// Helper para construir URLs dinámicas
export const getPatientUrl = (patientId: string) => buildApiUrl(`/patients/${patientId}`);
export const getAppointmentUrl = (appointmentId: string) => buildApiUrl(`/appointments/${appointmentId}`);
export const getDocumentDownloadUrl = (documentId: string) => buildApiUrl(`/medical-records/documents/${documentId}/download`);
