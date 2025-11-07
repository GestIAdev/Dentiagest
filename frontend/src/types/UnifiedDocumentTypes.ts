// UNIFIED_DOCUMENT_TYPES: New 3-Layer Tag System
/**
 * UNIFIED DOCUMENT TYPE SYSTEM v2.0
 * By PunkClaude & Team Anarquista - Revolutionary Document Management
 * 
 * 🎯 SOLVES ENUM HELL:
 * - Unified frontend/backend types
 * - Legal framework compliance
 * - AI-ready tag structure
 * - Visual card system ready
 */

import React from 'react';

// 🏛️ LAYER 1: LEGAL CATEGORIES (4 fixed - NEVER CHANGE)
export enum LegalCategory {
  MEDICAL = 'medical',           // 🏥 Blindaje total - NEVER DELETE
  ADMINISTRATIVE = 'administrative', // 📋 Admin+Receptionist - 5 años
  BILLING = 'billing',           // 💰 Solo Admin - 7 años  
  LEGAL = 'legal'                // ⚖️ Solo Professional - 10 años
}

// 🗂️ LAYER 2: UNIFIED DOCUMENT TYPES (Simplified from 23 to 16)
export enum UnifiedDocumentType {
  // 🏥 MEDICAL TYPES (access_level: medical)
  XRAY = 'xray',                    // Todas las radiografías unificadas
  PHOTO_CLINICAL = 'photo_clinical', // Fotos clínicas unificadas
  VOICE_NOTE = 'voice_note',        // Notas de voz médicas
  TREATMENT_PLAN = 'treatment_plan', // Planes de tratamiento
  LAB_REPORT = 'lab_report',        // Reportes laboratorio
  PRESCRIPTION = 'prescription',     // Recetas médicas
  SCAN_3D = 'scan_3d',             // STL, DICOM, 3D files
  
  // 📋 ADMINISTRATIVE TYPES (access_level: administrative)  
  CONSENT_FORM = 'consent_form',    // Consentimientos
  INSURANCE_FORM = 'insurance_form', // Formularios seguro
  DOCUMENT_GENERAL = 'document_general', // Documentos generales
  
  // 💰 BILLING TYPES (access_level: administrative)
  INVOICE = 'invoice',              // Facturas
  BUDGET = 'budget',                // Presupuestos
  PAYMENT_PROOF = 'payment_proof',  // Comprobantes pago
  
  // ⚖️ LEGAL TYPES (access_level: medical/administrative)
  REFERRAL_LETTER = 'referral_letter', // Cartas derivación
  LEGAL_DOCUMENT = 'legal_document'    // Documentos legales
}

// 🤖 LAYER 3: SMART TAGS SYSTEM (AI + Manual)
export interface SmartTag {
  id: string;
  document_id: string;
  
  // UNIFIED CATEGORY & TYPE 
  category: LegalCategory;
  document_type: UnifiedDocumentType;
  
  // 🤖 AI GENERATED TAGS
  ai_anatomy: string[];        // ['molar', 'canino', 'incisivo']
  ai_condition: string[];      // ['caries', 'pulpitis', 'sano']
  ai_treatment: string[];      // ['endodoncia', 'empaste', 'extraccion']
  ai_quality: string[];        // ['excelente', 'buena', 'repetir']
  ai_urgency: string[];        // ['urgente', 'programada', 'control']
  ai_confidence: number;       // 0.95
  
  // 👤 MANUAL TAGS (User override)
  manual_tags: string[];       // ['urgente', 'seguimiento', 'revisar']
  manual_priority: 'urgent' | 'normal' | 'low';
  
  // 📊 SEARCHABLE TAGS (Combined + normalized)
  searchable_tags: string[];   // Auto-generated for fast search
  
  // 🚀 AI FEATURES INTEGRATION
  ai_features?: {
    voice_tags?: VoiceTags;
    analysis_result?: AIAnalysisResult;
    aesthetic_data?: AestheticTags;
    prosthetic_data?: ProstheticTags;
  };
  
  created_at: string;
  created_by: string;
}

// 🎤 VOICE DICTATION TAGS (AI Feature: Voice Assistant)
export interface VoiceTags {
  transcription_confidence: number;     // 0.95
  voice_commands: string[];             // ['caries', 'limpieza', 'cuadrante_3']
  dental_pieces: string[];              // ['36', '37', 'cuadrante_inferior_izquierdo']
  detected_actions: string[];           // ['diagnostico', 'tratamiento', 'seguimiento']
  whisper_model_version: string;        // "whisper-1"
  language_detected: string;            // "es-AR"
  medical_terminology_count: number;    // 12 términos médicos detectados
}

