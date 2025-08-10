import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
}

export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { state, logout } = useAuth(); // 🚨 ADD LOGOUT FUNCTION

  const API_BASE = 'http://localhost:8002/api/v1/patients/';

  // 🚨 HANDLE 401 ERRORS - FORCE LOGOUT IF TOKEN EXPIRED
  const handle401Error = () => {
    console.error('🚨 TOKEN EXPIRED - FORCING LOGOUT');
    logout();
    setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
  };

  // Buscar pacientes por nombre, teléfono o email
  const fetchPatients = async (search: { query: string }) => {
    // 🚨 BACKEND REQUIRES MIN 2 CHARACTERS
    if (!search.query || search.query.trim().length < 2) {
      console.log('🔍 Query too short, returning empty results');
      return [];
    }
    
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('query', search.query.trim());
      // 🎯 USING CORRECT SEARCH ENDPOINT - /search/suggestions!
      const url = `http://localhost:8002/api/v1/patients/search/suggestions?${params.toString()}`;
      console.log('🔥 fetchPatients - Making request to:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${state.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🔥 fetchPatients - Response status:', response.status);
      
      // 🚨 CHECK FOR 401 UNAUTHORIZED
      if (response.status === 401) {
        console.log('🚨 fetchPatients - 401 detected, forcing logout');
        handle401Error();
        return [];
      }
      
      if (!response.ok) {
        console.error('🚨 fetchPatients - Response not OK:', response.status, response.statusText);
        throw new Error(`Error al buscar pacientes: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('🔥 fetchPatients - Response data:', data);
      
      // El endpoint devuelve un array de sugerencias
      return data;
    } catch (err) {
      console.error('🚨 fetchPatients - Error caught:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Listar todos los pacientes
  const fetchAllPatients = async () => {
    console.log('🔥 fetchAllPatients called');
    setLoading(true);
    setError(null);
    try {
      console.log('🔥 fetchAllPatients - Making request to:', API_BASE);
      console.log('🔥 fetchAllPatients - Token exists:', !!state.accessToken);
      
      const response = await fetch(API_BASE, {
        headers: {
          'Authorization': `Bearer ${state.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🔥 fetchAllPatients - Response status:', response.status);
      
      // 🚨 CHECK FOR 401 UNAUTHORIZED
      if (response.status === 401) {
        console.log('🚨 fetchAllPatients - 401 detected, forcing logout');
        handle401Error();
        return [];
      }
      
      if (!response.ok) {
        console.error('🚨 fetchAllPatients - Response not OK:', response.status, response.statusText);
        throw new Error(`Error al cargar pacientes: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('🔥 fetchAllPatients - Response data:', data);
      
      // 🎯 BACKEND RETURNS {items: Array, total, page, size, pages}
      const patientsArray = Array.isArray(data) ? data : (data.items || []);
      console.log('🔥 fetchAllPatients - Processed patients array:', patientsArray);
      
      setPatients(patientsArray);
      return patientsArray;
    } catch (err) {
      console.error('🚨 fetchAllPatients - Error caught:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setPatients([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (state.accessToken) {
      fetchAllPatients();
    }
  }, [state.accessToken]);

  return {
    patients,
    loading,
    error,
    fetchPatients,
    fetchAllPatients
  };
};
