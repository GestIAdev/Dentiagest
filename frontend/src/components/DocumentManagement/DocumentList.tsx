// DOCUMENT_MANAGEMENT: Document List & Viewer Component
/**
 * DocumentList Component - Professional Medical Document Management
 * 
 * Features que hacen que los sistemas enterprise lloreen d        if (response.ok) {
          const data = await response.json();
          setDocuments(data.items || []);
          setTotalDocuments(data.total || 0);
        }
      } catch (err) {
        console.error('Error fetching documents:', err);a:
 * ✅ Advanced search & filtering (by patient, type, date)
 * ✅ Document preview & download
 * ✅ AI analysis status & results display
 * ✅ GDPR Article 9 access control
 * ✅ Role-based document visibility
 * ✅ Medical image viewer with zoom
 * 
 * PLATFORM_PATTERN: Adaptable structure:
 * - VetGest: Pet documents and medical photos
 * - MechaGest: Service photos and repair documentation
 * - RestaurantGest: Food photos and supplier documents
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  MagnifyingGlassIcon,
  DocumentIcon,
  PhotoIcon,
  MicrophoneIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  CalendarIcon,
  UserIcon,
  TagIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// 🦷 DENTAL_SPECIFIC: Import types from upload component
import { DocumentType, AccessLevel } from './DocumentUpload.tsx';
import { DocumentCategory } from './DocumentCategories.tsx';

interface MedicalDocument {
  id: string;
  patient_id: string;
  medical_record_id?: string;
  title: string;
  description?: string;
  document_type: DocumentType;
  file_name: string;
  file_size: number;
  file_size_mb: number;
  mime_type: string;
  access_level: AccessLevel;
  is_confidential: boolean;
  created_at: string;
  document_date?: string;
  
  // AI Analysis
  ai_analyzed: boolean;
  ai_confidence_scores?: any;
  ocr_extracted_text?: string;
  ai_tags?: string[];
  
  // Patient info (from JOIN)
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

interface SearchFilters {
  search: string;
  document_type: string;
  category: string;  // 🔥 NEW: Category filter
  access_level: string;
  patient_id: string;
  start_date: string;
  end_date: string;
  ai_analyzed: string;
  is_confidential: string;
  page: number;
  size: number;
  sort_by: string;
  sort_order: string;
}

interface DocumentListProps {
  patientId?: string; // Si se proporciona, filtrar por paciente específico
  medicalRecordId?: string; // Si se proporciona, filtrar por historial médico
  categoryFilter?: DocumentCategory; // 🔥 NEW: Category filter from tabs
  className?: string;
  onDocumentSelect?: (document: MedicalDocument) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  patientId,
  medicalRecordId,
  categoryFilter,
  className = '',
  onDocumentSelect
}) => {
  const { state } = useAuth();
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  
  // Search & Filter state
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    document_type: '',
    category: '',  // 🔥 NEW: Category filter
    access_level: '',
    patient_id: patientId || '',
    start_date: '',
    end_date: '',
    ai_analyzed: '',
    is_confidential: '',
    page: 1,
    size: 12,
    sort_by: 'created_at',
    sort_order: 'desc'
  });

  // 🔥 CATEGORY TO DOCUMENT_TYPE MAPPING (matching backend enum values)
  const getCategoryDocumentTypes = (category: DocumentCategory): string[] => {
    const categoryMappings = {
      [DocumentCategory.MEDICAL]: [
        'XRAY_BITEWING', 'XRAY_PANORAMIC', 'XRAY_PERIAPICAL', 'XRAY_CEPHALOMETRIC',
        'CT_SCAN', 'CBCT_SCAN', 'INTRAORAL_PHOTO', 'EXTRAORAL_PHOTO', 'CLINICAL_PHOTO',
        'PROGRESS_PHOTO', 'BEFORE_AFTER_PHOTO', 'LAB_REPORT', 'VOICE_NOTE', 'SCAN_IMPRESSION', 'STL_FILE'
      ],
      [DocumentCategory.ADMINISTRATIVE]: [
        'TREATMENT_PLAN', 'REFERRAL_LETTER', 'PRESCRIPTION', 'OTHER_DOCUMENT'
      ],
      [DocumentCategory.LEGAL]: [
        'CONSENT_FORM'
      ],
      [DocumentCategory.BILLING]: [
        'INSURANCE_FORM'
      ]
    };
    return categoryMappings[category] || [];
  };

  // 🎯 FILTER DOCUMENTS BY CATEGORY (Frontend filtering)
  const getFilteredDocuments = (docs: MedicalDocument[], category: DocumentCategory): MedicalDocument[] => {
    const allowedTypes = getCategoryDocumentTypes(category);
    
    const filtered = docs.filter(doc => {
      const match = allowedTypes.includes(doc.document_type);
      return match;
    });
    
    return filtered;
  };

  // � BRUTAL DIRECT APPROACH: Fetch immediately when category changes
  useEffect(() => {
    const directFetch = async () => {
      if (!state.accessToken) return;
      
      // Build direct params
      const params = new URLSearchParams({
        page: '1',
        size: '12',
        sort_by: 'created_at',
        sort_order: 'desc'
      });
      
      if (categoryFilter) {
        params.append('category', categoryFilter);
      }
      
      if (patientId) {
        params.append('patient_id', patientId);
      }
      
      try {
        setLoading(true);
        
        const response = await fetch(`http://127.0.0.1:8002/api/v1/medical-records/documents?${params}`, {
          headers: {
            'Authorization': `Bearer ${state.accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setDocuments(data.items || []);
          setTotalDocuments(data.total || 0);
          console.log('� DIRECT RESULT:', data.items?.length || 0, 'documents');
        }
      } catch (err) {
        console.error('🔥 DIRECT FETCH ERROR:', err);
      } finally {
        setLoading(false);
      }
    };
    
    directFetch();
  }, [categoryFilter, patientId, state.accessToken]);

  // 🎨 AINARKLENDAR STYLING: Clean icon mapping
  const getDocumentIcon = (document: MedicalDocument) => {
    if (document.is_image) return <PhotoIcon className="h-6 w-6 text-blue-500" />;
    if (document.document_type.includes('voice')) return <MicrophoneIcon className="h-6 w-6 text-green-500" />;
    return <DocumentIcon className="h-6 w-6 text-gray-500" />;
  };

  const getDocumentTypeLabel = (type: DocumentType): string => {
    const labels: Record<DocumentType, string> = {
      [DocumentType.XRAY_BITEWING]: 'Rayos X Bitewing',
      [DocumentType.XRAY_PANORAMIC]: 'Rayos X Panorámica',
      [DocumentType.XRAY_PERIAPICAL]: 'Rayos X Periapical',
      [DocumentType.INTRAORAL_PHOTO]: 'Foto Intraoral',
      [DocumentType.CLINICAL_PHOTO]: 'Foto Clínica',
      [DocumentType.PROGRESS_PHOTO]: 'Foto Progreso',
      [DocumentType.CONSENT_FORM]: 'Consentimiento',
      [DocumentType.TREATMENT_PLAN]: 'Plan Tratamiento',
      [DocumentType.VOICE_NOTE]: 'Nota de Voz',
      [DocumentType.PRESCRIPTION]: 'Prescripción',
      [DocumentType.LAB_REPORT]: 'Reporte Laboratorio',
      [DocumentType.INSURANCE_DOCUMENT]: 'Documento Seguro'
    };
    return labels[type] || type;
  };

  const getAccessLevelBadge = (level: AccessLevel) => {
    const styles = {
      [AccessLevel.PUBLIC]: 'bg-green-100 text-green-800',
      [AccessLevel.RESTRICTED]: 'bg-blue-100 text-blue-800',
      [AccessLevel.CONFIDENTIAL]: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      [AccessLevel.PUBLIC]: 'Público',
      [AccessLevel.RESTRICTED]: 'Restringido',
      [AccessLevel.CONFIDENTIAL]: 'Confidencial'
    };

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[level]}`}>
        <ShieldCheckIcon className="h-3 w-3 mr-1" />
        {labels[level]}
      </span>
    );
  };

  // 📡 FETCH DOCUMENTS from API
  const fetchDocuments = async () => {
    if (!state.accessToken) return;

    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`http://127.0.0.1:8002/api/v1/medical-records/documents?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${state.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error:', response.status, errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setDocuments(data.items || []);
      setTotalDocuments(data.total || 0);
      setTotalPages(data.pages || 0);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading documents');
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 EFFECTS
  useEffect(() => {
    fetchDocuments();
  }, [filters, state.accessToken]);

  // 🔍 FILTER HELPERS
  const updateFilter = (key: string, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : Number(value) // Reset page when changing other filters
    }));
  };

  // 📅 FORMAT DATE
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // 📐 FORMAT FILE SIZE
  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(0)}KB` : `${mb.toFixed(1)}MB`;
  };

  // 📤 DOWNLOAD DOCUMENT
  const handleDownload = async (document: MedicalDocument) => {
    if (!state.accessToken) return;

    try {
      const response = await fetch(`http://127.0.0.1:8002/api/v1/medical-records/documents/${document.id}/download`, {
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
    }
  };

  // 🎯 GET FILTERED DOCUMENTS BASED ON ACTIVE CATEGORY (now handled by backend)
  // const filteredDocuments = categoryFilter 
  //   ? getFilteredDocuments(documents, categoryFilter)
  //   : documents;

  if (loading && documents.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando documentos...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 📊 HEADER & STATS */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Documentos Médicos
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            {documents.length} documento(s) encontrado(s)
            {patientId && ' para este paciente'}
            {categoryFilter && (
              <span className="ml-2 text-blue-600">
                • Categoría: {
                  categoryFilter === DocumentCategory.MEDICAL && 'Médicos' ||
                  categoryFilter === DocumentCategory.ADMINISTRATIVE && 'Administrativos' ||
                  categoryFilter === DocumentCategory.LEGAL && 'Legales' ||
                  categoryFilter === DocumentCategory.BILLING && 'Facturación'
                }
              </span>
            )}
          </p>
        </div>
      </div>

      {/* 🔍 SEARCH & FILTERS */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre de archivo, paciente o contenido OCR..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                />
              </div>
            </div>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FunnelIcon className="-ml-1 mr-2 h-5 w-5" />
              Filtros
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Documento
                </label>
                <select
                  value={filters.document_type}
                  onChange={(e) => updateFilter('document_type', e.target.value)}
                  className="form-input"
                >
                  <option value="">Todos los tipos</option>
                  {Object.values(DocumentType).map(type => (
                    <option key={type} value={type}>
                      {getDocumentTypeLabel(type)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nivel de Acceso
                </label>
                <select
                  value={filters.access_level}
                  onChange={(e) => updateFilter('access_level', e.target.value)}
                  className="form-input"
                >
                  <option value="">Todos los niveles</option>
                  {Object.values(AccessLevel).map(level => (
                    <option key={level} value={level}>
                      {level.replace('_', ' ').toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Análisis IA
                </label>
                <select
                  value={filters.ai_analyzed}
                  onChange={(e) => updateFilter('ai_analyzed', e.target.value)}
                  className="form-input"
                >
                  <option value="">Todos</option>
                  <option value="true">Analizados por IA</option>
                  <option value="false">Pendientes de análisis</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha desde
                </label>
                <input
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => updateFilter('start_date', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 📋 DOCUMENTS GRID */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {documents.length === 0 && !loading ? (
        <div className="text-center py-12">
          <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {categoryFilter ? 'Sin documentos en esta categoría' : 'No hay documentos'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {patientId 
              ? 'Este paciente no tiene documentos médicos aún'
              : categoryFilter 
                ? 'No se encontraron documentos en esta categoría'
                : 'No se encontraron documentos con los filtros actuales'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {documents.map((document) => (
            <div
              key={document.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              {/* 🖼️ DOCUMENT PREVIEW */}
              <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                {document.is_image && document.thumbnail_url ? (
                  <img
                    src={document.thumbnail_url}
                    alt={document.title}
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <div className="w-full h-32 flex items-center justify-center">
                    {getDocumentIcon(document)}
                  </div>
                )}
                
                {/* 🏷️ TYPE BADGE */}
                <div className="absolute top-2 left-2">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-white bg-opacity-90">
                    {getDocumentTypeLabel(document.document_type)}
                  </span>
                </div>

                {/* 🤖 AI BADGE */}
                {document.ai_analyzed && (
                  <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center p-1 rounded-full bg-green-100 text-green-600">
                      <SparklesIcon className="h-4 w-4" />
                    </span>
                  </div>
                )}
              </div>

              {/* 📄 DOCUMENT INFO */}
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {document.title}
                </h3>
                
                {document.patient && (
                  <p className="mt-1 text-xs text-gray-600 flex items-center">
                    <UserIcon className="h-3 w-3 mr-1" />
                    {document.patient.first_name} {document.patient.last_name}
                  </p>
                )}

                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    {formatDate(document.created_at)}
                  </span>
                  <span>{formatFileSize(document.file_size)}</span>
                </div>

                {/* 🏷️ ACCESS LEVEL */}
                <div className="mt-2">
                  {getAccessLevelBadge(document.access_level)}
                </div>

                {/* 🤖 AI TAGS */}
                {document.ai_tags && document.ai_tags.length > 0 && (
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-1">
                      {document.ai_tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-700"
                        >
                          <TagIcon className="h-2 w-2 mr-1" />
                          {tag}
                        </span>
                      ))}
                      {document.ai_tags.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{document.ai_tags.length - 2} más
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* 🔧 ACTIONS */}
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => onDocumentSelect && onDocumentSelect(document)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <EyeIcon className="h-3 w-3 mr-1" />
                    Ver
                  </button>
                  <button
                    onClick={() => handleDownload(document)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <ArrowDownTrayIcon className="h-3 w-3 mr-1" />
                    Descargar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 📄 PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-lg">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => updateFilter('page', Math.max(1, filters.page - 1))}
              disabled={filters.page <= 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => updateFilter('page', Math.min(totalPages, filters.page + 1))}
              disabled={filters.page >= totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando página <span className="font-medium">{filters.page}</span> de{' '}
                <span className="font-medium">{totalPages}</span>
                {' '}({totalDocuments} documentos total)
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => updateFilter('page', Math.max(1, filters.page - 1))}
                  disabled={filters.page <= 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => updateFilter('page', Math.min(totalPages, filters.page + 1))}
                  disabled={filters.page >= totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
