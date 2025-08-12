// MEDICAL_RECORDS: Índice para exportar todos los componentes de historiales médicos
/**
 * Archivo de índice que centraliza las exportaciones de todos los componentes
 * del módulo de historiales médicos.
 * 
 * PLATFORM_PATTERN: Este patrón se repetirá en otros verticales:
 * - VetGest: Índice de componentes veterinarios
 * - MechaGest: Índice de componentes de servicio
 * - RestaurantGest: Índice de componentes de pedidos
 */

// Componente principal - contenedor
export { default as MedicalRecordsContainer } from './MedicalRecordsContainer';

// Componentes individuales
export { default as MedicalRecordsList } from './MedicalRecordsList';
export { default as MedicalRecordForm } from './MedicalRecordForm';
export { default as MedicalRecordDetail } from './MedicalRecordDetail';

// Exportación por defecto del contenedor principal
export { default } from './MedicalRecordsContainer';
