// 🎯💰🔥 BILLING PAGE V4 - OPERACIÓN LÁZARO FASE 4
// Date: 2025
// Mission: Financial dashboard with Wall Street terminal aesthetics
// Pattern: Zero Scroll Global + Internal Scroll Tables
// Style: Cyberpunk Dark Terminal - Numbers that GLOW

import React, { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  GET_INVOICES,
} from '../graphql/queries/billing';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { ProfitMarginBadge, InvoiceStatusBadge } from '../components/ui/badge';
import InvoiceFormSheet from '../components/Billing/InvoiceFormSheet';
import {
  PlusIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';

// ============================================================================
// TYPES
// ============================================================================

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxRate: number;
}

// Aligned with Selene V5 BillingDataV3 schema
interface Invoice {
  id: string;
  patientId: string;
  invoiceNumber: string;
  subtotal: number;
  taxRate: number | null;
  taxAmount: number | null;
  discountAmount: number | null;
  totalAmount: number;
  currency: string;
  issueDate: string | number;    // Can be ISO string or timestamp
  dueDate: string | number | null;
  paidDate: string | number | null;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  paymentTerms: string | null;
  notes: string | null;
  createdBy: string | null;
  createdAt: string | number;
  updatedAt: string | number;
  // Economic Singularity fields
  treatmentId: string | null;
  materialCost: number | null;
  profitMargin: number | null;
}

// Response type aligned with billing.ts query
interface GetInvoicesData {
  billingDataV3: Invoice[];
}

interface FinancialAnalytics {
  totalRevenue: number;
  outstandingAmount: number;
  overdueAmount: number;
  paidInvoicesCount: number;
  totalInvoicesCount: number;
  pendingPaymentsCount: number;
  collectionRate: number;
  paymentSuccessRate: number;
  averageInvoiceValue: number;
}

interface GetFinancialAnalyticsData {
  financialAnalyticsV3: FinancialAnalytics;
}

// ============================================================================
// UTILITIES
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
    // Intenta convertir a número primero (maneja "1764039600000" como string)
    const numVal = Number(val);
    const date = !isNaN(numVal) && numVal > 0 ? new Date(numVal) : new Date(val as string);
    
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    return new Intl.DateTimeFormat('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).format(date);
  } catch {
    return 'Invalid Date';
  }
};

// Calculate profit margin from invoice total and material cost (if available)
const calculateProfitMargin = (invoice: Invoice): number | null => {
  // If we have treatment link with material cost, calculate real margin
  // For now, return null (will be enhanced when billing_data_v3 is connected)
  return null;
};

