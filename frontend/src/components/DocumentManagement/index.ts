// DOCUMENT_MANAGEMENT: Module Exports
/**
 * Document Management System - Public API
 * 
 * Clean exports for the Document Management Empire
 */

export { default as DocumentManagement } from './CyberpunkDocumentTabs';
export { DocumentUpload, UnifiedDocumentType, AccessLevel } from './DocumentUpload';
export { DocumentList } from './DocumentList';
export { DocumentViewer } from './DocumentViewer';
export { PatientSelector } from './PatientSelector';
export { DocumentCategories, DocumentCategory } from './DocumentCategories';

// Re-export types for external usage
export type { UnifiedDocumentType as DocumentTypeEnum, AccessLevel as AccessLevelEnum } from './DocumentUpload';

