// 🎯🎸💀 EQUIPMENT MANAGER V3.0 - TITAN PATTERN IMPLEMENTATION
// Date: September 22, 2025
// Mission: Complete equipment management with maintenance tracking
// Status: V3.0 - Full equipment lifecycle management with AI-powered maintenance
// Challenge: Equipment lifecycle management with predictive maintenance
// 🎨 THEME: Cyberpunk Medical - Cyan/Purple/Pink gradients with quantum effects
// 🔒 SECURITY: @veritas quantum truth verification on critical equipment values

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
  GET_EQUIPMENT,
  DELETE_EQUIPMENT
} from '../../graphql/queries/inventory';

// 🎯 EQUIPMENT SUB-COMPONENTS - V3 Integration
import { EquipmentFormV3 } from './EquipmentFormV3';
import { EquipmentDetailV3 } from './EquipmentDetailV3';
import { MaintenanceSchedulerV3 } from './MaintenanceSchedulerV3';

// 🎯 ICONS - Heroicons for equipment theme
import {
  WrenchScrewdriverIcon,
  CogIcon,
  BoltIcon,
  SparklesIcon,
  PlusIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CpuChipIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

// 🎯 EQUIPMENT MANAGER V3.0 INTERFACE
interface EquipmentManagerV3Props {
  className?: string;
}

// 🎯 EQUIPMENT CATEGORIES CONFIGURATION
const EQUIPMENT_CATEGORIES = [
  { value: 'all', label: 'Todos', icon: WrenchScrewdriverIcon },
  { value: 'dental-chair', label: 'Sillas Dentales', icon: CogIcon },
  { value: 'x-ray', label: 'Rayos X', icon: BoltIcon },
  { value: 'handpieces', label: 'Instrumentos Rotatorios', icon: WrenchScrewdriverIcon },
  { value: 'sterilizers', label: 'Esterilizadores', icon: SparklesIcon },
  { value: 'lights', label: 'Iluminación', icon: BoltIcon },
  { value: 'suction', label: 'Sistemas de Succión', icon: WrenchScrewdriverIcon },
  { value: 'other', label: 'Otros', icon: CogIcon }
];

// 🎯 EQUIPMENT STATUS CONFIGURATION - Cyberpunk Medical Theme
const EQUIPMENT_STATUS_CONFIG = {
  active: { label: 'Activo', color: 'cyan', bgColor: 'bg-cyan-500/20', textColor: 'text-cyan-300', borderColor: 'border-cyan-500/30' },
  maintenance: { label: 'En Mantenimiento', color: 'yellow', bgColor: 'bg-yellow-500/20', textColor: 'text-yellow-300', borderColor: 'border-yellow-500/30' },
  inactive: { label: 'Inactivo', color: 'gray', bgColor: 'bg-gray-500/20', textColor: 'text-gray-300', borderColor: 'border-gray-500/30' },
  retired: { label: 'Retirado', color: 'pink', bgColor: 'bg-pink-500/20', textColor: 'text-pink-300', borderColor: 'border-pink-500/30' }
};

// 🎯 LOGGER - Module specific logger
const l = createModuleLogger('EquipmentManagerV3');

export const EquipmentManagerV3: React.FC<EquipmentManagerV3Props> = ({
  className = ''
}) => {
  // 🎯 EQUIPMENT STATE - GraphQL Integration
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus] = useState('all');
  const [showMaintenanceDue, setShowMaintenanceDue] = useState(false);

  // 🎯 GRAPHQL QUERIES - V3.0 Equipment Data
  const { data: equipmentData, loading: equipmentLoading, refetch: refetchEquipment } = useQuery(GET_EQUIPMENT, {
    variables: {
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      status: selectedStatus === 'all' ? undefined : selectedStatus,
      maintenanceDue: showMaintenanceDue || undefined,
      limit: 100,
      offset: 0
    }
  });

  // 🎯 GRAPHQL MUTATIONS
  // Mutations available for future use (create/update)
  const [deleteEquipment] = useMutation(DELETE_EQUIPMENT);

  // 🎯 MODAL STATE
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);

  // 🎯 PROCESSED EQUIPMENT DATA
  const equipment = useMemo(() => {
    return (equipmentData as any)?.equipmentV3 as any || [];
  }, [equipmentData]);

  // 🎯 FILTERED EQUIPMENT
  const filteredEquipment = useMemo(() => {
    const filtered = equipment.filter((item: any) => {
      const matchesSearch = !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.model?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });

    return filtered;
  }, [equipment, searchQuery]);

  // 🎯 EQUIPMENT STATUS CALCULATION
  const getEquipmentStatus = (item: any) => {
    const now = new Date();
    const nextMaintenance = item.nextMaintenance ? new Date(item.nextMaintenance) : null;
    const warrantyExpiry = item.warrantyExpiry ? new Date(item.warrantyExpiry) : null;

    if (nextMaintenance && nextMaintenance <= now) {
      return { status: 'maintenance_due', color: 'red', label: 'Mantenimiento Vencido', bgColor: 'bg-red-500/20', textColor: 'text-red-300' };
    }
    if (warrantyExpiry && warrantyExpiry <= now) {
      return { status: 'warranty_expired', color: 'orange', label: 'Garantía Vencida', bgColor: 'bg-orange-500/20', textColor: 'text-orange-300' };
    }
    if (item.condition === 'poor') {
      return { status: 'needs_attention', color: 'yellow', label: 'Requiere Atención', bgColor: 'bg-yellow-500/20', textColor: 'text-yellow-300' };
    }
    return { status: 'good', color: 'green', label: 'Operativo', bgColor: 'bg-green-500/20', textColor: 'text-green-300' };
  };

  // 🎯 HANDLERS - GraphQL Integration
  const handleCreateEquipment = () => {
    setSelectedEquipment(null);
    setShowCreateModal(true);
  };

  const handleEditEquipment = (equipment: any) => {
    setSelectedEquipment(equipment);
    setShowEditModal(true);
  };

  const handleViewEquipment = (equipment: any) => {
    setSelectedEquipment(equipment);
    setShowDetailModal(true);
  };

  const handleDeleteEquipment = async (equipment: any) => {
    if (!window.confirm(`¿Está seguro de que desea eliminar "${equipment.name}"?`)) {
      return;
    }

    try {
      await deleteEquipment({
        variables: { id: equipment.id }
      });
      refetchEquipment();
      l.info('Equipment deleted successfully', { equipmentId: equipment.id });
    } catch (error) {
      l.error('Failed to delete equipment', error as Error);
    }
  };

  const handleMaintenanceSchedule = (equipment: any) => {
    setSelectedEquipment(equipment);
    setShowMaintenanceModal(true);
  };

  const handleEquipmentSaved = () => {
    refetchEquipment();
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedEquipment(null);
  };

  // 🎯 STATISTICS
  const stats = useMemo(() => {
    const totalEquipment = equipment.length;
    const activeEquipment = equipment.filter((item: any) => item.status === 'active').length;
    const maintenanceDue = equipment.filter((item: any) => {
      const nextMaintenance = item.nextMaintenance ? new Date(item.nextMaintenance) : null;
      return nextMaintenance && nextMaintenance <= new Date();
    }).length;
    const totalValue = equipment.reduce((sum: number, item: any) => sum + (item.currentValue || 0), 0);

    return {
      totalEquipment,
      activeEquipment,
      maintenanceDue,
      totalValue
    };
  }, [equipment]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header - Cyberpunk Medical Theme */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-cyan-900/20 backdrop-blur-sm border border-purple-500/20">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10 animate-pulse"></div>
        <div className="relative flex items-center justify-between p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
              <WrenchScrewdriverIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                🎯 Gestión de Equipos V3.0
              </h2>
              <p className="text-gray-300 mt-1">
                Control cuántico del ciclo de vida de equipos con mantenimiento predictivo
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="secondary"
              onClick={() => refetchEquipment()}
              disabled={equipmentLoading}
              className="bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/30 text-purple-300"
            >
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
            <Button
              onClick={handleCreateEquipment}
              className="bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white shadow-lg shadow-pink-500/25"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Nuevo Equipo
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards - Cyberpunk Medical Theme */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-900/20 to-purple-800/20 backdrop-blur-sm border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/5"></div>
          <CardBody className="relative p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg flex items-center justify-center border border-purple-500/30">
                <WrenchScrewdriverIcon className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-300">Total Equipos</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">
                  {stats.totalEquipment}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-green-900/20 to-green-800/20 backdrop-blur-sm border border-green-500/20 hover:border-green-400/40 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/5"></div>
          <CardBody className="relative p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg flex items-center justify-center border border-green-500/30">
                <CheckCircleIcon className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-300">Equipos Activos</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
                  {stats.activeEquipment}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-red-900/20 to-red-800/20 backdrop-blur-sm border border-red-500/20 hover:border-red-400/40 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-red-600/5"></div>
          <CardBody className="relative p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-lg flex items-center justify-center border border-red-500/30">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-300">Mantenimiento Pendiente</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
                  {stats.maintenanceDue}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-cyan-900/20 to-cyan-800/20 backdrop-blur-sm border border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-cyan-600/5"></div>
          <CardBody className="relative p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-lg flex items-center justify-center border border-cyan-500/30">
                <ChartBarIcon className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-gray-300">Valor Total</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent">
                  ${stats.totalValue.toLocaleString()}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters and Search - Cyberpunk Medical Theme */}
      <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-pink-500/20">
        <CardBody className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
              <input
                type="text"
                placeholder="Buscar equipos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20"
              />
            </div>

            <div className="flex space-x-2">
              {EQUIPMENT_CATEGORIES.map(category => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-all duration-300 ${
                      selectedCategory === category.value
                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30 shadow-lg shadow-purple-500/10'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600/30 hover:border-gray-500/50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{category.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={showMaintenanceDue}
                  onChange={(e) => setShowMaintenanceDue(e.target.checked)}
                  className="rounded border-gray-600/50 bg-gray-800/50 text-purple-500 focus:ring-purple-500/20"
                />
                <span>Solo mantenimiento pendiente</span>
              </label>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Equipment Table - Cyberpunk Medical Theme */}
      <Card className="bg-gradient-to-br from-gray-900/30 to-gray-800/30 backdrop-blur-sm border border-cyan-500/20">
        <CardHeader className="border-b border-gray-600/30">
          <h2 className="flex items-center space-x-2 text-pink-300">
            <CogIcon className="w-5 h-5" />
            <span>Lista de Equipos - Provincia del Arsenal</span>
          </h2>
        </CardHeader>
        <CardBody>
          {equipmentLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
              <span className="ml-3 text-gray-300">Cargando equipos...</span>
            </div>
          ) : filteredEquipment.length === 0 ? (
            <div className="text-center py-12">
              <WrenchScrewdriverIcon className="w-12 h-12 mx-auto text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">No se encontraron equipos</h3>
              <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-800/50 to-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                      Equipo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                      Próximo Mantenimiento
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                      Ubicación
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-purple-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600/30">
                  {filteredEquipment.map((item: any) => {
                    const equipmentStatus = getEquipmentStatus(item);
                    const statusConfig = EQUIPMENT_STATUS_CONFIG[item.status as keyof typeof EQUIPMENT_STATUS_CONFIG];

                    return (
                      <tr key={item.id} className="hover:bg-gray-700/50 border-b border-gray-600/30">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10">
                              {equipmentStatus.status === 'good' ? (
                                <CheckCircleIcon className="h-4 w-4 text-green-400" />
                              ) : equipmentStatus.status === 'maintenance_due' ? (
                                <XCircleIcon className="h-4 w-4 text-red-400" />
                              ) : (
                                <ExclamationTriangleIcon className="h-4 w-4 text-yellow-400" />
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">{item.name}</div>
                              <div className="text-sm text-gray-400">{item.model} - {item.serialNumber}</div>
                              {item._veritas && (
                                <div className="flex items-center space-x-1 mt-1">
                                  <ShieldCheckIcon className="w-3 h-3 text-green-400" />
                                  <span className="text-xs text-green-400 font-mono">
                                    {item._veritas.confidence}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Badge variant="info" className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                            {EQUIPMENT_CATEGORIES.find(c => c.value === item.category)?.label || item.category}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor} border ${statusConfig.borderColor}`}>
                              {statusConfig.label}
                            </div>
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${equipmentStatus.bgColor} ${equipmentStatus.textColor} border border-gray-500/30`}>
                              {equipmentStatus.label}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                          {item.nextMaintenance ? new Date(item.nextMaintenance).toLocaleDateString() : 'No programado'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                          {item.location || 'No especificada'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewEquipment(item)}
                              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditEquipment(item)}
                              className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/20"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMaintenanceSchedule(item)}
                              className="text-pink-400 hover:text-pink-300 hover:bg-pink-500/20"
                            >
                              <CpuChipIcon className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteEquipment(item)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Equipment Form Modal - Create */}
      <EquipmentFormV3
        equipment={null}
        onClose={() => setShowCreateModal(false)}
        onSave={handleEquipmentSaved}
        isOpen={showCreateModal}
      />

      {/* Equipment Form Modal - Edit */}
      <EquipmentFormV3
        equipment={selectedEquipment}
        onClose={() => setShowEditModal(false)}
        onSave={handleEquipmentSaved}
        isOpen={showEditModal}
      />

      {/* Equipment Detail Modal */}
      <EquipmentDetailV3
        equipmentId={selectedEquipment?.id}
        onClose={() => setShowDetailModal(false)}
        onEdit={handleEditEquipment}
        isOpen={showDetailModal}
      />

      {/* Maintenance Scheduler Modal */}
      <MaintenanceSchedulerV3
        equipmentId={selectedEquipment?.id}
        onClose={() => setShowMaintenanceModal(false)}
        isOpen={showMaintenanceModal}
      />
    </div>
  );
};

export default EquipmentManagerV3;
