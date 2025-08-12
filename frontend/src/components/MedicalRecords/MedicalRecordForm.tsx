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

import React, { useState, useEffect } from 'react';
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

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
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
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);

  // Cargar pacientes al montar el componente
  useEffect(() => {
    if (isOpen) {
      fetchPatients();
      if (recordId) {
        fetchMedicalRecord();
      }
    }
  }, [isOpen, recordId]);

  // Función para obtener lista de pacientes
  const fetchPatients = async () => {
    try {
      setLoadingPatients(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://127.0.0.1:8002/api/v1/patients/?size=1000', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPatients(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoadingPatients(false);
    }
  };

  // Función para obtener historial médico existente
  const fetchMedicalRecord = async () => {
    if (!recordId) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://127.0.0.1:8002/api/v1/medical-records/${recordId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const record = await response.json();
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
  };

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
      const token = localStorage.getItem('token');

      // Preparar datos para envío
      const submitData = {
        ...formData,
        estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : null,
        actual_cost: formData.actual_cost ? parseFloat(formData.actual_cost) : null,
        follow_up_date: formData.follow_up_required && formData.follow_up_date ? formData.follow_up_date : null
      };

      const url = recordId 
        ? `http://127.0.0.1:8002/api/v1/medical-records/${recordId}`
        : 'http://127.0.0.1:8002/api/v1/medical-records/';

      const method = recordId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        onSave();
        onClose();
        resetForm();
      } else {
        const errorData = await response.json();
        console.error('Error saving medical record:', errorData);
        
        // Manejar errores de validación del servidor
        if (errorData.detail && Array.isArray(errorData.detail)) {
          const serverErrors: Record<string, string> = {};
          errorData.detail.forEach((error: any) => {
            if (error.loc && error.loc.length > 0) {
              const field = error.loc[error.loc.length - 1];
              serverErrors[field] = error.msg;
            }
          });
          setErrors(serverErrors);
        }
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Paciente *
                    </label>
                    <select
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        errors.patient_id ? 'border-red-300' : 'border-gray-300'
                      }`}
                      value={formData.patient_id}
                      onChange={(e) => handleChange('patient_id', e.target.value)}
                      disabled={loadingPatients}
                    >
                      <option value="">Seleccionar paciente...</option>
                      {patients.map(patient => (
                        <option key={patient.id} value={patient.id}>
                          {patient.first_name} {patient.last_name} - {patient.email}
                        </option>
                      ))}
                    </select>
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
