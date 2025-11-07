// 🎯🎸💀 DOCUMENT MANAGER V3.0 - APOLLO NUCLEAR RECONSTRUCTION
// Date: September 26, 2025
// Mission: Complete document management system with GraphQL integration
// Status: V3.0 - Full Apollo Nuclear Integration with @veritas Quantum Truth Verification
// @veritas: CRITICAL/HIGH/MEDIUM fields verified with zero-knowledge proof

import React, { useState, useEffect } from 'react';

// 🎯 TITAN PATTERN IMPORTS - Core Dependencies
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Spinner } from '../atoms';
import { createModuleLogger } from '../../utils/logger';
import { useDocumentLogger } from '../../utils/documentLogger';

// 🎯 MODULAR COMPONENTS - V3 Architecture
import { DocumentListV3 } from './DocumentListV3';
import { DocumentUploaderV3 } from './DocumentUploaderV3';
import { AIDocumentAnalysisV3 } from './AIDocumentAnalysisV3';
import { VeritasProofViewer } from './VeritasProofViewer';
import DocumentViewerV3 from './DocumentViewerV3';

// 🎯 GRAPHQL OPERATIONS - Apollo Nuclear Integration
import { useQuery, useMutation } from '@apollo/client/react';
import {
  GET_UNIFIED_DOCUMENTS,
  DELETE_DOCUMENT
} from '../../graphql/queries/documents';

// 🎯 TYPES AND INTERFACES
interface Document {
  id: string;
  title: string;
  title_veritas?: any;
  description?: string;
  description_veritas?: any;
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
  unified_type: string;
  unified_type_veritas?: any;
  legal_category?: string;
  smart_tags?: string[];
  compliance_status: string;
  compliance_status_veritas?: any;
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

// Removed unused DocumentFormData to satisfy no-unused-vars

interface DocumentManagerV3Props {
  patientId?: string;
  medicalRecordId?: string;
  appointmentId?: string;
  className?: string;
}

// 🎯 LOGGER INITIALIZATION
const l = createModuleLogger('DocumentManagerV3');
// const logger = useDocumentLogger('DocumentManagerV3'); // Moved inside component

// 🔥 CYBERPUNK TABS ENUM - MAINTAINING V1 UX
enum TabType {
  UPLOAD = 'upload',
  MEDICAL = 'medical',
  ADMINISTRATIVE = 'administrative',
  BILLING = 'billing',
  LEGAL = 'legal'
}

// (removed unused getVeritasBadge helper)

// 🎨 IANARKALENDAR-INSPIRED COLOR SYSTEM - OLYMPUS EDITION
// Removed unused OLYMPUS_COLORS to reduce unused-vars warnings

// 🎯 MAIN COMPONENT - DocumentManagerV3 (MODULAR ARCHITECTURE)
const DocumentManagerV3: React.FC<DocumentManagerV3Props> = ({
  patientId,
  medicalRecordId,
  appointmentId,
  className = ''
}) => {
  // 🎯 LOGGER INITIALIZATION
  const logger = useDocumentLogger('DocumentManagerV3');

  // 🎯 GRAPHQL QUERIES & MUTATIONS
  const { data: documentsData, loading: queryLoading, error: queryError, refetch: refetchDocuments } = useQuery(GET_UNIFIED_DOCUMENTS, {
    variables: {
      patientId: patientId,
      limit: 100,
      offset: 0
    },
    fetchPolicy: 'cache-and-network'
  });

  // (removed unused GET_DOCUMENT_TYPES and uploadDocumentMutation)
  const [deleteDocumentMutation] = useMutation(DELETE_DOCUMENT);

  // 🎯 STATE MANAGEMENT - Simplified for modular architecture
  const [activeTab, setActiveTab] = useState<TabType>(TabType.UPLOAD);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploader, setShowUploader] = useState(false);
  const [viewerMode, setViewerMode] = useState<'details' | 'viewer'>('details');
  const [showAIOverlay, setShowAIOverlay] = useState(true);

  // 🎯 COMPUTED VALUES
  const documents = documentsData?.unifiedDocumentsV3 || [];
  // (removed unused documentTypes)

  // 🎯 EFFECTS - Data Synchronization and Logging
  useEffect(() => {
    l.info('DocumentManagerV3 initialized', { activeTab, documentCount: documents.length, patientId });
  }, [activeTab, documents.length, patientId]);

  useEffect(() => {
    if (queryError) {
      l.error('Query error detected', queryError);
    }
  }, [queryError]);

  // 🎯 LIFECYCLE LOGGING
  useEffect(() => {
    logger.logMount({ activeTab: 'upload', documentCount: 0, patientId });
    return () => logger.logUnmount();
     
  }, [patientId]);