// 🖼️ AI IMAGE ANALYSIS TAGS (AI Feature: Medical Image Analysis)
export interface AIAnalysisResult {
  image_type: 'radiografia' | 'tomografia' | 'foto_clinica' | 'escaner_3d';
  detected_anomalies: string[];         // ['caries_profunda', 'fractura_radicular']
  confidence_score: number;             // 0.87
  recommended_actions: string[];        // ['endodoncia_urgente', 'seguimiento_3_meses']
  anatomical_regions: string[];        // ['molar_superior_derecho', 'incisivo_central']
  urgency_level: 'baja' | 'media' | 'alta' | 'urgente';
  claude_model_version: string;         // "claude-3-sonnet-20240229"
  analysis_timestamp: Date;
  requires_specialist: boolean;         // true si necesita especialista
  estimated_treatment_time: string;     // "2_semanas", "1_mes"
}

// 🎨 AESTHETIC SIMULATION TAGS (AI Feature: Treatment Previews)
export interface AestheticTags {
  treatment_type: 'blanqueamiento' | 'carillas' | 'ortodoncia' | 'reconstruccion' | 'implantes';
  before_after: 'original' | 'simulacion';
  patient_approval: boolean;            // True si el paciente aprobó
  simulation_quality: number;           // 0.92
  treatment_complexity: 'simple' | 'moderada' | 'compleja';
  dalle_model_version: string;          // "dall-e-3"
  generation_timestamp: Date;
  estimated_cost_range: string;         // "15000-25000_ARS"
  treatment_duration: string;           // "3_meses", "6_meses"
  materials_needed: string[];           // ['porcelana', 'composite']
}

// 🔬 3D PROSTHETICS TAGS (AI Feature: 3D Design Integration)
export interface ProstheticTags {
  file_type: 'stl' | 'obj' | 'ply' | 'step';
  prosthetic_type: 'corona' | 'puente' | 'implante' | 'protesis_completa' | 'retenedor';
  laboratory_ready: boolean;            // True si está listo para enviar
  patient_approved: boolean;            // True si paciente aprobó diseño
  material_type: string[];             // ['porcelana', 'zirconio', 'metal', 'resina']
  file_size_mb: number;                // 15.7
  geometry_complexity: 'simple' | 'moderada' | 'alta';
  three_js_compatible: boolean;         // True si se puede renderizar en 3D
  lab_partner: string;                 // "DentalLab_BuenosAires"
  estimated_production_days: number;   // 7
}

// 🗺️ LEGACY TO UNIFIED MAPPING (Migration Strategy)
export const LEGACY_TO_UNIFIED_MAPPING: Record<string, UnifiedDocumentType> = {
  // 🏥 MEDICAL MAPPINGS
  'xray_bitewing': UnifiedDocumentType.XRAY,
  'xray_panoramic': UnifiedDocumentType.XRAY,
  'xray_periapical': UnifiedDocumentType.XRAY,
  'xray_cephalometric': UnifiedDocumentType.XRAY,
  'ct_scan': UnifiedDocumentType.XRAY,
  'cbct_scan': UnifiedDocumentType.XRAY,
  
  'intraoral_photo': UnifiedDocumentType.PHOTO_CLINICAL,
  'extraoral_photo': UnifiedDocumentType.PHOTO_CLINICAL,
  'clinical_photo': UnifiedDocumentType.PHOTO_CLINICAL,
  'progress_photo': UnifiedDocumentType.PHOTO_CLINICAL,
  'before_after_photo': UnifiedDocumentType.PHOTO_CLINICAL,
  
  'voice_note': UnifiedDocumentType.VOICE_NOTE,
  'treatment_plan': UnifiedDocumentType.TREATMENT_PLAN,
  'lab_report': UnifiedDocumentType.LAB_REPORT,
  'prescription': UnifiedDocumentType.PRESCRIPTION,
  'stl_file': UnifiedDocumentType.SCAN_3D,
  'scan_impression': UnifiedDocumentType.SCAN_3D,
  
  // 📋 ADMINISTRATIVE MAPPINGS
  'consent_form': UnifiedDocumentType.CONSENT_FORM,
  'insurance_form': UnifiedDocumentType.INSURANCE_FORM,
  'other_document': UnifiedDocumentType.DOCUMENT_GENERAL,
  'address_proof': UnifiedDocumentType.DOCUMENT_GENERAL,
  'utility_bill': UnifiedDocumentType.DOCUMENT_GENERAL,
  'financial_document': UnifiedDocumentType.DOCUMENT_GENERAL,
  'general_document': UnifiedDocumentType.DOCUMENT_GENERAL,
  
  // 💰 BILLING MAPPINGS
  'insurance_document': UnifiedDocumentType.INVOICE,
  
  // ⚖️ LEGAL MAPPINGS
  'referral_letter': UnifiedDocumentType.REFERRAL_LETTER,
  'legal_document': UnifiedDocumentType.LEGAL_DOCUMENT
};

