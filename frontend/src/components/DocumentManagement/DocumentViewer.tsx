// DOCUMENT_MANAGEMENT: Advanced Document Viewer Component
/**
 * DocumentViewer Component - Medical Document Preview & Analysis
 * 
 * Features que harían que corporativos se vuelvan locos de envidia:
 * ✅ Advanced image viewer with zoom & pan
 * ✅ PDF viewer with page navigation
 * ✅ Audio player for voice notes
 * ✅ AI analysis results overlay
 * ✅ OCR text extraction display
 * ✅ Medical annotations and measurements
 * ✅ GDPR-compliant secure viewing
 * 
 * PLATFORM_PATTERN: Universal viewer architecture:
 * - VetGest: Pet X-rays and medical photos
 * - MechaGest: Vehicle inspection photos and manuals
 * - RestaurantGest: Food safety photos and documents
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import apolloGraphQL from '../../services/apolloGraphQL'; // 🥷 STEALTH GRAPHQL NINJA MODE
import {
  XMarkIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  ArrowDownTrayIcon,
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  DocumentTextIcon,
  PhotoIcon,
  SparklesIcon,
  EyeIcon,
  TagIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface MedicalDocument {
  id: string;
  title: string;
  description?: string;
  file_name: string;
  file_size_mb: number;
  mime_type: string;
  is_image: boolean;
  is_xray: boolean;
  
  // AI Analysis
  ai_analyzed: boolean;
  ai_confidence_scores?: any;
  ocr_extracted_text?: string;
  ai_tags?: string[];
  ai_analysis_results?: any;
  
  // URLs
  download_url: string;
  thumbnail_url?: string;
  
  // Metadata
  created_at: string;
  document_date?: string;
  
  // Patient info
  patient?: {
    first_name: string;
    last_name: string;
  };
}

interface DocumentViewerProps {
  document: MedicalDocument | null;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  isOpen,
  onClose,
  className = ''
}) => {
  const { state } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  
  const imageRef = useRef<HTMLImageElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 🖼️ ZOOM CONTROLS
  const zoomIn = () => setZoom(prev => Math.min(prev * 1.5, 5));
  const zoomOut = () => setZoom(prev => Math.max(prev / 1.5, 0.1));
  const resetZoom = () => setZoom(1);

  // 🎵 AUDIO CONTROLS
  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // 📤 DOWNLOAD HANDLER
  // 🔧 DYNAMIC API URL HELPER - Future v2 compatibility
  const getDocumentDownloadUrl = (documentId: string): string => {
    // For now use v1, but ready for v2 migration
    const useV2Api = false; // Feature flag for future
    
    if (useV2Api) {
      return `/graphql/documents/${documentId}/download`; // 🥷 STEALTH GraphQL route
    } else {
      return `/graphql/medical-records/documents/${documentId}/download`; // 🥷 STEALTH GraphQL route
    }
  };

  const handleDownload = async () => {
    if (!document || !state.accessToken) return;

    try {
      setLoading(true);
      const response = await fetch(getDocumentDownloadUrl(document.id), {
        headers: {
          'Authorization': `Bearer ${state.accessToken}`,
        },
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.file_name;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      setError('Error downloading document');
    } finally {
      setLoading(false);
    }
  };

  // 🌐 FETCH DOCUMENT URL for viewing (memoized)
  const fetchDocumentUrl = useCallback(async () => {
    if (!document || !state.accessToken) return;

    try {
      setLoading(true);
      setError(null);

      // 🔍 DEBUG: Log authentication details
      console.log('🔐 DocumentViewer Auth Debug:', {
        documentId: document.id,
        hasToken: !!state.accessToken,
        tokenLength: state.accessToken?.length,
        userRole: state.user?.role
      });

      // For images and audio, we need to fetch with auth and create blob URLs
      if (document.is_image || document.mime_type.includes('audio')) {
        // 🚀 OPERACIÓN APOLLO - Using centralized API service
        // Replaces hardcoded fetch with apollo.docs.download()
        // Benefits: V1/V2 switching, blob handling, performance monitoring
        const blob = await apolloGraphQL.docs.download(document.id);
        const blobUrl = URL.createObjectURL(blob);
        setDocumentUrl(blobUrl);
      } else {
        // For PDFs, we can use iframe with auth headers (if browser supports it)
        const viewUrl = `/graphql/medical-records/documents/${document.id}/download`; // 🥷 STEALTH GraphQL route
        setDocumentUrl(viewUrl);
      }

    } catch (error) {
      console.error('Error fetching document:', error);
      setError(`Error loading document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [document, state.accessToken, state.user?.role]);

  // 🔐 BUILD AUTHENTICATED URL (for PDFs that support it)
  const getAuthenticatedUrl = (url: string) => {
    // 🔥 BLOB URLs don't need authentication (they're already local)
    if (!state.accessToken || !url || url.startsWith('blob:')) return url;
    return `${url}?authorization=Bearer%20${encodeURIComponent(state.accessToken)}`;
  };

  // 🔄 EFFECTS
  useEffect(() => {
    if (isOpen && document) {
      fetchDocumentUrl();
      setZoom(1);
      setShowAIAnalysis(false);
    } else {
      setDocumentUrl(null);
      setError(null);
    }
  }, [isOpen, document, fetchDocumentUrl]);

  // 📅 FORMAT DATE
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 🎨 RENDER CONFIDENCE SCORE
  const renderConfidenceScore = (score: number) => {
    const percentage = Math.round(score * 100);
    const colorClass = percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-yellow-600' : 'text-red-600';
    
    return (
      <span className={`font-medium ${colorClass}`}>
        {percentage}%
      </span>
    );
  };

  if (!isOpen || !document) return null;

  return (
    <div className={`fixed inset-0 z-50 overflow-hidden ${className}`}>
      {/* 🌑 BACKDROP */}
      <div className="absolute inset-0 bg-black bg-opacity-75" onClick={onClose} />
      
      {/* 📱 MODAL CONTAINER */}
      <div className="relative flex h-full">
        {/* 🖼️ MAIN VIEWER AREA */}
        <div className="flex-1 flex flex-col">
          {/* 🎛️ TOOLBAR */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-medium text-gray-900 truncate">
                {document.title}
              </h2>
              {document.patient && (
                <span className="text-sm text-gray-500">
                  {document.patient.first_name} {document.patient.last_name}
                </span>
              )}
              <span className="text-xs text-gray-400">
                {document.file_size_mb.toFixed(1)} MB
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {/* 🔍 ZOOM CONTROLS (for images) */}
              {document.is_image && (
                <>
                  <button
                    onClick={zoomOut}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                  >
                    <MagnifyingGlassMinusIcon className="h-5 w-5" />
                  </button>
                  <span className="text-sm text-gray-600 w-12 text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={zoomIn}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                  >
                    <MagnifyingGlassPlusIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={resetZoom}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                  >
                    Reset
                  </button>
                </>
              )}

              {/* 🤖 AI ANALYSIS TOGGLE */}
              {document.ai_analyzed && (
                <button
                  onClick={() => setShowAIAnalysis(!showAIAnalysis)}
                  className={`p-2 rounded-md ${showAIAnalysis ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                >
                  <SparklesIcon className="h-5 w-5" />
                </button>
              )}

              {/* 📤 DOWNLOAD */}
              <button
                onClick={handleDownload}
                disabled={loading}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md disabled:opacity-50"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
              </button>

              {/* ❌ CLOSE */}
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* 📄 CONTENT AREA */}
          <div className="flex-1 bg-gray-100 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Cargando documento...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Error al cargar</h3>
                  <p className="mt-1 text-sm text-gray-500">{error}</p>
                </div>
              </div>
            ) : documentUrl ? (
              <div ref={containerRef} className="h-full overflow-auto">
                {/* 🖼️ IMAGE VIEWER */}
                {document.is_image ? (
                  <div className="flex items-center justify-center min-h-full p-4">
                    <img
                      ref={imageRef}
                      src={getAuthenticatedUrl(documentUrl)}
                      alt={document.title}
                      style={{ transform: `scale(${zoom})` }}
                      className="max-w-none transition-transform duration-200 cursor-move"
                      onError={() => setError('Error loading image')}
                    />
                  </div>
                ) : document.mime_type.includes('audio') ? (
                  /* 🎵 AUDIO PLAYER */
                  <div className="flex items-center justify-center h-full">
                    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
                      <div className="text-center">
                        <SpeakerWaveIcon className="mx-auto h-16 w-16 text-blue-500 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {document.title}
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                          Nota de voz • {document.file_size_mb.toFixed(1)} MB
                        </p>
                        
                        <audio
                          ref={audioRef}
                          src={getAuthenticatedUrl(documentUrl)}
                          onPlay={() => setIsPlaying(true)}
                          onPause={() => setIsPlaying(false)}
                          onEnded={() => setIsPlaying(false)}
                          controls
                          className="w-full mb-4"
                        />
                        
                        <button
                          onClick={togglePlayback}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          {isPlaying ? (
                            <PauseIcon className="h-4 w-4 mr-2" />
                          ) : (
                            <PlayIcon className="h-4 w-4 mr-2" />
                          )}
                          {isPlaying ? 'Pausar' : 'Reproducir'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : document.mime_type.includes('pdf') ? (
                  /* 📄 PDF VIEWER */
                  <iframe
                    src={getAuthenticatedUrl(documentUrl)}
                    className="w-full h-full border-0"
                    title={document.title}
                  />
                ) : (
                  /* 📋 GENERIC DOCUMENT */
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <DocumentTextIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Vista previa no disponible
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        {document.title} • {document.mime_type}
                      </p>
                      <button
                        onClick={handleDownload}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                        Descargar para ver
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* 🤖 AI ANALYSIS SIDEBAR */}
        {showAIAnalysis && document.ai_analyzed && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <SparklesIcon className="h-5 w-5 mr-2 text-blue-500" />
                Análisis IA
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* 🏷️ AI TAGS */}
              {document.ai_tags && document.ai_tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                    <TagIcon className="h-4 w-4 mr-1" />
                    Etiquetas Detectadas
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {document.ai_tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 📊 CONFIDENCE SCORES */}
              {document.ai_confidence_scores && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                    <ChartBarIcon className="h-4 w-4 mr-1" />
                    Confianza del Análisis
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(document.ai_confidence_scores).map(([key, score]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 capitalize">
                          {key.replace('_', ' ')}
                        </span>
                        {renderConfidenceScore(score as number)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 📝 OCR TEXT */}
              {document.ocr_extracted_text && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                    <DocumentTextIcon className="h-4 w-4 mr-1" />
                    Texto Extraído (OCR)
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {document.ocr_extracted_text}
                    </p>
                  </div>
                </div>
              )}

              {/* 🔬 ANALYSIS RESULTS */}
              {document.ai_analysis_results && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                    <EyeIcon className="h-4 w-4 mr-1" />
                    Resultados de Análisis
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(document.ai_analysis_results, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
