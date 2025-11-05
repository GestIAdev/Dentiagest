// 🎯🎸💀 PATIENT MANAGEMENT V3.0 - OLYMPUS RECONSTRUCTION
// Date: September 22, 2025
// Mission: Complete patient management system with Titan Pattern
// Status: V3.0 - Full reconstruction with Zustand + Atomic Components + GraphQL

import React, { useState, useEffect, useMemo } from 'react';

// 🎯 TITAN PATTERN IMPORTS - Core Dependencies
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Badge, Spinner } from '../atoms';
import { createModuleLogger } from '../../utils/logger';
import { useDocumentLogger } from '../../utils/documentLogger';

// 🎯 GRAPHQL OPERATIONS - Apollo Nuclear Integration
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_PATIENTS,
  CREATE_PATIENT,
  UPDATE_PATIENT,
  DELETE_PATIENT
} from '../../graphql/queries/patients';

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

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string;
  phone?: string;
  phoneSecondary?: string;
  dateOfBirth?: string;
  age?: number;
  gender?: string;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressPostalCode?: string;
  addressCountry?: string;
  fullAddress?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  medicalConditions?: string;
  medicationsCurrent?: string;
  allergies?: string;
  anxietyLevel?: string;
  specialNeeds?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceGroupNumber?: string;
  insuranceStatus?: string;
  consentToTreatment?: boolean;
  consentToContact?: boolean;
  preferredContactMethod?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  hasInsurance?: boolean;
  requiresSpecialCare?: boolean;
  
  // ⚡ VERITAS FIELDS - Quantum Truth Verification
  policyNumber_veritas?: VeritasMetadata;
  medicalHistory_veritas?: VeritasMetadata;
}

interface PatientFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phoneSecondary?: string;
  dateOfBirth?: string;
  gender?: string;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressPostalCode?: string;
  addressCountry?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  medicalConditions?: string;
  medicationsCurrent?: string;
  allergies?: string;
  anxietyLevel?: string;
  specialNeeds?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceGroupNumber?: string;
  consentToTreatment?: boolean;
  consentToContact?: boolean;
  preferredContactMethod?: string;
  notes?: string;
}

// 🎯 LOGGER INITIALIZATION
const l = createModuleLogger('PatientManagementV3');

