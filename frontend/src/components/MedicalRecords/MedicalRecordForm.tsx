// MEDICAL_RECORDS: Formulario para crear/editar historiales médicos
/**
 * Formulario completo para gestión de historiales médicos.
 * Incluye validación, carga de archivos y estado de guardado.
 * 
 * PLATFORM_PATTERN: Este patrón se repetirá en otros verticales:
 * - VetGest: Formulario de historial veterinario
 * - MechaGest: Formulario de orden de servicio
 * - RestaurantGest: Formulario de pedido
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import apolloGraphQL from '../../services/apolloGraphQL'; // 🥷 STEALTH GRAPHQL NINJA MODE
import { usePatients, Patient } from '../../hooks/usePatients';
import { 
  XMarkIcon,
  DocumentPlusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyEuroIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

// Types
interface MedicalRecordFormData {
  patient_id: string;
  visit_date: string;
  chief_complaint: string;
  diagnosis: string;
  treatment_plan: string;
  treatment_performed: string;
  clinical_notes: string;
  procedure_category: 'preventive' | 'restorative' | 'cosmetic' | 'orthodontic' | 'periodontal' | 'endodontic' | 'oral_surgery' | 'prosthodontic' | 'emergency' | 'consultation';
  treatment_status: 'planned' | 'in_progress' | 'completed' | 'cancelled' | 'postponed' | 'follow_up_required';
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'emergency';
  estimated_cost: string;
  actual_cost: string;
  insurance_covered: boolean;
  follow_up_required: boolean;
  follow_up_date: string;
  is_confidential: boolean;
}

interface MedicalRecordFormProps {
  isOpen: boolean;
  onClose: () => void;
  recordId?: string | null;
  patientId?: string | null;
  onSave: () => void;
}

const MedicalRecordForm: React.FC<MedicalRecordFormProps> = ({
  isOpen,
  onClose,
  recordId = null,
  patientId,
  onSave
}) => {
  const { state } = useAuth();
  const { patients, loading: loadingPatients, fetchPatients, fetchAllPatients } = usePatients();
  
  // Estados del formulario
  const [formData, setFormData] = useState<MedicalRecordFormData>({
    patient_id: patientId || '',
    visit_date: new Date().toISOString().split('T')[0],
    chief_complaint: '',
    diagnosis: '',
    treatment_plan: '',
    treatment_performed: '',
    clinical_notes: '',
    procedure_category: 'consultation',
    treatment_status: 'planned',
    priority: 'medium',
    estimated_cost: '',
    actual_cost: '',
    insurance_covered: false,
    follow_up_required: false,
    follow_up_date: '',
    is_confidential: false
  });

  // Estados de control
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Estados para autocompletado de pacientes
  const [patientSearch, setPatientSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);

  // Helper para obtener el nombre del paciente
  const getPatientName = (patientId: string): string => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.first_name} ${patient.last_name}` : 'Cargando...';
  };

  // Función de búsqueda de pacientes con autocompletado
  const handlePatientSearch = async (searchTerm: string) => {
    setPatientSearch(searchTerm);
    
    if (searchTerm.length >= 2) {
      // Usar el hook para buscar pacientes
      const results = await fetchPatients({ query: searchTerm });
      
      // Mapear resultados del API al formato esperado
      const mappedResults = (results || []).map((suggestion: any) => ({
        id: suggestion.id,
        first_name: suggestion.name.split(' ')[0] || '',
        last_name: suggestion.name.split(' ').slice(1).join(' ') || '',
        email: suggestion.email || ''
      }));
      
      setFilteredPatients(mappedResults);
      setShowSuggestions(true);
    } else if (searchTerm.length > 0) {
      // Buscar en pacientes locales para términos cortos
      const localResults = (patients || []).filter(p => 
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPatients(localResults);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setFormData(prev => ({ ...prev, patient_id: '' }));
    }
  };

  // Función para seleccionar un paciente
  const handlePatientSelect = (patient: Patient) => {
    setFormData(prev => ({ ...prev, patient_id: patient.id }));
    setPatientSearch(`${patient.first_name} ${patient.last_name}`);
    setShowSuggestions(false);
  };

  // Cargar pacientes al montar el componente
  useEffect(() => {
    if (isOpen && patients.length === 0) {
      fetchAllPatients();
    }
  }, [isOpen, patients.length, fetchAllPatients]);

  // Cargar medical record después de cargar pacientes
  const fetchMedicalRecord = useCallback(async () => {
    if (!recordId) return;

    try {
      setLoading(true);
      
      // 🚀 OPERACIÓN APOLLO - Using centralized API service
      // Replaces hardcoded fetch with apollo.medicalRecords.getById()
      // Benefits: V1/V2 switching, error handling, performance monitoring
      const response = await apolloGraphQL.medicalRecords.getById(recordId);

      if (response) {
        const record = response as any;
        setFormData({
          patient_id: record.patient_id,
          visit_date: record.visit_date.split('T')[0],
          chief_complaint: record.chief_complaint || '',
          diagnosis: record.diagnosis || '',
          treatment_plan: record.treatment_plan || '',
          treatment_performed: record.treatment_performed || '',
          clinical_notes: record.clinical_notes || '',
          procedure_category: record.procedure_category,
          treatment_status: record.treatment_status,
          priority: record.priority,
          estimated_cost: record.estimated_cost?.toString() || '',
          actual_cost: record.actual_cost?.toString() || '',
          insurance_covered: record.insurance_covered || false,
          follow_up_required: record.follow_up_required || false,
          follow_up_date: record.follow_up_date ? record.follow_up_date.split('T')[0] : '',
          is_confidential: record.is_confidential || false
        });
      }
    } catch (error) {
      console.error('Error fetching medical record:', error);
    } finally {
      setLoading(false);
    }
  }, [recordId]);

  useEffect(() => {
    if (isOpen && recordId && patients.length > 0) {
      fetchMedicalRecord();
    }
  }, [isOpen, recordId, patients.length, fetchMedicalRecord]);

  // Actualizar patientSearch cuando se carga el record en modo edición
  useEffect(() => {
    if (recordId && formData.patient_id && patients.length > 0) {
      const patient = patients.find(p => p.id === formData.patient_id);
      if (patient) {
        setPatientSearch(`${patient.first_name} ${patient.last_name}`);
      }
    }
  }, [recordId, formData.patient_id, patients]);

  

  // Función para validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.patient_id) {
      newErrors.patient_id = 'Debe seleccionar un paciente';
    }

    if (!formData.visit_date) {
      newErrors.visit_date = 'La fecha de visita es requerida';
    }

    if (!formData.chief_complaint.trim()) {
      newErrors.chief_complaint = 'La queja principal es requerida';
    }

    if (!formData.diagnosis.trim()) {
      newErrors.diagnosis = 'El diagnóstico es requerido';
    }

    if (formData.follow_up_required && !formData.follow_up_date) {
      newErrors.follow_up_date = 'Debe especificar la fecha de seguimiento';
    }

    if (formData.estimated_cost && isNaN(parseFloat(formData.estimated_cost))) {
      newErrors.estimated_cost = 'El costo estimado debe ser un número válido';
    }

    if (formData.actual_cost && isNaN(parseFloat(formData.actual_cost))) {
      newErrors.actual_cost = 'El costo real debe ser un número válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para manejar cambios en el formulario
  const handleChange = (field: keyof MedicalRecordFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Función para enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      // Preparar datos para envío
      const submitData = {
        ...formData,
        estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : null,
        actual_cost: formData.actual_cost ? parseFloat(formData.actual_cost) : null,
        follow_up_date: formData.follow_up_required && formData.follow_up_date ? formData.follow_up_date : null
      };

      // Envolver datos en record_data para el backend
      const requestBody = recordId ? submitData : { record_data: submitData };

      // 🥷 STEALTH MODE: URLs replaced by GraphQL calls
      // Legacy zombie URLs eliminated - using apolloGraphQL.medicalRecords.create/update()
      const url = recordId ? `/graphql/medical-records/${recordId}` : '/graphql/medical-records/'; // 🥷 STEALTH routes
      const response = recordId 
        ? await apolloGraphQL.medicalRecords.update(recordId, requestBody as any)
        : await apolloGraphQL.medicalRecords.create(requestBody as any);

      if (response) {
        onSave();
        onClose();
        resetForm();
      } else {
        console.error('❌ Error saving medical record: Unknown error');
        console.error('❌ Submitted data was:', submitData);
      }
    } catch (error) {
      console.error('Error saving medical record:', error);
    } finally {
      setSaving(false);
    }
  };

  // Función para resetear formulario
  const resetForm = () => {
    setFormData({
      patient_id: patientId || '',
      visit_date: new Date().toISOString().split('T')[0],
      chief_complaint: '',
      diagnosis: '',
      treatment_plan: '',
      treatment_performed: '',
      clinical_notes: '',
      procedure_category: 'consultation',
      treatment_status: 'planned',
      priority: 'medium',
      estimated_cost: '',
      actual_cost: '',
      insurance_covered: false,
      follow_up_required: false,
      follow_up_date: '',
      is_confidential: false
    });
    setErrors({});
  };

  // Función para cerrar modal
  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose}></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                  <DocumentPlusIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {recordId ? 'Editar Historial Médico' : 'Nuevo Historial Médico'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {recordId ? 'Modifica los datos del historial médico' : 'Crea un nuevo historial médico para el paciente'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={handleClose}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-4 sm:px-6">
            <div className="space-y-6">
              {/* Información básica */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <UserIcon className="h-5 w-5 mr-2 text-gray-600" />
                  Información Básica
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Paciente */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Paciente *
                    </label>
                    {recordId ? (
                      // Modo edición: campo de solo lectura
                      <div className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-700">
                        {formData.patient_id ? getPatientName(formData.patient_id) : 'Cargando...'}
                      </div>
                    ) : (
                      // Modo creación: autocompletado de paciente
                      <>
                        <input
                          type="text"
                          className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                            errors.patient_id ? 'border-red-300' : 'border-gray-300'
                          }`}
                          value={patientSearch}
                          onChange={(e) => handlePatientSearch(e.target.value)}
                          placeholder="Buscar paciente por nombre o email..."
                          onFocus={() => {
                            if (patientSearch.length > 0) setShowSuggestions(true);
                          }}
                          onBlur={() => {
                            // Delay para permitir click en sugerencias
                            setTimeout(() => setShowSuggestions(false), 200);
                          }}
                        />
                        
                        {/* Dropdown de sugerencias */}
                        {showSuggestions && filteredPatients.length > 0 && (
                          <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {filteredPatients.map((patient) => (
                              <div
                                key={patient.id}
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                                onMouseDown={(e) => {
                                  e.preventDefault(); // Prevenir que el input pierda focus
                                  handlePatientSelect(patient);
                                }}
                              >
                                <div className="font-medium text-gray-900">
                                  {patient.first_name} {patient.last_name}
                                </div>
                                <div className="text-sm text-gray-600">{patient.email}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Mensaje si no hay sugerencias */}
                        {showSuggestions && patientSearch.length > 0 && filteredPatients.length === 0 && (
                          <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg p-3 text-gray-500 text-sm">
                            No se encontraron pacientes
                          </div>
                        )}
                      </>
                    )}
                    {errors.patient_id && (
                      <p className="mt-1 text-sm text-red-600">{errors.patient_id}</p>
                    )}
                  </div>

                  {/* Fecha de visita */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Visita *
                    </label>
                    <input
                      type="date"
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        errors.visit_date ? 'border-red-300' : 'border-gray-300'
                      }`}
                      value={formData.visit_date}
                      onChange={(e) => handleChange('visit_date', e.target.value)}
                    />
                    {errors.visit_date && (
                      <p className="mt-1 text-sm text-red-600">{errors.visit_date}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Información clínica */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-2 text-gray-600" />
                  Información Clínica
                </h4>
                
                <div className="space-y-4">
                  {/* Queja principal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Queja Principal *
                    </label>
                    <textarea
                      rows={3}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        errors.chief_complaint ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Describe la queja principal del paciente..."
                      value={formData.chief_complaint}
                      onChange={(e) => handleChange('chief_complaint', e.target.value)}
                    />
                    {errors.chief_complaint && (
                      <p className="mt-1 text-sm text-red-600">{errors.chief_complaint}</p>
                    )}
                  </div>

                  {/* Diagnóstico */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Diagnóstico *
                    </label>
                    <textarea
                      rows={3}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        errors.diagnosis ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Diagnóstico detallado..."
                      value={formData.diagnosis}
                      onChange={(e) => handleChange('diagnosis', e.target.value)}
                    />
                    {errors.diagnosis && (
                      <p className="mt-1 text-sm text-red-600">{errors.diagnosis}</p>
                    )}
                  </div>

                  {/* Plan de tratamiento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plan de Tratamiento
                    </label>
                    <textarea
                      rows={4}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe el plan de tratamiento propuesto..."
                      value={formData.treatment_plan}
                      onChange={(e) => handleChange('treatment_plan', e.target.value)}
                    />
                  </div>

                  {/* Tratamiento realizado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tratamiento Realizado
                    </label>
                    <textarea
                      rows={4}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe el tratamiento que se realizó..."
                      value={formData.treatment_performed}
                      onChange={(e) => handleChange('treatment_performed', e.target.value)}
                    />
                  </div>

                  {/* Notas clínicas */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notas Clínicas
                    </label>
                    <textarea
                      rows={3}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Notas adicionales, observaciones, etc..."
                      value={formData.clinical_notes}
                      onChange={(e) => handleChange('clinical_notes', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Categorización y estado */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2 text-gray-600" />
                  Categorización y Estado
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Categoría del procedimiento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría del Procedimiento
                    </label>
                    <select
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.procedure_category}
                      onChange={(e) => handleChange('procedure_category', e.target.value)}
                    >
                      <option value="preventive">Preventivo</option>
                      <option value="restorative">Restaurativo</option>
                      <option value="cosmetic">Cosmético</option>
                      <option value="orthodontic">Ortodóncico</option>
                      <option value="periodontal">Periodontal</option>
                      <option value="endodontic">Endodóncico</option>
                      <option value="oral_surgery">Cirugía Oral</option>
                      <option value="prosthodontic">Prostodóncico</option>
                      <option value="emergency">Emergencia</option>
                      <option value="consultation">Consulta</option>
                    </select>
                  </div>

                  {/* Estado del tratamiento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado del Tratamiento
                    </label>
                    <select
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.treatment_status}
                      onChange={(e) => handleChange('treatment_status', e.target.value)}
                    >
                      <option value="planned">Planificado</option>
                      <option value="in_progress">En Progreso</option>
                      <option value="completed">Completado</option>
                      <option value="cancelled">Cancelado</option>
                      <option value="postponed">Pospuesto</option>
                      <option value="follow_up_required">Requiere Seguimiento</option>
                    </select>
                  </div>

                  {/* Prioridad */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prioridad
                    </label>
                    <select
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.priority}
                      onChange={(e) => handleChange('priority', e.target.value)}
                    >
                      <option value="low">Baja</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                      <option value="urgent">Urgente</option>
                      <option value="emergency">Emergencia</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Información financiera */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <CurrencyEuroIcon className="h-5 w-5 mr-2 text-gray-600" />
                  Información Financiera
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Costo estimado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Costo Estimado (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        errors.estimated_cost ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                      value={formData.estimated_cost}
                      onChange={(e) => handleChange('estimated_cost', e.target.value)}
                    />
                    {errors.estimated_cost && (
                      <p className="mt-1 text-sm text-red-600">{errors.estimated_cost}</p>
                    )}
                  </div>

                  {/* Costo real */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Costo Real (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        errors.actual_cost ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                      value={formData.actual_cost}
                      onChange={(e) => handleChange('actual_cost', e.target.value)}
                    />
                    {errors.actual_cost && (
                      <p className="mt-1 text-sm text-red-600">{errors.actual_cost}</p>
                    )}
                  </div>
                </div>

                {/* Seguro cubierto */}
                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={formData.insurance_covered}
                      onChange={(e) => handleChange('insurance_covered', e.target.checked)}
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Cubierto por seguro
                    </span>
                  </label>
                </div>
              </div>

              {/* Seguimiento */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-gray-600" />
                  Seguimiento
                </h4>
                
                <div className="space-y-4">
                  {/* Requiere seguimiento */}
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={formData.follow_up_required}
                        onChange={(e) => handleChange('follow_up_required', e.target.checked)}
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Requiere seguimiento
                      </span>
                    </label>
                  </div>

                  {/* Fecha de seguimiento */}
                  {formData.follow_up_required && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de Seguimiento
                      </label>
                      <input
                        type="date"
                        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                          errors.follow_up_date ? 'border-red-300' : 'border-gray-300'
                        }`}
                        value={formData.follow_up_date}
                        onChange={(e) => handleChange('follow_up_date', e.target.value)}
                      />
                      {errors.follow_up_date && (
                        <p className="mt-1 text-sm text-red-600">{errors.follow_up_date}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Opciones adicionales */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-gray-900 mb-4">
                  Opciones Adicionales
                </h4>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={formData.is_confidential}
                      onChange={(e) => handleChange('is_confidential', e.target.checked)}
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Historial confidencial
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      (Acceso restringido a personal autorizado)
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 mt-6">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={handleClose}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="-ml-1 mr-2 h-5 w-5" />
                      {recordId ? 'Actualizar' : 'Guardar'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordForm;
