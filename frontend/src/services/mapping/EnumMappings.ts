/**
 * 🚀 CENTRAL MAPPING SERVICE - ENUM MAPPINGS
 * OPERACIÓN UNIFORM - Todas las definiciones de mapeo consolidadas
 * 
 * @author PunkClaude & The Anarchist  
 * @date 17 Agosto 2025
 * @mission Replace ALL duplicated mapping functions with ONE source of truth
 */

import { 
  UnifiedDocumentType, 
  LegacyDocumentType, 
  DocumentTypeMapping,
  DocumentCategory 
} from './MappingTypes';

// ============================================================================
// CORE MAPPING DEFINITIONS - SINGLE SOURCE OF TRUTH
// ============================================================================

/**
 * 🎯 THE NUCLEAR WEAPON: Complete document type mappings
 * This replaces ALL the duplicated mapping functions across components
 */
export const DOCUMENT_TYPE_MAPPINGS: DocumentTypeMapping[] = [
  {
    unified: 'RADIOGRAFIA',
    legacy: 'radiografia',
    displayName: 'Radiografía',
    category: 'DIAGNOSTICO',
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.dcm', '.dicom'],
    maxSizeBytes: 50 * 1024 * 1024, // 50MB
    requiresConsent: false,
    retentionYears: 20
  },
  {
    unified: 'INFORME_MEDICO',
    legacy: 'informe_medico',
    displayName: 'Informe Médico',
    category: 'CLINICO',
    allowedExtensions: ['.pdf', '.doc', '.docx', '.txt'],
    maxSizeBytes: 25 * 1024 * 1024, // 25MB
    requiresConsent: false,
    retentionYears: 20
  },
  {
    unified: 'RECETA',
    legacy: 'receta',
    displayName: 'Receta Médica',
    category: 'TRATAMIENTO',
    allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    requiresConsent: false,
    retentionYears: 5
  },
  {
    unified: 'CONSENTIMIENTO',
    legacy: 'consentimiento_informado',
    displayName: 'Consentimiento Informado',
    category: 'LEGAL',
    allowedExtensions: ['.pdf', '.doc', '.docx'],
    maxSizeBytes: 15 * 1024 * 1024, // 15MB
    requiresConsent: true,
    retentionYears: 25
  },
  {
    unified: 'PRESUPUESTO',
    legacy: 'presupuesto',
    displayName: 'Presupuesto',
    category: 'ADMINISTRATIVO',
    allowedExtensions: ['.pdf', '.xls', '.xlsx', '.doc', '.docx'],
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    requiresConsent: false,
    retentionYears: 7
  },
  {
    unified: 'ODONTOGRAMA',
    legacy: 'odontograma',
    displayName: 'Odontograma',
    category: 'DIAGNOSTICO',
    allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png', '.svg'],
    maxSizeBytes: 20 * 1024 * 1024, // 20MB
    requiresConsent: false,
    retentionYears: 20
  },
  {
    unified: 'FOTO_CLINICA',
    legacy: 'foto_clinica',
    displayName: 'Fotografía Clínica',
    category: 'DIAGNOSTICO',
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.tiff'],
    maxSizeBytes: 30 * 1024 * 1024, // 30MB
    requiresConsent: true,
    retentionYears: 15
  },
  {
    unified: 'LABORATORIO',
    legacy: 'resultado_laboratorio',
    displayName: 'Resultado de Laboratorio',
    category: 'DIAGNOSTICO',
    allowedExtensions: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'],
    maxSizeBytes: 15 * 1024 * 1024, // 15MB
    requiresConsent: false,
    retentionYears: 10
  },
  {
    unified: 'INTERCONSULTA',
    legacy: 'interconsulta',
    displayName: 'Interconsulta',
    category: 'CLINICO',
    allowedExtensions: ['.pdf', '.doc', '.docx'],
    maxSizeBytes: 20 * 1024 * 1024, // 20MB
    requiresConsent: false,
    retentionYears: 15
  },
  {
    unified: 'OTRO',
    legacy: 'otros',
    displayName: 'Otros Documentos',
    category: 'ADMINISTRATIVO',
    allowedExtensions: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.txt'],
    maxSizeBytes: 25 * 1024 * 1024, // 25MB
    requiresConsent: false,
    retentionYears: 5
  }
];

