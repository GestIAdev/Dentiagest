// 🎯🎸💀 SUPPLIER MANAGER V3.0 - TITAN PATTERN IMPLEMENTATION
// Date: September 26, 2025
// Mission: Complete supplier management with @veritas quantum verification
// Status: V3.0 - Full marketplace system with quantum truth verification
// Challenge: Supplier integrity and relationship verification with AI insights
// 🎨 THEME: Cyberpunk Medical - Cyan/Purple/Pink gradients with quantum effects
// 🔒 SECURITY: @veritas quantum truth verification on supplier data

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';

// 🎯 TITAN PATTERN IMPORTS - Core Dependencies
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Badge, Spinner } from '../atoms';
import { createModuleLogger } from '../../utils/logger';

// 🎯 GRAPHQL QUERIES - V3.0 Integration
import {
  GET_SUPPLIERS,
  DELETE_SUPPLIER,
  SUPPLIER_UPDATED_SUBSCRIPTION,
  PURCHASE_ORDER_UPDATED_SUBSCRIPTION,
  SHOPPING_CART_UPDATED_SUBSCRIPTION,
  BILLING_INVOICE_UPDATED_SUBSCRIPTION,
  BILLING_PAYMENT_UPDATED_SUBSCRIPTION,
  COMPLIANCE_AUDIT_UPDATED_SUBSCRIPTION,
  COMPLIANCE_REGULATION_UPDATED_SUBSCRIPTION
} from '../../graphql/queries/marketplace';

// 🎯 SUBCOMPONENTS - Modular Architecture
import SupplierFormModalV3 from './SupplierFormModalV3';
import SupplierDetailViewV3 from './SupplierDetailViewV3';

// 🎯 ICONS - Heroicons for marketplace theme
import {
  BuildingStorefrontIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ShieldCheckIcon,
  StarIcon,
  ChartBarIcon,
  GlobeAltIcon,
  
} from '@heroicons/react/24/outline';

// 🎯 SUPPLIER MANAGER V3.0 INTERFACE
interface SupplierManagerV3Props {
  className?: string;
}

// 🎯 SUPPLIER INTERFACE - @veritas Enhanced
interface Supplier {
  id: string;
  name: string;
  name_veritas?: string;
  contactName: string;
  contactName_veritas?: string;
  email: string;
  email_veritas?: string;
  phone: string;
  phone_veritas?: string;
  address: string;
  address_veritas?: string;
  taxId: string;
  taxId_veritas?: string;
  paymentTerms: string;
  paymentTerms_veritas?: string;
  creditLimit: number;
  creditLimit_veritas?: number;
  isActive: boolean;
  isActive_veritas?: boolean;
  categories: string[];
  categories_veritas?: string[];
  rating: number;
  rating_veritas?: number;
  lastOrderDate?: string;
  totalOrders: number;
  totalSpent: number;
  totalSpent_veritas?: number;
  createdAt: string;
  updatedAt: string;
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

export const SupplierManagerV3: React.FC<SupplierManagerV3Props> = ({
  className = ''
}) => {
  // 🎯 STATE MANAGEMENT
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'suppliers' | 'analytics'>('suppliers');
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showSupplierDetail, setShowSupplierDetail] = useState(false);

  // 🎯 GRAPHQL QUERIES
  const { data: suppliersData, loading: suppliersLoading, refetch: refetchSuppliers } = useQuery(GET_SUPPLIERS, {
    variables: {
      search: searchTerm || undefined,
      limit: 100,
      offset: 0
    }
  });

  // 🎯 GRAPHQL MUTATIONS
  const [deleteSupplier] = useMutation(DELETE_SUPPLIER);

  // 🎯 GRAPHQL SUBSCRIPTION - Real-time supplier updates
  useSubscription(SUPPLIER_UPDATED_SUBSCRIPTION, {
    onData: ({ data }) => {
      if (data?.data?.supplierUpdatedV3) {
        l.info('Supplier updated via subscription', { supplierId: data.data.supplierUpdatedV3.id });
        refetchSuppliers();
      }
    }
  });

