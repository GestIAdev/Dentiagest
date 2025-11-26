import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import { 
  CREATE_PATIENT, 
  UPDATE_PATIENT, 
  GET_PATIENTS,
  PatientInput,
  UpdatePatientInput 
} from '../../graphql/queries/patients';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import toast from 'react-hot-toast';

// 🎯 DENSITY-FIRST DESIGN - No más scroll vertical innecesario

interface PatientFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  phone_secondary?: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other' | '';
  
  // Address
  address_street: string;
  address_city: string;
  address_state: string;
  address_postal_code: string;
  address_country: string;
  
  // Emergency - FIXED: No más JSON horror
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  
  // Medical
  blood_type?: string;
  allergies?: string;
  medical_conditions?: string;
  medications_current?: string;
  
  // Insurance
  insurance_provider?: string;
  insurance_number?: string;
  dental_insurance_info?: string;
  insurance_status?: 'no_insurance' | 'private' | 'public' | 'mixed' | 'unknown';
  previous_dentist?: string;
  dental_anxiety_level?: 'low' | 'medium' | 'high';
  preferred_appointment_time?: 'morning' | 'afternoon' | 'evening';
  
  // Consent
  consent_treatment: boolean;
  consent_marketing: boolean;
  consent_data_sharing: boolean;
  
  notes?: string;
  is_active: boolean;
}

interface PatientFormSheetProps {
  patient?: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const PatientFormSheet: React.FC<PatientFormSheetProps> = ({
  patient,
  isOpen,
  onClose,
  onSave
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('general');
  
  // 🔥 GRAPHQL MUTATIONS - No más REST
  const [createPatient] = useMutation(CREATE_PATIENT, {
    refetchQueries: ['GetPatients'],  // 🎯 Refetch by query name = matches ALL variable combinations
    awaitRefetchQueries: true,  // Wait for refetch before calling onCompleted
    onCompleted: () => {
      toast.success('✅ Paciente creado exitosamente');
      onSave();
      onClose();
    },
    onError: (error) => {
      console.error('❌ Error creating patient:', error);
      toast.error(`❌ Error: ${error.message}`);
      setErrors({ submit: error.message });
    }
  });

  const [updatePatient] = useMutation(UPDATE_PATIENT, {
    refetchQueries: ['GetPatients'],  // 🎯 Refetch by query name = matches ALL variable combinations
    awaitRefetchQueries: true,  // Wait for refetch before calling onCompleted
    onCompleted: () => {
      toast.success('✅ Paciente actualizado exitosamente');
      onSave();
      onClose();
    },
    onError: (error) => {
      console.error('❌ Error updating patient:', error);
      toast.error(`❌ Error: ${error.message}`);
      setErrors({ submit: error.message });
    }
  });
  
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
    insurance_status: 'no_insurance',
    previous_dentist: '',
    dental_anxiety_level: 'low',
    preferred_appointment_time: 'morning',
    consent_treatment: false,
    consent_marketing: false,
    consent_data_sharing: false,
    notes: '',
    is_active: true
  });

