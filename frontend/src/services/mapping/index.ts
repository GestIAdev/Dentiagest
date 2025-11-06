/**
 * 💀 CENTRAL MAPPING SERVICE - INDEX
 * OPERACIÓN UNIFORM - Unified exports
 * 
 * @author PunkClaude & The Anarchist
 * @date 17 Agosto 2025  
 * @mission Single point of import for all mapping functionality
 */

// ============================================================================
// IMPORTS FOR RE-EXPORTS
// ============================================================================
import { MappingValidators } from './MappingValidators';
import { centralMappingService } from './CentralMappingService';
import { performanceMonitor } from './MappingPerformanceMonitor';
import { ALL_UNIFIED_TYPES, ALL_LEGACY_TYPES } from './EnumMappings';

// ============================================================================
// MAIN SERVICE
// ============================================================================
export { CentralMappingService, centralMappingService } from './CentralMappingService';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
export type {
  // Document Types
  UnifiedDocumentType,
  LegacyDocumentType,
  DocumentCategory,
  
  // Mapping Interfaces
  DocumentTypeMapping,
  
  // Validation
  MappingValidationResult,
  ValidationRule,
  
  // Performance & Caching
  PerformanceMetrics,
  CacheStatistics,
  MappingOperation,
  PerformanceThreshold,
  AlertLevel,
  CacheEntry,
  
  // Audit & Logging
  MappingAuditEntry
} from './MappingTypes';

// ============================================================================
// MAPPING DATA
// ============================================================================
export {
  // Core mappings
  UNIFIED_TO_LEGACY_MAP,
  LEGACY_TO_UNIFIED_MAP,
  UNIFIED_TO_MAPPING_MAP,
  LEGACY_TO_MAPPING_MAP,
  
  // Validation maps
  SIZE_VALIDATION_MAP,
  EXTENSION_VALIDATION_MAP,
  CONSENT_REQUIRED_SET,
  
  // Arrays for iteration
  ALL_UNIFIED_TYPES,
  ALL_LEGACY_TYPES
} from './EnumMappings';

// ============================================================================
// VALIDATORS
// ============================================================================
export { MappingValidators } from './MappingValidators';

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================
export { 
  MappingPerformanceMonitor, 
  performanceMonitor 
} from './MappingPerformanceMonitor';

// ============================================================================
// CONVENIENCE RE-EXPORTS
// ============================================================================

/**
 * 🎯 Quick validation functions
 */
export const validateUnifiedType = MappingValidators.validateUnifiedType;
export const validateLegacyType = MappingValidators.validateLegacyType;
export const validateFile = MappingValidators.validateFile;

/**
 * ⚡ Quick mapping functions
 */
export const mapUnifiedToLegacy = centralMappingService.mapUnifiedToLegacy.bind(centralMappingService);
export const mapLegacyToUnified = centralMappingService.mapLegacyToUnified.bind(centralMappingService);
export const getDisplayName = centralMappingService.getDisplayName.bind(centralMappingService);
export const isValidExtension = centralMappingService.isValidExtension.bind(centralMappingService);
export const isValidFileSize = centralMappingService.isValidFileSize.bind(centralMappingService);
export const requiresConsent = centralMappingService.requiresConsent.bind(centralMappingService);
export const mapAccessLevelToBackend = centralMappingService.mapAccessLevelToBackend.bind(centralMappingService);

/**
 * 💀 Quick performance functions
 */
export const getPerformanceMetrics = () => performanceMonitor.getMetrics();
export const getCacheStats = () => performanceMonitor.getCacheStats();
export const getPerformanceSummary = () => performanceMonitor.getPerformanceSummary();

// ============================================================================
// UTILITY CONSTANTS
// ============================================================================

/**
 * 🚀 MAPPING SERVICE VERSION
 */
export const MAPPING_SERVICE_VERSION = '1.0.0';

/**
 * 🎸 OPERATION UNIFORM METADATA
 */
export const OPERATION_UNIFORM = {
  version: '1.0.0',
  codename: 'PUNK_MAPPING_REVOLUTION',
  mission: 'Eliminate code duplication across 15+ components',
  author: 'PunkClaude & The Anarchist',
  date: '17 Agosto 2025',
  status: 'ACTIVE',
  targetComponents: [
    'DocumentUpload.tsx',
    'DocumentList.tsx',
    'DocumentViewer.tsx',
    'DocumentManagement.tsx',
    'UnifiedSystemBridge.tsx',
    'AdminDocuments.jsx',
    'PatientDocuments.jsx',
    'TreatmentPlan.jsx',
    'MedicalRecord.jsx',
    'DiagnosisForm.jsx',
    'AppointmentDetails.jsx',
    'CalendarEvent.jsx',
    'ReportGenerator.jsx',
    'DataExport.jsx',
    'LegacySync.jsx'
  ],
  eliminated_functions: [
    'mapToBackendType()',
    'mapUnifiedToLegacyForAPI()',
    'convertDocumentType()',
    'validateDocumentType()',
    'getDocumentTypeDisplay()',
    'checkFileValidation()',
    'mapLegacyToUnified()',
    'getDisplayNameForType()'
  ],
  performance_targets: {
    execution_time: '<100ms',
    cache_hit_rate: '>70%',
    error_rate: '<5%',
    code_duplication: '0%'
  }
};

/**
 * 💀 QUICK SETUP HELPER
 */
export const setupMappingService = () => {
  console.log(`
  🎸 OPERACIÓN UNIFORM - Central Mapping Service
  =============================================
  Version: ${MAPPING_SERVICE_VERSION}
  Status: ${OPERATION_UNIFORM.status}
  Mission: ${OPERATION_UNIFORM.mission}
  
  🚀 Service Ready:
  ✅ ${ALL_UNIFIED_TYPES.length} Unified Types
  ✅ ${ALL_LEGACY_TYPES.length} Legacy Types  
  ✅ Performance Monitoring Active
  ✅ Validation Engine Ready
  ✅ Cache System Initialized
  
  📊 Targets: ${OPERATION_UNIFORM.targetComponents.length} components
  🗑️  Functions to eliminate: ${OPERATION_UNIFORM.eliminated_functions.length}
  
  "Punk mapping revolution starts NOW!" 🎸⚡💀
  `);
  
  return {
    service: centralMappingService,
    validators: MappingValidators,
    monitor: performanceMonitor,
    metadata: OPERATION_UNIFORM
  };
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================
export default centralMappingService;

/**
 * 🎸 USAGE EXAMPLES:
 * 
 * // Simple mapping
 * import { mapUnifiedToLegacy } from './services/mapping';
 * const legacyType = mapUnifiedToLegacy('MEDICAL_IMAGE');
 * 
 * // Full service
 * import { centralMappingService } from './services/mapping';
 * const result = centralMappingService.mapUnifiedToLegacy('CONSENT_FORM');
 * 
 * // Validation
 * import { validateFile } from './services/mapping';
 * const validation = validateFile(file, 'TREATMENT_PLAN');
 * 
 * // Performance monitoring
 * import { getPerformanceMetrics } from './services/mapping';
 * const metrics = getPerformanceMetrics();
 * 
 * // Quick setup
 * import { setupMappingService } from './services/mapping';
 * setupMappingService();
 */