  // 🎯 PURCHASE ORDER SUBSCRIPTION - Real-time order updates
  useSubscription(PURCHASE_ORDER_UPDATED_SUBSCRIPTION, {
    onData: ({ data }) => {
      if (data?.data?.purchaseOrderUpdated) {
        l.info('Purchase order updated via subscription', { orderId: data.data.purchaseOrderUpdated.id });
        // Handle purchase order updates - could trigger supplier analytics refresh
      }
    }
  });

  // 🎯 SHOPPING CART SUBSCRIPTION - Real-time cart updates
  useSubscription(SHOPPING_CART_UPDATED_SUBSCRIPTION, {
    onData: ({ data }) => {
      if (data?.data?.shoppingCartUpdated) {
        l.info('Shopping cart updated via subscription', { cartId: data.data.shoppingCartUpdated.id });
        // Handle cart updates - could trigger supplier availability refresh
      }
    }
  });

  // 🎯 BILLING SUBSCRIPTIONS - Real-time billing updates
  useSubscription(BILLING_INVOICE_UPDATED_SUBSCRIPTION, {
    onData: ({ data }) => {
      if (data?.data?.billingInvoiceUpdated) {
        l.info('Billing invoice updated via subscription', { invoiceId: data.data.billingInvoiceUpdated.id });
        // Handle billing invoice updates - could trigger supplier payment status refresh
      }
    }
  });

  useSubscription(BILLING_PAYMENT_UPDATED_SUBSCRIPTION, {
    onData: ({ data }) => {
      if (data?.data?.billingPaymentUpdated) {
        l.info('Billing payment updated via subscription', { paymentId: data.data.billingPaymentUpdated.id });
        // Handle billing payment updates - could trigger supplier payment status refresh
      }
    }
  });

  // 🎯 COMPLIANCE SUBSCRIPTIONS - Real-time compliance updates
  useSubscription(COMPLIANCE_AUDIT_UPDATED_SUBSCRIPTION, {
    onData: ({ data }) => {
      if (data?.data?.complianceAuditUpdated) {
        l.info('Compliance audit updated via subscription', { auditId: data.data.complianceAuditUpdated.id });
        // Handle compliance audit updates - could trigger supplier compliance status refresh
      }
    }
  });

  useSubscription(COMPLIANCE_REGULATION_UPDATED_SUBSCRIPTION, {
    onData: ({ data }) => {
      if (data?.data?.complianceRegulationUpdated) {
        l.info('Compliance regulation updated via subscription', { regulationId: data.data.complianceRegulationUpdated.id });
        // Handle compliance regulation updates - could trigger supplier compliance status refresh
      }
    }
  });

  // 🎯 PROCESSED DATA
  const suppliers = useMemo(() => {
    return suppliersData?.suppliersV3 || [];
  }, [suppliersData]);

