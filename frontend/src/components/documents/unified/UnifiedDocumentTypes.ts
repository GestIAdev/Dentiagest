/**
 * 🗂️ UNIFIED DOCUMENT TYPES v2.0
 * By PunkClaude & Team Anarquista - Revolutionary Type System
 * 
 * 🎯 PURPOSE:
 * - Centralized type definitions for unified document system
 * - Frontend-backend type synchronization
 * - Legal compliance categorization
 * - AI-ready smart tags interface
 */

// 🏛️ LEGAL CATEGORIES - High-level compliance grouping
export enum LegalCategory {
  MEDICAL = "medical",           // GDPR Article 9 - Special category data
  ADMINISTRATIVE = "administrative", // Standard administrative documents
  BILLING = "billing",           // Financial and billing records
  LEGAL = "legal"               // Legal documents and contracts
}

// 🗂️ UNIFIED DOCUMENT TYPES - Simplified from 23 legacy types to 16
export enum UnifiedDocumentType {
  // 🏥 MEDICAL TYPES (GDPR Art. 9 protected)
  XRAY = "xray",                    // All X-ray types unified
  PHOTO_CLINICAL = "photo_clinical", // All clinical photos unified  
  VOICE_NOTE = "voice_note",        // Voice recordings and transcriptions
  TREATMENT_PLAN = "treatment_plan", // Treatment plans and protocols
  LAB_REPORT = "lab_report",        // Laboratory analysis reports
  PRESCRIPTION = "prescription",     // Prescriptions and medications
  SCAN_3D = "scan_3d",             // STL files and 3D scans
  
  // 📋 ADMINISTRATIVE TYPES
  CONSENT_FORM = "consent_form",    // Patient consent forms
  INSURANCE_FORM = "insurance_form", // Insurance documents
  DOCUMENT_GENERAL = "document_general", // General documents
  
  // 💰 BILLING TYPES  
  INVOICE = "invoice",              // Invoices and billing
  BUDGET = "budget",                // Treatment budgets and estimates
  PAYMENT_PROOF = "payment_proof",  // Payment receipts and proofs
  
  // ⚖️ LEGAL TYPES
  REFERRAL_LETTER = "referral_letter", // Medical referrals
  LEGAL_DOCUMENT = "legal_document"    // Legal documents and contracts
}

// 🏷️ SMART TAGS INTERFACE - AI-ready tagging system
export interface SmartTag {
  id: string;
  documentId: string;
  unifiedType: UnifiedDocumentType;
  legalCategory: LegalCategory;
  
  // 🤖 AI GENERATED TAGS
  aiAnatomy?: string[];          // ['tooth_1', 'mandible', 'maxilla']
  aiCondition?: string[];        // ['caries', 'crown_preparation']
  aiTreatment?: string[];        // ['root_canal', 'implant']
  aiQuality?: string[];          // ['excellent', 'diagnostic_quality']
  aiUrgency?: string[];          // ['routine', 'urgent', 'emergency']
  aiConfidence?: number;         // 0.00 - 1.00 confidence score
  
  // 👤 MANUAL TAGS
  manualTags?: string[];         // User-added tags
  manualPriority?: 'low' | 'medium' | 'high' | 'urgent';
  
  // 🔍 SEARCHABLE TAGS (combined AI + manual)
  searchableTags?: string[];     // All searchable terms
  
  // 📊 METADATA
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
}

// 🚀 AI FEATURES INTERFACES

export interface VoiceTags {
  transcription?: string;        // Voice-to-text transcription
  language?: string;             // Detected language
  confidence?: number;           // Transcription confidence
  keywords?: string[];           // Extracted keywords
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface AIAnalysisResult {
  analysisType: string;          // Type of analysis performed
  confidence: number;            // Overall confidence score
  results: Record<string, any>;  // Analysis results
  processingTime?: number;       // Processing time in seconds
  modelVersion?: string;         // AI model version
}

export interface AestheticTags {
  smileAnalysis?: Record<string, any>;    // Smile analysis results
  toothShade?: string[];                  // Tooth shade analysis
  symmetryScore?: number;                 // Facial symmetry score (0-1)
  recommendations?: string[];             // Aesthetic recommendations
}

export interface ProstheticTags {
  measurements?: Record<string, number>;  // Prosthetic measurements
  materialSuggestions?: string[];         // Material recommendations
  workflowSteps?: string[];               // Recommended workflow
  complexityScore?: number;               // Procedure complexity (0-1)
}

// 📄 DOCUMENT INTERFACE - Enhanced document model
export interface UnifiedDocument {
  id: string;
  patientId: string;
  filename: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  
  // 🗂️ UNIFIED CLASSIFICATION
  unifiedType: UnifiedDocumentType;
  legalCategory: LegalCategory;
  
