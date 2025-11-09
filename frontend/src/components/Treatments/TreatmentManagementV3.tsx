// 🦷 TREATMENT MANAGEMENT V3 - @veritas ENHANCED
/**
 * TreatmentManagementV3.tsx - GraphQL V3 with @veritas quantum truth verification
 *
 * MISSION: Complete treatment management with zero-knowledge proof verification
 * STATUS: Treatments province being re-forged with @veritas integration
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client/react';
// Removed unused UI helper components (TreatmentFilters, TreatmentStats, AITreatmentInsights)

// GraphQL Operations V3 - @veritas Enhanced
import {
  DELETE_TREATMENT,
  GET_TREATMENTS_V3,
  CREATE_TREATMENT_V3,
  UPDATE_TREATMENT_V3,
  TREATMENT_V3_UPDATED
} from '../../graphql/queries/treatments';

// Design System Components
import { Card, CardHeader, CardBody } from '../../design-system/Card';
import { Button } from '../../design-system/Button';
import { Input } from '../../design-system/Input';
import { Badge } from '../../design-system/Badge';
import { Spinner } from '../../design-system/Spinner';

// 3D Components
import Odontogram3DV3 from './Odontogram3DV3';
import AestheticsPreviewV3 from './AestheticsPreviewV3';

// UI Components
// import { getVeritasBadge } from '../atoms/Badge';

// ============================================================================
// VERITAS BADGE HELPER
// ============================================================================

const getVeritasBadge = (veritasData: any) => {
  if (!veritasData || !veritasData.verified) {
    return (
      <Badge variant="error" className="ml-2">
        ⚠️ No Verificado
      </Badge>
    );
  }

  const level = veritasData.level || 'UNKNOWN';
  const confidence = veritasData.confidence || 0;

  let variant: 'success' | 'warning' | 'destructive' = 'success';
  let icon = '✅';

  if (level === 'CRITICAL' || level === 'HIGH') {
    variant = confidence > 0.8 ? 'success' : 'warning';
    icon = confidence > 0.8 ? '🛡️' : '⚠️';
  } else if (level === 'MEDIUM') {
    variant = confidence > 0.6 ? 'success' : 'warning';
    icon = confidence > 0.6 ? '🔒' : '⚠️';
  } else {
    variant = 'destructive';
    icon = '❌';
  }

  return (
    <Badge variant={variant} className="ml-2">
      {icon} {level} ({Math.round(confidence * 100)}%)
    </Badge>
  );
};

// Types
interface Treatment {
  id: string;
  patientId: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    policyNumber_veritas?: any;
  };
  practitionerId: string;
  practitioner: {
    id: string;
    firstName: string;
    lastName: string;
  };
  treatmentType: string;
  treatmentType_veritas?: any;
  description: string;
  description_veritas?: any;
  status: string;
  status_veritas?: any;
  startDate: string;
  startDate_veritas?: any;
  endDate?: string;
  endDate_veritas?: any;
  cost?: number;
  cost_veritas?: any;
  notes?: string;
  aiRecommendations?: string[];
  veritasScore?: number;
  createdAt: string;
  updatedAt: string;
}

interface TreatmentFormData {
  patientId: string;
  practitionerId: string;
  treatmentType: string;
  description: string;
  status: string;
  startDate: string;
  endDate?: string;
  cost?: number;
  notes?: string;
}

const TreatmentCard = ({ treatment, onSelect, onStart, onComplete, onUpdate, compact, urgent }: any) => (
  <div className={`treatment-card p-4 rounded-lg border ${urgent ? 'border-red-500 bg-red-900/20' : 'border-gray-700 bg-gray-800'}`}>
    <h4 className="font-bold text-white">{treatment.patient_name}</h4>
    <p className="text-gray-400">{treatment.treatment_type}</p>
    <div className="flex justify-between items-center mt-2">
      <span className={`px-2 py-1 rounded text-xs ${treatment.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}`}>
        {treatment.status}
      </span>
      <div className="space-x-2">
        <button onClick={onSelect} className="text-cyan-400 hover:text-cyan-300">Ver</button>
        {treatment.status === 'planned' && <button onClick={onStart} className="text-green-400 hover:text-green-300">Iniciar</button>}
        {treatment.status === 'in_progress' && <button onClick={() => onComplete({})} className="text-blue-400 hover:text-blue-300">Completar</button>}
      </div>
    </div>
  </div>
);

// Removed unused local components: TreatmentFilters, TreatmentStats, AITreatmentInsights

// ============================================================================
// INTERFACES
// ============================================================================

interface TreatmentManagementV3Props {
  patientId?: string;
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TREATMENT_TYPES = [
  'LIMPIEZA_DENTAL',
  'EXTRACCION',
  'ENDODONCIA',
  'IMPLANTE',
  'CORONA',
  'PUENTE',
  'ORTODONCIA',
  'BLANQUEAMIENTO',
  'PERIODONCIA',
  'PROTESIS',
  'CONSULTA',
  'EMERGENCIA'
] as const;

const TREATMENT_STATUSES = [
  'PLANNING',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'ON_HOLD'
] as const;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const TreatmentManagementV3: React.FC<TreatmentManagementV3Props> = ({
  patientId,
  className = ''
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [activeTab, setActiveTab] = useState<'overview' | 'planning' | 'details' | 'odontogram' | 'aesthetics'>('overview');
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [treatmentForm, setTreatmentForm] = useState<TreatmentFormData>({
    patientId: patientId || '',
    practitionerId: '',
    treatmentType: '',
    description: '',
    status: 'planned',
    startDate: '',
    endDate: '',
    cost: 0,
    notes: ''
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string | null }>({ show: false, id: null });

  // ============================================================================
  // GRAPHQL OPERATIONS
  // ============================================================================

  const { data: treatmentsData, loading: treatmentsLoading, refetch: refetchTreatments } = useQuery(GET_TREATMENTS_V3, {
    variables: { patientId, limit: 50, offset: 0 },
    skip: !patientId
  });

  const { data: allTreatmentsData, loading: allTreatmentsLoading } = useQuery(GET_TREATMENTS_V3, {
    variables: { limit: 50, offset: 0 },
    skip: !!patientId
  });

  const [createTreatmentMutation, { loading: createLoading }] = useMutation(CREATE_TREATMENT_V3, {
    refetchQueries: [{ query: GET_TREATMENTS_V3, variables: { patientId, limit: 50, offset: 0 } }]
  });

  const [updateTreatmentMutation, { loading: updateLoading }] = useMutation(UPDATE_TREATMENT_V3, {
    refetchQueries: [{ query: GET_TREATMENTS_V3, variables: { patientId, limit: 50, offset: 0 } }]
  });

  const [deleteTreatmentMutation, { loading: deleteLoading }] = useMutation(DELETE_TREATMENT, {
    refetchQueries: [{ query: GET_TREATMENTS_V3, variables: { patientId, limit: 50, offset: 0 } }]
  });

  // Real-time subscription for treatment updates
  useSubscription(TREATMENT_V3_UPDATED, {
    onData: ({ data }) => {
      if ((data as any)?.data?.treatmentV3Updated) {
        console.log('🦷 Treatment updated via subscription', (data as any).data.treatmentV3Updated);
        refetchTreatments();
      }
    }
  });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const treatments = patientId ? (treatmentsData as any)?.treatmentsV3 || [] : (allTreatmentsData as any)?.treatmentsV3 || [];
  const loading = treatmentsLoading || allTreatmentsLoading;
  const mutationLoading = createLoading || updateLoading || deleteLoading;

  const filteredTreatments = treatments.filter((treatment: Treatment) => {
    if (!searchTerm) return true;
    const patientName = treatment.patient ? `${treatment.patient.firstName} ${treatment.patient.lastName}` : '';
    const practitionerName = treatment.practitioner ? `${treatment.practitioner.firstName} ${treatment.practitioner.lastName}` : '';
    return patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           practitionerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           treatment.treatmentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
           treatment.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleTreatmentSelect = (treatment: Treatment) => {
    setSelectedTreatment(treatment);
    setActiveTab('details');
  };

  const handleCreateTreatment = async () => {
    try {
      await createTreatmentMutation({
        variables: {
          input: {
            patientId: treatmentForm.patientId,
            practitionerId: treatmentForm.practitionerId,
            treatmentType: treatmentForm.treatmentType,
            description: treatmentForm.description,
            startDate: treatmentForm.startDate,
            endDate: treatmentForm.endDate || undefined,
            cost: treatmentForm.cost || undefined,
            notes: treatmentForm.notes || undefined
          }
        }
      });
      setShowCreateForm(false);
      resetTreatmentForm();
    } catch (error) {
      console.error('Error creating treatment:', error);
    }
  };

  const handleUpdateTreatment = async () => {
    if (!selectedTreatment) return;
    try {
      await updateTreatmentMutation({
        variables: {
          id: selectedTreatment.id,
          input: {
            treatmentType: treatmentForm.treatmentType,
            description: treatmentForm.description,
            status: treatmentForm.status,
            startDate: treatmentForm.startDate,
            endDate: treatmentForm.endDate || undefined,
            cost: treatmentForm.cost || undefined,
            notes: treatmentForm.notes || undefined
          }
        }
      });
      setShowCreateForm(false);
      setSelectedTreatment(null);
    } catch (error) {
      console.error('Error updating treatment:', error);
    }
  };

  const handleDeleteTreatment = (id: string) => {
    setDeleteConfirm({ show: true, id });
  };

  const confirmDeleteTreatment = async () => {
    if (!deleteConfirm.id) return;
    try {
      await deleteTreatmentMutation({
        variables: { id: deleteConfirm.id }
      });
      setDeleteConfirm({ show: false, id: null });
    } catch (error) {
      console.error('Error deleting treatment:', error);
    }
  };

  const resetTreatmentForm = () => {
    setTreatmentForm({
      patientId: patientId || '',
      practitionerId: '',
      treatmentType: '',
      description: '',
      status: 'planned',
      startDate: '',
      endDate: '',
      cost: 0,
      notes: ''
    });
  };

  const handleEditTreatment = (treatment: Treatment) => {
    setTreatmentForm({
      patientId: treatment.patientId,
      practitionerId: treatment.practitionerId,
      treatmentType: treatment.treatmentType,
      description: treatment.description,
      status: treatment.status,
      startDate: treatment.startDate.split('T')[0],
      endDate: treatment.endDate ? treatment.endDate.split('T')[0] : '',
      cost: treatment.cost || 0,
      notes: treatment.notes || ''
    });
    setSelectedTreatment(treatment);
    setShowCreateForm(true);
  };

  const handleRefresh = async () => {
    try {
      setError(null);
      await refetchTreatments();
    } catch (err) {
      setError('Error al actualizar tratamientos');
      console.error('Error refreshing treatments:', err);
    }
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Treatments List */}
      <Card className="cyberpunk-card">
        <CardHeader>
          <h3 className="text-lg font-semibold cyberpunk-text">
            {patientId ? 'Tratamientos del Paciente' : 'Todos los Tratamientos'}
          </h3>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : filteredTreatments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTreatments.map((treatment: Treatment) => (
                <TreatmentCard
                  key={treatment.id}
                  treatment={treatment}
                  onSelect={() => handleTreatmentSelect(treatment)}
                  onStart={() => {}}
                  onComplete={() => {}}
                  onUpdate={() => {}}
                  compact
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No se encontraron tratamientos
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );

  const renderPlanningTab = () => (
    <div className="space-y-6">
      {/* Treatment List */}
      <Card className="cyberpunk-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {patientId ? 'Tratamientos del Paciente' : 'Todos los Tratamientos'}
            </h3>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Buscar tratamientos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Button
                onClick={() => setShowCreateForm(true)}
                className="cyberpunk-button"
              >
                Nuevo Tratamiento
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : filteredTreatments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTreatments.map((treatment: Treatment) => (
                <TreatmentCard
                  key={treatment.id}
                  treatment={treatment}
                  onSelect={() => handleTreatmentSelect(treatment)}
                  onUpdate={() => handleEditTreatment(treatment)}
                  onStart={() => {}}
                  onComplete={() => {}}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No se encontraron tratamientos
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );

  const renderTreatmentForm = () => (
    <Card className="cyberpunk-card">
      <CardHeader>
        <h3 className="text-lg font-semibold cyberpunk-text">
          {selectedTreatment ? 'Editar Tratamiento' : 'Nuevo Tratamiento'}
        </h3>
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Paciente ID *</label>
            <Input
              value={treatmentForm.patientId}
              onChange={(e) => setTreatmentForm(prev => ({ ...prev, patientId: e.target.value }))}
              placeholder="ID del paciente"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Dentista ID *</label>
            <Input
              value={treatmentForm.practitionerId}
              onChange={(e) => setTreatmentForm(prev => ({ ...prev, practitionerId: e.target.value }))}
              placeholder="ID del dentista"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de Tratamiento *</label>
            <select
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
              value={treatmentForm.treatmentType}
              onChange={(e) => setTreatmentForm(prev => ({ ...prev, treatmentType: e.target.value }))}
            >
              <option value="">Seleccionar tipo</option>
              {TREATMENT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Estado</label>
            <select
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
              value={treatmentForm.status}
              onChange={(e) => setTreatmentForm(prev => ({ ...prev, status: e.target.value }))}
            >
              {TREATMENT_STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Fecha de Inicio *</label>
            <Input
              type="date"
              value={treatmentForm.startDate}
              onChange={(e) => setTreatmentForm(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fecha de Fin</label>
            <Input
              type="date"
              value={treatmentForm.endDate}
              onChange={(e) => setTreatmentForm(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descripción *</label>
          <textarea
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
            rows={3}
            value={treatmentForm.description}
            onChange={(e) => setTreatmentForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descripción del tratamiento..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Costo Estimado</label>
            <Input
              type="number"
              value={treatmentForm.cost}
              onChange={(e) => setTreatmentForm(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notas</label>
          <textarea
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
            rows={2}
            value={treatmentForm.notes}
            onChange={(e) => setTreatmentForm(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Notas adicionales..."
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            variant="outline"
            onClick={() => {
              setShowCreateForm(false);
              setSelectedTreatment(null);
              resetTreatmentForm();
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={selectedTreatment ? handleUpdateTreatment : handleCreateTreatment}
            disabled={mutationLoading}
          >
            {mutationLoading ? <Spinner size="sm" /> : null}
            {selectedTreatment ? 'Actualizar' : 'Crear'} Tratamiento
          </Button>
        </div>
      </CardBody>
    </Card>
  );

  const renderTreatmentDetails = () => {
    if (!selectedTreatment) return null;

    return (
      <Card className="cyberpunk-card">
        <CardHeader>
          <h3 className="cyberpunk-text text-2xl">
            Detalles del Tratamiento - {selectedTreatment.treatmentType}
          </h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Paciente:</span>
                <span>{selectedTreatment.patient ? `${selectedTreatment.patient.firstName} ${selectedTreatment.patient.lastName}` : 'N/A'}</span>
                {selectedTreatment.patient?.policyNumber_veritas && getVeritasBadge(selectedTreatment.patient.policyNumber_veritas)}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Dentista:</span>
                <span>{selectedTreatment.practitioner ? `${selectedTreatment.practitioner.firstName} ${selectedTreatment.practitioner.lastName}` : 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Tipo:</span>
                <span>{selectedTreatment.treatmentType}</span>
                {selectedTreatment.treatmentType_veritas && getVeritasBadge(selectedTreatment.treatmentType_veritas)}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Estado:</span>
                <span>{selectedTreatment.status}</span>
                {selectedTreatment.status_veritas && getVeritasBadge(selectedTreatment.status_veritas)}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Fecha Inicio:</span>
                <span>{new Date(selectedTreatment.startDate).toLocaleDateString('es-ES')}</span>
                {selectedTreatment.startDate_veritas && getVeritasBadge(selectedTreatment.startDate_veritas)}
              </div>
              {selectedTreatment.endDate && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Fecha Fin:</span>
                  <span>{new Date(selectedTreatment.endDate).toLocaleDateString('es-ES')}</span>
                  {selectedTreatment.endDate_veritas && getVeritasBadge(selectedTreatment.endDate_veritas)}
                </div>
              )}
              {selectedTreatment.cost && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Costo:</span>
                  <span>${selectedTreatment.cost.toFixed(2)}</span>
                  {selectedTreatment.cost_veritas && getVeritasBadge(selectedTreatment.cost_veritas)}
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-gray-400">ID:</span>
                <span className="font-mono text-sm">{selectedTreatment.id}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-gray-400">Descripción:</span>
              {selectedTreatment.description_veritas && getVeritasBadge(selectedTreatment.description_veritas)}
            </div>
            <p className="bg-gray-700 p-3 rounded-md">{selectedTreatment.description}</p>
          </div>

          {selectedTreatment.notes && (
            <div>
              <span className="text-gray-400">Notas:</span>
              <p className="mt-2 bg-gray-700 p-3 rounded-md">{selectedTreatment.notes}</p>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setSelectedTreatment(null)}
            >
              Cerrar
            </Button>
            <Button
              onClick={() => handleEditTreatment(selectedTreatment)}
            >
              Editar
            </Button>
            <Button
              variant="danger"
              onClick={() => handleDeleteTreatment(selectedTreatment.id)}
            >
              Eliminar
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className={`treatment-management-v3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white cyberpunk-glow">
            🦷🎸 Gestión de Tratamientos V3.0
          </h1>
          <p className="text-gray-400 mt-2">
            La ciencia médica conquistada - Planificación inteligente de tratamientos
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
            className="cyberpunk-border"
          >
            {loading ? <Spinner size="sm" /> : '🔄'} Actualizar
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-500 mb-6">
          <CardBody className="pt-6">
            <div className="text-red-400">
              <strong>Error:</strong> {error}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-800 p-1 rounded-lg overflow-x-auto">
        {[
          { id: 'overview', label: 'Vista General', icon: '📊' },
          { id: 'planning', label: 'Planificación', icon: '📋' },
          { id: 'odontogram', label: 'Odontograma 3D', icon: '🦷' },
          { id: 'aesthetics', label: 'Estética IA', icon: '🎨' },
          { id: 'details', label: 'Detalles', icon: '🔍' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-cyan-500 text-black cyberpunk-glow'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'planning' && renderPlanningTab()}
        {activeTab === 'odontogram' && (
          <Odontogram3DV3
            patientId={patientId}
            onToothSelect={(tooth) => {
              console.log('Tooth selected:', tooth);
            }}
            onToothUpdate={(toothId, updates) => {
              console.log('Tooth updated:', toothId, updates);
            }}
          />
        )}
        {activeTab === 'aesthetics' && (
          <AestheticsPreviewV3
            patientId={patientId}
            onDesignSelect={(design) => {
              console.log('Design selected:', design);
            }}
            onDesignSave={(design) => {
              console.log('Design saved:', design);
            }}
          />
        )}
        {activeTab === 'details' && renderTreatmentDetails()}
      </div>

      {/* Loading Overlay */}
      {mutationLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <Spinner size="lg" />
              <span>Procesando...</span>
            </div>
          </Card>
        </div>
      )}

      {/* Create/Edit Treatment Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {renderTreatmentForm()}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md">
            <CardHeader>
              <h3 className="text-red-400">Confirmar Eliminación</h3>
            </CardHeader>
            <CardBody>
              <p className="text-gray-300 mb-6">
                ¿Estás seguro de que quieres eliminar este tratamiento? Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm({ show: false, id: null })}
                >
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  onClick={confirmDeleteTreatment}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? <Spinner size="sm" /> : null}
                  Eliminar
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TreatmentManagementV3;


