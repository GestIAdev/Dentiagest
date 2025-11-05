// 🎯🎸💀 DOCUMENT LIST V3.0 - TITAN PATTERN IMPLEMENTATION
// Date: September 26, 2025
// Mission: Modular document list component with advanced filtering and views
// Status: V3.0 - Full Apollo Nuclear Integration with @veritas Quantum Truth Verification
// Challenge: Scalable document listing with real-time updates and intelligent filtering

import React, { useMemo } from 'react';

// 🎯 TITAN PATTERN IMPORTS - Core Dependencies
import {
  Button,
  Card,
  CardContent,
  Badge,
  Spinner
} from '../atoms';

// 🎯 ICONS - Heroicons for medical theme
import { DocumentTextIcon, PhotoIcon, TrashIcon, Squares2X2Icon, ListBulletIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

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

interface DocumentListV3Props {
  documents: Document[];
  loading?: boolean;
  error?: string | null;
  onDocumentSelect: (document: Document) => void;
  onDocumentDelete: (documentId: string) => void;
  onDocumentDownload: (document: Document) => void;
  searchQuery?: string;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  className?: string;
}

// 🎨 IANARKALENDAR-INSPIRED COLOR SYSTEM - OLYMPUS EDITION
// Removed unused OLYMPUS_COLORS to reduce unused-vars warnings

// Logger eliminado por no uso

// 🎯 VERITAS BADGE HELPER - @veritas Quantum Truth Verification
const getVeritasBadge = (veritasData: any) => {
  if (!veritasData || !veritasData.verified) {
    return (
      <Badge variant="destructive" className="ml-2">
        ⚠️ No Verificado
      </Badge>
    );
  }

  const level = veritasData.level || 'UNKNOWN';
  const confidence = veritasData.confidence || 0;

  let variant: 'success' | 'warning' | 'destructive' = 'success';
  let icon = '✅';

  if (level === 'CRITICAL' || level === 'HIGH') {
    variant = confidence > 0.8 ? 'success' : 'warning';
    icon = confidence > 0.8 ? '🛡️' : '⚠️';
  } else if (level === 'MEDIUM') {
    variant = confidence > 0.6 ? 'success' : 'warning';
    icon = confidence > 0.6 ? '🔒' : '⚠️';
  } else {
    variant = 'destructive';
    icon = '❌';
  }

  return (
    <Badge variant={variant} className="ml-2">
      {icon} {level} ({Math.round(confidence * 100)}%)
    </Badge>
  );
};

// 🎯 UTILITY FUNCTIONS
const getStatusBadge = (complianceStatus: string) => {
  switch (complianceStatus) {
    case 'compliant':
      return <Badge variant="default">Compatible</Badge>;
    case 'warning':
      return <Badge variant="secondary">Revisar</Badge>;
    case 'non_compliant':
      return <Badge variant="destructive">No Compatible</Badge>;
    default:
      return <Badge variant="outline">Desconocido</Badge>;
  }
};

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

// 🎯 FILTERED DOCUMENTS HOOK
const useFilteredDocuments = (documents: Document[], searchQuery?: string) => {
  return useMemo(() => {
    if (!documents) return [];

    let filtered = documents;

    // Filter by search query
    if (searchQuery && searchQuery.length >= 2) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((doc) =>
        doc.title?.toLowerCase().includes(query) ||
        doc.description?.toLowerCase().includes(query) ||
        doc.file_name?.toLowerCase().includes(query) ||
        doc.smart_tags?.some((tag: string) => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [documents, searchQuery]);
};

// 🎯 MAIN COMPONENT - DocumentListV3
export const DocumentListV3: React.FC<DocumentListV3Props> = ({
  documents,
  loading = false,
  error = null,
  onDocumentSelect,
  onDocumentDelete,
  onDocumentDownload,
  searchQuery = '',
  viewMode = 'grid',
  onViewModeChange,
  className = ''
}) => {
  // 🎯 FILTERED DOCUMENTS
  const filteredDocuments = useFilteredDocuments(documents, searchQuery);

  // 🎯 LOADING STATE
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-400">Cargando documentos...</p>
        </div>
      </div>
    );
  }

  // 🎯 ERROR STATE
  if (error) {
    return (
      <Card className="cyberpunk-card max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <p className="text-red-400 mb-4">Error al cargar los documentos</p>
          <p className="text-sm text-gray-400">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // 🎯 EMPTY STATE
  if (filteredDocuments.length === 0) {
    return (
      <Card className="cyberpunk-card">
        <CardContent className="p-8 text-center">
          <DocumentTextIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400 mb-4">
            {searchQuery ? 'No se encontraron documentos que coincidan con la búsqueda' : 'No hay documentos disponibles'}
          </p>
          {searchQuery && (
            <Button variant="outline" onClick={() => {/* Clear search */}}>
              Limpiar búsqueda
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // 🎯 RENDER FUNCTIONS - UI Components
  const renderDocumentCard = (document: Document) => (
    <Card key={document.id} className="cyberpunk-card hover:shadow-lg transition-all duration-200 cursor-pointer group"
          onClick={() => onDocumentSelect(document)}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg cyberpunk-text truncate group-hover:text-cyan-400 transition-colors">
                {document.title}
              </h3>
              {document.title_veritas && getVeritasBadge(document.title_veritas)}
            </div>
            <p className="text-sm text-gray-400 truncate">{document.file_name}</p>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-400">{getCategoryLabel(document.unified_type)}</p>
              {document.unified_type_veritas && getVeritasBadge(document.unified_type_veritas)}
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2 ml-2">
            <div className="flex items-center gap-2">
              {getStatusBadge(document.compliance_status)}
              {document.compliance_status_veritas && getVeritasBadge(document.compliance_status_veritas)}
            </div>
            {document.ai_analyzed && (
              <Badge variant="outline" className="text-xs bg-cyan-500/20 text-cyan-400 border-cyan-500">
                🤖 AI Analizado
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <p><span className="text-gray-400">Tamaño:</span> {document.file_size_mb.toFixed(2)} MB</p>
          <p><span className="text-gray-400">Tipo:</span> {document.mime_type}</p>
          {document.patient && (
            <p><span className="text-gray-400">Paciente:</span> {document.patient.first_name} {document.patient.last_name}</p>
          )}
          {document.smart_tags && document.smart_tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {document.smart_tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {document.smart_tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{document.smart_tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-between items-center">
          <span className="text-xs text-gray-500">
            Creado: {new Date(document.created_at).toLocaleDateString()}
          </span>
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onDocumentDownload(document); }}>
              <ArrowRightIcon className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onDocumentDelete(document.id); }}>
              <TrashIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderDocumentListItem = (document: Document) => (
    <div key={document.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer group"
         onClick={() => onDocumentSelect(document)}>
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        <div className="flex-shrink-0">
          {document.is_image ? (
            <PhotoIcon className="w-8 h-8 text-cyan-400" />
          ) : (
            <DocumentTextIcon className="w-8 h-8 text-gray-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate cyberpunk-text group-hover:text-cyan-400 transition-colors">
            {document.title}
          </h3>
          <p className="text-sm text-gray-400 truncate">
            {document.file_name} • {getCategoryLabel(document.unified_type)}
          </p>
          {document.patient && (
            <p className="text-sm text-gray-400 truncate">
              Paciente: {document.patient.first_name} {document.patient.last_name}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1">
            {getStatusBadge(document.compliance_status)}
            {document.ai_analyzed && (
              <Badge variant="outline" className="text-xs">AI</Badge>
            )}
            <span className="text-xs text-gray-500">
              {new Date(document.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onDocumentDownload(document); }}>
          Descargar
        </Button>
        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onDocumentDelete(document.id); }}>
          Eliminar
        </Button>
      </div>
    </div>
  );

  // 🎯 MAIN RENDER
  return (
    <div className={`space-y-4 ${className}`}>
      {/* View Mode Toggle */}
      {onViewModeChange && (
        <div className="flex justify-end">
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
            >
              <Squares2X2Icon className="w-4 h-4 mr-2" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('list')}
            >
              <ListBulletIcon className="w-4 h-4 mr-2" />
              Lista
            </Button>
          </div>
        </div>
      )}

      {/* Document Count */}
      <div className="text-sm text-gray-400">
        {filteredDocuments.length} documento{filteredDocuments.length !== 1 ? 's' : ''}
        {searchQuery && ` encontrado${filteredDocuments.length !== 1 ? 's' : ''} para "${searchQuery}"`}
      </div>

      {/* Document Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map(renderDocumentCard)}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredDocuments.map(renderDocumentListItem)}
        </div>
      )}
    </div>
  );
};

export default DocumentListV3;