  // Initialize from patient data
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
        consent_treatment: patient.consent_treatment || false,
        consent_marketing: patient.consent_marketing || false,
        consent_data_sharing: patient.consent_data_sharing || false,
        notes: patient.notes || '',
        is_active: patient.is_active ?? true
      });
    } else {
      // Reset for new patient
      setFormData({
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
        insurance_status: 'no_insurance',
        previous_dentist: '',
        dental_anxiety_level: 'low',
        preferred_appointment_time: 'morning',
        consent_treatment: false,
        consent_marketing: false,
        consent_data_sharing: false,
        notes: '',
        is_active: true
      });
    }
  }, [patient, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) newErrors.first_name = 'Nombre requerido';
    if (!formData.last_name.trim()) newErrors.last_name = 'Apellido requerido';
    if (!formData.email.trim()) {
      newErrors.email = 'Email requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Teléfono requerido';
    if (!formData.consent_treatment) newErrors.consent_treatment = 'Debe aceptar el consentimiento';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setActiveTab('general'); // Jump to first tab if validation fails
      return;
    }

    setIsLoading(true);
    setErrors({});
    
    try {
      // 🔥 TRANSFORM TO GRAPHQL INPUT (usando solo campos disponibles en schema)
      const input: PatientInput = {
        firstName: formData.first_name,
        lastName: formData.last_name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        dateOfBirth: formData.date_of_birth || undefined,
        
        // Address (concatenado en un solo string por ahora)
        address: [
          formData.address_street,
          formData.address_city,
          formData.address_state,
          formData.address_postal_code,
          formData.address_country
        ].filter(Boolean).join(', ') || undefined,
        
        // 🔥 EMERGENCY CONTACT - Campos separados (NO JSON)
        emergencyContactName: formData.emergency_contact_name || undefined,
        emergencyContactPhone: formData.emergency_contact_phone || undefined,
        emergencyContactRelationship: formData.emergency_contact_relationship || undefined,
        
        // Insurance
        insuranceProvider: formData.insurance_provider || undefined,
        policyNumber: formData.insurance_number || undefined
      };

      if (patient) {
        // UPDATE
        await updatePatient({
          variables: {
            id: patient.id,
            input: input as UpdatePatientInput
          }
        });
      } else {
        // CREATE
        await createPatient({
          variables: { input }
        });
      }
    } catch (error: any) {
      console.error('❌ Error in handleSubmit:', error);
      // Error handling is done in mutation onError
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[800px] sm:max-w-[800px] overflow-y-auto bg-slate-900 border-l border-cyan-500/20">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold text-primary">
            🦷 {patient ? 'Editar' : 'Nuevo'} Paciente
          </SheetTitle>
          <SheetDescription>
            {patient ? 'Actualiza los datos del paciente' : 'Complete los datos del nuevo paciente'}
          </SheetDescription>
        </SheetHeader>

        {errors.submit && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{errors.submit}</p>
          </div>
        )}

        {/* 🎯 TABS NAVIGATION - No más wizard vertical */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">👤 General</TabsTrigger>
            <TabsTrigger value="contacto">📍 Contacto</TabsTrigger>
            <TabsTrigger value="medico">🏥 Médico</TabsTrigger>
            <TabsTrigger value="consent">✍️ Consentimiento</TabsTrigger>
          </TabsList>

          {/* TAB 1: INFORMACIÓN GENERAL */}
          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Nombre + Apellido - MISMO ROW */}
              <div>
                <Label htmlFor="first_name">Nombre *</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className={errors.first_name ? 'border-destructive' : ''}
                />
                {errors.first_name && <p className="text-xs text-destructive mt-1">{errors.first_name}</p>}
              </div>

              <div>
                <Label htmlFor="last_name">Apellidos *</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className={errors.last_name ? 'border-destructive' : ''}
                />
                {errors.last_name && <p className="text-xs text-destructive mt-1">{errors.last_name}</p>}
              </div>

              {/* Email + Teléfono - MISMO ROW */}
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
              </div>

              <div>
                <Label htmlFor="phone">Teléfono *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={errors.phone ? 'border-destructive' : ''}
                  placeholder="+54 261 123-4567"
                />
                {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
              </div>

              {/* Teléfono Secundario + Fecha Nacimiento */}
              <div>
                <Label htmlFor="phone_secondary">Teléfono Secundario</Label>
                <Input
                  id="phone_secondary"
                  name="phone_secondary"
                  type="tel"
                  value={formData.phone_secondary}
                  onChange={handleInputChange}
                  placeholder="+54 261 987-6543"
                />
              </div>

              <div>
                <Label htmlFor="date_of_birth">Fecha de Nacimiento</Label>
                <Input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                />
              </div>

              {/* Género + Tipo de Sangre */}
              <div>
                <Label htmlFor="gender">Género</Label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Seleccionar...</option>
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <div>
                <Label htmlFor="blood_type">Tipo de Sangre</Label>
                <select
                  id="blood_type"
                  name="blood_type"
                  value={formData.blood_type}
                  onChange={handleInputChange}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
          </TabsContent>

          {/* TAB 2: CONTACTO (Dirección + Emergencia) */}
          <TabsContent value="contacto" className="space-y-6 mt-4">
            {/* DIRECCIÓN */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">📍 Dirección</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="address_street">Calle y Número</Label>
                  <Input
                    id="address_street"
                    name="address_street"
                    value={formData.address_street}
                    onChange={handleInputChange}
                    placeholder="Ej: San Martín 1234"
                  />
                </div>

                <div>
                  <Label htmlFor="address_city">Ciudad</Label>
                  <Input
                    id="address_city"
                    name="address_city"
                    value={formData.address_city}
                    onChange={handleInputChange}
                    placeholder="Ej: Mendoza"
                  />
                </div>

                <div>
                  <Label htmlFor="address_state">Provincia</Label>
                  <Input
                    id="address_state"
                    name="address_state"
                    value={formData.address_state}
                    onChange={handleInputChange}
                    placeholder="Ej: Mendoza"
                  />
                </div>

                <div>
                  <Label htmlFor="address_postal_code">Código Postal</Label>
                  <Input
                    id="address_postal_code"
                    name="address_postal_code"
                    value={formData.address_postal_code}
                    onChange={handleInputChange}
                    placeholder="Ej: 5500"
                  />
                </div>

                <div>
                  <Label htmlFor="address_country">País</Label>
                  <Input
                    id="address_country"
                    name="address_country"
                    value={formData.address_country}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* CONTACTO DE EMERGENCIA - FIXED: No más JSON horror */}
            <div className="space-y-4 bg-destructive/5 p-4 rounded-lg border border-destructive/20">
              <h3 className="text-sm font-semibold text-foreground">🚨 Contacto de Emergencia</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="emergency_contact_name">Nombre Contacto</Label>
                  <Input
                    id="emergency_contact_name"
                    name="emergency_contact_name"
                    value={formData.emergency_contact_name}
                    onChange={handleInputChange}
                    placeholder="Nombre completo"
                  />
                </div>

                <div>
                  <Label htmlFor="emergency_contact_phone">Teléfono Contacto</Label>
                  <Input
                    id="emergency_contact_phone"
                    name="emergency_contact_phone"
                    type="tel"
                    value={formData.emergency_contact_phone}
                    onChange={handleInputChange}
                    placeholder="+54 261 123-4567"
                  />
                </div>

                <div>
                  <Label htmlFor="emergency_contact_relationship">Relación</Label>
                  <select
                    id="emergency_contact_relationship"
                    name="emergency_contact_relationship"
                    value={formData.emergency_contact_relationship}
                    onChange={handleInputChange}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
          </TabsContent>

          {/* TAB 3: INFORMACIÓN MÉDICA */}
          <TabsContent value="medico" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Alergias + Condiciones (Full Width) */}
              <div className="col-span-2">
                <Label htmlFor="allergies">Alergias</Label>
                <textarea
                  id="allergies"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleInputChange}
                  rows={2}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Describe alergias conocidas..."
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="medical_conditions">Condiciones Médicas</Label>
                <textarea
                  id="medical_conditions"
                  name="medical_conditions"
                  value={formData.medical_conditions}
                  onChange={handleInputChange}
                  rows={2}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Diabetes, hipertensión, etc..."
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="medications_current">Medicación Actual</Label>
                <textarea
                  id="medications_current"
                  name="medications_current"
                  value={formData.medications_current}
                  onChange={handleInputChange}
                  rows={2}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Medicamentos actuales..."
                />
              </div>

              {/* Seguro Médico */}
              <div>
                <Label htmlFor="insurance_provider">Obra Social/Seguro</Label>
                <Input
                  id="insurance_provider"
                  name="insurance_provider"
                  value={formData.insurance_provider}
                  onChange={handleInputChange}
                  placeholder="OSDE, Swiss Medical..."
                />
              </div>

              <div>
                <Label htmlFor="insurance_number">Número de Afiliado</Label>
                <Input
                  id="insurance_number"
                  name="insurance_number"
                  value={formData.insurance_number}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="insurance_status">Estado del Seguro</Label>
                <select
                  id="insurance_status"
                  name="insurance_status"
                  value={formData.insurance_status}
                  onChange={handleInputChange}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="no_insurance">Sin Seguro</option>
                  <option value="private">Privado</option>
                  <option value="public">Público</option>
                  <option value="mixed">Mixto</option>
                  <option value="unknown">No Especificado</option>
                </select>
              </div>

              <div>
                <Label htmlFor="previous_dentist">Dentista Anterior</Label>
                <Input
                  id="previous_dentist"
                  name="previous_dentist"
                  value={formData.previous_dentist}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="dental_anxiety_level">Nivel de Ansiedad Dental</Label>
                <select
                  id="dental_anxiety_level"
                  name="dental_anxiety_level"
                  value={formData.dental_anxiety_level}
                  onChange={handleInputChange}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="low">Bajo</option>
                  <option value="medium">Medio</option>
                  <option value="high">Alto</option>
                </select>
              </div>

              <div>
                <Label htmlFor="preferred_appointment_time">Horario Preferido</Label>
                <select
                  id="preferred_appointment_time"
                  name="preferred_appointment_time"
                  value={formData.preferred_appointment_time}
                  onChange={handleInputChange}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="morning">Mañana (8-12h)</option>
                  <option value="afternoon">Tarde (12-18h)</option>
                  <option value="evening">Noche (18-21h)</option>
                </select>
              </div>
            </div>
          </TabsContent>

          {/* TAB 4: CONSENTIMIENTOS */}
          <TabsContent value="consent" className="space-y-6 mt-4">
            <div className="space-y-4">
              {/* Consent Treatment */}
              <div className="flex items-start space-x-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <input
                  type="checkbox"
                  id="consent_treatment"
                  name="consent_treatment"
                  checked={formData.consent_treatment}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <div className="flex-1">
                  <Label htmlFor="consent_treatment" className="font-semibold text-foreground">
                    Consentimiento de Tratamiento *
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Autorizo al equipo médico a realizar tratamientos dentales necesarios.
                  </p>
                  {errors.consent_treatment && (
                    <p className="text-xs text-destructive mt-1">{errors.consent_treatment}</p>
                  )}
                </div>
              </div>

              {/* Consent Marketing */}
              <div className="flex items-start space-x-3 p-4 bg-secondary/5 rounded-lg border border-border">
                <input
                  type="checkbox"
                  id="consent_marketing"
                  name="consent_marketing"
                  checked={formData.consent_marketing}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <div className="flex-1">
                  <Label htmlFor="consent_marketing" className="font-semibold text-foreground">
                    Comunicaciones de Marketing
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Acepto recibir promociones y comunicaciones por email/SMS.
                  </p>
                </div>
              </div>

              {/* Consent Data Sharing */}
              <div className="flex items-start space-x-3 p-4 bg-secondary/5 rounded-lg border border-border">
                <input
                  type="checkbox"
                  id="consent_data_sharing"
                  name="consent_data_sharing"
                  checked={formData.consent_data_sharing}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <div className="flex-1">
                  <Label htmlFor="consent_data_sharing" className="font-semibold text-foreground">
                    Compartir Datos con Especialistas
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Autorizo compartir historial en caso de derivación a especialistas.
                  </p>
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Notas Adicionales</Label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Información adicional relevante..."
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <Label htmlFor="is_active" className="text-sm font-medium">
                  Paciente Activo
                </Label>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* FOOTER ACTIONS */}
        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
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
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PatientFormSheet;
