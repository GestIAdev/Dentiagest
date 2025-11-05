import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { usePaymentStore } from '../stores/paymentStore';
import {
  CreditCardIcon,
  QrCodeIcon,
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  TrashIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

// ============================================================================
// COMPONENTE: PAYMENT MANAGEMENT V3 - AGNOSTIC BRIDGE
// ============================================================================

const PaymentManagementV3: React.FC = () => {
  const {
    paymentMethods,
    paymentHistory,
    activeOrder,
    isLoading,
    error,
    setPaymentMethods,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    setPaymentHistory,
    addPaymentHistory,
    setActiveOrder,
    setLoading,
    setError,
    getDefaultPaymentMethod,
    getPendingPayments,
    getTotalPaid,
  } = usePaymentStore();

  const [activeTab, setActiveTab] = useState<'methods' | 'history' | 'orders'>('methods');
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showBizumModal, setShowBizumModal] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockMethods: any[] = [
      {
        id: 'card-1',
        type: 'card',
        provider: 'visa',
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2026,
        isDefault: true,
        isVerified: true,
      },
      {
        id: 'card-2',
        type: 'card',
        provider: 'mastercard',
        last4: '8888',
        expiryMonth: 8,
        expiryYear: 2025,
        isDefault: false,
        isVerified: true,
      },
    ];

    const mockHistory: any[] = [
      {
        id: 'pay-1',
        patientId: 'patient-1',
        clinicId: 'clinic-1',
        amount: 150.00,
        currency: 'EUR',
        method: { id: 'card-1', type: 'card', provider: 'visa', last4: '4242', isDefault: true, isVerified: true },
        status: 'completed',
        type: 'subscription',
        description: 'Suscripción Dental Premium - Mensual',
        transactionId: 'txn_123456789',
        veritasSignature: 'veritas:abc123...',
        createdAt: '2024-01-15T10:30:00Z',
        processedAt: '2024-01-15T10:30:05Z',
      },
      {
        id: 'pay-2',
        patientId: 'patient-1',
        clinicId: 'clinic-1',
        amount: 75.00,
        currency: 'EUR',
        method: { id: 'card-2', type: 'card', provider: 'mastercard', last4: '8888', isDefault: false, isVerified: true },
        status: 'completed',
        type: 'appointment',
        description: 'Consulta de ortodoncia',
        transactionId: 'txn_987654321',
        veritasSignature: 'veritas:def456...',
        createdAt: '2024-01-10T14:20:00Z',
        processedAt: '2024-01-10T14:20:03Z',
      },
    ];

    setPaymentMethods(mockMethods);
    setPaymentHistory(mockHistory);
  }, [setPaymentMethods, setPaymentHistory]);

  const handleProcessRecurringPayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const defaultMethod = getDefaultPaymentMethod();
      if (!defaultMethod) {
        throw new Error('No default payment method selected');
      }

      // Simulate API call
      const payment = await import('../stores/paymentStore').then(m =>
        m.processRecurringPayment('patient-1', 'clinic-1', 150.00, 'EUR', defaultMethod.id)
      );

      addPaymentHistory(payment);
      alert('Pago recurrente procesado exitosamente');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQROrder = async () => {
    setLoading(true);
    setError(null);

    try {
      const order = await import('../stores/paymentStore').then(m =>
        m.generatePaymentOrder('patient-1', 'clinic-1', 50.00, 'EUR', 'qr')
      );

      setActiveOrder(order);
      setShowQRModal(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBizumOrder = async () => {
    setLoading(true);
    setError(null);

    try {
      const order = await import('../stores/paymentStore').then(m =>
        m.generatePaymentOrder('patient-1', 'clinic-1', 30.00, 'EUR', 'bizum')
      );

      setActiveOrder(order);
      setShowBizumModal(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmManualPayment = async () => {
    if (!activeOrder) return;

    setLoading(true);
    setError(null);

    try {
      const payment = await import('../stores/paymentStore').then(m =>
        m.confirmManualPayment(activeOrder.id, {
          patientId: activeOrder.patientId,
          clinicId: activeOrder.clinicId,
          amount: activeOrder.amount,
          currency: activeOrder.currency,
        })
      );

      addPaymentHistory(payment);
      setActiveOrder(null);
      setShowQRModal(false);
      setShowBizumModal(false);
      alert('Pago manual confirmado exitosamente');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-400" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-400" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-400/10';
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'failed':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-900/50 to-purple-900/50 rounded-lg p-6 border border-cyan-500/30">
        <h2 className="text-2xl font-bold text-cyan-100 mb-2">💳 Puente de Pagos Agnóstico V3</h2>
        <p className="text-cyan-300">Sistema universal de pagos - VISA/MC + QR/Bizum</p>
        <div className="mt-4 flex items-center space-x-4">
          <div className="text-sm text-cyan-400">
            Total pagado: <span className="font-bold text-green-400">€{getTotalPaid().toFixed(2)}</span>
          </div>
          <div className="text-sm text-cyan-400">
            Pagos pendientes: <span className="font-bold text-yellow-400">{getPendingPayments().length}</span>
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

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg">
        {[
          { id: 'methods', label: 'Métodos de Pago', icon: CreditCardIcon },
          { id: 'history', label: 'Historial', icon: BanknotesIcon },
          { id: 'orders', label: 'Órdenes', icon: QrCodeIcon },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
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

      {/* Tab Content */}
      <div className="bg-gray-900/50 rounded-lg border border-gray-700/50 p-6">
        {activeTab === 'methods' && (
          <div className="space-y-6">
            {/* Payment Methods List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cyan-100">Métodos de Pago Registrados</h3>
              {paymentMethods.map((method) => (
                <div key={method.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CreditCardIcon className="h-8 w-8 text-cyan-400" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-white">
                            {method.provider.toUpperCase()} ****{method.last4}
                          </span>
                          {method.isDefault && (
                            <StarIconSolid className="h-4 w-4 text-yellow-400" />
                          )}
                        </div>
                        <div className="text-sm text-gray-400">
                          {method.type === 'card' && method.expiryMonth && method.expiryYear &&
                            `Expira ${method.expiryMonth}/${method.expiryYear}`
                          }
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!method.isDefault && (
                        <button
                          onClick={() => setDefaultPaymentMethod(method.id)}
                          className="px-3 py-1 text-xs bg-yellow-600 hover:bg-yellow-700 text-white rounded-md transition-colors"
                        >
                          Establecer por defecto
                        </button>
                      )}
                      <button
                        onClick={() => removePaymentMethod(method.id)}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cyan-100">Acciones Rápidas</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={handleProcessRecurringPayment}
                  disabled={isLoading || !getDefaultPaymentMethod()}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg transition-all disabled:cursor-not-allowed"
                >
                  <CreditCardIcon className="h-5 w-5" />
                  <span>Procesar Pago Recurrente</span>
                </button>

                <button
                  onClick={handleGenerateQROrder}
                  disabled={isLoading}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg transition-all disabled:cursor-not-allowed"
                >
                  <QrCodeIcon className="h-5 w-5" />
                  <span>Generar QR</span>
                </button>

                <button
                  onClick={handleGenerateBizumOrder}
                  disabled={isLoading}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg transition-all disabled:cursor-not-allowed"
                >
                  <BanknotesIcon className="h-5 w-5" />
                  <span>Generar Bizum</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-cyan-100">Historial de Pagos</h3>
            {paymentHistory.map((payment) => (
              <div key={payment.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(payment.status)}
                    <div>
                      <div className="font-medium text-white">{payment.description}</div>
                      <div className="text-sm text-gray-400">
                        {payment.method.provider.toUpperCase()} ****{payment.method.last4} •
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-400">€{payment.amount.toFixed(2)}</div>
                    <div className={`text-xs px-2 py-1 rounded-full inline-block ${getStatusColor(payment.status)}`}>
                      {payment.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-cyan-100">Órdenes de Pago Activas</h3>
            {activeOrder ? (
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/30">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">Orden #{activeOrder.id}</div>
                    <div className="text-sm text-gray-400">
                      €{activeOrder.amount.toFixed(2)} • Expira: {new Date(activeOrder.expiresAt).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(activeOrder.status)}`}>
                      {activeOrder.status.toUpperCase()}
                    </span>
                    {activeOrder.status === 'pending' && (
                      <button
                        onClick={handleConfirmManualPayment}
                        disabled={isLoading}
                        className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:cursor-not-allowed"
                      >
                        Confirmar Pago
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                No hay órdenes activas
              </div>
            )}
          </div>
        )}
      </div>

      {/* QR Modal */}
      {showQRModal && activeOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-cyan-100 mb-4">Pago por QR</h3>
            <div className="bg-white p-4 rounded-lg mb-4">
              {/* QR Code placeholder */}
              <div className="w-48 h-48 bg-gray-200 mx-auto flex items-center justify-center text-gray-600">
                QR CODE
              </div>
            </div>
            <div className="text-center mb-4">
              <div className="font-bold text-white">€{activeOrder.amount.toFixed(2)}</div>
              <div className="text-sm text-gray-400">Expira en 15 minutos</div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowQRModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmManualPayment}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:cursor-not-allowed"
              >
                Confirmar Pago
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bizum Modal */}
      {showBizumModal && activeOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-cyan-100 mb-4">Pago por Bizum</h3>
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  ID Bizum
                </label>
                <div className="bg-gray-800 px-3 py-2 rounded-md text-white font-mono">
                  {activeOrder.bizumId}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Monto
                </label>
                <div className="bg-gray-800 px-3 py-2 rounded-md text-white font-bold">
                  €{activeOrder.amount.toFixed(2)}
                </div>
              </div>
            </div>
            <div className="text-center mb-4">
              <div className="text-sm text-gray-400">Expira en 15 minutos</div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowBizumModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmManualPayment}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:cursor-not-allowed"
              >
                Confirmar Pago
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagementV3;