// 🎯🎸💀 PURCHASE ORDER MANAGER V3.0 - TITAN PATTERN IMPLEMENTATION
// Date: September 25, 2025
// Mission: Complete purchase order management with approval workflow and @veritas
// Status: V3.0 - Full purchase order lifecycle management with quantum verification
// Challenge: Purchase order approval workflow and supplier integration
// 🎨 THEME: Cyberpunk Medical - Cyan/Purple/Pink gradients with quantum effects
// 🔒 SECURITY: @veritas quantum truth verification on purchase orders

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';

// 🎯 TITAN PATTERN IMPORTS - Core Dependencies
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Badge, Spinner } from '../atoms';
import { createModuleLogger } from '../../utils/logger';

// 🎯 GRAPHQL QUERIES - V3.0 Integration
import {
  GET_PURCHASE_ORDERS,
  GET_PURCHASE_ORDER,
  CREATE_PURCHASE_ORDER,
  UPDATE_PURCHASE_ORDER,
  DELETE_PURCHASE_ORDER,
  GET_SUPPLIERS
} from '../../graphql/queries/inventory';

// 🎯 SUBCOMPONENTS - Modular Architecture
import PurchaseOrderFormV3 from './PurchaseOrderFormV3';
import PurchaseOrderDetailV3 from './PurchaseOrderDetailV3';
import OrderApprovalV3 from './OrderApprovalV3';

