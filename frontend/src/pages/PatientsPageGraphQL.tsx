// 🔥 APOLLO NUCLEAR - PATIENTS PAGE WITH GRAPHQL (ALIGNED WITH SELENE SCHEMA)
// Date: 2025-11-06
// Mission: Patient Management Component with Real GraphQL Operations
// ✅ ALINEADO 100% CON SCHEMA REAL DE SELENE

import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import toast from 'react-hot-toast';
import {
  GET_PATIENTS,
  CREATE_PATIENT,
  UPDATE_PATIENT,
  DELETE_PATIENT,
  Patient,
  PatientInput,
  UpdatePatientInput,
  GetPatientsData,
  GetPatientsVariables,
  CreatePatientData,
  CreatePatientVariables,
  UpdatePatientData,
  UpdatePatientVariables,
  DeletePatientData,
  DeletePatientVariables
} from '../graphql/queries/patients';
import {
  MagnifyingGlassIcon,
  UserPlusIcon,
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { formatTimestampToISODate } from '../utils/dateFormatters';

// ============================================================================
// TYPES
// ============================================================================

interface PatientFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  emergencyContact: string;
  insuranceProvider: string;
  policyNumber: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PatientsPageGraphQL: React.FC = () => {
  // State
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState<PatientFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    emergencyContact: '',
    insuranceProvider: '',
    policyNumber: ''
  });

  const pageSize = 10;

  // ============================================================================
  // GRAPHQL QUERIES & MUTATIONS
  // ============================================================================

  const { data, loading, error, refetch } = useQuery<GetPatientsData, GetPatientsVariables>(
    GET_PATIENTS,
    {
      variables: {
        limit: pageSize,
        offset: page * pageSize
      },
      fetchPolicy: 'network-only'  // 🔥 FIX: Avoid cache duplicates
    }
  );

  const [createPatient, { loading: creating }] = useMutation<CreatePatientData, CreatePatientVariables>(
    CREATE_PATIENT,
    {
      onCompleted: () => {
        toast.success('✅ Paciente creado exitosamente');
        refetch();
        closeForm();
      },
      onError: (error: Error) => {
        toast.error(`❌ Error creando paciente: ${error.message}`);
      }
    }
  );

  const [updatePatient, { loading: updating }] = useMutation<UpdatePatientData, UpdatePatientVariables>(
    UPDATE_PATIENT,
    {
      onCompleted: (data) => {
        console.log('✅ updatePatient onCompleted:', data);
        toast.success('✅ Paciente actualizado exitosamente');
        refetch();
        closeForm();
      },
      onError: (error: Error) => {
        console.error('❌ updatePatient onError:', error);
        toast.error(`❌ Error actualizando paciente: ${error.message}`);
      }
    }
  );

  const [deletePatient] = useMutation<DeletePatientData, DeletePatientVariables>(
    DELETE_PATIENT,
    {
      onCompleted: () => {
        toast.success('✅ Paciente eliminado exitosamente');
        refetch();
      },
      onError: (error: Error) => {
        toast.error(`❌ Error eliminando paciente: ${error.message}`);
      }
    }
  );

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🔥 handleSubmit - editingPatient:', editingPatient);
    console.log('🔥 handleSubmit - formData:', formData);

    const input: PatientInput = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      dateOfBirth: formData.dateOfBirth || undefined,
      address: formData.address || undefined,
      emergencyContact: formData.emergencyContact || undefined,
      insuranceProvider: formData.insuranceProvider || undefined,
      policyNumber: formData.policyNumber || undefined
    };

    console.log('🔥 handleSubmit - input:', input);

    if (editingPatient) {
      // Update existing patient
      console.log('🔥 Calling updatePatient with:', { id: editingPatient.id, input });
      await updatePatient({
        variables: {
          id: editingPatient.id,
          input: input as UpdatePatientInput
        }
      });
    } else {
      // Create new patient
      console.log('🔥 Calling createPatient with:', { input });
      await createPatient({
        variables: { input }
      });
    }
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({
      firstName: patient.firstName || '',
      lastName: patient.lastName || '',
      email: patient.email || '',
      phone: patient.phone || '',
      dateOfBirth: formatTimestampToISODate(patient.dateOfBirth) || '',
      address: patient.address || '',
      emergencyContact: patient.emergencyContact || '',
      insuranceProvider: patient.insuranceProvider || '',
      policyNumber: patient.policyNumber || ''
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este paciente?')) {
      await deletePatient({
        variables: { id }
      });
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingPatient(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      address: '',
      emergencyContact: '',
      insuranceProvider: '',
      policyNumber: ''
    });
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  const patients = data?.patients || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              🔥 Pacientes GraphQL
            </h1>
            <p className="text-gray-400 mt-2">
              Gestión de pacientes con Apollo Nuclear + Selene Song Core
            </p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2"
          >
            <UserPlusIcon className="h-5 w-5" />
            Nuevo Paciente
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar pacientes..."
              className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
            <p className="text-gray-400 mt-4">Cargando pacientes...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-400">❌ Error: {error.message}</p>
          </div>
        )}

        {/* Patients List */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {patients.map((patient: Patient) => {
                // 🔥 USE DIRECT NAME FROM DB (apollo_patients view already combines first+last)
                const fullName = patient.name || `${patient.firstName || 'Sin'} ${patient.lastName || 'Nombre'}`;
                
                return (
                  <div
                    key={patient.id}
                    className="group relative bg-gradient-to-br from-gray-800/90 via-gray-800/70 to-gray-900/90 border border-gray-700/50 rounded-xl p-6 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 overflow-hidden"
                  >
                    {/* Cyberpunk Background Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Content */}
                    <div className="relative z-10">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-1">
                            {fullName}
                          </h3>
                          {patient.phone && (
                            <p className="text-sm text-gray-400 flex items-center gap-2">
                              <PhoneIcon className="h-4 w-4" />
                              {patient.phone}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(patient)}
                            className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/40 hover:scale-110 transition-all duration-200"
                            title="Editar paciente"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(patient.id)}
                            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/40 hover:scale-110 transition-all duration-200"
                            title="Eliminar paciente"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      {/* Separator */}
                      <div className="h-px bg-gradient-to-r from-cyan-500/0 via-cyan-500/50 to-cyan-500/0 mb-4" />

                      {/* Contact Info */}
                      <div className="space-y-3">
                        {patient.email && (
                          <div className="flex items-center gap-3 text-gray-300 hover:text-cyan-400 transition-colors group/item">
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center group-hover/item:bg-cyan-500/20 transition-colors">
                              <EnvelopeIcon className="h-4 w-4 text-cyan-400" />
                            </div>
                            <span className="text-sm truncate">{patient.email}</span>
                          </div>
                        )}
                        
                        {patient.address && (
                          <div className="flex items-center gap-3 text-gray-300 hover:text-emerald-400 transition-colors group/item">
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover/item:bg-emerald-500/20 transition-colors">
                              <MapPinIcon className="h-4 w-4 text-emerald-400" />
                            </div>
                            <span className="text-sm truncate">{patient.address}</span>
                          </div>
                        )}
                      </div>

                      {/* Footer - Insurance Badge */}
                      {patient.insuranceProvider && (
                        <div className="mt-4 pt-4 border-t border-gray-700/50">
                          <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                            <ShieldCheckIcon className="h-4 w-4 text-purple-400 flex-shrink-0" />
                            <span className="text-xs text-purple-300 truncate">
                              {patient.insuranceProvider}
                              {patient.policyNumber && ` • ${patient.policyNumber}`}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {patients.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">No hay pacientes registrados</p>
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-all"
              >
                ← Anterior
              </button>
              <span className="text-gray-400">
                Página {page + 1}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={patients.length < pageSize}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-all"
              >
                Siguiente →
              </button>
            </div>
          </>
        )}

        {/* Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingPatient ? '📝 Editar Paciente' : '➕ Nuevo Paciente'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* First Name */}
                <div>
                  <label className="block text-gray-300 mb-2">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-gray-300 mb-2">Apellidos *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-gray-300 mb-2">Teléfono</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-gray-300 mb-2">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-gray-300 mb-2">Dirección</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {/* Emergency Contact */}
                <div>
                  <label className="block text-gray-300 mb-2">Contacto de Emergencia</label>
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    placeholder='Ej: {"name": "María García", "phone": "123456789"}'
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <p className="text-gray-400 text-xs mt-1">Formato JSON con name y phone</p>
                </div>

                {/* Insurance Provider */}
                <div>
                  <label className="block text-gray-300 mb-2">Seguro Médico</label>
                  <input
                    type="text"
                    value={formData.insuranceProvider}
                    onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {/* Policy Number */}
                <div>
                  <label className="block text-gray-300 mb-2">Número de Póliza</label>
                  <input
                    type="text"
                    value={formData.policyNumber}
                    onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 mt-6">
                  <button
                    type="submit"
                    disabled={creating || updating}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50"
                  >
                    {creating || updating ? 'Guardando...' : editingPatient ? 'Actualizar' : 'Crear'}
                  </button>
                  <button
                    type="button"
                    onClick={closeForm}
                    className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientsPageGraphQL;
