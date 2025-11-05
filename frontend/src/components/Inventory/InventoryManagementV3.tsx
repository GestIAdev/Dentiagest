// 🎯🎸💀 INVENTORY MANAGEMENT V3.0 - TITAN PATTERN IMPLEMENTATION
// Date: September 22, 2025
// Mission: Complete inventory management system with Titan Pattern
// Status: V3.0 - Full inventory control with materials, equipment, suppliers, and orders
// Challenge: Unified inventory management with real-time tracking and AI-powered insights
// 🎨 THEME: Cyberpunk Medical - Cyan/Purple/Pink gradients with quantum effects
// 🔒 SECURITY: @veritas quantum truth verification on critical inventory values

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@apollo/client';

// 🎯 TITAN PATTERN IMPORTS - Core Dependencies
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Spinner } from '../atoms';
import { createModuleLogger } from '../../utils/logger';

// 🎯 GRAPHQL QUERIES - V3.0 Integration
import { GET_INVENTORY_DASHBOARD, GET_INVENTORY_AI_INSIGHTS } from '../../graphql/queries/inventory';

// 🎯 INVENTORY SUB-COMPONENTS - V3 Integration
import DentalMaterialManagerV3 from './DentalMaterialManagerV3';
import EquipmentManagerV3 from './EquipmentManagerV3';
import SupplierManagerV3 from './SupplierManagerV3';
import PurchaseOrderManagerV3 from './PurchaseOrderManagerV3';

