// 🎯🎸💀 FINANCIAL MANAGER V3.0 - TITAN PATTERN IMPLEMENTATION
// Date: September 25, 2025
// Mission: Complete financial management with @veritas quantum verification
// Status: V3.0 - Full billing system with quantum truth verification
// Challenge: Financial data integrity and multi-currency support
// 🎨 THEME: Cyberpunk Medical - Cyan/Purple/Pink gradients with quantum effects
// 🔒 SECURITY: @veritas quantum truth verification on financial transactions

import React, { useState, useMemo } from 'react';
// 🔥 APOLLO CLIENT V4 ESM HOOKS - VITE NATIVE ✅
// No webpack hacks, no re-exports, pure ESM imports
// Vite resolves @apollo/client exports field perfectly
import { useQuery, useMutation } from '@apollo/client/react';

// 🎯 TITAN PATTERN IMPORTS - Core Dependencies
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Badge, Spinner } from '../../design-system';
import { createModuleLogger } from '../../utils/logger';

// 🎯 GRAPHQL QUERIES - V3.0 Integration (LECTURA - Real-time data from Selene)
import {
  GET_INVOICES,
  GET_PAYMENTS,
  GET_FINANCIAL_ANALYTICS,
  GET_FINANCIAL_DASHBOARD,
  GET_OUTSTANDING_INVOICES
} from '../../graphql/queries/financial';

// 🎯 GRAPHQL MUTATIONS - V3.0 Integration (ESCRITURA - Write operations to Selene)
import {
  CREATE_INVOICE,
  UPDATE_INVOICE,
  DELETE_INVOICE,
  CREATE_PAYMENT,
  UPDATE_PAYMENT,
  DELETE_PAYMENT
} from '../../graphql/mutations/billing';

// 🎯 PATIENTS HOOK
import { useGraphQLPatients } from '../../hooks/useGraphQLPatients';

// 🎯 SUBCOMPONENTS - Modular Architecture
import InvoiceFormModalV3 from './InvoiceFormModalV3';
import PaymentFormModalV3 from './PaymentFormModalV3';
import InvoiceDetailViewV3 from './InvoiceDetailViewV3';
import PaymentDetailViewV3 from './PaymentDetailViewV3';
import BillingAnalyticsV3 from './BillingAnalyticsV3';
import SubscriptionPlanManagerV3 from '../Subscription/SubscriptionPlanManagerV3';

// 🎯 ICONS - Heroicons for financial theme
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
  BanknotesIcon,
  CurrencyDollarIcon,
  BuildingStorefrontIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  CalculatorIcon,
  ReceiptRefundIcon,
  CreditCardIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

// 🎯 FINANCIAL MANAGER V3.0 INTERFACE
interface FinancialManagerV3Props {
  className?: string;
}

// 🎯 INVOICE INTERFACE
interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceNumber_veritas?: string;
  patientId: string;
  patientName: string;
  amount: number;
  amount_veritas?: number;
  taxAmount: number;
  totalAmount: number;
  totalAmount_veritas?: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  status_veritas?: string;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  notes: string;
  notes_veritas?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  items?: InvoiceItem[];
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

// 🎯 PAYMENT INTERFACE
interface Payment {
  id: string;
  paymentNumber: string;
  paymentNumber_veritas?: string;
  invoiceId?: string;
  patientId: string;
  patientName: string;
  amount: number;
  amount_veritas?: number;
  method: 'cash' | 'card' | 'transfer' | 'check' | 'crypto';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  status_veritas?: string;
  paymentDate: string;
  processedDate?: string;
  reference: string;
  notes: string;
  notes_veritas?: string;
  processedBy: string;
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

// 🎯 INVOICE ITEM INTERFACE
interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxRate: number;
}