// ============================================================================
// OPTIMIZED LOOKUP MAPS - FOR PERFORMANCE 🚀
// ============================================================================

/**
 * 🔥 UNIFIED → LEGACY mapping (O(1) lookup)
 * Replaces: mapToBackendType() in DocumentUpload.tsx
 */
export const UNIFIED_TO_LEGACY_MAP = new Map<UnifiedDocumentType, LegacyDocumentType>(
  DOCUMENT_TYPE_MAPPINGS.map(mapping => [mapping.unified, mapping.legacy])
);

/**
 * ⚡ LEGACY → UNIFIED mapping (O(1) lookup)  
 * Replaces: mapUnifiedToLegacyForAPI() reverse logic in DocumentList.tsx
 */
export const LEGACY_TO_UNIFIED_MAP = new Map<LegacyDocumentType, UnifiedDocumentType>(
  DOCUMENT_TYPE_MAPPINGS.map(mapping => [mapping.legacy, mapping.unified])
);

/**
 * 💀 UNIFIED → FULL MAPPING (O(1) lookup)
 * Complete mapping data for validation, display, etc.
 */
export const UNIFIED_TO_MAPPING_MAP = new Map<UnifiedDocumentType, DocumentTypeMapping>(
  DOCUMENT_TYPE_MAPPINGS.map(mapping => [mapping.unified, mapping])
);

/**
 * 🎸 LEGACY → FULL MAPPING (O(1) lookup)
 * Complete mapping data accessed by legacy type
 */
export const LEGACY_TO_MAPPING_MAP = new Map<LegacyDocumentType, DocumentTypeMapping>(
  DOCUMENT_TYPE_MAPPINGS.map(mapping => [mapping.legacy, mapping])
);

// ============================================================================
// CATEGORY MAPPINGS
// ============================================================================

export const CATEGORY_MAPPINGS = new Map<DocumentCategory, DocumentTypeMapping[]>([
  ['DIAGNOSTICO', DOCUMENT_TYPE_MAPPINGS.filter(m => m.category === 'DIAGNOSTICO')],
  ['TRATAMIENTO', DOCUMENT_TYPE_MAPPINGS.filter(m => m.category === 'TRATAMIENTO')],
  ['CLINICO', DOCUMENT_TYPE_MAPPINGS.filter(m => m.category === 'CLINICO')],
  ['LEGAL', DOCUMENT_TYPE_MAPPINGS.filter(m => m.category === 'LEGAL')],
  ['ADMINISTRATIVO', DOCUMENT_TYPE_MAPPINGS.filter(m => m.category === 'ADMINISTRATIVO')]
]);

// ============================================================================
// VALIDATION MAPPINGS
// ============================================================================

export const EXTENSION_VALIDATION_MAP = new Map<string, DocumentTypeMapping[]>();
export const SIZE_VALIDATION_MAP = new Map<UnifiedDocumentType, number>();
export const CONSENT_REQUIRED_SET = new Set<UnifiedDocumentType>();

// Populate validation maps
DOCUMENT_TYPE_MAPPINGS.forEach(mapping => {
  // Extension validation
  mapping.allowedExtensions.forEach(ext => {
    if (!EXTENSION_VALIDATION_MAP.has(ext)) {
      EXTENSION_VALIDATION_MAP.set(ext, []);
    }
    EXTENSION_VALIDATION_MAP.get(ext)?.push(mapping);
  });
  
  // Size validation
  SIZE_VALIDATION_MAP.set(mapping.unified, mapping.maxSizeBytes);
  
  // Consent requirements
  if (mapping.requiresConsent) {
    CONSENT_REQUIRED_SET.add(mapping.unified);
  }
});

