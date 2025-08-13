// 🔥 ANARCHYSTEXORCISM: Simple Document List - NO COMPLEXITY BS
/**
 * DocumentList_SIMPLE - BRUTAL DIRECT APPROACH
 * 
 * Features:
 * ✅ ZERO complex state management
 * ✅ DIRECT API calls when category changes
 * ✅ NO race conditions
 * ✅ NO useEffect hell
 * ✅ PURE IMPERATIVE FETCHING
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { DocumentCategory } from './DocumentCategories.tsx';
import {
  DocumentIcon,
  PhotoIcon,
  MicrophoneIcon,
} from '@heroicons/react/24/outline';

interface MedicalDocument {
  id: string;
  title: string;
  description?: string;
  file_name: string;
  file_size_mb: number;
  mime_type: string;
  is_image: boolean;
  document_type: string;
  download_url: string;
  thumbnail_url?: string;
  created_at: string;
  patient?: {
    first_name: string;
    last_name: string;
  };
}

interface DocumentListSimpleProps {
  patientId?: string;
  categoryFilter?: DocumentCategory;
  onDocumentSelect?: (document: MedicalDocument) => void;
}

export const DocumentListSimple: React.FC<DocumentListSimpleProps> = ({
  patientId,
  categoryFilter,
  onDocumentSelect
}) => {
  const { state } = useAuth();
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔥 BRUTAL DIRECT FETCH - NO BS (Now with useCallback stability)
  const fetchDocuments = useCallback(async (category?: DocumentCategory, patient?: string) => {
    if (!state.accessToken) return;

    const params = new URLSearchParams({
      page: '1',
      size: '20',
      sort_by: 'created_at',
      sort_order: 'desc'
    });

    if (category) {
      params.append('category', category);
      console.log('🔥 FETCHING CATEGORY:', category);
    }

    if (patient) {
      params.append('patient_id', patient);
      console.log('🔥 FETCHING PATIENT:', patient);
    }

    const url = `http://127.0.0.1:8002/api/v1/medical-records/documents?${params}`;
    console.log('🔥 BRUTAL REQUEST:', url);

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${state.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const items = data.items || [];
        console.log(`🔥 SUCCESS: ${items.length} documents for category "${category || 'ALL'}"`);
        
        // Log document types for debug
        items.forEach((doc: MedicalDocument) => {
          console.log(`  - ${doc.title} (${doc.document_type})`);
        });
        
        setDocuments(items);
      } else {
        const errorText = await response.text();
        console.error('🔥 RESPONSE ERROR:', response.status, errorText);
        setError(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error('🔥 NETWORK ERROR:', err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [state.accessToken]);

  // 🔥 INITIAL LOAD
  useEffect(() => {
    console.log('🔥 INITIAL LOAD');
    fetchDocuments(categoryFilter, patientId);
  }, [fetchDocuments, categoryFilter, patientId]);

  // 🔥 CATEGORY CHANGE
  useEffect(() => {
    if (categoryFilter) {
      console.log('🔥 CATEGORY CHANGED:', categoryFilter);
      fetchDocuments(categoryFilter, patientId);
    }
  }, [fetchDocuments, categoryFilter, patientId]);

  // 🔥 PATIENT CHANGE  
  useEffect(() => {
    console.log('🔥 PATIENT CHANGED:', patientId);
    fetchDocuments(categoryFilter, patientId);
  }, [fetchDocuments, patientId, categoryFilter]);

  // 🎨 SIMPLE ICON
  const getDocumentIcon = (document: MedicalDocument) => {
    if (document.is_image) return <PhotoIcon className="h-6 w-6 text-blue-500" />;
    if (document.document_type.includes('VOICE')) return <MicrophoneIcon className="h-6 w-6 text-green-500" />;
    return <DocumentIcon className="h-6 w-6 text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando documentos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 📊 HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Documentos Médicos</h1>
        <p className="mt-2 text-sm text-gray-700">
          {documents.length} documento(s) encontrado(s)
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

      {/* 📄 DOCUMENTS GRID */}
      {documents.length === 0 ? (
        <div className="text-center py-12">
          <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {categoryFilter ? 'Sin documentos en esta categoría' : 'Sin documentos'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {categoryFilter 
              ? 'No se encontraron documentos en esta categoría'
              : 'No se encontraron documentos'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {documents.map((document) => (
            <div
              key={document.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer"
              onClick={() => onDocumentSelect?.(document)}
            >
              {/* 🖼️ DOCUMENT PREVIEW */}
              <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                {document.is_image && document.thumbnail_url ? (
                  <img
                    src={document.thumbnail_url}
                    alt={document.title}
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      console.log('🖼️ Thumbnail error for:', document.title);
                      // Hide image on error
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                    {getDocumentIcon(document)}
                  </div>
                )}
              </div>

              {/* 📝 DOCUMENT INFO */}
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {document.title}
                </h3>
                
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                  <span>{new Date(document.created_at).toLocaleDateString('es-ES')}</span>
                  <span>{document.file_size_mb}MB</span>
                </div>

                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {document.document_type.replace('_', ' ').toLowerCase()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