// 🎯 ICONS - Heroicons for purchase order theme
import {
  DocumentTextIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TruckIcon,
  CurrencyDollarIcon,
  BuildingStorefrontIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// 🎯 PURCHASE ORDER MANAGER V3.0 INTERFACE
interface PurchaseOrderManagerV3Props {
  className?: string;
}

// 🎯 PURCHASE ORDER INTERFACE
interface PurchaseOrder {
  id: string;
  orderNumber: string;
  orderNumber_veritas?: string;
  supplierId: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'ordered' | 'received' | 'cancelled';
  status_veritas?: string;
  orderDate: string;
  expectedDelivery?: string;
  actualDelivery?: string;
  totalAmount: number;
  totalAmount_veritas?: number;
  taxAmount: number;
  discountAmount: number;
  notes: string;
  notes_veritas?: string;
  createdBy: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
  supplier?: {
    id: string;
    name: string;
    contactInfo: string;
  };
  items?: PurchaseOrderItem[];
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

// 🎯 PURCHASE ORDER ITEM INTERFACE
interface PurchaseOrderItem {
  id: string;
  materialId?: string;
  equipmentId?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  description: string;
  status: string;
}

// 🎯 LOGGER - Module specific logger
const l = createModuleLogger('PurchaseOrderManagerV3');

// 🎯 PURCHASE ORDER STATUS CONFIGURATION
const PURCHASE_ORDER_STATUS_CONFIG = {
  draft: { label: 'Borrador', bgColor: 'bg-gray-500/20', textColor: 'text-gray-300', borderColor: 'border-gray-500/30', icon: DocumentTextIcon },
  pending_approval: { label: 'Pendiente Aprobación', bgColor: 'bg-yellow-500/20', textColor: 'text-yellow-300', borderColor: 'border-yellow-500/30', icon: ClockIcon },
  approved: { label: 'Aprobada', bgColor: 'bg-green-500/20', textColor: 'text-green-300', borderColor: 'border-green-500/30', icon: CheckCircleIcon },
  ordered: { label: 'Ordenada', bgColor: 'bg-blue-500/20', textColor: 'text-blue-300', borderColor: 'border-blue-500/30', icon: TruckIcon },
  received: { label: 'Recibida', bgColor: 'bg-purple-500/20', textColor: 'text-purple-300', borderColor: 'border-purple-500/30', icon: CheckCircleIcon },
  cancelled: { label: 'Cancelada', bgColor: 'bg-red-500/20', textColor: 'text-red-300', borderColor: 'border-red-500/30', icon: XCircleIcon }
};

// 🎯 STATUS PRIORITY FOR SORTING
const STATUS_PRIORITY = {
  draft: 1,
  pending_approval: 2,
  approved: 3,
  ordered: 4,
  received: 5,
  cancelled: 6
};

export const PurchaseOrderManagerV3: React.FC<PurchaseOrderManagerV3Props> = ({
  className = ''
}) => {
  // 🎯 STATE MANAGEMENT
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [currentView, setCurrentView] = useState<'list' | 'analytics'>('list');

  // 🎯 GRAPHQL QUERIES
  const { data: ordersData, loading: ordersLoading, refetch: refetchOrders } = useQuery(GET_PURCHASE_ORDERS, {
    variables: {
      status: statusFilter !== 'all' ? statusFilter : undefined,
      supplierId: supplierFilter !== 'all' ? supplierFilter : undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      limit: 50,
      offset: 0
    }
  });

  const { data: suppliersData, loading: suppliersLoading } = useQuery(GET_SUPPLIERS, {
    variables: { limit: 100 }
  });

  // 🎯 GRAPHQL MUTATIONS
  const [deletePurchaseOrder] = useMutation(DELETE_PURCHASE_ORDER);

  // 🎯 PROCESSED DATA
  const purchaseOrders = useMemo(() => {
    return ordersData?.purchaseOrdersV3 || [];
  }, [ordersData]);

  const suppliers = useMemo(() => {
    return suppliersData?.suppliersV3 || [];
  }, [suppliersData]);

  // 🎯 FILTERED ORDERS
  const filteredOrders = useMemo(() => {
    return purchaseOrders.filter((order: PurchaseOrder) => {
      const matchesSearch = !searchTerm ||
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.supplier?.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesSupplier = supplierFilter === 'all' || order.supplierId === supplierFilter;

      return matchesSearch && matchesStatus && matchesSupplier;
    }).sort((a: PurchaseOrder, b: PurchaseOrder) => {
      // Sort by status priority, then by date
      const statusDiff = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
      if (statusDiff !== 0) return statusDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [purchaseOrders, searchTerm, statusFilter, supplierFilter]);

  // 🎯 ANALYTICS SUMMARY
  const analyticsSummary = useMemo(() => {
    if (!purchaseOrders.length) return null;

    const totalOrders = purchaseOrders.length;
    const totalValue = purchaseOrders.reduce((sum: number, order: PurchaseOrder) => sum + order.totalAmount, 0);
    const pendingOrders = purchaseOrders.filter((o: PurchaseOrder) => o.status === 'pending_approval').length;
    const approvedOrders = purchaseOrders.filter((o: PurchaseOrder) => o.status === 'approved').length;
    const receivedOrders = purchaseOrders.filter((o: PurchaseOrder) => o.status === 'received').length;
    const avgOrderValue = totalValue / totalOrders;

    return {
      totalOrders,
      totalValue,
      pendingOrders,
      approvedOrders,
      receivedOrders,
      avgOrderValue,
      approvalRate: totalOrders > 0 ? ((approvedOrders + receivedOrders) / totalOrders * 100).toFixed(1) : '0'
    };
  }, [purchaseOrders]);

  // 🎯 HANDLERS
  const handleCreateOrder = () => {
    setSelectedOrder(null);
    setShowCreateForm(true);
  };

  const handleEditOrder = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setShowCreateForm(true);
  };

  const handleViewOrder = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleApproveOrder = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setShowApprovalModal(true);
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta orden de compra?')) return;

    try {
      await deletePurchaseOrder({
        variables: { id: orderId }
      });
      refetchOrders();
      l.info('Purchase order deleted successfully', { orderId });
    } catch (error) {
      l.error('Failed to delete purchase order', error as Error);
    }
  };

  const handleFormSuccess = () => {
    setShowCreateForm(false);
    setSelectedOrder(null);
    refetchOrders();
  };

  const handleCloseModals = () => {
    setShowCreateForm(false);
    setShowDetailModal(false);
    setShowApprovalModal(false);
    setSelectedOrder(null);
  };

  // 🎯 GET STATUS INFO
  const getStatusInfo = (status: string) => {
    return PURCHASE_ORDER_STATUS_CONFIG[status as keyof typeof PURCHASE_ORDER_STATUS_CONFIG] || PURCHASE_ORDER_STATUS_CONFIG.draft;
  };

  // 🎯 FORMAT CURRENCY
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Section */}
      <Card className="bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-cyan-900/20 backdrop-blur-sm border border-purple-500/20">
        <CardHeader className="border-b border-gray-600/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <DocumentTextIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  🎯 Gestión de Órdenes de Compra V3.0
                </CardTitle>
                <p className="text-gray-300 text-sm mt-1">
                  Ciclo de vida completo de órdenes con flujo de aprobación cuántico
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setCurrentView(currentView === 'list' ? 'analytics' : 'list')}
                variant="ghost"
                className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/20"
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                {currentView === 'list' ? 'Ver Analytics' : 'Ver Lista'}
              </Button>
              <Button
                onClick={handleCreateOrder}
                className="bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white shadow-lg shadow-pink-500/25"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Nueva Orden
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Analytics Summary */}
        {analyticsSummary && (
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">{analyticsSummary.totalOrders}</div>
                <div className="text-xs text-gray-400">Total Órdenes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{formatCurrency(analyticsSummary.totalValue)}</div>
                <div className="text-xs text-gray-400">Valor Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{analyticsSummary.pendingOrders}</div>
                <div className="text-xs text-gray-400">Pendientes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{analyticsSummary.approvedOrders}</div>
                <div className="text-xs text-gray-400">Aprobadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{analyticsSummary.receivedOrders}</div>
                <div className="text-xs text-gray-400">Recibidas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-400">{formatCurrency(analyticsSummary.avgOrderValue)}</div>
                <div className="text-xs text-gray-400">Promedio</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-400">{analyticsSummary.approvalRate}%</div>
                <div className="text-xs text-gray-400">Tasa Aprobación</div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Filters Section */}
      <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-600/30">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar órdenes..."
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
              <option value="draft">Borrador</option>
              <option value="pending_approval">Pendiente Aprobación</option>
              <option value="approved">Aprobada</option>
              <option value="ordered">Ordenada</option>
              <option value="received">Recibida</option>
              <option value="cancelled">Cancelada</option>
            </select>

            <select
              value={supplierFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSupplierFilter(e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
            >
              <option value="all">Todos los Proveedores</option>
              {suppliers.map((supplier: any) => (
                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
              ))}
            </select>

            <Input
              type="date"
              placeholder="Desde"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20"
            />

            <Input
              type="date"
              placeholder="Hasta"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20"
            />

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setSupplierFilter('all');
                  setDateFrom('');
                  setDateTo('');
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

      {/* Main Content */}
      {currentView === 'list' ? (
        /* Orders List View */
        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-cyan-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-cyan-300 flex items-center space-x-2">
              <DocumentTextIcon className="w-5 h-5" />
              <span>Lista de Órdenes</span>
              <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                {filteredOrders.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="sm" />
                <span className="ml-2 text-gray-300">Cargando órdenes de compra...</span>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">No se encontraron órdenes</h3>
                <p className="text-gray-500">Intenta ajustar los filtros o crea una nueva orden</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order: PurchaseOrder) => {
                  const statusInfo = getStatusInfo(order.status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <Card key={order.id} className="bg-gray-800/30 border border-gray-600/30 hover:border-purple-500/30 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                              <StatusIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="text-white font-semibold flex items-center space-x-2">
                                <span>{order.orderNumber}</span>
                                {order._veritas && (
                                  <ShieldCheckIcon className="w-4 h-4 text-green-400" />
                                )}
                              </h4>
                              <p className="text-gray-400 text-sm">
                                {order.supplier?.name} • {new Date(order.orderDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={`${statusInfo.bgColor} ${statusInfo.textColor} border ${statusInfo.borderColor}`}>
                              {statusInfo.label}
                            </Badge>
                            <span className="text-white font-bold text-lg">
                              {formatCurrency(order.totalAmount)}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-gray-400">Estado:</span>
                            <p className="text-white">{statusInfo.label}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Fecha Orden:</span>
                            <p className="text-white">{new Date(order.orderDate).toLocaleDateString()}</p>
                          </div>
                          {order.expectedDelivery && (
                            <div>
                              <span className="text-gray-400">Entrega Esperada:</span>
                              <p className="text-white">{new Date(order.expectedDelivery).toLocaleDateString()}</p>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-400">Items:</span>
                            <p className="text-white">{order.items?.length || 0}</p>
                          </div>
                        </div>

                        {order.notes && (
                          <div className="mb-3">
                            <span className="text-gray-400 text-sm">Notas:</span>
                            <p className="text-white text-sm mt-1 line-clamp-2">{order.notes}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-gray-600/30">
                          <div className="flex items-center space-x-2">
                            {order._veritas && (
                              <div className="flex items-center space-x-1">
                                <ShieldCheckIcon className="w-4 h-4 text-green-400" />
                                <span className="text-green-400 text-xs font-mono">
                                  @veritas {order._veritas.confidence}%
                                </span>
                              </div>
                            )}
                            {order.approvedBy && (
                              <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                                Aprobada por {order.approvedBy}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            {order.status === 'pending_approval' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApproveOrder(order)}
                                className="text-green-400 hover:text-green-300 hover:bg-green-500/20"
                              >
                                <CheckCircleIcon className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewOrder(order)}
                              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </Button>
                            {(order.status === 'draft' || order.status === 'pending_approval') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditOrder(order)}
                                className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </Button>
                            )}
                            {(order.status === 'draft' || order.status === 'cancelled') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteOrder(order.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Analytics View */
        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-purple-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-purple-300 flex items-center space-x-2">
              <ArrowPathIcon className="w-5 h-5" />
              <span>Análisis de Órdenes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <ArrowPathIcon className="w-12 h-12 mx-auto text-purple-400 mb-4" />
              <h3 className="text-lg font-semibold text-purple-300 mb-2">Análisis Avanzado</h3>
              <p className="text-gray-400">Métricas detalladas y tendencias de órdenes próximamente</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      {showCreateForm && (
        <PurchaseOrderFormV3
          order={selectedOrder}
          suppliers={suppliers}
          onClose={handleCloseModals}
          onSuccess={handleFormSuccess}
        />
      )}

      {showDetailModal && selectedOrder && (
        <PurchaseOrderDetailV3
          order={selectedOrder}
          onClose={handleCloseModals}
        />
      )}

      {showApprovalModal && selectedOrder && (
        <OrderApprovalV3
          order={selectedOrder}
          onClose={handleCloseModals}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default PurchaseOrderManagerV3;