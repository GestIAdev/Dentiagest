// 🏴‍☠️ APOLLO NUCLEAR GRAPHQL HOOK - PATIENTS SUPERAUTOPISTA
// Date: January 15, 2025
// Mission: DIRECTIVA V97 - EL PUENTE DE CRISTAL
// Target: Migrate from REST v1 to GraphQL for patients province

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { 
  GET_PATIENTS, 
  GET_PATIENT,
  CREATE_PATIENT,
  UPDATE_PATIENT,
  DELETE_PATIENT,
  ACTIVATE_PATIENT,
  DEACTIVATE_PATIENT
} from '../graphql/queries/patients';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface PatientFilters {
  search?: string;
  isActive?: boolean;
  hasInsurance?: boolean;
  requiresSpecialCare?: boolean;
  page?: number;
  size?: number;
}

interface PatientCreateInput {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  phoneSecondary?: string;
  dateOfBirth?: string;
  gender?: string;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressPostalCode?: string;
  addressCountry?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  medicalConditions?: string[];
  medicationsCurrent?: string[];
  allergies?: string[];
  anxietyLevel?: number;
  specialNeeds?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceGroupNumber?: string;
  consentToTreatment?: boolean;
  consentToContact?: boolean;
  preferredContactMethod?: string;
  notes?: string;
}

interface PatientUpdateInput extends Partial<PatientCreateInput> {
  isActive?: boolean;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string;
  phone?: string;
  phoneSecondary?: string;
  dateOfBirth?: string;
  age?: number;
  gender?: string;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressPostalCode?: string;
  addressCountry?: string;
  fullAddress?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  medicalConditions?: string[];
  medicationsCurrent?: string[];
  allergies?: string[];
  anxietyLevel?: number;
  specialNeeds?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceGroupNumber?: string;
  insuranceStatus?: string;
  consentToTreatment?: boolean;
  consentToContact?: boolean;
  preferredContactMethod?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  hasInsurance: boolean;
  requiresSpecialCare: boolean;
  appointments?: any[];
}

// Removed unused PaginatedPatients interface

interface UseGraphQLPatientsReturn {
  // Core Data
  patients: Patient[];
  totalPatients: number;
  loading: boolean;
  error: string | null;
  
