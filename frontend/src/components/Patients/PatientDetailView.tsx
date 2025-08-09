import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  ArrowLeftIcon,
  PencilIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  HeartIcon,
  ShieldCheckIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// PLATFORM_EXTRACTABLE: Universal patient detail view patterns
interface PatientDetailProps {
  patient: any;
  onBack: () => void;
  onEdit: () => void;
}

const PatientDetailView: React.FC<PatientDetailProps> = ({ patient, onBack, onEdit }) => {
  const { state } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  // PLATFORM_EXTRACTABLE: Tab configuration pattern
  const tabs = [
    { id: 'overview', label: 'Resumen General', icon: UserIcon },
    { id: 'medical', label: 'Información Médica', icon: HeartIcon },
    { id: 'appointments', label: 'Historial de Citas', icon: CalendarIcon },
    { id: 'documents', label: 'Documentos', icon: DocumentTextIcon }
  ];

  // DENTAL_SPECIFIC: Fetch patient appointments
  const fetchAppointments = async () => {
    if (activeTab !== 'appointments') return;
    
    setLoadingAppointments(true);
    try {
      const response = await fetch(
        `http://localhost:8002/api/v1/appointments?patient_id=${patient.id}`,
        {
          headers: {
            'Authorization': `Bearer ${state.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoadingAppointments(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [activeTab]);

  // PLATFORM_EXTRACTABLE: Calculate age utility
  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 'No especificado';
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} años`;
  };

  // PLATFORM_EXTRACTABLE: Format date utility
  const formatDate = (dateString: string) => {
    if (!dateString) return 'No especificado';
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Volver a la lista
          </button>
          <button
            onClick={() => onEdit()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <PencilIcon className="w-4 h-4 mr-2" />
            Editar Paciente
          </button>
        </div>

        {/* Patient Summary Card */}
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-blue-600">
              {patient.first_name?.charAt(0)?.toUpperCase()}{patient.last_name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              {patient.first_name} {patient.last_name}
            </h1>
            <div className="mt-2 flex items-center space-x-6 text-gray-600">
              <div className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-1" />
                {calculateAge(patient.date_of_birth)}
              </div>
              <div className="flex items-center">
                <PhoneIcon className="w-4 h-4 mr-1" />
                {patient.phone || 'No especificado'}
              </div>
              <div className="flex items-center">
                <EnvelopeIcon className="w-4 h-4 mr-1" />
                {patient.email}
              </div>
              <div className="flex items-center">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  patient.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {patient.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <UserIcon className="w-5 h-5 mr-2" />
                  Información Personal
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Nombre Completo</label>
                      <p className="text-gray-900">{patient.first_name} {patient.last_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Género</label>
                      <p className="text-gray-900">
                        {patient.gender === 'male' ? 'Masculino' : 
                         patient.gender === 'female' ? 'Femenino' : 
                         patient.gender === 'other' ? 'Otro' : 'No especificado'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                      <p className="text-gray-900">{formatDate(patient.date_of_birth)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Tipo de Sangre</label>
                      <p className="text-gray-900">{patient.blood_type || 'No especificado'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <PhoneIcon className="w-5 h-5 mr-2" />
                  Información de Contacto
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Teléfono Principal</label>
                    <p className="text-gray-900">{patient.phone || 'No especificado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Teléfono Secundario</label>
                    <p className="text-gray-900">{patient.phone_secondary || 'No especificado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{patient.email}</p>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPinIcon className="w-5 h-5 mr-2" />
                  Dirección
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-900">{patient.address_street || 'No especificado'}</p>
                  <p className="text-gray-600">
                    {[patient.address_city, patient.address_state, patient.address_postal_code]
                      .filter(Boolean).join(', ') || 'No especificado'}
                  </p>
                  <p className="text-gray-600">{patient.address_country || 'Argentina'}</p>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-red-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-red-600" />
                  Contacto de Emergencia
                </h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Nombre</label>
                    <p className="text-gray-900">{patient.emergency_contact_name || 'No especificado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Teléfono</label>
                    <p className="text-gray-900">{patient.emergency_contact_phone || 'No especificado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Relación</label>
                    <p className="text-gray-900">{patient.emergency_contact_relationship || 'No especificado'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Medical Tab */}
          {activeTab === 'medical' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Medical Conditions */}
                <div className="bg-red-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <HeartIcon className="w-5 h-5 mr-2 text-red-600" />
                    Condiciones Médicas
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Alergias</label>
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {patient.allergies || 'Ninguna alergia conocida'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Condiciones Médicas</label>
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {patient.medical_conditions || 'Ninguna condición médica conocida'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Medicaciones Actuales</label>
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {patient.medications_current || 'No toma medicaciones actualmente'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Insurance Information */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <ShieldCheckIcon className="w-5 h-5 mr-2 text-blue-600" />
                    Información de Seguro
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Proveedor de Seguro</label>
                      <p className="text-gray-900">{patient.insurance_provider || 'Sin seguro'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Número de Afiliado</label>
                      <p className="text-gray-900">{patient.insurance_number || 'No especificado'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Estado</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        patient.insurance_status === 'active' ? 'bg-green-100 text-green-800' :
                        patient.insurance_status === 'inactive' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {patient.insurance_status === 'active' ? 'Activo' :
                         patient.insurance_status === 'inactive' ? 'Inactivo' : 'Pendiente'}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Información Adicional</label>
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {patient.dental_insurance_info || 'No hay información adicional'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dental Preferences */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ClockIcon className="w-5 h-5 mr-2 text-green-600" />
                  Preferencias Dentales
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Dentista Anterior</label>
                    <p className="text-gray-900">{patient.previous_dentist || 'No especificado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Nivel de Ansiedad</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      patient.dental_anxiety_level === 'low' ? 'bg-green-100 text-green-800' :
                      patient.dental_anxiety_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {patient.dental_anxiety_level === 'low' ? 'Bajo' :
                       patient.dental_anxiety_level === 'medium' ? 'Medio' : 'Alto'}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Horario Preferido</label>
                    <p className="text-gray-900">
                      {patient.preferred_appointment_time === 'morning' ? 'Mañana' :
                       patient.preferred_appointment_time === 'afternoon' ? 'Tarde' : 'Noche'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {patient.notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <DocumentTextIcon className="w-5 h-5 mr-2" />
                    Notas Adicionales
                  </h3>
                  <p className="text-gray-900 whitespace-pre-wrap">{patient.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Citas</h3>
              {loadingAppointments ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Cargando citas...</p>
                </div>
              ) : appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((appointment: any) => (
                    <div key={appointment.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{appointment.title}</h4>
                          <p className="text-sm text-gray-600">{formatDate(appointment.appointment_date)}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">No hay citas registradas para este paciente</p>
                </div>
              )}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="text-center py-8">
              <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestión de Documentos</h3>
              <p className="text-gray-500 mb-4">
                Próximamente: Subida y gestión de documentos del paciente
              </p>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Subir Documento
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDetailView;
