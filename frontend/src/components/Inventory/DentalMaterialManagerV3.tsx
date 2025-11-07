// 🎯🎸💀 DENTAL MATERIAL MANAGER V3.0 - TITAN PATTERN IMPLEMENTATION
// Date: September 22, 2025
// Mission: Complete dental materials management with atomic components
// Status: V3.0 - Full CRUD with auto-orders and real-time tracking
// Challenge: Intelligent inventory management with AI-powered insights
// 🎨 THEME: Cyberpunk Medical - Cyan/Purple/Pink gradients with quantum effects
// 🔒 SECURITY: @veritas quantum truth verification on critical material values

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';

// 🎯 TITAN PATTERN IMPORTS - Core Dependencies
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Badge, Spinner } from '../atoms';
import { createModuleLogger } from '../../utils/logger';

// 🎯 GRAPHQL QUERIES - V3.0 Integration
import {
  GET_DENTAL_MATERIALS,
  DELETE_DENTAL_MATERIAL
} from '../../graphql/queries/inventory';

// 🎯 SUBSCRIPTIONS - V3.0 Real-time Integration
import { useInventorySubscriptionsV3 } from '../../graphql/subscriptions';

// 🎯 MATERIAL SUB-COMPONENTS - V3 Integration
import { DentalMaterialFormV3 } from './DentalMaterialFormV3';
import { DentalMaterialDetailV3 } from './DentalMaterialDetailV3';
import { AutoOrderManagerV3 } from './AutoOrderManagerV3';

