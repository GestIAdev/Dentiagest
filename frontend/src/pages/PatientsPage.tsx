import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apolloGraphQL from '../services/apolloGraphQL'; // 🥷 STEALTH GRAPHQL NINJA MODE
import PatientFormModal from '../components/Forms/PatientFormModal';
import PatientDetailView from '../components/Patients/PatientDetailView';
import {
  MagnifyingGlassIcon,
  UserPlusIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

// Tipos según el backend
interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  insurance_provider?: string;
  insurance_number?: string;
  medical_conditions?: string;
  allergies?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PaginatedResponse {
  items: Patient[];  // ✅ Corregido: patients -> items
  total: number;
  page: number;
  size: number;      // ✅ Corregido: per_page -> size
  pages: number;     // ✅ Corregido: total_pages -> pages
}

const PatientsPage: React.FC = () => {
  const { state } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    insurance: 'all',
    gender: 'all'
  });

  // Fetch patients from API
  const fetchPatients = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: '10',  // ✅ Corregido: per_page -> size
        ...(search && { search })
      });

      // 🥷 STEALTH MODE - Get patients with pagination via GraphQL
      const response = await apolloGraphQL.api.get(`/patients?${params}`);

      if (response) {
        const data: PaginatedResponse = response as any;
        setPatients(data.items || []);  // ✅ Corregido: patients -> items
        setTotalPages(data.pages || 1);  // ✅ Corregido: total_pages -> pages
        setTotalPatients(data.total || 0);
        setCurrentPage(data.page || 1);
      } else {
        console.error('Error fetching patients: Unknown error');
        setPatients([]); // Asegurar que patients es un array
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([]); // Asegurar que patients es un array en caso de error
    } finally {
      setLoading(false);
    }
  };

  // Search handler
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    fetchPatients(1, query);
  };

  // Page change handler
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchPatients(page, searchQuery);
  };

  // View patient detail
  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setViewMode('detail');
  };

  // Edit patient
  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowCreateModal(true);
  };

  // Delete patient
  const handleDeletePatient = async (patientId: string) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este paciente?')) {
      return;
    }

    try {
      // 🥷 STEALTH MODE - Delete patient via GraphQL
      const response = await apolloGraphQL.api.delete(`/patients/${patientId}`);

      if (response) {
        fetchPatients(currentPage, searchQuery);
      } else {
        console.error('❌ Apollo API - Error deleting patient: Unknown error');
      }
    } catch (error) {
      console.error('❌ Apollo API - Error deleting patient:', error);
    }
  };

  // Load patients on component mount
  useEffect(() => {
    fetchPatients();
  }, []);

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (viewMode === 'detail' && selectedPatient) {
    return (
      <PatientDetailView 
        patient={selectedPatient} 
        onBack={() => setViewMode('list')}
        onEdit={() => {
          setViewMode('list');
          handleEditPatient(selectedPatient);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Optimizado para layout dashboard */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🦷 Gestión de Pacientes</h1>
          <p className="text-gray-600 mt-1">
            {totalPatients} pacientes registrados en la clínica
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <UserPlusIcon className="w-5 h-5" />
          <span>Nuevo Paciente</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar pacientes por nombre, email o teléfono..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 transition-colors rounded-lg ${
              showFilters 
                ? 'text-blue-600 bg-blue-100' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
            title="Filtros"
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Seguro</label>
                <select
                  value={filters.insurance}
                  onChange={(e) => setFilters(prev => ({ ...prev, insurance: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos</option>
                  <option value="with_insurance">Con seguro</option>
                  <option value="without_insurance">Sin seguro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Género</label>
                <select
                  value={filters.gender}
                  onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos</option>
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                  <option value="other">Otro</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => {
                  setFilters({ status: 'all', insurance: 'all', gender: 'all' });
                  fetchPatients(1, searchQuery);
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Limpiar filtros
              </button>
              <button
                onClick={() => fetchPatients(1, searchQuery)}
                className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Patients List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando pacientes...</p>
          </div>
        ) : patients && patients.length > 0 ? (
          <>
            {/* Table Header */}
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                <div className="col-span-3">Paciente</div>
                <div className="col-span-2">Contacto</div>
                <div className="col-span-2">Edad</div>
                <div className="col-span-2">Seguro</div>
                <div className="col-span-2">Estado</div>
                <div className="col-span-1">Acciones</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {patients.map((patient) => (
                <div key={patient.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Patient Info */}
                    <div className="col-span-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {patient.first_name.charAt(0).toUpperCase()}
                            {patient.last_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p 
                            className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer transition-colors"
                            onClick={() => handleViewPatient(patient)}
                          >
                            {patient.first_name} {patient.last_name}
                          </p>
                          <p className="text-sm text-gray-500">{patient.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="col-span-2">
                      <div className="space-y-1">
                        {patient.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <PhoneIcon className="w-4 h-4 mr-1" />
                            {patient.phone}
                          </div>
                        )}
                        <div className="flex items-center text-sm text-gray-600">
                          <EnvelopeIcon className="w-4 h-4 mr-1" />
                          {patient.email}
                        </div>
                      </div>
                    </div>

                    {/* Age */}
                    <div className="col-span-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        {patient.date_of_birth 
                          ? `${calculateAge(patient.date_of_birth)} años`
                          : 'No especificado'
                        }
                      </div>
                    </div>

                    {/* Insurance */}
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">
                        {patient.insurance_provider || 'Sin seguro'}
                      </p>
                      {patient.insurance_number && (
                        <p className="text-xs text-gray-500">{patient.insurance_number}</p>
                      )}
                    </div>

                    {/* Status */}
                    <div className="col-span-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        patient.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {patient.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewPatient(patient)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                          title="Ver detalles"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditPatient(patient)}
                          className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          title="Editar"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePatient(patient.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                          title="Eliminar"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-700">
                    Mostrando {((currentPage - 1) * 10) + 1} a {Math.min(currentPage * 10, totalPatients)} de {totalPatients} pacientes
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Anterior
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + Math.max(1, currentPage - 2);
                      return page <= totalPages ? (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 text-sm border rounded ${
                            currentPage === page
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ) : null;
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center">
            <UserPlusIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-4">
              {searchQuery ? 'No se encontraron pacientes con ese criterio' : 'No hay pacientes registrados'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Crear primer paciente
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <PatientFormModal
          patient={selectedPatient}
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedPatient(null);
          }}
          onSave={() => {
            setShowCreateModal(false);
            setSelectedPatient(null);
            fetchPatients(currentPage, searchQuery);
          }}
        />
      )}
    </div>
  );
};

export default PatientsPage;
