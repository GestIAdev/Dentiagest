// MEDICAL_RECORDS: Índice completo para exportar todos los componentes de historiales médicos
/**
 * Archivo de índice que centraliza las exportaciones de todos los componentes
 * del módulo de historiales médicos, incluyendo seguridad y routing.
 * 
 * PLATFORM_PATTERN: Este patrón se repetirá en otros verticales:
 * - VetGest: Índice de componentes veterinarios con seguridad
 * - MechaGest: Índice de componentes de servicio con roles
 * - RestaurantGest: Índice de componentes de pedidos con permisos
 */

// Componentes de seguridad y acceso (NUEVO)
export { 
  MedicalSecurityProvider,
  MedicalProtectedRoute,
  useMedicalSecurity,
  useMedicalPermissions,
  SensitiveDataWarning 
} from './MedicalSecurity.tsx';

// Router y páginas (NUEVO)
export { default as MedicalRouter } from './MedicalRouter.tsx';
export {
  MedicalRecordsListPage,
  NewMedicalRecordPage,
  MedicalRecordDetailPage,
  EditMedicalRecordPage,
  PatientMedicalRecordsPage
} from './MedicalPages.tsx';

// Componente principal - contenedor
export { default as MedicalRecordsContainer } from './MedicalRecordsContainer.tsx';

// Componentes individuales
export { default as MedicalRecordsList } from './MedicalRecordsList.tsx';
export { default as MedicalRecordForm } from './MedicalRecordForm.tsx';
export { default as MedicalRecordDetail } from './MedicalRecordDetail.tsx';

// Exportación por defecto del router (CAMBIADO para la nueva arquitectura)
export { default } from './MedicalRouter.tsx';
