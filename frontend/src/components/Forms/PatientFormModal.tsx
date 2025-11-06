import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import apollo from '../../apollo'; // 🚀 APOLLO NUCLEAR - WEBPACK EXTENSION EXPLICIT!

// PLATFORM_EXTRACTABLE: Universal form validation patterns
interface FormErrors {
  [key: string]: string;
}

// DENTAL_SPECIFIC: Patient form data structure
interface PatientFormData {
  // PLATFORM_CORE: Basic personal information (universal across verticals)
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  phone_secondary?: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other' | '';
  
  // PLATFORM_CORE: Address information (universal)
  address_street: string;
  address_city: string;
  address_state: string;
  address_postal_code: string;
  address_country: string;
  
  // PLATFORM_CORE: Emergency contact (universal safety requirement)
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  
  // DENTAL_SPECIFIC: Medical and dental information
  blood_type?: string;
  allergies?: string;
  medical_conditions?: string;
  medications_current?: string;
  
  // DENTAL_SPECIFIC: Insurance and dental preferences
  insurance_provider?: string;
  insurance_number?: string;
  dental_insurance_info?: string;
  insurance_status?: 'no_insurance' | 'private' | 'public' | 'mixed' | 'unknown';
  previous_dentist?: string;
  dental_anxiety_level?: 'low' | 'medium' | 'high';
  preferred_appointment_time?: 'morning' | 'afternoon' | 'evening';
  
  // DENTAL_SPECIFIC: Communication and consent
  communication_preferences?: string;
  consent_treatment: boolean;
  consent_marketing: boolean;
  consent_data_sharing: boolean;
  
  // PLATFORM_CORE: Administrative fields (universal)
  notes?: string;
  is_active: boolean;
}