// 🎯 STATUS CONFIGURATION
const INVOICE_STATUS_CONFIG = {
  draft: { label: 'Borrador', bgColor: 'bg-gray-500/20', textColor: 'text-gray-300', borderColor: 'border-gray-500/30', icon: DocumentTextIcon },
  sent: { label: 'Enviada', bgColor: 'bg-blue-500/20', textColor: 'text-blue-300', borderColor: 'border-blue-500/30', icon: BanknotesIcon },
  paid: { label: 'Pagada', bgColor: 'bg-green-500/20', textColor: 'text-green-300', borderColor: 'border-green-500/30', icon: CheckCircleIcon },
  overdue: { label: 'Vencida', bgColor: 'bg-red-500/20', textColor: 'text-red-300', borderColor: 'border-red-500/30', icon: ExclamationTriangleIcon },
  cancelled: { label: 'Cancelada', bgColor: 'bg-gray-500/20', textColor: 'text-gray-300', borderColor: 'border-gray-500/30', icon: XCircleIcon }
};

const PAYMENT_STATUS_CONFIG = {
  pending: { label: 'Pendiente', bgColor: 'bg-yellow-500/20', textColor: 'text-yellow-300', borderColor: 'border-yellow-500/30', icon: ClockIcon },
  completed: { label: 'Completado', bgColor: 'bg-green-500/20', textColor: 'text-green-300', borderColor: 'border-green-500/30', icon: CheckCircleIcon },
  failed: { label: 'Fallido', bgColor: 'bg-red-500/20', textColor: 'text-red-300', borderColor: 'border-red-500/30', icon: XCircleIcon },
  refunded: { label: 'Reembolsado', bgColor: 'bg-purple-500/20', textColor: 'text-purple-300', borderColor: 'border-purple-500/30', icon: ReceiptRefundIcon }
};

const PAYMENT_METHOD_CONFIG = {
  cash: { label: 'Efectivo', icon: BanknotesIcon, color: 'text-green-400' },
  card: { label: 'Tarjeta', icon: CreditCardIcon, color: 'text-blue-400' },
  transfer: { label: 'Transferencia', icon: BuildingStorefrontIcon, color: 'text-purple-400' },
  check: { label: 'Cheque', icon: DocumentTextIcon, color: 'text-yellow-400' },
  crypto: { label: 'Cripto', icon: CurrencyDollarIcon, color: 'text-cyan-400' }
};

// 🎯 STATUS PRIORITY FOR SORTING
const INVOICE_STATUS_PRIORITY = {
  draft: 1,
  sent: 2,
  paid: 3,
  overdue: 4,
  cancelled: 5
};

const PAYMENT_STATUS_PRIORITY = {
  pending: 1,
  completed: 2,
  failed: 3,
  refunded: 4
};

// 🎯 LOGGER - Module specific logger
const l = createModuleLogger('FinancialManagerV3');

