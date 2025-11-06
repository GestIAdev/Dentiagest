/**
 * 📄 DOCUMENTS API MODULE - APOLLO SPECIALIZED ENDPOINTS
 * OPERACIÓN APOLLO - Document management with V1/V2 migration support
 * 
 * @author PunkClaude & RaulVisionario  
 * @date 17 Agosto 2025
 * @mission Replace scattered document fetch calls
 */

import { apolloApi, API_ENDPOINTS, ApiResponse } from './ApiService';

// ============================================================================
// DOCUMENT TYPES
// ============================================================================

export interface Document {
  id: string;
  title: string;
  document_type: string;
  category: string;
  access_level: string;
  file_path: string;
  file_size: number;
  uploaded_at: string;
  patient_id?: string;
  created_by: string;
}

export interface DocumentUploadData {
  file: File;
  title: string;
  documentType: string;
  accessLevel: string;
  patientId?: string;
}

export interface DocumentListFilters {
  patient_id?: string;
  document_type?: string;
  category?: string;
  access_level?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface DocumentStats {
  total_documents: number;
  pending_deletion: number;
  deleted_this_month: number;
  storage_used_mb: number;
}

// ============================================================================
// DOCUMENTS API SERVICE
// ============================================================================

class DocumentsApiService {
  
  /**
   * 📤 UPLOAD DOCUMENT
   * Replaces: DocumentUpload.tsx fetch calls
   */
  public async uploadDocument(uploadData: DocumentUploadData): Promise<ApiResponse<Document>> {
    const formData = new FormData();
    formData.append('file', uploadData.file);
    formData.append('title', uploadData.title);
    formData.append('document_type', uploadData.documentType);
    formData.append('access_level', uploadData.accessLevel);
    
    if (uploadData.patientId) {
      formData.append('patient_id', uploadData.patientId);
    }

    return apolloApi.request<Document>(API_ENDPOINTS.DOCUMENTS.UPLOAD, {
      method: 'POST',
      body: formData,
      headers: {}, // FormData sets its own Content-Type
      requiresAuth: true
    });
  }

  /**
   * 📋 LIST DOCUMENTS  
   * Replaces: DocumentList.tsx fetch calls
   */
  public async listDocuments(filters: DocumentListFilters = {}): Promise<ApiResponse<Document[]>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const endpoint = params.toString() 
      ? `${API_ENDPOINTS.DOCUMENTS.LIST}?${params}`
      : API_ENDPOINTS.DOCUMENTS.LIST;

    return apolloApi.get<Document[]>(endpoint);
  }

  /**
   * 📥 DOWNLOAD DOCUMENT
   * Replaces: DocumentViewer.tsx download logic
   */
  public async downloadDocument(documentId: string): Promise<ApiResponse<Blob>> {
    const endpoint = apolloApi.replaceUrlParams(API_ENDPOINTS.DOCUMENTS.DOWNLOAD, { id: documentId });
    
    return apolloApi.request<Blob>(endpoint, {
      method: 'GET',
      headers: { 'Accept': 'application/octet-stream' },
      requiresAuth: true
    });
  }

  /**
   * 🗑️ DELETE DOCUMENT
   * Replaces: DeleteDocumentButton.tsx logic
   */
  public async deleteDocument(documentId: string): Promise<ApiResponse<void>> {
    const endpoint = apolloApi.replaceUrlParams(API_ENDPOINTS.DOCUMENTS.DELETE, { id: documentId });
    return apolloApi.delete<void>(endpoint);
  }

  /**
   * 📊 GET DELETION STATS
   * Replaces: DocumentDeletionPage.tsx stats fetch
   */
  public async getDeletionStats(): Promise<ApiResponse<DocumentStats>> {
    return apolloApi.get<DocumentStats>(API_ENDPOINTS.DOCUMENTS.DELETION_STATS);
  }

  /**
   * 📝 GET DELETION REQUESTS
   * Replaces: DocumentDeletionPage.tsx requests fetch
   */
  public async getDeletionRequests(status?: string): Promise<ApiResponse<any[]>> {
    const params = status ? `?status=${status}` : '';
    return apolloApi.get<any[]>(`${API_ENDPOINTS.DOCUMENTS.DELETION_REQUESTS}${params}`);
  }

  /**
   * 🔗 GET DOWNLOAD URL
   * Helper function for document URLs
   */
  public getDownloadUrl(documentId: string, version: 'v1' | 'v2' = 'v1'): string {
    const endpoint = apolloApi.replaceUrlParams(API_ENDPOINTS.DOCUMENTS.DOWNLOAD, { id: documentId });
    const apiInfo = apolloApi.getApiInfo();
    return `${apiInfo.baseUrl}/api/${version}${endpoint}`; // 🔥 USE DYNAMIC CONFIG
  }

  /**
   * 🔄 MIGRATE TO V2
   * Switch document operations to V2 API
   */
  public async listDocumentsV2(filters: DocumentListFilters = {}): Promise<ApiResponse<Document[]>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const endpoint = params.toString() 
      ? `${API_ENDPOINTS.DOCUMENTS.LIST}?${params}`
      : API_ENDPOINTS.DOCUMENTS.LIST;

    return apolloApi.get<Document[]>(endpoint, { version: 'v2' });
  }

  public async uploadDocumentV2(uploadData: DocumentUploadData): Promise<ApiResponse<Document>> {
    const formData = new FormData();
    formData.append('file', uploadData.file);
    formData.append('title', uploadData.title);
    formData.append('document_type', uploadData.documentType);
    formData.append('access_level', uploadData.accessLevel);
    
    if (uploadData.patientId) {
      formData.append('patient_id', uploadData.patientId);
    }

    return apolloApi.request<Document>(API_ENDPOINTS.DOCUMENTS.UPLOAD, {
      method: 'POST',
      body: formData,
      headers: {},
      requiresAuth: true,
      version: 'v2'
    });
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const documentsApi = new DocumentsApiService();

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

export const docs = {
  upload: documentsApi.uploadDocument.bind(documentsApi),
  list: documentsApi.listDocuments.bind(documentsApi),
  download: documentsApi.downloadDocument.bind(documentsApi),
  delete: documentsApi.deleteDocument.bind(documentsApi),
  getStats: documentsApi.getDeletionStats.bind(documentsApi),
  getRequests: documentsApi.getDeletionRequests.bind(documentsApi),
  getDownloadUrl: documentsApi.getDownloadUrl.bind(documentsApi),
  
  // V2 methods
  uploadV2: documentsApi.uploadDocumentV2.bind(documentsApi),
  listV2: documentsApi.listDocumentsV2.bind(documentsApi)
};

export default documentsApi;

/**
 * 🎸 DOCUMENTS API USAGE EXAMPLES:
 * 
 * // Upload document
 * const result = await docs.upload({
 *   file: fileObject,
 *   title: 'X-Ray Results',
 *   documentType: 'radiografia',
 *   accessLevel: 'medical',
 *   patientId: '123'
 * });
 * 
 * // List documents with filters
 * const documents = await docs.list({
 *   patient_id: '123',
 *   document_type: 'radiografia',
 *   page: 1,
 *   limit: 20
 * });
 * 
 * // Download document
 * const fileBlob = await docs.download('doc123');
 * 
 * // Get download URL for iframe
 * const url = docs.getDownloadUrl('doc123');
 * 
 * // Use V2 API
 * const documentsV2 = await docs.listV2({ patient_id: '123' });
 * 
 * "Document operations made simple!" 📄⚡
 */
