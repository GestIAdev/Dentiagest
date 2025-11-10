// 🎯🎸💀 PURCHASE ORDER MANAGER V3.0 - TITAN PATTERN IMPLEMENTATION
// Date: September 26, 2025
// Mission: Complete purchase order management with @veritas quantum verification
// Status: V3.0 - Full marketplace system with quantum truth verification
// Challenge: Purchase order integrity and supplier verification with AI insights
// 🎨 THEME: Cyberpunk Medical - Cyan/Purple/Pink gradients with quantum effects
// 🔒 SECURITY: @veritas quantum truth verification on purchase transactions

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client/react';

// 🎯 TITAN PATTERN IMPORTS - Core Dependencies
import { Button } from '../../design-system/Button';
import { Card } from '../../design-system/Card';
import { CardHeader } from '../../design-system/Card';
import { CardBody } from '../../design-system/Card';
import { Input } from '../../design-system/Input';
import { Badge } from '../../design-system/Badge';
import { Spinner } from '../../design-system/Spinner';
import { createModuleLogger } from '../../utils/logger';

// 🎯 GRAPHQL QUERIES - V3.0 Integration
import {
  GET_PURCHASE_ORDERS,
  GET_SUPPLIERS,
  DELETE_PURCHASE_ORDER,
  PURCHASE_ORDER_UPDATED_SUBSCRIPTION,
  SUPPLIER_UPDATED_SUBSCRIPTION,
  SHOPPING_CART_UPDATED_SUBSCRIPTION,
  BILLING_INVOICE_UPDATED_SUBSCRIPTION,
  BILLING_PAYMENT_UPDATED_SUBSCRIPTION,
  COMPLIANCE_AUDIT_UPDATED_SUBSCRIPTION,
  COMPLIANCE_REGULATION_UPDATED_SUBSCRIPTION
} from '../../graphql/queries/marketplace';

// 🎯 SUBCOMPONENTS - Modular Architecture
import PurchaseOrderFormModalV3 from './PurchaseOrderFormModalV3';
import PurchaseOrderDetailViewV3 from './PurchaseOrderDetailViewV3';

// 🎯 ICONS - Heroicons for marketplace theme
import {
  ClipboardDocumentListIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XCircleIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  CalculatorIcon,
  CubeIcon,
  
} from '@heroicons/react/24/outline';

// 🎯 PURCHASE ORDER MANAGER V3.0 INTERFACE
interface PurchaseOrderManagerV3Props {
  className?: string;
}

// 🎯 PURCHASE ORDER INTERFACE - @veritas Enhanced
interface PurchaseOrder {
  id: string;
  orderNumber: string;
  orderNumber_veritas?: string;
  supplierId: string;
  supplierName: string;
  supplierName_veritas?: string;
  status: 'draft' | 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled';
  status_veritas?: string;
  orderDate: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  totalAmount: number;
  totalAmount_veritas?: number;
  taxAmount: number;
  shippingCost: number;
  notes: string;
  notes_veritas?: string;
  items: PurchaseOrderItem[];
  createdBy: string;
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

// 🎯 PURCHASE ORDER ITEM INTERFACE
interface PurchaseOrderItem {
  id: string;
  productName: string;
  productName_veritas?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  receivedQuantity?: number;
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

// 🎯 STATUS CONFIGURATION - Cyberpunk Theme
const ORDER_STATUS_CONFIG = {
  draft: { label: 'Borrador', bgColor: 'bg-gray-500/20', textColor: 'text-gray-300', borderColor: 'border-gray-500/30', icon: ClipboardDocumentListIcon },
  pending: { label: 'Pendiente', bgColor: 'bg-yellow-500/20', textColor: 'text-yellow-300', borderColor: 'border-yellow-500/30', icon: ClockIcon },
  approved: { label: 'Aprobado', bgColor: 'bg-blue-500/20', textColor: 'text-blue-300', borderColor: 'border-blue-500/30', icon: CheckCircleIcon },
  ordered: { label: 'Ordenado', bgColor: 'bg-purple-500/20', textColor: 'text-purple-300', borderColor: 'border-purple-500/30', icon: TruckIcon },
  received: { label: 'Recibido', bgColor: 'bg-green-500/20', textColor: 'text-green-300', borderColor: 'border-green-500/30', icon: CubeIcon },
  cancelled: { label: 'Cancelado', bgColor: 'bg-red-500/20', textColor: 'text-red-300', borderColor: 'border-red-500/30', icon: XCircleIcon }
};

// 🎯 LOGGER - Module specific logger
const l = createModuleLogger('PurchaseOrderManagerV3');

export const PurchaseOrderManagerV3: React.FC<PurchaseOrderManagerV3Props> = ({
  className = ''
}) => {
  // 🎯 STATE MANAGEMENT
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'orders' | 'analytics'>('orders');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);