// 🎯 ICONS - Heroicons for inventory theme
import {
  CubeIcon,
  WrenchScrewdriverIcon,
  TruckIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  BoltIcon,
  CpuChipIcon,
  BuildingStorefrontIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  ShoppingBagIcon,
  ShieldCheckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const l = createModuleLogger('InventoryManagementV3');

// 🎯 INVENTORY MODULE CONFIGURATION
const INVENTORY_MODULES = [
  {
    id: 'materials',
    label: 'Materiales Dentales',
    description: 'Gestión de materiales y consumibles',
    icon: CubeIcon,
    color: 'cyan',
    component: DentalMaterialManagerV3
  },
  {
    id: 'equipment',
    label: 'Equipamiento',
    description: 'Control de equipos y mantenimiento',
    icon: WrenchScrewdriverIcon,
    color: 'purple',
    component: EquipmentManagerV3
  },
  {
    id: 'suppliers',
    label: 'Proveedores',
    description: 'Gestión de proveedores y contratos',
    icon: BuildingStorefrontIcon,
    color: 'pink',
    component: SupplierManagerV3
  },
  {
    id: 'orders',
    label: 'Órdenes de Compra',
    description: 'Pedidos y seguimiento de entregas',
    icon: ClipboardDocumentListIcon,
    color: 'emerald',
    component: PurchaseOrderManagerV3
  }
];

interface InventoryManagementV3Props {
  className?: string;
  defaultModule?: string;
  compactView?: boolean;
}

export const InventoryManagementV3: React.FC<InventoryManagementV3Props> = ({
  className = '',
  defaultModule = 'materials',
  compactView = false
}) => {
  // 🎯 MODULE STATE
  const [activeModule, setActiveModule] = useState(defaultModule);
  const [showAIInsights, setShowAIInsights] = useState(false);

  // 🎯 GRAPHQL QUERIES - V3.0 Dashboard Data
  const { data: dashboardData, loading: dashboardLoading, error: dashboardError, refetch: refetchDashboard } = useQuery(GET_INVENTORY_DASHBOARD);
  const { data: aiInsightsData, loading: aiInsightsLoading } = useQuery(GET_INVENTORY_AI_INSIGHTS, {
    variables: { context: 'inventory_overview' },
    skip: !showAIInsights
  });

  // 🎯 INVENTORY DASHBOARD STATE - From GraphQL
  const inventoryStats = useMemo(() => {
    if (!dashboardData?.inventoryDashboardV3) {
      return {
        totalMaterials: 0,
        lowStockAlerts: 0,
        activeEquipment: 0,
        maintenanceDue: 0,
        totalSuppliers: 0,
        pendingOrders: 0,
        totalValue: 0,
        totalValue_veritas: 0,
        _veritas: null
      };
    }

    return dashboardData.inventoryDashboardV3;
  }, [dashboardData]);

  // 🎯 AI INSIGHTS STATE
  const aiInsights = useMemo(() => {
    return aiInsightsData?.inventoryAIInsightsV3 || { insights: [], predictions: [], optimizations: [] };
  }, [aiInsightsData]);

  // 🎯 ACTIVE MODULE COMPONENT
  const ActiveModuleComponent = useMemo(() => {
    const module = INVENTORY_MODULES.find(m => m.id === activeModule);
    return module?.component || DentalMaterialManagerV3;
  }, [activeModule]);

  // 🎯 DASHBOARD CARDS - With @veritas verification
  const dashboardCards = [
    {
      title: 'Materiales Totales',
      value: inventoryStats.totalMaterials,
      icon: CubeIcon,
      color: 'cyan',
      trend: '+5.2%',
      veritasVerified: inventoryStats._veritas?.verified || false
    },
    {
      title: 'Alertas de Stock Bajo',
      value: inventoryStats.lowStockAlerts,
      icon: ExclamationTriangleIcon,
      color: 'red',
      trend: '-2.1%',
      veritasVerified: inventoryStats._veritas?.verified || false
    },
    {
      title: 'Equipos Activos',
      value: inventoryStats.activeEquipment,
      icon: CogIcon,
      color: 'green',
      trend: '+1.8%',
      veritasVerified: inventoryStats._veritas?.verified || false
    },
    {
      title: 'Mantenimiento Pendiente',
      value: inventoryStats.maintenanceDue,
      icon: WrenchScrewdriverIcon,
      color: 'yellow',
      trend: '0%',
      veritasVerified: inventoryStats._veritas?.verified || false
    },
    {
      title: 'Proveedores Activos',
      value: inventoryStats.totalSuppliers,
      icon: BuildingStorefrontIcon,
      color: 'purple',
      trend: '+3.1%',
      veritasVerified: inventoryStats._veritas?.verified || false
    },
    {
      title: 'Órdenes Pendientes',
      value: inventoryStats.pendingOrders,
      icon: ShoppingBagIcon,
      color: 'orange',
      trend: '+12.5%',
      veritasVerified: inventoryStats._veritas?.verified || false
    }
  ];

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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                🎯 Sistema de Inventario V3.0
              </h1>
              <p className="text-gray-300 mt-1">
                Control cuántico del inventario con verificación @veritas y IA predictiva
              </p>
              {inventoryStats._veritas && (
                <div className="flex items-center space-x-2 mt-2">
                  <ShieldCheckIcon className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-400 font-mono">
                    @veritas: {inventoryStats._veritas.confidence}% confianza
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="secondary"
              onClick={() => refetchDashboard()}
              disabled={dashboardLoading}
              className="bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-500/30 text-cyan-300"
            >
              <BoltIcon className="w-4 h-4 mr-2" />
              Actualizar Dashboard
            </Button>
            <Button
              variant={showAIInsights ? "default" : "secondary"}
              onClick={() => setShowAIInsights(!showAIInsights)}
              disabled={aiInsightsLoading}
              className="bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/30 text-purple-300"
            >
              <SparklesIcon className="w-4 h-4 mr-2" />
              🤖 IA Insights
            </Button>
          </div>
        </div>
      </div>

      {/* Dashboard Overview - Cyberpunk Medical Cards */}
      {!compactView && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {dashboardCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card key={index} className="relative overflow-hidden bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5"></div>
                <CardContent className="relative p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">{card.title}</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                        {card.value}
                      </p>
                      <p className={`text-xs ${
                        card.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {card.trend} vs mes anterior
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-${card.color}-500/20 to-${card.color}-600/20 border border-${card.color}-500/30`}>
                        <Icon className={`w-5 h-5 text-${card.color}-400`} />
                      </div>
                      {card.veritasVerified && (
                        <div className="flex items-center space-x-1">
                          <ShieldCheckIcon className="w-3 h-3 text-green-400" />
                          <span className="text-xs text-green-400 font-mono">V</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* AI Insights Panel */}
      {showAIInsights && (
        <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm border border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-purple-300">
              <SparklesIcon className="w-5 h-5" />
              <span>🤖 IA Insights - Análisis Predictivo</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {aiInsightsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner className="w-6 h-6 text-purple-400" />
                <span className="ml-2 text-purple-300">Analizando datos...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-cyan-300">📊 Insights Críticos</h4>
                  {aiInsights.insights?.slice(0, 3).map((insight: any, idx: number) => (
                    <div key={idx} className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                      <p className="text-sm text-cyan-200">{insight.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {insight.priority}
                        </Badge>
                        <span className="text-xs text-cyan-400">
                          {insight.confidence}% confianza
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-purple-300">🔮 Predicciones</h4>
                  {aiInsights.predictions?.slice(0, 3).map((pred: any, idx: number) => (
                    <div key={idx} className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <p className="text-sm text-purple-200">
                        Demanda prevista: {pred.predictedDemand}
                      </p>
                      <span className="text-xs text-purple-400">
                        Confianza: {pred.confidence}%
                      </span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-pink-300">⚡ Optimizaciones</h4>
                  {aiInsights.optimizations?.slice(0, 3).map((opt: any, idx: number) => (
                    <div key={idx} className="p-3 bg-pink-500/10 rounded-lg border border-pink-500/20">
                      <p className="text-sm text-pink-200">{opt.description}</p>
                      <span className="text-xs text-pink-400">
                        Ahorro: ${opt.potentialSavings}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Module Navigation - Cyberpunk Medical Theme */}
      <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-purple-300">
            <ChartBarIcon className="w-5 h-5" />
            <span>Módulos de Inventario - Provincia del Arsenal</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {INVENTORY_MODULES.map((module) => {
              const Icon = module.icon;
              const isActive = activeModule === module.id;

              return (
                <button
                  key={module.id}
                  onClick={() => setActiveModule(module.id)}
                  className={`relative overflow-hidden p-4 rounded-xl border-2 transition-all duration-300 text-left group ${
                    isActive
                      ? `border-${module.color}-400 bg-gradient-to-br from-${module.color}-500/20 to-${module.color}-600/20 shadow-lg shadow-${module.color}-500/25`
                      : 'border-gray-600/50 hover:border-gray-500/70 bg-gray-800/50 hover:bg-gray-700/50 backdrop-blur-sm'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5 opacity-50"></div>
                  <div className="relative flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? `bg-gradient-to-br from-${module.color}-500 to-${module.color}-600 shadow-lg shadow-${module.color}-500/50`
                        : 'bg-gray-700/50 group-hover:bg-gray-600/50'
                    }`}>
                      <Icon className={`w-6 h-6 transition-colors duration-300 ${
                        isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                      }`} />
                    </div>
                    <div>
                      <h3 className={`font-semibold transition-colors duration-300 ${
                        isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                      }`}>
                        {module.label}
                      </h3>
                      <p className={`text-sm transition-colors duration-300 ${
                        isActive ? 'text-gray-200' : 'text-gray-500 group-hover:text-gray-400'
                      }`}>
                        {module.description}
                      </p>
                    </div>
                  </div>
                  {isActive && (
                    <div className="absolute top-2 right-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Active Module Content */}
      <Card className="bg-gradient-to-br from-gray-900/30 to-gray-800/30 backdrop-blur-sm border border-cyan-500/20">
        <CardContent className="p-0">
          <ActiveModuleComponent />
        </CardContent>
      </Card>

      {/* Quick Actions Footer - Cyberpunk Medical Theme */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-cyan-900/20 via-purple-900/20 to-pink-900/20 backdrop-blur-sm border border-cyan-500/20">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
        <CardContent className="relative p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                ⚡ Acciones Cuánticas - El Arsenal
              </h3>
              <p className="text-gray-300 mt-1">
                Operaciones críticas del sistema de inventario con verificación @veritas
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="secondary"
                className="bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-500/30 text-cyan-300"
              >
                <TruckIcon className="w-4 h-4 mr-2" />
                Generar Reporte
              </Button>
              <Button
                variant="secondary"
                className="bg-red-500/20 hover:bg-red-500/30 border-red-500/30 text-red-300"
              >
                <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                Ver Alertas Críticas
              </Button>
              <Button
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25"
              >
                <BoltIcon className="w-4 h-4 mr-2" />
                🤖 Optimización IA
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryManagementV3;