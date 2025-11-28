/**
 * 🏥🎸💀 MEDICAL RECORDS PAGE V4 - STORYTELLING CLÍNICO
 * ======================================================
 * By PunkClaude & Radwulf - November 2025
 * 
 * OPERACIÓN LÁZARO FASE 7: El Timeline Clínico
 * 
 * AXIOMAS:
 * - FULL BLEED: h-full w-full flex
 * - MASTER-DETAIL: Panel pacientes (30%) + Timeline (70%)
 * - STORYTELLING: Historia cronológica visual, no tablas aburridas
 * - NO MOCKS: GraphQL real conectado
 */

import React, { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';

// GraphQL
import { GET_PATIENTS_V3 } from '../graphql/queries/patients';
import { GET_MEDICAL_RECORDS_V3 } from '../graphql/queries/medicalRecords';

// Components
import ClinicalTimeline from '../components/MedicalRecords/ClinicalTimeline';
import MedicalRecordSheet from '../components/MedicalRecords/MedicalRecordSheet';

// Icons
import {
  MagnifyingGlassIcon,
  PlusIcon,
  UserCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  HeartIcon,
  ArrowPathIcon,
  FunnelIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

// ============================================================================
// TYPES
// ============================================================================

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  updatedAt?: string;
}

interface MedicalRecord {
  id: string;
  patientId: string;
  recordType: string;
  title: string;
  content?: string;
  diagnosis?: string;
  treatment?: string;
  medications?: string;
  createdAt: string;
  updatedAt: string;
  _veritas?: {
    verified: boolean;
    confidence: number;
    level: string;
  };
}

// ============================================================================
// UTILITIES
// ============================================================================

const formatDate = (date: string | undefined): string => {
  if (!date) return 'Sin fecha';
  try {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'Fecha inválida';
  }
};

const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
};

const getAvatarColor = (id: string): string => {
  const colors = [
    'from-cyan-500 to-blue-500',
    'from-purple-500 to-pink-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-rose-500 to-red-500',
    'from-indigo-500 to-violet-500',
  ];
  const index = id.charCodeAt(0) % colors.length;
  return colors[index];
};

// ============================================================================
// PATIENT CARD COMPONENT
// ============================================================================

