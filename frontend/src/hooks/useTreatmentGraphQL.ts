// TREATMENT GRAPHQL HOOKS V3.0 - OLYMPUS MEDICAL SCIENCE
// Date: September 22, 2025

import { useState, useCallback } from 'react';
import { apolloClient } from '../apollo/graphql-client';
import { useTreatmentStore } from '../stores/useTreatmentStore';
import {
  GET_TREATMENTS,
  GET_TREATMENT_BY_ID,
  CREATE_TREATMENT,
  UPDATE_TREATMENT,
  DELETE_TREATMENT,
  GET_TREATMENT_ANALYTICS
} from '../graphql/treatment';

export interface UseTreatmentGraphQLOptions {
  patientId?: number;
  includeAnalytics?: boolean;
  enableRealtime?: boolean;
}

export const useTreatmentGraphQL = (options: UseTreatmentGraphQLOptions = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateTreatment, removeTreatment } = useTreatmentStore();

  // Get all treatments
  const getTreatments = useCallback(async (patientId?: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apolloClient.query({
        query: GET_TREATMENTS,
        variables: { patientId: patientId || options.patientId },
        fetchPolicy: 'network-only'
      });
      return (data as any).treatments;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch treatments';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [options.patientId]);

  // Get treatment by ID
  const getTreatmentById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apolloClient.query({
        query: GET_TREATMENT_BY_ID,
        variables: { id },
        fetchPolicy: 'network-only'
      });
      return (data as any).treatment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch treatment';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create treatment
  const createTreatment = useCallback(async (treatmentData: any) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apolloClient.mutate({
        mutation: CREATE_TREATMENT,
        variables: { input: treatmentData },
        optimisticResponse: {
          createTreatment: {
            ...treatmentData,
            id: `temp-${Date.now()}`,
            __typename: 'Treatment'
          }
        }
      });
      const createdTreatment = (data as any).createTreatment;
      updateTreatment(createdTreatment.id.toString(), createdTreatment);
      return createdTreatment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create treatment';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [updateTreatment]);

  // Update treatment
  const updateTreatmentMutation = useCallback(async (id: number, updates: any) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apolloClient.mutate({
        mutation: UPDATE_TREATMENT,
        variables: { id, input: updates },
        optimisticResponse: {
          updateTreatment: {
            id,
            ...updates,
            __typename: 'Treatment'
          }
        }
      });
      updateTreatment(id.toString(), (data as any).updateTreatment);
      return (data as any).updateTreatment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update treatment';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [updateTreatment]);

  // Delete treatment
  const deleteTreatment = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await apolloClient.mutate({
        mutation: DELETE_TREATMENT,
        variables: { id }
      });
      removeTreatment(id.toString());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete treatment';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [removeTreatment]);

  // Get treatment analytics
  const getTreatmentAnalytics = useCallback(async (patientId?: number) => {
    if (!options.includeAnalytics) return null;

    setLoading(true);
    setError(null);
    try {
      const { data } = await apolloClient.query({
        query: GET_TREATMENT_ANALYTICS,
        variables: { patientId: patientId || options.patientId },
        fetchPolicy: 'network-only'
      });
      return (data as any).treatmentAnalytics;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch treatment analytics';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [options.patientId, options.includeAnalytics]);

  return {
    // State
    loading,
    error,

    // Queries
    getTreatments,
    getTreatmentById,
    getTreatmentAnalytics,

    // Mutations
    createTreatment,
    updateTreatment: updateTreatmentMutation,
    deleteTreatment,

    // Utilities
    clearError: () => setError(null)
  };
};
