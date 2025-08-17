/**
 * 🚀 CENTRAL MAPPING SERVICE - VALIDATORS
 * OPERACIÓN UNIFORM - Validation logic centralizada
 * 
 * @author PunkClaude & The Anarchist
 * @date 17 Agosto 2025
 * @mission Bulletproof validation for all mapping operations
 */

import {
  UnifiedDocumentType,
  LegacyDocumentType,
  MappingValidationResult,
  ValidationRule,
  DocumentCategory
} from './MappingTypes';

import {
  UNIFIED_TO_MAPPING_MAP,
  SIZE_VALIDATION_MAP,
  CONSENT_REQUIRED_SET,
  EXTENSION_VALIDATION_MAP,
  ALL_UNIFIED_TYPES,
  ALL_LEGACY_TYPES
} from './EnumMappings';

/**
 * 🎯 DOCUMENT TYPE VALIDATORS
 */
export class MappingValidators {
  
  // ============================================================================
  // CORE VALIDATION RULES
  // ============================================================================

  private static readonly VALIDATION_RULES: ValidationRule[] = [
    {
      name: 'non_empty_string',
      validator: (value: string) => typeof value === 'string' && value.trim().length > 0,
      errorMessage: 'Document type must be a non-empty string',
      severity: 'error'
    },
    {
      name: 'no_special_chars',
      validator: (value: string) => /^[A-Za-z0-9_]+$/.test(value.trim()),
      errorMessage: 'Document type contains invalid characters',
      severity: 'error'
    },
    {
      name: 'reasonable_length',
      validator: (value: string) => value.trim().length <= 50,
      errorMessage: 'Document type name is too long (max 50 characters)',
      severity: 'warning'
    },
    {
      name: 'uppercase_unified',
      validator: (value: string) => value === value.toUpperCase(),
      errorMessage: 'Unified document types should be uppercase',
      severity: 'warning'
    },
    {
      name: 'lowercase_legacy',
      validator: (value: string) => value === value.toLowerCase(),
      errorMessage: 'Legacy document types should be lowercase',
      severity: 'warning'
    }
  ];

  // ============================================================================
  // UNIFIED TYPE VALIDATION
  // ============================================================================

  /**
   * 🎯 Validate unified document type
   */
  public static validateUnifiedType(type: string): MappingValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Basic validation
    if (!type || typeof type !== 'string') {
      return {
        isValid: false,
        errors: ['Document type must be a non-empty string'],
        warnings: []
      };
    }

    const normalizedType = type.trim().toUpperCase();

    // Check if it's a valid unified type
    if (!ALL_UNIFIED_TYPES.includes(normalizedType as UnifiedDocumentType)) {
      errors.push(`Unknown unified document type: ${type}`);
      
      // Find similar types (fuzzy matching)
      const similar = this.findSimilarTypes(normalizedType, ALL_UNIFIED_TYPES);
      if (similar.length > 0) {
        suggestions.push(`Did you mean: ${similar.join(', ')}?`);
      }
    }

    // Apply validation rules
    this.VALIDATION_RULES.forEach(rule => {
      if (!rule.validator(normalizedType)) {
        if (rule.severity === 'error') {
          errors.push(rule.errorMessage);
        } else {
          warnings.push(rule.errorMessage);
        }
      }
    });

