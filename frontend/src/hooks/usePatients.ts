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
  const { state } = useAuth();

  const API_BASE = 'http://localhost:8002/api/v1/patients/';

  // Buscar pacientes por nombre, teléfono o email
  const fetchPatients = async (search: { query: string }) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('query', search.query);
      // 🎯 PROBANDO RUTA ESTÁNDAR PRIMERO
      const response = await fetch(`http://localhost:8002/api/v1/patients?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${state.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Error al buscar pacientes');
      const data = await response.json();
      // El endpoint devuelve un array de sugerencias
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Listar todos los pacientes
  const fetchAllPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_BASE, {
        headers: {
          'Authorization': `Bearer ${state.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Error al cargar pacientes');
  const data = await response.json();
  const patientsArray = Array.isArray(data) ? data : (Array.isArray(data.patients) ? data.patients : []);
  setPatients(patientsArray);
  return patientsArray;
    } catch (err) {
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
