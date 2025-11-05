// TEMPORARY HOOKS - Bridge for TreatmentManagementV3
// This file provides the missing hooks until we refactor the component

import { useState } from 'react';
import { useTreatmentGraphQL } from './useTreatmentGraphQL';

// Mock hooks to make TreatmentManagementV3 compile
export const useTreatments = () => {
  const { getTreatments, loading, error } = useTreatmentGraphQL();
  const [data, setData] = useState<any>(null);

  const refetch = async () => {
    try {
      const result = await getTreatments();
      setData({ treatments: result });
    } catch (err) {
      console.error('Error fetching treatments:', err);
    }
  };

  return { data, loading, refetch };
};

export const usePatientTreatments = (patientId: string, filters?: any) => {
  const { getTreatments, loading, error } = useTreatmentGraphQL({ patientId: parseInt(patientId) });
  const [data, setData] = useState<any>(null);

  const refetch = async () => {
    try {
      const result = await getTreatments();
      setData({ patientTreatments: result });
    } catch (err) {
      console.error('Error fetching patient treatments:', err);
    }
  };

  return { data, loading, refetch };
};

export const useActiveTreatments = () => {
  const { getTreatments, loading, error } = useTreatmentGraphQL();
  const [data, setData] = useState<any>(null);

  const refetch = async () => {
    try {
      const result = await getTreatments();
      const active = result?.filter((t: any) => t.status === 'active') || [];
      setData({ activeTreatments: active });
    } catch (err) {
      console.error('Error fetching active treatments:', err);
    }
  };

  return { data, loading, refetch };
};

export const useUrgentTreatments = () => {
  const { getTreatments, loading, error } = useTreatmentGraphQL();
  const [data, setData] = useState<any>(null);

  const refetch = async () => {
    try {
      const result = await getTreatments();
      const urgent = result?.filter((t: any) => t.priority === 'urgent') || [];
      setData({ urgentTreatments: urgent });
    } catch (err) {
      console.error('Error fetching urgent treatments:', err);
    }
  };

  return { data, loading, refetch };
};

export const useTreatmentStats = () => {
  const { getTreatmentAnalytics, loading, error } = useTreatmentGraphQL({ includeAnalytics: true });
  const [data, setData] = useState<any>(null);

  const refetch = async () => {
    try {
      const result = await getTreatmentAnalytics();
      setData(result);
    } catch (err) {
      console.error('Error fetching treatment stats:', err);
    }
  };

  return { data, loading, refetch };
};

export const useCreateTreatment = () => {
  const { createTreatment, loading, error } = useTreatmentGraphQL();
  return { createTreatment, loading };
};

export const useUpdateTreatment = () => {
  const { updateTreatment, loading, error } = useTreatmentGraphQL();

  const updateTreatmentWrapper = async (id: string, updates: any) => {
    return updateTreatment(parseInt(id), updates);
  };

  return { updateTreatment: updateTreatmentWrapper, loading };
};

export const useStartTreatment = () => {
  // Mock implementation
  const [loading, setLoading] = useState(false);
  const startTreatment = async (id: string) => {
    setLoading(true);
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };
  return { startTreatment, loading };
};

export const useCompleteTreatment = () => {
  // Mock implementation
  const [loading, setLoading] = useState(false);
  const completeTreatment = async (id: string, data?: any) => {
    setLoading(true);
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };
  return { completeTreatment, loading };
};