  // 🎯 FILTERED DATA
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((supplier: Supplier) => {
      const matchesSearch = !searchTerm ||
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && supplier.isActive) ||
        (statusFilter === 'inactive' && !supplier.isActive);

      const matchesCategory = categoryFilter === 'all' ||
        supplier.categories.includes(categoryFilter);

      return matchesSearch && matchesStatus && matchesCategory;
    }).sort((a: Supplier, b: Supplier) => {
      // Sort by active status, then by rating, then by name
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
      if (a.rating !== b.rating) return b.rating - a.rating;
      return a.name.localeCompare(b.name);
    });
  }, [suppliers, searchTerm, statusFilter, categoryFilter]);

  // 🎯 SUPPLIER ANALYTICS
  const supplierAnalytics = useMemo(() => {
    if (!suppliers.length) return null;

    const totalSuppliers = suppliers.length;
    const activeSuppliers = suppliers.filter((s: Supplier) => s.isActive).length;
    const inactiveSuppliers = totalSuppliers - activeSuppliers;
    const avgRating = suppliers.reduce((sum: number, s: Supplier) => sum + s.rating, 0) / totalSuppliers;
    const totalSpent = suppliers.reduce((sum: number, s: Supplier) => sum + s.totalSpent, 0);
    const totalOrders = suppliers.reduce((sum: number, s: Supplier) => sum + s.totalOrders, 0);

    const topSuppliers = suppliers
      .filter((s: Supplier) => s.isActive)
      .sort((a: Supplier, b: Supplier) => b.totalSpent - a.totalSpent)
      .slice(0, 5);

    const categories = Array.from(new Set(suppliers.flatMap((s: Supplier) => s.categories)));

    return {
      totalSuppliers,
      activeSuppliers,
      inactiveSuppliers,
      avgRating,
      totalSpent,
      totalOrders,
      topSuppliers,
      categories
    };
  }, [suppliers]);

  // 🎯 HANDLERS
  const handleCreateSupplier = () => {
    setSelectedSupplier(null);
    setShowSupplierForm(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowSupplierForm(true);
  };

  const handleViewSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowSupplierDetail(true);
  };

  const handleDeleteSupplier = async (supplierId: string) => {
    // if (!confirm('¿Estás seguro de que deseas eliminar este proveedor? Esta acción no se puede deshacer.')) return;

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
    setShowSupplierForm(false);
    setSelectedSupplier(null);
    refetchSuppliers();
  };

  const handleCloseModals = () => {
    setShowSupplierForm(false);
    setShowSupplierDetail(false);
    setSelectedSupplier(null);
  };

  // 🎯 FORMAT CURRENCY
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // 🎯 RENDER STAR RATING
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-500'}`}
      />
    ));
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 🎯 HEADER SECTION - Cyberpunk Medical Theme */}
      <Card className="relative bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 backdrop-blur-sm border border-cyan-500/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
        <CardHeader className="relative border-b border-gray-600/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <BuildingStorefrontIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  🎯 Gestión de Proveedores V3.0
                </CardTitle>
                <p className="text-gray-300 text-sm mt-1">
                  Red de proveedores fortificada con verificación cuántica @veritas
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setActiveTab(activeTab === 'analytics' ? 'suppliers' : 'analytics')}
                variant="ghost"
                className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/20"
              >
                <ChartBarIcon className="w-4 h-4 mr-2" />
                {activeTab === 'analytics' ? 'Ver Proveedores' : 'Ver Analytics'}
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

        {/* 🎯 SUPPLIER SUMMARY - @veritas Enhanced */}
        {supplierAnalytics && (
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">{supplierAnalytics.totalSuppliers}</div>
                <div className="text-xs text-gray-400">Total Proveedores</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{supplierAnalytics.activeSuppliers}</div>
                <div className="text-xs text-gray-400">Activos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{supplierAnalytics.avgRating.toFixed(1)}</div>
                <div className="text-xs text-gray-400">Rating Promedio</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{formatCurrency(supplierAnalytics.totalSpent)}</div>
                <div className="text-xs text-gray-400">Total Gastado</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-400">{supplierAnalytics.totalOrders}</div>
                <div className="text-xs text-gray-400">Total Órdenes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">{supplierAnalytics.categories.length}</div>
                <div className="text-xs text-gray-400">Categorías</div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* 🎯 NAVIGATION TABS - Cyberpunk Theme */}
      <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-600/30">
        <CardContent className="p-4">
          <div className="flex space-x-1">
            <Button
              onClick={() => setActiveTab('suppliers')}
              variant={activeTab === 'suppliers' ? 'default' : 'ghost'}
              className={`flex-1 ${activeTab === 'suppliers' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
            >
              <BuildingStorefrontIcon className="w-4 h-4 mr-2" />
              Proveedores ({filteredSuppliers.length})
            </Button>
            <Button
              onClick={() => setActiveTab('analytics')}
              variant={activeTab === 'analytics' ? 'default' : 'ghost'}
              className={`flex-1 ${activeTab === 'analytics' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
            >
              <ChartBarIcon className="w-4 h-4 mr-2" />
              Analytics
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 🎯 FILTERS SECTION - Advanced Filtering */}
      <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-600/30">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
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
            </select>

            <select
              value={categoryFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategoryFilter(e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
            >
              <option value="all">Todas las Categorías</option>
              {supplierAnalytics?.categories.map((category) => (
                <option key={category as string} value={category as string}>
                  {category as string}
                </option>
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
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 🎯 MAIN CONTENT */}
      {activeTab === 'suppliers' && (
        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-cyan-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-cyan-300 flex items-center space-x-2">
              <BuildingStorefrontIcon className="w-5 h-5" />
              <span>Lista de Proveedores</span>
              <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                {filteredSuppliers.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                {filteredSuppliers.map((supplier: Supplier) => (
                  <Card key={supplier.id} className="bg-gray-800/30 border border-gray-600/30 hover:border-purple-500/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${supplier.isActive ? 'bg-green-500/20 border border-green-500/30' : 'bg-gray-500/20 border border-gray-500/30'}`}>
                            <BuildingStorefrontIcon className={`w-5 h-5 ${supplier.isActive ? 'text-green-400' : 'text-gray-400'}`} />
                          </div>
                          <div>
                            <h4 className="text-white font-semibold flex items-center space-x-2">
                              <span>{supplier.name}</span>
                              {supplier._veritas && (
                                <ShieldCheckIcon className="w-4 h-4 text-green-400" />
                              )}
                            </h4>
                            <p className="text-gray-400 text-sm">
                              {supplier.contactName} • {supplier.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${supplier.isActive ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
                            {supplier.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                          <div className="flex items-center space-x-1">
                            {renderStars(supplier.rating)}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-400">Teléfono:</span>
                          <p className="text-white">{supplier.phone}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Categorías:</span>
                          <p className="text-white">{supplier.categories.join(', ')}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Total Gastado:</span>
                          <p className="text-white font-semibold">{formatCurrency(supplier.totalSpent)}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Órdenes:</span>
                          <p className="text-white">{supplier.totalOrders}</p>
                        </div>
                      </div>

                      {supplier.lastOrderDate && (
                        <div className="mb-3">
                          <span className="text-gray-400 text-sm">Última Orden:</span>
                          <p className="text-white text-sm">{new Date(supplier.lastOrderDate).toLocaleDateString()}</p>
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
                          {supplier.creditLimit > 0 && (
                            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                              Límite: {formatCurrency(supplier.creditLimit)}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'analytics' && (
        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-purple-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-purple-300 flex items-center space-x-2">
              <ChartBarIcon className="w-5 h-5" />
              <span>Analytics de Proveedores</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {supplierAnalytics ? (
              <div className="space-y-6">
                {/* Top Suppliers */}
                <div>
                  <h4 className="text-white font-semibold mb-4 flex items-center">
                    <StarIcon className="w-5 h-5 mr-2 text-yellow-400" />
                    Top 5 Proveedores por Gasto
                  </h4>
                  <div className="space-y-3">
                    {supplierAnalytics.topSuppliers.map((supplier: Supplier, index: number) => (
                      <div key={supplier.id} className="flex items-center justify-between bg-gray-700/30 p-3 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-white font-semibold">{supplier.name}</p>
                            <p className="text-gray-400 text-sm">{supplier.totalOrders} órdenes</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-cyan-300 font-bold">{formatCurrency(supplier.totalSpent)}</p>
                          <div className="flex items-center space-x-1">
                            {renderStars(supplier.rating)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Categories Distribution */}
                <div>
                  <h4 className="text-white font-semibold mb-4 flex items-center">
                    <GlobeAltIcon className="w-5 h-5 mr-2 text-purple-400" />
                    Distribución por Categorías
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {supplierAnalytics.categories.map((category) => {
                      const count = suppliers.filter((s: Supplier) => s.categories.includes(category as string)).length;
                      return (
                        <div key={category as string} className="bg-gray-700/30 p-3 rounded-lg text-center">
                          <p className="text-purple-300 font-semibold">{category as string}</p>
                          <p className="text-gray-400 text-sm">{count} proveedores</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <ChartBarIcon className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">Analytics no disponibles</h3>
                <p className="text-gray-500">No hay suficientes datos de proveedores para generar analytics</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 🎯 MODALS */}
      {showSupplierForm && (
        <SupplierFormModalV3
          isOpen={showSupplierForm}
          supplier={selectedSupplier}
          onClose={handleCloseModals}
          onSuccess={handleFormSuccess}
        />
      )}

      {showSupplierDetail && selectedSupplier && (
        <SupplierDetailViewV3
          supplier={selectedSupplier}
          onClose={handleCloseModals}
        />
      )}
    </div>
  );
};

export default SupplierManagerV3;