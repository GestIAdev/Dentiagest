import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import apollo from '../apollo.ts';

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

  // 🎯 VIRTUAL PATIENT ID - MUST BE HIDDEN FROM NORMAL OPERATIONS
  const VIRTUAL_PATIENT_ID = 'd76a8a03-1411-4143-85ba-6f064c7b564b';

  // 🔒 FILTER OUT VIRTUAL PATIENT FROM NORMAL OPERATIONS
  const filterVirtualPatient = (patients: Patient[]): Patient[] => {
    return patients.filter(patient => patient.id !== VIRTUAL_PATIENT_ID);
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
      console.log('🚀 Apollo fetchPatients - Query:', search.query.trim());
      
      // 🚀 APOLLO NUCLEAR SEARCH - Clean and powerful
      const result = await apollo.patients.search(search.query.trim());
      
      console.log('� Apollo fetchPatients - Response:', result);
      
      // 🔒 FILTER OUT VIRTUAL PATIENT
      const filteredData = filterVirtualPatient(result.items);
      return filteredData;
    } catch (err) {
      console.error('🚨 Apollo fetchPatients - Error:', err);
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
      console.log('🚀 Apollo fetchAllPatients - Starting request');
      
      // � APOLLO NUCLEAR LIST - Zero config required
      const result = await apollo.patients.list();
      
      console.log('� Apollo fetchAllPatients - Response:', result);
      
      // 🔒 FILTER OUT VIRTUAL PATIENT FROM NORMAL OPERATIONS
      const filteredPatients = filterVirtualPatient(result.items);
      
      setPatients(filteredPatients);
      return filteredPatients;
    } catch (err) {
      console.error('🚨 Apollo fetchAllPatients - Error:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setPatients([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // 🔓 SPECIAL FUNCTION FOR UPLOADS: INCLUDES VIRTUAL PATIENT
  const fetchAllPatientsForUpload = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🚀 Apollo fetchAllPatientsForUpload - Starting request');
      
      // 🚀 APOLLO NUCLEAR LIST - For upload operations
      const result = await apollo.patients.list();
      
      console.log('🚀 Apollo fetchAllPatientsForUpload - Response:', result);
      
      // 🔓 DO NOT FILTER - RETURN ALL PATIENTS INCLUDING VIRTUAL
      return result.items;
    } catch (err) {
      console.error('🚨 Apollo fetchAllPatientsForUpload - Error:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
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
    fetchAllPatients,
    fetchAllPatientsForUpload  // 🔓 SPECIAL FOR UPLOADS
  };
};
