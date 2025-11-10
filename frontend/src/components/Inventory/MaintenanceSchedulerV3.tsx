// 🎯🎸💀 MAINTENANCE SCHEDULER V3.0 - TITAN PATTERN IMPLEMENTATION
// Date: September 25, 2025
// Mission: Complete maintenance scheduling with AI-powered predictions
// Status: V3.0 - Full maintenance management with quantum scheduling
// Challenge: Predictive maintenance scheduling with equipment lifecycle
// 🎨 THEME: Cyberpunk Medical - Cyan/Purple/Pink gradients with quantum effects
// 🔒 SECURITY: @veritas quantum truth verification on maintenance records

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';

// 🎯 TITAN PATTERN IMPORTS - Core Dependencies
import { Button } from '../../design-system/Button';
import { Card, CardHeader, CardBody } from '../../design-system/Card';
import { Badge } from '../../design-system/Badge';
import { Spinner } from '../../design-system/Spinner';
import { createModuleLogger } from '../../utils/logger';

// 🎯 GRAPHQL QUERIES - V3.0 Integration
import {
  GET_MAINTENANCE_SCHEDULE,
  CREATE_MAINTENANCE_RECORD,
  UPDATE_MAINTENANCE_RECORD,
  GET_EQUIPMENT_ITEM
} from '../../graphql/queries/inventory';

