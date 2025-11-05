// 🎯🎸💀 EQUIPMENT DETAIL V3.0 - TITAN PATTERN IMPLEMENTATION
// Date: September 25, 2025
// Mission: Complete equipment detail view with @veritas verification
// Status: V3.0 - Full equipment details with quantum truth verification
// Challenge: Equipment information display with maintenance history
// 🎨 THEME: Cyberpunk Medical - Cyan/Purple/Pink gradients with quantum effects
// 🔒 SECURITY: @veritas quantum truth verification on equipment data

import React, { useMemo } from 'react';
import { useQuery } from '@apollo/client';

// 🎯 TITAN PATTERN IMPORTS - Core Dependencies
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Spinner } from '../atoms';

// 🎯 GRAPHQL QUERIES - V3.0 Integration
import { GET_EQUIPMENT_ITEM } from '../../graphql/queries/inventory';

// 🎯 ICONS - Heroicons for equipment theme
import {
  XMarkIcon,
  WrenchScrewdriverIcon,
  CogIcon,
  BoltIcon,
  SparklesIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  TagIcon,
  DocumentTextIcon,
  ClockIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

// 🎯 EQUIPMENT DETAIL V3.0 INTERFACE
interface EquipmentDetailV3Props {
  equipmentId: string;
  onClose: () => void;
  onEdit: (equipment: any) => void;
  isOpen: boolean;
}


export const EquipmentDetailV3: React.FC<EquipmentDetailV3Props> = ({
  equipmentId,
  onClose,
  onEdit,
  isOpen
}) => {
  // 🎯 GRAPHQL QUERY - Equipment Detail with @veritas
  const { data: equipmentData, loading, error, refetch } = useQuery(GET_EQUIPMENT_ITEM, {
    variables: { id: equipmentId },
    skip: !isOpen || !equipmentId
  });

  // 🎯 PROCESSED EQUIPMENT DATA
  const equipment = useMemo(() => {
    return equipmentData?.equipmentDetailV3 || null;
  }, [equipmentData]);

  // 🎯 EQUIPMENT STATUS CALCULATION
  const getEquipmentStatus = (item: any) => {
    if (!item) return { status: 'unknown', color: 'gray', label: 'Desconocido', bgColor: 'bg-gray-500/20', textColor: 'text-gray-300' };

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

  // 🎯 CONDITION BADGE CONFIG
  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case 'excellent':
        return { label: 'Excelente', bgColor: 'bg-green-500/20', textColor: 'text-green-300', borderColor: 'border-green-500/30' };
      case 'good':
        return { label: 'Buena', bgColor: 'bg-cyan-500/20', textColor: 'text-cyan-300', borderColor: 'border-cyan-500/30' };
      case 'fair':
        return { label: 'Regular', bgColor: 'bg-yellow-500/20', textColor: 'text-yellow-300', borderColor: 'border-yellow-500/30' };
      case 'poor':
        return { label: 'Deficiente', bgColor: 'bg-red-500/20', textColor: 'text-red-300', borderColor: 'border-red-500/30' };
      default:
        return { label: 'Desconocida', bgColor: 'bg-gray-500/20', textColor: 'text-gray-300', borderColor: 'border-gray-500/30' };
    }
  };

  // 🎯 STATUS BADGE CONFIG
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'Activo', bgColor: 'bg-green-500/20', textColor: 'text-green-300', borderColor: 'border-green-500/30' };
      case 'maintenance':
        return { label: 'En Mantenimiento', bgColor: 'bg-yellow-500/20', textColor: 'text-yellow-300', borderColor: 'border-yellow-500/30' };
      case 'inactive':
        return { label: 'Inactivo', bgColor: 'bg-gray-500/20', textColor: 'text-gray-300', borderColor: 'border-gray-500/30' };
      case 'retired':
        return { label: 'Retirado', bgColor: 'bg-pink-500/20', textColor: 'text-pink-300', borderColor: 'border-pink-500/30' };
      default:
        return { label: 'Desconocido', bgColor: 'bg-gray-500/20', textColor: 'text-gray-300', borderColor: 'border-gray-500/30' };
    }
  };

  // 🎯 CATEGORY ICON MAPPER
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'dental-chair':
        return CogIcon;
      case 'x-ray':
        return BoltIcon;
      case 'handpieces':
        return WrenchScrewdriverIcon;
      case 'sterilizers':
        return SparklesIcon;
      case 'lights':
        return BoltIcon;
      case 'suction':
        return WrenchScrewdriverIcon;
      default:
        return CogIcon;
    }
  };

  // 🎯 CATEGORY LABEL MAPPER
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'dental-chair':
        return 'Sillas Dentales';
      case 'x-ray':
        return 'Rayos X';
      case 'handpieces':
        return 'Instrumentos Rotatorios';
      case 'sterilizers':
        return 'Esterilizadores';
      case 'lights':
        return 'Iluminación';
      case 'suction':
        return 'Sistemas de Succión';
      default:
        return 'Otros';
    }
  };

  // 🎯 CALCULATE EQUIPMENT AGE
  const calculateAge = (purchaseDate: string) => {
    if (!purchaseDate) return 'Desconocida';

    const purchase = new Date(purchaseDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - purchase.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) return `${diffDays} días`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses`;
    return `${Math.floor(diffDays / 365)} años`;
  };

  // 🎯 CALCULATE DEPRECIATION
  const calculateDepreciation = (purchasePrice: number, currentValue: number) => {
    if (!purchasePrice || purchasePrice === 0) return 0;
    return ((purchasePrice - currentValue) / purchasePrice) * 100;
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <Card className="bg-gray-800 border border-purple-500/20 p-8">
          <div className="flex items-center space-x-4">
            <Spinner size="lg" />
            <span className="text-gray-300">Cargando detalles del equipo...</span>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <Card className="bg-gray-800 border border-red-500/20 p-8 max-w-md">
          <div className="text-center">
            <ExclamationTriangleIcon className="w-12 h-12 mx-auto text-red-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Error al cargar equipo</h3>
            <p className="text-gray-300 mb-4">
              {error ? 'Error de conexión' : 'Equipo no encontrado'}
            </p>
            <div className="flex space-x-3">
              <Button onClick={() => refetch()} variant="secondary" className="flex-1">
                Reintentar
              </Button>
              <Button onClick={onClose} variant="secondary" className="flex-1">
                Cerrar
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const equipmentStatus = getEquipmentStatus(equipment);
  const conditionBadge = getConditionBadge(equipment.condition);
  const statusBadge = getStatusBadge(equipment.status);
  const CategoryIcon = getCategoryIcon(equipment.category);
  const depreciation = calculateDepreciation(equipment.purchasePrice, equipment.currentValue);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm border border-purple-500/20">
        <CardHeader className="border-b border-gray-600/30 bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-cyan-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <CategoryIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  🎯 Detalles del Equipo V3.0
                </CardTitle>
                <h2 className="text-xl font-semibold text-white mt-1">{equipment.name}</h2>
                <p className="text-gray-300 text-sm">
                  {equipment.model} - {equipment.serialNumber}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="secondary"
                onClick={() => refetch()}
                disabled={loading}
                className="bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/30 text-purple-300"
              >
                <ClockIcon className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
              <Button
                onClick={() => onEdit(equipment)}
                className="bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white shadow-lg shadow-pink-500/25"
              >
                <WrenchScrewdriverIcon className="w-4 h-4 mr-2" />
                Editar
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

        <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Information Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Status Overview */}
              <Card className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-cyan-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-cyan-300 flex items-center space-x-2">
                    <InformationCircleIcon className="w-5 h-5" />
                    <span>Estado General</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${equipmentStatus.status === 'good' ? 'bg-green-400' : equipmentStatus.status === 'maintenance_due' ? 'bg-red-400' : 'bg-yellow-400'}`}></div>
                      <div>
                        <p className="text-sm text-gray-400">Estado Operativo</p>
                        <p className={`text-sm font-medium ${equipmentStatus.textColor}`}>{equipmentStatus.label}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${conditionBadge.textColor.replace('text-', 'bg-')}`}></div>
                      <div>
                        <p className="text-sm text-gray-400">Condición</p>
                        <p className={`text-sm font-medium ${conditionBadge.textColor}`}>{conditionBadge.label}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Badge className={`${statusBadge.bgColor} ${statusBadge.textColor} border ${statusBadge.borderColor}`}>
                      {statusBadge.label}
                    </Badge>
                    <Badge className={`${conditionBadge.bgColor} ${conditionBadge.textColor} border ${conditionBadge.borderColor}`}>
                      Condición: {conditionBadge.label}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Basic Information */}
              <Card className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-purple-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-purple-300 flex items-center space-x-2">
                    <DocumentTextIcon className="w-5 h-5" />
                    <span>Información Básica</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Categoría</label>
                      <div className="flex items-center space-x-2">
                        <CategoryIcon className="w-4 h-4 text-purple-400" />
                        <span className="text-white">{getCategoryLabel(equipment.category)}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Fabricante</label>
                      <p className="text-white">{equipment.manufacturer || 'No especificado'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Número de Serie</label>
                      <p className="text-white font-mono">{equipment.serialNumber}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Ubicación</label>
                      <div className="flex items-center space-x-2">
                        <MapPinIcon className="w-4 h-4 text-cyan-400" />
                        <span className="text-white">{equipment.location || 'No especificada'}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Information */}
              <Card className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-pink-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-pink-300 flex items-center space-x-2">
                    <CurrencyDollarIcon className="w-5 h-5" />
                    <span>Información Financiera</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Precio de Compra</label>
                      <p className="text-white text-lg font-semibold">
                        ${equipment.purchasePrice?.toLocaleString() || '0'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {equipment.purchaseDate ? new Date(equipment.purchaseDate).toLocaleDateString() : 'Fecha no especificada'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Valor Actual</label>
                      <p className="text-white text-lg font-semibold">
                        ${equipment.currentValue?.toLocaleString() || '0'}
                      </p>
                      <p className="text-xs text-gray-400">
                        Depreciación: {depreciation.toFixed(1)}%
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Antigüedad</label>
                      <p className="text-white text-lg font-semibold">
                        {calculateAge(equipment.purchaseDate)}
                      </p>
                      <p className="text-xs text-gray-400">
                        Desde compra
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Maintenance Information */}
              <Card className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-cyan-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-cyan-300 flex items-center space-x-2">
                    <CalendarDaysIcon className="w-5 h-5" />
                    <span>Mantenimiento</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Intervalo de Mantenimiento</label>
                      <p className="text-white">{equipment.maintenanceInterval || 365} días</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Último Mantenimiento</label>
                      <p className="text-white">
                        {equipment.lastMaintenance ? new Date(equipment.lastMaintenance).toLocaleDateString() : 'Nunca'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Próximo Mantenimiento</label>
                      <p className={`font-semibold ${equipmentStatus.status === 'maintenance_due' ? 'text-red-300' : 'text-green-300'}`}>
                        {equipment.nextMaintenance ? new Date(equipment.nextMaintenance).toLocaleDateString() : 'No programado'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Vencimiento de Garantía</label>
                      <p className={`font-semibold ${equipment.warrantyExpiry && new Date(equipment.warrantyExpiry) <= new Date() ? 'text-red-300' : 'text-green-300'}`}>
                        {equipment.warrantyExpiry ? new Date(equipment.warrantyExpiry).toLocaleDateString() : 'No especificada'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {equipment.notes && (
                <Card className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-500/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-gray-300 flex items-center space-x-2">
                      <TagIcon className="w-5 h-5" />
                      <span>Notas Adicionales</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white whitespace-pre-wrap">{equipment.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar Information */}
            <div className="space-y-6">
              {/* @veritas Verification */}
              {equipment._veritas && (
                <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 backdrop-blur-sm border border-green-500/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-green-300 flex items-center space-x-2">
                      <ShieldCheckIcon className="w-5 h-5" />
                      <span>Verificación @veritas</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Confianza:</span>
                      <span className="text-green-300 font-mono font-semibold">
                        {equipment._veritas.confidence}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Certificado:</span>
                      <span className="text-green-300 font-mono text-xs">
                        {equipment._veritas.certificate?.substring(0, 8)}...
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Nivel:</span>
                      <Badge className="bg-green-500/20 text-green-300 border border-green-500/30">
                        {equipment._veritas.level}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-purple-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-purple-300 flex items-center space-x-2">
                    <BoltIcon className="w-5 h-5" />
                    <span>Acciones Rápidas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => onEdit(equipment)}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    <WrenchScrewdriverIcon className="w-4 h-4 mr-2" />
                    Editar Equipo
                  </Button>

                  <Button
                    variant="secondary"
                    className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-500/30 text-cyan-300"
                  >
                    <CalendarDaysIcon className="w-4 h-4 mr-2" />
                    Programar Mantenimiento
                  </Button>

                  <Button
                    variant="secondary"
                    className="w-full bg-pink-500/20 hover:bg-pink-500/30 border-pink-500/30 text-pink-300"
                  >
                    <ChartBarIcon className="w-4 h-4 mr-2" />
                    Ver Historial
                  </Button>
                </CardContent>
              </Card>

              {/* Equipment Stats */}
              <Card className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-cyan-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-cyan-300 flex items-center space-x-2">
                    <ChartBarIcon className="w-5 h-5" />
                    <span>Estadísticas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Valor de Depreciación</span>
                    <span className="text-white font-semibold">{depreciation.toFixed(1)}%</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Días desde compra</span>
                    <span className="text-white font-semibold">
                      {equipment.purchaseDate ? Math.floor((new Date().getTime() - new Date(equipment.purchaseDate).getTime()) / (1000 * 60 * 60 * 24)) : 'N/A'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Estado</span>
                    <Badge className={`${statusBadge.bgColor} ${statusBadge.textColor} border ${statusBadge.borderColor} text-xs`}>
                      {statusBadge.label}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};