// 🎯 MAIN COMPONENT - PatientManagementV3
const PatientManagementV3: React.FC = () => {
  // 🎯 LOGGER INITIALIZATION - Inside component
  const logger = useDocumentLogger('PatientManagementV3');
  // 🎯 GRAPHQL QUERIES & MUTATIONS
  const { data: patientsData, loading: queryLoading, error: queryError, refetch: refetchPatients } = useQuery(GET_PATIENTS, {
    variables: { filters: {} },
    fetchPolicy: 'cache-and-network'
  });

  const [createPatientMutation] = useMutation(CREATE_PATIENT);
  const [updatePatientMutation] = useMutation(UPDATE_PATIENT);
  const [deletePatientMutation] = useMutation(DELETE_PATIENT);
  // Eliminadas mutaciones no utilizadas de activar/desactivar (usamos updatePatientMutation para is_active)

  // 🎯 STATE MANAGEMENT - Local UI State
  const [activeTab, setActiveTab] = useState<'list' | 'search' | 'create' | 'details'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  // showCreateForm eliminado: navegación controlada por activeTab
  const [storeLoading, setStoreLoading] = useState(false);
  const [storeError, setStoreError] = useState<string | null>(null);
  const [patientForm, setPatientForm] = useState<PatientFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    phoneSecondary: '',
    dateOfBirth: '',
    gender: '',
    addressStreet: '',
    addressCity: '',
    addressState: '',
    addressPostalCode: '',
    addressCountry: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    medicalConditions: '',
    medicationsCurrent: '',
    allergies: '',
    anxietyLevel: '',
    specialNeeds: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
    insuranceGroupNumber: '',
    consentToTreatment: true,
    consentToContact: true,
    preferredContactMethod: 'phone',
    notes: ''
  });

  // 🎯 COMPUTED VALUES - Filtered and Processed Data
  const patients = useMemo(() => patientsData?.patients?.items || [], [patientsData?.patients?.items]);
  const filteredPatients = useMemo(() => {
    if (!patients) return [];

    let filtered = patients;

    if (searchQuery && searchQuery.length >= 2) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((patient: any) =>
        patient.firstName?.toLowerCase().includes(query) ||
        patient.lastName?.toLowerCase().includes(query) ||
        patient.email?.toLowerCase().includes(query) ||
        patient.phone?.includes(query)
      );
    }

    return filtered;
  }, [patients, searchQuery]);

  // 🎯 EFFECTS - Data Synchronization and Logging
  useEffect(() => {
    l.info('PatientManagementV3 initialized', { activeTab, patientCount: filteredPatients.length });
  }, [activeTab, filteredPatients.length]);

  useEffect(() => {
    if (queryError) {
      l.error('Query error detected', queryError);
    }
  }, [queryError]);

  // 🎯 LIFECYCLE LOGGING
  useEffect(() => {
    logger.logMount({ activeTab: 'list', patientCount: 0 });
    return () => logger.logUnmount();
     
  }, []);

  // 🎯 EVENT HANDLERS - User Interactions
  const handleTabChange = (tab: typeof activeTab) => {
    l.debug('Tab changed', { from: activeTab, to: tab });
    logger.logUserInteraction('tab_change', { from: activeTab, to: tab });
    setActiveTab(tab);
    setSelectedPatient(null);
  // showCreateForm eliminado
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    l.debug('Search query updated', { query });
    logger.logUserInteraction('search_query', { query });
  };

  const handlePatientSelect = async (patient: any) => {
    l.info('Patient selected', { patientId: patient.id, patientName: `${patient.firstName} ${patient.lastName}` });
    logger.logUserInteraction('patient_select', { patientId: patient.id, patientName: `${patient.firstName} ${patient.lastName}` });

    // Convert GraphQL format to local format
    const localPatient: Patient = {
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      fullName: `${patient.firstName} ${patient.lastName}`,
      email: patient.email,
      phone: patient.phone,
      phoneSecondary: patient.phoneSecondary,
      dateOfBirth: patient.dateOfBirth,
      age: patient.age,
      gender: patient.gender,
      addressStreet: patient.addressStreet,
      addressCity: patient.addressCity,
      addressState: patient.addressState,
      addressPostalCode: patient.addressPostalCode,
      addressCountry: patient.addressCountry,
      fullAddress: patient.fullAddress,
      emergencyContactName: patient.emergencyContactName,
      emergencyContactPhone: patient.emergencyContactPhone,
      emergencyContactRelationship: patient.emergencyContactRelationship,
      medicalConditions: patient.medicalConditions,
      medicationsCurrent: patient.medicationsCurrent,
      allergies: patient.allergies,
      anxietyLevel: patient.anxietyLevel,
      specialNeeds: patient.specialNeeds,
      insuranceProvider: patient.insuranceProvider,
      insurancePolicyNumber: patient.insurancePolicyNumber,
      insuranceGroupNumber: patient.insuranceGroupNumber,
      insuranceStatus: patient.insuranceStatus,
      consentToTreatment: patient.consentToTreatment,
      consentToContact: patient.consentToContact,
      preferredContactMethod: patient.preferredContactMethod,
      notes: patient.notes,
      isActive: patient.isActive,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
      hasInsurance: !!patient.insuranceProvider,
      requiresSpecialCare: !!patient.specialNeeds,
      
      // ⚡ VERITAS FIELDS - Quantum Truth Verification
      policyNumber_veritas: patient.policyNumber_veritas,
      medicalHistory_veritas: patient.medicalHistory_veritas
    };

    setSelectedPatient(localPatient);
  // currentPatient eliminado
    setActiveTab('details');

    l.info('Patient details loaded successfully', { patientId: patient.id });
  };

  const handleCreatePatient = async () => {
    logger.logUserInteraction('create_patient_attempt', { formData: patientForm });
    if (!patientForm.firstName || !patientForm.lastName || !patientForm.email || !patientForm.phone) {
      l.warn('Patient creation failed - missing required fields');
      setStoreError('Por favor complete todos los campos requeridos');
      return;
    }

    setStoreLoading(true);
    try {
      l.info('Creating new patient', { patientName: `${patientForm.firstName} ${patientForm.lastName}` });

      const patientData = {
        first_name: patientForm.firstName,
        last_name: patientForm.lastName,
        email: patientForm.email,
        phone: patientForm.phone,
        phone_secondary: patientForm.phoneSecondary,
        date_of_birth: patientForm.dateOfBirth,
        gender: patientForm.gender,
        address_street: patientForm.addressStreet,
        address_city: patientForm.addressCity,
        address_state: patientForm.addressState,
        address_postal_code: patientForm.addressPostalCode,
        address_country: patientForm.addressCountry,
        emergency_contact_name: patientForm.emergencyContactName,
        emergency_contact_phone: patientForm.emergencyContactPhone,
        emergency_contact_relationship: patientForm.emergencyContactRelationship,
        medical_conditions: patientForm.medicalConditions,
        medications_current: patientForm.medicationsCurrent,
        allergies: patientForm.allergies,
        anxiety_level: patientForm.anxietyLevel,
        special_needs: patientForm.specialNeeds,
        insurance_provider: patientForm.insuranceProvider,
        insurance_policy_number: patientForm.insurancePolicyNumber,
        insurance_group_number: patientForm.insuranceGroupNumber,
        consent_to_treatment: patientForm.consentToTreatment,
        consent_to_contact: patientForm.consentToContact,
        preferred_contact_method: patientForm.preferredContactMethod,
        notes: patientForm.notes
      };

      await createPatientMutation({
        variables: { input: patientData },
        refetchQueries: [{ query: GET_PATIENTS }]
      });

  l.info('Patient created successfully');
  // showCreateForm eliminado; volvemos a la lista tras crear
  setActiveTab('list');
      resetPatientForm();
    } catch (error: any) {
      l.error && l.error('Patient creation failed', error instanceof Error ? error : new Error(error.message));
      setStoreError('Error al crear el paciente');
    } finally {
      setStoreLoading(false);
    }
  };

  const handleUpdatePatient = async () => {
    if (!selectedPatient) return;
    logger.logUserInteraction('update_patient_attempt', { patientId: selectedPatient.id, formData: patientForm });
    setStoreLoading(true);
    try {
      l.info('Updating patient', { patientId: selectedPatient.id });

      const patientData = {
        first_name: patientForm.firstName,
        last_name: patientForm.lastName,
        email: patientForm.email,
        phone: patientForm.phone,
        phone_secondary: patientForm.phoneSecondary,
        date_of_birth: patientForm.dateOfBirth,
        gender: patientForm.gender,
        address_street: patientForm.addressStreet,
        address_city: patientForm.addressCity,
        address_state: patientForm.addressState,
        address_postal_code: patientForm.addressPostalCode,
        address_country: patientForm.addressCountry,
        emergency_contact_name: patientForm.emergencyContactName,
        emergency_contact_phone: patientForm.emergencyContactPhone,
        emergency_contact_relationship: patientForm.emergencyContactRelationship,
        medical_conditions: patientForm.medicalConditions,
        medications_current: patientForm.medicationsCurrent,
        allergies: patientForm.allergies,
        anxiety_level: patientForm.anxietyLevel,
        special_needs: patientForm.specialNeeds,
        insurance_provider: patientForm.insuranceProvider,
        insurance_policy_number: patientForm.insurancePolicyNumber,
        insurance_group_number: patientForm.insuranceGroupNumber,
        consent_to_treatment: patientForm.consentToTreatment,
        consent_to_contact: patientForm.consentToContact,
        preferred_contact_method: patientForm.preferredContactMethod,
        notes: patientForm.notes,
        is_active: selectedPatient.isActive
      };

      await updatePatientMutation({
        variables: { id: selectedPatient.id, input: patientData },
        refetchQueries: [{ query: GET_PATIENTS }]
      });

      l.info('Patient updated successfully', { patientId: selectedPatient.id });
    } catch (error: any) {
      l.error && l.error('Patient update failed', error instanceof Error ? error : new Error(error.message));
      setStoreError('Error al actualizar el paciente');
    } finally {
      setStoreLoading(false);
    }
  };

  const handleDeletePatient = async (patientId: string) => {
    logger.logUserInteraction('delete_patient_attempt', { patientId });
    if (!window.confirm('¿Está seguro de que desea eliminar este paciente?')) return;

    setStoreLoading(true);
    try {
      l.info('Deleting patient', { patientId });

      await deletePatientMutation({
        variables: { id: patientId },
        refetchQueries: [{ query: GET_PATIENTS }]
      });

      l.info('Patient deleted successfully', { patientId });
      setSelectedPatient(null);
      setActiveTab('list');
    } catch (error: any) {
      l.error && l.error('Patient deletion failed', error instanceof Error ? error : new Error(error.message));
      setStoreError('Error al eliminar el paciente');
    } finally {
      setStoreLoading(false);
    }
  };

  const handleTogglePatientStatus = async (patientId: string, isActive: boolean) => {
    logger.logUserInteraction('toggle_patient_status', { patientId, currentStatus: isActive });
    setStoreLoading(true);
    try {
      l.info('Toggling patient status', { patientId, isActive: !isActive });

      await updatePatientMutation({
        variables: { id: patientId, input: { is_active: !isActive } },
        refetchQueries: [{ query: GET_PATIENTS }]
      });

      l.info('Patient status updated successfully', { patientId, newStatus: !isActive });
    } catch (error: any) {
      l.error && l.error('Patient status toggle failed', error instanceof Error ? error : new Error(error.message));
      setStoreError('Error al cambiar el estado del paciente');
    } finally {
      setStoreLoading(false);
    }
  };

  // 🎯 UTILITY FUNCTIONS
  const resetPatientForm = () => {
    setPatientForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      phoneSecondary: '',
      dateOfBirth: '',
      gender: '',
      addressStreet: '',
      addressCity: '',
      addressState: '',
      addressPostalCode: '',
      addressCountry: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelationship: '',
      medicalConditions: '',
      medicationsCurrent: '',
      allergies: '',
      anxietyLevel: '',
      specialNeeds: '',
      insuranceProvider: '',
      insurancePolicyNumber: '',
      insuranceGroupNumber: '',
      consentToTreatment: true,
      consentToContact: true,
      preferredContactMethod: 'phone',
      notes: ''
    });
  };

  const getStatusBadge = (isActive: boolean) => (
    <Badge variant={isActive ? "default" : "secondary"}>
      {isActive ? 'Activo' : 'Inactivo'}
    </Badge>
  );

  const getVeritasBadge = (veritas?: VeritasMetadata, label?: string) => {
    if (!veritas) return null;
    
    const { verified, confidence, level, error } = veritas;
    
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
    let text = `${label || 'Veritas'}: ${verified ? '✓' : '✗'}`;
    let className = "";
    
    if (verified) {
      if (confidence >= 0.9) {
        variant = "default";
        className = "bg-green-500/20 text-green-400 border-green-500";
      } else if (confidence >= 0.7) {
        variant = "secondary";
        className = "bg-yellow-500/20 text-yellow-400 border-yellow-500";
      } else {
        variant = "outline";
        className = "bg-orange-500/20 text-orange-400 border-orange-500";
      }
    } else {
      variant = "destructive";
      className = "bg-red-500/20 text-red-400 border-red-500";
      text = `${label || 'Veritas'}: Error`;
    }
    
    return (
      <Badge variant={variant} className={`text-xs ${className}`} title={`Confianza: ${(confidence * 100).toFixed(1)}% | Nivel: ${level}${error ? ` | Error: ${error}` : ''}`}>
        {text}
      </Badge>
    );
  };

  const getGenderLabel = (gender?: string) => {
    switch (gender) {
      case 'M': return 'Masculino';
      case 'F': return 'Femenino';
      case 'O': return 'Otro';
      default: return 'No especificado';
    }
  };

  // 🎯 RENDER FUNCTIONS - UI Components
  const renderPatientCard = (patient: any) => (
    <Card key={patient.id} className="cyberpunk-card hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => handlePatientSelect(patient)}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg cyberpunk-text">{patient.firstName} {patient.lastName}</h3>
            <p className="text-sm text-gray-400">{patient.email}</p>
            <p className="text-sm text-gray-400">{patient.phone}</p>
          </div>
          <div className="flex flex-col items-end space-y-1">
            {getStatusBadge(patient.isActive)}
            <div className="flex space-x-1">
              {getVeritasBadge(patient.policyNumber_veritas, 'Póliza')}
              {getVeritasBadge(patient.medicalHistory_veritas, 'Historia')}
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          {patient.age && <p><span className="text-gray-400">Edad:</span> {patient.age} años</p>}
          {patient.gender && <p><span className="text-gray-400">Género:</span> {getGenderLabel(patient.gender)}</p>}
          {patient.insuranceProvider && (
            <p><span className="text-gray-400">Seguro:</span> {patient.insuranceProvider}</p>
          )}
          {patient.specialNeeds && (
            <Badge variant="outline" className="text-xs">Atención Especial</Badge>
          )}
        </div>

        <div className="mt-4 flex justify-between items-center">
          <span className="text-xs text-gray-500">
            Creado: {new Date(patient.createdAt).toLocaleDateString()}
          </span>
          <Button size="sm" variant="outline">
            Ver Detalles
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderPatientListItem = (patient: any) => (
    <div key={patient.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
         onClick={() => handlePatientSelect(patient)}>
      <div className="flex items-center space-x-4">
        <div>
          <h3 className="font-medium">{patient.firstName} {patient.lastName}</h3>
          <p className="text-sm text-gray-400">{patient.email} • {patient.phone}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {getStatusBadge(patient.isActive)}
        <Button size="sm" variant="outline">
          Ver
        </Button>
      </div>
    </div>
  );

  const renderPatientForm = () => (
    <Card className="cyberpunk-card">
      <CardHeader>
        <CardTitle className="cyberpunk-text">
          {selectedPatient ? 'Editar Paciente' : 'Nuevo Paciente'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre *</label>
            <Input
              value={patientForm.firstName}
              onChange={(e) => setPatientForm(prev => ({ ...prev, firstName: e.target.value }))}
              placeholder="Nombre"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Apellido *</label>
            <Input
              value={patientForm.lastName}
              onChange={(e) => setPatientForm(prev => ({ ...prev, lastName: e.target.value }))}
              placeholder="Apellido"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <Input
              type="email"
              value={patientForm.email}
              onChange={(e) => setPatientForm(prev => ({ ...prev, email: e.target.value }))}
              placeholder="email@ejemplo.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Teléfono *</label>
            <Input
              value={patientForm.phone}
              onChange={(e) => setPatientForm(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+1234567890"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Fecha de Nacimiento</label>
            <Input
              type="date"
              value={patientForm.dateOfBirth}
              onChange={(e) => setPatientForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Género</label>
            <select
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
              value={patientForm.gender}
              onChange={(e) => setPatientForm(prev => ({ ...prev, gender: e.target.value }))}
            >
              <option value="">Seleccionar</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="O">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Método de Contacto</label>
            <select
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
              value={patientForm.preferredContactMethod}
              onChange={(e) => setPatientForm(prev => ({ ...prev, preferredContactMethod: e.target.value }))}
            >
              <option value="phone">Teléfono</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notas</label>
          <textarea
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
            rows={3}
            value={patientForm.notes}
            onChange={(e) => setPatientForm(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Notas adicionales..."
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            variant="outline"
            onClick={() => {
              // showCreateForm eliminado; volvemos a la lista
              setActiveTab('list');
              setSelectedPatient(null);
              resetPatientForm();
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={selectedPatient ? handleUpdatePatient : handleCreatePatient}
            disabled={storeLoading}
          >
            {storeLoading ? <Spinner size="sm" /> : null}
            {selectedPatient ? 'Actualizar' : 'Crear'} Paciente
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderPatientDetails = () => {
    if (!selectedPatient) return null;

    const patient = selectedPatient;

    return (
      <div className="space-y-6">
        <Card className="cyberpunk-card">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="cyberpunk-text text-2xl">{patient.firstName} {patient.lastName}</CardTitle>
                <div className="flex items-center space-x-2 mt-2">
                  {getStatusBadge(patient.isActive)}
                  {patient.requiresSpecialCare && (
                    <Badge variant="outline">Atención Especial</Badge>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTogglePatientStatus(patient.id, patient.isActive)}
                >
                  {patient.isActive ? 'Desactivar' : 'Activar'}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeletePatient(patient.id)}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold cyberpunk-text">Información Personal</h3>
                <div className="space-y-2">
                  <p><span className="text-gray-400">Email:</span> {patient.email}</p>
                  <p><span className="text-gray-400">Teléfono:</span> {patient.phone}</p>
                  {patient.phoneSecondary && (
                    <p><span className="text-gray-400">Teléfono Secundario:</span> {patient.phoneSecondary}</p>
                  )}
                  {patient.age && <p><span className="text-gray-400">Edad:</span> {patient.age} años</p>}
                  {patient.gender && <p><span className="text-gray-400">Género:</span> {getGenderLabel(patient.gender)}</p>}
                  {patient.dateOfBirth && (
                    <p><span className="text-gray-400">Fecha de Nacimiento:</span> {new Date(patient.dateOfBirth).toLocaleDateString()}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold cyberpunk-text">Dirección</h3>
                <div className="space-y-2">
                  {patient.fullAddress ? (
                    <p>{patient.fullAddress}</p>
                  ) : (
                    <p className="text-gray-400">No especificada</p>
                  )}
                </div>
              </div>
            </div>

            {patient.medicalConditions && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold cyberpunk-text">Información Médica</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  {patient.medicalConditions && (
                    <div className="flex items-center space-x-2">
                      <p className="text-gray-400">Condiciones Médicas:</p>
                      <p>{patient.medicalConditions}</p>
                      {getVeritasBadge(patient.medicalHistory_veritas)}
                    </div>
                  )}
                  {patient.medicationsCurrent && (
                    <div>
                      <p className="text-gray-400">Medicamentos:</p>
                      <p>{patient.medicationsCurrent}</p>
                    </div>
                  )}
                  {patient.allergies && (
                    <div>
                      <p className="text-gray-400">Alergias:</p>
                      <p>{patient.allergies}</p>
                    </div>
                  )}
                  {patient.anxietyLevel && (
                    <div>
                      <p className="text-gray-400">Nivel de Ansiedad:</p>
                      <p>{patient.anxietyLevel}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {patient.insuranceProvider && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold cyberpunk-text">Seguro Médico</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <p className="text-gray-400">Proveedor:</p>
                    <p>{patient.insuranceProvider}</p>
                  </div>
                  {patient.insurancePolicyNumber && (
                    <div className="flex items-center space-x-2">
                      <p className="text-gray-400">Número de Póliza:</p>
                      <p>{patient.insurancePolicyNumber}</p>
                      {getVeritasBadge(patient.policyNumber_veritas)}
                    </div>
                  )}
                  {patient.insuranceStatus && (
                    <div>
                      <p className="text-gray-400">Estado:</p>
                      <p>{patient.insuranceStatus}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {patient.notes && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold cyberpunk-text">Notas</h3>
                <p className="mt-2">{patient.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // 🎯 LOADING AND ERROR STATES
  if (queryLoading || storeLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-400">Cargando pacientes...</p>
        </div>
      </div>
    );
  }

  if (queryError || storeError) {
    return (
      <div className="flex justify-center items-center h-64">
        <Card className="cyberpunk-card max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-400 mb-4">Error al cargar los pacientes</p>
            <p className="text-sm text-gray-400 mb-4">
              {queryError?.message || storeError}
            </p>
            <Button onClick={() => refetchPatients()}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 🎯 MAIN RENDER - Component Structure
  return (
    <div className="space-y-6">
      {/* 🎯 HEADER - Navigation and Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold cyberpunk-text">Gestión de Pacientes</h1>
          <p className="text-gray-400 mt-1">Sistema completo de administración de pacientes</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeTab === 'list' ? 'default' : 'outline'}
            onClick={() => handleTabChange('list')}
          >
            Lista
          </Button>
          <Button
            variant={activeTab === 'search' ? 'default' : 'outline'}
            onClick={() => handleTabChange('search')}
          >
            Buscar
          </Button>
          <Button
            variant={activeTab === 'create' ? 'default' : 'outline'}
            onClick={() => handleTabChange('create')}
          >
            Nuevo Paciente
          </Button>
        </div>
      </div>

      {/* 🎯 SEARCH BAR - Global Search */}
      {(activeTab === 'list' || activeTab === 'search') && (
        <Card className="cyberpunk-card">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por nombre, email o teléfono..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  Lista
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 🎯 CONTENT AREA - Dynamic Tab Content */}
      {activeTab === 'list' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold cyberpunk-text">Lista de Pacientes</h2>
            <div className="text-sm text-gray-400">
              {filteredPatients.length} pacientes
            </div>
          </div>

          {filteredPatients.length === 0 ? (
            <Card className="cyberpunk-card">
              <CardContent className="p-8 text-center">
                <p className="text-gray-400 mb-4">No se encontraron pacientes</p>
                <Button onClick={() => handleTabChange('create')}>
                  Crear Primer Paciente
                </Button>
              </CardContent>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPatients.map(renderPatientCard)}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPatients.map(renderPatientListItem)}
            </div>
          )}
        </div>
      )}

      {activeTab === 'search' && (
        <div>
          <h2 className="text-xl font-semibold cyberpunk-text mb-4">Búsqueda Avanzada</h2>
          <Card className="cyberpunk-card">
            <CardContent className="p-6">
              <div className="text-center text-gray-400">
                <p>🎯 Funcionalidad de búsqueda avanzada próximamente</p>
                <p className="text-sm mt-2">Use la barra de búsqueda superior para filtrar pacientes</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'create' && renderPatientForm()}

      {activeTab === 'details' && renderPatientDetails()}

      {/* 🎯 FOOTER - Status and Actions */}
      <div className="mt-8 pt-6 border-t border-gray-700">
        <div className="flex justify-between items-center text-sm text-gray-400">
          <div>
            <span>Estado: </span>
            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500">
              V3.0 - Operativo
            </Badge>
          </div>
          <div>
            Última actualización: {new Date().toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientManagementV3;

// 🎯🎸💀 PATIENT MANAGEMENT V3.0 EXPORTS - OLYMPUS RECONSTRUCTION
// Export PatientManagementV3 as the complete patient management system
// Ready for integration with Apollo Nuclear GraphQL backend