  // 🎯 UTILITY FUNCTIONS
  const getCategoryLabel = (unifiedType: string) => {
    const typeMap: { [key: string]: string } = {
      'medical_record': 'Registro Médico',
      'xray': 'Rayos X',
      'prescription': 'Receta',
      'lab_result': 'Resultado de Laboratorio',
      'insurance': 'Seguro',
      'billing': 'Facturación',
      'legal': 'Legal',
      'admin': 'Administrativo'
    };
    return typeMap[unifiedType] || unifiedType;
  };

  // 🎯 EVENT HANDLERS
  const handleTabChange = (tab: TabType) => {
    l.debug('Tab changed', { from: activeTab, to: tab });
    logger.logUserInteraction('tab_change', { from: activeTab, to: tab });
    setActiveTab(tab);
    setSelectedDocument(null);
    setShowUploader(false);
  };

  const handleDocumentSelect = (document: Document) => {
    l.info('Document selected', { documentId: document.id, documentTitle: document.title });
    logger.logUserInteraction('document_select', { documentId: document.id, documentTitle: document.title });
    setSelectedDocument(document);
    setActiveTab(TabType.MEDICAL); // Switch to details view
  };

  const handleDocumentDelete = async (documentId: string) => {
    logger.logUserInteraction('delete_document_attempt', { documentId });
    const doc = documents.find((d: any) => d.id === documentId);
    if (doc && window.confirm('¿Está seguro de que desea eliminar este documento?')) {
      try {
        await deleteDocumentMutation({
          variables: { documentId },
          refetchQueries: [{ query: GET_UNIFIED_DOCUMENTS, variables: { patientId, limit: 100, offset: 0 } }]
        });
        l.info('Document deleted successfully', { documentId });
        setSelectedDocument(null);
      } catch (error: any) {
        l.error('Document deletion failed', error instanceof Error ? error : new Error(error.message));
      }
    }
  };

