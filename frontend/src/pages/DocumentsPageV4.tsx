// ============================================================================
// 📄 DOCUMENTS PAGE V4 - OLYMPUS EDITION
// ============================================================================
// By PunkClaude | November 2025
// Full Bleed Layout + RBAC Security + GDPR Compliance
// ============================================================================

import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  FolderIcon,
  DocumentTextIcon,
  PhotoIcon,
  FilmIcon,
  CloudArrowUpIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
  UserIcon,
  BuildingOfficeIcon,
  ScaleIcon,
  CurrencyDollarIcon,
  HeartIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import { Badge } from '../design-system/Badge';
import { Button } from '../design-system/Button';
import { Spinner } from '../design-system/Spinner';
import { StaffGuard } from '../components/StaffGuard';
import { DocumentDeleteProtocol } from '../components/DocumentManagement/DocumentDeleteProtocol';
import { DocumentUploaderV3Redesigned } from '../components/DocumentManagement/DocumentUploaderV3Redesigned';
import { GET_UNIFIED_DOCUMENTS, DELETE_DOCUMENT_V3 } from '../graphql/queries/documents';

// ============================================================================
// 🎨 TYPES & INTERFACES
// ============================================================================

interface Document {
  id: string;
  title: string;
  description?: string;
  file_name: string;
  file_size_mb: number;
  mime_type: string;
  is_image: boolean;
  is_xray: boolean;
  ai_analyzed: boolean;
  ai_tags?: string[];
  download_url: string;
  thumbnail_url?: string;
  created_at: string;
  document_date?: string;
  unified_type: string;
  legal_category?: string;
  smart_tags?: string[];
  compliance_status: string;
  is_confidential?: boolean;
  access_level?: string;
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

type CategoryFilter = 'all' | 'medical' | 'administrative' | 'billing' | 'legal' | 'trash';
type ViewMode = 'grid' | 'list';

// ============================================================================
// 🎨 CATEGORY CONFIGURATION
// ============================================================================

const CATEGORIES = [
  { id: 'all', label: 'Todos', icon: FolderIcon, color: 'text-cyan-400', bgColor: 'bg-cyan-500/10' },
  { id: 'medical', label: 'Clínicos', icon: HeartIcon, color: 'text-red-400', bgColor: 'bg-red-500/10' },
  { id: 'administrative', label: 'Administrativos', icon: BuildingOfficeIcon, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  { id: 'billing', label: 'Facturación', icon: CurrencyDollarIcon, color: 'text-green-400', bgColor: 'bg-green-500/10' },
  { id: 'legal', label: 'Legales', icon: ScaleIcon, color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
  { id: 'trash', label: 'Papelera', icon: ArchiveBoxIcon, color: 'text-gray-400', bgColor: 'bg-gray-500/10' },
] as const;

// ============================================================================
// 🎴 FILE CARD COMPONENT
// ============================================================================

interface FileCardProps {
  document: Document;
  onSelect: (doc: Document) => void;
  onDelete: (doc: Document) => void;
  onDownload: (doc: Document) => void;
}

const FileCard: React.FC<FileCardProps> = ({ document, onSelect, onDelete, onDownload }) => {
  // Determine file icon based on mime type
  const getFileIcon = () => {
    if (document.is_image || document.mime_type?.startsWith('image/')) {
      return <PhotoIcon className="w-8 h-8 text-purple-400" />;
    }
    if (document.mime_type?.includes('video') || document.is_xray) {
      return <FilmIcon className="w-8 h-8 text-blue-400" />;
    }
    return <DocumentTextIcon className="w-8 h-8 text-cyan-400" />;
  };

  // Format file size
  const formatSize = (sizeMb: number) => {
    if (sizeMb < 1) return `${Math.round(sizeMb * 1024)} KB`;
    return `${sizeMb.toFixed(1)} MB`;
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div
      className="group relative bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 
                 hover:border-cyan-500/50 hover:bg-gray-800 transition-all duration-200
                 cursor-pointer"
      onClick={() => onSelect(document)}
    >
      {/* Thumbnail or Icon */}
      <div className="aspect-square bg-gray-900/50 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
        {document.thumbnail_url ? (
          <img 
            src={document.thumbnail_url} 
            alt={document.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center">
            {getFileIcon()}
            <span className="text-xs text-gray-500 mt-2 uppercase">
              {document.file_name?.split('.').pop() || 'FILE'}
            </span>
          </div>
        )}
      </div>

      {/* Document Info */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-white truncate" title={document.title}>
          {document.title || document.file_name}
        </h3>
        
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>{formatSize(document.file_size_mb)}</span>
          <span>•</span>
          <span>{formatDate(document.created_at)}</span>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1">
          {document.ai_analyzed && (
            <Badge variant="info" className="text-xs px-1.5 py-0.5">
              🤖 IA
            </Badge>
          )}
          {document.is_confidential && (
            <Badge variant="warning" className="text-xs px-1.5 py-0.5">
              <LockClosedIcon className="w-3 h-3 inline mr-0.5" />
              Confidencial
            </Badge>
          )}
          {document.compliance_status === 'compliant' && (
            <Badge variant="success" className="text-xs px-1.5 py-0.5">
              <ShieldCheckIcon className="w-3 h-3 inline mr-0.5" />
              @veritas
            </Badge>
          )}
        </div>

        {/* Patient Info */}
        {document.patient && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <UserIcon className="w-3 h-3" />
            <span>{document.patient.first_name} {document.patient.last_name}</span>
          </div>
        )}
      </div>

      {/* Hover Actions */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onDownload(document); }}
          className="p-1.5 bg-cyan-500/20 rounded-lg hover:bg-cyan-500/40 transition-colors"
          title="Descargar"
        >
          <CloudArrowUpIcon className="w-4 h-4 text-cyan-400 rotate-180" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(document); }}
          className="p-1.5 bg-red-500/20 rounded-lg hover:bg-red-500/40 transition-colors"
          title="Eliminar"
        >
          <TrashIcon className="w-4 h-4 text-red-400" />
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// 🎯 MAIN COMPONENT
// ============================================================================

export const DocumentsPageV4: React.FC = () => {
  // ============================================================
  // � AUTH - For clinical content protection
  // ============================================================
  const { state: authState } = useAuth();
  const userRole = authState.user?.role?.toUpperCase() || '';
  const canViewClinicalContent = ['DENTIST', 'OWNER'].includes(userRole);

  // ============================================================
  // �📊 STATE
  // ============================================================
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [jurisdiction, setJurisdiction] = useState<'ES' | 'AR' | 'GDPR'>('ES');
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // ============================================================
  // 🔄 GRAPHQL
  // ============================================================
  const { data, loading, error, refetch } = useQuery(GET_UNIFIED_DOCUMENTS, {
    variables: { limit: 200, offset: 0 },
    fetchPolicy: 'cache-and-network',
    pollInterval: 10000, // Refresh every 10s
  });

  const [deleteDocument] = useMutation(DELETE_DOCUMENT_V3, {
    onCompleted: () => {
      toast.success('📄 Documento eliminado correctamente');
      refetch();
    },
    onError: (err) => {
      toast.error(`❌ Error: ${err.message}`);
    },
  });

  // ============================================================
  // 📊 COMPUTED DATA
  // ============================================================
  const documents: Document[] = useMemo(() => {
    return (data as any)?.unifiedDocumentsV3 || [];
  }, [data]);

  const filteredDocuments = useMemo(() => {
    let result = documents;

    // Filter by category
    if (categoryFilter !== 'all' && categoryFilter !== 'trash') {
      result = result.filter(doc => doc.legal_category === categoryFilter);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(doc =>
        doc.title?.toLowerCase().includes(query) ||
        doc.file_name?.toLowerCase().includes(query) ||
        doc.patient?.first_name?.toLowerCase().includes(query) ||
        doc.patient?.last_name?.toLowerCase().includes(query) ||
        doc.ai_tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return result;
  }, [documents, categoryFilter, searchQuery]);

  // Count by category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: documents.length,
      medical: 0,
      administrative: 0,
      billing: 0,
      legal: 0,
      trash: 0,
    };
    documents.forEach(doc => {
      if (doc.legal_category && counts[doc.legal_category] !== undefined) {
        counts[doc.legal_category]++;
      }
    });
    return counts;
  }, [documents]);

  // Recent patients from documents
  const recentPatients = useMemo(() => {
    const patientMap = new Map<string, { id: string; name: string; count: number }>();
    documents.forEach(doc => {
      if (doc.patient) {
        const key = doc.patient.id;
        const existing = patientMap.get(key);
        if (existing) {
          existing.count++;
        } else {
          patientMap.set(key, {
            id: doc.patient.id,
            name: `${doc.patient.first_name} ${doc.patient.last_name}`,
            count: 1,
          });
        }
      }
    });
    return Array.from(patientMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [documents]);

  // ============================================================
  // 🎬 HANDLERS
  // ============================================================
  const handleDocumentSelect = useCallback((doc: Document) => {
    setSelectedDocument(doc);
    setShowViewer(true);
  }, []);

  const handleDocumentDelete = useCallback((doc: Document) => {
    setDocumentToDelete(doc);
  }, []);

  const handleConfirmDelete = useCallback(async (docId: string) => {
    await deleteDocument({ variables: { id: docId } });
    setDocumentToDelete(null);
  }, [deleteDocument]);

  const handleDocumentDownload = useCallback((doc: Document) => {
    if (doc.download_url) {
      window.open(doc.download_url, '_blank');
    }
  }, []);

  const handleUploadSuccess = useCallback(() => {
    setShowUploader(false);
    refetch();
    toast.success('📄 Documento subido correctamente');
  }, [refetch]);

  // Drag & Drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDraggingOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files.length > 0) {
      setShowUploader(true);
    }
  }, []);

  // ============================================================
  // 🎨 RENDER
  // ============================================================
  return (
    <StaffGuard allowedRoles={['STAFF', 'ADMIN', 'DENTIST', 'RECEPTIONIST']}>
      <div className="h-full w-full flex flex-col bg-gray-900">
        {/* ============================================================ */}
        {/* 🔼 DROPZONE HEADER */}
        {/* ============================================================ */}
        <div
          className={`
            relative px-6 py-4 border-b transition-all duration-300
            ${isDraggingOver 
              ? 'border-cyan-500 bg-cyan-500/10' 
              : 'border-gray-800 bg-gray-900/50'
            }
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex items-center justify-between">
            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <FolderIcon className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Gestor Documental</h1>
                <p className="text-sm text-gray-400">
                  {documents.length} documentos • GDPR Compliant
                </p>
              </div>
            </div>

            {/* Search + Actions */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar documentos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 bg-gray-800 border border-gray-700 rounded-lg
                           text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400'}`}
                >
                  <Squares2X2Icon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400'}`}
                >
                  <ListBulletIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Jurisdiction Selector */}
              <select
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value as 'ES' | 'AR' | 'GDPR')}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <option value="ES">🇪🇸 España</option>
                <option value="AR">🇦🇷 Argentina</option>
                <option value="GDPR">🇪🇺 GDPR</option>
              </select>

              {/* Upload Button */}
              <Button
                variant="primary"
                onClick={() => setShowUploader(true)}
                className="flex items-center gap-2"
              >
                <CloudArrowUpIcon className="w-5 h-5" />
                Subir Documento
              </Button>
            </div>
          </div>

          {/* Drag Overlay */}
          {isDraggingOver && (
            <div className="absolute inset-0 bg-cyan-500/10 border-2 border-dashed border-cyan-500 rounded-lg
                          flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <CloudArrowUpIcon className="w-12 h-12 text-cyan-400 mx-auto mb-2" />
                <p className="text-cyan-400 font-medium">Suelta para subir</p>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* 📊 MAIN CONTENT */}
        {/* ============================================================ */}
        <div className="flex-1 flex overflow-hidden">
          {/* ============================================================ */}
          {/* 📁 SIDEBAR - Category Explorer */}
          {/* ============================================================ */}
          <aside className="w-64 border-r border-gray-800 bg-gray-900/50 flex flex-col overflow-hidden">
            {/* Categories */}
            <div className="p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Categorías</h3>
              <nav className="space-y-1">
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  const isActive = categoryFilter === cat.id;
                  const count = categoryCounts[cat.id] || 0;
                  
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryFilter(cat.id as CategoryFilter)}
                      className={`
                        w-full flex items-center justify-between px-3 py-2 rounded-lg
                        transition-all duration-200
                        ${isActive 
                          ? `${cat.bgColor} ${cat.color}` 
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{cat.label}</span>
                      </div>
                      <span className={`text-xs ${isActive ? cat.color : 'text-gray-500'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-800 mx-4" />

            {/* Recent Patients */}
            <div className="p-4 flex-1 overflow-y-auto">
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Pacientes Recientes</h3>
              <nav className="space-y-1">
                {recentPatients.map(patient => (
                  <button
                    key={patient.id}
                    onClick={() => setSearchQuery(patient.name)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg
                             text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      <span className="text-sm truncate">{patient.name}</span>
                    </div>
                    <ChevronRightIcon className="w-3 h-3 text-gray-600" />
                  </button>
                ))}
                {recentPatients.length === 0 && (
                  <p className="text-xs text-gray-600 px-3">Sin pacientes recientes</p>
                )}
              </nav>
            </div>

            {/* Security Badge */}
            <div className="p-4 border-t border-gray-800">
              <div className="flex items-center gap-2 text-green-400 text-xs">
                <ShieldCheckIcon className="w-4 h-4" />
                <span>RBAC + Soft Delete</span>
              </div>
            </div>
          </aside>

          {/* ============================================================ */}
          {/* 📄 DOCUMENTS GRID */}
          {/* ============================================================ */}
          <main className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Spinner size="lg" />
                <span className="ml-3 text-gray-400">Cargando documentos...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-400 mr-3" />
                <span className="text-red-400">Error: {error.message}</span>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <FolderIcon className="w-16 h-16 mb-4 text-gray-600" />
                <p className="text-lg">No hay documentos</p>
                <p className="text-sm mt-1">
                  {searchQuery ? 'Prueba con otra búsqueda' : 'Sube tu primer documento'}
                </p>
                <Button
                  variant="primary"
                  onClick={() => setShowUploader(true)}
                  className="mt-4"
                >
                  <CloudArrowUpIcon className="w-5 h-5 mr-2" />
                  Subir Documento
                </Button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                {filteredDocuments.map(doc => (
                  <FileCard
                    key={doc.id}
                    document={doc}
                    onSelect={handleDocumentSelect}
                    onDelete={handleDocumentDelete}
                    onDownload={handleDocumentDownload}
                  />
                ))}
              </div>
            ) : (
              /* List View */
              <div className="space-y-2">
                {filteredDocuments.map(doc => (
                  <div
                    key={doc.id}
                    onClick={() => handleDocumentSelect(doc)}
                    className="flex items-center gap-4 p-4 bg-gray-800/50 border border-gray-700/50 
                             rounded-lg hover:border-cyan-500/50 cursor-pointer transition-colors"
                  >
                    {/* Icon */}
                    <div className="p-2 bg-gray-900 rounded-lg">
                      {doc.is_image ? (
                        <PhotoIcon className="w-6 h-6 text-purple-400" />
                      ) : (
                        <DocumentTextIcon className="w-6 h-6 text-cyan-400" />
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-white truncate">
                        {doc.title || doc.file_name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {doc.patient && `${doc.patient.first_name} ${doc.patient.last_name} • `}
                        {doc.file_size_mb?.toFixed(1)} MB • {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2">
                      {doc.ai_analyzed && <Badge variant="info" className="text-xs">🤖 IA</Badge>}
                      {doc.is_confidential && <Badge variant="warning" className="text-xs">🔒</Badge>}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDocumentDownload(doc); }}
                        className="p-2 text-gray-400 hover:text-cyan-400 transition-colors"
                      >
                        <CloudArrowUpIcon className="w-5 h-5 rotate-180" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDocumentDelete(doc); }}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>

        {/* ============================================================ */}
        {/* 🎭 MODALS */}
        {/* ============================================================ */}
        
        {/* Delete Protocol Modal */}
        {documentToDelete && (
          <DocumentDeleteProtocol
            document={documentToDelete}
            jurisdiction={jurisdiction}
            onConfirmDelete={handleConfirmDelete}
            onCancel={() => setDocumentToDelete(null)}
          />
        )}

        {/* Uploader Modal */}
        {showUploader && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              // Close on backdrop click (not on content click)
              if (e.target === e.currentTarget) {
                setShowUploader(false);
              }
            }}
          >
            <div className="bg-gray-900 border border-cyan-500/30 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
              {/* Close Button */}
              <button
                onClick={() => setShowUploader(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors z-10"
                title="Cerrar"
              >
                ✕
              </button>
              <DocumentUploaderV3Redesigned
                onUploadSuccess={handleUploadSuccess}
                onCancel={() => setShowUploader(false)}
              />
            </div>
          </div>
        )}

        {/* Document Viewer */}
        {showViewer && selectedDocument && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-cyan-500/30 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <h2 className="text-lg font-bold text-white">{selectedDocument.title || selectedDocument.file_name}</h2>
                <button
                  onClick={() => { setShowViewer(false); setSelectedDocument(null); }}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
                {/* Document Preview */}
                <div className="space-y-4">
                  {/* 🔐 CLINICAL CONTENT PROTECTION */}
                  {selectedDocument.legal_category === 'medical' && !canViewClinicalContent ? (
                    <div className="bg-red-900/20 border-2 border-red-500/50 rounded-lg p-8 flex flex-col items-center justify-center">
                      <LockClosedIcon className="w-16 h-16 text-red-400 mb-4" />
                      <h3 className="text-xl font-bold text-red-400 mb-2">
                        🔒 CONTENIDO CLÍNICO PROTEGIDO
                      </h3>
                      <p className="text-gray-400 text-center max-w-md">
                        Por razones de privacidad médica, el rol <span className="text-cyan-400 font-semibold">{userRole}</span> no tiene acceso 
                        a la visualización de documentos clínicos.
                      </p>
                      <p className="text-gray-500 text-sm mt-4">
                        Solo DENTIST y OWNER pueden ver este contenido.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Image Preview - Only if authorized */}
                      {selectedDocument.is_image && selectedDocument.download_url && (
                        <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-center">
                          <img 
                            src={selectedDocument.download_url} 
                            alt={selectedDocument.title}
                            className="max-h-[400px] object-contain rounded-lg"
                          />
                        </div>
                      )}
                    </>
                  )}

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Información</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Nombre:</span>
                          <span className="text-white">{selectedDocument.file_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Tamaño:</span>
                          <span className="text-white">{selectedDocument.file_size_mb?.toFixed(2)} MB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Tipo:</span>
                          <span className="text-white">{selectedDocument.mime_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Fecha:</span>
                          <span className="text-white">{new Date(selectedDocument.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Paciente</h4>
                      {selectedDocument.patient ? (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Nombre:</span>
                            <span className="text-white">
                              {selectedDocument.patient.first_name} {selectedDocument.patient.last_name}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">Documento de clínica</p>
                      )}
                    </div>
                  </div>

                  {/* AI Tags */}
                  {selectedDocument.ai_tags && selectedDocument.ai_tags.length > 0 && (
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">🤖 Tags IA</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedDocument.ai_tags.map((tag, i) => (
                          <Badge key={i} variant="info" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      variant="primary"
                      onClick={() => handleDocumentDownload(selectedDocument)}
                      className="flex-1"
                    >
                      <CloudArrowUpIcon className="w-5 h-5 mr-2 rotate-180" />
                      Descargar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </StaffGuard>
  );
};

export default DocumentsPageV4;
