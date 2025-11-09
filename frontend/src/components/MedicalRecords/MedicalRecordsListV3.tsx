// 🎯💀 MEDICAL RECORDS LIST V3 - APOLLO NUCLEAR RESURRECTION
// Date: November 9, 2025
// Mission: Complete GraphQL V3 migration with @veritas quantum verification
// Status: PUNKGROK EDITION - Arte funcional, cero teatro

import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_MEDICAL_RECORDS_V3 } from '../../graphql/queries/medicalRecords';
import { useMedicalSecurity } from './MedicalSecurity';
import { Button } from '../../design-system/Button';
import { Card } from '../../design-system/Card';
import { Badge } from '../../design-system/Badge';
import { Input } from '../../design-system/Input';
import { Spinner } from '../../design-system/Spinner';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  PlusIcon,
  EyeIcon,
  PencilIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

// 🎯 TYPES - Real data structures, no teatro
interface Patient {
  firstName: string;
  lastName: string;
}

interface VeritasMetadata {
  verified: boolean;
  confidence: number;
  level: string;
  certificate?: string;
  error?: string;
  verifiedAt: string;
  algorithm: string;
}

interface MedicalRecordV3 {
  id: string;
  patientId: string;
  patient: Patient;
  practitionerId: string;
  recordType: string;
  title: string;
  content: string;
  diagnosis?: string;
  treatment?: string;
  medications?: string[];
  createdAt: string;
  updatedAt: string;
  _veritas: VeritasMetadata;
}

interface MedicalRecordsListV3Props {
  onCreateNew?: (patientId?: string) => void;
  onViewDetail?: (recordId: string) => void;
  onEdit?: (recordId: string, patientId?: string) => void;
  onRefresh?: () => void;
}

