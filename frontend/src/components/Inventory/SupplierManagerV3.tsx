// 🎯🎸💀 SUPPLIER MANAGER V3.0 - TITAN PATTERN IMPLEMENTATION
// Date: September 25, 2025
// Mission: Complete supplier management with performance tracking and @veritas
// Status: V3.0 - Full supplier relationship management with quantum verification
// Challenge: Supplier performance analytics and contract management
// 🎨 THEME: Cyberpunk Medical - Cyan/Purple/Pink gradients with quantum effects
// 🔒 SECURITY: @veritas quantum truth verification on supplier data

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
  GET_SUPPLIERS,
  GET_SUPPLIER,
  CREATE_SUPPLIER,
  UPDATE_SUPPLIER,
  DELETE_SUPPLIER,
  GET_INVENTORY_ANALYTICS
} from '../../graphql/queries/inventory';

// 🎯 SUBCOMPONENTS - Modular Architecture
import SupplierFormV3 from './SupplierFormV3';
import SupplierDetailV3 from './SupplierDetailV3';
import SupplierPerformanceV3 from './SupplierPerformanceV3';

// 🎯 ICONS - Heroicons for supplier theme
import {
  BuildingStorefrontIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  StarIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

// 🎯 SUPPLIER MANAGER V3.0 INTERFACE
interface SupplierManagerV3Props {
  className?: string;
}

// 🎯 SUPPLIER INTERFACE
interface Supplier {
  id: string;
  name: string;
  name_veritas?: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
  paymentTerms: string;
  creditLimit: number;
  currentBalance: number;
  currentBalance_veritas?: number;
  status: 'active' | 'inactive' | 'suspended';
  status_veritas?: string;
  rating: number;
  categories: string[];
  contractStart?: string;
  contractEnd?: string;
  notes: string;
  notes_veritas?: string;
  createdAt: string;
  updatedAt: string;
  performanceMetrics?: {
    onTimeDelivery: number;
    qualityRating: number;
    responseTime: number;
    overallScore: number;
  };
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
const l = createModuleLogger('SupplierManagerV3');

// 🎯 SUPPLIER STATUS CONFIGURATION
const SUPPLIER_STATUS_CONFIG = {
  active: { label: 'Activo', bgColor: 'bg-green-500/20', textColor: 'text-green-300', borderColor: 'border-green-500/30' },
  inactive: { label: 'Inactivo', bgColor: 'bg-gray-500/20', textColor: 'text-gray-300', borderColor: 'border-gray-500/30' },
  suspended: { label: 'Suspendido', bgColor: 'bg-red-500/20', textColor: 'text-red-300', borderColor: 'border-red-500/30' }
};

// 🎯 PERFORMANCE RATING COLORS
const getRatingColor = (rating: number) => {
  if (rating >= 4.5) return 'text-green-400';
  if (rating >= 3.5) return 'text-yellow-400';
  if (rating >= 2.5) return 'text-orange-400';
  return 'text-red-400';
};

export const SupplierManagerV3: React.FC<SupplierManagerV3Props> = ({
  className = ''
}) => {
  // 🎯 STATE MANAGEMENT
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [currentView, setCurrentView] = useState<'list' | 'performance'>('list');

  // 🎯 GRAPHQL QUERIES
  const { data: suppliersData, loading: suppliersLoading, refetch: refetchSuppliers } = useQuery(GET_SUPPLIERS, {
    variables: {
      activeOnly: statusFilter === 'active',
      searchTerm: searchTerm || undefined,
      limit: 50,
      offset: 0
    }
  });

  const { data: analyticsData, loading: analyticsLoading } = useQuery(GET_INVENTORY_ANALYTICS, {
    variables: {
      category: 'suppliers'
    }
  });

  // 🎯 GRAPHQL MUTATIONS
  const [deleteSupplier] = useMutation(DELETE_SUPPLIER);

  // 🎯 PROCESSED DATA
  const suppliers = useMemo(() => {
    return (suppliersData as any)?.suppliersV3 || [];
  }, [suppliersData]);

  const analytics = useMemo(() => {
    return (analyticsData as any)?.inventoryAnalyticsV3 || null;
  }, [analyticsData]);

  // 🎯 FILTERED SUPPLIERS
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((supplier: Supplier) => {
      const matchesSearch = !searchTerm ||
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' ||
        supplier.categories.includes(categoryFilter);

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [suppliers, searchTerm, statusFilter, categoryFilter]);

  // 🎯 UNIQUE CATEGORIES
  const categories = useMemo(() => {
    const allCategories = suppliers.flatMap((supplier: Supplier) => supplier.categories);
    return Array.from(new Set(allCategories)) as string[];
  }, [suppliers]);

  // 🎯 PERFORMANCE METRICS SUMMARY
  const performanceSummary = useMemo(() => {
    if (!suppliers.length) return null;

    const totalSuppliers = suppliers.length;
    const activeSuppliers = suppliers.filter((s: Supplier) => s.status === 'active').length;
    const avgRating = suppliers.reduce((sum: number, s: Supplier) => sum + s.rating, 0) / totalSuppliers;
    const highPerformers = suppliers.filter((s: Supplier) => s.rating >= 4.0).length;

    return {
      totalSuppliers,
      activeSuppliers,
      avgRating: avgRating.toFixed(1),
      highPerformers,
      performanceRate: ((highPerformers / totalSuppliers) * 100).toFixed(1)
    };
  }, [suppliers]);

  // 🎯 HANDLERS
  const handleCreateSupplier = () => {
    setSelectedSupplier(null);
    setShowCreateForm(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowCreateForm(true);
  };

  const handleViewSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowDetailModal(true);
  };

  const handleViewPerformance = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowPerformanceModal(true);
  };

  const handleDeleteSupplier = async (supplierId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este proveedor?')) return;

    try {
      await deleteSupplier({
        variables: { id: supplierId }
      });
      refetchSuppliers();
      l.info('Supplier deleted successfully', { supplierId });
    } catch (error) {
      l.error('Failed to delete supplier', error as Error);
    }
  };

  const handleFormSuccess = () => {
    setShowCreateForm(false);
    setSelectedSupplier(null);
    refetchSuppliers();
  };

  const handleCloseModals = () => {
    setShowCreateForm(false);
    setShowDetailModal(false);
    setShowPerformanceModal(false);
    setSelectedSupplier(null);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Section */}
      <Card className="bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-cyan-900/20 backdrop-blur-sm border border-purple-500/20">
        <CardHeader className="border-b border-gray-600/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <BuildingStorefrontIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  🎯 Gestión de Proveedores V3.0
                </h2>
                <p className="text-gray-300 text-sm mt-1">
                  Gestión de relaciones con proveedores y análisis de rendimiento cuántico
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setCurrentView(currentView === 'list' ? 'performance' : 'list')}
                variant="ghost"
                className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/20"
              >
                <ChartBarIcon className="w-4 h-4 mr-2" />
                {currentView === 'list' ? 'Ver Rendimiento' : 'Ver Lista'}
              </Button>
              <Button
                onClick={handleCreateSupplier}
                className="bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white shadow-lg shadow-pink-500/25"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Nuevo Proveedor
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Performance Summary */}
        {performanceSummary && (
          <CardBody className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">{performanceSummary.totalSuppliers}</div>
                <div className="text-xs text-gray-400">Total Proveedores</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{performanceSummary.activeSuppliers}</div>
                <div className="text-xs text-gray-400">Activos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{performanceSummary.avgRating}</div>
                <div className="text-xs text-gray-400">Calificación Promedio</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{performanceSummary.highPerformers}</div>
                <div className="text-xs text-gray-400">Alto Rendimiento</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-400">{performanceSummary.performanceRate}%</div>
                <div className="text-xs text-gray-400">Tasa de Rendimiento</div>
              </div>
            </div>
          </CardBody>
        )}
      </Card>

      {/* Filters Section */}
      <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-600/30">
        <CardBody className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar proveedores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
            >
              <option value="all">Todos los Estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
              <option value="suspended">Suspendidos</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategoryFilter(e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
            >
              <option value="all">Todas las Categorías</option>
              {categories.map((category: string) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setCategoryFilter('all');
                }}
                className="text-gray-400 hover:text-white hover:bg-gray-700/50"
              >
                <FunnelIcon className="w-4 h-4 mr-2" />
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Main Content */}
      {currentView === 'list' ? (
        /* Suppliers List View */
        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-cyan-500/20">
          <CardHeader className="pb-3">
            <h2 className="text-lg text-cyan-300 flex items-center space-x-2">
              <BuildingStorefrontIcon className="w-5 h-5" />
              <span>Lista de Proveedores</span>
              <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                {filteredSuppliers.length}
              </Badge>
            </h2>
          </CardHeader>
          <CardBody>
            {suppliersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="sm" />
                <span className="ml-2 text-gray-300">Cargando proveedores...</span>
              </div>
            ) : filteredSuppliers.length === 0 ? (
              <div className="text-center py-8">
                <BuildingStorefrontIcon className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">No se encontraron proveedores</h3>
                <p className="text-gray-500">Intenta ajustar los filtros o crea un nuevo proveedor</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSuppliers.map((supplier: Supplier) => {
                  const statusConfig = SUPPLIER_STATUS_CONFIG[supplier.status as keyof typeof SUPPLIER_STATUS_CONFIG];

                  return (
                    <Card key={supplier.id} className="bg-gray-800/30 border border-gray-600/30 hover:border-purple-500/30 transition-colors">
                      <CardBody className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                              <BuildingStorefrontIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="text-white font-semibold flex items-center space-x-2">
                                <span>{supplier.name}</span>
                                {supplier._veritas && (
                                  <ShieldCheckIcon className="w-4 h-4 text-green-400" />
                                )}
                              </h4>
                              <p className="text-gray-400 text-sm">{supplier.contactPerson} • {supplier.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={`${statusConfig.bgColor} ${statusConfig.textColor} border ${statusConfig.borderColor}`}>
                              {statusConfig.label}
                            </Badge>
                            <div className="flex items-center space-x-1">
                              <StarIcon className={`w-4 h-4 ${getRatingColor(supplier.rating)}`} />
                              <span className={`text-sm font-medium ${getRatingColor(supplier.rating)}`}>
                                {supplier.rating.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-gray-400">Teléfono:</span>
                            <p className="text-white">{supplier.phone}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Saldo Actual:</span>
                            <p className="text-white">${supplier.currentBalance?.toLocaleString() || '0'}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Límite Crédito:</span>
                            <p className="text-white">${supplier.creditLimit?.toLocaleString() || '0'}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Categorías:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {supplier.categories.slice(0, 2).map(category => (
                                <Badge key={category} className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                                  {category}
                                </Badge>
                              ))}
                              {supplier.categories.length > 2 && (
                                <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30 text-xs">
                                  +{supplier.categories.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {supplier.contractEnd && (
                          <div className="mb-3">
                            <span className="text-gray-400 text-sm">Contrato vence:</span>
                            <p className="text-white text-sm">{new Date(supplier.contractEnd).toLocaleDateString()}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-gray-600/30">
                          <div className="flex items-center space-x-2">
                            {supplier._veritas && (
                              <div className="flex items-center space-x-1">
                                <ShieldCheckIcon className="w-4 h-4 text-green-400" />
                                <span className="text-green-400 text-xs font-mono">
                                  @veritas {supplier._veritas.confidence}%
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewPerformance(supplier)}
                              className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/20"
                            >
                              <ChartBarIcon className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewSupplier(supplier)}
                              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditSupplier(supplier)}
                              className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSupplier(supplier.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>
      ) : (
        /* Performance Analytics View */
        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-purple-500/20">
          <CardHeader className="pb-3">
            <h2 className="text-lg text-purple-300 flex items-center space-x-2">
              <ChartBarIcon className="w-5 h-5" />
              <span>Análisis de Rendimiento</span>
            </h2>
          </CardHeader>
          <CardBody>
            {analyticsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="sm" />
                <span className="ml-2 text-gray-300">Cargando análisis...</span>
              </div>
            ) : analytics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gray-800/30 rounded-lg border border-gray-600/30">
                  <div className="text-3xl font-bold text-cyan-400 mb-2">{analytics.supplierPerformance || 'N/A'}</div>
                  <div className="text-sm text-gray-400">Rendimiento General</div>
                </div>
                <div className="text-center p-4 bg-gray-800/30 rounded-lg border border-gray-600/30">
                  <div className="text-3xl font-bold text-green-400 mb-2">{analytics.totalValue ? `$${(analytics.totalValue / 1000000).toFixed(1)}M` : 'N/A'}</div>
                  <div className="text-sm text-gray-400">Valor Total de Inventario</div>
                </div>
                <div className="text-center p-4 bg-gray-800/30 rounded-lg border border-gray-600/30">
                  <div className="text-3xl font-bold text-purple-400 mb-2">{analytics.lowStockItems || 0}</div>
                  <div className="text-sm text-gray-400">Items con Stock Bajo</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <ChartBarIcon className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">No hay datos de análisis disponibles</h3>
                <p className="text-gray-500">Los datos de rendimiento se mostrarán aquí cuando estén disponibles</p>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Modals */}
      {showCreateForm && (
        <SupplierFormV3
          supplier={selectedSupplier}
          onClose={handleCloseModals}
          onSuccess={handleFormSuccess}
        />
      )}

      {showDetailModal && selectedSupplier && (
        <SupplierDetailV3
          supplier={selectedSupplier}
          onClose={handleCloseModals}
        />
      )}

      {showPerformanceModal && selectedSupplier && (
        <SupplierPerformanceV3
          supplier={selectedSupplier}
          onClose={handleCloseModals}
        />
      )}
    </div>
  );
};

export default SupplierManagerV3;
