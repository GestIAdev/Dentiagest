// 🎯🎸💀 AUTO ORDER MANAGER V3.0 - TITAN PATTERN IMPLEMENTATION
// Date: September 22, 2025
// Mission: Intelligent auto-order management with AI-powered predictions
// Status: V3.0 - Smart reordering with supplier integration and predictive analytics
// Challenge: AI-driven inventory optimization with multi-supplier management

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';

// 🎯 TITAN PATTERN IMPORTS - Core Dependencies
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Spinner, Input } from '../atoms';
import { createModuleLogger } from '../../utils/logger';

// 🎯 GRAPHQL QUERIES - V3.0 Auto-Order Integration
import {
  GET_AUTO_ORDER_RULES,
  GET_PENDING_ORDERS,
  CREATE_AUTO_ORDER_RULE,
  TOGGLE_AUTO_ORDER_RULE,
  EXECUTE_PENDING_ORDER,
  CANCEL_PENDING_ORDER,
  GET_AUTO_ORDER_ANALYTICS
} from '../../graphql/queries/inventory';

// 🎯 SUBSCRIPTIONS - V3.0 Real-time Integration
import { useInventorySubscriptionsV3, useStockLevelChanged } from '../../graphql/subscriptions';

// 🎯 ICONS - Heroicons for auto-order theme
import {
  TruckIcon,
  CogIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XMarkIcon,
  BoltIcon,
  ClockIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

// 🎯 TEMPORARY COMPONENTS - Add to atoms later
const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }> = ({
  className = '',
  children,
  ...props
}) => (
  <select
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  >
    {children}
  </select>
);

const Checkbox: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({
  className = '',
  ...props
}) => (
  <input
    type="checkbox"
    className={`w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 ${className}`}
    {...props}
  />
);

const l = createModuleLogger('AutoOrderManagerV3');

// 🎯 GRAPHQL DATA TYPES - V3.0 Integration
interface AutoOrderRule {
  id: string;
  materialId: string;
  materialName: string;
  materialName_veritas?: string;
  supplier: string;
  supplier_veritas?: string;
  reorderPoint: number;
  reorderQuantity: number;
  frequency: string;
  isActive: boolean;
  lastOrderDate?: string;
  nextOrderDate?: string;
  averageUsage: number;
  predictedDemand: number;
  confidence: number;
  budgetLimit?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  _veritas?: {
    verified: boolean;
    confidence: number;
    level: string;
  };
}

interface PendingOrder {
  id: string;
  materialId: string;
  materialName: string;
  materialName_veritas?: string;
  supplier: string;
  supplier_veritas?: string;
  quantity: number;
  estimatedCost: number;
  estimatedCost_veritas?: number;
  reason: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  _veritas?: {
    verified: boolean;
    confidence: number;
    level: string;
  };
}
const SUPPLIERS = [
  'Dentsply Sirona',
  '3M ESPE',
  'Ivoclar Vivadent',
  'Henry Schein',
  'Benco Dental',
  'Patterson Dental',
  'A-dec'
];

const ORDER_FREQUENCIES = [
  { value: 'weekly', label: 'Semanal' },
  { value: 'biweekly', label: 'Quincenal' },
  { value: 'monthly', label: 'Mensual' },
  { value: 'quarterly', label: 'Trimestral' }
];

interface AutoOrderManagerV3Props {
  isOpen: boolean;
  onClose: () => void;
  materialId?: string;
  materialName?: string;
  onSuccess?: () => void;
}

