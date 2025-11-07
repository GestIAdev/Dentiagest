// 🔥 APOLLO NUCLEAR GRAPHQL HOOK - MEDICAL RECORDS SUPERAUTOPISTA
// Date: November 7, 2025
// Mission: Replace REST apollo.medicalRecords with GraphQL
// Target: MedicalRecordsList.tsx migration

import { useState, useEffect, useCallback } from 'react';
import apolloClient from '../graphql/client';
import { 
  GET_MEDICAL_RECORDS, 
  GET_MEDICAL_RECORD,
  CREATE_MEDICAL_RECORD,
  UPDATE_MEDICAL_RECORD,
  DELETE_MEDICAL_RECORD
} from '../graphql/queries/medicalRecords';
import type { MedicalRecord, MedicalRecordInput } from '../graphql/queries/medicalRecords';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface MedicalRecordFilters {
  patientId?: string;
  search?: string;
  recordType?: string;
  diagnosis?: string;
  limit?: number;
  offset?: number;
}

interface UseMedicalRecordsGraphQLReturn {
  // Core Data
  medicalRecords: MedicalRecord[];
  totalRecords: number;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchMedicalRecords: (filters?: MedicalRecordFilters) => Promise<void>;
  getMedicalRecord: (id: string) => Promise<MedicalRecord | null>;
  createMedicalRecord: (input: MedicalRecordInput) => Promise<MedicalRecord | null>;
  updateMedicalRecord: (id: string, input: MedicalRecordInput) => Promise<MedicalRecord | null>;
  deleteMedicalRecord: (id: string) => Promise<boolean>;
  
  // Utilities
  setFilters: (filters: MedicalRecordFilters) => void;
  clearFilters: () => void;
  refresh: () => Promise<void>;
  
  // State
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  filters: MedicalRecordFilters;
}

// ============================================================================
// MAIN HOOK - GRAPHQL MEDICAL RECORDS
// ============================================================================

export const useMedicalRecordsGraphQL = (
  initialFilters?: MedicalRecordFilters
): UseMedicalRecordsGraphQLReturn => {
  
  // State Management
  const [filters, setFiltersState] = useState<MedicalRecordFilters>(
    initialFilters || { limit: 50, offset: 0 }
  );
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ========================================================================
  // DATA PROCESSING
  // ========================================================================
  
  const totalRecords: number = medicalRecords.length;

  // ========================================================================
  // ACTION HANDLERS
  // ========================================================================
  
  const fetchMedicalRecords = useCallback(async (newFilters?: MedicalRecordFilters) => {
    try {
      setError(null);
      const updatedFilters = newFilters || filters;
      setFiltersState(updatedFilters);
      
      await refetchMedicalRecords(updatedFilters);
      
      console.log('🔥 APOLLO NUCLEAR - Medical Records fetched via GraphQL:', updatedFilters);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown fetch error';
      setError(`Fetch Error: ${errorMsg}`);
      console.error('🔥 Fetch Medical Records Error:', err);
    }
  }, [filters, refetchMedicalRecords]);

  const getMedicalRecord = useCallback(async (id: string): Promise<MedicalRecord | null> => {
    try {
      setError(null);
      
      const { data } = await apolloClient.query({
        query: GET_MEDICAL_RECORD,
        variables: { id },
        fetchPolicy: 'network-only'
      });
      
      console.log('🔥 APOLLO NUCLEAR - Medical Record fetched:', id);
      return data.medicalRecord;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown get medical record error';
      setError(`Get Medical Record Error: ${errorMsg}`);
      console.error('🔥 Get Medical Record Error:', err);
      return null;
    }
  }, [apolloClient]);

  const createMedicalRecord = useCallback(async (input: MedicalRecordInput): Promise<MedicalRecord | null> => {
    try {
      setError(null);
      
      const { data } = await createMedicalRecordMutation({
        variables: { input }
      });
      
      console.log('🔥 APOLLO NUCLEAR - Medical Record created:', data.createMedicalRecord);
      return data.createMedicalRecord;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown create error';
      setError(`Create Medical Record Error: ${errorMsg}`);
      console.error('🔥 Create Medical Record Error:', err);
      return null;
    }
  }, [createMedicalRecordMutation]);

  const updateMedicalRecord = useCallback(async (id: string, input: MedicalRecordInput): Promise<MedicalRecord | null> => {
    try {
      setError(null);
      
      const { data } = await updateMedicalRecordMutation({
        variables: { id, input }
      });
      
      console.log('🔥 APOLLO NUCLEAR - Medical Record updated:', data.updateMedicalRecord);
      return data.updateMedicalRecord;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown update error';
      setError(`Update Medical Record Error: ${errorMsg}`);
      console.error('🔥 Update Medical Record Error:', err);
      return null;
    }
  }, [updateMedicalRecordMutation]);

  const deleteMedicalRecord = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      
      await deleteMedicalRecordMutation({
        variables: { id }
      });
      
      console.log('🔥 APOLLO NUCLEAR - Medical Record deleted:', id);
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown delete error';
      setError(`Delete Medical Record Error: ${errorMsg}`);
      console.error('🔥 Delete Medical Record Error:', err);
      return false;
    }
  }, [deleteMedicalRecordMutation]);

  // ========================================================================
  // UTILITY FUNCTIONS
  // ========================================================================
  
  const setFilters = useCallback((newFilters: MedicalRecordFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFiltersState(updatedFilters);
    fetchMedicalRecords(updatedFilters);
  }, [filters, fetchMedicalRecords]);

  const clearFilters = useCallback(() => {
    const defaultFilters = { limit: 50, offset: 0 };
    setFiltersState(defaultFilters);
    fetchMedicalRecords(defaultFilters);
  }, [fetchMedicalRecords]);

  const refresh = useCallback(async () => {
    await fetchMedicalRecords(filters);
  }, [fetchMedicalRecords, filters]);

  // ========================================================================
  // RETURN INTERFACE
  // ========================================================================
  
  return {
    // Core Data
    medicalRecords,
    totalRecords,
    loading,
    error,
    
    // Actions
    fetchMedicalRecords,
    getMedicalRecord,
    createMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord,
    
    // Utilities
    setFilters,
    clearFilters,
    refresh,
    
    // State
    isCreating,
    isUpdating,
    isDeleting,
    filters
  };
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default useMedicalRecordsGraphQL;

// 🔥 APOLLO NUCLEAR - MEDICAL RECORDS GRAPHQL READY
// TARGET: Replace REST calls in MedicalRecordsList.tsx
// STATUS: LOCKED AND LOADED
