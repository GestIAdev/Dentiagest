// PATIENT_SELECTOR: Anarcho-Kapitalist Patient Selection
/**
 * PatientSelector - Global patient selection for document management
 * 
 * Features anarquistas pero organizadas:
 * ✅ Dropdown with all patients
 * ✅ Search/filter by name
 * ✅ "All Patients" option for global view
 * ✅ Smooth UX with proper loading states
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import apollo from '../../apollo.ts'; // 🚀 APOLLO NUCLEAR - WEBPACK EXTENSION EXPLICIT!
import { 
  UserIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone_number?: string;
}

interface PatientSelectorProps {
  selectedPatientId?: string;
  onPatientChange: (patientId: string | undefined) => void;
  className?: string;
}

export const PatientSelector: React.FC<PatientSelectorProps> = ({
  selectedPatientId,
  onPatientChange,
  className = ''
}) => {
  const { state } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 📋 FETCH PATIENTS
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        // 🚀 OPERACIÓN APOLLO - Using centralized API service
        // Replaces hardcoded fetch with apollo.patients.list()
        // Benefits: V1/V2 switching, error handling, performance monitoring
        const data = await apollo.patients.list();
        
        // 🎯 HANDLE DIFFERENT API RESPONSE FORMATS
        if (Array.isArray(data)) {
          setPatients(data);
        } else if (data.items && Array.isArray(data.items)) {
          setPatients(data.items);
        } else if (data.patients && Array.isArray(data.patients)) {
          setPatients(data.patients);
        } else if (data.data && Array.isArray(data.data)) {
          setPatients(data.data);
        } else {
          console.warn('⚠️ Unexpected API response format:', data);
          setPatients([]);
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
      } finally {
        setLoading(false);
      }
    };

    if (state.accessToken) {
      fetchPatients();
    }
  }, [state.accessToken]);

  // 🔍 FILTERED PATIENTS (DEFENSIVE PROGRAMMING + LAZY SEARCH)
  const filteredPatients = Array.isArray(patients) 
    ? patients.filter(patient => {
        // Excluir el paciente virtual "Documentos Clínica" de la lista normal
        if (patient.first_name === 'Documentos' && patient.last_name === 'Clínica') {
          return false;
        }
        
        // Solo mostrar resultados si hay 2+ caracteres de búsqueda
        if (searchTerm.length < 2) {
          return false;
        }
        
        return `${patient.first_name} ${patient.last_name}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      })
    : [];

  // 🏥 VIRTUAL PATIENT (ALWAYS VISIBLE)
  const virtualPatient = Array.isArray(patients) 
    ? patients.find(p => p.first_name === 'Documentos' && p.last_name === 'Clínica')
    : null;

  // 👤 SELECTED PATIENT INFO
  const selectedPatient = selectedPatientId 
    ? patients.find(p => p.id === selectedPatientId)
    : null;

  // 🖱️ CLOSE DROPDOWN ON OUTSIDE CLICK
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 🎯 SELECT PATIENT
  const handleSelectPatient = (patientId: string | undefined) => {
    onPatientChange(patientId);
    setIsOpen(false);
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded-lg h-10 w-64 ${className}`} />
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* 🎚️ SELECTOR BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-left shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {selectedPatient ? (
              <>
                <UserIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                <span className="text-gray-900 truncate">
                  {selectedPatient.first_name} {selectedPatient.last_name}
                </span>
              </>
            ) : (
              <>
                <UserIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                <span className="text-gray-500 truncate">
                  Seleccionar paciente...
                </span>
              </>
            )}
          </div>
          <ChevronDownIcon 
            className={`h-5 w-5 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </button>

      {/* 📜 DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* 🔍 SEARCH INPUT */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* 📋 PATIENT LIST */}
          <div className="max-h-60 overflow-y-auto">
            {/* 🏥 VIRTUAL PATIENT - ALWAYS VISIBLE */}
            {virtualPatient && (
              <>
                <button
                  onClick={() => handleSelectPatient(virtualPatient.id)}
                  className={`w-full px-4 py-4 text-left hover:bg-orange-50 flex items-center space-x-3 transition-colors border-b border-gray-200 ${
                    selectedPatientId === virtualPatient.id ? 'bg-orange-50 text-orange-700 border-orange-200' : 'text-gray-700'
                  }`}
                >
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-orange-600 text-sm">
                      📁 Documentos Clínica
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 leading-tight">
                      Documentos administrativos
                    </div>
                  </div>
                </button>
                
                {/* DIVIDER if there are search results */}
                {searchTerm.length >= 2 && filteredPatients.length > 0 && (
                  <div className="border-t border-gray-200"></div>
                )}
              </>
            )}

            {/* 🔍 SEARCH HINT */}
            {searchTerm.length < 2 && filteredPatients.length === 0 && (
              <div className="px-4 py-6 text-center text-gray-500">
                <svg className="h-8 w-8 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="font-medium">Buscar pacientes</p>
                <p className="text-sm mt-1">
                  Escribe al menos 2 caracteres para buscar
                </p>
              </div>
            )}

            {/* INDIVIDUAL PATIENTS */}
            {searchTerm.length >= 2 && (
              filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => handleSelectPatient(patient.id)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors ${
                      selectedPatientId === patient.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    <UserIcon className="h-5 w-5 text-gray-500" />
                    <div>
                      <div className="font-medium">
                        {patient.first_name} {patient.last_name}
                      </div>
                      {patient.email && (
                        <div className="text-sm text-gray-500">{patient.email}</div>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-gray-500">
                  <UserIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No se encontraron pacientes</p>
                  <p className="text-sm mt-1">
                    Intenta con otros términos: "{searchTerm}"
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};
