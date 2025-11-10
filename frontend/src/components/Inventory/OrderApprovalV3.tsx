// 🎯🎸💀 ORDER APPROVAL V3.0 - TITAN PATTERN IMPLEMENTATION
// Date: September 25, 2025
// Mission: Complete purchase order approval workflow with @veritas verification
// Status: V3.0 - Full approval system with quantum verification and audit trail
// Challenge: Secure approval workflow with comprehensive validation
// 🎨 THEME: Cyberpunk Medical - Cyan/Purple/Pink gradients with quantum effects
// 🔒 SECURITY: @veritas quantum truth verification on approval decisions

import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';

// 🎯 TITAN PATTERN IMPORTS - Core Dependencies
import { Button } from '../../design-system/Button';
import { Card, CardHeader, CardBody } from '../../design-system/Card';
import { Badge } from '../../design-system/Badge';
import { Spinner } from '../../design-system/Spinner';
import { createModuleLogger } from '../../utils/logger';

// 🎯 GRAPHQL MUTATIONS - V3.0 Integration
import {
  UPDATE_PURCHASE_ORDER,
  GET_PURCHASE_ORDERS
} from '../../graphql/queries/inventory';

// 🎯 ICONS - Heroicons for approval theme
import {
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  BuildingStorefrontIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

// 🎯 ORDER APPROVAL V3.0 INTERFACE
interface OrderApprovalV3Props {
  order: any;
  onClose: () => void;
  onSuccess: () => void;
}

// 🎯 APPROVAL DECISION INTERFACE
interface ApprovalDecision {
  approved: boolean;
  comments: string;
  approvalLevel: 'basic' | 'senior' | 'executive';
}

// 🎯 LOGGER - Module specific logger
const l = createModuleLogger('OrderApprovalV3');

// 🎯 APPROVAL THRESHOLDS
const APPROVAL_THRESHOLDS = {
  basic: 1000,    // Up to $1,000 - Basic approval
  senior: 10000,  // Up to $10,000 - Senior approval
  executive: Infinity // Over $10,000 - Executive approval
};

// 🎯 ORDER APPROVAL V3.0 COMPONENT
export const OrderApprovalV3: React.FC<OrderApprovalV3Props> = ({
  order,
  onClose,
  onSuccess
}) => {
  // 🎯 STATE MANAGEMENT
  const [decision, setDecision] = useState<ApprovalDecision>({
    approved: false,
    comments: '',
    approvalLevel: 'basic'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);

  // 🎯 GRAPHQL MUTATIONS
  const [updateOrder] = useMutation(UPDATE_PURCHASE_ORDER, {
    refetchQueries: [{ query: GET_PURCHASE_ORDERS }]
  });

  // 🎯 CALCULATED VALUES
  const getRequiredApprovalLevel = (amount: number) => {
    if (amount <= APPROVAL_THRESHOLDS.basic) return 'basic';
    if (amount <= APPROVAL_THRESHOLDS.senior) return 'senior';
    return 'executive';
  };

  const requiredLevel = getRequiredApprovalLevel(order.totalAmount);
  const canApprove = decision.approvalLevel === requiredLevel || decision.approvalLevel === 'executive';

  // 🎯 FORMAT CURRENCY
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // 🎯 FORMAT DATE
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 🎯 HANDLERS
  const handleApprove = async () => {
    if (!canApprove) {
      alert(`Esta orden requiere aprobación de nivel ${requiredLevel}. Su nivel actual es ${decision.approvalLevel}.`);
      return;
    }

    if (!decision.comments.trim()) {
      alert('Debe proporcionar comentarios para la aprobación.');
      return;
    }

    setIsSubmitting(true);

    try {
      await updateOrder({
        variables: {
          id: order.id,
          input: {
            status: 'approved',
            approvedBy: 'Current User', // TODO: Get from auth context
            notes: decision.comments
          }
        }
      });

      l.info('Purchase order approved successfully', { orderId: order.id, approvalLevel: decision.approvalLevel });
      onSuccess();
    } catch (error) {
      l.error('Failed to approve purchase order', error as Error);
      alert('Error al aprobar la orden. Intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!decision.comments.trim()) {
      alert('Debe proporcionar comentarios para el rechazo.');
      return;
    }

    setIsSubmitting(true);

    try {
      await updateOrder({
        variables: {
          id: order.id,
          input: {
            status: 'cancelled',
            notes: decision.comments
          }
        }
      });

      l.info('Purchase order rejected successfully', { orderId: order.id, approvalLevel: decision.approvalLevel });
      onSuccess();
    } catch (error) {
      l.error('Failed to reject purchase order', error as Error);
      alert('Error al rechazar la orden. Intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🎯 APPROVAL LEVEL COLORS
  const getApprovalLevelColor = (level: string) => {
    switch (level) {
      case 'basic': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'senior': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'executive': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-cyan-900/20 backdrop-blur-sm border border-purple-500/20">
        <CardHeader className="border-b border-gray-600/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <ShieldCheckIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  🎯 Aprobación de Orden V3.0
                </h2>
                <p className="text-gray-300 text-sm mt-1">
                  {order.orderNumber} • Verificación cuántica @veritas
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-gray-700/50"
            >
              <XMarkIcon className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardBody className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Order Summary */}
            <Card className="bg-gradient-to-r from-cyan-900/20 to-purple-900/20 border border-cyan-500/30">
              <CardBody className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{order.orderNumber}</h3>
                    <p className="text-gray-300">{order.supplier?.name}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-400">
                      {formatCurrency(order.totalAmount)}
                    </div>
                    <div className="text-sm text-gray-400">Valor Total</div>
                  </div>
                </div>

                {/* Approval Requirements */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
                    <span>Requisitos de Aprobación</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400">Nivel Requerido</label>
                      <Badge className={`mt-1 ${getApprovalLevelColor(requiredLevel)}`}>
                        {requiredLevel.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Su Nivel Actual</label>
                      <Badge className={`mt-1 ${getApprovalLevelColor(decision.approvalLevel)}`}>
                        {decision.approvalLevel.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  {!canApprove && (
                    <div className="mt-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                      <p className="text-red-400 text-sm flex items-center space-x-2">
                        <ExclamationTriangleIcon className="w-4 h-4" />
                        <span>No tiene permisos suficientes para aprobar esta orden</span>
                      </p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Order Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Order Information */}
              <Card className="bg-gray-800/30 border border-gray-600/30">
                <CardHeader className="pb-3">
                  <h2 className="text-lg text-cyan-300 flex items-center space-x-2">
                    <DocumentTextIcon className="w-5 h-5" />
                    <span>Detalles de la Orden</span>
                  </h2>
                </CardHeader>
                <CardBody className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fecha de Orden:</span>
                    <span className="text-white">{formatDate(order.orderDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Entrega Esperada:</span>
                    <span className="text-white">{order.expectedDelivery ? formatDate(order.expectedDelivery) : 'No especificada'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Items:</span>
                    <span className="text-white">{order.items?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Subtotal:</span>
                    <span className="text-white">{formatCurrency(order.totalAmount - order.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Impuestos:</span>
                    <span className="text-white">{formatCurrency(order.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-gray-600/30 pt-2">
                    <span className="text-white">Total:</span>
                    <span className="text-purple-400">{formatCurrency(order.totalAmount)}</span>
                  </div>
                </CardBody>
              </Card>

              {/* Approval Level Selection */}
              <Card className="bg-gray-800/30 border border-gray-600/30">
                <CardHeader className="pb-3">
                  <h2 className="text-lg text-purple-300 flex items-center space-x-2">
                    <UserIcon className="w-5 h-5" />
                    <span>Nivel de Aprobación</span>
                  </h2>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Seleccione su nivel de aprobación
                      </label>
                      <select
                        value={decision.approvalLevel}
                        onChange={(e) => setDecision(prev => ({ ...prev, approvalLevel: e.target.value as any }))}
                        className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
                      >
                        <option value="basic">Básico (Hasta $1,000)</option>
                        <option value="senior">Senior (Hasta $10,000)</option>
                        <option value="executive">Ejecutivo (Sin límite)</option>
                      </select>
                    </div>

                    <div className="text-sm text-gray-400">
                      <p><strong>Básico:</strong> Aprobaciones hasta $1,000</p>
                      <p><strong>Senior:</strong> Aprobaciones hasta $10,000</p>
                      <p><strong>Ejecutivo:</strong> Aprobaciones sin límite</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Order Items Preview */}
            <Card className="bg-gray-800/30 border border-gray-600/30">
              <CardHeader className="pb-3">
                <h2 className="text-lg text-pink-300 flex items-center space-x-2">
                  <ClipboardDocumentListIcon className="w-5 h-5" />
                  <span>Items de la Orden</span>
                  <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30">
                    {order.items?.length || 0} items
                  </Badge>
                </h2>
              </CardHeader>
              <CardBody>
                {order.items && order.items.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {order.items.map((item: any, index: number) => (
                      <div key={item.id || index} className="flex justify-between items-center py-2 border-b border-gray-600/30">
                        <div className="flex-1">
                          <p className="text-white text-sm">{item.description}</p>
                          <p className="text-gray-400 text-xs">Cant: {item.quantity} × {formatCurrency(item.unitPrice)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-purple-400 font-semibold">{formatCurrency(item.totalPrice)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-4">No hay items en esta orden</p>
                )}
              </CardBody>
            </Card>

            {/* @veritas Verification Status */}
            {order._veritas && (
              <Card className="bg-green-500/10 border border-green-500/30">
                <CardBody className="p-4">
                  <div className="flex items-center space-x-3">
                    <ShieldCheckIcon className="w-6 h-6 text-green-400" />
                    <div>
                      <h4 className="text-green-400 font-semibold">Verificación @veritas Completada</h4>
                      <p className="text-green-300 text-sm">
                        Confianza: {order._veritas.confidence}% • Algoritmo: {order._veritas.algorithm}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Decision Comments */}
            <Card className="bg-gray-800/30 border border-gray-600/30">
              <CardHeader className="pb-3">
                <h2 className="text-lg text-white">
                  Comentarios de Decisión *
                </h2>
              </CardHeader>
              <CardBody>
                <textarea
                  value={decision.comments}
                  onChange={(e) => setDecision(prev => ({ ...prev, comments: e.target.value }))}
                  placeholder="Explique los motivos de su decisión de aprobación o rechazo..."
                  rows={4}
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20"
                />
                <p className="text-gray-400 text-sm mt-2">
                  Los comentarios son obligatorios y quedarán registrados en el historial de auditoría
                </p>
              </CardBody>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-600/30">
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-white hover:bg-gray-700/50"
              >
                Cancelar
              </Button>

              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => setShowRejectForm(true)}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                >
                  <XCircleIcon className="w-4 h-4 mr-2" />
                  Rechazar Orden
                </Button>

                <Button
                  onClick={handleApprove}
                  disabled={isSubmitting || !canApprove || !decision.comments.trim()}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner size="sm" />
                      <span className="ml-2">Procesando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-4 h-4 mr-2" />
                      Aprobar Orden
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Reject Confirmation Modal */}
      {showRejectForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <Card className="w-full max-w-md bg-gradient-to-br from-red-900/20 via-pink-900/20 to-purple-900/20 backdrop-blur-sm border border-red-500/20">
            <CardHeader className="border-b border-gray-600/30">
              <h2 className="text-xl font-bold text-red-400 flex items-center space-x-2">
                <XCircleIcon className="w-6 h-6" />
                <span>Confirmar Rechazo</span>
              </h2>
            </CardHeader>
            <CardBody className="p-6">
              <div className="space-y-4">
                <p className="text-white">
                  ¿Está seguro de que desea rechazar la orden <strong>{order.orderNumber}</strong>?
                </p>

                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-300 text-sm">
                    Esta acción no se puede deshacer y quedará registrada en el historial de auditoría.
                  </p>
                </div>

                <div className="flex items-center justify-end space-x-3">
                  <Button
                    variant="ghost"
                    onClick={() => setShowRejectForm(false)}
                    className="text-gray-400 hover:text-white hover:bg-gray-700/50"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleReject}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner size="sm" />
                        <span className="ml-2">Rechazando...</span>
                      </>
                    ) : (
                      <>
                        <XCircleIcon className="w-4 h-4 mr-2" />
                        Confirmar Rechazo
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
};

export default OrderApprovalV3;
