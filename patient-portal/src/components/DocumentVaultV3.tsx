import React, { useEffect, useState } from 'react';
import {
  DocumentIcon,
  CloudArrowDownIcon,
  EyeIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  FolderIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { apolloClient } from '../config/apollo';
import { useAuthStore } from '../stores/authStore';
import {
  GET_PATIENT_DOCUMENTS,
  type Document,
  type DocumentType,
  type AccessLevel
} from '../graphql/documents';

// ============================================================================
// COMPONENTE: DOCUMENT VAULT V3 - REAL DATA
// By PunkClaude - Directiva PRE-007 GeminiEnder
// NO MORE MOCKS - Conectado a documentsV3 de Selene
// ZERO DEBT - Reescrito desde cero
// ============================================================================

const DocumentVaultV3: React.FC = () => {
  const { auth } = useAuthStore();
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // ðŸ“„ LOAD REAL DOCUMENTS from Selene
  useEffect(() => {
    if (auth?.isAuthenticated && auth.patientId) {
      loadDocuments();
    }
  }, [auth]);

  const loadDocuments = async () => {
    if (!auth?.patientId) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data } = await apolloClient.query<{ documentsV3: Document[] }>({
        query: GET_PATIENT_DOCUMENTS,
        variables: {
          patientId: auth.patientId,
          limit: 100
        },
        fetchPolicy: 'network-only'
      });

      if (data?.documentsV3) {
        setDocuments(data.documentsV3);
        console.log('âœ… Documents loaded:', data.documentsV3.length, 'records');
      }
    } catch (err) {
      console.error('âŒ Error loading documents:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar documentos');
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get document type icon
  const getDocumentTypeIcon = (type: DocumentType) => {
    switch (type) {
      case 'XRAY':
      case 'SCAN':
        return <DocumentIcon className="w-6 h-6 text-neon-blue" />;
      case 'PHOTO':
        return <DocumentIcon className="w-6 h-6 text-neon-purple" />;
      case 'PRESCRIPTION':
        return <DocumentIcon className="w-6 h-6 text-neon-pink" />;
      case 'INVOICE':
        return <DocumentIcon className="w-6 h-6 text-neon-yellow" />;
      case 'LAB_REPORT':
        return <DocumentIcon className="w-6 h-6 text-neon-green" />;
      case 'CONSENT_FORM':
        return <DocumentIcon className="w-6 h-6 text-cyan-400" />;
      default:
        return <DocumentIcon className="w-6 h-6 text-cyber-light" />;
    }
  };

  // Get document type label
  const getDocumentTypeLabel = (type: DocumentType): string => {
    const labels: Record<DocumentType, string> = {
      'XRAY': 'RadiografÃ­a',
      'SCAN': 'Escaneo',
      'PHOTO': 'FotografÃ­a',
      'CONSENT_FORM': 'Consentimiento',
      'PRESCRIPTION': 'Receta',
      'LAB_REPORT': 'Informe Lab',
      'INVOICE': 'Factura',
      'OTHER': 'Otro'
    };
    return labels[type] || type;
  };

  // Get access level color
  const getAccessLevelColor = (level: AccessLevel): string => {
    const colors: Record<AccessLevel, string> = {
      'PUBLIC': 'text-green-400 bg-green-400/10 border-green-400/30',
      'PRIVATE': 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
      'RESTRICTED': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
      'CONFIDENTIAL': 'text-red-400 bg-red-400/10 border-red-400/30'
    };
    return colors[level] || 'text-gray-400 bg-gray-400/10 border-gray-400/30';
  };

  // Filter and search documents
  const filteredDocuments = documents.filter(doc => {
    // Filter by type
    if (filter !== 'all' && doc.documentType !== filter.toUpperCase()) {
      return false;
    }
    
    // Search by filename or description
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        doc.fileName.toLowerCase().includes(term) ||
        doc.description?.toLowerCase().includes(term) ||
        doc.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    return true;
  });

  // Handle download -  SECURITY UPGRADE: httpOnly cookies authentication
  const handleDownload = async (doc: Document) => {
    try {
      console.log(' Downloading document:', doc.fileName);
      
      //  CRITICAL: Fetch con credentials para enviar httpOnly cookies
      // Backend debe validar cookie y retornar BLOB con Content-Disposition header
      const response = await fetch(`http://localhost:8005/api/documents/${doc.id}/download`, {
        method: 'GET',
        credentials: 'include', //  Envía httpOnly cookies automáticamente
        headers: {
          'Accept': 'application/octet-stream',
        }
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      // Convert response to Blob
      const blob = await response.blob();
      
      // Create temporary download link
      const url = window.URL.createObjectURL(blob);
      const anchor = window.document.createElement('a');
      anchor.href = url;
      anchor.download = doc.fileName;
      window.document.body.appendChild(anchor);
      anchor.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(anchor);
      
      console.log(' Document downloaded:', doc.fileName);
    } catch (err) {
      console.error(' Download error:', err);
      alert(`Error al descargar documento: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (!auth?.isAuthenticated) {
    return (
      <div className="min-h-screen bg-cyber-black flex items-center justify-center">
        <div className="text-center">
          <DocumentIcon className="w-16 h-16 text-neon-cyan mx-auto mb-4 animate-pulse-neon" />
          <h2 className="text-2xl font-bold text-neon-cyan mb-2">Acceso Requerido</h2>
          <p className="text-cyber-light">Inicia sesión para ver tus documentos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-gradient text-white">
      {/* Header */}
      <div className="bg-cyber-dark border-b border-neon-cyan/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-cyan to-neon-blue bg-clip-text text-transparent">
                Bóveda de Documentos
              </h1>
              <p className="text-cyber-light mt-1">Documentos Médicos - Datos Reales de Selene</p>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1 bg-neon-cyan/20 rounded-full">
              <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse"></div>
              <span className="text-xs text-neon-cyan font-semibold">DATOS REALES</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyber-light" />
            <input
              type="text"
              placeholder="Buscar documentos por nombre, descripción o tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-cyber-dark border border-cyber-light/30 rounded-lg text-white placeholder-cyber-light focus:outline-none focus:border-neon-cyan transition-colors"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'all', label: 'Todos' },
            { key: 'xray', label: 'Radiografías' },
            { key: 'scan', label: 'Escaneos' },
            { key: 'photo', label: 'Fotos' },
            { key: 'prescription', label: 'Recetas' },
            { key: 'invoice', label: 'Facturas' },
            { key: 'lab_report', label: 'Informes' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm ${
                filter === tab.key
                  ? 'bg-neon-cyan text-cyber-black shadow-neon-cyan'
                  : 'bg-cyber-dark text-cyber-light hover:bg-cyber-light hover:text-white border border-cyber-light/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-400">{error}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan"></div>
            <span className="ml-4 text-neon-cyan">Cargando documentos...</span>
          </div>
        )}

        {/* Documents Grid */}
        {!isLoading && (
          <>
            {filteredDocuments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredDocuments.map((document) => (
                  <div
                    key={document.id}
                    className="bg-cyber-gray rounded-lg p-6 border border-cyber-light/20 hover:border-neon-cyan transition-all duration-300 cursor-pointer group"
                    onClick={() => setSelectedDocument(document)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center flex-1 min-w-0">
                        {getDocumentTypeIcon(document.documentType)}
                        <div className="ml-3 flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-white group-hover:text-neon-cyan transition-colors truncate">
                            {document.fileName}
                          </h3>
                          <p className="text-sm text-cyber-light">
                            {getDocumentTypeLabel(document.documentType)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-xs text-cyber-light">
                          {formatFileSize(document.fileSize)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm">
                        <CalendarIcon className="w-4 h-4 text-cyber-light mr-2 flex-shrink-0" />
                        <span className="text-white">{formatDate(document.createdAt)}</span>
                      </div>
                      
                      {document.isEncrypted && (
                        <div className="flex items-center text-sm">
                          <LockClosedIcon className="w-4 h-4 text-neon-pink mr-2 flex-shrink-0" />
                          <span className="text-neon-pink">Encriptado</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm">
                        <FolderIcon className="w-4 h-4 text-cyber-light mr-2 flex-shrink-0" />
                        <span className={`text-xs px-2 py-0.5 rounded border ${getAccessLevelColor(document.accessLevel)}`}>
                          {document.accessLevel}
                        </span>
                      </div>

                      {document.category && (
                        <div className="text-xs text-cyan-400">
                          Categoría: {document.category}
                        </div>
                      )}
                    </div>

                    {document.description && (
                      <p className="text-sm text-cyber-light italic mb-4 line-clamp-2">
                        "{document.description}"
                      </p>
                    )}

                    {document.tags && document.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {document.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {document.tags.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-cyber-dark text-cyber-light rounded">
                            +{document.tags.length - 3} más
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(document);
                        }}
                        className="px-3 py-1 text-xs bg-neon-blue/20 text-neon-blue border border-neon-blue rounded hover:bg-neon-blue/30 transition-colors flex items-center"
                      >
                        <CloudArrowDownIcon className="w-4 h-4 mr-1" />
                        Descargar
                      </button>

                      <div className="flex items-center text-xs text-cyber-light">
                        <EyeIcon className="w-3 h-3 mr-1" />
                        {document.downloadCount || 0} descargas
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <DocumentIcon className="w-16 h-16 text-cyber-light mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {searchTerm || filter !== 'all' 
                    ? 'No se encontraron documentos' 
                    : 'Sin documentos aún'}
                </h3>
                <p className="text-cyber-light">
                  {searchTerm 
                    ? 'Intenta con otros términos de búsqueda' 
                    : filter !== 'all'
                    ? 'No hay documentos de este tipo'
                    : 'Tus documentos médicos aparecerán aquí'}
                </p>
              </div>
            )}
          </>
        )}

        {/* Real-time Status Indicator */}
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-cyber-dark border border-neon-cyan rounded-lg p-2 sm:p-4 shadow-neon-cyan">
          <div className="flex items-center">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-neon-green rounded-full animate-pulse mr-2 sm:mr-3"></div>
            <span className="text-xs sm:text-sm text-neon-cyan font-mono">TIEMPO REAL</span>
          </div>
        </div>
      </div>

      {/* Document Detail Modal */}
      {selectedDocument && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedDocument(null)}
        >
          <div 
            className="bg-cyber-dark border border-neon-cyan rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                {getDocumentTypeIcon(selectedDocument.documentType)}
                <h2 className="text-2xl font-bold text-white ml-3">{selectedDocument.fileName}</h2>
              </div>
              <button
                onClick={() => setSelectedDocument(null)}
                className="text-cyber-light hover:text-white transition-colors"
              >
                ?
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-cyber-light text-sm">Tipo:</span>
                <p className="text-white">{getDocumentTypeLabel(selectedDocument.documentType)}</p>
              </div>
              
              <div>
                <span className="text-cyber-light text-sm">Tamaño:</span>
                <p className="text-white">{formatFileSize(selectedDocument.fileSize)}</p>
              </div>

              <div>
                <span className="text-cyber-light text-sm">Subido:</span>
                <p className="text-white">{formatDate(selectedDocument.createdAt)}</p>
              </div>

              <div>
                <span className="text-cyber-light text-sm">Nivel de Acceso:</span>
                <span className={`ml-2 text-xs px-2 py-1 rounded border ${getAccessLevelColor(selectedDocument.accessLevel)}`}>
                  {selectedDocument.accessLevel}
                </span>
              </div>

              {selectedDocument.description && (
                <div>
                  <span className="text-cyber-light text-sm">Descripción:</span>
                  <p className="text-white mt-1">{selectedDocument.description}</p>
                </div>
              )}

              {selectedDocument.tags && selectedDocument.tags.length > 0 && (
                <div>
                  <span className="text-cyber-light text-sm mb-2 block">Tags:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedDocument.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => handleDownload(selectedDocument)}
                className="w-full mt-6 px-4 py-3 bg-neon-blue text-white rounded-lg font-bold hover:bg-neon-blue/80 transition-colors flex items-center justify-center"
              >
                <CloudArrowDownIcon className="w-5 h-5 mr-2" />
                Descargar Documento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentVaultV3;



