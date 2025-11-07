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
// 🧟‍♂️💀 ZOMBIE API FILES ELIMINATED - DocumentsApi.ts, MedicalRecordsApi.ts DELETED
// 🥷 STEALTH MODE: All functionality migrated to apolloGraphQL.ts

export { 
  patientsApi, 
  patients,
  type Patient,
  type PatientCreateData,
  type PatientUpdateData,
  type PatientSearchFilters,
  type PatientSuggestion
} from './PatientsApi';

// ============================================================================
// IMPORTS FOR APOLLO OBJECT
// ============================================================================
import { api, API_ENDPOINTS } from './ApiService';
import { patients } from './PatientsApi';
// 🧟‍♂️💀 ZOMBIE IMPORTS ELIMINATED: docs, medicalRecords → apolloGraphQL.ts

// ============================================================================
// QUICK ACCESS OBJECT
// ============================================================================

export const apollo = {
  // Core API
  api,
  endpoints: API_ENDPOINTS,
  
  // Specialized services (ZOMBIE-FREE)
  patients,
  // 🧟‍♂️💀 docs & medicalRecords → apolloGraphQL.ts (STEALTH MIGRATED)
  
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
 * // Option 1: Import everything (ZOMBIE-FREE)
 * import apollo from '@/services/api';
 * const patients = await apollo.patients.list();
 * 
 * // Option 2: Import specific services
 * import { patients } from '@/services/api';
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