  // Pagination & Filtering
  pagination: {
    page: number;
    size: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: PatientFilters;
  
  // Actions
  fetchPatients: (filters?: PatientFilters) => Promise<void>;
  getPatient: (id: string) => Promise<Patient | null>;
  createPatient: (input: PatientCreateInput) => Promise<Patient | null>;
  updatePatient: (id: string, input: PatientUpdateInput) => Promise<Patient | null>;
  deletePatient: (id: string) => Promise<boolean>;
  activatePatient: (id: string) => Promise<boolean>;
  deactivatePatient: (id: string) => Promise<boolean>;
  
  // Utilities
  setFilters: (filters: PatientFilters) => void;
  clearFilters: () => void;
  refresh: () => Promise<void>;
  
  // State
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

// ============================================================================
// MAIN HOOK - GRAPHQL SUPERAUTOPISTA
// ============================================================================

export const useGraphQLPatients = (
  initialFilters?: PatientFilters
): UseGraphQLPatientsReturn => {
  const apolloClient = useApolloClient();
  
  // State Management
  const [filters, setFiltersState] = useState<PatientFilters>(
    initialFilters || { page: 1, size: 50 }
  );
  const [error, setError] = useState<string | null>(null);
  
  // ========================================================================
  // QUERIES
  // ========================================================================
  
  const { 
    data: patientsData, 
    loading, 
    error: queryError,
    refetch: refetchPatients 
  } = useQuery(GET_PATIENTS, {
    variables: { filters },
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true
  });

  // ========================================================================
  // MUTATIONS
  // ========================================================================
  
  const [createPatientMutation, { loading: isCreating }] = useMutation(CREATE_PATIENT, {
    refetchQueries: [{ query: GET_PATIENTS, variables: { filters } }],
    awaitRefetchQueries: true,
    errorPolicy: 'all'
  });
  
  const [updatePatientMutation, { loading: isUpdating }] = useMutation(UPDATE_PATIENT, {
    refetchQueries: [{ query: GET_PATIENTS, variables: { filters } }],
    awaitRefetchQueries: true,
    errorPolicy: 'all'
  });
  
  const [deletePatientMutation, { loading: isDeleting }] = useMutation(DELETE_PATIENT, {
    refetchQueries: [{ query: GET_PATIENTS, variables: { filters } }],
    awaitRefetchQueries: true,
    errorPolicy: 'all'
  });
  
  const [activatePatientMutation] = useMutation(ACTIVATE_PATIENT, {
    refetchQueries: [{ query: GET_PATIENTS, variables: { filters } }],
    awaitRefetchQueries: true,
    errorPolicy: 'all'
  });
  
  const [deactivatePatientMutation] = useMutation(DEACTIVATE_PATIENT, {
    refetchQueries: [{ query: GET_PATIENTS, variables: { filters } }],
    awaitRefetchQueries: true,
    errorPolicy: 'all'
  });

  // ========================================================================
  // DATA PROCESSING
  // ========================================================================
  
  const patients: Patient[] = patientsData?.patients?.items || [];
  const totalPatients: number = patientsData?.patients?.total || 0;
  const pagination = {
    page: patientsData?.patients?.page || 1,
    size: patientsData?.patients?.size || 50,
    pages: patientsData?.patients?.pages || 1,
    hasNext: patientsData?.patients?.hasNext || false,
    hasPrev: patientsData?.patients?.hasPrev || false
  };

  // ========================================================================
  // ERROR HANDLING
  // ========================================================================
  
  useEffect(() => {
    if (queryError) {
      setError(`GraphQL Query Error: ${queryError.message}`);
      console.error('🔥 APOLLO NUCLEAR - GraphQL Patients Error:', queryError);
    } else {
      setError(null);
    }
  }, [queryError]);

  // ========================================================================
  // ACTION HANDLERS
  // ========================================================================
  
  const fetchPatients = useCallback(async (newFilters?: PatientFilters) => {
    try {
      setError(null);
      const updatedFilters = newFilters || filters;
      setFiltersState(updatedFilters);
      
      await refetchPatients({ filters: updatedFilters });
      
      console.log('🏴‍☠️ APOLLO NUCLEAR - Patients fetched via GraphQL:', updatedFilters);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown fetch error';
      setError(`Fetch Error: ${errorMsg}`);
      console.error('🔥 Fetch Patients Error:', err);
    }
  }, [filters, refetchPatients]);

  const getPatient = useCallback(async (id: string): Promise<Patient | null> => {
    try {
      setError(null);
      
      const { data } = await apolloClient.query({
        query: GET_PATIENT,
        variables: { id },
        fetchPolicy: 'network-only'
      });
      
      console.log('🏴‍☠️ APOLLO NUCLEAR - Patient fetched:', id);
      return data.patient;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown get patient error';
      setError(`Get Patient Error: ${errorMsg}`);
      console.error('🔥 Get Patient Error:', err);
      return null;
    }
  }, [apolloClient]);

  const createPatient = useCallback(async (input: PatientCreateInput): Promise<Patient | null> => {
    try {
      setError(null);
      
      const { data } = await createPatientMutation({
        variables: { input }
      });
      
      console.log('🏴‍☠️ APOLLO NUCLEAR - Patient created:', data.createPatient);
      return data.createPatient;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown create error';
      setError(`Create Patient Error: ${errorMsg}`);
      console.error('🔥 Create Patient Error:', err);
      return null;
    }
  }, [createPatientMutation]);

  const updatePatient = useCallback(async (id: string, input: PatientUpdateInput): Promise<Patient | null> => {
    try {
      setError(null);
      
      const { data } = await updatePatientMutation({
        variables: { id, input }
      });
      
      console.log('🏴‍☠️ APOLLO NUCLEAR - Patient updated:', data.updatePatient);
      return data.updatePatient;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown update error';
      setError(`Update Patient Error: ${errorMsg}`);
      console.error('🔥 Update Patient Error:', err);
      return null;
    }
  }, [updatePatientMutation]);

  const deletePatient = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      
      await deletePatientMutation({
        variables: { id }
      });
      
      console.log('🏴‍☠️ APOLLO NUCLEAR - Patient deleted:', id);
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown delete error';
      setError(`Delete Patient Error: ${errorMsg}`);
      console.error('🔥 Delete Patient Error:', err);
      return false;
    }
  }, [deletePatientMutation]);

  const activatePatient = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      
      await activatePatientMutation({
        variables: { id }
      });
      
      console.log('🏴‍☠️ APOLLO NUCLEAR - Patient activated:', id);
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown activate error';
      setError(`Activate Patient Error: ${errorMsg}`);
      console.error('🔥 Activate Patient Error:', err);
      return false;
    }
  }, [activatePatientMutation]);

  const deactivatePatient = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      
      await deactivatePatientMutation({
        variables: { id }
      });
      
      console.log('🏴‍☠️ APOLLO NUCLEAR - Patient deactivated:', id);
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown deactivate error';
      setError(`Deactivate Patient Error: ${errorMsg}`);
      console.error('🔥 Deactivate Patient Error:', err);
      return false;
    }
  }, [deactivatePatientMutation]);

  // ========================================================================
  // UTILITY FUNCTIONS
  // ========================================================================
  
  const setFilters = useCallback((newFilters: PatientFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFiltersState(updatedFilters);
    fetchPatients(updatedFilters);
  }, [filters, fetchPatients]);

  const clearFilters = useCallback(() => {
    const defaultFilters = { page: 1, size: 50 };
    setFiltersState(defaultFilters);
    fetchPatients(defaultFilters);
  }, [fetchPatients]);

  const refresh = useCallback(async () => {
    await fetchPatients(filters);
  }, [fetchPatients, filters]);

  // ========================================================================
  // RETURN INTERFACE
  // ========================================================================
  
  return {
    // Core Data
    patients,
    totalPatients,
    loading,
    error,
    
    // Pagination & Filtering
    pagination,
    filters,
    
    // Actions
    fetchPatients,
    getPatient,
    createPatient,
    updatePatient,
    deletePatient,
    activatePatient,
    deactivatePatient,
    
    // Utilities
    setFilters,
    clearFilters,
    refresh,
    
    // State
    isCreating,
    isUpdating,
    isDeleting
  };
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default useGraphQLPatients;

// 🏴‍☠️ APOLLO NUCLEAR - GRAPHQL SUPERAUTOPISTA OPERATIONAL
// EL PUENTE DE CRISTAL: PHASE 1 COMPLETE
// TARGET: Replace useRestPatients in DashboardV3
// STATUS: READY FOR DEPLOYMENT