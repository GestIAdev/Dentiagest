/**
 * 👥 PATIENTS API MODULE - APOLLO SPECIALIZED ENDPOINTS
 * OPERACIÓN APOLLO - Patient management with V1/V2 migration support
 * 
 * @author PunkClaude & RaulVisionario  
 * @date 17 Agosto 2025
 * @mission Replace scattered patient fetch calls
 */

import { apolloApi, API_ENDPOINTS, ApiResponse } from './ApiService';

// ============================================================================
// PATIENT TYPES
// ============================================================================

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  medical_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PatientCreateData {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  medical_notes?: string;
}

export interface PatientUpdateData extends Partial<PatientCreateData> {
  id: string;
}

export interface PatientSearchFilters {
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PatientSuggestion {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

// ============================================================================
// PATIENTS API SERVICE
// ============================================================================

class PatientsApiService {

  /**
   * 👥 LIST PATIENTS
   * Replaces: PatientsPage.tsx fetch calls
   */
  public async listPatients(filters: PatientSearchFilters = {}): Promise<ApiResponse<Patient[]>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const endpoint = params.toString() 
      ? `${API_ENDPOINTS.PATIENTS.LIST}?${params}`
      : API_ENDPOINTS.PATIENTS.LIST;

    return apolloApi.get<Patient[]>(endpoint);
  }

  /**
   * 👤 GET PATIENT BY ID
   * Replaces: PatientsPage.tsx and PatientDetailView.tsx fetch calls
   */
  public async getPatient(patientId: string): Promise<ApiResponse<Patient>> {
    const endpoint = apolloApi.replaceUrlParams(API_ENDPOINTS.PATIENTS.GET, { id: patientId });
    return apolloApi.get<Patient>(endpoint);
  }

  /**
   * ➕ CREATE PATIENT
   * Replaces: PatientFormModal.tsx create logic
   */
  public async createPatient(patientData: PatientCreateData): Promise<ApiResponse<Patient>> {
    return apolloApi.post<Patient>(API_ENDPOINTS.PATIENTS.CREATE, patientData);
  }

  /**
   * ✏️ UPDATE PATIENT
   * Replaces: PatientFormModal.tsx update logic
   */
  public async updatePatient(patientData: PatientUpdateData): Promise<ApiResponse<Patient>> {
    const endpoint = apolloApi.replaceUrlParams(API_ENDPOINTS.PATIENTS.UPDATE, { id: patientData.id });
    return apolloApi.put<Patient>(endpoint, patientData);
  }

  /**
   * 🗑️ DELETE PATIENT
   * Future implementation for patient deletion
   */
  public async deletePatient(patientId: string): Promise<ApiResponse<void>> {
    const endpoint = apolloApi.replaceUrlParams(API_ENDPOINTS.PATIENTS.DELETE, { id: patientId });
    return apolloApi.delete<void>(endpoint);
  }

  /**
   * 🔍 SEARCH PATIENT SUGGESTIONS
   * Replaces: usePatients.tsx suggestions logic
   */
  public async searchSuggestions(query: string, limit: number = 10): Promise<ApiResponse<PatientSuggestion[]>> {
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('limit', String(limit));

    return apolloApi.get<PatientSuggestion[]>(`${API_ENDPOINTS.PATIENTS.SEARCH}?${params}`);
  }

  /**
   * 🔄 V2 METHODS - ENHANCED PERFORMANCE
   */
  public async listPatientsV2(filters: PatientSearchFilters = {}): Promise<ApiResponse<Patient[]>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const endpoint = params.toString() 
      ? `${API_ENDPOINTS.PATIENTS.LIST}?${params}`
      : API_ENDPOINTS.PATIENTS.LIST;

    return apolloApi.get<Patient[]>(endpoint, { version: 'v2' });
  }

  public async getPatientV2(patientId: string): Promise<ApiResponse<Patient>> {
    const endpoint = apolloApi.replaceUrlParams(API_ENDPOINTS.PATIENTS.GET, { id: patientId });
    return apolloApi.get<Patient>(endpoint, { version: 'v2' });
  }

  public async createPatientV2(patientData: PatientCreateData): Promise<ApiResponse<Patient>> {
    return apolloApi.post<Patient>(API_ENDPOINTS.PATIENTS.CREATE, patientData, { version: 'v2' });
  }

  public async updatePatientV2(patientData: PatientUpdateData): Promise<ApiResponse<Patient>> {
    const endpoint = apolloApi.replaceUrlParams(API_ENDPOINTS.PATIENTS.UPDATE, { id: patientData.id });
    return apolloApi.put<Patient>(endpoint, patientData, { version: 'v2' });
  }

  public async searchSuggestionsV2(query: string, limit: number = 10): Promise<ApiResponse<PatientSuggestion[]>> {
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('limit', String(limit));

    return apolloApi.get<PatientSuggestion[]>(`${API_ENDPOINTS.PATIENTS.SEARCH}?${params}`, { version: 'v2' });
  }

  /**
   * 📊 PATIENT STATISTICS
   * Future enhancement for analytics
   */
  public async getPatientStats(): Promise<ApiResponse<any>> {
    return apolloApi.get('/patients/stats');
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const patientsApi = new PatientsApiService();

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

export const patients = {
  list: patientsApi.listPatients.bind(patientsApi),
  get: patientsApi.getPatient.bind(patientsApi),
  create: patientsApi.createPatient.bind(patientsApi),
  update: patientsApi.updatePatient.bind(patientsApi),
  delete: patientsApi.deletePatient.bind(patientsApi),
  search: patientsApi.searchSuggestions.bind(patientsApi),
  stats: patientsApi.getPatientStats.bind(patientsApi),
  
  // V2 methods
  listV2: patientsApi.listPatientsV2.bind(patientsApi),
  getV2: patientsApi.getPatientV2.bind(patientsApi),
  createV2: patientsApi.createPatientV2.bind(patientsApi),
  updateV2: patientsApi.updatePatientV2.bind(patientsApi),
  searchV2: patientsApi.searchSuggestionsV2.bind(patientsApi)
};

export default patientsApi;

/**
 * 🎸 PATIENTS API USAGE EXAMPLES:
 * 
 * // List all patients
 * const allPatients = await patients.list();
 * 
 * // Search patients with filters
 * const searchResults = await patients.list({
 *   search: 'Juan',
 *   page: 1,
 *   limit: 20,
 *   sort_by: 'last_name'
 * });
 * 
 * // Get specific patient
 * const patient = await patients.get('123');
 * 
 * // Create new patient
 * const newPatient = await patients.create({
 *   first_name: 'Juan',
 *   last_name: 'Pérez',
 *   email: 'juan@email.com',
 *   phone: '+34123456789'
 * });
 * 
 * // Update patient
 * const updated = await patients.update({
 *   id: '123',
 *   phone: '+34987654321'
 * });
 * 
 * // Search suggestions for autocomplete
 * const suggestions = await patients.search('Jua', 5);
 * 
 * // Use V2 API for enhanced performance
 * const patientsV2 = await patients.listV2({ search: 'María' });
 * 
 * "Patient management made bulletproof!" 👥⚡
 */