// 🎨 VISUAL CARD THEMES (IAnarkalendar inspired)
export const DocumentCardThemes = {
  [LegalCategory.MEDICAL]: {
    primary: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
    border: '#b91c1c',
    icon: '🏥',
    textColor: 'white',
    description: 'Documentos médicos protegidos'
  },
  [LegalCategory.ADMINISTRATIVE]: {
    primary: '#3b82f6', 
    gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    border: '#1d4ed8',
    icon: '📋',
    textColor: 'white',
    description: 'Documentos administrativos'
  },
  [LegalCategory.BILLING]: {
    primary: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #059669)', 
    border: '#047857',
    icon: '💰',
    textColor: 'white',
    description: 'Facturación y pagos'
  },
  [LegalCategory.LEGAL]: {
    primary: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    border: '#6d28d9', 
    icon: '⚖️',
    textColor: 'white',
    description: 'Documentos legales'
  }
};

// 🔄 UNIFIED TYPE LABELS (Spanish)
export const UnifiedTypeLabels: Record<UnifiedDocumentType, string> = {
  // 🏥 MEDICAL
  [UnifiedDocumentType.XRAY]: 'Radiografía',
  [UnifiedDocumentType.PHOTO_CLINICAL]: 'Foto Clínica',
  [UnifiedDocumentType.VOICE_NOTE]: 'Nota de Voz',
  [UnifiedDocumentType.TREATMENT_PLAN]: 'Plan de Tratamiento',
  [UnifiedDocumentType.LAB_REPORT]: 'Reporte de Laboratorio',
  [UnifiedDocumentType.PRESCRIPTION]: 'Prescripción',
  [UnifiedDocumentType.SCAN_3D]: 'Escaneo 3D',
  
  // 📋 ADMINISTRATIVE
  [UnifiedDocumentType.CONSENT_FORM]: 'Consentimiento',
  [UnifiedDocumentType.INSURANCE_FORM]: 'Formulario Seguro',
  [UnifiedDocumentType.DOCUMENT_GENERAL]: 'Documento General',
  
  // 💰 BILLING
  [UnifiedDocumentType.INVOICE]: 'Factura',
  [UnifiedDocumentType.BUDGET]: 'Presupuesto',
  [UnifiedDocumentType.PAYMENT_PROOF]: 'Comprobante de Pago',
  
  // ⚖️ LEGAL
  [UnifiedDocumentType.REFERRAL_LETTER]: 'Carta de Derivación',
  [UnifiedDocumentType.LEGAL_DOCUMENT]: 'Documento Legal'
};

// 🚀 AI FEATURE DETECTION (Future Integration)
export const AIFeatureDetection = {
  // 🎤 Voice detection patterns
  isVoiceCapable: (type: UnifiedDocumentType): boolean => {
    return type === UnifiedDocumentType.VOICE_NOTE;
  },
  
  // 🖼️ Image analysis capable
  isImageAnalysisCapable: (type: UnifiedDocumentType): boolean => {
    return [
      UnifiedDocumentType.XRAY,
      UnifiedDocumentType.PHOTO_CLINICAL,
      UnifiedDocumentType.SCAN_3D
    ].includes(type);
  },
  
  // 🎨 Aesthetic simulation capable
  isAestheticSimulationCapable: (type: UnifiedDocumentType): boolean => {
    return [
      UnifiedDocumentType.PHOTO_CLINICAL,
      UnifiedDocumentType.TREATMENT_PLAN
    ].includes(type);
  },
  
  // 🔬 3D prosthetic capable
  isProstheticCapable: (type: UnifiedDocumentType): boolean => {
    return type === UnifiedDocumentType.SCAN_3D;
  }
};

// 🏛️ LEGAL RETENTION POLICIES (Argentina Compliance)
export const LegalRetentionPolicies = {
  [LegalCategory.MEDICAL]: {
    deletable: false,           // 🚫 NEVER DELETE
    retention_years: 999,       // Retención permanente
    legal_basis: "Ley Nacional de Ejercicio de la Medicina",
    patient_safety_notice: "Protección permanente por seguridad del paciente"
  },
  [LegalCategory.ADMINISTRATIVE]: {
    deletable: true,            // ✅ Eliminable después de período
    retention_years: 5,         // 5 años retención legal
    legal_basis: "Ley 25.326 Art. 4 - Principio de Minimización"
  },
  [LegalCategory.LEGAL]: {
    deletable: true,
    retention_years: 10,        // 10 años por Código Civil
    legal_basis: "Código Civil Argentino - Prescripción decenal"
  },
  [LegalCategory.BILLING]: {
    deletable: true,
    retention_years: 7,         // 7 años AFIP
    legal_basis: "AFIP - Resolución General 1415"
  }
};

