// MEDICAL_RECORDS: Componente de vista detallada de historial médico
/**
 * Componente para mostrar todos los detalles de un historial médico.
 * Incluye información completa, documentos y acciones.
 * 
 * PLATFORM_PATTERN: Este patrón se repetirá en otros verticales:
 * - VetGest: Vista detallada de historial veterinario
 * - MechaGest: Vista detallada de orden de servicio
 * - RestaurantGest: Vista detallada de pedido
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  XMarkIcon,
  PencilIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  CurrencyEuroIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  ShieldCheckIcon,
  DocumentDuplicateIcon,
  PrinterIcon,
  ShareIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';  // 🔧 FIXED: Added .tsx extension for webpack
import apolloGraphQL from '../../services/apolloGraphQL'; // 🥷 STEALTH GRAPHQL NINJA MODE

// Types
interface MedicalRecord {
  id: string;
  patient_id: string;
  visit_date: string;
  chief_complaint: string;
  diagnosis: string;
  treatment_plan: string;
  treatment_performed: string;
  clinical_notes: string;
  procedure_category: string;
  treatment_status: string;
  priority: string;
  estimated_cost: number | null;
  actual_cost: number | null;
  insurance_covered: boolean;
  follow_up_required: boolean;
  follow_up_date: string | null;
  is_confidential: boolean;
  created_at: string;
  updated_at: string;
  age_days: number;
  is_recent: boolean;
  requires_attention: boolean;
  total_teeth_affected: number;
  is_major_treatment: boolean;
  treatment_summary: string;
}

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
}

interface MedicalRecordDetailProps {
  isOpen: boolean;
  onClose: () => void;
  recordId: string | null;
  onEdit: () => void;
}

const MedicalRecordDetail: React.FC<MedicalRecordDetailProps> = ({
  isOpen,
  onClose,
  recordId,
  onEdit
}) => {
  // 🔧 AUTH: Use AuthContext for proper token handling
  const { state } = useAuth();
  
  // Estados
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener el historial médico
  const fetchMedicalRecord = useCallback(async () => {
    if (!recordId) return;

    try {
      setLoading(true);
      setError(null);

      const token = state.accessToken; // 🔧 FIXED: Use AuthContext token instead of localStorage

      if (!token) {
        throw new Error('No hay token de autenticación válido');
      }

      // 🚀 OPERACIÓN APOLLO - Using centralized API service
      // Replaces hardcoded fetch with apollo.medicalRecords.getById()
      // Benefits: V1/V2 switching, error handling, performance monitoring
      const recordResponse = await apolloGraphQL.medicalRecords.getById(recordId);

      if (recordResponse) {
        const recordData = recordResponse as any;
        setRecord(recordData);

        // 🚀 OPERACIÓN APOLLO - Using centralized API service  
        // Replaces hardcoded fetch with apollo.patients.get()
        const patientResponse = await apolloGraphQL.patients.get(recordData.patient_id);

        if (patientResponse) {
          const patientData = patientResponse as any;
          setPatient(patientData);
        }
      } else {
        throw new Error(`Error fetching medical record: Unknown error`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [recordId, state.accessToken]);

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen && recordId) {
      fetchMedicalRecord();
    }
  }, [isOpen, recordId, fetchMedicalRecord]);

  // Función para obtener color del badge según estado
  const getStatusColor = (status: string) => {
    const colors = {
      planned: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      postponed: 'bg-gray-100 text-gray-800',
      follow_up_required: 'bg-orange-100 text-orange-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Función para obtener color del badge según prioridad
  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
      emergency: 'bg-red-200 text-red-900'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Función para formatear fecha y hora
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para formatear dinero
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'No especificado';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  // Función para calcular edad del paciente
  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  // Función para obtener el nombre de la categoría
  const getCategoryName = (category: string) => {
    const categories: Record<string, string> = {
      preventive: 'Preventivo',
      restorative: 'Restaurativo',
      cosmetic: 'Cosmético',
      orthodontic: 'Ortodóncico',
      periodontal: 'Periodontal',
      endodontic: 'Endodóncico',
      oral_surgery: 'Cirugía Oral',
      prosthodontic: 'Prostodóncico',
      emergency: 'Emergencia',
      consultation: 'Consulta'
    };
    return categories[category] || category;
  };

  // Función para obtener el nombre del estado
  const getStatusName = (status: string) => {
    const statuses: Record<string, string> = {
      planned: 'Planificado',
      in_progress: 'En Progreso',
      completed: 'Completado',
      cancelled: 'Cancelado',
      postponed: 'Pospuesto',
      follow_up_required: 'Requiere Seguimiento'
    };
    return statuses[status] || status;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                  <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Detalle del Historial Médico
                  </h3>
                  <p className="text-sm text-gray-500">
                    Vista completa del historial médico
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Acciones */}
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => window.print()}
                  title="Imprimir"
                >
                  <PrinterIcon className="h-4 w-4 mr-1" />
                  Imprimir
                </button>

                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={onEdit}
                  title="Editar"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Editar
                </button>

                <button
                  type="button"
                  className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={onClose}
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 sm:px-6 py-4">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Cargando historial médico...</span>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <p className="mt-1 text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            ) : record && patient ? (
              <div className="space-y-6">
                {/* Información del paciente y estado */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-xl font-medium text-white">
                            {patient.first_name[0]}{patient.last_name[0]}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          {patient.first_name} {patient.last_name}
                        </h2>
                        <p className="text-sm text-gray-600">
                          {patient.email} • {patient.phone}
                        </p>
                        <p className="text-sm text-gray-500">
                          {calculateAge(patient.date_of_birth)} años • Nacido el {formatDate(patient.date_of_birth)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(record.treatment_status)}`}>
                          {getStatusName(record.treatment_status)}
                        </span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(record.priority)}`}>
                          {record.priority.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        {record.is_recent && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Reciente
                          </span>
                        )}
                        {record.is_confidential && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <ShieldCheckIcon className="h-3 w-3 mr-1" />
                            Confidencial
                          </span>
                        )}
                        {record.requires_attention && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                            Requiere Atención
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información básica */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Información de la visita */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <CalendarIcon className="h-5 w-5 mr-2 text-gray-600" />
                      Información de la Visita
                    </h3>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Fecha de Visita</dt>
                        <dd className="text-sm text-gray-900">{formatDate(record.visit_date)}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Categoría</dt>
                        <dd className="text-sm text-gray-900">{getCategoryName(record.procedure_category)}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Creado</dt>
                        <dd className="text-sm text-gray-900">{formatDateTime(record.created_at)}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Última Actualización</dt>
                        <dd className="text-sm text-gray-900">{formatDateTime(record.updated_at)}</dd>
                      </div>
                    </dl>
                  </div>

                  {/* Información financiera */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <CurrencyEuroIcon className="h-5 w-5 mr-2 text-gray-600" />
                      Información Financiera
                    </h3>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Costo Estimado</dt>
                        <dd className="text-sm text-gray-900 font-semibold">{formatCurrency(record.estimated_cost)}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Costo Real</dt>
                        <dd className="text-sm text-gray-900 font-semibold">{formatCurrency(record.actual_cost)}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Seguro</dt>
                        <dd className="text-sm text-gray-900">
                          {record.insurance_covered ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircleIcon className="h-3 w-3 mr-1" />
                              Cubierto
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              No cubierto
                            </span>
                          )}
                        </dd>
                      </div>
                      {record.is_major_treatment && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Tipo de Tratamiento</dt>
                          <dd className="text-sm text-gray-900">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Tratamiento Mayor
                            </span>
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>

                {/* Información clínica */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <DocumentTextIcon className="h-5 w-5 mr-2 text-gray-600" />
                    Información Clínica
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Queja principal */}
                    {record.chief_complaint && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Queja Principal</h4>
                        <p className="text-sm text-gray-900 bg-yellow-50 p-3 rounded-md border-l-4 border-yellow-400">
                          {record.chief_complaint}
                        </p>
                      </div>
                    )}

                    {/* Diagnóstico */}
                    {record.diagnosis && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Diagnóstico</h4>
                        <p className="text-sm text-gray-900 bg-blue-50 p-3 rounded-md border-l-4 border-blue-400">
                          {record.diagnosis}
                        </p>
                      </div>
                    )}

                    {/* Plan de tratamiento */}
                    {record.treatment_plan && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Plan de Tratamiento</h4>
                        <p className="text-sm text-gray-900 bg-green-50 p-3 rounded-md border-l-4 border-green-400">
                          {record.treatment_plan}
                        </p>
                      </div>
                    )}

                    {/* Tratamiento realizado */}
                    {record.treatment_performed && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Tratamiento Realizado</h4>
                        <p className="text-sm text-gray-900 bg-purple-50 p-3 rounded-md border-l-4 border-purple-400">
                          {record.treatment_performed}
                        </p>
                      </div>
                    )}

                    {/* Notas clínicas */}
                    {record.clinical_notes && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Notas Clínicas</h4>
                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md border-l-4 border-gray-400">
                          {record.clinical_notes}
                        </p>
                      </div>
                    )}

                    {/* Resumen del tratamiento (calculado) */}
                    {record.treatment_summary && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Resumen Automático</h4>
                        <p className="text-sm text-gray-900 bg-indigo-50 p-3 rounded-md border-l-4 border-indigo-400">
                          {record.treatment_summary}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Información adicional */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Estadísticas */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Estadísticas</h3>
                    <dl className="space-y-3">
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">Dientes Afectados</dt>
                        <dd className="text-sm text-gray-900 font-semibold">{record.total_teeth_affected}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">Días desde creación</dt>
                        <dd className="text-sm text-gray-900">{record.age_days} días</dd>
                      </div>
                    </dl>
                  </div>

                  {/* Seguimiento */}
                  {record.follow_up_required && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <ClockIcon className="h-5 w-5 mr-2 text-orange-600" />
                        Seguimiento Requerido
                      </h3>
                      <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
                        <div className="flex items-start">
                          <ExclamationTriangleIcon className="h-5 w-5 text-orange-400 mt-0.5" />
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-orange-800">
                              Cita de seguimiento programada
                            </h4>
                            {record.follow_up_date && (
                              <p className="mt-1 text-sm text-orange-700">
                                Fecha: {formatDate(record.follow_up_date)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Documentos adjuntos (placeholder para futura implementación) */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <DocumentDuplicateIcon className="h-5 w-5 mr-2 text-gray-600" />
                    Documentos Adjuntos
                  </h3>
                  <div className="text-center py-6">
                    <ArchiveBoxIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h4 className="mt-2 text-sm font-medium text-gray-900">
                      Sin documentos adjuntos
                    </h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Los documentos asociados a este historial aparecerán aquí
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onEdit}
            >
              Editar Historial
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordDetail;