const MedicalRecordsListV3: React.FC<MedicalRecordsListV3Props> = ({
  onCreateNew,
  onViewDetail,
  onEdit,
  onRefresh
}) => {
  // 🔒 Security context
  const { accessLevel } = useMedicalSecurity();
  
  // 🎯 State - Real data only
  const [searchTerm, setSearchTerm] = useState('');
  const [recordTypeFilter, setRecordTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // 🔥 APOLLO NUCLEAR - GraphQL V3 Query
  const { data, loading, error, refetch } = useQuery<{
    medicalRecordsV3: MedicalRecordV3[]
  }>(GET_MEDICAL_RECORDS_V3, {
    variables: {
      limit: pageSize,
      offset: (currentPage - 1) * pageSize
    },
    fetchPolicy: 'network-only'
  });

  // Refresh on mount and when onRefresh changes
  useEffect(() => {
    refetch();
  }, [onRefresh, refetch]);

  // 🎯 VERITAS BADGE HELPER - Quantum truth verification
  const getVeritasBadge = (veritasData: VeritasMetadata | undefined) => {
    if (!veritasData || !veritasData.verified) {
      return (
        <Badge variant="error">
          ⚠️ No Verificado
        </Badge>
      );
    }

    const confidence = veritasData.confidence || 0;
    const level = veritasData.level || 'UNKNOWN';

    let variant: 'success' | 'warning' | 'error' | 'default' | 'veritas' = 'success';
    let icon = '✅';

    if (level === 'CRITICAL') {
      if (confidence > 0.8) {
        variant = 'veritas';
        icon = '🛡️';
      } else {
        variant = 'warning';
        icon = '⚠️';
      }
    }

    return (
      <Badge variant={variant}>
        {icon} {level} ({Math.round(confidence * 100)}%)
      </Badge>
    );
  };

  // 🎯 RECORD TYPE BADGE
  const getRecordTypeBadge = (recordType: string) => {
    const types: Record<string, { variant: 'default' | 'success' | 'warning' | 'error' | 'info'; icon: string }> = {
      consultation: { variant: 'info', icon: '👁️' },
      diagnosis: { variant: 'default', icon: '🔬' },
      treatment: { variant: 'success', icon: '💊' },
      surgery: { variant: 'error', icon: '⚕️' },
      followup: { variant: 'warning', icon: '📋' }
    };

    const style = types[recordType] || { variant: 'default' as const, icon: '📄' };

    return (
      <Badge variant={style.variant}>
        {style.icon} {recordType}
      </Badge>
    );
  };

  // 🎯 FILTERED RECORDS - Client-side filtering
  const filteredRecords = React.useMemo(() => {
    if (!data?.medicalRecordsV3) return [];
    
    return data.medicalRecordsV3.filter((record: MedicalRecordV3) => {
      const matchesSearch = searchTerm === '' || 
        record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.diagnosis && record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesRecordType = recordTypeFilter === '' || record.recordType === recordTypeFilter;
      
      return matchesSearch && matchesRecordType;
    });
  }, [data, searchTerm, recordTypeFilter]);

  // 🎯 LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-gray-600 mt-4">Cargando historiales médicos...</p>
        </div>
      </div>
    );
  }

  // 🎯 ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error al cargar historiales</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <Button onClick={() => refetch()} variant="primary">
            Reintentar
          </Button>
        </Card>
      </div>
    );
  }

  // 🎯 EMPTY STATE
  if (!filteredRecords || filteredRecords.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        {/* Header con botón crear */}
        <div className="max-w-7xl mx-auto mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Historiales Médicos</h1>
              {accessLevel.canEditMedicalRecords && (
                <Button onClick={() => onCreateNew?.()} variant="primary">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Nuevo Historial
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Empty state */}
        <div className="max-w-7xl mx-auto">
          <Card className="p-12 text-center">
            <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No hay historiales médicos</h2>
            <p className="text-gray-600 mb-6">
              {searchTerm || recordTypeFilter 
                ? 'No se encontraron historiales con los filtros aplicados.'
                : 'Comienza creando el primer historial médico.'}
            </p>
            {accessLevel.canEditMedicalRecords && !searchTerm && !recordTypeFilter && (
              <Button onClick={() => onCreateNew?.()} variant="primary">
                <PlusIcon className="h-5 w-5 inline mr-2" />
                Crear Primer Historial
              </Button>
            )}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* 🎯 HEADER */}
        <Card className="mb-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Historiales Médicos</h1>
            {accessLevel.canEditMedicalRecords && (
              <Button onClick={() => onCreateNew?.()} variant="primary">
                <PlusIcon className="h-5 w-5 mr-2" />
                Nuevo Historial
              </Button>
            )}
          </div>

          {/* 🎯 FILTERS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por paciente, título o diagnóstico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Record Type Filter */}
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={recordTypeFilter}
                onChange={(e) => setRecordTypeFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">Todos los tipos</option>
                <option value="consultation">Consulta</option>
                <option value="diagnosis">Diagnóstico</option>
                <option value="treatment">Tratamiento</option>
                <option value="surgery">Cirugía</option>
                <option value="followup">Seguimiento</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <CheckCircleIcon className="h-5 w-5 mr-2 text-green-600" />
            <span>{filteredRecords.length} historiales encontrados</span>
          </div>
        </Card>

        {/* 🎯 RECORDS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRecords.map((record: MedicalRecordV3) => (
            <Card key={record.id} className="hover:shadow-lg transition-shadow">
              {/* Card Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1 mr-2">
                    {record.title}
                  </h3>
                  {getRecordTypeBadge(record.recordType)}
                </div>
                
                {/* Patient Info */}
                <p className="text-sm text-gray-600">
                  👤 {record.patient.firstName} {record.patient.lastName}
                </p>

                {/* Date */}
                <div className="flex items-center text-xs text-gray-500 mt-2">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {new Date(record.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6">
                {/* Diagnosis */}
                {record.diagnosis && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">Diagnóstico:</p>
                    <p className="text-sm text-gray-900 line-clamp-2">{record.diagnosis}</p>
                  </div>
                )}

                {/* @veritas Badge */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-1">Verificación:</p>
                  {getVeritasBadge(record._veritas)}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => onViewDetail?.(record.id)}
                    variant="secondary"
                    className="flex-1"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                  {accessLevel.canEditMedicalRecords && (
                    <Button
                      onClick={() => onEdit?.(record.id, record.patientId)}
                      variant="outline"
                      className="flex-1"
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* 🎯 PAGINATION (placeholder para futuro) */}
        {filteredRecords.length >= pageSize && (
          <Card className="mt-6 p-4 flex items-center justify-between">
            <Button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              variant="outline"
            >
              Anterior
            </Button>
            <span className="text-sm text-gray-600">Página {currentPage}</span>
            <Button
              onClick={() => setCurrentPage(currentPage + 1)}
              variant="outline"
            >
              Siguiente
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MedicalRecordsListV3;