// ============================================================================
// KPI CARD COMPONENT
// ============================================================================

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color: 'cyan' | 'emerald' | 'amber' | 'red' | 'purple';
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color,
}) => {
  const colorClasses = {
    cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400',
    emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
    amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400',
    red: 'from-red-500/20 to-red-600/10 border-red-500/30 text-red-400',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
  };

  const glowClasses = {
    cyan: 'shadow-[0_0_20px_rgba(6,182,212,0.15)]',
    emerald: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    amber: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    red: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]',
    purple: 'shadow-[0_0_20px_rgba(168,85,247,0.15)]',
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border p-5
        bg-gradient-to-br ${colorClasses[color]} ${glowClasses[color]}
        transition-all duration-300 hover:scale-[1.02]
      `}
    >
      {/* Icon */}
      <div className="absolute top-4 right-4 opacity-20">
        {icon}
      </div>

      {/* Content */}
      <div className="relative z-10">
        <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">
          {title}
        </p>
        <p className={`text-2xl font-bold ${colorClasses[color].split(' ').pop()}`}>
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
        {trend && trendValue && (
          <div className={`
            mt-2 text-xs flex items-center gap-1
            ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'}
          `}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
            {trendValue}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const BillingPageV4: React.FC = () => {
  // State
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // GraphQL Queries
  const { data: invoicesData, loading: invoicesLoading, error: invoicesError, refetch } = useQuery<GetInvoicesData>(
    GET_INVOICES,
    {
      variables: { limit: 50 },
      fetchPolicy: 'network-only',
    }
  );

  // Analytics disabled - financialAnalyticsV3 not in Selene V5
  // TODO: Implement when analytics resolver is added
  const analytics = null;

  // Error logging for debugging
  if (invoicesError) {
    console.error('🔥 BILLING ERROR:', invoicesError);
  }

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    let invoices = invoicesData?.billingDataV3 || [];
    
    // Filter by status
    if (statusFilter !== 'all') {
      invoices = invoices.filter(inv => inv.status.toLowerCase() === statusFilter);
    }
    
    // Filter by search (invoice number only - patientName not in schema)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      invoices = invoices.filter(inv =>
        inv.invoiceNumber.toLowerCase().includes(query)
      );
    }
    
    return invoices;
  }, [invoicesData, statusFilter, searchQuery]);

  // Handlers
  const handleNewInvoice = () => {
    setEditingInvoice(null);
    setIsSheetOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setIsSheetOpen(true);
  };

  const handleSheetClose = () => {
    setIsSheetOpen(false);
    setEditingInvoice(null);
  };

  const handleSave = () => {
    refetch();
    handleSheetClose();
    toast.success('💰 Factura guardada exitosamente');
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 overflow-hidden">
      {/* ================================================================== */}
      {/* HEADER - Fixed */}
      {/* ================================================================== */}
      <div className="flex-none px-6 py-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
              💰 Centro Financiero
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Wall Street Terminal • Gestión de Facturas y Pagos
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              disabled={invoicesLoading}
              className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all"
              title="Refrescar datos"
            >
              <ArrowPathIcon className={`h-5 w-5 ${invoicesLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleNewInvoice}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-cyan-500/30 transition-all hover:scale-105"
            >
              <PlusIcon className="h-5 w-5" />
              Nueva Factura
            </button>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* KPI CARDS - Fixed */}
      {/* ================================================================== */}
      <div className="flex-none px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            title="Ingresos Totales"
            value={formatCurrency(analytics?.totalRevenue || 0)}
            icon={<CurrencyDollarIcon className="h-12 w-12" />}
            color="emerald"
          />
          <KPICard
            title="Pendiente de Cobro"
            value={formatCurrency(analytics?.outstandingAmount || 0)}
            subtitle={`${analytics?.pendingPaymentsCount || 0} facturas`}
            icon={<ClockIcon className="h-12 w-12" />}
            color="amber"
          />
          <KPICard
            title="Facturas Vencidas"
            value={formatCurrency(analytics?.overdueAmount || 0)}
            icon={<ExclamationTriangleIcon className="h-12 w-12" />}
            color="red"
          />
          <KPICard
            title="Tasa de Cobro"
            value={`${((analytics?.collectionRate || 0) * 100).toFixed(1)}%`}
            subtitle={`${analytics?.paidInvoicesCount || 0}/${analytics?.totalInvoicesCount || 0} pagadas`}
            icon={<ChartBarIcon className="h-12 w-12" />}
            color="cyan"
          />
        </div>
      </div>

      {/* ================================================================== */}
      {/* FILTERS - Fixed */}
      {/* ================================================================== */}
      <div className="flex-none px-6 py-3 border-b border-gray-700/30">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por número o paciente..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-4 w-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 text-sm px-3 py-2 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="all">Todas</option>
              <option value="paid">Pagadas</option>
              <option value="pending">Pendientes</option>
              <option value="overdue">Vencidas</option>
              <option value="draft">Borradores</option>
            </select>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* TABLE - Scrollable */}
      {/* ================================================================== */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {invoicesLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-cyan-400 border-t-transparent"></div>
              <p className="text-gray-400 mt-4">Cargando facturas...</p>
            </div>
          </div>
        ) : invoicesError ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-red-400">
              <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4" />
              <p>Error cargando facturas</p>
              <p className="text-sm text-gray-500">{invoicesError.message}</p>
            </div>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <CurrencyDollarIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No hay facturas</p>
              <button
                onClick={handleNewInvoice}
                className="mt-4 text-cyan-400 hover:text-cyan-300 text-sm"
              >
                Crear primera factura →
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-cyan-500/20 bg-gray-800/50">
                  <TableHead>Nº Factura</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="text-right">IVA</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-center">Margen</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id} className="group">
                    {/* Invoice Number */}
                    <TableCell className="font-mono text-cyan-300">
                      {invoice.invoiceNumber}
                    </TableCell>

                    {/* Date */}
                    <TableCell className="text-gray-400">
                      {formatDate(invoice.issueDate)}
                    </TableCell>

                    {/* Patient - ID (patientName not in schema) */}
                    <TableCell>
                      <Link
                        to={`/dashboard/patients/${invoice.patientId}`}
                        className="text-purple-400 hover:text-purple-300 hover:underline transition-colors"
                      >
                        {invoice.patientId.slice(0, 8)}...
                      </Link>
                    </TableCell>

                    {/* Subtotal */}
                    <TableCell className="text-right font-mono text-gray-300">
                      {formatCurrency(invoice.subtotal)}
                    </TableCell>

                    {/* Tax */}
                    <TableCell className="text-right font-mono text-gray-500">
                      {formatCurrency(invoice.taxAmount)}
                    </TableCell>

                    {/* Total - Bright */}
                    <TableCell className="text-right font-mono font-bold text-emerald-400">
                      {formatCurrency(invoice.totalAmount)}
                    </TableCell>

                    {/* Profit Margin Badge */}
                    <TableCell className="text-center">
                      <ProfitMarginBadge profitMargin={calculateProfitMargin(invoice)} />
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell className="text-center">
                      <InvoiceStatusBadge status={invoice.status} />
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-center">
                      <button
                        onClick={() => handleEditInvoice(invoice)}
                        className="p-2 text-gray-500 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Editar factura"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* ================================================================== */}
      {/* INVOICE FORM SHEET */}
      {/* ================================================================== */}
      <InvoiceFormSheet
        isOpen={isSheetOpen}
        onClose={handleSheetClose}
        invoice={editingInvoice || undefined}
        onSave={handleSave}
      />
    </div>
  );
};

export default BillingPageV4;