interface PatientCardProps {
  patient: Patient;
  isSelected: boolean;
  onClick: () => void;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, isSelected, onClick }) => {
  const initials = getInitials(patient.firstName, patient.lastName);
  const avatarColor = getAvatarColor(patient.id);

  return (
    <button
      onClick={onClick}
      className={`
        w-full p-3 rounded-lg text-left transition-all duration-200
        ${isSelected
          ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/50 shadow-lg shadow-cyan-500/20'
          : 'bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600'
        }
      `}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className={`
          w-10 h-10 rounded-full bg-gradient-to-br ${avatarColor}
          flex items-center justify-center text-white font-bold text-sm
          ${isSelected ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900' : ''}
        `}>
          {initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className={`font-medium truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
            {patient.firstName} {patient.lastName}
          </p>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <ClockIcon className="h-3 w-3" />
            Última: {formatDate(patient.updatedAt)}
          </p>
        </div>

        {/* Selected indicator */}
        {isSelected && (
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        )}
      </div>
    </button>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const MedicalRecordsPageV4: React.FC = () => {
  // State
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [isRecordSheetOpen, setIsRecordSheetOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // ========================================================================
  // GRAPHQL QUERIES
  // ========================================================================

  const { data: patientsData, loading: patientsLoading, refetch: refetchPatients } = useQuery(GET_PATIENTS_V3, {
    variables: { limit: 100 },
    fetchPolicy: 'cache-and-network',
  });

  const { data: recordsData, loading: recordsLoading, refetch: refetchRecords } = useQuery(GET_MEDICAL_RECORDS_V3, {
    variables: { patientId: selectedPatientId, limit: 100 },
    skip: !selectedPatientId,
    fetchPolicy: 'cache-and-network',
  });

  // ========================================================================
  // DATA EXTRACTION
  // ========================================================================

  const patients: Patient[] = (patientsData as any)?.patientsV3 || [];
  const records: MedicalRecord[] = (recordsData as any)?.medicalRecordsV3 || [];

  // ========================================================================
  // FILTERED DATA
  // ========================================================================

  const filteredPatients = useMemo(() => {
    if (!patientSearch) return patients;
    const query = patientSearch.toLowerCase();
    return patients.filter(
      (p) =>
        p.firstName?.toLowerCase().includes(query) ||
        p.lastName?.toLowerCase().includes(query) ||
        p.email?.toLowerCase().includes(query)
    );
  }, [patients, patientSearch]);

  const selectedPatient = useMemo(() => {
    return patients.find((p) => p.id === selectedPatientId) || null;
  }, [patients, selectedPatientId]);

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleNewRecord = () => {
    setEditingRecord(null);
    setIsRecordSheetOpen(true);
  };

  const handleEditRecord = (record: MedicalRecord) => {
    setEditingRecord(record);
    setIsRecordSheetOpen(true);
  };

  const handleRecordSave = () => {
    refetchRecords();
  };

  const handleRefresh = () => {
    refetchPatients();
    if (selectedPatientId) {
      refetchRecords();
    }
  };

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="h-full w-full flex bg-gradient-to-br from-gray-900 via-cyan-900/20 to-purple-900/30 overflow-hidden">
      
      {/* ================================================================== */}
      {/* PANEL IZQUIERDO - SELECTOR DE PACIENTES (30%) */}
      {/* ================================================================== */}
      <div className="w-[320px] shrink-0 border-r border-slate-700/50 flex flex-col bg-slate-900/50">
        {/* Header */}
        <div className="p-4 border-b border-slate-700/50 shrink-0">
          <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 flex items-center gap-2 mb-3">
            <UserCircleIcon className="h-5 w-5 text-cyan-400" />
            Pacientes
          </h2>
          
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar paciente..."
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              className="pl-9 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Patient List */}
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            {patientsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <UserCircleIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No hay pacientes</p>
              </div>
            ) : (
              filteredPatients.map((patient) => (
                <PatientCard
                  key={patient.id}
                  patient={patient}
                  isSelected={patient.id === selectedPatientId}
                  onClick={() => setSelectedPatientId(patient.id)}
                />
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer Stats */}
        <div className="p-3 border-t border-slate-700/50 shrink-0">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{filteredPatients.length} pacientes</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="h-7 text-cyan-400 hover:text-cyan-300"
            >
              <ArrowPathIcon className={`h-3 w-3 mr-1 ${patientsLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* PANEL DERECHO - TIMELINE CLÍNICO (70%) */}
      {/* ================================================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 shrink-0">
          <div>
            {selectedPatient ? (
              <>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <HeartIcon className="h-5 w-5 text-pink-400" />
                  Historial de {selectedPatient.firstName} {selectedPatient.lastName}
                </h1>
                <p className="text-sm text-slate-400 mt-0.5">
                  {records.length} registros médicos
                </p>
              </>
            ) : (
              <>
                <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                  📋 Historial Clínico V4
                </h1>
                <p className="text-sm text-slate-400 mt-0.5">
                  Selecciona un paciente para ver su historia
                </p>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {selectedPatient && (
              <Button
                onClick={handleNewRecord}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white shadow-lg"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Nuevo Registro
              </Button>
            )}
          </div>
        </header>

        {/* Filter Chips */}
        {selectedPatient && (
          <div className="px-6 py-3 border-b border-slate-700/30 shrink-0">
            <div className="flex items-center gap-2 flex-wrap">
              <FunnelIcon className="h-4 w-4 text-slate-400" />
              {[
                { key: 'CONSULTATION', label: '🩺 Consultas', color: 'cyan' },
                { key: 'TREATMENT', label: '🦷 Tratamientos', color: 'purple' },
                { key: 'PRESCRIPTION', label: '💊 Recetas', color: 'amber' },
                { key: 'NOTE', label: '📝 Notas', color: 'emerald' },
                { key: 'DOCUMENT', label: '📄 Documentos', color: 'blue' },
              ].map(({ key, label, color }) => (
                <button
                  key={key}
                  onClick={() => toggleFilter(key)}
                  className={`
                    px-3 py-1 rounded-full text-xs font-medium transition-all
                    ${activeFilters.includes(key)
                      ? `bg-${color}-500/30 text-${color}-300 border border-${color}-500/50`
                      : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600'
                    }
                  `}
                >
                  {label}
                </button>
              ))}
              {activeFilters.length > 0 && (
                <button
                  onClick={() => setActiveFilters([])}
                  className="px-2 py-1 text-xs text-red-400 hover:text-red-300"
                >
                  ✕ Limpiar
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {!selectedPatient ? (
            /* Empty State - No patient selected */
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                  <DocumentTextIcon className="h-12 w-12 text-cyan-400/50" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Selecciona un Paciente
                </h3>
                <p className="text-slate-400 mb-6">
                  Haz clic en un paciente de la lista para ver su historial clínico completo
                  en formato de línea de tiempo.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                  <SparklesIcon className="h-4 w-4" />
                  <span>Storytelling Clínico - La evolución del paciente en un vistazo</span>
                </div>
              </div>
            </div>
          ) : recordsLoading ? (
            /* Loading State */
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto" />
                <p className="text-slate-400">Cargando historial clínico...</p>
              </div>
            </div>
          ) : (
            /* Timeline Component */
            <ClinicalTimeline
              records={records}
              filters={activeFilters}
              onEditRecord={handleEditRecord}
              patientName={`${selectedPatient.firstName} ${selectedPatient.lastName}`}
            />
          )}
        </div>
      </div>

      {/* ================================================================== */}
      {/* FORM SHEET - NUEVO/EDITAR REGISTRO */}
      {/* ================================================================== */}
      <MedicalRecordSheet
        isOpen={isRecordSheetOpen}
        onClose={() => setIsRecordSheetOpen(false)}
        record={editingRecord}
        patientId={selectedPatientId}
        patientName={selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : undefined}
        onSave={handleRecordSave}
      />
    </div>
  );
};

export default MedicalRecordsPageV4;