// 🎯 SMART CATEGORIZATION ENGINE
export const SmartCategorization = {
  // Detect category from file properties
  detectCategory: (filename: string, mimetype: string): LegalCategory => {
    const name = filename.toLowerCase();
    
    // 🏥 MEDICAL DETECTION
    // Añadimos paréntesis para evitar mezcla ambigua de operadores lógicos
    if (
      name.includes('rayos') ||
      name.includes('xray') ||
      name.includes('radiografia') ||
      (name.includes('foto') && (name.includes('clinica') || name.includes('intraoral'))) ||
      name.includes('voice') ||
      name.includes('nota') ||
      name.includes('tratamiento')
    ) {
      return LegalCategory.MEDICAL;
    }
    
    // 💰 BILLING DETECTION
    if (name.includes('factura') || name.includes('invoice') || name.includes('presupuesto') ||
        name.includes('budget') || name.includes('pago') || name.includes('payment')) {
      return LegalCategory.BILLING;
    }
    
    // ⚖️ LEGAL DETECTION
    if (name.includes('consentimiento') || name.includes('consent') || name.includes('contrato') ||
        name.includes('legal') || name.includes('derivacion') || name.includes('referral')) {
      return LegalCategory.LEGAL;
    }
    
    // 📋 DEFAULT: ADMINISTRATIVE
    return LegalCategory.ADMINISTRATIVE;
  },
  
  // Detect unified type from category + file properties
  detectUnifiedType: (category: LegalCategory, filename: string, mimetype: string): UnifiedDocumentType => {
    const name = filename.toLowerCase();
    const mime = mimetype.toLowerCase();
    
    switch (category) {
      case LegalCategory.MEDICAL:
        if (name.includes('rayos') || name.includes('xray') || name.includes('radiografia')) {
          return UnifiedDocumentType.XRAY;
        }
        if (mime.includes('audio')) {
          return UnifiedDocumentType.VOICE_NOTE;
        }
        if (name.includes('plan') || name.includes('tratamiento')) {
          return UnifiedDocumentType.TREATMENT_PLAN;
        }
        if (name.includes('stl') || name.includes('3d') || name.includes('escaner')) {
          return UnifiedDocumentType.SCAN_3D;
        }
        return UnifiedDocumentType.PHOTO_CLINICAL;
        
      case LegalCategory.BILLING:
        if (name.includes('presupuesto') || name.includes('budget')) {
          return UnifiedDocumentType.BUDGET;
        }
        if (name.includes('comprobante') || name.includes('pago')) {
          return UnifiedDocumentType.PAYMENT_PROOF;
        }
        return UnifiedDocumentType.INVOICE;
        
      case LegalCategory.LEGAL:
        if (name.includes('derivacion') || name.includes('referral')) {
          return UnifiedDocumentType.REFERRAL_LETTER;
        }
        return UnifiedDocumentType.CONSENT_FORM;
        
      case LegalCategory.ADMINISTRATIVE:
      default:
        if (name.includes('seguro') || name.includes('insurance')) {
          return UnifiedDocumentType.INSURANCE_FORM;
        }
        return UnifiedDocumentType.DOCUMENT_GENERAL;
    }
  }
};

// 🎨 ADVANCED CARD STYLING (IAnarkalendar inspired)
export const getAdvancedCardStyle = (
  category: LegalCategory, 
  urgency: 'urgent' | 'normal' | 'low' = 'normal',
  aiConfidence?: number
): React.CSSProperties => {
  const theme = DocumentCardThemes[category];
  let style: React.CSSProperties = {
    background: theme.gradient,
    borderLeft: `4px solid ${theme.border}`,
    color: theme.textColor
  };
  
  // 🚨 URGENCY MODIFIERS
  if (urgency === 'urgent') {
    style = {
      ...style,
      boxShadow: `0 0 15px ${theme.primary}80, 0 0 30px ${theme.primary}40`,
      animation: 'pulse 2s infinite'
    };
  }
  
  // 🤖 AI CONFIDENCE GLOW
  if (aiConfidence && aiConfidence > 0.9) {
    style = {
      ...style,
      boxShadow: `${style.boxShadow || ''}, 0 0 8px rgba(59, 130, 246, 0.5)`
    };
  }
  
  return style;
};

// 🏆 AGGREGATED NAMED EXPORT: Complete Unified System (avoid anonymous default export)
export const UnifiedDocumentSystem = {
  LegalCategory,
  UnifiedDocumentType,
  DocumentCardThemes,
  UnifiedTypeLabels,
  LegalRetentionPolicies,
  SmartCategorization,
  AIFeatureDetection,
  LEGACY_TO_UNIFIED_MAPPING,
  getAdvancedCardStyle,
};

// Also provide a default-like convenience export for legacy consumers who might have used default import
// but keep it named to satisfy the linter (do not use anonymous default export).
// NOTE: We intentionally DO NOT add `export default` here to comply with import/no-anonymous-default-export rule.

