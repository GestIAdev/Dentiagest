// 🎯🎸💀 MEDICAL RECORD FORM V3.0 - TITAN PATTERN IMPLEMENTATION
// Date: September 22, 2025
// Mission: Complete medical record creation/editing form with atomic validation
// Status: V3.0 - Full atomic form with GraphQL integration
// Challenge: Multi-step medical data collection with real-time validation

import React, { useState, useEffect } from 'react';

// 🎯 TITAN PATTERN IMPORTS - Core Dependencies
import { useMedicalRecordStore } from '../../stores';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Badge, Spinner } from '../../design-system';
import { createModuleLogger } from '../../utils/logger';
import { RecordTemplates, type MedicalRecordTemplate } from './RecordTemplates';


// 🎯 ICONS - Heroicons for medical theme
import {
  PlusIcon,
  DocumentTextIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  PhotoIcon,
  TagIcon,
  UserIcon,
  ClockIcon,
  HeartIcon as HeartPulseIcon
} from '@heroicons/react/24/outline';

// 🎯 TEMPORARY COMPONENTS - Add to atoms later
const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({
  className = '',
  ...props
}) => (
  <textarea
    className={`flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }> = ({
  className = '',
  children,
  ...props
}) => (
  <select
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  >
    {children}
  </select>
);

// 🎯 TYPES AND INTERFACES
interface MedicalRecordFormV3Props {
  isOpen: boolean;
  onClose: () => void;
  editingRecord?: any;
  patientId?: string;
  className?: string;
}

interface VitalSigns {
  blood_pressure?: string;
  heart_rate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
}

interface FormData {
  record_type: 'consultation' | 'treatment' | 'diagnosis' | 'follow_up' | 'emergency' | 'preventive';
  title: string;
  description: string;
  diagnosis?: string;
  treatment_plan?: string;
  medications?: string;
  notes?: string;
  vital_signs: VitalSigns;
  tags: string[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  attachments: any[];
}

const l = createModuleLogger('MedicalRecordFormV3');

// 🎯 FORM CONFIGURATION
const RECORD_TYPE_OPTIONS = [
  { value: 'consultation', label: 'Consulta', icon: UserIcon },
  { value: 'treatment', label: 'Tratamiento', icon: HeartIcon },
  { value: 'diagnosis', label: 'Diagnóstico', icon: ExclamationTriangleIcon },
  { value: 'follow_up', label: 'Seguimiento', icon: ClockIcon },
  { value: 'emergency', label: 'Emergencia', icon: ExclamationTriangleIcon },
  { value: 'preventive', label: 'Preventivo', icon: CheckCircleIcon }
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Baja', color: 'gray' },
  { value: 'normal', label: 'Normal', color: 'blue' },
  { value: 'high', label: 'Alta', color: 'yellow' },
  { value: 'urgent', label: 'Urgente', color: 'red' }
];

// 🎯 FORM VALIDATION
const validateForm = (data: FormData): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!data.title.trim()) errors.title = 'El título es obligatorio';
  if (!data.description.trim()) errors.description = 'La descripción es obligatoria';
  if (!data.record_type) errors.record_type = 'El tipo de registro es obligatorio';

  // Vital signs validation
  if (data.vital_signs.blood_pressure && !/^\d{2,3}\/\d{2,3}$/.test(data.vital_signs.blood_pressure)) {
    errors.blood_pressure = 'Formato inválido (ej: 120/80)';
  }

  if (data.vital_signs.heart_rate && (data.vital_signs.heart_rate < 40 || data.vital_signs.heart_rate > 200)) {
    errors.heart_rate = 'Ritmo cardíaco debe estar entre 40-200 bpm';
  }

  if (data.vital_signs.temperature && (data.vital_signs.temperature < 30 || data.vital_signs.temperature > 45)) {
    errors.temperature = 'Temperatura debe estar entre 30-45°C';
  }

  if (data.vital_signs.weight && (data.vital_signs.weight < 1 || data.vital_signs.weight > 500)) {
    errors.weight = 'Peso debe estar entre 1-500 kg';
  }

  if (data.vital_signs.height && (data.vital_signs.height < 30 || data.vital_signs.height > 250)) {
    errors.height = 'Altura debe estar entre 30-250 cm';
  }

  return errors;
};

export const MedicalRecordFormV3: React.FC<MedicalRecordFormV3Props> = ({
  isOpen,
  onClose,
  editingRecord,
  patientId = 'default-patient',
  className = ''
}) => {
  // 🎯 MEDICAL RECORD STORE - Apollo Nuclear State Management
  const { createMedicalRecord, updateMedicalRecordAsync, isLoading } = useMedicalRecordStore();

  // 🎯 FORM STATE
  const [currentStep, setCurrentStep] = useState(1);
  const [showTemplates, setShowTemplates] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    record_type: 'consultation',
    title: '',
    description: '',
    diagnosis: '',
    treatment_plan: '',
    medications: '',
    notes: '',
    vital_signs: {},
    tags: [],
    priority: 'normal',
    attachments: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');

  // 🎯 FORM INITIALIZATION
  useEffect(() => {
    if (editingRecord) {
      setFormData({
        record_type: editingRecord.record_type || 'consultation',
        title: editingRecord.title || '',
        description: editingRecord.description || '',
        diagnosis: editingRecord.diagnosis || '',
        treatment_plan: editingRecord.treatment_plan || '',
        medications: editingRecord.medications || '',
        notes: editingRecord.notes || '',
        vital_signs: editingRecord.vital_signs || {},
        tags: editingRecord.tags || [],
        priority: editingRecord.priority || 'normal',
        attachments: editingRecord.attachments || []
      });
    } else {
      // Reset form for new record
      setFormData({
        record_type: 'consultation',
        title: '',
        description: '',
        diagnosis: '',
        treatment_plan: '',
        medications: '',
        notes: '',
        vital_signs: {},
        tags: [],
        priority: 'normal',
        attachments: []
      });
    }
    setCurrentStep(1);
    setErrors({});
    setTagInput('');
  }, [editingRecord, isOpen]);

  // 🎯 FORM HANDLERS
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleVitalSignsChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      vital_signs: {
        ...prev.vital_signs,
        [field]: value
      }
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // 🎯 TEMPLATE HANDLER - Apply template to form
  const handleSelectTemplate = (template: MedicalRecordTemplate) => {
    // Pre-fill form with template data
    setFormData(prev => ({
      ...prev,
      record_type: template.category === 'preventive' ? 'preventive' :
                    template.category === 'emergency' ? 'emergency' :
                    template.category === 'restorative' || template.category === 'cosmetic' ? 'treatment' :
                    'consultation',
      title: template.name,
      description: template.diagnosis,
      diagnosis: template.diagnosis,
      treatment_plan: template.treatmentPlan,
      medications: template.medications?.join(', ') || '',
      notes: template.notes,
      priority: template.priority,
      tags: [template.category]
    }));
    
    setShowTemplates(false);
    setCurrentStep(1);
    
    l.info('Template applied', { templateId: template.id });
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      // Go to first step with errors
      setCurrentStep(1);
      return;
    }

    try {
      const recordData = {
        ...formData,
        patient_id: patientId,
        created_by: 'current_user', // TODO: Get from auth
        status: 'active' as const
      };

      if (editingRecord) {
        await updateMedicalRecordAsync(editingRecord.id, recordData);
        l.info('Medical record updated successfully');
      } else {
        await createMedicalRecord(recordData);
        l.info('Medical record created successfully');
      }

      onClose();
    } catch (error) {
      l.error('Failed to save medical record', error as Error);
    }
  };

  // 🎯 STEP CONFIGURATION
  const steps = [
    { id: 1, title: 'Información Básica', description: 'Tipo, título y descripción' },
    { id: 2, title: 'Datos Médicos', description: 'Diagnóstico y tratamiento' },
    { id: 3, title: 'Signos Vitales', description: 'Medidas biométricas' },
    { id: 4, title: 'Detalles Adicionales', description: 'Etiquetas y archivos' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <CardHeader className="flex items-center justify-between border-b">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <DocumentTextIcon className="w-6 h-6" />
              <span>
                {editingRecord ? 'Editar Registro Médico' : 'Crear Nuevo Registro Médico'}
              </span>
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Paso {currentStep} de {steps.length}: {steps[currentStep - 1].title}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!editingRecord && !showTemplates && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTemplates(true)}
              >
                📋 Usar Plantilla
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <XMarkIcon className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        {/* Templates Modal */}
        {showTemplates && (
          <div className="absolute inset-0 bg-white z-10 overflow-y-auto">
            <RecordTemplates
              onSelectTemplate={handleSelectTemplate}
              onClose={() => setShowTemplates(false)}
            />
          </div>
        )}

        {/* Progress Indicator */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center space-x-2">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                  ${currentStep > step.id ? 'bg-green-500 text-white' :
                    currentStep === step.id ? 'bg-blue-500 text-white' :
                    'bg-gray-200 text-gray-600'}`}>
                  {currentStep > step.id ? <CheckCircleIcon className="w-4 h-4" /> : step.id}
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">{steps[currentStep - 1].description}</p>
        </div>

        <CardContent className="p-6 overflow-y-auto max-h-96">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Registro *
                  </label>
                  <Select
                    value={formData.record_type}
                    onChange={(value) => handleInputChange('record_type', value)}
                    className={errors.record_type ? 'border-red-300' : ''}
                  >
                    {RECORD_TYPE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                  {errors.record_type && (
                    <p className="text-red-600 text-sm mt-1">{errors.record_type}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioridad
                  </label>
                  <Select
                    value={formData.priority}
                    onChange={(value) => handleInputChange('priority', value)}
                  >
                    {PRIORITY_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Ej: Consulta inicial de ortodoncia"
                  className={errors.title ? 'border-red-300' : ''}
                />
                {errors.title && (
                  <p className="text-red-600 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describa los síntomas, hallazgos o motivo de la consulta..."
                  rows={4}
                  className={errors.description ? 'border-red-300' : ''}
                />
                {errors.description && (
                  <p className="text-red-600 text-sm mt-1">{errors.description}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Medical Data */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diagnóstico
                </label>
                <Textarea
                  value={formData.diagnosis}
                  onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                  placeholder="Diagnóstico médico o hallazgos clínicos..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan de Tratamiento
                </label>
                <Textarea
                  value={formData.treatment_plan}
                  onChange={(e) => handleInputChange('treatment_plan', e.target.value)}
                  placeholder="Plan de tratamiento recomendado..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medicamentos
                </label>
                <Textarea
                  value={formData.medications}
                  onChange={(e) => handleInputChange('medications', e.target.value)}
                  placeholder="Medicamentos prescritos, dosis, frecuencia..."
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas Adicionales
                </label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Observaciones adicionales, recomendaciones..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 3: Vital Signs */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <HeartPulseIcon className="w-5 h-5 mr-2" />
                Signos Vitales
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Presión Arterial (mmHg)
                  </label>
                  <Input
                    type="text"
                    value={formData.vital_signs.blood_pressure || ''}
                    onChange={(e) => handleVitalSignsChange('blood_pressure', e.target.value)}
                    placeholder="120/80"
                    className={errors.blood_pressure ? 'border-red-300' : ''}
                  />
                  {errors.blood_pressure && (
                    <p className="text-red-600 text-sm mt-1">{errors.blood_pressure}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ritmo Cardíaco (bpm)
                  </label>
                  <Input
                    type="number"
                    value={formData.vital_signs.heart_rate || ''}
                    onChange={(e) => handleVitalSignsChange('heart_rate', parseInt(e.target.value) || undefined)}
                    placeholder="72"
                    min="40"
                    max="200"
                    className={errors.heart_rate ? 'border-red-300' : ''}
                  />
                  {errors.heart_rate && (
                    <p className="text-red-600 text-sm mt-1">{errors.heart_rate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temperatura (°C)
                  </label>
                  <Input
                    type="number"
                    value={formData.vital_signs.temperature || ''}
                    onChange={(e) => handleVitalSignsChange('temperature', parseFloat(e.target.value) || undefined)}
                    placeholder="36.5"
                    step="0.1"
                    min="30"
                    max="45"
                    className={errors.temperature ? 'border-red-300' : ''}
                  />
                  {errors.temperature && (
                    <p className="text-red-600 text-sm mt-1">{errors.temperature}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peso (kg)
                  </label>
                  <Input
                    type="number"
                    value={formData.vital_signs.weight || ''}
                    onChange={(e) => handleVitalSignsChange('weight', parseFloat(e.target.value) || undefined)}
                    placeholder="70"
                    step="0.1"
                    min="1"
                    max="500"
                    className={errors.weight ? 'border-red-300' : ''}
                  />
                  {errors.weight && (
                    <p className="text-red-600 text-sm mt-1">{errors.weight}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Altura (cm)
                  </label>
                  <Input
                    type="number"
                    value={formData.vital_signs.height || ''}
                    onChange={(e) => handleVitalSignsChange('height', parseFloat(e.target.value) || undefined)}
                    placeholder="170"
                    min="30"
                    max="250"
                    className={errors.height ? 'border-red-300' : ''}
                  />
                  {errors.height && (
                    <p className="text-red-600 text-sm mt-1">{errors.height}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Additional Details */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <TagIcon className="w-4 h-4 mr-1" />
                  Etiquetas
                </label>
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Agregar etiqueta..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    variant="secondary"
                    size="sm"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-red-600"
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <PhotoIcon className="w-4 h-4 mr-1" />
                  Archivos Adjuntos
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <PhotoIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">Arrastra archivos aquí o</p>
                  <Button variant="secondary" size="sm">
                    Seleccionar Archivos
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    PNG, JPG, PDF hasta 10MB cada uno
                  </p>
                </div>
                {formData.attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{file.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // TODO: Remove attachment
                          }}
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>

        {/* Form Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
          >
            Anterior
          </Button>

          <div className="flex space-x-3">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>

            {currentStep < steps.length ? (
              <Button
                onClick={() => setCurrentStep(prev => Math.min(steps.length, prev + 1))}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                {isLoading && <Spinner size="sm" />}
                <span>{editingRecord ? 'Actualizar' : 'Crear'} Registro</span>
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MedicalRecordFormV3;