interface PatientFormModalProps {
  patient?: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const PatientFormModal: React.FC<PatientFormModalProps> = ({
  patient,
  isOpen,
  onClose,
  onSave
}) => {
  const { state } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  // PLATFORM_EXTRACTABLE: Form state initialization pattern
  const [formData, setFormData] = useState<PatientFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    phone_secondary: '',
    date_of_birth: '',
    gender: '',
    address_street: '',
    address_city: '',
    address_state: '',
    address_postal_code: '',
    address_country: 'Argentina',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    blood_type: '',
    allergies: '',
    medical_conditions: '',
    medications_current: '',
    insurance_provider: '',
    insurance_number: '',
    dental_insurance_info: '',
    insurance_status: 'no_insurance', // Backend enum value
    previous_dentist: '',
    dental_anxiety_level: 'low', // Will be converted to number
    preferred_appointment_time: 'morning',
    communication_preferences: '',
    consent_treatment: false,
    consent_marketing: false,
    consent_data_sharing: false,
    notes: '',
    is_active: true
  });

  // PLATFORM_EXTRACTABLE: Form initialization from existing data
  useEffect(() => {
    if (patient) {
      setFormData({
        first_name: patient.first_name || '',
        last_name: patient.last_name || '',
        email: patient.email || '',
        phone: patient.phone || '',
        phone_secondary: patient.phone_secondary || '',
        date_of_birth: patient.date_of_birth || '',
        gender: patient.gender || '',
        address_street: patient.address_street || '',
        address_city: patient.address_city || '',
        address_state: patient.address_state || '',
        address_postal_code: patient.address_postal_code || '',
        address_country: patient.address_country || 'Argentina',
        emergency_contact_name: patient.emergency_contact_name || '',
        emergency_contact_phone: patient.emergency_contact_phone || '',
        emergency_contact_relationship: patient.emergency_contact_relationship || '',
        blood_type: patient.blood_type || '',
        allergies: patient.allergies || '',
        medical_conditions: patient.medical_conditions || '',
        medications_current: patient.medications_current || '',
        insurance_provider: patient.insurance_provider || '',
        insurance_number: patient.insurance_number || '',
        dental_insurance_info: patient.dental_insurance_info || '',
        insurance_status: patient.insurance_status || 'no_insurance',
        previous_dentist: patient.previous_dentist || '',
        dental_anxiety_level: patient.dental_anxiety_level ? 
          (patient.dental_anxiety_level <= 3 ? 'low' : 
           patient.dental_anxiety_level <= 6 ? 'medium' : 'high') : 'low',
        preferred_appointment_time: patient.preferred_appointment_time || 'morning',
        communication_preferences: patient.communication_preferences || '',
        consent_treatment: patient.consent_treatment || false,
        consent_marketing: patient.consent_marketing || false,
        consent_data_sharing: patient.consent_data_sharing || false,
        notes: patient.notes || '',
        is_active: patient.is_active ?? true
      });
    }
  }, [patient]);

  // PLATFORM_EXTRACTABLE: Generic input handler pattern
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // PLATFORM_EXTRACTABLE: Form validation pattern
  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    switch (step) {
      case 0: // Personal Information
        if (!formData.first_name.trim()) newErrors.first_name = 'Nombre es requerido';
        if (!formData.last_name.trim()) newErrors.last_name = 'Apellido es requerido';
        if (!formData.email.trim()) {
          newErrors.email = 'Email es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Email no es válido';
        }
        if (!formData.phone.trim()) newErrors.phone = 'Teléfono es requerido';
        break;
      
      case 1: // Address & Emergency Contact
        if (!formData.address_street.trim()) newErrors.address_street = 'Dirección es requerida';
        if (!formData.address_city.trim()) newErrors.address_city = 'Ciudad es requerida';
        if (!formData.emergency_contact_name.trim()) newErrors.emergency_contact_name = 'Contacto de emergencia es requerido';
        if (!formData.emergency_contact_phone.trim()) newErrors.emergency_contact_phone = 'Teléfono de emergencia es requerido';
        break;
      
      case 2: // Medical Information
        // All fields optional for medical info
        break;
      
      case 3: // Consent & Final
        if (!formData.consent_treatment) newErrors.consent_treatment = 'Debe aceptar el consentimiento de tratamiento para continuar';
        // Final validation of required fields
        if (!formData.first_name.trim()) newErrors.first_name = 'Nombre es requerido';
        if (!formData.last_name.trim()) newErrors.last_name = 'Apellido es requerido';
        if (!formData.email.trim()) {
          newErrors.email = 'Email es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Email no es válido';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // PLATFORM_EXTRACTABLE: API submission pattern
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);
    try {
      // Transform data to match backend schema
      const transformedData = {
        ...formData,
        // Convert anxiety level string to number (1-10 scale)
        dental_anxiety_level: formData.dental_anxiety_level === 'low' ? 3 :
                             formData.dental_anxiety_level === 'medium' ? 6 : 9,
        // Transform insurance info if provided
        dental_insurance_info: formData.insurance_provider && formData.insurance_number ? {
          provider_name: formData.insurance_provider,
          policy_number: formData.insurance_number,
          additional_info: formData.dental_insurance_info || ''
        } : null,
      };

      // Remove frontend-only fields that don't exist in backend schema
      delete transformedData.insurance_provider;
      delete transformedData.insurance_number;

      // Clean undefined/empty values
      Object.keys(transformedData).forEach(key => {
        if ((transformedData as any)[key] === undefined || (transformedData as any)[key] === '') {
          delete (transformedData as any)[key];
        }
      });

      // console.log('Sending patient data:', transformedData);

      // 🚀 OPERACIÓN APOLLO - Using centralized API service
      // Replaces hardcoded fetch with apollo.patients.create/update()
      // Benefits: V1/V2 switching, error handling, performance monitoring
      const response = patient 
        ? await apollo.patients.update(patient.id, transformedData as any)
        : await apollo.patients.create(transformedData as any);

      if (response) {
        onSave();
        onClose();
      } else {
        console.error('API Error Response:', response);
        console.error('Sent Data:', transformedData);
        
        // Apollo response format - using response.error instead of response.json()
        const errorData = (response as any)?.error || {} as any;
        
        // Show detailed validation errors to user
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const errorMessages = errorData.errors.map((err: any) => 
            `${err.loc?.join('.')} - ${err.msg}`
          ).join('\n');
          setErrors({ submit: `Errores de validación:\n${errorMessages}` });
        } else {
          setErrors({ submit: errorData.detail || 'Error al guardar paciente' });
        }
      }
    } catch (error) {
      console.error('Error saving patient:', error);
      setErrors({ submit: 'Error de conexión. Inténtalo de nuevo.' });
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  if (!isOpen) return null;

  // DENTAL_SPECIFIC: Step configuration for dental patient forms
  const steps = [
    { title: 'Información Personal', icon: '👤' },
    { title: 'Dirección y Contacto', icon: '📍' },
    { title: 'Información Médica', icon: '🏥' },
    { title: 'Consentimientos', icon: '✍️' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-primary-500 text-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              🦷 {patient ? 'Editar' : 'Nuevo'} Paciente
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
          {errors.submit && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{errors.submit}</p>
            </div>
          )}

          {/* Step 0: Personal Information */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">👤 Información Personal</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.first_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Nombre del paciente"
                  />
                  {errors.first_name && <p className="text-xs text-red-600 mt-1">{errors.first_name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.last_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Apellido del paciente"
                  />
                  {errors.last_name && <p className="text-xs text-red-600 mt-1">{errors.last_name}</p>}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono Secundario
                  </label>
                  <input
                    type="tel"
                    name="phone_secondary"
                    value={formData.phone_secondary}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="+54 261 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Género
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="male">Masculino</option>
                    <option value="female">Femenino</option>
                    <option value="other">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Sangre
                  </label>
                  <select
                    name="blood_type"
                    value={formData.blood_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Address & Emergency Contact */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📍 Dirección y Contacto de Emergencia</h3>
              
              {/* Address Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Dirección</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Calle y Número *
                    </label>
                    <input
                      type="text"
                      name="address_street"
                      value={formData.address_street}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.address_street ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Ej: San Martín 1234"
                    />
                    {errors.address_street && <p className="text-xs text-red-600 mt-1">{errors.address_street}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      name="address_city"
                      value={formData.address_city}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.address_city ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Ej: Mendoza"
                    />
                    {errors.address_city && <p className="text-xs text-red-600 mt-1">{errors.address_city}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Provincia/Estado
                    </label>
                    <input
                      type="text"
                      name="address_state"
                      value={formData.address_state}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Ej: Mendoza"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código Postal
                    </label>
                    <input
                      type="text"
                      name="address_postal_code"
                      value={formData.address_postal_code}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Ej: 5500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      País
                    </label>
                    <input
                      type="text"
                      name="address_country"
                      value={formData.address_country}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Argentina"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact Section */}
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">🚨 Contacto de Emergencia</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      name="emergency_contact_name"
                      value={formData.emergency_contact_name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.emergency_contact_name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Nombre del contacto de emergencia"
                    />
                    {errors.emergency_contact_name && <p className="text-xs text-red-600 mt-1">{errors.emergency_contact_name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      name="emergency_contact_phone"
                      value={formData.emergency_contact_phone}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.emergency_contact_phone ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="+54 261 123-4567"
                    />
                    {errors.emergency_contact_phone && <p className="text-xs text-red-600 mt-1">{errors.emergency_contact_phone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Relación
                    </label>
                    <select
                      name="emergency_contact_relationship"
                      value={formData.emergency_contact_relationship}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="spouse">Cónyuge</option>
                      <option value="parent">Padre/Madre</option>
                      <option value="child">Hijo/a</option>
                      <option value="sibling">Hermano/a</option>
                      <option value="friend">Amigo/a</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Continue with other steps... */}
          {/* Step 2: Medical Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🏥 Información Médica y Dental</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alergias
                  </label>
                  <textarea
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Describe cualquier alergia conocida..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condiciones Médicas
                  </label>
                  <textarea
                    name="medical_conditions"
                    value={formData.medical_conditions}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Diabetes, hipertensión, enfermedades cardíacas, etc..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medicaciones Actuales
                  </label>
                  <textarea
                    name="medications_current"
                    value={formData.medications_current}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Lista los medicamentos que toma actualmente..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Obra Social/Seguro
                  </label>
                  <input
                    type="text"
                    name="insurance_provider"
                    value={formData.insurance_provider}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Ej: OSDE, Swiss Medical, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Afiliado
                  </label>
                  <input
                    type="text"
                    name="insurance_number"
                    value={formData.insurance_number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Número de afiliado"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado del Seguro
                  </label>
                  <select
                    name="insurance_status"
                    value={formData.insurance_status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="no_insurance">Sin Seguro</option>
                    <option value="private">Seguro Privado</option>
                    <option value="public">Seguro Público</option>
                    <option value="mixed">Mixto</option>
                    <option value="unknown">No Especificado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dentista Anterior
                  </label>
                  <input
                    type="text"
                    name="previous_dentist"
                    value={formData.previous_dentist}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Nombre del dentista anterior"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nivel de Ansiedad Dental
                  </label>
                  <select
                    name="dental_anxiety_level"
                    value={formData.dental_anxiety_level}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="low">Bajo - Sin problemas</option>
                    <option value="medium">Medio - Algo nervioso</option>
                    <option value="high">Alto - Muy ansioso</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horario Preferido
                  </label>
                  <select
                    name="preferred_appointment_time"
                    value={formData.preferred_appointment_time}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="morning">Mañana (8:00 - 12:00)</option>
                    <option value="afternoon">Tarde (12:00 - 18:00)</option>
                    <option value="evening">Noche (18:00 - 21:00)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Consent & Final */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">✍️ Consentimientos y Finalización</h3>
              
              {/* Consent Checkboxes */}
              <div className="space-y-4">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    name="consent_treatment"
                    checked={formData.consent_treatment}
                    onChange={handleInputChange}
                    className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <div className="ml-3">
                    <label className="text-sm font-medium text-gray-700">
                      Consentimiento de Tratamiento *
                    </label>
                    <p className="text-xs text-gray-500">
                      Autorizo al Dr./Dra. y su equipo a realizar los tratamientos dentales necesarios.
                    </p>
                    {errors.consent_treatment && <p className="text-xs text-red-600 mt-1">{errors.consent_treatment}</p>}
                  </div>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    name="consent_marketing"
                    checked={formData.consent_marketing}
                    onChange={handleInputChange}
                    className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <div className="ml-3">
                    <label className="text-sm font-medium text-gray-700">
                      Comunicaciones de Marketing
                    </label>
                    <p className="text-xs text-gray-500">
                      Acepto recibir promociones y comunicaciones de la clínica por email/SMS.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    name="consent_data_sharing"
                    checked={formData.consent_data_sharing}
                    onChange={handleInputChange}
                    className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <div className="ml-3">
                    <label className="text-sm font-medium text-gray-700">
                      Compartir Datos con Especialistas
                    </label>
                    <p className="text-xs text-gray-500">
                      Autorizo compartir mi historial con especialistas en caso de derivación.
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas Adicionales
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Cualquier información adicional relevante..."
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  Paciente Activo
                </label>
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

export default PatientFormModal;
