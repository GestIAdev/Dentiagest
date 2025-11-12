// 🎯🎸📊 BILLING ANALYTICS V3.0 - QUANTUM FINANCIAL INTELLIGENCE
// Date: September 22, 2025
// Mission: Advanced financial analytics with AI-powered insights and predictive modeling
// Status: V3.0 - Quantum financial intelligence with real-time analytics
// Challenge: Transform raw financial data into actionable quantum insights

import React, { useState, useMemo } from 'react';

// 🔥 APOLLO CLIENT V4 ESM HOOKS - Real-time data from Selene
import { useQuery } from '@apollo/client/react';

// 🎯 TITAN PATTERN IMPORTS
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Spinner } from '../../design-system';
import { createModuleLogger } from '../../utils/logger';

// 🎯 GRAPHQL QUERIES - V3.0 Integration (LECTURA - Real-time from Selene)
import {
  GET_FINANCIAL_ANALYTICS,
  GET_FINANCIAL_DASHBOARD
} from '../../graphql/queries/financial';

// 🎯 ICONS
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  BoltIcon,
  CpuChipIcon,
  EyeIcon,
  CalendarIcon,
  BanknotesIcon,
  CreditCardIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  UserGroupIcon,
  BuildingLibraryIcon
} from '@heroicons/react/24/outline';

const l = createModuleLogger('BillingAnalyticsV3');

interface BillingAnalyticsV3Props {
  className?: string;
  dateRange?: { start: Date; end: Date };
  onExport?: () => void;
}

