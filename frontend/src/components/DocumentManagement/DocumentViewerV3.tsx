// 🎯🎸💀 DOCUMENT VIEWER V3.0 - THE HOLY SHIT SPECTACULAR VIEWER
// 🔥 EL VISOR MÁS ESPECTACULAR QUE SE HAYA CREADO NUNCA JAMÁS 🔥

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '../atoms';
import { Card, CardContent, CardHeader, CardTitle } from '../atoms';
import { Badge } from '../atoms';
import { Spinner } from '../atoms';
import { AIDocumentAnalysisV3 } from './AIDocumentAnalysisV3';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Maximize,
  Minimize,
  Download,
  Printer,
  Target,
  Zap,
  Cpu,
  Brain,
  Shield,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
// 🎯 DOCUMENT DATA INTERFACE - Inline definition for viewer
interface DocumentData {
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

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface DocumentViewerV3Props {
  doc: DocumentData;
  onClose?: () => void;
  showAIOverlay?: boolean;
  onToggleAIOverlay?: () => void;
  className?: string;
}

interface ViewerState {
  scale: number;
  rotation: number;
  isFullscreen: boolean;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  showControls: boolean;
  panMode: boolean;
  dragOffset: { x: number; y: number };
}

interface AIOnalysisOverlay {
  entities: Array<{
    id: string;
    text: string;
    type: string;
    confidence: number;
    position: { x: number; y: number; width: number; height: number };
    color: string;
  }>;
  highlights: Array<{
    id: string;
    text: string;
    type: 'medical' | 'legal' | 'personal' | 'financial';
    position: { page: number; x: number; y: number; width: number; height: number };
  }>;
}

const DocumentViewerV3: React.FC<DocumentViewerV3Props> = ({
  doc,
  onClose,
  showAIOverlay = true,
  onToggleAIOverlay,
  className = ''
}) => {
  // 🎯 STATE MANAGEMENT - Advanced Viewer State
  const [viewerState, setViewerState] = useState<ViewerState>({
    scale: 1.0,
    rotation: 0,
    isFullscreen: false,
    currentPage: 1,
    totalPages: 1,
    isLoading: true,
    error: null,
    showControls: true,
    panMode: false,
    dragOffset: { x: 0, y: 0 }
  });

  const [aiOverlay, setAiOverlay] = useState<AIOnalysisOverlay>({
    entities: [],
    highlights: []
  });

  // 🎯 REFS - DOM References for Advanced Interactions
  const viewerRef = useRef<HTMLDivElement>(null);
  // removed unused canvasRef
  const controlsRef = useRef<HTMLDivElement>(null);
  const animationControls = useAnimation();

  // 🎯 COMPUTED VALUES
  const isPDF = doc.mime_type === 'application/pdf';
  const isImage = doc.mime_type?.startsWith('image/');
  const canRender = isPDF || isImage;

  // 🎯 EFFECTS - Initialization and AI Analysis Loading
  useEffect(() => {
    if (doc.ai_analysis_results) {
      // Parse AI analysis results for overlay
      const analysis = doc.ai_analysis_results;
      const entities = analysis?.medical_entities || [];
      const highlights = analysis?.highlights || [];

      setAiOverlay({
        entities: entities.map((entity: any, index: number) => ({
          id: `entity-${index}`,
          text: entity.text,
          type: entity.type,
          confidence: entity.confidence,
          position: entity.position || { x: 0, y: 0, width: 100, height: 20 },
          color: getEntityColor(entity.type)
        })),
        highlights: highlights.map((highlight: any, index: number) => ({
          id: `highlight-${index}`,
          text: highlight.text,
          type: highlight.type,
          position: highlight.position
        }))
      });
    }
  }, [doc.ai_analysis_results]);

  // 🎯 UTILITY FUNCTIONS
  const getEntityColor = (type: string): string => {
    const colors = {
      'person': '#00ffff', // cyan
      'organization': '#ff00ff', // magenta
      'location': '#ffff00', // yellow
      'date': '#00ff00', // green
      'medical_condition': '#ff4444', // red
      'medication': '#4444ff', // blue
      'procedure': '#ff8800', // orange
      'default': '#ffffff' // white
    };
    return colors[type as keyof typeof colors] || colors.default;
  };

  // 🎯 VIEWER CONTROLS - Advanced Control Functions
  const handleZoomIn = useCallback(() => {
    setViewerState(prev => ({
      ...prev,
      scale: Math.min(prev.scale * 1.2, 5.0)
    }));
    animationControls.start({ scale: viewerState.scale * 1.2 });
  }, [viewerState.scale, animationControls]);

  const handleZoomOut = useCallback(() => {
    setViewerState(prev => ({
      ...prev,
      scale: Math.max(prev.scale / 1.2, 0.1)
    }));
    animationControls.start({ scale: viewerState.scale / 1.2 });
  }, [viewerState.scale, animationControls]);

  const handleRotateClockwise = useCallback(() => {
    setViewerState(prev => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360
    }));
  }, []);

  const handleRotateCounterClockwise = useCallback(() => {
    setViewerState(prev => ({
      ...prev,
      rotation: (prev.rotation - 90 + 360) % 360
    }));
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    if (!viewerState.isFullscreen) {
      viewerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setViewerState(prev => ({
      ...prev,
      isFullscreen: !prev.isFullscreen
    }));
  }, [viewerState.isFullscreen]);

  const handlePageChange = useCallback((page: number) => {
    setViewerState(prev => ({
      ...prev,
      currentPage: Math.max(1, Math.min(page, prev.totalPages))
    }));
  }, []);

  const handleExport = useCallback(async () => {
    try {
      const link = document.createElement('a');
      link.href = doc.download_url;
      link.download = doc.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [doc]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // 🎯 PDF HANDLERS
  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setViewerState(prev => ({
      ...prev,
      totalPages: numPages,
      isLoading: false,
      error: null
    }));
  }, []);

  const onDocumentLoadError = useCallback((error: Error) => {
    setViewerState(prev => ({
      ...prev,
      isLoading: false,
      error: error.message
    }));
  }, []);

  // 🎯 RENDER FUNCTIONS - Spectacular UI Components

  const renderControls = () => (
    <AnimatePresence>
      {viewerState.showControls && (
        <motion.div
          ref={controlsRef}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="absolute top-4 left-4 right-4 z-50"
        >
          <Card className="cyberpunk-card bg-black/80 backdrop-blur-md border-cyan-500/30">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Navigation Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(viewerState.currentPage - 1)}
                    disabled={viewerState.currentPage <= 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-cyan-400">
                    {viewerState.currentPage} / {viewerState.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(viewerState.currentPage + 1)}
                    disabled={viewerState.currentPage >= viewerState.totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleZoomOut}>
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-cyan-400 min-w-[60px] text-center">
                    {Math.round(viewerState.scale * 100)}%
                  </span>
                  <Button variant="outline" size="sm" onClick={handleZoomIn}>
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>

                {/* Rotation Controls */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleRotateCounterClockwise}>
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-cyan-400">
                    {viewerState.rotation}°
                  </span>
                  <Button variant="outline" size="sm" onClick={handleRotateClockwise}>
                    <RotateCw className="w-4 h-4" />
                  </Button>
                </div>

                {/* Action Controls */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleToggleFullscreen}>
                    {viewerState.isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="w-4 h-4" />
                  </Button>
                  {onToggleAIOverlay && (
                    <Button
                      variant={showAIOverlay ? "default" : "outline"}
                      size="sm"
                      onClick={onToggleAIOverlay}
                    >
                      <Brain className="w-4 h-4" />
                    </Button>
                  )}
                  {onClose && (
                    <Button variant="outline" size="sm" onClick={onClose}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderPDFViewer = () => (
    <div className="relative w-full h-full overflow-auto">
      <Document
        file={doc.download_url}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Spinner size="lg" />
              <p className="mt-4 text-cyan-400">Cargando documento PDF...</p>
            </div>
          </div>
        }
        error={
          <div className="flex justify-center items-center h-64">
            <Card className="cyberpunk-card max-w-md">
              <CardContent className="p-6 text-center">
                <p className="text-red-400 mb-4">Error al cargar el PDF</p>
                <p className="text-sm text-gray-400">{viewerState.error}</p>
              </CardContent>
            </Card>
          </div>
        }
      >
        <motion.div
          animate={animationControls}
          style={{
            transform: `rotate(${viewerState.rotation}deg)`,
            transformOrigin: 'center'
          }}
          className="relative"
        >
          <Page
            pageNumber={viewerState.currentPage}
            scale={viewerState.scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="shadow-2xl"
          />

          {/* AI Overlay */}
          {showAIOverlay && renderAIOverlay()}
        </motion.div>
      </Document>
    </div>
  );

  const renderImageViewer = () => (
    <div className="relative w-full h-full overflow-auto flex justify-center items-center">
      <motion.img
        src={doc.download_url}
        alt={doc.title}
        animate={animationControls}
        style={{
          transform: `rotate(${viewerState.rotation}deg) scale(${viewerState.scale})`,
          transformOrigin: 'center',
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain'
        }}
        className="shadow-2xl"
        onLoad={() => setViewerState(prev => ({ ...prev, isLoading: false }))}
        onError={() => setViewerState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Error al cargar la imagen'
        }))}
      />

      {/* AI Overlay for Images */}
      {showAIOverlay && renderAIOverlay()}
    </div>
  );

  const renderAIOverlay = () => (
    <div className="absolute inset-0 pointer-events-none">
      {aiOverlay.entities.map((entity) => (
        <motion.div
          key={entity.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute pointer-events-auto"
          style={{
            left: `${entity.position.x}%`,
            top: `${entity.position.y}%`,
            width: `${entity.position.width}%`,
            height: `${entity.position.height}%`,
            border: `2px solid ${entity.color}`,
            backgroundColor: `${entity.color}20`,
            borderRadius: '4px'
          }}
        >
          <div className="absolute -top-8 left-0 bg-black/80 text-white text-xs px-2 py-1 rounded border"
               style={{ borderColor: entity.color }}>
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3" style={{ color: entity.color }} />
              <span>{entity.type}</span>
              <Badge variant="outline" className="text-xs">
                {Math.round(entity.confidence * 100)}%
              </Badge>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderDocumentInfo = () => (
    <motion.div
      initial={{ opacity: 0, x: -300 }}
      animate={{ opacity: 1, x: 0 }}
      className="absolute left-4 bottom-4 z-40"
    >
      <Card className="cyberpunk-card bg-black/80 backdrop-blur-md border-cyan-500/30 max-w-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg cyberpunk-text flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            Información del Documento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Archivo:</span>
            <span className="text-cyan-400">{doc.file_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Tipo:</span>
            <span className="text-cyan-400">{doc.mime_type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Tamaño:</span>
            <span className="text-cyan-400">{doc.file_size_mb.toFixed(2)} MB</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">AI Analizado:</span>
            <Badge variant={doc.ai_analyzed ? "default" : "outline"}>
              {doc.ai_analyzed ? <Brain className="w-3 h-3 mr-1" /> : null}
              {doc.ai_analyzed ? 'Sí' : 'No'}
            </Badge>
          </div>
          {doc.title_veritas && (
            <div className="flex justify-between">
              <span className="text-gray-400">@veritas:</span>
              <Badge variant="outline" className="bg-green-500/20 text-green-400">
                <Shield className="w-3 h-3 mr-1" />
                Verificado
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  // 🎯 MAIN RENDER - The Spectacular Viewer
  if (!canRender) {
    return (
      <Card className="cyberpunk-card max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h3 className="text-xl font-bold cyberpunk-text mb-2">Tipo de archivo no soportado</h3>
          <p className="text-gray-400 mb-4">
            El visor no puede mostrar archivos de tipo {doc.mime_type}
          </p>
          <Button onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Descargar archivo
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      ref={viewerRef}
      className={`relative w-full h-full bg-gray-900 overflow-hidden ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseMove={() => setViewerState(prev => ({ ...prev, showControls: true }))}
      onMouseLeave={() => setTimeout(() => setViewerState(prev => ({ ...prev, showControls: false })), 2000)}
    >
      {/* Controls Overlay */}
      {renderControls()}

      {/* Document Info Panel */}
      {renderDocumentInfo()}

      {/* Main Viewer Area */}
      <div className="w-full h-full pt-20 pb-20 px-4">
        {viewerState.isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="inline-block"
              >
                <Cpu className="w-16 h-16 text-cyan-400" />
              </motion.div>
              <p className="mt-4 text-cyan-400 text-xl">Inicializando visor cuántico...</p>
              <p className="text-gray-400">Cargando documento en realidad aumentada</p>
            </div>
          </div>
        ) : viewerState.error ? (
          <div className="flex justify-center items-center h-full">
            <Card className="cyberpunk-card max-w-md">
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold cyberpunk-text mb-2">Error de carga</h3>
                <p className="text-gray-400 mb-4">{viewerState.error}</p>
                <Button onClick={() => window.location.reload()}>
                  <Zap className="w-4 h-4 mr-2" />
                  Reintentar
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="h-full">
            {isPDF && renderPDFViewer()}
            {isImage && renderImageViewer()}
          </div>
        )}
      </div>

      {/* AI Analysis Panel */}
      {showAIOverlay && doc.ai_analyzed && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute right-4 top-20 bottom-4 z-40"
        >
          <AIDocumentAnalysisV3
            document={doc}
            className="max-w-sm"
          />
        </motion.div>
      )}
    </motion.div>
  );
};

export default DocumentViewerV3;

// 🎯🎸💀 DOCUMENT VIEWER V3.0 EXPORTS - THE HOLY SHIT SPECTACULAR VIEWER
// Export DocumentViewerV3 as the most spectacular document viewer ever created
// Features: PDF rendering, image viewing, AI overlay, cyberpunk UI, advanced controls
// Ready for integration with DocumentManagerV3