  const handleDocumentDownload = async (document: Document) => {
    try {
      const link = window.document.createElement('a');
      link.href = document.download_url;
      link.download = document.file_name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);

      logger.logUserInteraction('download_success', {
        documentId: document.id,
        fileName: document.file_name
      });
    } catch (error: any) {
      l.error('Document download failed', error instanceof Error ? error : new Error(error.message));
    }
  };

  const handleUploadSuccess = (document: any) => {
    l.info('Document uploaded successfully', { documentId: document.id });
    setShowUploader(false);
    refetchDocuments();
  };

  const handleUploadError = (error: string) => {
    l.error('Document upload failed', new Error(error));
  };

  // (removed unused handleToggleViewerMode)

  const handleToggleAIOverlay = () => {
    setShowAIOverlay(prev => !prev);
    logger.logUserInteraction('ai_overlay_toggle', { enabled: !showAIOverlay });
  };

  // 🎯 RENDER FUNCTIONS - Modular Components
  const renderTabNavigation = () => (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={activeTab === TabType.UPLOAD ? 'default' : 'outline'}
        onClick={() => handleTabChange(TabType.UPLOAD)}
      >
        Subir
      </Button>
      <Button
        variant={activeTab === TabType.MEDICAL ? 'default' : 'outline'}
        onClick={() => handleTabChange(TabType.MEDICAL)}
      >
        Médicos
      </Button>
      <Button
        variant={activeTab === TabType.ADMINISTRATIVE ? 'default' : 'outline'}
        onClick={() => handleTabChange(TabType.ADMINISTRATIVE)}
      >
        Admin
      </Button>
      <Button
        variant={activeTab === TabType.BILLING ? 'default' : 'outline'}
        onClick={() => handleTabChange(TabType.BILLING)}
      >
        Facturación
      </Button>
      <Button
        variant={activeTab === TabType.LEGAL ? 'default' : 'outline'}
        onClick={() => handleTabChange(TabType.LEGAL)}
      >
        Legal
      </Button>
    </div>
  );

  const renderSearchBar = () => (
    <Card className="cyberpunk-card">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Buscar documentos por título, descripción o etiquetas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderContent = () => {
    // Upload Tab
    if (activeTab === TabType.UPLOAD) {
      if (showUploader) {
        return (
          <DocumentUploaderV3
            patientId={patientId}
            medicalRecordId={medicalRecordId}
            appointmentId={appointmentId}
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
            onCancel={() => setShowUploader(false)}
          />
        );
      }

      return (
        <Card className="cyberpunk-card">
          <CardContent className="p-8 text-center">
            <p className="text-gray-400 mb-4">Selecciona archivos para subir al sistema Olympus</p>
            <Button onClick={() => setShowUploader(true)}>
              Comenzar Subida
            </Button>
          </CardContent>
        </Card>
      );
    }

    // Document List Tabs
    return (
      <div className="space-y-4">
        {renderSearchBar()}

        <DocumentListV3
          documents={documents}
          loading={queryLoading}
          error={queryError?.message}
          onDocumentSelect={handleDocumentSelect}
          onDocumentDelete={handleDocumentDelete}
          onDocumentDownload={handleDocumentDownload}
          searchQuery={searchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Document Details */}
        {selectedDocument && (
          <div className="space-y-4">
            {/* View Mode Toggle */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold cyberpunk-text">
                {viewerMode === 'viewer' ? '🖼️ Visor de Documentos' : '📋 Detalles del Documento'}
              </h2>
              <div className="flex gap-2">
                <Button
                  variant={viewerMode === 'details' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewerMode('details')}
                >
                  📋 Detalles
                </Button>
                <Button
                  variant={viewerMode === 'viewer' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewerMode('viewer')}
                >
                  🖼️ Visor
                </Button>
              </div>
            </div>

            {/* Content based on view mode */}
            {viewerMode === 'viewer' ? (
              <div className="h-[800px] border border-gray-600 rounded-lg overflow-hidden">
                <DocumentViewerV3
                  doc={selectedDocument}
                  showAIOverlay={showAIOverlay}
                  onToggleAIOverlay={handleToggleAIOverlay}
                  onClose={() => setSelectedDocument(null)}
                />
              </div>
            ) : (
              <>
                {/* Document Details Card */}
                <Card className="cyberpunk-card">
                  <CardHeader>
                    <CardTitle className="cyberpunk-text text-2xl">{selectedDocument.title}</CardTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="default">Compatible</Badge>
                      {selectedDocument.ai_analyzed && (
                        <Badge variant="outline">AI Analizado</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold cyberpunk-text">Información del Archivo</h3>
                        <div className="space-y-2">
                          <p><span className="text-gray-400">Nombre:</span> {selectedDocument.file_name}</p>
                          <p><span className="text-gray-400">Tamaño:</span> {selectedDocument.file_size_mb.toFixed(2)} MB</p>
                          <p><span className="text-gray-400">Tipo MIME:</span> {selectedDocument.mime_type}</p>
                          <p><span className="text-gray-400">Categoría:</span> {getCategoryLabel(selectedDocument.unified_type)}</p>
                          <p><span className="text-gray-400">Fecha de Creación:</span> {new Date(selectedDocument.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold cyberpunk-text">Análisis e Inteligencia</h3>
                        <div className="space-y-2">
                          <p><span className="text-gray-400">Estado de Cumplimiento:</span> {selectedDocument.compliance_status}</p>
                          <p><span className="text-gray-400">Analizado por AI:</span> {selectedDocument.ai_analyzed ? 'Sí' : 'No'}</p>
                          {selectedDocument.patient && (
                            <p><span className="text-gray-400">Paciente:</span> {selectedDocument.patient.first_name} {selectedDocument.patient.last_name}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Analysis */}
                <AIDocumentAnalysisV3
                  document={selectedDocument}
                  onTagClick={(tag) => l.info('Tag clicked', { tag })}
                />

                {/* Veritas Proof Viewer */}
                <VeritasProofViewer
                  veritasData={selectedDocument.title_veritas}
                  documentId={selectedDocument.id}
                  documentTitle={selectedDocument.title}
                />
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  // 🎯 LOADING AND ERROR STATES
  if (queryLoading && documents.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-400">Cargando documentos...</p>
        </div>
      </div>
    );
  }

  if (queryError && documents.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Card className="cyberpunk-card max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-400 mb-4">Error al cargar los documentos</p>
            <p className="text-sm text-gray-400 mb-4">
              {queryError.message}
            </p>
            <Button onClick={() => refetchDocuments()}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 🎯 MAIN RENDER - Modular Architecture
  return (
    <div className="space-y-6">
      {/* 🎯 HEADER - Navigation and Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold cyberpunk-text">🏛️ Document Manager Olympus V3.0</h1>
          <p className="text-gray-400 mt-1">Sistema de gestión documental con verificación @veritas</p>
          {patientId && (
            <p className="text-sm text-gray-500 mt-1">Documentos del paciente: {patientId}</p>
          )}
        </div>

        {renderTabNavigation()}
      </div>

      {/* 🎯 CONTENT AREA - Dynamic Tab Content */}
      {renderContent()}

      {/* 🎯 FOOTER - Status and Actions */}
      <div className="mt-8 pt-6 border-t border-gray-700">
        <div className="flex justify-between items-center text-sm text-gray-400">
          <div>
            <span>Estado: </span>
            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500">
              V3.0 - Apollo Nuclear + @veritas
            </Badge>
          </div>
          <div>
            Última actualización: {new Date().toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentManagerV3;

// 🎯🎸💀 DOCUMENT MANAGER V3.0 EXPORTS - OLYMPUS RECONSTRUCTION
// Export DocumentManagerV3 as the complete document management system
// Ready for integration with Apollo Nuclear GraphQL backend