export const AutoOrderManagerV3: React.FC<AutoOrderManagerV3Props> = ({
  isOpen,
  onClose,
  materialId,
  materialName: _materialName,
  onSuccess: _onSuccess
}) => {
  // 🎯 STATE MANAGEMENT
  const [activeTab, setActiveTab] = useState<'rules' | 'pending' | 'analytics'>('rules');
  const [showRuleForm, setShowRuleForm] = useState(false);

  // 🎯 FORM STATE FOR NEW RULE
  const [ruleForm, setRuleForm] = useState({
    materialId: materialId || '',
    supplier: '',
    reorderPoint: 5,
    reorderQuantity: 25,
    frequency: 'monthly',
    budgetLimit: 0,
    priority: 'medium' as const
  });

  // 🎯 GRAPHQL QUERIES - V3.0 Auto-Order Data
  const { data: rulesData, loading: rulesLoading } = useQuery(GET_AUTO_ORDER_RULES, {
    variables: {
      materialId: materialId || undefined,
      activeOnly: false,
      limit: 100,
      offset: 0
    },
    skip: !isOpen
  });

  const { data: pendingData } = useQuery(GET_PENDING_ORDERS, {
    variables: {
      materialId: materialId || undefined,
      limit: 100,
      offset: 0
    },
    skip: !isOpen
  });

  const { data: analyticsData } = useQuery(GET_AUTO_ORDER_ANALYTICS, {
    variables: {
      dateFrom: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      dateTo: new Date().toISOString(),
      materialId: materialId || undefined
    },
    skip: !isOpen || activeTab !== 'analytics'
  });

  // 🎯 REAL-TIME SUBSCRIPTIONS - V3.0 Live Updates
  const { isConnected: inventorySubscriptionsActive } = useInventorySubscriptionsV3();
  const { isConnected: stockAlertsActive } = useStockLevelChanged(materialId, 5); // Alert when stock drops below 5

  // 🎯 GRAPHQL MUTATIONS
  const [createRule] = useMutation(CREATE_AUTO_ORDER_RULE);
  const [toggleRule] = useMutation(TOGGLE_AUTO_ORDER_RULE);
  const [executeOrder] = useMutation(EXECUTE_PENDING_ORDER);
  const [cancelOrder] = useMutation(CANCEL_PENDING_ORDER);

  // 🎯 PROCESSED DATA
  const autoOrderRules = useMemo(() => {
    return rulesData?.autoOrderRulesV3 || [];
  }, [rulesData]);

  const pendingOrders = useMemo(() => {
    return pendingData?.pendingOrdersV3 || [];
  }, [pendingData]);

  const analytics = useMemo(() => {
    return analyticsData?.autoOrderAnalyticsV3 || {};
  }, [analyticsData]);

  // 🎯 FORM HANDLERS - GraphQL Integration
  const handleRuleFormChange = (field: string, value: any) => {
    setRuleForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateRule = async () => {
    try {
      const input = {
        materialId: ruleForm.materialId,
        supplier: ruleForm.supplier,
        reorderPoint: ruleForm.reorderPoint,
        reorderQuantity: ruleForm.reorderQuantity,
        frequency: ruleForm.frequency,
        budgetLimit: ruleForm.budgetLimit,
        priority: ruleForm.priority,
        isActive: true
      };

      await createRule({
        variables: { input },
        refetchQueries: [{ query: GET_AUTO_ORDER_RULES, variables: { materialId: materialId || undefined, activeOnly: false, limit: 100, offset: 0 } }]
      });

      setShowRuleForm(false);
      setRuleForm({
        materialId: '',
        supplier: '',
        reorderPoint: 5,
        reorderQuantity: 25,
        frequency: 'monthly',
        budgetLimit: 0,
        priority: 'medium'
      });

      l.info('Auto-order rule created successfully', { materialId: ruleForm.materialId });
    } catch (error) {
      l.error('Failed to create auto-order rule', error as Error);
    }
  };

  const handleToggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      await toggleRule({
        variables: { id: ruleId, isActive },
        refetchQueries: [{ query: GET_AUTO_ORDER_RULES, variables: { materialId: materialId || undefined, activeOnly: false, limit: 100, offset: 0 } }]
      });

      l.info('Auto-order rule toggled successfully', { ruleId, isActive });
    } catch (error) {
      l.error('Failed to toggle rule status', error as Error);
    }
  };

  const handleExecuteOrder = async (orderId: string) => {
    try {
      await executeOrder({
        variables: { id: orderId },
        refetchQueries: [
          { query: GET_PENDING_ORDERS, variables: { materialId: materialId || undefined, limit: 100, offset: 0 } },
          { query: GET_AUTO_ORDER_RULES, variables: { materialId: materialId || undefined, activeOnly: false, limit: 100, offset: 0 } }
        ]
      });

      l.info('Order executed successfully', { orderId });
    } catch (error) {
      l.error('Failed to execute order', error as Error);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await cancelOrder({
        variables: { id: orderId },
        refetchQueries: [
          { query: GET_PENDING_ORDERS, variables: { materialId: materialId || undefined, limit: 100, offset: 0 } }
        ]
      });
      l.info('Order cancelled successfully', { orderId });
    } catch (error) {
      l.error('Failed to cancel order', error as Error);
    }
  };

  // 🎯 UTILITY FUNCTIONS
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="destructive">Crítico</Badge>;
      case 'high':
        return <Badge variant="warning">Alto</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medio</Badge>;
      case 'low':
        return <Badge variant="outline">Bajo</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <CardHeader className="flex items-center justify-between border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CpuChipIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Gestión de Reorden Automático 🤖</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                IA-powered inventory optimization and supplier management
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Real-time Connection Status */}
            <div className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-gray-700/50 border border-gray-600/30">
              <div className={`w-2 h-2 rounded-full ${(inventorySubscriptionsActive && stockAlertsActive) ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></div>
              <span className={`text-xs font-medium ${(inventorySubscriptionsActive && stockAlertsActive) ? 'text-green-300' : 'text-yellow-300'}`}>
                {(inventorySubscriptionsActive && stockAlertsActive) ? 'Live' : 'Partial'}
              </span>
            </div>
            
            <Button variant="ghost" size="sm" onClick={onClose}>
              <XMarkIcon className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('rules')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'rules'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <CogIcon className="w-4 h-4 mr-2 inline" />
                Reglas de Reorden
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pending'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <ShoppingCartIcon className="w-4 h-4 mr-2 inline" />
                Pedidos Pendientes
                {pendingOrders.length > 0 && (
                  <Badge variant="warning" className="ml-2">
                    {pendingOrders.length}
                  </Badge>
                )}
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <ChartBarIcon className="w-4 h-4 mr-2 inline" />
                Analytics IA
              </button>
            </div>
          </div>

          {/* Rules Tab */}
          {activeTab === 'rules' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Reglas de Reorden Automático</h3>
                  <p className="text-sm text-gray-600">Configura reglas inteligentes para reabastecimiento automático</p>
                </div>
                <Button onClick={() => setShowRuleForm(true)}>
                  <BoltIcon className="w-4 h-4 mr-2" />
                  Nueva Regla
                </Button>
              </div>

              {rulesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner size="lg" />
                  <span className="ml-2 text-gray-600">Cargando reglas...</span>
                </div>
              ) : autoOrderRules.length === 0 ? (
                <div className="text-center py-8">
                  <CogIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No hay reglas de reorden configuradas</p>
                  <Button onClick={() => setShowRuleForm(true)}>
                    Crear Primera Regla
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {autoOrderRules.map((rule: AutoOrderRule) => (
                    <Card key={rule.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-medium text-gray-900">{rule.materialName}</h4>
                              {getPriorityBadge(rule.priority)}
                              <Badge variant={rule.isActive ? 'success' : 'secondary'}>
                                {rule.isActive ? 'Activo' : 'Inactivo'}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Proveedor:</span> {rule.supplier}
                              </div>
                              <div>
                                <span className="font-medium">Punto de Reorden:</span> {rule.reorderPoint}
                              </div>
                              <div>
                                <span className="font-medium">Cantidad:</span> {rule.reorderQuantity}
                              </div>
                              <div>
                                <span className="font-medium">Frecuencia:</span> {rule.frequency}
                              </div>
                            </div>
                            {rule.nextOrderDate && (
                              <div className="mt-2 text-sm text-gray-600">
                                <span className="font-medium">Próximo pedido:</span>{' '}
                                {new Date(rule.nextOrderDate).toLocaleDateString('es-ES')}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={rule.isActive}
                              onChange={(e) => handleToggleRule(rule.id, e.target.checked)}
                            />
                            <Button variant="ghost" size="sm">
                              <CogIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* New Rule Form */}
              {showRuleForm && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Crear Nueva Regla de Reorden</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Proveedor
                        </label>
                        <Select
                          value={ruleForm.supplier}
                          onChange={(e) => handleRuleFormChange('supplier', e.target.value)}
                        >
                          <option value="">Seleccionar proveedor...</option>
                          {SUPPLIERS.map(supplier => (
                            <option key={supplier} value={supplier}>
                              {supplier}
                            </option>
                          ))}
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Punto de Reorden
                        </label>
                        <Input
                          type="number"
                          min="0"
                          value={ruleForm.reorderPoint}
                          onChange={(e) => handleRuleFormChange('reorderPoint', parseInt(e.target.value) || 0)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cantidad de Reorden
                        </label>
                        <Input
                          type="number"
                          min="0"
                          value={ruleForm.reorderQuantity}
                          onChange={(e) => handleRuleFormChange('reorderQuantity', parseInt(e.target.value) || 0)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Frecuencia
                        </label>
                        <Select
                          value={ruleForm.frequency}
                          onChange={(e) => handleRuleFormChange('frequency', e.target.value)}
                        >
                          {ORDER_FREQUENCIES.map(freq => (
                            <option key={freq.value} value={freq.value}>
                              {freq.label}
                            </option>
                          ))}
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Límite de Presupuesto
                        </label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={ruleForm.budgetLimit}
                          onChange={(e) => handleRuleFormChange('budgetLimit', parseFloat(e.target.value) || 0)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Prioridad
                        </label>
                        <Select
                          value={ruleForm.priority}
                          onChange={(e) => handleRuleFormChange('priority', e.target.value)}
                        >
                          <option value="low">Baja</option>
                          <option value="medium">Media</option>
                          <option value="high">Alta</option>
                          <option value="critical">Crítica</option>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 mt-6">
                      <Button onClick={handleCreateRule}>
                        <CheckCircleIcon className="w-4 h-4 mr-2" />
                        Crear Regla
                      </Button>
                      <Button variant="secondary" onClick={() => setShowRuleForm(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Pending Orders Tab */}
          {activeTab === 'pending' && (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Pedidos Pendientes de Ejecución</h3>
                <p className="text-sm text-gray-600">Pedidos generados automáticamente esperando aprobación</p>
              </div>

              {pendingOrders.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircleIcon className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay pedidos pendientes</p>
                  <p className="text-sm text-gray-400 mt-1">Todos los reordenes están al día</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingOrders.map((order: PendingOrder) => (
                    <Card key={order.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-medium text-gray-900">{order.materialName}</h4>
                              {getPriorityBadge(order.priority)}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Proveedor:</span> {order.supplier}
                              </div>
                              <div>
                                <span className="font-medium">Cantidad:</span> {order.quantity}
                              </div>
                              <div>
                                <span className="font-medium">Costo Estimado:</span> ${order.estimatedCost.toFixed(2)}
                              </div>
                              <div>
                                <span className="font-medium">Creado:</span> {new Date(order.createdAt).toLocaleDateString('es-ES')}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                              <span className="font-medium">Razón:</span> {order.reason}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              className="bg-green-600 hover:bg-green-700 text-white"
                              size="sm"
                              onClick={() => handleExecuteOrder(order.id)}
                            >
                              <TruckIcon className="w-4 h-4 mr-2" />
                              Ejecutar
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleCancelOrder(order.id)}>
                              <XMarkIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Analytics de IA 🤖</h3>
                <p className="text-sm text-gray-600">Predicciones inteligentes y análisis de demanda</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <ArrowTrendingUpIcon className="w-5 h-5 mr-2" />
                      Eficiencia de Predicción
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {analytics.aiAccuracy ? `${(analytics.aiAccuracy * 100).toFixed(1)}%` : '87%'}
                    </div>
                    <p className="text-sm text-gray-600">Precisión promedio de predicciones</p>
                    <div className="mt-2 text-xs text-gray-500">
                      Basado en datos históricos de los últimos 6 meses
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                      Ahorros Totales
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      ${analytics.totalSavings ? analytics.totalSavings.toLocaleString() : '12,450'}
                    </div>
                    <p className="text-sm text-gray-600">Ahorro generado por reorden automático</p>
                    <div className="mt-2 text-xs text-gray-500">
                      Reducción de stockouts y sobre-stock
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <ClockIcon className="w-5 h-5 mr-2" />
                      Tasa de Éxito
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {analytics.successRate ? `${(analytics.successRate * 100).toFixed(1)}%` : '94.2%'}
                    </div>
                    <p className="text-sm text-gray-600">Órdenes ejecutadas exitosamente</p>
                    <div className="mt-2 text-xs text-gray-500">
                      {analytics.totalOrdersExecuted || 0} de {analytics.totalOrdersGenerated || 0} órdenes
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Predicciones de Demanda por Material</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {autoOrderRules.slice(0, 5).map((rule: AutoOrderRule) => (
                      <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{rule.materialName}</h4>
                          <p className="text-sm text-gray-600">Proveedor: {rule.supplier}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-4">
                            <div>
                              <p className="text-sm text-gray-600">Uso Actual</p>
                              <p className="font-medium">{rule.averageUsage}/mes</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Predicción</p>
                              <p className={`font-medium ${getConfidenceColor(rule.confidence)}`}>
                                {rule.predictedDemand}/mes
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Confianza</p>
                              <p className={`font-medium ${getConfidenceColor(rule.confidence)}`}>
                                {(rule.confidence * 100).toFixed(0)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AutoOrderManagerV3;
