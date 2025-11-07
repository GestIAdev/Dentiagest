/**
 * 🚀 CENTRAL MAPPING SERVICE - TYPE DEFINITIONS
 * OPERACIÓN UNIFORM - Eliminando duplicación de código mapping
 * 
 * @author PunkClaude & The Anarchist
 * @date 17 Agosto 2025
 * @mission Centralizar todo el enum mapping con type safety bulletproof
 */

// ============================================================================
// UNIFIED DOCUMENT TYPES (Frontend Standard)
// ============================================================================

export type UnifiedDocumentType = 
  | 'RADIOGRAFIA'
  | 'INFORME_MEDICO' 
  | 'RECETA'
  | 'CONSENTIMIENTO'
  | 'PRESUPUESTO'
  | 'ODONTOGRAMA'
  | 'FOTO_CLINICA'
  | 'LABORATORIO'
  | 'INTERCONSULTA'
  | 'OTRO';

// ============================================================================
// LEGACY BACKEND TYPES (What the API expects)
// ============================================================================

export type LegacyDocumentType = 
  | 'radiografia'
  | 'informe_medico'
  | 'receta'
  | 'consentimiento_informado'
  | 'presupuesto'
  | 'odontograma'
  | 'foto_clinica'
  | 'resultado_laboratorio'
  | 'interconsulta'
  | 'otros';

// ============================================================================
// MAPPING CONFIGURATION INTERFACES
// ============================================================================

export interface DocumentTypeMapping {
  unified: UnifiedDocumentType;
  legacy: LegacyDocumentType;
  displayName: string;
  category: DocumentCategory;
  allowedExtensions: string[];
  maxSizeBytes: number;
  requiresConsent?: boolean;
  retentionYears?: number;
}

export type DocumentCategory = 
  | 'DIAGNOSTICO'
  | 'TRATAMIENTO' 
  | 'ADMINISTRATIVO'
  | 'LEGAL'
  | 'CLINICO';

// ============================================================================
// MAPPING SERVICE INTERFACES
// ============================================================================

export interface MappingServiceConfig {
  enableStrictValidation: boolean;
  enablePerformanceLogging: boolean;
  fallbackToDefault: boolean;
  defaultUnifiedType: UnifiedDocumentType;
  defaultLegacyType: LegacyDocumentType;
}

export interface MappingResult<T> {
  success: boolean;
  result: T | null;
  originalValue: string;
  mappedValue: T | null;
  validationErrors?: string[];
  performanceMetrics?: {
    executionTimeMs: number;
    cacheHit: boolean;
  };
}

// ============================================================================
// VALIDATION INTERFACES
// ============================================================================

export interface ValidationRule {
  name: string;
  validator: (value: string) => boolean;
  errorMessage: string;
  severity: 'error' | 'warning';
}

export interface MappingValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions?: string[];
}

// ============================================================================
// PERFORMANCE & CACHING INTERFACES  
// ============================================================================

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  hitCount: number;
  lastAccessed: number;
}

export interface PerformanceMetrics {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  totalMappings: number;
  averageExecutionTime: number;
  maxExecutionTime: number;
  minExecutionTime: number;
  lastOperationTime: number;
  operationsPerSecond: number;
  memoryUsage: number;
  startTime: number;
  cacheHitRate: number;
  errorRate: number;
  lastResetTime: number;
}

/**
 * ⚡ CACHE STATISTICS
 */
export interface CacheStatistics {
  hits: number;
  misses: number;
  hitRate: number;
  totalSize: number;
  maxSize: number;
  evictions: number;
  lastEvictionTime: number;
}

/**
 * 💀 MAPPING OPERATION TRACKING
 */
export interface MappingOperation {
  id: string;
  type: string;
  inputType: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  cacheHit: boolean;
  memoryBefore: number;
  memoryAfter: number;
  errorMessage?: string;
}

/**
 * 🎯 PERFORMANCE THRESHOLDS
 */
export interface PerformanceThreshold {
  maxExecutionTime: number;
  minCacheHitRate: number;
  maxErrorRate: number;
  maxMemoryUsage: number;
  minOperationsPerSecond: number;
}

/**
 * 🎸 ALERT LEVELS
 */
export type AlertLevel = 'info' | 'warning' | 'error' | 'critical';

// ============================================================================
// AUDIT & LOGGING INTERFACES
// ============================================================================

export interface MappingAuditEntry {
  timestamp: number;
  operation: 'UNIFIED_TO_LEGACY' | 'LEGACY_TO_UNIFIED' | 'VALIDATION';
  inputValue: string;
  outputValue: string | null;
  success: boolean;
  executionTimeMs: number;
  errorMessage?: string;
  userId?: string;
  sessionId?: string;
}

// ============================================================================
// CONSTANTS & ENUMS
// ============================================================================

export const MAPPING_CONSTANTS = {
  MAX_CACHE_SIZE: 1000,
  CACHE_TTL_MS: 1000 * 60 * 15, // 15 minutes
  PERFORMANCE_SAMPLE_SIZE: 100,
  MAX_AUDIT_ENTRIES: 10000,
  DEFAULT_TIMEOUT_MS: 5000
} as const;

export enum MappingDirection {
  UNIFIED_TO_LEGACY = 'UNIFIED_TO_LEGACY',
  LEGACY_TO_UNIFIED = 'LEGACY_TO_UNIFIED'
}

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO', 
  WARN = 'WARN',
  ERROR = 'ERROR'
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type MappingFunction<TInput, TOutput> = (input: TInput) => MappingResult<TOutput>;

export type AsyncMappingFunction<TInput, TOutput> = (input: TInput) => Promise<MappingResult<TOutput>>;

export type MappingCache<T> = Map<string, CacheEntry<T>>;

// ============================================================================
// TYPE GUARDS & VALIDATORS
// ============================================================================

export const isUnifiedDocumentType = (value: string): value is UnifiedDocumentType => {
  const validTypes: UnifiedDocumentType[] = [
    'RADIOGRAFIA', 'INFORME_MEDICO', 'RECETA', 'CONSENTIMIENTO',
    'PRESUPUESTO', 'ODONTOGRAMA', 'FOTO_CLINICA', 'LABORATORIO',
    'INTERCONSULTA', 'OTRO'
  ];
  return validTypes.includes(value as UnifiedDocumentType);
};

export const isLegacyDocumentType = (value: string): value is LegacyDocumentType => {
  const validTypes: LegacyDocumentType[] = [
    'radiografia', 'informe_medico', 'receta', 'consentimiento_informado',
    'presupuesto', 'odontograma', 'foto_clinica', 'resultado_laboratorio',
    'interconsulta', 'otros'
  ];
  return validTypes.includes(value as LegacyDocumentType);
};

// ============================================================================
// ALL TYPES EXPORTED ABOVE - NO NEED FOR DUPLICATE EXPORTS
// ============================================================================

/**
 * 🎯 PUNK ARCHITECTURE PRINCIPLES:
 * 
 * ✅ Type Safety: Every mapping operation is type-checked
 * ✅ Performance: Caching + metrics for <100ms target
 * ✅ Auditability: Every operation logged for compliance
 * ✅ Extensibility: Easy to add new document types
 * ✅ Validation: Multiple layers of input validation
 * ✅ Error Handling: Graceful degradation with fallbacks
 * 
 * "Fuck duplicated mapping functions, long live centralized architecture!" 🎸⚡💀
 */