  // 📊 METADATA
  description?: string;
  notes?: string;
  uploadDate: string;
  uploadedBy: string;
  
  // 🛡️ LEGAL PROTECTION
  isProtected: boolean;
  retentionUntil?: string;
  deletionRequested: boolean;
  
  // 🤖 AI FEATURES
  isAiReady: boolean;            // Whether document supports AI analysis
  hasSmartTags: boolean;         // Whether document has smart tags
  smartTags?: SmartTag;          // Associated smart tags
  
  // 🎨 VISUAL PROPERTIES (IAnarkalendar-inspired)
  colorScheme: {
    bg: string;
    border: string;
    accent: string;
    badge: string;
  };
  
  // 🔍 COMPUTED PROPERTIES
  typeDisplayName: string;       // Human-readable type name
  categoryDisplayName: string;   // Human-readable category name
}

// 🎨 VISUAL THEMES - IAnarkalendar-inspired color schemes
export const LegalCategoryThemes: Record<LegalCategory, {
  bg: string;
  border: string;
  accent: string;
  badge: string;
  icon: string;
}> = {
  [LegalCategory.MEDICAL]: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    accent: 'text-red-600 dark:text-red-400',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    icon: '🏥'
  },
  [LegalCategory.ADMINISTRATIVE]: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    accent: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    icon: '📋'
  },
  [LegalCategory.BILLING]: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    accent: 'text-green-600 dark:text-green-400',
    badge: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    icon: '💰'
  },
  [LegalCategory.LEGAL]: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-800',
    accent: 'text-purple-600 dark:text-purple-400',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    icon: '⚖️'
  }
};

// 🗂️ TYPE DISPLAY NAMES - Human-readable labels
export const UnifiedDocumentTypeLabels: Record<UnifiedDocumentType, string> = {
  [UnifiedDocumentType.XRAY]: "Radiografía",
  [UnifiedDocumentType.PHOTO_CLINICAL]: "Fotografía Clínica", 
  [UnifiedDocumentType.VOICE_NOTE]: "Nota de Voz",
  [UnifiedDocumentType.TREATMENT_PLAN]: "Plan de Tratamiento",
  [UnifiedDocumentType.LAB_REPORT]: "Reporte de Laboratorio",
  [UnifiedDocumentType.PRESCRIPTION]: "Prescripción",
  [UnifiedDocumentType.SCAN_3D]: "Escaneo 3D",
  [UnifiedDocumentType.CONSENT_FORM]: "Formulario de Consentimiento",
  [UnifiedDocumentType.INSURANCE_FORM]: "Formulario de Seguro",
  [UnifiedDocumentType.DOCUMENT_GENERAL]: "Documento General",
  [UnifiedDocumentType.INVOICE]: "Factura",
  [UnifiedDocumentType.BUDGET]: "Presupuesto",
  [UnifiedDocumentType.PAYMENT_PROOF]: "Comprobante de Pago",
  [UnifiedDocumentType.REFERRAL_LETTER]: "Carta de Derivación",
  [UnifiedDocumentType.LEGAL_DOCUMENT]: "Documento Legal"
};

// 🏛️ LEGAL CATEGORY LABELS - Human-readable labels
export const LegalCategoryLabels: Record<LegalCategory, string> = {
  [LegalCategory.MEDICAL]: "Médico - GDPR Art. 9",
  [LegalCategory.ADMINISTRATIVE]: "Administrativo",
  [LegalCategory.BILLING]: "Facturación", 
  [LegalCategory.LEGAL]: "Legal"
};

// 🔄 LEGACY MAPPING - For backward compatibility
export const LegacyToUnifiedMapping: Record<string, UnifiedDocumentType> = {
  // X-ray mappings
  'xray_bitewing': UnifiedDocumentType.XRAY,
  'xray_panoramic': UnifiedDocumentType.XRAY,
  'xray_periapical': UnifiedDocumentType.XRAY,
  'xray_cephalometric': UnifiedDocumentType.XRAY,
  'ct_scan': UnifiedDocumentType.XRAY,
  'cbct_scan': UnifiedDocumentType.XRAY,
  
  // Photo mappings
  'intraoral_photo': UnifiedDocumentType.PHOTO_CLINICAL,
  'extraoral_photo': UnifiedDocumentType.PHOTO_CLINICAL,
  'clinical_photo': UnifiedDocumentType.PHOTO_CLINICAL,
  'progress_photo': UnifiedDocumentType.PHOTO_CLINICAL,
  'before_after_photo': UnifiedDocumentType.PHOTO_CLINICAL,
  
  // Other mappings
  'voice_note': UnifiedDocumentType.VOICE_NOTE,
  'treatment_plan': UnifiedDocumentType.TREATMENT_PLAN,
  'lab_report': UnifiedDocumentType.LAB_REPORT,
  'prescription': UnifiedDocumentType.PRESCRIPTION,
  'stl_file': UnifiedDocumentType.SCAN_3D,
  'scan_impression': UnifiedDocumentType.SCAN_3D,
  'consent_form': UnifiedDocumentType.CONSENT_FORM,
  'insurance_form': UnifiedDocumentType.INSURANCE_FORM,
  'other_document': UnifiedDocumentType.DOCUMENT_GENERAL,
  'referral_letter': UnifiedDocumentType.REFERRAL_LETTER
};

