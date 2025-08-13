// DOCUMENT_MANAGEMENT: Main Container Component - HYBRID PUNK PERFECTION
/**
 * DocumentManagement Container - CYBERPUNK SCHERZO EDITION
 * 
 * Fusion sublime de chaos y order:
 * ✅ Compact categories con neon vibes
 * ✅ Single-line controls (ZERO SCROLL PHILOSOPHY)
 * ✅ Maximum workspace area
 * ✅ Role-based permissions
 * ✅ Global & specific patient modes
 */

import React, { useState } from 'react';
import { DocumentUpload } from './DocumentUpload.tsx';
import { DocumentList } from './DocumentList.tsx';
import { DocumentViewer } from './DocumentViewer.tsx';
import { PatientSelector } from './PatientSelector.tsx';
import { DocumentCategories, DocumentCategory } from './DocumentCategories.tsx';
import { 
  CloudArrowUpIcon,
  FolderOpenIcon 
} from '@heroicons/react/24/outline';

interface DocumentManagementProps {
  patientId?: string;           // ← OPTIONAL: undefined = GLOBAL MODE
  medicalRecordId?: string;     // ← OPTIONAL: undefined = ALL RECORDS
  appointmentId?: string;
  className?: string;
}

interface MedicalDocument {
  id: string;
  title: string;
  description?: string;
  file_name: string;
  file_size_mb: number;
  mime_type: string;
  is_image: boolean;
  is_xray: boolean;
  ai_analyzed: boolean;
  ai_confidence_scores?: any;
  ocr_extracted_text?: string;
  ai_tags?: string[];
  ai_analysis_results?: any;
  download_url: string;
  thumbnail_url?: string;
  created_at: string;
  document_date?: string;
  patient?: {
    first_name: string;
    last_name: string;
  };
}

export const DocumentManagement: React.FC<DocumentManagementProps> = ({
  patientId: initialPatientId,
  medicalRecordId,
  appointmentId,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'list'>('list');
  const [selectedDocument, setSelectedDocument] = useState<MedicalDocument | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // 🌍 GLOBAL MODE: Dynamic patient selection
  const [globalPatientId, setGlobalPatientId] = useState<string | undefined>(initialPatientId);
  
  // 📂 DOCUMENT CATEGORY SELECTION
  const [activeCategory, setActiveCategory] = useState<DocumentCategory>(DocumentCategory.MEDICAL);
  
  // 🎯 EFFECTIVE PATIENT ID (initial override or global selection)
  const effectivePatientId = initialPatientId || globalPatientId;
  
  // 🔄 IS GLOBAL MODE?
  const isGlobalMode = !initialPatientId;

  // 🔄 REFRESH HANDLER after successful upload
  const handleUploadComplete = (documents: any[]) => {
    setRefreshKey(prev => prev + 1);
    // TODO: Show success notification with document count
    console.log(`Successfully uploaded ${documents.length} documents`);
  };

  // ❌ ERROR HANDLER for upload failures
  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
    // TODO: Show user-friendly error notification
  };

  // 👁️ DOCUMENT SELECTION for viewing
  const handleDocumentSelect = (document: MedicalDocument) => {
    setSelectedDocument(document);
  };

  return (
    <div className={`${className}`}>
      {/* 🎵 COMPACT CATEGORIES */}
      <DocumentCategories
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* 🎛️ COMPACT CONTROLS - Single Line */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* LEFT: Patient Selector (Global Mode) */}
          <div className="flex items-center space-x-4">
            {isGlobalMode && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Paciente:</span>
                <PatientSelector
                  selectedPatientId={globalPatientId}
                  onPatientChange={setGlobalPatientId}
                  className="w-64"
                />
              </div>
            )}
          </div>

          {/* RIGHT: Action Tabs */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'list'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-white hover:text-blue-600'
              }`}
            >
              <FolderOpenIcon className="h-4 w-4" />
              <span>Ver Documentos</span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'upload'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-white hover:text-blue-600'
              }`}
            >
              <CloudArrowUpIcon className="h-4 w-4" />
              <span>Subir</span>
            </button>
          </div>
        </div>
      </div>

      {/* 📄 MAXIMUM WORKSPACE AREA - ZERO SCROLL HEAVEN */}
      <div className="p-6">
        {activeTab === 'upload' ? (
          <DocumentUpload
            patientId={effectivePatientId || ''}
            medicalRecordId={medicalRecordId}
            appointmentId={appointmentId}
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
          />
        ) : (
          <DocumentList
            key={refreshKey}
            patientId={effectivePatientId}
            medicalRecordId={medicalRecordId}
            onDocumentSelect={handleDocumentSelect}
          />
        )}
      </div>

      {/* 🖼️ DOCUMENT VIEWER MODAL */}
      <DocumentViewer
        document={selectedDocument}
        isOpen={!!selectedDocument}
        onClose={() => setSelectedDocument(null)}
      />
    </div>
  );
};