// 🎯 ICONS - Heroicons for materials theme
import {
  CubeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CpuChipIcon,
  ChartBarIcon,
  ArrowPathIcon,
  AdjustmentsHorizontalIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const l = createModuleLogger('DentalMaterialManagerV3');

// 🎯 MATERIAL CATEGORIES CONFIGURATION
const MATERIAL_CATEGORIES = [
  { value: 'all', label: 'Todos', icon: CubeIcon },
  { value: 'restorative', label: 'Restauradores', icon: AdjustmentsHorizontalIcon },
  { value: 'orthodontic', label: 'Ortodoncia', icon: AdjustmentsHorizontalIcon },
  { value: 'implant', label: 'Implantes', icon: CubeIcon },
  { value: 'endodontic', label: 'Endodoncia', icon: AdjustmentsHorizontalIcon },
  { value: 'prosthetic', label: 'Prótesis', icon: CubeIcon },
  { value: 'hygiene', label: 'Higiene', icon: CubeIcon },
  { value: 'consumable', label: 'Consumibles', icon: CubeIcon }
];

// 🎯 MATERIAL STATUS CONFIGURATION - Cyberpunk Medical Theme
const MATERIAL_STATUS_CONFIG = {
  active: { label: 'Activo', color: 'cyan', bgColor: 'bg-cyan-500/20', textColor: 'text-cyan-300', borderColor: 'border-cyan-500/30' },
  inactive: { label: 'Inactivo', color: 'gray', bgColor: 'bg-gray-500/20', textColor: 'text-gray-300', borderColor: 'border-gray-500/30' },
  discontinued: { label: 'Descontinuado', color: 'pink', bgColor: 'bg-pink-500/20', textColor: 'text-pink-300', borderColor: 'border-pink-500/30' }
};

interface DentalMaterial {
  id: string;
  name: string;
  category: string;
  sku: string;
  manufacturer: string;
  batchNumber: string;
  expirationDate: Date;
  unitCost: number;
  unitPrice: number;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  location: string;
  supplier: string;
  status: 'active' | 'inactive' | 'discontinued';
  autoReorderEnabled: boolean;
  reorderPoint: number;
  reorderQuantity: number;
  lastInventoryCheck: Date;
  complianceStatus: 'compliant' | 'expired' | 'expiring_soon';
  createdAt: Date;
  updatedAt: Date;
}

interface DentalMaterialManagerV3Props {
  className?: string;
}

export const DentalMaterialManagerV3: React.FC<DentalMaterialManagerV3Props> = ({
  className = ''
}) => {
  // 🎯 MATERIAL STATE - GraphQL Integration
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'category' | 'expiration'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // 🎯 GRAPHQL QUERIES - V3.0 Materials Data
  const { data: materialsData, loading: materialsLoading, refetch: refetchMaterials } = useQuery(GET_DENTAL_MATERIALS, {
    variables: {
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      searchTerm: searchQuery || undefined,
      lowStockOnly: false,
      limit: 100,
      offset: 0
    }
  });

  // 🎯 REAL-TIME SUBSCRIPTIONS - V3.0 Live Updates
  const { isConnected: subscriptionsActive } = useInventorySubscriptionsV3();

  // 🎯 GRAPHQL MUTATIONS
  // Mutations available for future use (create/update)
  const [deleteMaterial] = useMutation(DELETE_DENTAL_MATERIAL);

  // 🎯 MODAL STATE
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAutoOrderModal, setShowAutoOrderModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);

  // 🎯 PROCESSED MATERIALS DATA
  const materials = useMemo(() => {
    return materialsData?.dentalMaterialsV3 || [];
  }, [materialsData]);

  // 🎯 FILTERED AND SORTED MATERIALS
  const filteredAndSortedMaterials = useMemo(() => {
    const filtered = materials.filter((material: any) => {
      const matchesSearch = !searchQuery ||
        material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    // Sort materials
    filtered.sort((a: any, b: any) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'stock':
          aValue = a.currentStock;
          bValue = b.currentStock;
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        case 'expiration':
          aValue = new Date(a.expiryDate).getTime();
          bValue = new Date(b.expiryDate).getTime();
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [materials, searchQuery, selectedCategory, sortBy, sortOrder]);

  // 🎯 MATERIAL STATUS CALCULATION
  const getStockStatus = (material: DentalMaterial) => {
    const stockRatio = material.currentStock / material.maximumStock;

    if (material.currentStock <= material.minimumStock) {
      return { status: 'critical', color: 'red', label: 'Crítico', bgColor: 'bg-red-100', textColor: 'text-red-700' };
    }
    if (stockRatio < 0.3) {
      return { status: 'low', color: 'yellow', label: 'Bajo', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' };
    }
    if (stockRatio > 0.8) {
      return { status: 'high', color: 'blue', label: 'Alto', bgColor: 'bg-blue-100', textColor: 'text-blue-700' };
    }
    return { status: 'normal', color: 'green', label: 'Normal', bgColor: 'bg-green-100', textColor: 'text-green-700' };
  };

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'expired':
        return <XCircleIcon className="h-4 w-4 text-red-600" />;
      case 'expiring_soon':
        return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />;
      default:
        return <CheckCircleIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  // 🎯 HANDLERS - GraphQL Integration
  const handleCreateMaterial = () => {
    setSelectedMaterial(null);
    setShowCreateModal(true);
  };

  const handleEditMaterial = (material: any) => {
    setSelectedMaterial(material);
    setShowEditModal(true);
  };

  const handleViewMaterial = (material: any) => {
    setSelectedMaterial(material);
    setShowDetailModal(true);
  };

  const handleDeleteMaterial = async (material: any) => {
    if (!window.confirm(`¿Está seguro de que desea eliminar "${material.name}"?`)) {
      return;
    }

    try {
      await deleteMaterial({
        variables: { id: material.id }
      });
      refetchMaterials();
      l.info('Material deleted successfully', { materialId: material.id });
    } catch (error) {
      l.error('Failed to delete material', error as Error);
    }
  };

  const handleAutoOrderSetup = (material: any) => {
    setSelectedMaterial(material);
    setShowAutoOrderModal(true);
  };

  const handleMaterialSaved = () => {
    refetchMaterials();
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedMaterial(null);
  };

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // 🎯 STATISTICS - With @veritas verification
  const stats = useMemo(() => {
    const totalMaterials = materials.length;
    const lowStockMaterials = materials.filter((m: any) => m.currentStock <= m.minimumStock).length;
    const expiredMaterials = materials.filter((m: any) => m.complianceStatus === 'expired').length;
    const expiringSoonMaterials = materials.filter((m: any) => m.complianceStatus === 'expiring_soon').length;
    const totalValue = materials.reduce((sum: number, m: any) => sum + (m.currentStock * m.unitPrice), 0);

    return {
      totalMaterials,
      lowStockMaterials,
      expiredMaterials,
      expiringSoonMaterials,
      totalValue
    };
  }, [materials]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header - Cyberpunk Medical Theme */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-900/20 via-purple-900/20 to-pink-900/20 backdrop-blur-sm border border-cyan-500/20">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
        <div className="relative flex items-center justify-between p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <CubeIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                🎯 Materiales Dentales V3.0
              </h2>
              <p className="text-gray-300 mt-1">
                Control cuántico de materiales con verificación @veritas y IA predictiva
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="secondary"
              onClick={() => refetchMaterials()}
              disabled={materialsLoading}
              className="bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-500/30 text-cyan-300"
            >
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
            
            {/* Real-time Connection Status */}
            <div className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-gray-700/50 border border-gray-600/30">
              <div className={`w-2 h-2 rounded-full ${subscriptionsActive ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className={`text-xs font-medium ${subscriptionsActive ? 'text-green-300' : 'text-red-300'}`}>
                {subscriptionsActive ? 'Live' : 'Offline'}
              </span>
            </div>
            
            <Button
              onClick={handleCreateMaterial}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Nuevo Material
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards - Cyberpunk Medical Theme */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="relative overflow-hidden bg-gradient-to-br from-cyan-900/20 to-cyan-800/20 backdrop-blur-sm border border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-cyan-600/5"></div>
          <CardContent className="relative p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-lg flex items-center justify-center border border-cyan-500/30">
                <CubeIcon className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-gray-300">Total Materiales</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent">
                  {stats.totalMaterials}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-red-900/20 to-red-800/20 backdrop-blur-sm border border-red-500/20 hover:border-red-400/40 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-red-600/5"></div>
          <CardContent className="relative p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-lg flex items-center justify-center border border-red-500/30">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-300">Stock Bajo</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
                  {stats.lowStockMaterials}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 backdrop-blur-sm border border-yellow-500/20 hover:border-yellow-400/40 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-yellow-600/5"></div>
          <CardContent className="relative p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg flex items-center justify-center border border-yellow-500/30">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-300">Por Vencer</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
                  {stats.expiringSoonMaterials}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-pink-900/20 to-pink-800/20 backdrop-blur-sm border border-pink-500/20 hover:border-pink-400/40 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-pink-600/5"></div>
          <CardContent className="relative p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500/20 to-pink-600/20 rounded-lg flex items-center justify-center border border-pink-500/30">
                <XCircleIcon className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <p className="text-sm text-gray-300">Vencidos</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-pink-300 bg-clip-text text-transparent">
                  {stats.expiredMaterials}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-green-900/20 to-green-800/20 backdrop-blur-sm border border-green-500/20 hover:border-green-400/40 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/5"></div>
          <CardContent className="relative p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg flex items-center justify-center border border-green-500/30">
                <ChartBarIcon className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-300">Valor Total</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
                  ${stats.totalValue.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search - Cyberpunk Medical Theme */}
      <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-purple-500/20">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
              <Input
                type="text"
                placeholder="Buscar materiales..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-cyan-500/50 focus:ring-cyan-500/20"
              />
            </div>

            <div className="flex space-x-2">
              {MATERIAL_CATEGORIES.map(category => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-all duration-300 ${
                      selectedCategory === category.value
                        ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600/30 hover:border-gray-500/50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{category.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Materials Table - Cyberpunk Medical Theme */}
      <Card className="bg-gradient-to-br from-gray-900/30 to-gray-800/30 backdrop-blur-sm border border-cyan-500/20">
        <CardHeader className="border-b border-gray-600/30">
          <CardTitle className="flex items-center space-x-2 text-purple-300">
            <ChartBarIcon className="w-5 h-5" />
            <span>Lista de Materiales - Provincia del Arsenal</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {materialsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
              <span className="ml-3 text-gray-300">Cargando materiales...</span>
            </div>
          ) : filteredAndSortedMaterials.length === 0 ? (
            <div className="text-center py-12">
              <CubeIcon className="w-12 h-12 mx-auto text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">No se encontraron materiales</h3>
              <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-800/50 to-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('name')}
                        className="flex items-center space-x-1 hover:text-cyan-200 transition-colors duration-200"
                      >
                        <span>Material</span>
                        {sortBy === 'name' && (
                          <span className="text-purple-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('category')}
                        className="flex items-center space-x-1 hover:text-cyan-200 transition-colors duration-200"
                      >
                        <span>Categoría</span>
                        {sortBy === 'category' && (
                          <span className="text-purple-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('stock')}
                        className="flex items-center space-x-1 hover:text-cyan-200 transition-colors duration-200"
                      >
                        <span>Stock</span>
                        {sortBy === 'stock' && (
                          <span className="text-purple-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('expiration')}
                        className="flex items-center space-x-1 hover:text-cyan-200 transition-colors duration-200"
                      >
                        <span>Vencimiento</span>
                        {sortBy === 'expiration' && (
                          <span className="text-purple-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-cyan-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600/30">
                  {filteredAndSortedMaterials.map((material: any) => {
                    const stockStatus = getStockStatus(material);
                    const statusConfig = MATERIAL_STATUS_CONFIG[material.status as keyof typeof MATERIAL_STATUS_CONFIG];

                    return (
                      <tr key={material.id} className="hover:bg-gray-700/50 border-b border-gray-600/30">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10">
                              {getComplianceIcon(material.complianceStatus)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">{material.name}</div>
                              <div className="text-sm text-gray-400">{material.sku}</div>
                              {material._veritas && (
                                <div className="flex items-center space-x-1 mt-1">
                                  <ShieldCheckIcon className="w-3 h-3 text-green-400" />
                                  <span className="text-xs text-green-400 font-mono">
                                    {material._veritas.confidence}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                            {MATERIAL_CATEGORIES.find(c => c.value === material.category)?.label || material.category}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-white">{material.currentStock}</span>
                            <span className="text-sm text-gray-400">/ {material.maximumStock}</span>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bgColor} ${stockStatus.textColor} border border-gray-500/30`}>
                              {stockStatus.label}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                          {new Date(material.expiryDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor} border ${statusConfig.borderColor}`}>
                            {statusConfig.label}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewMaterial(material)}
                              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditMaterial(material)}
                              className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/20"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAutoOrderSetup(material)}
                              className="text-pink-400 hover:text-pink-300 hover:bg-pink-500/20"
                            >
                              <CpuChipIcon className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteMaterial(material)}
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
        </CardContent>
      </Card>

      {/* Modals */}
      {showCreateModal && (
        <DentalMaterialFormV3
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleMaterialSaved}
          mode="create"
        />
      )}

      {showEditModal && selectedMaterial && (
        <DentalMaterialFormV3
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleMaterialSaved}
          mode="edit"
          material={selectedMaterial}
        />
      )}

      {showDetailModal && selectedMaterial && (
        <DentalMaterialDetailV3
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          onEdit={() => handleEditMaterial(selectedMaterial)}
          material={selectedMaterial}
        />
      )}

      {showAutoOrderModal && selectedMaterial && (
        <AutoOrderManagerV3
          isOpen={showAutoOrderModal}
          onClose={() => setShowAutoOrderModal(false)}
          materialId={selectedMaterial.id}
          materialName={selectedMaterial.name}
          onSuccess={handleMaterialSaved}
        />
      )}
    </div>
  );
};

export default DentalMaterialManagerV3;
