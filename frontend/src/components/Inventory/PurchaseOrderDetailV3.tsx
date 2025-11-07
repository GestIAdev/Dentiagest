// 🎯🎸💀 PURCHASE ORDER DETAIL V3.0 - TITAN PATTERN IMPLEMENTATION
// Date: September 25, 2025
// Mission: Complete purchase order detail view with @veritas verification
// Status: V3.0 - Full detail view with quantum verification and analytics
// Challenge: Complex order detail display with verification status
// 🎨 THEME: Cyberpunk Medical - Cyan/Purple/Pink gradients with quantum effects
// 🔒 SECURITY: @veritas quantum truth verification display

import React from 'react';

// 🎯 TITAN PATTERN IMPORTS - Core Dependencies
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '../atoms';

// 🎯 ICONS - Heroicons for purchase order theme
import {
  DocumentTextIcon,
  XMarkIcon,
  ShieldCheckIcon,
  BuildingStorefrontIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  TruckIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

// 🎯 PURCHASE ORDER DETAIL V3.0 INTERFACE
interface PurchaseOrderDetailV3Props {
  order: any;
  onClose: () => void;
}

// 🎯 PURCHASE ORDER DETAIL V3.0 COMPONENT
export const PurchaseOrderDetailV3: React.FC<PurchaseOrderDetailV3Props> = ({
  order,
  onClose
}) => {
  // 🎯 STATUS CONFIGURATION
  const getStatusInfo = (status: string) => {
    const statusConfig = {
      draft: { label: 'Borrador', bgColor: 'bg-gray-500/20', textColor: 'text-gray-300', borderColor: 'border-gray-500/30', icon: DocumentTextIcon },
      pending_approval: { label: 'Pendiente Aprobación', bgColor: 'bg-yellow-500/20', textColor: 'text-yellow-300', borderColor: 'border-yellow-500/30', icon: ClockIcon },
      approved: { label: 'Aprobada', bgColor: 'bg-green-500/20', textColor: 'text-green-300', borderColor: 'border-green-500/30', icon: CheckCircleIcon },
      ordered: { label: 'Ordenada', bgColor: 'bg-blue-500/20', textColor: 'text-blue-300', borderColor: 'border-blue-500/30', icon: TruckIcon },
      received: { label: 'Recibida', bgColor: 'bg-purple-500/20', textColor: 'text-purple-300', borderColor: 'border-purple-500/30', icon: CheckCircleIcon },
      cancelled: { label: 'Cancelada', bgColor: 'bg-red-500/20', textColor: 'text-red-300', borderColor: 'border-red-500/30', icon: ExclamationTriangleIcon }
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
  };

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

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-cyan-900/20 backdrop-blur-sm border border-purple-500/20">
        <CardHeader className="border-b border-gray-600/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <DocumentTextIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  🎯 Detalle Orden de Compra V3.0
                </CardTitle>
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

        <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Order Header */}
            <Card className="bg-gradient-to-r from-cyan-900/20 to-purple-900/20 border border-cyan-500/30">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-lg ${statusInfo.bgColor} border ${statusInfo.borderColor}`}>
                      <StatusIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{order.orderNumber}</h2>
                      <Badge className={`${statusInfo.bgColor} ${statusInfo.textColor} border ${statusInfo.borderColor} text-lg px-3 py-1`}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-bold text-purple-400">
                      {formatCurrency(order.totalAmount)}
                    </div>
                    <div className="text-sm text-gray-400">Valor Total</div>
                  </div>
                </div>

                {/* @veritas Verification Status */}
                {order._veritas && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-3">
                      <ShieldCheckIcon className="w-6 h-6 text-green-400" />
                      <div>
                        <h4 className="text-green-400 font-semibold">Verificación @veritas Completada</h4>
                        <p className="text-green-300 text-sm">
                          Confianza: {order._veritas.confidence}% • Nivel: {order._veritas.level} •
                          Algoritmo: {order._veritas.algorithm}
                        </p>
                        <p className="text-gray-400 text-xs">
                          Verificado el {formatDate(order._veritas.verifiedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* General Information */}
              <Card className="bg-gray-800/30 border border-gray-600/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-cyan-300 flex items-center space-x-2">
                    <DocumentTextIcon className="w-5 h-5" />
                    <span>Información General</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400">Número de Orden</label>
                      <p className="text-white font-mono">{order.orderNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Estado</label>
                      <p className={`font-semibold ${statusInfo.textColor}`}>{statusInfo.label}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Fecha de Orden</label>
                      <p className="text-white">{formatDate(order.orderDate)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Entrega Esperada</label>
                      <p className="text-white">{order.expectedDelivery ? formatDate(order.expectedDelivery) : 'No especificada'}</p>
                    </div>
                    {order.actualDelivery && (
                      <>
                        <div>
                          <label className="text-sm text-gray-400">Entrega Real</label>
                          <p className="text-white">{formatDate(order.actualDelivery)}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-400">Estado de Entrega</label>
                          <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                            Completada
                          </Badge>
                        </div>
                      </>
                    )}
                  </div>

                  {order.notes && (
                    <div>
                      <label className="text-sm text-gray-400">Notas</label>
                      <p className="text-white bg-gray-700/50 p-3 rounded-lg mt-1">{order.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Supplier Information */}
              <Card className="bg-gray-800/30 border border-gray-600/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-purple-300 flex items-center space-x-2">
                    <BuildingStorefrontIcon className="w-5 h-5" />
                    <span>Información del Proveedor</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400">Nombre del Proveedor</label>
                    <p className="text-white font-semibold">{order.supplier?.name || 'No especificado'}</p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">Información de Contacto</label>
                    <p className="text-white">{order.supplier?.contactInfo || 'No disponible'}</p>
                  </div>

                  {order.approvedBy && (
                    <div>
                      <label className="text-sm text-gray-400">Aprobada por</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <UserIcon className="w-4 h-4 text-green-400" />
                        <p className="text-green-300">{order.approvedBy}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Items */}
            <Card className="bg-gray-800/30 border border-gray-600/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-pink-300 flex items-center space-x-2">
                  <ClipboardDocumentListIcon className="w-5 h-5" />
                  <span>Items de la Orden</span>
                  <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30">
                    {order.items?.length || 0} items
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.items && order.items.length > 0 ? (
                  <div className="space-y-3">
                    {order.items.map((item: any, index: number) => (
                      <Card key={item.id || index} className="bg-gray-700/30 border border-gray-600/30">
                        <CardContent className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                            <div className="md:col-span-2">
                              <h4 className="text-white font-semibold">{item.description}</h4>
                              <p className="text-gray-400 text-sm">
                                Estado: <span className="text-cyan-300">{item.status}</span>
                              </p>
                            </div>

                            <div className="text-center">
                              <label className="text-sm text-gray-400">Cantidad</label>
                              <p className="text-white font-semibold">{item.quantity}</p>
                            </div>

                            <div className="text-center">
                              <label className="text-sm text-gray-400">Precio Unit.</label>
                              <p className="text-white">{formatCurrency(item.unitPrice)}</p>
                            </div>

                            <div className="text-center">
                              <label className="text-sm text-gray-400">Total</label>
                              <p className="text-purple-400 font-bold">{formatCurrency(item.totalPrice)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ClipboardDocumentListIcon className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-300 mb-2">No hay items</h3>
                    <p className="text-gray-500">Esta orden no tiene items asociados</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30">
              <CardContent className="p-6">
                <h4 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                  <CurrencyDollarIcon className="w-6 h-6 text-green-400" />
                  <span>Resumen Financiero</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-cyan-400">{order.items?.length || 0}</div>
                    <div className="text-sm text-gray-400">Total Items</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">{formatCurrency(order.totalAmount - order.taxAmount)}</div>
                    <div className="text-sm text-gray-400">Subtotal</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400">{formatCurrency(order.totalAmount)}</div>
                    <div className="text-sm text-gray-400">Total Final</div>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Subtotal:</span>
                      <span className="text-white">{formatCurrency(order.totalAmount - order.taxAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Impuestos:</span>
                      <span className="text-white">{formatCurrency(order.taxAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between text-lg font-bold pt-2 border-t border-gray-600/30">
                      <span className="text-white">Total:</span>
                      <span className="text-purple-400">{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Order Timeline */}
                <div className="mt-6 pt-6 border-t border-gray-600/30">
                  <h5 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <ArrowTrendingUpIcon className="w-5 h-5 text-blue-400" />
                    <span>Línea de Tiempo</span>
                  </h5>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-300">Creada: {formatDate(order.createdAt)}</span>
                    </div>
                    {order.approvedBy && (
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-gray-300">Aprobada por {order.approvedBy}</span>
                      </div>
                    )}
                    {order.actualDelivery && (
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-gray-300">Recibida: {formatDate(order.actualDelivery)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-600/30">
              <Button
                onClick={onClose}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseOrderDetailV3;
