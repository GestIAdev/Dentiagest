// ENHANCED_DOCUMENT_MANAGEMENT: Complete Document Revolution
/**
 * EnhancedDocumentManagement Container - UNIFIED SYSTEM INTEGRATION
 * 
 * Integra el nuevo 3-Layer Tag System con:
 * ✅ Unified document types
 * ✅ Legal framework compliance
 * ✅ Enhanced visual cards
 * ✅ AI features ready
 * ✅ Smart categorization
 * ✅ IAnarkalendar-inspired UX
 * 
 * MIGRATION STRATEGY:
 * - Mantiene compatibilidad con sistema actual
 * - Mapea legacy types a unified types
 * - Preserva todo el marco legal existente
 * - Añade nuevas capacidades visuales
 */

import React, { useState, useEffect } from 'react';
import apolloGraphQL from '../../services/apolloGraphQL'; // 🥷 STEALTH GRAPHQL NINJA MODE
import { EnhancedDocumentGrid } from './EnhancedDocumentGrid';
import { DocumentUpload } from './DocumentUpload';
import { DocumentViewer } from './DocumentViewer';
import { PatientSelector } from './PatientSelector';
import { 
  LegalCategory,
  DocumentCardThemes,
  SmartCategorization 
} from '../../types/UnifiedDocumentTypes';
import { useAuth } from '../../context/AuthContext';
import {
  CloudArrowUpIcon,
  FolderOpenIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  Squares2X2Icon,
  ListBulletIcon,
  FunnelIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

interface MedicalDocument {
  id: string;
  patient_id: string;
  title: string;
  description?: string;
  document_type: string;
  category: string;
  file_name: string;
  file_size: number;
  file_size_mb: number;
  mime_type: string;
  access_level: string;
  is_confidential: boolean;
  created_at: string;
  document_date?: string;
  
  // AI Analysis
  ai_analyzed: boolean;
  ai_confidence_scores?: any;
  ocr_extracted_text?: string;
  ai_tags?: string[];
  
  // Patient info
  patient?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  
  // Computed
  age_days: number;
  is_image: boolean;
  is_xray: boolean;
  download_url: string;
  thumbnail_url?: string;
}

interface EnhancedDocumentManagementProps {
  patientId?: string;
  medicalRecordId?: string;
  appointmentId?: string;
  className?: string;
}

export const EnhancedDocumentManagement: React.FC<EnhancedDocumentManagementProps> = ({
  patientId: initialPatientId,
  medicalRecordId,
  appointmentId,
  className = ''
}) => {
  
  // 🎛️ STATE MANAGEMENT
  const [activeTab, setActiveTab] = useState<'upload' | 'list'>('list');
  const [selectedDocument, setSelectedDocument] = useState<MedicalDocument | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  
  // 🌍 GLOBAL MODE: Dynamic patient selection
  const [globalPatientId, setGlobalPatientId] = useState<string | undefined>(initialPatientId);
  
  // 🗂️ ENHANCED FILTERING
  const [selectedCategory, setSelectedCategory] = useState<LegalCategory | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // 🎯 EFFECTIVE PATIENT ID
  const effectivePatientId = initialPatientId || globalPatientId;
  const isGlobalMode = !initialPatientId;
  
  const { state } = useAuth();

  // � DYNAMIC API URL HELPER - Future v2 compatibility
  const getDocumentListUrl = (): string => {
    const useV2Api = false; // Feature flag for future
    
    if (useV2Api) {
      return '/graphql/documents/list'; // 🥷 STEALTH GraphQL route
    } else {
      return '/graphql/medical-records/documents/list'; // 🥷 STEALTH GraphQL route
    }
  };

  // �📊 LOAD DOCUMENTS
  useEffect(() => {
    loadDocuments();
  }, [effectivePatientId, selectedCategory, refreshKey]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: '1',
        size: '50',
        sort_by: 'created_at',
        sort_order: 'desc'
      });
      
      if (effectivePatientId) {
        params.append('patient_id', effectivePatientId);
      }
      
      // 🚀 APOLLO API - Load documents with parameters
      const response = await apolloGraphQL.docs.list(params.toString());
      
      if (response && response.success && response.data) {
        setDocuments(response.data);
      } else {
        console.error('❌ Apollo API - Error loading documents:', response);
      }
    } catch (error) {
      console.error('❌ Apollo API - Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 REFRESH HANDLER after successful upload
  const handleUploadComplete = (uploadedDocuments: any[]) => {
    setRefreshKey(prev => prev + 1);
    setActiveTab('list');
    // TODO: Show success notification
  };

  // ❌ ERROR HANDLER for upload failures
  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
    // TODO: Show user-friendly error notification
  };

  // 👁️ DOCUMENT ACTIONS
  const handleDocumentView = (document: MedicalDocument) => {
    setSelectedDocument(document);
  };

  const handleDocumentDownload = (document: MedicalDocument) => {
    window.open(document.download_url, '_blank');
  };

  const handleDocumentDelete = async (document: MedicalDocument) => {
    // TODO: Implement delete with legal framework checks
    console.log('Delete document:', document.id);
  };

  // 🎨 GET CATEGORY BUTTON STYLE
  const getCategoryButtonStyle = (category: LegalCategory, isActive: boolean) => {
    const theme = DocumentCardThemes[category];
    
    if (isActive) {
      return {
        background: theme.gradient,
        color: 'white',
        borderColor: theme.border
      };
    }
    
    return {
      borderColor: theme.primary,
      color: theme.primary,
      backgroundColor: 'transparent'
    };
  };

  // 🏷️ GET CATEGORY DISPLAY NAME
  const getCategoryDisplayName = (category: LegalCategory): string => {
    switch (category) {
      case LegalCategory.MEDICAL: return 'Médicos';
      case LegalCategory.ADMINISTRATIVE: return 'Administrativos';
      case LegalCategory.BILLING: return 'Facturación';
      case LegalCategory.LEGAL: return 'Legales';
      default: return 'Todos';
    }
  };

  return (
    <div className={`bg-white min-h-screen ${className}`}>
      {/* 🎵 ENHANCED HEADER */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        {/* MAIN TOOLBAR */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* LEFT: Patient Selector & Search */}
            <div className="flex items-center space-x-4">
              {isGlobalMode && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Paciente:</span>
                  <PatientSelector
                    selectedPatientId={globalPatientId}
                    onPatientChange={setGlobalPatientId}
                    className="min-w-64 max-w-96"
                  />
                </div>
              )}
              
              {/* SEARCH BAR */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar documentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
            </div>

            {/* RIGHT: View Controls & Actions */}
            <div className="flex items-center space-x-3">
              {/* VIEW MODE TOGGLE */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <Squares2X2Icon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <ListBulletIcon className="h-5 w-5" />
                </button>
              </div>

              {/* FILTERS TOGGLE */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${
                  showFilters 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <FunnelIcon className="h-5 w-5" />
                <span className="text-sm">Filtros</span>
              </button>

              {/* UPLOAD BUTTON */}
              <button
                onClick={() => setActiveTab(activeTab === 'upload' ? 'list' : 'upload')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'upload'
                    ? 'bg-gray-500 text-white hover:bg-gray-600'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {activeTab === 'upload' ? (
                  <>
                    <ArrowLeftIcon className="h-5 w-5" />
                    <span>Volver</span>
                  </>
                ) : (
                  <>
                    <CloudArrowUpIcon className="h-5 w-5" />
                    <span>Subir</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* CATEGORY FILTERS BAR */}
        {showFilters && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">Categorías:</span>
              
              {/* ALL CATEGORIES BUTTON */}
              <button
                onClick={() => setSelectedCategory(undefined)}
                className={`px-3 py-1 rounded-lg text-sm font-medium border transition-all ${
                  !selectedCategory
                    ? 'bg-gray-600 text-white border-gray-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Todos
              </button>
              
              {/* CATEGORY BUTTONS */}
              {Object.values(LegalCategory).map(category => {
                const theme = DocumentCardThemes[category];
                const isActive = selectedCategory === category;
                
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(isActive ? undefined : category)}
                    className="flex items-center space-x-2 px-3 py-1 rounded-lg text-sm font-medium border transition-all"
                    style={getCategoryButtonStyle(category, isActive)}
                  >
                    <span>{theme.icon}</span>
                    <span>{getCategoryDisplayName(category)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 📄 MAIN CONTENT */}
      <div className="p-6">
        {activeTab === 'upload' ? (
          /* 📤 UPLOAD MODE */
          <DocumentUpload
            patientId={effectivePatientId}
            medicalRecordId={medicalRecordId}
            appointmentId={appointmentId}
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
          />
        ) : (
          /* 🗂️ DOCUMENT GRID MODE */
          <>
            {/* CONTEXT INDICATOR */}
            {(effectivePatientId || selectedCategory) && (
              <div className="mb-6 flex items-center space-x-2 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                <FunnelIcon className="h-4 w-4 text-blue-500" />
                <span>Mostrando:</span>
                {effectivePatientId && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md font-medium">
                    Paciente específico
                  </span>
                )}
                {selectedCategory && (
                  <span 
                    className="px-2 py-1 rounded-md font-medium text-white"
                    style={{ backgroundColor: DocumentCardThemes[selectedCategory].primary }}
                  >
                    {getCategoryDisplayName(selectedCategory)}
                  </span>
                )}
              </div>
            )}

            {/* ENHANCED DOCUMENT GRID */}
            <EnhancedDocumentGrid
              documents={documents}
              loading={loading}
              selectedCategory={selectedCategory}
              searchTerm={searchTerm}
              viewMode={viewMode}
              onDocumentView={handleDocumentView}
              onDocumentDownload={handleDocumentDownload}
              onDocumentDelete={handleDocumentDelete}
            />
          </>
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

export default EnhancedDocumentManagement;