export const BillingAnalyticsV3: React.FC<BillingAnalyticsV3Props> = ({
  className = '',
  dateRange,
  onExport
}) => {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  // 🎯 GRAPHQL QUERY - Real analytics from Selene  
  const { 
    data, 
    loading: queryLoading, 
    error: queryError,
    refetch: refetchAnalytics 
  } = useQuery(GET_FINANCIAL_ANALYTICS, {
    variables: {
      dateFrom: dateRange?.start || undefined,
      dateTo: dateRange?.end || undefined,
      patientId: undefined
    },
    pollInterval: 30000 // Poll every 30 seconds for real-time updates
  });

  // 🎯 MEMOIZED PROCESSED DATA from GraphQL
  const analyticsData = useMemo(() => {
    if (!data?.financialAnalytics) return null;
    
    const analytics = (data as any).financialAnalytics;
    return {
      summary: {
        totalRevenue: analytics.total_revenue || 0,
        totalInvoices: analytics.total_invoices || 0,
        paidInvoices: analytics.paid_invoices || 0,
        pendingInvoices: analytics.pending_invoices || 0,
        overdueInvoices: analytics.overdue_invoices || 0,
        averagePaymentTime: analytics.average_payment_time || 0,
        collectionRate: analytics.collection_rate || 0
      },
      trends: {
        revenueGrowth: analytics.revenue_growth || 0,
        invoiceGrowth: analytics.invoice_growth || 0,
        paymentSpeed: analytics.payment_speed || 0,
        collectionRate: analytics.collection_trend || 0
      },
      topPerformers: analytics.top_performers || [],
      paymentMethods: analytics.payment_methods || [],
      monthlyData: analytics.monthly_data || [],
      alerts: analytics.alerts || []
    };
  }, [data]);

  // 🎯 LOADING STATE
  const isLoading = queryLoading || (loading && !analyticsData);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (queryError || !analyticsData) {
    return (
      <Card className="bg-red-950/20 border-red-500/30">
        <CardHeader>
          <CardTitle className="text-red-400">Error en Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-300">{queryError?.message || 'No hay datos disponibles'}</p>
          <Button onClick={() => refetchAnalytics()} className="mt-4">
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  // 🎯 FORMAT PERCENTAGE
  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  // 🎯 GET TREND COLOR
  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-green-400';
    if (value < 0) return 'text-red-400';
    return 'text-cyan-400';
  };

  // 🎯 GET TREND ICON
  const getTrendIcon = (value: number) => {
    if (value > 0) return ArrowUpIcon;
    if (value < 0) return ArrowDownIcon;
    return BoltIcon;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-lg border border-cyan-500/20">
        <div className="relative">
          <Spinner size="lg" className="text-cyan-400" />
          <div className="absolute inset-0 bg-cyan-400/20 rounded-full animate-pulse"></div>
        </div>
        <span className="ml-3 text-cyan-300 font-medium">Cargando analytics...</span>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12 bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900 rounded-lg border border-red-500/20 backdrop-blur-sm">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-4 drop-shadow-lg" />
        <h3 className="text-lg font-semibold text-red-300 mb-2">Error al cargar analytics</h3>
        <p className="text-red-400/80">No se pudieron cargar los datos de análisis financiero.</p>
      </div>
    );
  }

  // Cast analytics data for safe access
  const data_ = (analyticsData as any) || {};

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="relative bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 rounded-xl border border-cyan-500/30 backdrop-blur-sm overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
        <div className="relative p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                Analytics Financieros Cuánticos
              </h1>
              <p className="text-cyan-300/80">
                Inteligencia financiera avanzada con IA predictiva
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-slate-800/50 border border-cyan-500/30 text-cyan-300 rounded-lg px-3 py-2 backdrop-blur-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              >
                <option value="7d">7 días</option>
                <option value="30d">30 días</option>
                <option value="90d">90 días</option>
                <option value="1y">1 año</option>
              </select>

              <Button
                onClick={onExport}
                className="bg-slate-800/50 border border-purple-500/30 text-purple-300 hover:bg-slate-700/50 hover:border-purple-400/50 backdrop-blur-sm"
              >
                <DocumentTextIcon className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="space-y-3">
        {data_.alerts.map((alert: any, index: number) => (
          <div
            key={index}
            className={`p-4 rounded-lg border backdrop-blur-sm ${
              alert.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300' :
              alert.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-300' :
              'bg-blue-500/10 border-blue-500/30 text-blue-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              {alert.type === 'warning' && <ExclamationTriangleIcon className="w-5 h-5" />}
              {alert.type === 'success' && <CheckCircleIcon className="w-5 h-5" />}
              {alert.type === 'info' && <EyeIcon className="w-5 h-5" />}
              <span className="font-medium">{alert.message}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-green-500/30 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-cyan-500/5"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300/80 text-sm font-medium">Ingresos Totales</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(data_.summary.totalRevenue)}</p>
                <div className={`flex items-center space-x-1 text-sm ${getTrendColor(data_.trends.revenueGrowth)}`}>
                  {React.createElement(getTrendIcon(data_.trends.revenueGrowth), { className: "w-4 h-4" })}
                  <span>{formatPercentage(data_.trends.revenueGrowth)}</span>
                </div>
              </div>
              <CurrencyDollarIcon className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-blue-500/30 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300/80 text-sm font-medium">Tasa de Cobro</p>
                <p className="text-2xl font-bold text-white">{data_.summary.collectionRate}%</p>
                <div className={`flex items-center space-x-1 text-sm ${getTrendColor(data_.trends.collectionRate)}`}>
                  {React.createElement(getTrendIcon(data_.trends.collectionRate), { className: "w-4 h-4" })}
                  <span>{formatPercentage(data_.trends.collectionRate)}</span>
                </div>
              </div>
              <ArrowTrendingUpIcon className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-purple-500/30 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300/80 text-sm font-medium">Facturas Pendientes</p>
                <p className="text-2xl font-bold text-white">{data_.summary.pendingInvoices}</p>
                <p className="text-sm text-orange-300">de {data_.summary.totalInvoices} total</p>
              </div>
              <ClockIcon className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-red-500/30 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-300/80 text-sm font-medium">Tiempo Promedio</p>
                <p className="text-2xl font-bold text-white">{data_.summary.averagePaymentTime}d</p>
                <div className={`flex items-center space-x-1 text-sm ${getTrendColor(-data_.trends.paymentSpeed)}`}>
                  {React.createElement(getTrendIcon(-data_.trends.paymentSpeed), { className: "w-4 h-4" })}
                  <span>{formatPercentage(-data_.trends.paymentSpeed)}</span>
                </div>
              </div>
              <BoltIcon className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <Card className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/30 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5"></div>
          <CardHeader className="relative border-b border-cyan-500/20">
            <CardTitle className="text-cyan-300 flex items-center space-x-2">
              <CreditCardIcon className="w-5 h-5" />
              <span>Métodos de Pago</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-4">
            {data_.paymentMethods.map((method: any, index: number) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{method.method}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-cyan-300 text-sm">{method.percentage}%</span>
                    <span className="text-white font-semibold">{formatCurrency(method.amount)}</span>
                  </div>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 border border-slate-600/30">
                  <div
                    className={`h-2 rounded-full ${
                      method.color === 'green' ? 'bg-gradient-to-r from-green-500 to-cyan-500' :
                      method.color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-purple-500' :
                      method.color === 'purple' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                      'bg-gradient-to-r from-orange-500 to-red-500'
                    }`}
                    style={{ width: `${method.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-pink-500/30 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-purple-500/5"></div>
          <CardHeader className="relative border-b border-pink-500/20">
            <CardTitle className="text-pink-300 flex items-center space-x-2">
              <UserGroupIcon className="w-5 h-5" />
              <span>Top Performers</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-4">
            {data_.topPerformers.map((performer: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-600/30">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {performer.name.split(' ').map((n: string) => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{performer.name}</p>
                    <p className="text-cyan-300/80 text-sm">{performer.invoices} facturas</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">{formatCurrency(performer.revenue)}</p>
                  <p className="text-green-400 text-sm">{performer.collectionRate}% cobro</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-orange-500/30 backdrop-blur-sm overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-red-500/5"></div>
        <CardHeader className="relative border-b border-orange-500/20">
          <CardTitle className="text-orange-300 flex items-center space-x-2">
            <ChartBarIcon className="w-5 h-5" />
            <span>Tendencias Mensuales</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data_.monthlyData.map((month: any, index: number) => (
              <div key={index} className="text-center p-4 bg-slate-800/30 rounded-lg border border-slate-600/30">
                <h3 className="text-white font-semibold text-lg mb-2">{month.month}</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-cyan-300/80 text-sm">Ingresos</p>
                    <p className="text-white font-bold">{formatCurrency(month.revenue)}</p>
                  </div>
                  <div>
                    <p className="text-cyan-300/80 text-sm">Facturas</p>
                    <p className="text-white">{month.invoices}</p>
                  </div>
                  <div>
                    <p className="text-green-300/80 text-sm">Pagadas</p>
                    <p className="text-green-300 font-semibold">{month.paid}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingAnalyticsV3;