  // 🎯 GRAPHQL QUERIES
  const { data: ordersData, loading: ordersLoading, refetch: refetchOrders } = useQuery(GET_PURCHASE_ORDERS, {
    variables: {
      status: statusFilter !== 'all' ? statusFilter : undefined,
      supplierId: supplierFilter !== 'all' ? supplierFilter : undefined,
      search: searchTerm || undefined,
      limit: 50,
      offset: 0
    }
  });

  const { data: suppliersData } = useQuery(GET_SUPPLIERS);

  // 🎯 GRAPHQL MUTATIONS
  const [deleteOrder] = useMutation(DELETE_PURCHASE_ORDER);

  // 🎯 GRAPHQL SUBSCRIPTION - Real-time updates
  useSubscription(PURCHASE_ORDER_UPDATED_SUBSCRIPTION, {
    onData: ({ data }) => {
      if (data?.data?.purchaseOrderUpdated) {
        l.info('Purchase order updated via subscription', { orderId: data.data.purchaseOrderUpdated.id });
        refetchOrders();
      }
    }
  });

  // 🎯 SUPPLIER SUBSCRIPTION - Real-time supplier updates
  useSubscription(SUPPLIER_UPDATED_SUBSCRIPTION, {
    onData: ({ data }) => {
      if (data?.data?.supplierUpdated) {
        l.info('Supplier updated via subscription', { supplierId: data.data.supplierUpdated.id });
        // Refetch suppliers data when supplier is updated
        // Note: In a full implementation, this would trigger a refetch of suppliers
      }
    }
  });

  // 🎯 SHOPPING CART SUBSCRIPTION - Real-time cart updates
  useSubscription(SHOPPING_CART_UPDATED_SUBSCRIPTION, {
    onData: ({ data }) => {
      if (data?.data?.shoppingCartUpdated) {
        l.info('Shopping cart updated via subscription', { cartId: data.data.shoppingCartUpdated.id });
        // Handle cart updates - could trigger cart state refresh
      }
    }
  });

  // 🎯 BILLING SUBSCRIPTIONS - Real-time billing updates
  useSubscription(BILLING_INVOICE_UPDATED_SUBSCRIPTION, {
    onData: ({ data }) => {
      if (data?.data?.billingInvoiceUpdated) {
        l.info('Billing invoice updated via subscription', { invoiceId: data.data.billingInvoiceUpdated.id });
        // Handle billing invoice updates - could trigger billing state refresh
      }
    }
  });

  useSubscription(BILLING_PAYMENT_UPDATED_SUBSCRIPTION, {
    onData: ({ data }) => {
      if (data?.data?.billingPaymentUpdated) {
        l.info('Billing payment updated via subscription', { paymentId: data.data.billingPaymentUpdated.id });
        // Handle billing payment updates - could trigger payment state refresh
      }
    }
  });

  // 🎯 COMPLIANCE SUBSCRIPTIONS - Real-time compliance updates
  useSubscription(COMPLIANCE_AUDIT_UPDATED_SUBSCRIPTION, {
    onData: ({ data }) => {
      if (data?.data?.complianceAuditUpdated) {
        l.info('Compliance audit updated via subscription', { auditId: data.data.complianceAuditUpdated.id });
        // Handle compliance audit updates - could trigger compliance state refresh
      }
    }
  });

  useSubscription(COMPLIANCE_REGULATION_UPDATED_SUBSCRIPTION, {
    onData: ({ data }) => {
      if (data?.data?.complianceRegulationUpdated) {
        l.info('Compliance regulation updated via subscription', { regulationId: data.data.complianceRegulationUpdated.id });
        // Handle compliance regulation updates - could trigger regulation state refresh
      }
    }
  });

  // 🎯 PROCESSED DATA
  const orders = useMemo(() => {
    return ordersData?.purchaseOrdersV3 || [];
  }, [ordersData]);

  const suppliers = useMemo(() => {
    return suppliersData?.suppliersV3 || [];
  }, [suppliersData]);

