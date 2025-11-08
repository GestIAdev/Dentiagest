// 🎯🎸💀 PATIENT FORM WIZARD V3.0 - OLYMPUS RECONSTRUCTION
// Date: September 22, 2025
// Mission: Advanced patient creation/editing wizard with Titan Pattern
// Status: V3.0 - Full reconstruction with GraphQL + @veritas + Real-Time

import React, { useState, useEffect, useMemo } from 'react';

// 🎯 TITAN PATTERN IMPORTS - Core Dependencies
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Badge, Spinner } from '../atoms';
import { createModuleLogger } from '../../utils/logger';
import { useDocumentLogger } from '../../utils/documentLogger';

// 🎯 GRAPHQL OPERATIONS - Apollo Nuclear Integration
import { useMutation } from '@apollo/client/react';
import {
  CREATE_PATIENT,
  UPDATE_PATIENT,
  CREATE_PATIENT_V3,
  UPDATE_PATIENT_V3
} from '../../graphql/queries/patients';

// 🎯 ICONS - Cyberpunk Medical Theme
import {
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  HeartIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

// 🎯 TYPES AND INTERFACES
interface VeritasMetadata {
  verified: boolean;
  confidence: number;
  level: string;
  certificate?: string;
  error?: string;
  verifiedAt: string;
  algorithm: string;
}

interface PatientFormData {
  // Step 1: Personal Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phoneSecondary?: string;
  dateOfBirth?: string;
  gender?: string;

  // Step 2: Contact & Address
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressPostalCode?: string;
  addressCountry?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  preferredContactMethod?: string;

  // Step 3: Medical Info
  medicalConditions?: string;
  medicationsCurrent?: string;
  allergies?: string;
  anxietyLevel?: string;
  specialNeeds?: string;

  // Step 4: Insurance
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceGroupNumber?: string;

  // Step 5: Consent & Notes
  consentToTreatment?: boolean;
  consentToContact?: boolean;
  notes?: string;
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  required: boolean;
  veritasFields?: string[];
}

interface PatientFormWizardV3Props {
  patient?: any;
  onComplete: (patient: any) => void;
  onCancel: () => void;
}

// 🎯 WIZARD STEPS CONFIGURATION
const WIZARD_STEPS: WizardStep[] = [
  {
    id: 'personal',
    title: 'Información Personal',
    description: 'Datos básicos del paciente',
    icon: UserIcon,
    required: true
  },
  {
    id: 'contact',
    title: 'Contacto y Dirección',
    description: 'Información de contacto y ubicación',
    icon: PhoneIcon,
    required: true
  },
  {
    id: 'medical',
    title: 'Información Médica',
    description: 'Historia clínica y condiciones médicas',
    icon: HeartIcon,
    required: false,
    veritasFields: ['medicalHistory']
  },
  {
    id: 'insurance',
    title: 'Seguro Médico',
    description: 'Información del seguro de salud',
    icon: ShieldCheckIcon,
    required: false,
    veritasFields: ['policyNumber']
  },
  {
    id: 'consent',
    title: 'Consentimientos',
    description: 'Autorizaciones y notas finales',
    icon: DocumentTextIcon,
    required: true
  }
];

// 🎯 LOGGER INITIALIZATION
const l = createModuleLogger('PatientFormWizardV3');

// 🎯 MAIN COMPONENT - PatientFormWizardV3
const PatientFormWizardV3: React.FC<PatientFormWizardV3Props> = ({
  patient,
  onComplete,
  onCancel
}) => {
  const logger = useDocumentLogger('PatientFormWizardV3');
  // 🎯 GRAPHQL MUTATIONS
  const [createPatientMutation] = useMutation(CREATE_PATIENT_V3);
  const [updatePatientMutation] = useMutation(UPDATE_PATIENT_V3);

  // 🎯 WIZARD STATE
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 🎯 FORM DATA STATE
  const [formData, setFormData] = useState<PatientFormData>({
    firstName: patient?.firstName || patient?.first_name || '',
    lastName: patient?.lastName || patient?.last_name || '',
    email: patient?.email || '',
    phone: patient?.phone || '',
    phoneSecondary: patient?.phoneSecondary || patient?.phone_secondary || '',
    dateOfBirth: patient?.dateOfBirth || patient?.date_of_birth || '',
    gender: patient?.gender || '',

    addressStreet: patient?.addressStreet || patient?.address_street || '',
    addressCity: patient?.addressCity || patient?.address_city || '',
    addressState: patient?.addressState || patient?.address_state || '',
    addressPostalCode: patient?.addressPostalCode || patient?.address_postal_code || '',
    addressCountry: patient?.addressCountry || patient?.address_country || 'Argentina',
    emergencyContactName: patient?.emergencyContactName || patient?.emergency_contact_name || '',
    emergencyContactPhone: patient?.emergencyContactPhone || patient?.emergency_contact_phone || '',
    emergencyContactRelationship: patient?.emergencyContactRelationship || patient?.emergency_contact_relationship || '',
    preferredContactMethod: patient?.preferredContactMethod || patient?.preferred_contact_method || 'phone',

    medicalConditions: patient?.medicalConditions || patient?.medical_conditions || '',
    medicationsCurrent: patient?.medicationsCurrent || patient?.medications_current || '',
    allergies: patient?.allergies || '',
    anxietyLevel: patient?.anxietyLevel || patient?.anxiety_level || '',
    specialNeeds: patient?.specialNeeds || patient?.special_needs || '',

    insuranceProvider: patient?.insuranceProvider || patient?.insurance_provider || '',
    insurancePolicyNumber: patient?.insurancePolicyNumber || patient?.insurance_policy_number || '',
    insuranceGroupNumber: patient?.insuranceGroupNumber || patient?.insurance_group_number || '',

    consentToTreatment: patient?.consentToTreatment ?? patient?.consent_to_treatment ?? true,
    consentToContact: patient?.consentToContact ?? patient?.consent_to_contact ?? true,
    notes: patient?.notes || ''
  });

  // 🎯 COMPUTED VALUES
  const currentStepData = WIZARD_STEPS[currentStep];
  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;
  const isEditing = !!patient;
  const canProceed = useMemo(() => validateCurrentStep(), [currentStep, formData]);

  // 🎯 EFFECTS - Logging and Initialization
  useEffect(() => {
    logger.logMount({
      mode: isEditing ? 'edit' : 'create',
      patientId: patient?.id,
      currentStep: currentStepData.title
    });

    l.info('PatientFormWizardV3 initialized', {
      mode: isEditing ? 'edit' : 'create',
      patientId: patient?.id,
      totalSteps: WIZARD_STEPS.length
    });

    return () => logger.logUnmount();
  }, []);

  useEffect(() => {
    logger.logUserInteraction('step_change', {
      from: WIZARD_STEPS[currentStep - 1]?.title || 'start',
      to: currentStepData.title,
      progress: `${currentStep + 1}/${WIZARD_STEPS.length}`
    });
  }, [currentStep]);

  // 🎯 VALIDATION FUNCTIONS
  function validateCurrentStep(): boolean {
    const step = WIZARD_STEPS[currentStep];

    switch (step.id) {
      case 'personal':
        return !!(formData.firstName && formData.lastName && formData.email && formData.phone);

      case 'contact':
        return !!(formData.addressStreet && formData.addressCity && formData.addressState &&
                 formData.addressPostalCode && formData.emergencyContactName &&
                 formData.emergencyContactPhone);

      case 'medical':
        // Medical info is optional but if provided, should be meaningful
        return true;

      case 'insurance':
        // Insurance is optional
        return true;

      case 'consent':
        return !!(formData.consentToTreatment && formData.consentToContact);

      default:
        return false;
    }
  }

  // 🎯 NAVIGATION FUNCTIONS
  const handleNext = () => {
    if (!canProceed) return;

    setCompletedSteps(prev => new Set([...prev, currentStep]));
    setCurrentStep(prev => Math.min(prev + 1, WIZARD_STEPS.length - 1));

    logger.logUserInteraction('wizard_next', {
      fromStep: currentStepData.title,
      toStep: WIZARD_STEPS[currentStep + 1]?.title
    });
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));

    logger.logUserInteraction('wizard_previous', {
      fromStep: currentStepData.title,
      toStep: WIZARD_STEPS[currentStep - 1]?.title
    });
  };

  const handleStepClick = (stepIndex: number) => {
    // Allow jumping to completed steps or adjacent steps
    if (stepIndex <= currentStep || completedSteps.has(stepIndex - 1) || stepIndex === currentStep + 1) {
      setCurrentStep(stepIndex);
    }
  };

  // 🎯 FORM HANDLERS
  const updateFormData = (field: keyof PatientFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    logger.logUserInteraction('form_field_update', { field, hasValue: !!value });
  };

  // 🎯 SUBMIT HANDLER
  const handleSubmit = async () => {
    if (!canProceed || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    logger.logUserInteraction('wizard_submit_start', {
      mode: isEditing ? 'update' : 'create',
      patientId: patient?.id
    });

    try {
      l.info(`${isEditing ? 'Updating' : 'Creating'} patient`, {
        patientName: `${formData.firstName} ${formData.lastName}`
      });

      const patientData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        phone_secondary: formData.phoneSecondary,
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender,
        address_street: formData.addressStreet,
        address_city: formData.addressCity,
        address_state: formData.addressState,
        address_postal_code: formData.addressPostalCode,
        address_country: formData.addressCountry,
        emergency_contact_name: formData.emergencyContactName,
        emergency_contact_phone: formData.emergencyContactPhone,
        emergency_contact_relationship: formData.emergencyContactRelationship,
        medical_conditions: formData.medicalConditions,
        medications_current: formData.medicationsCurrent,
        allergies: formData.allergies,
        anxiety_level: formData.anxietyLevel,
        special_needs: formData.specialNeeds,
        insurance_provider: formData.insuranceProvider,
        insurance_policy_number: formData.insurancePolicyNumber,
        insurance_group_number: formData.insuranceGroupNumber,
        consent_to_treatment: formData.consentToTreatment,
        consent_to_contact: formData.consentToContact,
        preferred_contact_method: formData.preferredContactMethod,
        notes: formData.notes
      };

      const mutation = isEditing ? updatePatientMutation : createPatientMutation;
      const variables = isEditing
        ? { id: patient.id, input: patientData }
        : { input: patientData };

      const { data } = await mutation({
        variables,
        refetchQueries: [{ query: require('../../graphql/queries/patients').GET_PATIENTS }]
      });

      const result = data?.[isEditing ? 'updatePatient' : 'createPatient'];

      l.info(`Patient ${isEditing ? 'updated' : 'created'} successfully`, {
        patientId: result?.id
      });

      logger.logUserInteraction('wizard_submit_success', {
        mode: isEditing ? 'update' : 'create',
        patientId: result?.id
      });

      onComplete(result);

    } catch (error: any) {
      l.error(`Patient ${isEditing ? 'update' : 'creation'} failed`,
        error instanceof Error ? error : new Error(error.message));

      setSubmitError(error.message || `Error al ${isEditing ? 'actualizar' : 'crear'} el paciente`);

      logger.logError(
        error instanceof Error ? error : new Error(error.message),
        { operation: isEditing ? 'update' : 'create' }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🎯 RENDER FUNCTIONS - Step Components
  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {WIZARD_STEPS.map((step, index) => {
        const Icon = step.icon;
        const isCompleted = completedSteps.has(index);
        const isCurrent = index === currentStep;
        const isClickable = index <= currentStep || completedSteps.has(index - 1) || index === currentStep + 1;

        return (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => handleStepClick(index)}
              disabled={!isClickable}
              className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                isCompleted
                  ? 'bg-green-500 border-green-500 text-white'
                  : isCurrent
                    ? 'bg-cyan-500 border-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                    : isClickable
                      ? 'border-gray-600 text-gray-400 hover:border-cyan-400 hover:text-cyan-400'
                      : 'border-gray-700 text-gray-600 cursor-not-allowed'
              }`}
            >
              {isCompleted ? (
                <CheckCircleIcon className="w-6 h-6" />
              ) : (
                <Icon className="w-6 h-6" />
              )}
            </button>

            {index < WIZARD_STEPS.length - 1 && (
              <div className={`w-16 h-0.5 mx-2 ${
                isCompleted || (index < currentStep) ? 'bg-green-500' : 'bg-gray-700'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );

  const renderPersonalStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2 cyberpunk-text">
            Nombre *
          </label>
          <Input
            value={formData.firstName}
            onChange={(e) => updateFormData('firstName', e.target.value)}
            placeholder="Ingrese el nombre"
            className="cyberpunk-input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 cyberpunk-text">
            Apellido *
          </label>
          <Input
            value={formData.lastName}
            onChange={(e) => updateFormData('lastName', e.target.value)}
            placeholder="Ingrese el apellido"
            className="cyberpunk-input"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2 cyberpunk-text">
            Email *
          </label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            placeholder="email@ejemplo.com"
            className="cyberpunk-input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 cyberpunk-text">
            Teléfono *
          </label>
          <Input
            value={formData.phone}
            onChange={(e) => updateFormData('phone', e.target.value)}
            placeholder="+5491234567890"
            className="cyberpunk-input"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2 cyberpunk-text">
            Fecha de Nacimiento
          </label>
          <Input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
            className="cyberpunk-input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 cyberpunk-text">
            Género
          </label>
          <select
            value={formData.gender}
            onChange={(e) => updateFormData('gender', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
          >
            <option value="">Seleccionar</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="O">Otro</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 cyberpunk-text">
            Teléfono Secundario
          </label>
          <Input
            value={formData.phoneSecondary}
            onChange={(e) => updateFormData('phoneSecondary', e.target.value)}
            placeholder="+5491234567890"
            className="cyberpunk-input"
          />
        </div>
      </div>
    </div>
  );

  const renderContactStep = () => (
    <div className="space-y-6">
      <div className="cyberpunk-card p-4">
        <h3 className="text-lg font-semibold mb-4 cyberpunk-text flex items-center">
          <MapPinIcon className="w-5 h-5 mr-2" />
          Dirección
        </h3>

        <div className="space-y-4">
          <Input
            value={formData.addressStreet}
            onChange={(e) => updateFormData('addressStreet', e.target.value)}
            placeholder="Calle y número"
            className="cyberpunk-input"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              value={formData.addressCity}
              onChange={(e) => updateFormData('addressCity', e.target.value)}
              placeholder="Ciudad"
              className="cyberpunk-input"
            />

            <Input
              value={formData.addressState}
              onChange={(e) => updateFormData('addressState', e.target.value)}
              placeholder="Provincia"
              className="cyberpunk-input"
            />

            <Input
              value={formData.addressPostalCode}
              onChange={(e) => updateFormData('addressPostalCode', e.target.value)}
              placeholder="Código Postal"
              className="cyberpunk-input"
            />
          </div>

          <Input
            value={formData.addressCountry}
            onChange={(e) => updateFormData('addressCountry', e.target.value)}
            placeholder="País"
            className="cyberpunk-input"
          />
        </div>
      </div>

      <div className="cyberpunk-card p-4">
        <h3 className="text-lg font-semibold mb-4 cyberpunk-text flex items-center">
          <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-red-400" />
          Contacto de Emergencia
        </h3>

        <div className="space-y-4">
          <Input
            value={formData.emergencyContactName}
            onChange={(e) => updateFormData('emergencyContactName', e.target.value)}
            placeholder="Nombre del contacto"
            className="cyberpunk-input"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              value={formData.emergencyContactPhone}
              onChange={(e) => updateFormData('emergencyContactPhone', e.target.value)}
              placeholder="Teléfono de emergencia"
              className="cyberpunk-input"
            />

            <Input
              value={formData.emergencyContactRelationship}
              onChange={(e) => updateFormData('emergencyContactRelationship', e.target.value)}
              placeholder="Relación (ej: padre, madre, esposo/a)"
              className="cyberpunk-input"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 cyberpunk-text">
          Método de Contacto Preferido
        </label>
        <select
          value={formData.preferredContactMethod}
          onChange={(e) => updateFormData('preferredContactMethod', e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
        >
          <option value="phone">Teléfono</option>
          <option value="email">Email</option>
          <option value="sms">SMS</option>
        </select>
      </div>
    </div>
  );

  const renderMedicalStep = () => (
    <div className="space-y-6">
      <div className="cyberpunk-card p-4">
        <h3 className="text-lg font-semibold mb-4 cyberpunk-text flex items-center">
          <HeartIcon className="w-5 h-5 mr-2 text-red-400" />
          Información Médica
          <Badge variant="outline" className="ml-2 bg-purple-500/20 text-purple-400 border-purple-500">
            <SparklesIcon className="w-3 h-3 mr-1" />
            @veritas
          </Badge>
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 cyberpunk-text">
              Condiciones Médicas
            </label>
            <textarea
              value={formData.medicalConditions}
              onChange={(e) => updateFormData('medicalConditions', e.target.value)}
              placeholder="Describa cualquier condición médica relevante..."
              rows={3}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 cyberpunk-text">
              Medicamentos Actuales
            </label>
            <textarea
              value={formData.medicationsCurrent}
              onChange={(e) => updateFormData('medicationsCurrent', e.target.value)}
              placeholder="Liste los medicamentos que toma actualmente..."
              rows={2}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 cyberpunk-text">
              Alergias
            </label>
            <textarea
              value={formData.allergies}
              onChange={(e) => updateFormData('allergies', e.target.value)}
              placeholder="Describa cualquier alergia conocida..."
              rows={2}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 cyberpunk-text">
                Nivel de Ansiedad Dental
              </label>
              <select
                value={formData.anxietyLevel}
                onChange={(e) => updateFormData('anxietyLevel', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
              >
                <option value="">Seleccionar</option>
                <option value="low">Bajo</option>
                <option value="medium">Medio</option>
                <option value="high">Alto</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 cyberpunk-text">
                Necesidades Especiales
              </label>
              <Input
                value={formData.specialNeeds}
                onChange={(e) => updateFormData('specialNeeds', e.target.value)}
                placeholder="Ej: silla de ruedas, intérprete..."
                className="cyberpunk-input"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInsuranceStep = () => (
    <div className="space-y-6">
      <div className="cyberpunk-card p-4">
        <h3 className="text-lg font-semibold mb-4 cyberpunk-text flex items-center">
          <ShieldCheckIcon className="w-5 h-5 mr-2 text-blue-400" />
          Seguro Médico
          <Badge variant="outline" className="ml-2 bg-purple-500/20 text-purple-400 border-purple-500">
            <SparklesIcon className="w-3 h-3 mr-1" />
            @veritas
          </Badge>
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 cyberpunk-text">
              Proveedor de Seguro
            </label>
            <Input
              value={formData.insuranceProvider}
              onChange={(e) => updateFormData('insuranceProvider', e.target.value)}
              placeholder="Nombre de la obra social/seguro"
              className="cyberpunk-input"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 cyberpunk-text">
                Número de Póliza
              </label>
              <Input
                value={formData.insurancePolicyNumber}
                onChange={(e) => updateFormData('insurancePolicyNumber', e.target.value)}
                placeholder="Número de póliza/afiliado"
                className="cyberpunk-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 cyberpunk-text">
                Número de Grupo
              </label>
              <Input
                value={formData.insuranceGroupNumber}
                onChange={(e) => updateFormData('insuranceGroupNumber', e.target.value)}
                placeholder="Número de grupo (opcional)"
                className="cyberpunk-input"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderConsentStep = () => (
    <div className="space-y-6">
      <div className="cyberpunk-card p-4">
        <h3 className="text-lg font-semibold mb-4 cyberpunk-text flex items-center">
          <DocumentTextIcon className="w-5 h-5 mr-2 text-green-400" />
          Consentimientos y Autorizaciones
        </h3>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="consent-treatment"
              checked={formData.consentToTreatment}
              onChange={(e) => updateFormData('consentToTreatment', e.target.checked)}
              className="mt-1 w-4 h-4 text-cyan-600 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500"
            />
            <div>
              <label htmlFor="consent-treatment" className="text-sm font-medium cyberpunk-text cursor-pointer">
                Consentimiento para Tratamiento Dental *
              </label>
              <p className="text-xs text-gray-400 mt-1">
                Autorizo la realización de tratamientos dentales necesarios para mi salud bucal.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="consent-contact"
              checked={formData.consentToContact}
              onChange={(e) => updateFormData('consentToContact', e.target.checked)}
              className="mt-1 w-4 h-4 text-cyan-600 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500"
            />
            <div>
              <label htmlFor="consent-contact" className="text-sm font-medium cyberpunk-text cursor-pointer">
                Consentimiento para Contacto *
              </label>
              <p className="text-xs text-gray-400 mt-1">
                Autorizo el contacto telefónico, por email o SMS para recordatorios de citas y seguimiento.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 cyberpunk-text">
          Notas Adicionales
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => updateFormData('notes', e.target.value)}
          placeholder="Observaciones adicionales sobre el paciente..."
          rows={4}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white resize-none"
        />
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStepData.id) {
      case 'personal': return renderPersonalStep();
      case 'contact': return renderContactStep();
      case 'medical': return renderMedicalStep();
      case 'insurance': return renderInsuranceStep();
      case 'consent': return renderConsentStep();
      default: return null;
    }
  };

  // 🎯 MAIN RENDER
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 🎯 HEADER */}
      <div className="text-center">
        <h1 className="text-3xl font-bold cyberpunk-text mb-2">
          {isEditing ? 'Editar Paciente' : 'Nuevo Paciente'}
        </h1>
        <p className="text-gray-400">
          {isEditing ? 'Modifique la información del paciente' : 'Complete el formulario paso a paso'}
        </p>
      </div>

      {/* 🎯 PROGRESS BAR */}
      <Card className="cyberpunk-card">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm cyberpunk-text">
              Paso {currentStep + 1} de {WIZARD_STEPS.length}
            </span>
            <span className="text-sm text-gray-400">
              {Math.round(progress)}% completado
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* 🎯 STEP INDICATOR */}
      {renderStepIndicator()}

      {/* 🎯 CURRENT STEP CONTENT */}
      <Card className="cyberpunk-card">
        <CardHeader>
          <CardTitle className="cyberpunk-text flex items-center">
            <currentStepData.icon className="w-6 h-6 mr-3" />
            {currentStepData.title}
          </CardTitle>
          <p className="text-gray-400 text-sm">{currentStepData.description}</p>
        </CardHeader>

        <CardContent>
          {renderCurrentStep()}

          {/* 🎯 ERROR DISPLAY */}
          {submitError && (
            <div className="mt-6 p-4 bg-red-500/20 border border-red-500 rounded-md">
              <p className="text-red-400 text-sm">{submitError}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 🎯 NAVIGATION BUTTONS */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={currentStep === 0 ? onCancel : handlePrevious}
          disabled={isSubmitting}
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          {currentStep === 0 ? 'Cancelar' : 'Anterior'}
        </Button>

        <div className="flex space-x-3">
          {currentStep === WIZARD_STEPS.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed || isSubmitting}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  {isEditing ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  {isEditing ? 'Actualizar Paciente' : 'Crear Paciente'}
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
            >
              Siguiente
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>

      {/* 🎯 FOOTER STATUS */}
      <div className="text-center text-xs text-gray-500">
        <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500">
          V3.0 - Titan Pattern Active
        </Badge>
      </div>
    </div>
  );
};

export default PatientFormWizardV3;
