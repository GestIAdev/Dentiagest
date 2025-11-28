/**
 * 📦🎸💀 INVENTORY PAGE V4 - HUB LOGÍSTICO UNIFICADO
 * ====================================================
 * By PunkClaude & Radwulf - November 2025
 * 
 * ORDEN TÁCTICA: FUSIÓN LOGÍSTICA (INVENTORY + MARKETPLACE)
 * Un solo módulo para gobernarlos a todos.
 * 
 * AXIOMAS:
 * - FULL BLEED: h-full w-full flex flex-col
 * - TABS: Stock, Marketplace, Pedidos, Proveedores
 * - NO MOCKS: GraphQL real conectado
 * - SINGULARIDAD: Del "Stock Bajo" a la "Compra" en un clic
 */

import React, { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

// Icons
import {
  CubeIcon,
  ShoppingCartIcon,
  TruckIcon,
  BuildingStorefrontIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  WrenchScrewdriverIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

// GraphQL
import {
  GET_DENTAL_MATERIALS,
  GET_EQUIPMENT,
  GET_SUPPLIERS,
  GET_PURCHASE_ORDERS,
  GET_INVENTORY_DASHBOARD,
} from '../graphql/queries/inventory';

// Subscriptions - V3 Hook (no callbacks, just returns state)
import { useInventorySubscriptionsV3 } from '../hooks/useInventorySubscriptionsV3';

// Form Sheets - V4 CRUD (Unified Item Sheet for Materials + Equipment)
import InventoryItemSheet from '../components/Inventory/InventoryItemSheet';
import SupplierFormSheet from '../components/Inventory/SupplierFormSheet';

// ============================================================================
// TYPES
// ============================================================================

type ItemType = 'material' | 'equipment';

interface DentalMaterial {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minimumStock: number;
  unitPrice: number;
  unit: string;
  supplierId?: string;
  supplierName?: string;
  expirationDate?: string;
  location?: string;
  createdAt: string;
}

interface Equipment {
  id: string;
  name: string;
  category: string;
  status: string;
  serialNumber?: string;
  manufacturer?: string;
  purchaseDate?: string;
  warrantyExpiration?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  location?: string;
}

interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  category?: string;
  rating?: number;
  status: string;
  createdAt: string;
}

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName?: string;
  status: string;
  totalAmount: number;
  orderDate: string;
  expectedDeliveryDate?: string;
  deliveryDate?: string;
  notes?: string;
  itemCount?: number;
}