  // 🎯 FILTERED DATA
  const filteredOrders = useMemo(() => {
    return orders.filter((order: PurchaseOrder) => {
      const matchesSearch = !searchTerm ||
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesSupplier = supplierFilter === 'all' || order.supplierId === supplierFilter;

      return matchesSearch && matchesStatus && matchesSupplier;
    }).sort((a: PurchaseOrder, b: PurchaseOrder) => {
      // Sort by status priority, then by creation date
      const statusOrder = { draft: 1, pending: 2, approved: 3, ordered: 4, received: 5, cancelled: 6 };
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [orders, searchTerm, statusFilter, supplierFilter]);

  // 🎯 MARKETPLACE SUMMARY
  const marketplaceSummary = useMemo(() => {
    if (!orders.length) return null;

    const totalOrders = orders.length;
    const totalValue = orders.reduce((sum: number, order: PurchaseOrder) => sum + order.totalAmount, 0);
    const pendingOrders = orders.filter((order: PurchaseOrder) => order.status === 'pending').length;
    const overdueOrders = orders.filter((order: PurchaseOrder) =>
      order.status !== 'received' && order.status !== 'cancelled' &&
      order.estimatedDeliveryDate && new Date(order.estimatedDeliveryDate) < new Date()
    ).length;

    const supplierCount = new Set(orders.map((order: PurchaseOrder) => order.supplierId)).size;
    const avgOrderValue = totalValue / totalOrders;

    return {
      totalOrders,
      totalValue,
      pendingOrders,
      overdueOrders,
      supplierCount,
      avgOrderValue
    };
  }, [orders]);

  // 🎯 HANDLERS
  const handleCreateOrder = () => {
    setSelectedOrder(null);
    setShowOrderForm(true);
  };

  const handleEditOrder = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setShowOrderForm(true);
  };

  const handleViewOrder = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  const handleDeleteOrder = async (orderId: string) => {
    // if (!confirm('¿Estás seguro de que deseas eliminar esta orden de compra?')) return;

    try {
      await deleteOrder({
        variables: { id: orderId }
      });
      refetchOrders();
      l.info('Purchase order deleted successfully', { orderId });
    } catch (error) {
      l.error('Failed to delete purchase order', error as Error);
    }
  };

  const handleFormSuccess = () => {
    setShowOrderForm(false);
    setSelectedOrder(null);
    refetchOrders();
  };

  const handleCloseModals = () => {
    setShowOrderForm(false);
    setShowOrderDetail(false);
    setSelectedOrder(null);
  };

  // 🎯 GET STATUS INFO
  const getOrderStatusInfo = (status: string) => {
    return ORDER_STATUS_CONFIG[status as keyof typeof ORDER_STATUS_CONFIG] || ORDER_STATUS_CONFIG.draft;
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
      {/* 🎯 HEADER SECTION - Cyberpunk Medical Theme */}
      <Card className="relative bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 backdrop-blur-sm border border-cyan-500/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
        <CardHeader className="relative border-b border-gray-600/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <ClipboardDocumentListIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  🎯 Gestión de Órdenes de Compra V3.0
                </h2>
                <p className="text-gray-300 text-sm mt-1">
                  Mercado negro fortificado con verificación cuántica @veritas
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setActiveTab(activeTab === 'analytics' ? 'orders' : 'analytics')}
                variant="ghost"
                className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/20"
              >
                <ArrowTrendingUpIcon className="w-4 h-4 mr-2" />
                {activeTab === 'analytics' ? 'Ver Órdenes' : 'Ver Analytics'}
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

        {/* 🎯 MARKETPLACE SUMMARY - @veritas Enhanced */}
        {marketplaceSummary && (
          <CardBody className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">{marketplaceSummary.totalOrders}</div>
                <div className="text-xs text-gray-400">Órdenes Totales</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{formatCurrency(marketplaceSummary.totalValue)}</div>
                <div className="text-xs text-gray-400">Valor Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{marketplaceSummary.pendingOrders}</div>
                <div className="text-xs text-gray-400">Pendientes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{marketplaceSummary.overdueOrders}</div>
                <div className="text-xs text-gray-400">Vencidas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{marketplaceSummary.supplierCount}</div>
                <div className="text-xs text-gray-400">Proveedores</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-400">{formatCurrency(marketplaceSummary.avgOrderValue)}</div>
                <div className="text-xs text-gray-400">Promedio</div>
              </div>
            </div>
          </CardBody>
        )}
      </Card>

      {/* 🎯 NAVIGATION TABS - Cyberpunk Theme */}
      <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-600/30">
        <CardBody className="p-4">
          <div className="flex space-x-1">
            <Button
              onClick={() => setActiveTab('orders')}
              variant={activeTab === 'orders' ? 'default' : 'ghost'}
              className={`flex-1 ${activeTab === 'orders' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
            >
              <ClipboardDocumentListIcon className="w-4 h-4 mr-2" />
              Órdenes ({filteredOrders.length})
            </Button>
            <Button
              onClick={() => setActiveTab('analytics')}
              variant={activeTab === 'analytics' ? 'default' : 'ghost'}
              className={`flex-1 ${activeTab === 'analytics' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
            >
              <CalculatorIcon className="w-4 h-4 mr-2" />
              Analytics
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* 🎯 FILTERS SECTION - Advanced Filtering */}
      <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-600/30">
        <CardBody className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <option value="pending">Pendiente</option>
              <option value="approved">Aprobado</option>
              <option value="ordered">Ordenado</option>
              <option value="received">Recibido</option>
              <option value="cancelled">Cancelado</option>
            </select>

            <select
              value={supplierFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSupplierFilter(e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
            >
              <option value="all">Todos los Proveedores</option>
              {suppliers.map((supplier: any) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
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
                  setSupplierFilter('all');
                }}
                className="text-gray-400 hover:text-white hover:bg-gray-700/50"
              >
                <FunnelIcon className="w-4 h-4 mr-2" />
                Limpiar
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 🎯 MAIN CONTENT */}
      {activeTab === 'orders' && (
        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-cyan-500/20">
          <CardHeader className="pb-3">
            <h2 className="text-lg text-cyan-300 flex items-center space-x-2">
              <ClipboardDocumentListIcon className="w-5 h-5" />
              <span>Lista de Órdenes de Compra</span>
              <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                {filteredOrders.length}
              </Badge>
            </h2>
          </CardHeader>
          <CardBody>
            {ordersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="sm" />
                <span className="ml-2 text-gray-300">Cargando órdenes de compra...</span>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                <ClipboardDocumentListIcon className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">No se encontraron órdenes</h3>
                <p className="text-gray-500">Intenta ajustar los filtros o crea una nueva orden</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order: PurchaseOrder) => {
                  const statusInfo = getOrderStatusInfo(order.status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <Card key={order.id} className="bg-gray-800/30 border border-gray-600/30 hover:border-purple-500/30 transition-colors">
                      <CardBody className="p-4">
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
                                {order.supplierName} • {new Date(order.orderDate).toLocaleDateString()}
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
                            <span className="text-gray-400">Proveedor:</span>
                            <p className="text-white">{order.supplierName}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Fecha Orden:</span>
                            <p className="text-white">{new Date(order.orderDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Items:</span>
                            <p className="text-white">{order.items.length}</p>
                          </div>
                        </div>

                        {order.estimatedDeliveryDate && (
                          <div className="mb-3">
                            <span className="text-gray-400 text-sm">Entrega Estimada:</span>
                            <p className="text-white text-sm">{new Date(order.estimatedDeliveryDate).toLocaleDateString()}</p>
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
                            {order.status === 'pending' && order.estimatedDeliveryDate &&
                             new Date(order.estimatedDeliveryDate) < new Date() && (
                              <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">
                                ¡Vencida!
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewOrder(order)}
                              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </Button>
                            {(order.status === 'draft' || order.status === 'pending') && (
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
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {activeTab === 'analytics' && (
        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-purple-500/20">
          <CardHeader className="pb-3">
            <h2 className="text-lg text-purple-300 flex items-center space-x-2">
              <CalculatorIcon className="w-5 h-5" />
              <span>Analytics del Marketplace</span>
            </h2>
          </CardHeader>
          <CardBody>
            <div className="text-center py-8">
              <CalculatorIcon className="w-12 h-12 mx-auto text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">Analytics en Desarrollo</h3>
              <p className="text-gray-500">Funcionalidad de analytics próximamente disponible</p>
            </div>
          </CardBody>
        </Card>
      )}

      {/* 🎯 MODALS */}
      {showOrderForm && (
        <PurchaseOrderFormModalV3
          isOpen={showOrderForm}
          order={selectedOrder}
          suppliers={suppliers}
          onClose={handleCloseModals}
          onSuccess={handleFormSuccess}
        />
      )}

      {showOrderDetail && selectedOrder && (
        <PurchaseOrderDetailViewV3
          order={selectedOrder}
          onClose={handleCloseModals}
        />
      )}
    </div>
  );
};

export default PurchaseOrderManagerV3;