    // Case-specific warnings
    if (type !== normalizedType) {
      warnings.push(`Type was normalized from '${type}' to '${normalizedType}'`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  // ============================================================================
  // LEGACY TYPE VALIDATION
  // ============================================================================

  /**
   * ⚡ Validate legacy document type
   */
  public static validateLegacyType(type: string): MappingValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Basic validation
    if (!type || typeof type !== 'string') {
      return {
        isValid: false,
        errors: ['Document type must be a non-empty string'],
        warnings: []
      };
    }

    const normalizedType = type.trim().toLowerCase();

    // Check if it's a valid legacy type
    if (!ALL_LEGACY_TYPES.includes(normalizedType as LegacyDocumentType)) {
      errors.push(`Unknown legacy document type: ${type}`);
      
      // Find similar types
      const similar = this.findSimilarTypes(normalizedType, ALL_LEGACY_TYPES);
      if (similar.length > 0) {
        suggestions.push(`Did you mean: ${similar.join(', ')}?`);
      }
    }

    // Apply validation rules (subset for legacy)
    const legacyRules = this.VALIDATION_RULES.filter(rule => 
      ['non_empty_string', 'reasonable_length', 'lowercase_legacy'].includes(rule.name)
    );

    legacyRules.forEach(rule => {
      if (!rule.validator(normalizedType)) {
        if (rule.severity === 'error') {
          errors.push(rule.errorMessage);
        } else {
          warnings.push(rule.errorMessage);
        }
      }
    });

    // Case-specific warnings
    if (type !== normalizedType) {
      warnings.push(`Type was normalized from '${type}' to '${normalizedType}'`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  // ============================================================================
  // FILE VALIDATION
  // ============================================================================

  /**
   * 💀 Validate file against document type
   */
  public static validateFile(
    file: File | { name: string; size: number }, 
    documentType: UnifiedDocumentType
  ): MappingValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Get mapping data
    const mapping = UNIFIED_TO_MAPPING_MAP.get(documentType);
    if (!mapping) {
      return {
        isValid: false,
        errors: [`Unknown document type: ${documentType}`],
        warnings: []
      };
    }

    // Extract file extension
    const fileName = file.name;
    const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();

    // Validate extension
    if (!mapping.allowedExtensions.includes(extension)) {
      errors.push(
        `File extension '${extension}' not allowed for ${mapping.displayName}. ` +
        `Allowed: ${mapping.allowedExtensions.join(', ')}`
      );
      
      // Suggest similar extensions
      const similarExts = mapping.allowedExtensions.filter(ext => 
        ext.substring(1).includes(extension.substring(1)) || 
        extension.substring(1).includes(ext.substring(1))
      );
      if (similarExts.length > 0) {
        suggestions.push(`Try: ${similarExts.join(', ')}`);
      }
    }

    // Validate file size
    if (file.size > mapping.maxSizeBytes) {
      const maxSizeMB = Math.round(mapping.maxSizeBytes / (1024 * 1024));
      const currentSizeMB = Math.round(file.size / (1024 * 1024));
      errors.push(
        `File too large: ${currentSizeMB}MB. Maximum allowed for ${mapping.displayName}: ${maxSizeMB}MB`
      );
    }

    // File name validation
    if (fileName.length > 255) {
      warnings.push('File name is very long and may cause issues');
    }

    if (!/^[a-zA-Z0-9._\-\s]+$/.test(fileName)) {
      warnings.push('File name contains special characters that may cause issues');
    }

    // Consent warnings
    if (mapping.requiresConsent) {
      warnings.push(`${mapping.displayName} requires patient consent before upload`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  // ============================================================================
  // BATCH VALIDATION
  // ============================================================================

  /**
   * 🚀 Validate multiple files
   */
  public static validateFilesBatch(
    files: Array<{ file: File | { name: string; size: number }; documentType: UnifiedDocumentType }>
  ): Array<{ index: number; fileName: string; validation: MappingValidationResult }> {
    return files.map((item, index) => ({
      index,
      fileName: item.file.name,
      validation: this.validateFile(item.file, item.documentType)
    }));
  }

  /**
   * ⚡ Validate category consistency
   */
  public static validateCategoryConsistency(types: UnifiedDocumentType[]): MappingValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    const categories = new Set<DocumentCategory>();
    
    types.forEach(type => {
      const mapping = UNIFIED_TO_MAPPING_MAP.get(type);
      if (mapping) {
        categories.add(mapping.category);
      }
    });

    if (categories.size > 3) {
      warnings.push(
        `Documents span ${categories.size} different categories. ` +
        `Consider grouping similar documents together.`
      );
    }

    // Check for mixed consent requirements
    const consentRequired = types.filter(type => CONSENT_REQUIRED_SET.has(type));
    const consentNotRequired = types.filter(type => !CONSENT_REQUIRED_SET.has(type));
    
    if (consentRequired.length > 0 && consentNotRequired.length > 0) {
      warnings.push(
        `Mixed consent requirements detected. ` +
        `${consentRequired.length} documents require consent, ${consentNotRequired.length} do not.`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // ============================================================================
  // FUZZY MATCHING & SUGGESTIONS
  // ============================================================================

  /**
   * 🎯 Find similar document types using Levenshtein distance
   */
  private static findSimilarTypes(input: string, candidates: string[]): string[] {
    const similarities = candidates.map(candidate => ({
      type: candidate,
      distance: this.levenshteinDistance(input.toLowerCase(), candidate.toLowerCase())
    }));

    // Return types with distance <= 3, sorted by similarity
    return similarities
      .filter(item => item.distance <= 3)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3) // Max 3 suggestions
      .map(item => item.type);
  }

  /**
   * 💀 Calculate Levenshtein distance between two strings
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  // ============================================================================
  // UTILITY VALIDATORS
  // ============================================================================

  /**
   * 🎸 Quick validation helpers
   */
  public static isValidExtensionForType(extension: string, documentType: UnifiedDocumentType): boolean {
    const mapping = UNIFIED_TO_MAPPING_MAP.get(documentType);
    return mapping?.allowedExtensions.includes(extension.toLowerCase()) || false;
  }

  public static isValidSizeForType(sizeBytes: number, documentType: UnifiedDocumentType): boolean {
    const maxSize = SIZE_VALIDATION_MAP.get(documentType);
    return maxSize ? sizeBytes <= maxSize : false;
  }

  public static doesTypeRequireConsent(documentType: UnifiedDocumentType): boolean {
    return CONSENT_REQUIRED_SET.has(documentType);
  }

  public static getMaxSizeForType(documentType: UnifiedDocumentType): number {
    return SIZE_VALIDATION_MAP.get(documentType) || 25 * 1024 * 1024; // 25MB default
  }

  public static getAllowedExtensionsForType(documentType: UnifiedDocumentType): string[] {
    const mapping = UNIFIED_TO_MAPPING_MAP.get(documentType);
    return mapping?.allowedExtensions || ['.pdf'];
  }

  // ============================================================================
  // PERFORMANCE VALIDATION
  // ============================================================================

  /**
   * ⚡ Validate mapping performance requirements
   */
  public static validatePerformanceRequirements(
    executionTimeMs: number,
    cacheHitRate: number,
    errorRate: number
  ): MappingValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Performance thresholds
    const MAX_EXECUTION_TIME = 100; // ms
    const MIN_CACHE_HIT_RATE = 0.7; // 70%
    const MAX_ERROR_RATE = 0.05; // 5%

    if (executionTimeMs > MAX_EXECUTION_TIME) {
      errors.push(`Execution time ${executionTimeMs}ms exceeds threshold ${MAX_EXECUTION_TIME}ms`);
    }

    if (cacheHitRate < MIN_CACHE_HIT_RATE) {
      warnings.push(`Cache hit rate ${(cacheHitRate * 100).toFixed(1)}% below optimal ${MIN_CACHE_HIT_RATE * 100}%`);
    }

    if (errorRate > MAX_ERROR_RATE) {
      errors.push(`Error rate ${(errorRate * 100).toFixed(1)}% exceeds threshold ${MAX_ERROR_RATE * 100}%`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // ============================================================================
  // COMPREHENSIVE VALIDATION
  // ============================================================================

  /**
   * 🚀 Master validation function - validates everything
   */
  public static validateMappingOperation(
    inputType: string,
    targetDirection: 'UNIFIED_TO_LEGACY' | 'LEGACY_TO_UNIFIED',
    file?: File | { name: string; size: number }
  ): MappingValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Validate input type based on direction
    let typeValidation: MappingValidationResult;
    if (targetDirection === 'UNIFIED_TO_LEGACY') {
      typeValidation = this.validateUnifiedType(inputType);
    } else {
      typeValidation = this.validateLegacyType(inputType);
    }

    errors.push(...typeValidation.errors);
    warnings.push(...typeValidation.warnings);
    if (typeValidation.suggestions) {
      suggestions.push(...typeValidation.suggestions);
    }

    // If we have a file and the type is valid, validate file
    if (file && typeValidation.isValid && targetDirection === 'UNIFIED_TO_LEGACY') {
      const fileValidation = this.validateFile(file, inputType as UnifiedDocumentType);
      errors.push(...fileValidation.errors);
      warnings.push(...fileValidation.warnings);
      if (fileValidation.suggestions) {
        suggestions.push(...fileValidation.suggestions);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions: suggestions.length > 0 ? suggestions : undefined
    };
  }
}

// ============================================================================
// EXPORT EVERYTHING
// ============================================================================

export default MappingValidators;

/**
 * 🎸 PUNK VALIDATION PRINCIPLES:
 * 
 * ✅ STRICT BUT HELPFUL: Clear errors + suggestions
 * ✅ PERFORMANCE AWARE: Validates service performance  
 * ✅ FILE SAFETY: Extension + size + consent validation
 * ✅ FUZZY MATCHING: Intelligent type suggestions
 * ✅ BATCH SUPPORT: Validate multiple operations
 * ✅ CATEGORY LOGIC: Consistency across document types
 * 
 * "Validate hard, fail gracefully, suggest intelligently!" 🎸⚡💀
 */