// 🛠️ UTILITY FUNCTIONS

export const getDocumentTypeLabel = (type: UnifiedDocumentType): string => {
  return UnifiedDocumentTypeLabels[type] || type;
};

export const getLegalCategoryLabel = (category: LegalCategory): string => {
  return LegalCategoryLabels[category] || category;
};

export const getDocumentTheme = (category: LegalCategory) => {
  return LegalCategoryThemes[category] || LegalCategoryThemes[LegalCategory.ADMINISTRATIVE];
};

export const getLegalCategoryFromType = (type: UnifiedDocumentType): LegalCategory => {
  // Medical types
  if ([
    UnifiedDocumentType.XRAY,
    UnifiedDocumentType.PHOTO_CLINICAL,
    UnifiedDocumentType.VOICE_NOTE,
    UnifiedDocumentType.TREATMENT_PLAN,
    UnifiedDocumentType.LAB_REPORT,
    UnifiedDocumentType.PRESCRIPTION,
    UnifiedDocumentType.SCAN_3D
  ].includes(type)) {
    return LegalCategory.MEDICAL;
  }
  
  // Billing types
  if ([
    UnifiedDocumentType.INVOICE,
    UnifiedDocumentType.BUDGET,
    UnifiedDocumentType.PAYMENT_PROOF
  ].includes(type)) {
    return LegalCategory.BILLING;
  }
  
  // Legal types
  if ([
    UnifiedDocumentType.CONSENT_FORM,
    UnifiedDocumentType.REFERRAL_LETTER,
    UnifiedDocumentType.LEGAL_DOCUMENT
  ].includes(type)) {
    return LegalCategory.LEGAL;
  }
  
  // Default to administrative
  return LegalCategory.ADMINISTRATIVE;
};

export const isAiReadyDocumentType = (type: UnifiedDocumentType): boolean => {
  return [
    UnifiedDocumentType.XRAY,
    UnifiedDocumentType.PHOTO_CLINICAL,
    UnifiedDocumentType.VOICE_NOTE,
    UnifiedDocumentType.SCAN_3D
  ].includes(type);
};

// 🔄 MIGRATION HELPERS

export const convertLegacyToUnified = (legacyType: string): UnifiedDocumentType => {
  return LegacyToUnifiedMapping[legacyType] || UnifiedDocumentType.DOCUMENT_GENERAL;
};

export const getUnifiedTypeOptions = (): Array<{ value: UnifiedDocumentType; label: string; category: LegalCategory }> => {
  return Object.values(UnifiedDocumentType).map(type => ({
    value: type,
    label: getDocumentTypeLabel(type),
    category: getLegalCategoryFromType(type)
  }));
};

export const getLegalCategoryOptions = (): Array<{ value: LegalCategory; label: string }> => {
  return Object.values(LegalCategory).map(category => ({
    value: category,
    label: getLegalCategoryLabel(category)
  }));
};

// 📊 STATISTICS HELPERS

export const getDocumentTypeStats = (documents: UnifiedDocument[]) => {
  const stats = new Map<UnifiedDocumentType, number>();
  
  documents.forEach(doc => {
    stats.set(doc.unifiedType, (stats.get(doc.unifiedType) || 0) + 1);
  });
  
  return Array.from(stats.entries()).map(([type, count]) => ({
    type,
    label: getDocumentTypeLabel(type),
    count,
    percentage: (count / documents.length) * 100
  }));
};

export const getLegalCategoryStats = (documents: UnifiedDocument[]) => {
  const stats = new Map<LegalCategory, number>();
  
  documents.forEach(doc => {
    stats.set(doc.legalCategory, (stats.get(doc.legalCategory) || 0) + 1);
  });
  
  return Array.from(stats.entries()).map(([category, count]) => ({
    category,
    label: getLegalCategoryLabel(category),
    count,
    percentage: (count / documents.length) * 100
  }));
};

export default {
  LegalCategory,
  UnifiedDocumentType,
  LegalCategoryThemes,
  UnifiedDocumentTypeLabels,
  LegalCategoryLabels,
  getDocumentTypeLabel,
  getLegalCategoryLabel,
  getDocumentTheme,
  getLegalCategoryFromType,
  isAiReadyDocumentType
};