// 🎯 ICONS - Heroicons for maintenance theme
import {
  XMarkIcon,
  WrenchScrewdriverIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  CogIcon,
  BoltIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

// 🎯 MAINTENANCE SCHEDULER V3.0 INTERFACE
interface MaintenanceSchedulerV3Props {
  equipmentId: string;
  onClose: () => void;
  isOpen: boolean;
}

// 🎯 MAINTENANCE RECORD INTERFACE
interface MaintenanceRecord {
  id?: string;
  equipmentId: string;
  scheduledDate: string;
  maintenanceType: string;
  description: string;
  priority: string;
  estimatedCost: number;
  estimatedDuration: number;
  technician: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  status_veritas?: string;
  notes: string;
  notes_veritas?: string;
  createdAt?: string;
  updatedAt?: string;
  completedDate?: string;
  cost?: number;
  type?: string; // For backward compatibility
  _veritas?: {
    verified: boolean;
    confidence: number;
    level: string;
    certificate: string;
    error?: string;
    verifiedAt: string;
    algorithm: string;
  };
}

// 🎯 LOGGER - Module specific logger
const l = createModuleLogger('MaintenanceSchedulerV3');

// 🎯 MAINTENANCE TYPES CONFIGURATION
const MAINTENANCE_TYPES = [
  { value: 'preventive', label: 'Preventivo', color: 'cyan', description: 'Mantenimiento programado regular' },
  { value: 'corrective', label: 'Correctivo', color: 'yellow', description: 'Reparación de fallos' },
  { value: 'predictive', label: 'Predictivo', color: 'purple', description: 'Basado en análisis de datos' },
  { value: 'emergency', label: 'Emergencia', color: 'red', description: 'Reparación urgente' },
  { value: 'warranty', label: 'Garantía', color: 'green', description: 'Servicio bajo garantía' },
  { value: 'upgrade', label: 'Actualización', color: 'pink', description: 'Mejora o actualización' }
];

// 🎯 MAINTENANCE STATUS CONFIGURATION
const MAINTENANCE_STATUS_CONFIG = {
  scheduled: { label: 'Programado', bgColor: 'bg-cyan-500/20', textColor: 'text-cyan-300', borderColor: 'border-cyan-500/30' },
  in_progress: { label: 'En Progreso', bgColor: 'bg-yellow-500/20', textColor: 'text-yellow-300', borderColor: 'border-yellow-500/30' },
  completed: { label: 'Completado', bgColor: 'bg-green-500/20', textColor: 'text-green-300', borderColor: 'border-green-500/30' },
  cancelled: { label: 'Cancelado', bgColor: 'bg-gray-500/20', textColor: 'text-gray-300', borderColor: 'border-gray-500/30' }
};

export const MaintenanceSchedulerV3: React.FC<MaintenanceSchedulerV3Props> = ({
  equipmentId,
  onClose,
  isOpen
}) => {
  // 🎯 FORM STATE
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);
  const [formData, setFormData] = useState<Partial<MaintenanceRecord>>({
    maintenanceType: 'preventive',
    description: '',
    scheduledDate: '',
    technician: '',
    estimatedCost: 0,
    notes: '',
    status: 'scheduled',
    priority: 'medium',
    estimatedDuration: 2
  });

  // 🎯 GRAPHQL QUERIES
  const { data: equipmentData, loading: equipmentLoading } = useQuery(GET_EQUIPMENT_ITEM, {
    variables: { id: equipmentId },
    skip: !isOpen || !equipmentId
  });

  const { data: maintenanceData, loading: maintenanceLoading, refetch: refetchMaintenance } = useQuery(GET_MAINTENANCE_SCHEDULE, {
    variables: { equipmentId },
    skip: !isOpen || !equipmentId
  });

  // 🎯 GRAPHQL MUTATIONS
  const [createMaintenanceRecord] = useMutation(CREATE_MAINTENANCE_RECORD);
  const [updateMaintenanceRecord] = useMutation(UPDATE_MAINTENANCE_RECORD);

  // 🎯 PROCESSED DATA
  const equipment = useMemo(() => {
    return (equipmentData as any)?.equipmentItemV3 || null;
  }, [equipmentData]);

  const maintenanceRecords = useMemo(() => {
    return (maintenanceData as any)?.maintenanceScheduleV3 || [];
  }, [maintenanceData]);

  // 🎯 CALCULATE NEXT MAINTENANCE
  const calculateNextMaintenance = (lastMaintenance: string, interval: number): string => {
    if (!lastMaintenance) return '';

    const lastDate = new Date(lastMaintenance);
    const nextDate = new Date(lastDate);
    nextDate.setDate(lastDate.getDate() + interval);

    return nextDate.toISOString().split('T')[0];
  };

  // 🎯 PREDICTIVE MAINTENANCE SUGGESTIONS
  const predictiveSuggestions = useMemo(() => {
    if (!equipment) return [];

    const suggestions = [];
    const now = new Date();

    // Preventive maintenance suggestion
    if (equipment.maintenanceInterval) {
      const nextScheduled = calculateNextMaintenance(
        equipment.lastMaintenance || equipment.purchaseDate,
        equipment.maintenanceInterval
      );

      if (nextScheduled) {
        const nextDate = new Date(nextScheduled);
        const daysUntil = Math.floor((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntil <= 30) {
          suggestions.push({
            type: 'preventive',
            title: 'Mantenimiento Preventivo',
            description: `Mantenimiento programado vence en ${daysUntil} días`,
            priority: daysUntil <= 7 ? 'high' : 'medium',
            suggestedDate: nextScheduled
          });
        }
      }
    }

    // Condition-based suggestions
    if (equipment.condition === 'poor') {
      suggestions.push({
        type: 'corrective',
        title: 'Reparación Urgente',
        description: 'Equipo en condición deficiente requiere atención inmediata',
        priority: 'high',
        suggestedDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }

    // Age-based suggestions
    if (equipment.purchaseDate) {
      const ageInYears = (now.getTime() - new Date(equipment.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365);
      if (ageInYears > 5) {
        suggestions.push({
          type: 'upgrade',
          title: 'Actualización Recomendada',
          description: `Equipo tiene ${Math.floor(ageInYears)} años, considere actualización`,
          priority: 'low',
          suggestedDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
      }
    }

    return suggestions;
  }, [equipment]);

  // 🎯 FORM HANDLERS
  const handleInputChange = (field: keyof MaintenanceRecord, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateMaintenance = () => {
    setEditingRecord(null);
    setFormData({
      equipmentId,
      maintenanceType: 'preventive',
      description: '',
      scheduledDate: '',
      technician: '',
      estimatedCost: 0,
      notes: '',
      status: 'scheduled',
      priority: 'medium',
      estimatedDuration: 2
    });
    setShowCreateForm(true);
  };

  const handleEditMaintenance = (record: MaintenanceRecord) => {
    setEditingRecord(record);
    setFormData(record);
    setShowCreateForm(true);
  };

  const handleSaveMaintenance = async () => {
    if (!formData.description || !formData.scheduledDate) {
      return;
    }

    try {
      const maintenanceData = {
        ...formData,
        equipmentId,
        scheduledDate: new Date(formData.scheduledDate).toISOString(),
        completedDate: formData.completedDate ? new Date(formData.completedDate).toISOString() : null
      };

      if (editingRecord) {
        await updateMaintenanceRecord({
          variables: {
            id: editingRecord.id,
            input: maintenanceData
          }
        });
        l.info('Maintenance record updated successfully', { recordId: editingRecord.id });
      } else {
        await createMaintenanceRecord({
          variables: { input: maintenanceData }
        });
        l.info('Maintenance record created successfully');
      }

      refetchMaintenance();
      setShowCreateForm(false);
      setEditingRecord(null);
    } catch (error) {
      l.error('Failed to save maintenance record', error as Error);
    }
  };

  const handleCancelForm = () => {
    setShowCreateForm(false);
    setEditingRecord(null);
    setFormData({});
  };

  // 🎯 GET MAINTENANCE TYPE INFO
  const getMaintenanceTypeInfo = (type: string) => {
    return MAINTENANCE_TYPES.find(t => t.value === type) || MAINTENANCE_TYPES[0];
  };

  if (!isOpen) return null;

  if (equipmentLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <Card className="bg-gray-800 border border-purple-500/20 p-8">
          <div className="flex items-center space-x-4">
            <Spinner size="lg" />
            <span className="text-gray-300">Cargando programador de mantenimiento...</span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm border border-purple-500/20">
        <CardHeader className="border-b border-gray-600/30 bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-cyan-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <CalendarDaysIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  🎯 Programador de Mantenimiento V3.0
                </h2>
                <p className="text-gray-300 text-sm mt-1">
                  Gestión predictiva de mantenimiento con IA cuántica
                </p>
                {equipment && (
                  <p className="text-white font-semibold">{equipment.name} - {equipment.serialNumber}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleCreateMaintenance}
                className="bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white shadow-lg shadow-pink-500/25"
              >
                <WrenchScrewdriverIcon className="w-4 h-4 mr-2" />
                Nuevo Mantenimiento
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-white hover:bg-gray-700/50"
              >
                <XMarkIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardBody className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Predictive Suggestions */}
            <div className="lg:col-span-1">
              <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 backdrop-blur-sm border border-purple-500/20">
                <CardHeader className="pb-3">
                  <h2 className="text-lg text-purple-300 flex items-center space-x-2">
                    <BoltIcon className="w-5 h-5" />
                    <span>Sugerencias IA</span>
                  </h2>
                </CardHeader>
                <CardBody>
                  {predictiveSuggestions.length === 0 ? (
                    <p className="text-gray-400 text-sm">No hay sugerencias pendientes</p>
                  ) : (
                    <div className="space-y-3">
                      {predictiveSuggestions.map((suggestion, index) => (
                        <div key={index} className="p-3 bg-gray-800/50 rounded-lg border border-gray-600/30">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-sm font-semibold text-white">{suggestion.title}</h4>
                            <Badge className={`text-xs ${
                              suggestion.priority === 'high' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                              suggestion.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                              'bg-green-500/20 text-green-300 border-green-500/30'
                            }`}>
                              {suggestion.priority === 'high' ? 'Alta' : suggestion.priority === 'medium' ? 'Media' : 'Baja'}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-300 mb-2">{suggestion.description}</p>
                          <p className="text-xs text-cyan-300">Fecha sugerida: {new Date(suggestion.suggestedDate).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>

            {/* Maintenance Records */}
            <div className="lg:col-span-2">
              <Card className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-cyan-500/20">
                <CardHeader className="pb-3">
                  <h2 className="text-lg text-cyan-300 flex items-center space-x-2">
                    <ClockIcon className="w-5 h-5" />
                    <span>Historial de Mantenimiento</span>
                  </h2>
                </CardHeader>
                <CardBody>
                  {maintenanceLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Spinner size="sm" />
                      <span className="ml-2 text-gray-300">Cargando registros...</span>
                    </div>
                  ) : maintenanceRecords.length === 0 ? (
                    <div className="text-center py-8">
                      <CalendarDaysIcon className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                      <h3 className="text-lg font-medium text-gray-300 mb-2">No hay registros de mantenimiento</h3>
                      <p className="text-gray-500">Programa el primer mantenimiento para este equipo</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {maintenanceRecords.map((record: MaintenanceRecord) => {
                        const typeInfo = getMaintenanceTypeInfo(record.maintenanceType || record.type || 'preventive');
                        const statusConfig = MAINTENANCE_STATUS_CONFIG[record.status as keyof typeof MAINTENANCE_STATUS_CONFIG];

                        return (
                          <Card key={record.id} className="bg-gray-800/30 border border-gray-600/30">
                            <CardBody className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <Badge className={`bg-${typeInfo.color}-500/20 text-${typeInfo.color}-300 border-${typeInfo.color}-500/30`}>
                                    {typeInfo.label}
                                  </Badge>
                                  <Badge className={`${statusConfig.bgColor} ${statusConfig.textColor} border ${statusConfig.borderColor}`}>
                                    {statusConfig.label}
                                  </Badge>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditMaintenance(record)}
                                  className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/20"
                                >
                                  <CogIcon className="w-4 h-4" />
                                </Button>
                              </div>

                              <h4 className="text-white font-semibold mb-2">{record.description}</h4>

                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-400">Fecha programada:</span>
                                  <p className="text-white">{new Date(record.scheduledDate).toLocaleDateString()}</p>
                                </div>
                                {record.completedDate && (
                                  <div>
                                    <span className="text-gray-400">Fecha completada:</span>
                                    <p className="text-green-300">{new Date(record.completedDate).toLocaleDateString()}</p>
                                  </div>
                                )}
                                <div>
                                  <span className="text-gray-400">Técnico:</span>
                                  <p className="text-white">{record.technician || 'No asignado'}</p>
                                </div>
                                <div>
                                  <span className="text-gray-400">Costo:</span>
                                  <p className="text-white">${record.estimatedCost?.toLocaleString() || record.cost?.toLocaleString() || '0'}</p>
                                </div>
                              </div>

                              {record.notes && (
                                <div className="mt-3 pt-3 border-t border-gray-600/30">
                                  <span className="text-gray-400 text-sm">Notas:</span>
                                  <p className="text-white text-sm mt-1">{record.notes}</p>
                                </div>
                              )}

                              {record._veritas && (
                                <div className="mt-3 flex items-center space-x-2">
                                  <ShieldCheckIcon className="w-4 h-4 text-green-400" />
                                  <span className="text-green-400 text-xs font-mono">
                                    @veritas {record._veritas.confidence}%
                                  </span>
                                </div>
                              )}
                            </CardBody>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>
          </div>

          {/* Create/Edit Form Modal */}
          {showCreateForm && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
              <Card className="w-full max-w-2xl bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm border border-pink-500/20">
                <CardHeader className="border-b border-gray-600/30">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
                    {editingRecord ? '🎯 Editar Mantenimiento' : '🎯 Nuevo Mantenimiento'}
                  </h2>
                </CardHeader>
                <CardBody className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Mantenimiento</label>
                      <select
                        value={formData.maintenanceType}
                        onChange={(e) => handleInputChange('maintenanceType', e.target.value)}
                        className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
                      >
                        {MAINTENANCE_TYPES.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Prioridad</label>
                      <select
                        value={formData.priority}
                        onChange={(e) => handleInputChange('priority', e.target.value)}
                        className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
                      >
                        <option value="low">Baja</option>
                        <option value="medium">Media</option>
                        <option value="high">Alta</option>
                        <option value="critical">Crítica</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('description', e.target.value)}
                      className="bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20"
                      placeholder="Describe el mantenimiento a realizar..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Fecha Programada</label>
                      <input
                        type="date"
                        value={formData.scheduledDate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('scheduledDate', e.target.value)}
                        className="bg-gray-800/50 border-gray-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Técnico Asignado</label>
                      <input
                        type="text"
                        value={formData.technician}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('technician', e.target.value)}
                        className="bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20"
                        placeholder="Nombre del técnico"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Costo Estimado ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.estimatedCost}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('estimatedCost', parseFloat(e.target.value) || 0)}
                        className="bg-gray-800/50 border-gray-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Duración Estimada (horas)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={formData.estimatedDuration}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('estimatedDuration', parseFloat(e.target.value) || 0)}
                        className="bg-gray-800/50 border-gray-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
                        placeholder="2.0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Estado</label>
                      <select
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
                      >
                        <option value="scheduled">Programado</option>
                        <option value="in_progress">En Progreso</option>
                        <option value="completed">Completado</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Notas Adicionales</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      rows={3}
                      className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20 resize-none"
                      placeholder="Detalles adicionales del mantenimiento..."
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-600/30">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleCancelForm}
                      className="bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 border-gray-600/30"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSaveMaintenance}
                      className="bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white shadow-lg shadow-pink-500/25"
                    >
                      <CheckCircleIcon className="w-4 h-4 mr-2" />
                      {editingRecord ? 'Actualizar' : 'Programar'} Mantenimiento
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
