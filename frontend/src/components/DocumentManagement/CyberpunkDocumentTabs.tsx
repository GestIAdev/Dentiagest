// DOCUMENT_MANAGEMENT: CYBERPUNK TABS REVOLUTION 🔥⚡
/**
 * Document Management - TABS SUPREMOS EDITION
 * 
 * 🎯 FILOSOFÍA: TABS VERDADEROS + BÚSQUEDA NINJA + ZERO NOISE
 * ✅ 5 Tabs reales: SUBIR | MÉDICOS | ADMIN | BILLING | LEGAL  
 * ✅ Búsqueda OCR discreta y potente
 * ✅ Máximo workspace, mínimo ruido
 * ✅ CÓDIGO = ARTE, MARKETING = RUIDO
 */

import React, { useState, useEffect } from 'react';
import { DocumentList } from './DocumentList';
import { DocumentViewer } from './DocumentViewer';
import SmartDocumentFlow from './SmartDocumentFlow';
import { usePatients } from '../../hooks/usePatients';
import { 
  CloudArrowUpIcon,
  CogIcon
} from '@heroicons/react/24/outline';

interface DocumentManagementProps {
  patientId?: string;           // ← OPTIONAL: undefined = GLOBAL MODE
  medicalRecordId?: string;     // ← OPTIONAL: undefined = ALL RECORDS
  appointmentId?: string;
  className?: string;
}

// 🔥 CYBERPUNK TABS ENUM
enum TabType {
  UPLOAD = 'upload',
  MEDICAL = 'medical', 
  ADMINISTRATIVE = 'administrative',
  BILLING = 'billing',
  LEGAL = 'legal'
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

const CyberpunkDocumentTabs: React.FC<DocumentManagementProps> = ({
  patientId: initialPatientId,
  medicalRecordId,
  appointmentId,
  className = ''
}) => {
  // 🎯 STATE MANAGEMENT 
  const [activeTab, setActiveTab] = useState<TabType>(TabType.MEDICAL);
  const [selectedDocument, setSelectedDocument] = useState<MedicalDocument | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // 🎯 PATIENTS DATA for smart detection
  const { patients } = usePatients();
  
  // 🌍 GLOBAL MODE: Dynamic patient selection
  const [globalPatientId, setGlobalPatientId] = useState<string | undefined>(initialPatientId);
  
  // 🎯 EFFECTIVE PATIENT ID (initial override or global selection)
  const effectivePatientId = initialPatientId || globalPatientId;
  
  // 🔄 IS GLOBAL MODE?
  const isGlobalMode = !initialPatientId;

  // REFRESH HANDLER after successful upload
  const handleUploadComplete = (documents: any[]) => {
    setRefreshKey(prev => prev + 1);
    setActiveTab(TabType.MEDICAL); // Auto-switch to medical tab after upload
  };

  // 👁️ DOCUMENT SELECTION for viewing
  const handleDocumentSelect = (document: MedicalDocument) => {
    setSelectedDocument(document);
  };

  // 🎯 TAB METADATA
  const tabMetadata = {
    [TabType.UPLOAD]: { icon: '📤', label: 'Subir', color: 'blue' },
    [TabType.MEDICAL]: { icon: '🏥', label: 'Médicos', color: 'red' },
    [TabType.ADMINISTRATIVE]: { icon: '📋', label: 'Admin', color: 'blue' },
    [TabType.BILLING]: { icon: '💰', label: 'Billing', color: 'green' },
    [TabType.LEGAL]: { icon: '⚖️', label: 'Legal', color: 'purple' }
  };

  // 🎨 TAB STYLE GENERATOR
  const getTabStyles = (tab: TabType) => {
    const metadata = tabMetadata[tab];
    const isActive = activeTab === tab;
    
    if (isActive) {
      const colorMap = {
        blue: 'bg-blue-500 text-white shadow-lg',
        red: 'bg-red-500 text-white shadow-lg',
        green: 'bg-green-500 text-white shadow-lg',
        purple: 'bg-purple-500 text-white shadow-lg'
      };
      return `px-6 py-3 rounded-t-lg font-medium transition-all duration-200 ${colorMap[metadata.color as keyof typeof colorMap]}`;
    }
    
    return 'px-6 py-3 rounded-t-lg font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-200';
  };

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* 🎭 CYBERPUNK TABS HEADER */}
      <div className="bg-white border-b border-gray-200">
        {/* 🔥 TABS ROW */}
        <div className="flex space-x-1 px-6 pt-4">
          {Object.values(TabType).map((tab) => {
            const metadata = tabMetadata[tab];
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={getTabStyles(tab)}
              >
                <span className="flex items-center space-x-2">
                  <span>{metadata.icon}</span>
                  <span>{metadata.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 🎯 TAB CONTENT */}
      <div className="flex-1 overflow-hidden">
        {activeTab === TabType.UPLOAD ? (
          // 📤 UPLOAD TAB - Clean, dedicated space
          <div className="h-full p-6">
            <SmartDocumentFlow
              effectivePatientId={effectivePatientId}
              globalPatientId={globalPatientId}
              isGlobalMode={isGlobalMode}
              onUploadComplete={handleUploadComplete}
              patients={patients || []}
            />
          </div>
        ) : (
          // 📋 DOCUMENT LISTS - Maximum workspace
          <div className="h-full">
            <DocumentList
              key={`${activeTab}-${refreshKey}-${effectivePatientId}`}
              patientId={effectivePatientId}
              medicalRecordId={medicalRecordId}
              categoryFilter={activeTab as any} // Use tab as category filter
              onDocumentSelect={handleDocumentSelect}
              className="h-full"
            />
          </div>
        )}
      </div>

      {/* 👁️ DOCUMENT VIEWER MODAL */}
      {selectedDocument && (
        <DocumentViewer
          isOpen={true}
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </div>
  );
};

export default CyberpunkDocumentTabs;

