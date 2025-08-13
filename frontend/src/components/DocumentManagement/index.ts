// DOCUMENT_MANAGEMENT: Module Exports
/**
 * Document Management System - Public API
 * 
 * Clean exports for the Document Management Empire
 */

export { DocumentManagement } from './DocumentManagement.tsx';
export { DocumentUpload, DocumentType, AccessLevel } from './DocumentUpload.tsx';
export { DocumentList } from './DocumentList.tsx';
export { DocumentViewer } from './DocumentViewer.tsx';
export { PatientSelector } from './PatientSelector.tsx';
export { DocumentCategories, DocumentCategory } from './DocumentCategories.tsx';

// Re-export types for external usage
export type { DocumentType as DocumentTypeEnum, AccessLevel as AccessLevelEnum } from './DocumentUpload.tsx';
