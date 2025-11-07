import React, { useState, useEffect } from 'react';

// Tipos para el modal GraphQL
interface PatientFormData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  consentToTreatment: boolean;
  consentToContact: boolean;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  consentToTreatment: boolean;
  consentToContact: boolean;
  isActive: boolean;
}

interface PatientFormModalGraphQLProps {
  patient?: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: PatientFormData) => void;
  loading?: boolean;
}

const PatientFormModalGraphQL: React.FC<PatientFormModalGraphQLProps> = ({
  patient,
  isOpen,
  onClose,
  onSave,
  loading = false
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state - SIMPLIFIED VERSION
  const [formData, setFormData] = useState<PatientFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    consentToTreatment: true, // Required field
    consentToContact: false
  });

  // Initialize form with patient data
  useEffect(() => {
    if (patient) {
      setFormData({
        firstName: patient.firstName || '',
        lastName: patient.lastName || '',
        email: patient.email || '',
        phone: patient.phone || '',
        consentToTreatment: patient.consentToTreatment,
        consentToContact: patient.consentToContact || false
      });
    } else {
      // Reset form for new patient
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        consentToTreatment: true,
        consentToContact: false
      });
    }
  }, [patient]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setFormData(prev => ({
      ...prev,
      [name]: checked !== undefined ? checked : value
    }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate current step - SIMPLIFIED
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0: // Basic Information
        if (!formData.firstName.trim()) newErrors.firstName = 'Nombre es requerido';
        if (!formData.lastName.trim()) newErrors.lastName = 'Apellido es requerido';
        if (!formData.email?.trim()) {
          newErrors.email = 'Email es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Email no es válido';
        }
        if (!formData.phone?.trim()) newErrors.phone = 'Teléfono es requerido';
        break;

      case 1: // Consent
        if (!formData.consentToTreatment) newErrors.consentToTreatment = 'Debe aceptar el consentimiento de tratamiento';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    console.log('📝 SIMPLIFIED FORM - Submitting data:', formData);
    console.log('📝 SIMPLIFIED FORM - Form data keys:', Object.keys(formData));
    console.log('📝 SIMPLIFIED FORM - Form data values:', Object.values(formData));
    console.log('📝 SIMPLIFIED FORM - Calling onSave with:', formData);

    try {
      onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving patient:', error);
    }
  };

  // Navigation - SIMPLIFIED
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 1)); // Max step is 1 now
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  if (!isOpen) return null;

  const steps = [
    { title: 'Información Básica', icon: '👤' },
    { title: 'Consentimiento', icon: '✍️' }
  ];

  // DEBUG LOGS - FORM SIMPLIFIED
  console.log('🔥 PatientFormModalGraphQL - FORM SIMPLIFIED LOADED');
  console.log('🔥 Steps array:', steps);
  console.log('🔥 Current step:', currentStep);
  console.log('🔥 Form data keys:', Object.keys(formData));

  const isLoading = loading;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-primary-500 text-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              🦷 {patient ? 'Editar' : 'Nuevo'} Paciente (GraphQL) - SIMPLIFICADO
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center mt-6 space-x-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium ${
                    index <= currentStep
                      ? 'bg-white text-primary-500'
                      : 'bg-primary-400 text-white'
                  }`}
                >
                  <span>{step.icon}</span>
                </div>
                <div className="ml-2 hidden sm:block">
                  <p className={`text-sm ${index <= currentStep ? 'text-white' : 'text-primary-200'}`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-4 ${index < currentStep ? 'bg-white' : 'bg-primary-400'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Error Message */}
          {Object.keys(errors).length > 0 && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">Por favor corrija los errores antes de continuar.</p>
            </div>
          )}

          {/* Step 0: Basic Information */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">👤 Información Básica</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.firstName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Nombre del paciente"
                  />
                  {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.lastName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Apellido del paciente"
                  />
                  {errors.lastName && <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="email@ejemplo.com"
                  />
                  {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="+54 261 123-4567"
                  />
                  {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Consent */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">✍️ Consentimiento</h3>

              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Consentimiento de Tratamiento *</h4>
                  <p className="text-sm text-blue-700 mb-4">
                    Al marcar esta casilla, el paciente consiente expresamente en recibir tratamientos odontológicos
                    y autoriza el uso de sus datos personales para fines médicos.
                  </p>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="consentToTreatment"
                      checked={formData.consentToTreatment}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-blue-800">
                      Acepto el consentimiento de tratamiento médico
                    </label>
                  </div>
                  {errors.consentToTreatment && <p className="text-xs text-red-600 mt-1">{errors.consentToTreatment}</p>}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Consentimiento de Contacto</h4>
                  <p className="text-sm text-gray-700 mb-4">
                    Opcional: Autorizo el contacto por email o teléfono para recordatorios de citas.
                  </p>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="consentToContact"
                      checked={formData.consentToContact}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-800">
                      Acepto ser contactado para recordatorios
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
          <div className="flex space-x-3">
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← Anterior
              </button>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                onClick={nextStep}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Siguiente →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-success-500 hover:bg-success-600 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  <>
                    💾 {patient ? 'Actualizar' : 'Crear'} Paciente
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientFormModalGraphQL;
