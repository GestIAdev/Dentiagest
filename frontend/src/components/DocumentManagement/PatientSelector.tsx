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
import { useAuth } from '../../context/AuthContext';
import apollo from '../../apollo'; // 🚀 APOLLO NUCLEAR - WEBPACK EXTENSION EXPLICIT!
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
      {/* 🎚️ SELECTOR BUTTON - DARK MODE */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-left shadow-sm hover:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {selectedPatient ? (
              <>
                <UserIcon className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                <span className="text-slate-100 truncate">
                  {selectedPatient.first_name} {selectedPatient.last_name}
                </span>
              </>
            ) : (
              <>
                <UserIcon className="h-5 w-5 text-slate-500 flex-shrink-0" />
                <span className="text-slate-400 truncate">
                  Seleccionar paciente...
                </span>
              </>
            )}
          </div>
          <ChevronDownIcon 
            className={`h-5 w-5 text-slate-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </button>

      {/* 📜 DROPDOWN MENU - DARK MODE */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg shadow-lg shadow-black/50 max-h-80 overflow-hidden">
          {/* 🔍 SEARCH INPUT */}
          <div className="p-3 border-b border-slate-700">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
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
                  className={`w-full px-4 py-4 text-left hover:bg-orange-500/10 flex items-center space-x-3 transition-colors border-b border-slate-700 ${
                    selectedPatientId === virtualPatient.id ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'text-slate-300'
                  }`}
                >
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-orange-400 text-sm">
                      📁 Documentos Clínica
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 leading-tight">
                      Documentos administrativos
                    </div>
                  </div>
                </button>
                
                {/* DIVIDER if there are search results */}
                {searchTerm.length >= 2 && filteredPatients.length > 0 && (
                  <div className="border-t border-slate-700"></div>
                )}
              </>
            )}

            {/* 🔍 SEARCH HINT */}
            {searchTerm.length < 2 && filteredPatients.length === 0 && (
              <div className="px-4 py-6 text-center text-slate-400">
                <svg className="h-8 w-8 mx-auto mb-2 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="font-medium text-slate-300">Buscar pacientes</p>
                <p className="text-sm mt-1 text-slate-500">
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
                    className={`w-full px-4 py-3 text-left hover:bg-cyan-500/10 flex items-center space-x-3 transition-colors ${
                      selectedPatientId === patient.id ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-300'
                    }`}
                  >
                    <UserIcon className="h-5 w-5 text-slate-500" />
                    <div>
                      <div className="font-medium text-slate-100">
                        {patient.first_name} {patient.last_name}
                      </div>
                      {patient.email && (
                        <div className="text-sm text-slate-400">{patient.email}</div>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-slate-400">
                  <UserIcon className="h-8 w-8 mx-auto mb-2 text-slate-600" />
                  <p className="text-slate-300">No se encontraron pacientes</p>
                  <p className="text-sm mt-1 text-slate-500">
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

