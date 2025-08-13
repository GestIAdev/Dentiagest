// MEDICAL_RECORDS: Lista principal de historiales médicos
/**
 * Componente principal para mostrar y filtrar historiales médicos.
 * Incluye búsqueda, filtros, paginación y acciones CRUD.
 * 
 * PLATFORM_PATTERN: Este patrón se repetirá en otros verticales:
 * - VetGest: Lista de historiales veterinarios
 * - MechaGest: Lista de historiales de servicio
 * - RestaurantGest: Lista de historiales de pedidos
 */

import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

// Types
interface MedicalRecord {
  id: string;
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
  estimated_cost: number | null;
  actual_cost: number | null;
  insurance_covered: boolean;
  follow_up_required: boolean;
  follow_up_date: string | null;
  is_confidential: boolean;
  created_at: string;
  updated_at: string;
  age_days: number;
  is_recent: boolean;
  requires_attention: boolean;
  total_teeth_affected: number;
  is_major_treatment: boolean;
  treatment_summary: string;
}

interface PaginatedResponse {
  items: MedicalRecord[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Filtros de búsqueda
interface SearchFilters {
  search: string;
  procedure_category: string;
  treatment_status: string;
  priority: string;
  start_date: string;
  end_date: string;
  requires_follow_up: string;
  is_confidential: string;
  page: number;
  size: number;
  sort_by: string;
  sort_order: 'asc' | 'desc';
}

// Props del componente
interface MedicalRecordsListProps {
  onCreateNew?: (patientId?: string) => void;
  onViewDetail?: (recordId: string) => void;
  onEdit?: (recordId: string, patientId?: string) => void;
  onRefresh?: () => void;
}

const MedicalRecordsList: React.FC<MedicalRecordsListProps> = ({
  onCreateNew,
  onViewDetail,
  onEdit,
  onRefresh
}) => {
  // Estados
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Filtros y búsqueda
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    procedure_category: '',
    treatment_status: '',
    priority: '',
    start_date: '',
    end_date: '',
    requires_follow_up: '',
    is_confidential: '',
    page: 1,
    size: 10,
    sort_by: 'visit_date',
    sort_order: 'desc'
  });

  // Estado del modal de filtros
  const [showFilters, setShowFilters] = useState(false);

  // Función para obtener historiales
  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      setError(null);

