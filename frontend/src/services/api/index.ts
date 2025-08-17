/**
 * 🚀 APOLLO API - CENTRALIZED EXPORTS
 * OPERACIÓN APOLLO - Single import point for all API services
 * 
 * @author PunkClaude & RaulVisionario
 * @date 17 Agosto 2025
 * @mission One import to rule them all
 */

// ============================================================================
// CORE API SERVICE
// ============================================================================
export { 
  apolloApi, 
  api, 
  API_ENDPOINTS,
  type ApiResponse,
  type ApiVersion,
  type HttpMethod,
  type ApiConfig,
  type RequestOptions
} from './ApiService';

// ============================================================================
// SPECIALIZED MODULES
// ============================================================================
export { 
  documentsApi, 
  docs,
  type Document,
  type DocumentUploadData,
  type DocumentListFilters,
  type DocumentStats
} from './DocumentsApi';

export { 
  patientsApi, 
  patients,
  type Patient,
  type PatientCreateData,
  type PatientUpdateData,
  type PatientSearchFilters,
  type PatientSuggestion
} from './PatientsApi';

export { 
  medicalRecords,
  type MedicalRecord,
  type MedicalRecordCreateRequest,
  type MedicalRecordUpdateRequest,
  type MedicalRecordListParams,
  type MedicalRecordListResponse
} from './MedicalRecordsApi';

// ============================================================================
// IMPORTS FOR APOLLO OBJECT
// ============================================================================
import { api, API_ENDPOINTS } from './ApiService';
import { docs } from './DocumentsApi';
import { patients } from './PatientsApi';
import { medicalRecords } from './MedicalRecordsApi';

// ============================================================================
// QUICK ACCESS OBJECT
// ============================================================================

export const apollo = {
  // Core API
  api,
  endpoints: API_ENDPOINTS,
  
  // Specialized services
  docs,
  patients,
  medicalRecords,
  
  // Utilities
  setVersion: api.setVersion,
  getMetrics: api.getMetrics,
  healthCheck: api.healthCheck,
  info: api.info
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================
export default apollo;

/**
 * 🎸 APOLLO USAGE EXAMPLES:
 * 
 * // Option 1: Import everything
 * import apollo from '@/services/api';
 * const documents = await apollo.docs.list();
 * const patients = await apollo.patients.list();
 * 
 * // Option 2: Import specific services
 * import { docs, patients } from '@/services/api';
 * const documents = await docs.list();
 * const patientList = await patients.list();
 * 
 * // Option 3: Import core API
 * import { api, API_ENDPOINTS } from '@/services/api';
 * const response = await api.get(API_ENDPOINTS.DOCUMENTS.LIST);
 * 
 * // Option 4: Import specific classes
 * import { documentsApi, patientsApi } from '@/services/api';
 * const docs = await documentsApi.listDocuments();
 * 
 * // Quick health check
 * import apollo from '@/services/api';
 * const health = await apollo.healthCheck();
 * 
 * // Performance metrics
 * const metrics = apollo.getMetrics();
 * console.log('API Performance:', metrics);
 * 
 * // Switch to V2 globally
 * apollo.setVersion('v2');
 * 
 * "Apollo - Your API command center!" 🚀⚡💀
 */