// ============================================================================
// DISPLAY NAME MAPPINGS
// ============================================================================

export const UNIFIED_TO_DISPLAY_MAP = new Map<UnifiedDocumentType, string>(
  DOCUMENT_TYPE_MAPPINGS.map(mapping => [mapping.unified, mapping.displayName])
);

export const LEGACY_TO_DISPLAY_MAP = new Map<LegacyDocumentType, string>(
  DOCUMENT_TYPE_MAPPINGS.map(mapping => [mapping.legacy, mapping.displayName])
);

// ============================================================================
// FALLBACK & DEFAULT VALUES
// ============================================================================

export const DEFAULT_UNIFIED_TYPE: UnifiedDocumentType = 'OTRO';
export const DEFAULT_LEGACY_TYPE: LegacyDocumentType = 'otros';
export const DEFAULT_DISPLAY_NAME = 'Documento Genérico';
export const DEFAULT_CATEGORY: DocumentCategory = 'ADMINISTRATIVO';
export const DEFAULT_MAX_SIZE = 25 * 1024 * 1024; // 25MB
export const DEFAULT_EXTENSIONS = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];

// ============================================================================
// QUICK ACCESS ARRAYS
// ============================================================================

export const ALL_UNIFIED_TYPES: UnifiedDocumentType[] = 
  DOCUMENT_TYPE_MAPPINGS.map(m => m.unified);

export const ALL_LEGACY_TYPES: LegacyDocumentType[] = 
  DOCUMENT_TYPE_MAPPINGS.map(m => m.legacy);

export const ALL_DISPLAY_NAMES: string[] = 
  DOCUMENT_TYPE_MAPPINGS.map(m => m.displayName);

export const ALL_CATEGORIES: DocumentCategory[] = 
  Array.from(new Set(DOCUMENT_TYPE_MAPPINGS.map(m => m.category)));

// ============================================================================
// SPECIAL MAPPINGS & UTILITIES
// ============================================================================

/**
 * 🎯 Get all types that require consent
 */
export const getConsentRequiredTypes = (): UnifiedDocumentType[] => 
  DOCUMENT_TYPE_MAPPINGS
    .filter(m => m.requiresConsent)
    .map(m => m.unified);

/**
 * ⚡ Get types by category
 */
export const getTypesByCategory = (category: DocumentCategory): UnifiedDocumentType[] =>
  DOCUMENT_TYPE_MAPPINGS
    .filter(m => m.category === category)
    .map(m => m.unified);

/**
 * 💀 Get types by extension
 */
export const getTypesByExtension = (extension: string): UnifiedDocumentType[] =>
  DOCUMENT_TYPE_MAPPINGS
    .filter(m => m.allowedExtensions.includes(extension.toLowerCase()))
    .map(m => m.unified);

/**
 * 🚀 Get types sorted by retention period
 */
export const getTypesByRetention = (ascending: boolean = true): DocumentTypeMapping[] =>
  [...DOCUMENT_TYPE_MAPPINGS].sort((a, b) => 
    ascending 
      ? (a.retentionYears || 0) - (b.retentionYears || 0)
      : (b.retentionYears || 0) - (a.retentionYears || 0)
  );

// ============================================================================
// PUNK ARCHITECTURE EXPORT
// ============================================================================

/**
 * 🎸 FINAL EXPORT: Everything needed to replace duplicated mapping functions
 * 
 * REPLACES:
 * - mapToBackendType() in DocumentUpload.tsx
 * - mapUnifiedToLegacyForAPI() in DocumentList.tsx  
 * - Any other scattered mapping logic across 15+ components
 * 
 * PROVIDES:
 * - Type safety bulletproof
 * - O(1) performance lookups
 * - Complete validation data
 * - Extensibility for new types
 * - Single source of truth
 * 
 * "One mapping to rule them all!" 🎸⚡💀
 */

