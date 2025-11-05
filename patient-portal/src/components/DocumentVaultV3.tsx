import React, { useEffect, useState } from 'react';
import {
  DocumentIcon,
  CloudArrowDownIcon,
  EyeIcon,
  LockClosedIcon,
  HeartIcon,
  LightBulbIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../stores/authStore';

// ============================================================================
// INTERFACES Y TIPOS - DOCUMENT VAULT V3 WITH EI
// ============================================================================

export interface PatientDocument {
  id: string;
  title: string;
  type: 'radiography' | 'treatment-plan' | 'invoice' | 'prescription' | 'report' | 'consent';
  date: string;
  size: number;
  isEncrypted: boolean;
  downloadUrl: string;
  previewUrl?: string;
  tags: string[];
  emotionalContext?: EmotionalContext;
}

export interface EmotionalContext {
  sentiment: 'positive' | 'neutral' | 'concerned' | 'anxious';
  confidence: number; // 0-1
  keyInsights: string[];
  recommendedActions: string[];
  calmingMessage?: string;
}

// ============================================================================
// COMPONENTE: DOCUMENT VAULT V3 - EMOTIONAL INTELLIGENCE INTERFACE
// ============================================================================

const DocumentVaultV3: React.FC = () => {
  const { auth } = useAuthStore();
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<PatientDocument | null>(null);
  const [filter, setFilter] = useState<string>('all');

  // Mock data loading (replace with GraphQL query)
  useEffect(() => {
    if (auth?.isAuthenticated) {
      setIsLoading(true);
      // Simulate loading documents from Apollo Nuclear
      setTimeout(() => {
        const mockDocuments: PatientDocument[] = [
          {
            id: 'doc-001',
            title: 'Radiografía Panorámica',
            type: 'radiography',
            date: '2024-01-15',
            size: 2048576, // 2MB
            isEncrypted: true,
            downloadUrl: '/api/documents/doc-001/download',
            previewUrl: '/api/documents/doc-001/preview',
            tags: ['panoramic', '2024', 'annual-check'],
            emotionalContext: {
              sentiment: 'neutral',
              confidence: 0.85,
              keyInsights: [
                'Estructura dental saludable',
                'Necesario control preventivo',
                'Buena higiene oral mantenida'
              ],
              recommendedActions: [
                'Continuar con limpieza profesional cada 6 meses',
                'Monitorear posibles caries incipientes'
              ],
              calmingMessage: 'Tu salud dental se encuentra en excelente estado. ¡Sigue así!'
            }
          },
          {
            id: 'doc-002',
            title: 'Plan de Tratamiento Ortodoncia',
            type: 'treatment-plan',
            date: '2024-02-01',
            size: 1572864, // 1.5MB
            isEncrypted: true,
            downloadUrl: '/api/documents/doc-002/download',
            tags: ['orthodontics', 'treatment-plan', 'braces'],
            emotionalContext: {
              sentiment: 'concerned',
              confidence: 0.72,
              keyInsights: [
                'Apiñamiento dental moderado',
                'Tratamiento de 18-24 meses estimado',
                'Resultado estético significativo esperado'
              ],
              recommendedActions: [
                'Consultar opciones de brackets estéticos',
                'Evaluar cobertura de seguro odontológico',
                'Programar cita de evaluación detallada'
              ],
              calmingMessage: 'Entendemos que los tratamientos de ortodoncia pueden generar preocupación. Estamos aquí para guiarte en cada paso del proceso.'
            }
          },
          {
            id: 'doc-003',
            title: 'Factura Consulta Enero 2024',
            type: 'invoice',
            date: '2024-01-20',
            size: 245760, // 240KB
            isEncrypted: false,
            downloadUrl: '/api/documents/doc-003/download',
            tags: ['invoice', 'january', 'consultation'],
          }
        ];
        setDocuments(mockDocuments);
        setIsLoading(false);
      }, 1500);
    }
  }, [auth]);

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

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'radiography':
        return <LightBulbIcon className="w-6 h-6 text-neon-blue" />;
      case 'treatment-plan':
        return <DocumentIcon className="w-6 h-6 text-neon-green" />;
      case 'invoice':
        return <CheckCircleIcon className="w-6 h-6 text-neon-yellow" />;
      case 'prescription':
        return <HeartIcon className="w-6 h-6 text-neon-pink" />;
      default:
        return <DocumentIcon className="w-6 h-6 text-cyber-light" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-neon-green';
      case 'neutral':
        return 'text-cyber-light';
      case 'concerned':
        return 'text-neon-yellow';
      case 'anxious':
        return 'text-neon-red';
      default:
        return 'text-cyber-light';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <HeartIcon className="w-5 h-5" />;
      case 'neutral':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'concerned':
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'anxious':
        return <ClockIcon className="w-5 h-5" />;
      default:
        return <CheckCircleIcon className="w-5 h-5" />;
    }
  };

  const filteredDocuments = documents.filter(doc => {
    if (filter === 'all') return true;
    return doc.type === filter;
  });

  if (!auth?.isAuthenticated) {
    return (
      <div className="min-h-screen bg-cyber-black flex items-center justify-center">
        <div className="text-center">
          <LockClosedIcon className="w-16 h-16 text-neon-cyan mx-auto mb-4 animate-pulse-neon" />
          <h2 className="text-2xl font-bold text-neon-cyan mb-2">Acceso Seguro Requerido</h2>
          <p className="text-cyber-light">Inicia sesión para acceder a tus documentos médicos</p>
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
              <p className="text-cyber-light mt-1">Documentos Médicos Seguros - Emotional Intelligence V3</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-cyber-light">Paciente ID</p>
                <p className="text-neon-cyan font-mono">{auth.patientId}</p>
              </div>
              <div className="w-12 h-12 bg-neon-cyan/20 rounded-full flex items-center justify-center">
                <LockClosedIcon className="w-6 h-6 text-neon-cyan" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'all', label: 'Todos' },
            { key: 'radiography', label: 'Radiografías' },
            { key: 'treatment-plan', label: 'Planes de Tratamiento' },
            { key: 'invoice', label: 'Facturas' },
            { key: 'prescription', label: 'Recetas' },
            { key: 'report', label: 'Informes' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                filter === tab.key
                  ? 'bg-neon-cyan text-cyber-black shadow-neon-cyan'
                  : 'bg-cyber-gray text-cyber-light hover:bg-cyber-light hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan"></div>
            <span className="ml-4 text-neon-cyan">Cargando documentos seguros...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-400">{error}</span>
            </div>
          </div>
        )}

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((document) => (
            <div
              key={document.id}
              className="bg-cyber-gray rounded-lg p-6 border border-cyber-light hover:border-neon-cyan transition-all duration-300 cursor-pointer group"
              onClick={() => setSelectedDocument(document)}
            >
              {/* Document Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  {getDocumentTypeIcon(document.type)}
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-white group-hover:text-neon-cyan transition-colors">
                      {document.title}
                    </h3>
                    <p className="text-sm text-cyber-light capitalize">{document.type.replace('-', ' ')}</p>
                  </div>
                </div>
                {document.isEncrypted && (
                  <LockClosedIcon className="w-5 h-5 text-neon-cyan" />
                )}
              </div>

              {/* Document Meta */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-cyber-light">Fecha:</span>
                  <span className="text-white">{formatDate(document.date)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-cyber-light">Tamaño:</span>
                  <span className="text-white">{formatFileSize(document.size)}</span>
                </div>
              </div>

              {/* Emotional Context Preview */}
              {document.emotionalContext && (
                <div className="mb-4 p-3 bg-cyber-dark rounded-lg border border-cyber-light">
                  <div className="flex items-center mb-2">
                    {getSentimentIcon(document.emotionalContext.sentiment)}
                    <span className={`ml-2 text-sm font-medium capitalize ${getSentimentColor(document.emotionalContext.sentiment)}`}>
                      {document.emotionalContext.sentiment}
                    </span>
                    <span className="ml-auto text-xs text-cyber-light">
                      {Math.round(document.emotionalContext.confidence * 100)}% confianza
                    </span>
                  </div>
                  {document.emotionalContext.calmingMessage && (
                    <p className="text-xs text-cyber-light italic">
                      "{document.emotionalContext.calmingMessage}"
                    </p>
                  )}
                </div>
              )}

              {/* Tags */}
              {document.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {document.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-cyber-dark text-cyber-light rounded-full border border-cyber-light"
                    >
                      {tag}
                    </span>
                  ))}
                  {document.tags.length > 3 && (
                    <span className="px-2 py-1 text-xs text-cyber-light">
                      +{document.tags.length - 3} más
                    </span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2">
                <button className="flex-1 bg-cyber-dark hover:bg-cyber-light text-cyber-light hover:text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center">
                  <EyeIcon className="w-4 h-4 mr-2" />
                  Ver
                </button>
                <button className="flex-1 bg-neon-cyan hover:bg-neon-cyan/80 text-cyber-black py-2 px-4 rounded-lg transition-colors flex items-center justify-center font-semibold">
                  <CloudArrowDownIcon className="w-4 h-4 mr-2" />
                  Descargar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {!isLoading && filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <DocumentIcon className="w-16 h-16 text-cyber-light mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No se encontraron documentos</h3>
            <p className="text-cyber-light">
              {filter === 'all'
                ? 'Aún no tienes documentos médicos almacenados.'
                : `No hay documentos de tipo "${filter}".`
              }
            </p>
          </div>
        )}

        {/* Document Detail Modal */}
        {selectedDocument && (
          <div className="fixed inset-0 bg-cyber-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-cyber-dark rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-cyber-light">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">{selectedDocument.title}</h2>
                  <button
                    onClick={() => setSelectedDocument(null)}
                    className="text-cyber-light hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Emotional Intelligence Section */}
                {selectedDocument.emotionalContext && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-neon-cyan/10 to-neon-blue/10 border border-neon-cyan/30 rounded-lg">
                    <h3 className="text-lg font-semibold text-neon-cyan mb-3 flex items-center">
                      <HeartIcon className="w-5 h-5 mr-2" />
                      Análisis Emocional Inteligente
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-cyber-light mb-2">Estado Emocional</h4>
                        <div className="flex items-center">
                          {getSentimentIcon(selectedDocument.emotionalContext.sentiment)}
                          <span className={`ml-2 font-medium capitalize ${getSentimentColor(selectedDocument.emotionalContext.sentiment)}`}>
                            {selectedDocument.emotionalContext.sentiment}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-cyber-light mb-2">Mensaje Tranquilizador</h4>
                        <p className="text-sm text-white italic">
                          "{selectedDocument.emotionalContext.calmingMessage}"
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-cyber-light mb-2">Acciones Recomendadas</h4>
                      <ul className="space-y-1">
                        {selectedDocument.emotionalContext.recommendedActions.map((action, index) => (
                          <li key={index} className="flex items-start text-sm text-white">
                            <CheckCircleIcon className="w-4 h-4 text-neon-green mr-2 mt-0.5 flex-shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Document Preview */}
                {selectedDocument.previewUrl && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-3">Vista Previa</h3>
                    <div className="bg-cyber-black rounded-lg p-4 border border-cyber-light">
                      <div className="aspect-video bg-cyber-gray rounded flex items-center justify-center">
                        <DocumentIcon className="w-16 h-16 text-cyber-light" />
                        <span className="ml-4 text-cyber-light">Vista previa no disponible</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Document Actions */}
                <div className="flex space-x-4">
                  <button className="flex-1 bg-neon-cyan hover:bg-neon-cyan/80 text-cyber-black py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center">
                    <CloudArrowDownIcon className="w-5 h-5 mr-2" />
                    Descargar Documento Seguro
                  </button>
                  <button className="flex-1 bg-cyber-gray hover:bg-cyber-light text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center">
                    <EyeIcon className="w-5 h-5 mr-2" />
                    Ver en Nueva Ventana
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentVaultV3;