      // Construir parámetros de consulta
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`http://127.0.0.1:8002/api/v1/medical-records/?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: PaginatedResponse = await response.json();
      
      setRecords(data.items);
      setTotalRecords(data.total);
      setTotalPages(data.pages);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching medical records:', err);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar datos
  useEffect(() => {
    fetchMedicalRecords();
  }, [filters]);

  // Función para actualizar filtros
  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset page when other filters change
    }));
  };

  // Función para obtener color del badge según estado
  const getStatusColor = (status: string) => {
    const colors = {
      planned: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      postponed: 'bg-gray-100 text-gray-800',
      follow_up_required: 'bg-orange-100 text-orange-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Función para obtener color del badge según prioridad
  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
      emergency: 'bg-red-200 text-red-900'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Función para obtener icono según estado
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'in_progress':
        return <ClockIcon className="h-4 w-4" />;
      case 'follow_up_required':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      default:
        return <DocumentTextIcon className="h-4 w-4" />;
    }
  };

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Función para formatear dinero
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'N/A';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (loading && records.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando historiales médicos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Historiales Médicos</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestiona los historiales médicos de todos los pacientes
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => onCreateNew && onCreateNew()}
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Nuevo Historial
          </button>
        </div>
      </div>

      {/* Búsqueda y filtros */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-4">
          {/* Barra de búsqueda */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por diagnóstico, notas clínicas o tratamiento..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                />
              </div>
            </div>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FunnelIcon className="-ml-1 mr-2 h-5 w-5" />
              Filtros
            </button>
          </div>

          {/* Panel de filtros expandible */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={filters.procedure_category}
                  onChange={(e) => updateFilter('procedure_category', e.target.value)}
                >
                  <option value="">Todas las categorías</option>
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

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={filters.treatment_status}
                  onChange={(e) => updateFilter('treatment_status', e.target.value)}
                >
                  <option value="">Todos los estados</option>
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
                  value={filters.priority}
                  onChange={(e) => updateFilter('priority', e.target.value)}
                >
                  <option value="">Todas las prioridades</option>
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                  <option value="emergency">Emergencia</option>
                </select>
              </div>

              {/* Seguimiento requerido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seguimiento
                </label>
                <select
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={filters.requires_follow_up}
                  onChange={(e) => updateFilter('requires_follow_up', e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="true">Requiere seguimiento</option>
                  <option value="false">No requiere seguimiento</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Historiales
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {totalRecords}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    En Progreso
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {records.filter(r => r.treatment_status === 'in_progress').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-orange-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Requieren Atención
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {records.filter(r => r.requires_attention).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Completados
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {records.filter(r => r.treatment_status === 'completed').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error al cargar historiales
              </h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button
                className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                onClick={fetchMedicalRecords}
              >
                Intentar de nuevo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de historiales */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {records.map((record) => (
            <li key={record.id}>
              <div className="px-4 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Icono de estado */}
                    <div className="flex-shrink-0">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.treatment_status)}`}>
                        {getStatusIcon(record.treatment_status)}
                        <span className="ml-1 capitalize">
                          {record.treatment_status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Información principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {record.chief_complaint || 'Sin queja principal'}
                        </p>
                        {record.is_recent && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Reciente
                          </span>
                        )}
                        {record.is_confidential && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            Confidencial
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <span>📅 {formatDate(record.visit_date)}</span>
                        <span>🦷 {record.procedure_category}</span>
                        {record.estimated_cost && (
                          <span>💰 {formatCurrency(record.estimated_cost)}</span>
                        )}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(record.priority)}`}>
                          {record.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {record.diagnosis}
                      </p>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      title="Ver detalles"
                      onClick={() => onViewDetail && onViewDetail(record.id)}
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      title="Editar"
                      onClick={() => onEdit && onEdit(record.id, record.patient_id)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      title="Eliminar"
                      onClick={() => {
                        if (window.confirm('¿Estás seguro de que quieres eliminar este historial médico?')) {
                          // TODO: Implementar eliminación
                          // console.log('Eliminar historial:', record.id);
                        }
                      }}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Información adicional para seguimiento */}
                {record.follow_up_required && record.follow_up_date && (
                  <div className="mt-3 px-4 py-2 bg-orange-50 border-l-4 border-orange-400 rounded">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="h-4 w-4 text-orange-400 mr-2" />
                      <span className="text-sm text-orange-700">
                        Seguimiento requerido para: {formatDate(record.follow_up_date)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>

        {/* Estado vacío */}
        {records.length === 0 && !loading && (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No hay historiales médicos
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza creando un nuevo historial médico
            </p>
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => onCreateNew && onCreateNew()}
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Nuevo Historial
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => updateFilter('page', Math.max(1, filters.page - 1))}
                disabled={filters.page <= 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => updateFilter('page', Math.min(totalPages, filters.page + 1))}
                disabled={filters.page >= totalPages}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando{' '}
                  <span className="font-medium">{(filters.page - 1) * filters.size + 1}</span>
                  {' '}-{' '}
                  <span className="font-medium">
                    {Math.min(filters.page * filters.size, totalRecords)}
                  </span>
                  {' '}de{' '}
                  <span className="font-medium">{totalRecords}</span>
                  {' '}resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => updateFilter('page', Math.max(1, filters.page - 1))}
                    disabled={filters.page <= 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Anterior</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    const isActive = pageNum === filters.page;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => updateFilter('page', pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          isActive
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => updateFilter('page', Math.min(totalPages, filters.page + 1))}
                    disabled={filters.page >= totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Siguiente</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecordsList;
