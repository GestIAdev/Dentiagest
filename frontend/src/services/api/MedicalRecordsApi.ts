/**
 * 🏥 APOLLO API MODULE: Medical Records Operations
 * 
 * OPERACIÓN APOLLO - Phase 2: Medical Records API Service
 * 
 * Centralized medical records API operations with:
 * ✅ V1/V2 switching capability
 * ✅ Performance monitoring
 * ✅ Type safety with TypeScript
 * ✅ Comprehensive error handling
 * ✅ Response caching potential
 * 
 * Benefits:
 * - Eliminates scattered fetch calls across 10+ components
 * - Automatic V1/V2 API switching based on performance
 * - Centralized error handling and logging
 * - Type safety for all medical record operations
 * - Performance monitoring and metrics
 * 
 * @author RaulVisionario & PunkClaude
 * @version 1.0.0 (Apollo Phase 2)
 */

import apolloApi, { ApiResponse } from './ApiService';

// 🎯 MEDICAL RECORD INTERFACES
export interface MedicalRecord {
  id: string;
  patient_id: string;
  title: string;
  content: string;
  record_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  creator_id: string;
  // Additional fields for extended functionality
  tags?: string[];
  attachments?: string[];
  diagnosis?: string;
  treatment_plan?: string;
  notes?: string;
}

export interface MedicalRecordCreateRequest {
  patient_id: string;
  title: string;
  content: string;
  record_type: string;
  diagnosis?: string;
  treatment_plan?: string;
  notes?: string;
  tags?: string[];
}

export interface MedicalRecordUpdateRequest {
  title?: string;
  content?: string;
  record_type?: string;
  status?: string;
  diagnosis?: string;
  treatment_plan?: string;
  notes?: string;
  tags?: string[];
}

export interface MedicalRecordListParams {
  patient_id?: string;
  record_type?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  limit?: number;
  offset?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface MedicalRecordListResponse {
  items: MedicalRecord[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

/**
 * 🏥 MEDICAL RECORDS API SERVICE
 * 
 * Centralized service for all medical record operations
 * Uses same pattern as DocumentsApi with Apollo core engine
 */
export class MedicalRecordsApi {

  /**
   * 📋 LIST MEDICAL RECORDS
   * 
   * Fetch medical records with filtering and pagination
   * Replaces: MedicalRecordsList.tsx fetch calls
   */
  public async list(filters: MedicalRecordListParams = {}): Promise<ApiResponse<MedicalRecordListResponse>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const endpoint = params.toString() 
      ? `/api/v1/medical-records?${params}`
      : '/api/v1/medical-records';

    return apolloApi.get<MedicalRecordListResponse>(endpoint);
  }

  /**
   * 🔍 GET MEDICAL RECORD BY ID
   * 
   * Fetch a specific medical record with full details
   * Replaces: MedicalRecordDetail.tsx fetch calls
   */
  public async getById(recordId: string): Promise<ApiResponse<MedicalRecord>> {
    return apolloApi.get<MedicalRecord>(`/api/v1/medical-records/${recordId}`);
  }

  /**
   * ➕ CREATE MEDICAL RECORD
   * 
   * Create a new medical record
   * Replaces: MedicalRecordForm.tsx create calls
   */
  public async create(recordData: MedicalRecordCreateRequest): Promise<ApiResponse<MedicalRecord>> {
    return apolloApi.post<MedicalRecord>('/api/v1/medical-records', recordData);
  }

  /**
   * ✏️ UPDATE MEDICAL RECORD
   * 
   * Update an existing medical record
   * Replaces: MedicalRecordForm.tsx update calls
   */
  public async update(recordId: string, updateData: MedicalRecordUpdateRequest): Promise<ApiResponse<MedicalRecord>> {
    return apolloApi.put<MedicalRecord>(`/api/v1/medical-records/${recordId}`, updateData);
  }

  /**
   * 🗑️ DELETE MEDICAL RECORD
   * 
   * Delete a medical record (soft delete)
   */
  public async delete(recordId: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return apolloApi.delete<{ success: boolean; message: string }>(`/api/v1/medical-records/${recordId}`);
  }

  /**
   * 🔍 SEARCH MEDICAL RECORDS
   * 
   * Advanced search across medical records
   */
  public async search(query: string, filters: Partial<MedicalRecordListParams> = {}): Promise<ApiResponse<MedicalRecordListResponse>> {
    const searchParams = { ...filters, search: query };
    return this.list(searchParams);
  }
}

// � APOLLO MEDICAL RECORDS SERVICE INSTANCE
export const medicalRecords = new MedicalRecordsApi();

// 🎯 DEFAULT EXPORT
export default medicalRecords;