export const FinancialManagerV3: React.FC<FinancialManagerV3Props> = ({
  className = ''
}) => {
  // 🎯 STATE MANAGEMENT
  const [searchTerm, setSearchTerm] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [activeTab, setActiveTab] = useState<'invoices' | 'payments' | 'analytics' | 'subscription-plans'>('invoices');
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showInvoiceDetail, setShowInvoiceDetail] = useState(false);
  const [showPaymentDetail, setShowPaymentDetail] = useState(false);

  // 🎯 GRAPHQL QUERIES
  const { data: invoicesData, loading: invoicesLoading, refetch: refetchInvoices } = useQuery(GET_INVOICES, {
    variables: {
      status: invoiceStatusFilter !== 'all' ? invoiceStatusFilter : undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      limit: 50,
      offset: 0
    }
  });

  const { data: paymentsData, loading: paymentsLoading, refetch: refetchPayments } = useQuery(GET_PAYMENTS, {
    variables: {
      status: paymentStatusFilter !== 'all' ? paymentStatusFilter : undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      limit: 50,
      offset: 0
    }
  });

  const { data: analyticsData, loading: analyticsLoading } = useQuery(GET_FINANCIAL_ANALYTICS, {
    variables: {
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined
    }
  });

  // 🎯 GRAPHQL MUTATIONS
  const [deleteInvoice] = useMutation(DELETE_INVOICE);
  const [deletePayment] = useMutation(DELETE_PAYMENT);

  // 🎯 PATIENTS DATA
  const { patients: rawPatients, loading: patientsLoading } = useGraphQLPatients();

  // 🎯 TRANSFORM PATIENTS DATA FOR MODALS
  const patients = rawPatients.map(patient => ({
    id: parseInt(patient.id),
    first_name: patient.firstName,
    last_name: patient.lastName
  }));

  // 🎯 PROCESSED DATA
  const invoices = useMemo(() => {
    return (invoicesData as any)?.invoicesV3 || [];
  }, [invoicesData]);

  const payments = useMemo(() => {
    return (paymentsData as any)?.paymentsV3 || [];
  }, [paymentsData]);

  const analytics = useMemo(() => {
    return (analyticsData as any)?.financialAnalyticsV3 || {};
  }, [analyticsData]);

  // 🎯 FILTERED DATA
  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice: Invoice) => {
      const matchesSearch = !searchTerm ||
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.patientName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = invoiceStatusFilter === 'all' || invoice.status === invoiceStatusFilter;

      return matchesSearch && matchesStatus;
    }).sort((a: Invoice, b: Invoice) => {
      const statusDiff = INVOICE_STATUS_PRIORITY[a.status] - INVOICE_STATUS_PRIORITY[b.status];
      if (statusDiff !== 0) return statusDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [invoices, searchTerm, invoiceStatusFilter]);

  const filteredPayments = useMemo(() => {
    return payments.filter((payment: Payment) => {
      const matchesSearch = !searchTerm ||
        payment.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.patientName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = paymentStatusFilter === 'all' || payment.status === paymentStatusFilter;

      return matchesSearch && matchesStatus;
    }).sort((a: Payment, b: Payment) => {
      const statusDiff = PAYMENT_STATUS_PRIORITY[a.status] - PAYMENT_STATUS_PRIORITY[b.status];
      if (statusDiff !== 0) return statusDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [payments, searchTerm, paymentStatusFilter]);

  // 🎯 FINANCIAL SUMMARY
  const financialSummary = useMemo(() => {
    if (!invoices.length && !payments.length) return null;

    const totalInvoiced = invoices.reduce((sum: number, inv: Invoice) => sum + inv.totalAmount, 0);
    const totalPaid = payments.filter((p: Payment) => p.status === 'completed').reduce((sum: number, pay: Payment) => sum + pay.amount, 0);
    const totalOutstanding = totalInvoiced - totalPaid;
    const overdueAmount = invoices.filter((inv: Invoice) => inv.status === 'overdue').reduce((sum: number, inv: Invoice) => sum + inv.totalAmount, 0);

    const paidInvoices = invoices.filter((inv: Invoice) => inv.status === 'paid').length;
    const totalInvoices = invoices.length;
    const paymentSuccessRate = payments.length > 0 ? (payments.filter((p: Payment) => p.status === 'completed').length / payments.length * 100).toFixed(1) : '0';

    return {
      totalInvoiced,
      totalPaid,
      totalOutstanding,
      overdueAmount,
      paidInvoices,
      totalInvoices,
      paymentSuccessRate,
      collectionRate: totalInvoiced > 0 ? ((totalPaid / totalInvoiced) * 100).toFixed(1) : '0'
    };
  }, [invoices, payments]);

  // 🎯 HANDLERS
  const handleCreateInvoice = () => {
    setSelectedInvoice(null);
    setShowInvoiceForm(true);
  };

  const handleCreatePayment = () => {
    setSelectedPayment(null);
    setShowPaymentForm(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceForm(true);
  };

  const handleEditPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowPaymentForm(true);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDetail(true);
  };

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowPaymentDetail(true);
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta factura?')) return;

    try {
      await deleteInvoice({
        variables: { id: invoiceId }
      });
      refetchInvoices();
      l.info('Invoice deleted successfully', { invoiceId });
    } catch (error) {
      l.error('Failed to delete invoice', error as Error);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este pago?')) return;

    try {
      await deletePayment({
        variables: { id: paymentId }
      });
      refetchPayments();
      l.info('Payment deleted successfully', { paymentId });
    } catch (error) {
      l.error('Failed to delete payment', error as Error);
    }
  };

  const handleFormSuccess = () => {
    setShowInvoiceForm(false);
    setShowPaymentForm(false);
    setSelectedInvoice(null);
    setSelectedPayment(null);
    refetchInvoices();
    refetchPayments();
  };

  const handleCloseModals = () => {
    setShowInvoiceForm(false);
    setShowPaymentForm(false);
    setShowInvoiceDetail(false);
    setShowPaymentDetail(false);
    setSelectedInvoice(null);
    setSelectedPayment(null);
  };

  // 🎯 GET STATUS INFO
  const getInvoiceStatusInfo = (status: string) => {
    return INVOICE_STATUS_CONFIG[status as keyof typeof INVOICE_STATUS_CONFIG] || INVOICE_STATUS_CONFIG.draft;
  };

  const getPaymentStatusInfo = (status: string) => {
    return PAYMENT_STATUS_CONFIG[status as keyof typeof PAYMENT_STATUS_CONFIG] || PAYMENT_STATUS_CONFIG.pending;
  };

  const getPaymentMethodInfo = (method: string) => {
    return PAYMENT_METHOD_CONFIG[method as keyof typeof PAYMENT_METHOD_CONFIG] || PAYMENT_METHOD_CONFIG.cash;
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
                <CurrencyDollarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  🎯 Gestión Financiera V3.0
                </CardTitle>
                <p className="text-gray-300 text-sm mt-1">
                  Sistema financiero con verificación cuántica @veritas
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setActiveTab(activeTab === 'analytics' ? 'invoices' : 'analytics')}
                variant="ghost"
                className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/20"
              >
                <ChartBarIcon className="w-4 h-4 mr-2" />
                {activeTab === 'analytics' ? 'Ver Datos' : 'Ver Analytics'}
              </Button>
              <div className="flex space-x-2">
                <Button
                  onClick={handleCreateInvoice}
                  className="bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white shadow-lg shadow-pink-500/25"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Nueva Factura
                </Button>
                <Button
                  onClick={handleCreatePayment}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-cyan-500/25"
                >
                  <BanknotesIcon className="w-4 h-4 mr-2" />
                  Nuevo Pago
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Financial Summary */}
        {financialSummary && (
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-8 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">{formatCurrency(financialSummary.totalInvoiced)}</div>
                <div className="text-xs text-gray-400">Facturado</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{formatCurrency(financialSummary.totalPaid)}</div>
                <div className="text-xs text-gray-400">Cobrado</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{formatCurrency(financialSummary.totalOutstanding)}</div>
                <div className="text-xs text-gray-400">Pendiente</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{formatCurrency(financialSummary.overdueAmount)}</div>
                <div className="text-xs text-gray-400">Vencido</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{financialSummary.paidInvoices}</div>
                <div className="text-xs text-gray-400">Fact. Pagadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{financialSummary.totalInvoices}</div>
                <div className="text-xs text-gray-400">Total Fact.</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-400">{financialSummary.collectionRate}%</div>
                <div className="text-xs text-gray-400">Tasa Cobro</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-400">{financialSummary.paymentSuccessRate}%</div>
                <div className="text-xs text-gray-400">Éxito Pagos</div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Navigation Tabs */}
      <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-600/30">
        <CardContent className="p-4">
          <div className="flex space-x-1">
            <Button
              onClick={() => setActiveTab('invoices')}
              variant={activeTab === 'invoices' ? 'default' : 'ghost'}
              className={`flex-1 ${activeTab === 'invoices' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
            >
              <DocumentTextIcon className="w-4 h-4 mr-2" />
              Facturas ({filteredInvoices.length})
            </Button>
            <Button
              onClick={() => setActiveTab('payments')}
              variant={activeTab === 'payments' ? 'default' : 'ghost'}
              className={`flex-1 ${activeTab === 'payments' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
            >
              <BanknotesIcon className="w-4 h-4 mr-2" />
              Pagos ({filteredPayments.length})
            </Button>
            <Button
              onClick={() => setActiveTab('analytics')}
              variant={activeTab === 'analytics' ? 'default' : 'ghost'}
              className={`flex-1 ${activeTab === 'analytics' ? 'bg-pink-500/20 text-pink-300 border-pink-500/30' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
            >
              <ChartBarIcon className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            <Button
              onClick={() => setActiveTab('subscription-plans')}
              variant={activeTab === 'subscription-plans' ? 'default' : 'ghost'}
              className={`flex-1 ${activeTab === 'subscription-plans' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
            >
              <CreditCardIcon className="w-4 h-4 mr-2" />
              Planes de Suscripción
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters Section */}
      <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-600/30">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20"
              />
            </div>

            {activeTab === 'invoices' && (
              <select
                value={invoiceStatusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setInvoiceStatusFilter(e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
              >
                <option value="all">Todos los Estados</option>
                <option value="draft">Borrador</option>
                <option value="sent">Enviada</option>
                <option value="paid">Pagada</option>
                <option value="overdue">Vencida</option>
                <option value="cancelled">Cancelada</option>
              </select>
            )}

            {activeTab === 'payments' && (
              <select
                value={paymentStatusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPaymentStatusFilter(e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
              >
                <option value="all">Todos los Estados</option>
                <option value="pending">Pendiente</option>
                <option value="completed">Completado</option>
                <option value="failed">Fallido</option>
                <option value="refunded">Reembolsado</option>
              </select>
            )}

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
                  setInvoiceStatusFilter('all');
                  setPaymentStatusFilter('all');
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
      {activeTab === 'invoices' && (
        /* Invoices View */
        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-cyan-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-cyan-300 flex items-center space-x-2">
              <DocumentTextIcon className="w-5 h-5" />
              <span>Lista de Facturas</span>
              <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                {filteredInvoices.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invoicesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="sm" />
                <span className="ml-2 text-gray-300">Cargando facturas...</span>
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-8">
                <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">No se encontraron facturas</h3>
                <p className="text-gray-500">Intenta ajustar los filtros o crea una nueva factura</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInvoices.map((invoice: Invoice) => {
                  const statusInfo = getInvoiceStatusInfo(invoice.status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <Card key={invoice.id} className="bg-gray-800/30 border border-gray-600/30 hover:border-purple-500/30 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                              <StatusIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="text-white font-semibold flex items-center space-x-2">
                                <span>{invoice.invoiceNumber}</span>
                                {invoice._veritas && (
                                  <ShieldCheckIcon className="w-4 h-4 text-green-400" />
                                )}
                              </h4>
                              <p className="text-gray-400 text-sm">
                                {invoice.patientName} • {new Date(invoice.issueDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={`${statusInfo.bgColor} ${statusInfo.textColor} border ${statusInfo.borderColor}`}>
                              {statusInfo.label}
                            </Badge>
                            <span className="text-white font-bold text-lg">
                              {formatCurrency(invoice.totalAmount)}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-gray-400">Estado:</span>
                            <p className="text-white">{statusInfo.label}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Fecha Emisión:</span>
                            <p className="text-white">{new Date(invoice.issueDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Fecha Vencimiento:</span>
                            <p className="text-white">{new Date(invoice.dueDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Items:</span>
                            <p className="text-white">{invoice.items?.length || 0}</p>
                          </div>
                        </div>

                        {invoice.notes && (
                          <div className="mb-3">
                            <span className="text-gray-400 text-sm">Notas:</span>
                            <p className="text-white text-sm mt-1 line-clamp-2">{invoice.notes}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-gray-600/30">
                          <div className="flex items-center space-x-2">
                            {invoice._veritas && (
                              <div className="flex items-center space-x-1">
                                <ShieldCheckIcon className="w-4 h-4 text-green-400" />
                                <span className="text-green-400 text-xs font-mono">
                                  @veritas {invoice._veritas.confidence}%
                                </span>
                              </div>
                            )}
                            {invoice.status === 'overdue' && (
                              <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">
                                ¡Vencida!
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewInvoice(invoice)}
                              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </Button>
                            {(invoice.status === 'draft' || invoice.status === 'sent') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditInvoice(invoice)}
                                className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </Button>
                            )}
                            {(invoice.status === 'draft' || invoice.status === 'cancelled') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteInvoice(invoice.id)}
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
      )}

      {activeTab === 'payments' && (
        /* Payments View */
        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-purple-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-purple-300 flex items-center space-x-2">
              <BanknotesIcon className="w-5 h-5" />
              <span>Lista de Pagos</span>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                {filteredPayments.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paymentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="sm" />
                <span className="ml-2 text-gray-300">Cargando pagos...</span>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-8">
                <BanknotesIcon className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">No se encontraron pagos</h3>
                <p className="text-gray-500">Intenta ajustar los filtros o registra un nuevo pago</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPayments.map((payment: Payment) => {
                  const statusInfo = getPaymentStatusInfo(payment.status);
                  const methodInfo = getPaymentMethodInfo(payment.method);
                  const StatusIcon = statusInfo.icon;
                  const MethodIcon = methodInfo.icon;

                  return (
                    <Card key={payment.id} className="bg-gray-800/30 border border-gray-600/30 hover:border-pink-500/30 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <StatusIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="text-white font-semibold flex items-center space-x-2">
                                <span>{payment.paymentNumber}</span>
                                {payment._veritas && (
                                  <ShieldCheckIcon className="w-4 h-4 text-green-400" />
                                )}
                              </h4>
                              <p className="text-gray-400 text-sm">
                                {payment.patientName} • {new Date(payment.paymentDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={`${statusInfo.bgColor} ${statusInfo.textColor} border ${statusInfo.borderColor}`}>
                              {statusInfo.label}
                            </Badge>
                            <span className="text-white font-bold text-lg">
                              {formatCurrency(payment.amount)}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-gray-400">Estado:</span>
                            <p className="text-white">{statusInfo.label}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Método:</span>
                            <p className={`flex items-center space-x-1 ${methodInfo.color}`}>
                              <MethodIcon className="w-4 h-4" />
                              <span>{methodInfo.label}</span>
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-400">Fecha Pago:</span>
                            <p className="text-white">{new Date(payment.paymentDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Referencia:</span>
                            <p className="text-white font-mono text-xs">{payment.reference}</p>
                          </div>
                        </div>

                        {payment.notes && (
                          <div className="mb-3">
                            <span className="text-gray-400 text-sm">Notas:</span>
                            <p className="text-white text-sm mt-1 line-clamp-2">{payment.notes}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-gray-600/30">
                          <div className="flex items-center space-x-2">
                            {payment._veritas && (
                              <div className="flex items-center space-x-1">
                                <ShieldCheckIcon className="w-4 h-4 text-green-400" />
                                <span className="text-green-400 text-xs font-mono">
                                  @veritas {payment._veritas.confidence}%
                                </span>
                              </div>
                            )}
                            {payment.status === 'failed' && (
                              <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">
                                Fallido
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewPayment(payment)}
                              className="text-pink-400 hover:text-pink-300 hover:bg-pink-500/20"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </Button>
                            {(payment.status === 'pending' || payment.status === 'failed') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditPayment(payment)}
                                className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </Button>
                            )}
                            {(payment.status === 'pending' || payment.status === 'failed') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeletePayment(payment.id)}
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
      )}

      {activeTab === 'analytics' && (
        /* Analytics View */
        <BillingAnalyticsV3 />
      )}

      {activeTab === 'subscription-plans' && (
        /* Subscription Plans Manager */
        <SubscriptionPlanManagerV3 />
      )}

      {/* Modals */}
      {showInvoiceForm && (
        <InvoiceFormModalV3
          isOpen={showInvoiceForm}
          invoice={selectedInvoice}
          patients={patients}
          onClose={handleCloseModals}
          onSuccess={handleFormSuccess}
        />
      )}

      {showPaymentForm && (
        <PaymentFormModalV3
          isOpen={showPaymentForm}
          payment={selectedPayment}
          invoices={filteredInvoices}
          onClose={handleCloseModals}
          onSuccess={handleFormSuccess}
        />
      )}

      {showInvoiceDetail && selectedInvoice && (
        <InvoiceDetailViewV3
          invoice={selectedInvoice}
          onClose={handleCloseModals}
        />
      )}

      {showPaymentDetail && selectedPayment && (
        <PaymentDetailViewV3
          payment={selectedPayment}
          onClose={handleCloseModals}
        />
      )}
    </div>
  );
};

export default FinancialManagerV3;
