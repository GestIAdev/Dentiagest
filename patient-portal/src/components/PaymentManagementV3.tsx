import React, { useState, useEffect } from 'react';
import { apolloClient } from '../config/apollo';
import { useAuthStore } from '../stores/authStore';
import {
  GET_PATIENT_BILLING_DATA,
  type BillingData
} from '../graphql/billing';
import {
  CreditCardIcon,
  DocumentArrowDownIcon,
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

// ============================================================================
// COMPONENTE: PAYMENT MANAGEMENT V3 - REAL BILLING DATA
// By PunkClaude - Directiva #003 GeminiEnder
// NO MORE MOCKS - Conectado a billingDataV3 de Selene
// ============================================================================

const PaymentManagementV3: React.FC = () => {
  const { auth } = useAuthStore();
  
  const [billingData, setBillingData] = useState<BillingData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'paid' | 'pending'>('all');

  // 💰 LOAD REAL BILLING DATA from Selene
  useEffect(() => {
    if (auth?.isAuthenticated && auth.patientId) {
      loadBillingData();
    }
  }, [auth]);

  const loadBillingData = async () => {
    if (!auth?.patientId) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data } = await apolloClient.query<{ billingDataV3: BillingData[] }>({
        query: GET_PATIENT_BILLING_DATA,
        variables: {
          patientId: auth.patientId,
          clinicId: auth.clinicId
        },
        fetchPolicy: 'network-only'
      });

      if (data?.billingDataV3) {
        setBillingData(data.billingDataV3);
        console.log('✅ Billing data loaded:', data.billingDataV3.length, 'records');
      }
    } catch (err) {
      console.error('❌ Error loading billing data:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar datos de facturación');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter billing data by status
  const filteredBillingData = billingData.filter(bill => {
    if (activeTab === 'all') return true;
    if (activeTab === 'paid') return bill.status === 'PAID';
    if (activeTab === 'pending') return bill.status === 'PENDING';
    return true;
  });

  // Calculate total paid amount
  const getTotalPaid = () => {
    return billingData
      .filter(bill => bill.status === 'PAID')
      .reduce((sum, bill) => sum + bill.totalAmount, 0);
  };

  // Get pending payments count
  const getPendingCount = () => {
    return billingData.filter(bill => bill.status === 'PENDING').length;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case 'PENDING':
        return <ClockIcon className="h-5 w-5 text-yellow-400" />;
      case 'OVERDUE':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'text-green-400 bg-green-400/10';
      case 'PENDING':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'OVERDUE':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-900/50 to-purple-900/50 rounded-lg p-6 border border-cyan-500/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-cyan-100 mb-2">💳 Gestión de Pagos V3</h2>
            <p className="text-cyan-300">Facturación y pagos - Datos Reales de Selene</p>
          </div>
          <div className="flex items-center space-x-2 px-3 py-1 bg-cyan-500/20 rounded-full">
            <CheckCircleIcon className="h-4 w-4 text-cyan-400" />
            <span className="text-xs text-cyan-300 font-semibold">DATOS REALES</span>
          </div>
        </div>
        <div className="mt-4 flex items-center space-x-4">
          <div className="text-sm text-cyan-400">
            Total pagado: <span className="font-bold text-green-400">€{getTotalPaid().toFixed(2)}</span>
          </div>
          <div className="text-sm text-cyan-400">
            Pagos pendientes: <span className="font-bold text-yellow-400">{getPendingCount()}</span>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/50 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <XCircleIcon className="h-5 w-5 text-red-400" />
            <span className="text-red-300">{error}</span>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg">
        {[
          { id: 'all', label: 'Todas', icon: BanknotesIcon },
          { id: 'paid', label: 'Pagadas', icon: CheckCircleIcon },
          { id: 'pending', label: 'Pendientes', icon: ClockIcon },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'all' | 'paid' | 'pending')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-cyan-600 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Billing Data List */}
      <div className="bg-gray-900/50 rounded-lg border border-gray-700/50 p-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
            <p className="text-gray-400 mt-4">Cargando facturas...</p>
          </div>
        ) : filteredBillingData.length === 0 ? (
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No hay facturas {activeTab === 'all' ? '' : activeTab === 'paid' ? 'pagadas' : 'pendientes'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBillingData.map((bill) => (
              <div key={bill.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(bill.status)}
                    <div>
                      <div className="font-medium text-white">
                        Factura #{bill.id.substring(0, 8)}
                      </div>
                      <div className="text-sm text-gray-400">
                        {new Date(bill.issueDate).toLocaleDateString('es-ES')}
                      </div>
                      {bill.dueDate && (
                        <div className="text-xs text-gray-500 mt-1">
                          Vence: {new Date(bill.dueDate).toLocaleDateString('es-ES')}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white text-lg">
                      {bill.currency === 'EUR' && '€'}
                      {bill.currency === 'USD' && '$'}
                      {bill.currency === 'ARS' && '$'}
                      {bill.totalAmount.toFixed(2)}
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full inline-block ${getStatusColor(bill.status)}`}>
                      {bill.status === 'PAID' && 'PAGADO'}
                      {bill.status === 'PENDING' && 'PENDIENTE'}
                      {bill.status === 'OVERDUE' && 'VENCIDO'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentManagementV3;