interface InventoryDashboard {
  totalMaterials: number;
  lowStockAlerts: number;
  activeEquipment: number;
  maintenanceDue: number;
  totalSuppliers: number;
  pendingOrders: number;
  totalValue: number;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return '€0.00';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

const formatDate = (val: string | number | null | undefined): string => {
  if (!val) return '-';
  try {
    const date = new Date(val);
    if (isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch {
    return '-';
  }
};

// ============================================================================
// KPI CARD COMPONENT
// ============================================================================

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'cyan' | 'emerald' | 'amber' | 'red' | 'purple' | 'pink';
  trend?: 'up' | 'down' | 'neutral';
}

const KPICard: React.FC<KPICardProps> = ({ title, value, subtitle, icon, color, trend }) => {
  const colorClasses = {
    cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400',
    emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
    amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400',
    red: 'from-red-500/20 to-red-600/10 border-red-500/30 text-red-400',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
    pink: 'from-pink-500/20 to-pink-600/10 border-pink-500/30 text-pink-400',
  };

  const glowClasses = {
    cyan: 'shadow-[0_0_20px_rgba(6,182,212,0.15)]',
    emerald: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    amber: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    red: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]',
    purple: 'shadow-[0_0_20px_rgba(168,85,247,0.15)]',
    pink: 'shadow-[0_0_20px_rgba(236,72,153,0.15)]',
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border p-4
        bg-gradient-to-br ${colorClasses[color]} ${glowClasses[color]}
        transition-all duration-300 hover:scale-[1.02]
      `}
    >
      <div className="absolute top-3 right-3 opacity-20">{icon}</div>
      <div className="relative z-10">
        <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">{title}</p>
        <p className={`text-2xl font-bold ${colorClasses[color].split(' ').pop()}`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};

// ============================================================================
// STOCK STATUS BADGE
// ============================================================================

const StockStatusBadge: React.FC<{ current: number; minimum: number }> = ({ current, minimum }) => {
  if (current <= 0) {
    return (
      <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500/30">
        ⚠️ Sin Stock
      </Badge>
    );
  }
  if (current <= minimum) {
    return (
      <Badge variant="outline" className="bg-amber-500/20 text-amber-300 border-amber-500/30">
        ⚡ Stock Bajo
      </Badge>
    );
  }
  if (current <= minimum * 2) {
    return (
      <Badge variant="outline" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
        📊 Normal
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
      ✓ Óptimo
    </Badge>
  );
};

// ============================================================================
// ORDER STATUS BADGE
// ============================================================================

const OrderStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig: Record<string, { label: string; className: string }> = {
    PENDING: { label: '⏳ Pendiente', className: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    APPROVED: { label: '✅ Aprobado', className: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
    SHIPPED: { label: '🚚 Enviado', className: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    DELIVERED: { label: '📦 Entregado', className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    CANCELLED: { label: '❌ Cancelado', className: 'bg-red-500/20 text-red-300 border-red-500/30' },
    RECEIVED: { label: '✓ Recibido', className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  };

  const config = statusConfig[status] || { label: status, className: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };

  return (
    <Badge variant="outline" className={`${config.className} border`}>
      {config.label}
    </Badge>
  );
};

// ============================================================================
// SUPPLIER STATUS BADGE
// ============================================================================

const SupplierStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig: Record<string, { label: string; className: string }> = {
    ACTIVE: { label: '🟢 Activo', className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    INACTIVE: { label: '⚫ Inactivo', className: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
    BLOCKED: { label: '🔴 Bloqueado', className: 'bg-red-500/20 text-red-300 border-red-500/30' },
    PREFERRED: { label: '⭐ Preferido', className: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  };

  const config = statusConfig[status] || { label: status, className: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };

  return (
    <Badge variant="outline" className={`${config.className} border`}>
      {config.label}
    </Badge>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const InventoryPageV4: React.FC = () => {
  const [activeTab, setActiveTab] = useState('stock');
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'materials' | 'equipment'>('all');

  // ========================================================================
  // FORM SHEET STATES (Unified for Material + Equipment)
  // ========================================================================
  const [isItemSheetOpen, setIsItemSheetOpen] = useState(false);
  const [isSupplierSheetOpen, setIsSupplierSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DentalMaterial | Equipment | null>(null);
  const [editingItemType, setEditingItemType] = useState<ItemType>('material');
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // ========================================================================
  // GRAPHQL QUERIES
  // ========================================================================
  
  const { data: dashboardData, loading: dashboardLoading } = useQuery(GET_INVENTORY_DASHBOARD, {
    fetchPolicy: 'cache-and-network',
  });

  const { data: materialsData, loading: materialsLoading, refetch: refetchMaterials } = useQuery(GET_DENTAL_MATERIALS, {
    variables: { limit: 100 },
    fetchPolicy: 'cache-and-network',
  });

  const { data: equipmentData, loading: equipmentLoading, refetch: refetchEquipment } = useQuery(GET_EQUIPMENT, {
    variables: { limit: 100 },
    fetchPolicy: 'cache-and-network',
  });

  const { data: suppliersData, loading: suppliersLoading, refetch: refetchSuppliers } = useQuery(GET_SUPPLIERS, {
    variables: { limit: 100 },
    fetchPolicy: 'cache-and-network',
  });

  const { data: ordersData, loading: ordersLoading, refetch: refetchOrders } = useQuery(GET_PURCHASE_ORDERS, {
    variables: { limit: 100 },
    fetchPolicy: 'cache-and-network',
  });

  // ========================================================================
  // REAL-TIME SUBSCRIPTIONS (returns state, no callbacks)
  // ========================================================================
  
  const subscriptionState = useInventorySubscriptionsV3();

  // Auto-refetch when subscription data changes
  React.useEffect(() => {
    if (subscriptionState.lastUpdated || subscriptionState.lastCreated || subscriptionState.lastStockChange) {
      refetchMaterials();
      refetchEquipment();
    }
  }, [subscriptionState.lastUpdated, subscriptionState.lastCreated, subscriptionState.lastStockChange, refetchMaterials, refetchEquipment]);

  // ========================================================================
  // DATA EXTRACTION
  // ========================================================================

  const dashboard: InventoryDashboard = (dashboardData as any)?.inventoryDashboardV3 || {
    totalMaterials: 0,
    lowStockAlerts: 0,
    activeEquipment: 0,
    maintenanceDue: 0,
    totalSuppliers: 0,
    pendingOrders: 0,
    totalValue: 0,
  };

  const materials: DentalMaterial[] = (materialsData as any)?.dentalMaterialsV3 || [];
  const equipment: Equipment[] = (equipmentData as any)?.equipmentV3 || [];
  const suppliers: Supplier[] = (suppliersData as any)?.suppliersV3 || [];
  const orders: PurchaseOrder[] = (ordersData as any)?.purchaseOrdersV3 || [];

  // ========================================================================
  // FILTERED DATA
  // ========================================================================

  const filteredMaterials = useMemo(() => {
    let result = materials;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.category?.toLowerCase().includes(query)
      );
    }
    return result;
  }, [materials, searchQuery]);

  const filteredEquipment = useMemo(() => {
    let result = equipment;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          e.category?.toLowerCase().includes(query) ||
          e.manufacturer?.toLowerCase().includes(query)
      );
    }
    return result;
  }, [equipment, searchQuery]);

  const filteredSuppliers = useMemo(() => {
    let result = suppliers;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.email?.toLowerCase().includes(query)
      );
    }
    return result;
  }, [suppliers, searchQuery]);

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(query) ||
          o.supplierName?.toLowerCase().includes(query)
      );
    }
    return result;
  }, [orders, searchQuery]);

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleRefresh = () => {
    refetchMaterials();
    refetchEquipment();
    refetchSuppliers();
    refetchOrders();
  };

  // ========================================================================
  // INVENTORY ITEM CRUD HANDLERS (Material + Equipment unified)
  // ========================================================================
  const handleNewMaterial = () => {
    setEditingItem(null);
    setEditingItemType('material');
    setIsItemSheetOpen(true);
  };

  const handleNewEquipment = () => {
    setEditingItem(null);
    setEditingItemType('equipment');
    setIsItemSheetOpen(true);
  };

  const handleEditMaterial = (material: DentalMaterial) => {
    setEditingItem(material);
    setEditingItemType('material');
    setIsItemSheetOpen(true);
  };

  const handleEditEquipment = (equipment: Equipment) => {
    setEditingItem(equipment);
    setEditingItemType('equipment');
    setIsItemSheetOpen(true);
  };

  const handleItemSave = () => {
    refetchMaterials();
    refetchEquipment();
  };

  // ========================================================================
  // SUPPLIER CRUD HANDLERS
  // ========================================================================
  const handleNewSupplier = () => {
    setEditingSupplier(null);
    setIsSupplierSheetOpen(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsSupplierSheetOpen(true);
  };

  const handleSupplierSave = () => {
    refetchSuppliers();
  };

  const isLoading = materialsLoading || equipmentLoading || suppliersLoading || ordersLoading;

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-gray-900 via-cyan-900/30 to-purple-900/40 overflow-hidden">
      {/* ================================================================== */}
      {/* HEADER */}
      {/* ================================================================== */}
      <header className="flex items-center justify-between px-6 py-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
            📦🎸 Hub Logístico V4
          </h1>
          <p className="text-slate-400 text-sm">
            Supply Chain Management - Del stock bajo a la compra en un clic
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button
            onClick={handleNewMaterial}
            className="bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white shadow-lg"
          >
            <CubeIcon className="h-5 w-5 mr-2" />
            📦 Material
          </Button>
          <Button
            onClick={handleNewEquipment}
            className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white shadow-lg"
          >
            <WrenchScrewdriverIcon className="h-5 w-5 mr-2" />
            🛠️ Equipo
          </Button>
        </div>
      </header>

      {/* ================================================================== */}
      {/* KPI DASHBOARD */}
      {/* ================================================================== */}
      <div className="px-6 pb-4 shrink-0">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <KPICard
            title="Total Materiales"
            value={dashboard.totalMaterials}
            icon={<CubeIcon className="h-8 w-8" />}
            color="cyan"
          />
          <KPICard
            title="Alertas Stock"
            value={dashboard.lowStockAlerts}
            subtitle={dashboard.lowStockAlerts > 0 ? '⚠️ Requiere atención' : '✓ Todo OK'}
            icon={<ExclamationTriangleIcon className="h-8 w-8" />}
            color={dashboard.lowStockAlerts > 0 ? 'red' : 'emerald'}
          />
          <KPICard
            title="Equipos Activos"
            value={dashboard.activeEquipment}
            icon={<WrenchScrewdriverIcon className="h-8 w-8" />}
            color="purple"
          />
          <KPICard
            title="Mantenimiento"
            value={dashboard.maintenanceDue}
            subtitle={dashboard.maintenanceDue > 0 ? 'Programados' : 'Al día'}
            icon={<ClockIcon className="h-8 w-8" />}
            color={dashboard.maintenanceDue > 0 ? 'amber' : 'emerald'}
          />
          <KPICard
            title="Proveedores"
            value={dashboard.totalSuppliers}
            icon={<BuildingStorefrontIcon className="h-8 w-8" />}
            color="pink"
          />
          <KPICard
            title="Valor Total"
            value={formatCurrency(dashboard.totalValue)}
            icon={<CurrencyDollarIcon className="h-8 w-8" />}
            color="emerald"
          />
        </div>
      </div>

      {/* ================================================================== */}
      {/* TABS NAVIGATION */}
      {/* ================================================================== */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col min-h-0 px-6 pb-6"
      >
        <div className="flex items-center justify-between mb-4 shrink-0">
          <TabsList className="bg-slate-900/50 border border-purple-500/30 p-1">
            <TabsTrigger
              value="stock"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/25"
            >
              <CubeIcon className="h-4 w-4 mr-2" />
              📦 Stock
            </TabsTrigger>
            <TabsTrigger
              value="marketplace"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/25"
            >
              <ShoppingCartIcon className="h-4 w-4 mr-2" />
              🛒 Marketplace
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-amber-500/25"
            >
              <TruckIcon className="h-4 w-4 mr-2" />
              🚚 Pedidos
              {orders.filter(o => o.status === 'PENDING').length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-500 rounded-full">
                  {orders.filter(o => o.status === 'PENDING').length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="suppliers"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/25"
            >
              <BuildingStorefrontIcon className="h-4 w-4 mr-2" />
              🏭 Proveedores
            </TabsTrigger>
          </TabsList>

          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64 bg-slate-900/50 border-purple-500/30 text-white placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* ============================================================== */}
        {/* TAB: STOCK - Materiales y Equipos */}
        {/* ============================================================== */}
        <TabsContent value="stock" className="flex-1 min-h-0">
          <Card className="h-full bg-slate-900/40 backdrop-blur-md border-cyan-500/20 shadow-lg shadow-cyan-500/10 flex flex-col">
            <CardHeader className="shrink-0 pb-4">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-white">
                  <CubeIcon className="h-5 w-5 text-cyan-400" />
                  Inventario de Materiales y Equipos
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" title="Real-time"></span>
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant={stockFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStockFilter('all')}
                    className={stockFilter === 'all' ? 'bg-cyan-600' : 'border-cyan-500/30 text-cyan-400'}
                  >
                    Todos
                  </Button>
                  <Button
                    variant={stockFilter === 'materials' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStockFilter('materials')}
                    className={stockFilter === 'materials' ? 'bg-purple-600' : 'border-purple-500/30 text-purple-400'}
                  >
                    Materiales ({materials.length})
                  </Button>
                  <Button
                    variant={stockFilter === 'equipment' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStockFilter('equipment')}
                    className={stockFilter === 'equipment' ? 'bg-pink-600' : 'border-pink-500/30 text-pink-400'}
                  >
                    Equipos ({equipment.length})
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              {materialsLoading || equipmentLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
                    <p className="text-slate-400">Cargando inventario...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Materials Table */}
                  {(stockFilter === 'all' || stockFilter === 'materials') && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-cyan-300 mb-3 flex items-center gap-2">
                        <CubeIcon className="h-5 w-5" />
                        Materiales Dentales
                      </h3>
                      <Table>
                        <TableHeader>
                          <TableRow className="border-slate-700 hover:bg-transparent">
                            <TableHead className="text-cyan-400">Nombre</TableHead>
                            <TableHead className="text-cyan-400">Categoría</TableHead>
                            <TableHead className="text-cyan-400 text-center">Stock</TableHead>
                            <TableHead className="text-cyan-400">Estado</TableHead>
                            <TableHead className="text-cyan-400 text-right">Precio Unit.</TableHead>
                            <TableHead className="text-cyan-400">Proveedor</TableHead>
                            <TableHead className="text-cyan-400 text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredMaterials.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                                No hay materiales registrados
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredMaterials.map((material) => (
                              <TableRow
                                key={material.id}
                                className="border-slate-700/50 hover:bg-cyan-500/10 transition-colors"
                              >
                                <TableCell className="font-medium text-white">{material.name}</TableCell>
                                <TableCell className="text-slate-300">{material.category || '-'}</TableCell>
                                <TableCell className="text-center">
                                  <span className="text-white font-semibold">{material.currentStock}</span>
                                  <span className="text-slate-500 text-sm"> / {material.minimumStock}</span>
                                </TableCell>
                                <TableCell>
                                  <StockStatusBadge current={material.currentStock} minimum={material.minimumStock} />
                                </TableCell>
                                <TableCell className="text-right text-emerald-400">
                                  {formatCurrency(material.unitPrice)}
                                </TableCell>
                                <TableCell className="text-slate-300">{material.supplierName || '-'}</TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                        <EllipsisVerticalIcon className="h-5 w-5" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                                      <DropdownMenuItem className="text-slate-300 hover:bg-slate-700">
                                        <EyeIcon className="h-4 w-4 mr-2" /> Ver Detalles
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        className="text-slate-300 hover:bg-slate-700"
                                        onClick={() => handleEditMaterial(material)}
                                      >
                                        <PencilIcon className="h-4 w-4 mr-2" /> Editar
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-cyan-400 hover:bg-slate-700">
                                        <ShoppingCartIcon className="h-4 w-4 mr-2" /> Ordenar Más
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-red-400 hover:bg-slate-700">
                                        <TrashIcon className="h-4 w-4 mr-2" /> Eliminar
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* Equipment Table */}
                  {(stockFilter === 'all' || stockFilter === 'equipment') && (
                    <div>
                      <h3 className="text-lg font-semibold text-purple-300 mb-3 flex items-center gap-2">
                        <WrenchScrewdriverIcon className="h-5 w-5" />
                        Equipos Dentales
                      </h3>
                      <Table>
                        <TableHeader>
                          <TableRow className="border-slate-700 hover:bg-transparent">
                            <TableHead className="text-purple-400">Nombre</TableHead>
                            <TableHead className="text-purple-400">Categoría</TableHead>
                            <TableHead className="text-purple-400">Fabricante</TableHead>
                            <TableHead className="text-purple-400">Serie</TableHead>
                            <TableHead className="text-purple-400">Estado</TableHead>
                            <TableHead className="text-purple-400">Próx. Mant.</TableHead>
                            <TableHead className="text-purple-400 text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredEquipment.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                                No hay equipos registrados
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredEquipment.map((equip) => (
                              <TableRow
                                key={equip.id}
                                className="border-slate-700/50 hover:bg-purple-500/10 transition-colors"
                              >
                                <TableCell className="font-medium text-white">{equip.name}</TableCell>
                                <TableCell className="text-slate-300">{equip.category || '-'}</TableCell>
                                <TableCell className="text-slate-300">{equip.manufacturer || '-'}</TableCell>
                                <TableCell className="text-slate-400 font-mono text-sm">{equip.serialNumber || '-'}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={
                                    equip.status === 'OPERATIONAL' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                                    equip.status === 'MAINTENANCE' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                                    'bg-red-500/20 text-red-300 border-red-500/30'
                                  }>
                                    {equip.status === 'OPERATIONAL' ? '🟢 Operativo' :
                                     equip.status === 'MAINTENANCE' ? '🔧 En Mant.' : '🔴 Fuera Servicio'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-slate-300">{formatDate(equip.nextMaintenance)}</TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                        <EllipsisVerticalIcon className="h-5 w-5" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                                      <DropdownMenuItem className="text-slate-300 hover:bg-slate-700">
                                        <EyeIcon className="h-4 w-4 mr-2" /> Ver Detalles
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        className="text-slate-300 hover:bg-slate-700"
                                        onClick={() => handleEditEquipment(equip)}
                                      >
                                        <PencilIcon className="h-4 w-4 mr-2" /> Editar
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-amber-400 hover:bg-slate-700">
                                        <WrenchScrewdriverIcon className="h-4 w-4 mr-2" /> Programar Mant.
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================================== */}
        {/* TAB: MARKETPLACE - B2B Grid */}
        {/* ============================================================== */}
        <TabsContent value="marketplace" className="flex-1 min-h-0">
          <Card className="h-full bg-slate-900/40 backdrop-blur-md border-purple-500/20 shadow-lg shadow-purple-500/10 flex flex-col">
            <CardHeader className="shrink-0 pb-4">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-white">
                  <ShoppingCartIcon className="h-5 w-5 text-purple-400" />
                  Marketplace B2B
                  <Badge variant="outline" className="bg-pink-500/20 text-pink-300 border-pink-500/30 ml-2">
                    <SparklesIcon className="h-3 w-3 mr-1" />
                    Próximamente
                  </Badge>
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingCartIcon className="h-12 w-12 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    🛒 Marketplace B2B en Desarrollo
                  </h3>
                  <p className="text-slate-400 mb-6">
                    Conecta directamente con proveedores certificados.
                    Compara precios, revisa calificaciones y ordena materiales
                    con un solo clic desde el stock bajo.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-left">
                    <div className="p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                      <h4 className="font-semibold text-cyan-300 mb-1">📊 Comparación</h4>
                      <p className="text-sm text-slate-400">Compara precios de múltiples proveedores</p>
                    </div>
                    <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <h4 className="font-semibold text-purple-300 mb-1">⚡ AutoOrder</h4>
                      <p className="text-sm text-slate-400">Reposición automática cuando stock bajo</p>
                    </div>
                    <div className="p-4 bg-pink-500/10 rounded-lg border border-pink-500/20">
                      <h4 className="font-semibold text-pink-300 mb-1">⭐ Calificaciones</h4>
                      <p className="text-sm text-slate-400">Reviews de otros profesionales</p>
                    </div>
                    <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      <h4 className="font-semibold text-emerald-300 mb-1">🚚 Tracking</h4>
                      <p className="text-sm text-slate-400">Seguimiento en tiempo real</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================================== */}
        {/* TAB: PEDIDOS - Purchase Orders */}
        {/* ============================================================== */}
        <TabsContent value="orders" className="flex-1 min-h-0">
          <Card className="h-full bg-slate-900/40 backdrop-blur-md border-amber-500/20 shadow-lg shadow-amber-500/10 flex flex-col">
            <CardHeader className="shrink-0 pb-4">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-white">
                  <TruckIcon className="h-5 w-5 text-amber-400" />
                  Órdenes de Compra
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" title="Real-time"></span>
                </span>
                <span className="text-sm font-normal text-slate-400">
                  {orders.length} orden{orders.length !== 1 ? 'es' : ''}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              {ordersLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
                    <p className="text-slate-400">Cargando órdenes...</p>
                  </div>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <TruckIcon className="h-16 w-16 text-amber-400/50 mx-auto mb-4" />
                    <p className="text-xl font-semibold text-slate-300">No hay órdenes</p>
                    <p className="text-slate-500 mt-2">Crea una orden desde el Stock o Marketplace</p>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-transparent">
                      <TableHead className="text-amber-400">Nº Orden</TableHead>
                      <TableHead className="text-amber-400">Proveedor</TableHead>
                      <TableHead className="text-amber-400">Fecha</TableHead>
                      <TableHead className="text-amber-400">Entrega Esperada</TableHead>
                      <TableHead className="text-amber-400">Estado</TableHead>
                      <TableHead className="text-amber-400 text-right">Total</TableHead>
                      <TableHead className="text-amber-400 text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow
                        key={order.id}
                        className="border-slate-700/50 hover:bg-amber-500/10 transition-colors"
                      >
                        <TableCell className="font-mono text-cyan-300">{order.orderNumber}</TableCell>
                        <TableCell className="text-white">{order.supplierName || '-'}</TableCell>
                        <TableCell className="text-slate-300">{formatDate(order.orderDate)}</TableCell>
                        <TableCell className="text-slate-300">{formatDate(order.expectedDeliveryDate)}</TableCell>
                        <TableCell>
                          <OrderStatusBadge status={order.status} />
                        </TableCell>
                        <TableCell className="text-right text-emerald-400 font-semibold">
                          {formatCurrency(order.totalAmount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                <EllipsisVerticalIcon className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                              <DropdownMenuItem className="text-slate-300 hover:bg-slate-700">
                                <EyeIcon className="h-4 w-4 mr-2" /> Ver Detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-emerald-400 hover:bg-slate-700">
                                <CheckCircleIcon className="h-4 w-4 mr-2" /> Marcar Recibido
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-cyan-400 hover:bg-slate-700">
                                <DocumentDuplicateIcon className="h-4 w-4 mr-2" /> Duplicar
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-400 hover:bg-slate-700">
                                <TrashIcon className="h-4 w-4 mr-2" /> Cancelar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================================== */}
        {/* TAB: PROVEEDORES - Suppliers */}
        {/* ============================================================== */}
        <TabsContent value="suppliers" className="flex-1 min-h-0">
          <Card className="h-full bg-slate-900/40 backdrop-blur-md border-emerald-500/20 shadow-lg shadow-emerald-500/10 flex flex-col">
            <CardHeader className="shrink-0 pb-4">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-white">
                  <BuildingStorefrontIcon className="h-5 w-5 text-emerald-400" />
                  Proveedores
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" title="Real-time"></span>
                </span>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white"
                  onClick={handleNewSupplier}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Nuevo Proveedor
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              {suppliersLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
                    <p className="text-slate-400">Cargando proveedores...</p>
                  </div>
                </div>
              ) : filteredSuppliers.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <BuildingStorefrontIcon className="h-16 w-16 text-emerald-400/50 mx-auto mb-4" />
                    <p className="text-xl font-semibold text-slate-300">No hay proveedores</p>
                    <p className="text-slate-500 mt-2">Agrega tu primer proveedor</p>
                    <Button 
                      className="mt-4 bg-emerald-600 hover:bg-emerald-500"
                      onClick={handleNewSupplier}
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Agregar Proveedor
                    </Button>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-transparent">
                      <TableHead className="text-emerald-400">Nombre</TableHead>
                      <TableHead className="text-emerald-400">Email</TableHead>
                      <TableHead className="text-emerald-400">Teléfono</TableHead>
                      <TableHead className="text-emerald-400">Categoría</TableHead>
                      <TableHead className="text-emerald-400 text-center">Rating</TableHead>
                      <TableHead className="text-emerald-400">Estado</TableHead>
                      <TableHead className="text-emerald-400 text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSuppliers.map((supplier) => (
                      <TableRow
                        key={supplier.id}
                        className="border-slate-700/50 hover:bg-emerald-500/10 transition-colors"
                      >
                        <TableCell className="font-medium text-white">{supplier.name}</TableCell>
                        <TableCell className="text-slate-300">{supplier.email || '-'}</TableCell>
                        <TableCell className="text-slate-300">{supplier.phone || '-'}</TableCell>
                        <TableCell className="text-slate-300">{supplier.category || '-'}</TableCell>
                        <TableCell className="text-center">
                          {supplier.rating ? (
                            <span className="text-amber-400">
                              {'⭐'.repeat(Math.min(Math.round(supplier.rating), 5))}
                              <span className="text-slate-400 text-sm ml-1">({supplier.rating})</span>
                            </span>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <SupplierStatusBadge status={supplier.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                <EllipsisVerticalIcon className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                              <DropdownMenuItem className="text-slate-300 hover:bg-slate-700">
                                <EyeIcon className="h-4 w-4 mr-2" /> Ver Detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-slate-300 hover:bg-slate-700"
                                onClick={() => handleEditSupplier(supplier)}
                              >
                                <PencilIcon className="h-4 w-4 mr-2" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-cyan-400 hover:bg-slate-700">
                                <TruckIcon className="h-4 w-4 mr-2" /> Nueva Orden
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-400 hover:bg-slate-700">
                                <TrashIcon className="h-4 w-4 mr-2" /> Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ============================================ */}
      {/* 📝 FORM SHEETS - CRUD V4 */}
      {/* ============================================ */}
      <InventoryItemSheet
        isOpen={isItemSheetOpen}
        onClose={() => setIsItemSheetOpen(false)}
        item={editingItem}
        itemType={editingItemType}
        onSave={handleItemSave}
      />
      <SupplierFormSheet
        isOpen={isSupplierSheetOpen}
        onClose={() => setIsSupplierSheetOpen(false)}
        supplier={editingSupplier}
        onSave={handleSupplierSave}
      />
    </div>
  );
};

export default InventoryPageV4;
