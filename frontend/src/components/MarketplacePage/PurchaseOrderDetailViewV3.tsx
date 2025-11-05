// 🎯🎸💀 PURCHASE ORDER DETAIL VIEW V3.0 - TITAN PATTERN IMPLEMENTATION
// Date: September 26, 2025
// Mission: Complete purchase order detail view with @veritas quantum verification
// Status: V3.0 - Full marketplace system with quantum truth verification
// Challenge: Purchase order integrity and supplier verification with AI insights
// 🎨 THEME: Cyberpunk Medical - Cyan/Purple/Pink gradients with quantum effects
// 🔒 SECURITY: @veritas quantum truth verification on purchase transactions

import React from 'react';

// 🎯 TITAN PATTERN IMPORTS - Core Dependencies
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '../atoms';

// 🎯 ICONS - Heroicons for marketplace theme
import {
  XMarkIcon,
  ClipboardDocumentListIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  BuildingStorefrontIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  CubeIcon,
  CalendarIcon,
  
} from '@heroicons/react/24/outline';

// 🎯 PURCHASE ORDER DETAIL VIEW V3.0 INTERFACE
interface PurchaseOrderDetailViewV3Props {
  order: any;
  onClose: () => void;
}

// 🎯 STATUS CONFIGURATION - Cyberpunk Theme
const ORDER_STATUS_CONFIG = {
  draft: { label: 'Borrador', bgColor: 'bg-gray-500/20', textColor: 'text-gray-300', borderColor: 'border-gray-500/30', icon: ClipboardDocumentListIcon },
  pending: { label: 'Pendiente', bgColor: 'bg-yellow-500/20', textColor: 'text-yellow-300', borderColor: 'border-yellow-500/30', icon: ClockIcon },
  approved: { label: 'Aprobado', bgColor: 'bg-blue-500/20', textColor: 'text-blue-300', borderColor: 'border-blue-500/30', icon: CheckCircleIcon },
  ordered: { label: 'Ordenado', bgColor: 'bg-purple-500/20', textColor: 'text-purple-300', borderColor: 'border-purple-500/30', icon: TruckIcon },
  received: { label: 'Recibido', bgColor: 'bg-green-500/20', textColor: 'text-green-300', borderColor: 'border-green-500/30', icon: CubeIcon },
  cancelled: { label: 'Cancelado', bgColor: 'bg-red-500/20', textColor: 'text-red-300', borderColor: 'border-red-500/30', icon: XMarkIcon }
};

export const PurchaseOrderDetailViewV3: React.FC<PurchaseOrderDetailViewV3Props> = ({
  order,
  onClose
}) => {
  if (!order) return null;

  // 🎯 GET STATUS INFO
  const getOrderStatusInfo = (status: string) => {
    return ORDER_STATUS_CONFIG[status as keyof typeof ORDER_STATUS_CONFIG] || ORDER_STATUS_CONFIG.draft;
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

  const statusInfo = getOrderStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 border border-cyan-500/20">
        <CardHeader className="border-b border-gray-600/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <EyeIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  🎯 Detalle de Orden de Compra V3.0
                </CardTitle>
                <p className="text-gray-300 text-sm mt-1">
                  Verificación cuántica @veritas activa
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
            {/* 🎯 ORDER HEADER */}
            <Card className="bg-gradient-to-r from-purple-900/30 to-cyan-900/30 border border-purple-500/20">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-lg ${statusInfo.bgColor} border ${statusInfo.borderColor}`}>
                      <StatusIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                        <span>{order.orderNumber}</span>
                        {order._veritas && (
                          <ShieldCheckIcon className="w-6 h-6 text-green-400" />
                        )}
                      </h2>
                      <p className="text-gray-300 text-lg">{order.supplierName}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge className={`${statusInfo.bgColor} ${statusInfo.textColor} border ${statusInfo.borderColor} px-3 py-1`}>
                          {statusInfo.label}
                        </Badge>
                        {order._veritas && (
                          <Badge className="bg-green-500/20 text-green-300 border border-green-500/30 px-3 py-1">
                            @veritas {order._veritas.confidence}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-cyan-300">
                      {formatCurrency(order.totalAmount)}
                    </div>
                    <p className="text-gray-400 text-sm">Valor Total</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Fecha de Orden</p>
                      <p className="text-white font-semibold">{formatDate(order.orderDate)}</p>
                    </div>
                  </div>

                  {order.estimatedDeliveryDate && (
                    <div className="flex items-center space-x-3">
                      <TruckIcon className="w-5 h-5 text-cyan-400" />
                      <div>
                        <p className="text-gray-400 text-sm">Entrega Estimada</p>
                        <p className="text-white font-semibold">{formatDate(order.estimatedDeliveryDate)}</p>
                      </div>
                    </div>
                  )}

                  {order.actualDeliveryDate && (
                    <div className="flex items-center space-x-3">
                      <CheckCircleIcon className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="text-gray-400 text-sm">Entrega Real</p>
                        <p className="text-white font-semibold">{formatDate(order.actualDeliveryDate)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 🎯 SUPPLIER INFORMATION */}
            <Card className="bg-gray-800/50 border border-gray-600/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-purple-300 flex items-center space-x-2">
                  <BuildingStorefrontIcon className="w-5 h-5" />
                  <span>Información del Proveedor</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-gray-400 text-sm">Nombre del Proveedor</label>
                      <p className="text-white font-semibold">{order.supplierName}</p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">ID del Proveedor</label>
                      <p className="text-white font-mono">{order.supplierId}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-gray-400 text-sm">Creado por</label>
                      <p className="text-white">{order.createdBy}</p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">Fecha de Creación</label>
                      <p className="text-white">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 🎯 ORDER ITEMS */}
            <Card className="bg-gray-800/50 border border-gray-600/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-cyan-300 flex items-center space-x-2">
                  <CubeIcon className="w-5 h-5" />
                  <span>Items de la Orden ({order.items?.length || 0})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items?.map((item: any, index: number) => (
                    <Card key={item.id || index} className="bg-gray-700/30 border border-gray-600/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-white font-semibold">{item.productName}</h4>
                              {item._veritas && (
                                <ShieldCheckIcon className="w-4 h-4 text-green-400" />
                              )}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">Cantidad:</span>
                                <p className="text-white font-semibold">{item.quantity}</p>
                              </div>
                              <div>
                                <span className="text-gray-400">Precio Unitario:</span>
                                <p className="text-white font-semibold">{formatCurrency(item.unitPrice)}</p>
                              </div>
                              <div>
                                <span className="text-gray-400">Total:</span>
                                <p className="text-cyan-300 font-bold">{formatCurrency(item.totalPrice)}</p>
                              </div>
                              {item.receivedQuantity !== undefined && (
                                <div>
                                  <span className="text-gray-400">Recibido:</span>
                                  <p className={`font-semibold ${item.receivedQuantity >= item.quantity ? 'text-green-400' : 'text-yellow-400'}`}>
                                    {item.receivedQuantity} / {item.quantity}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 🎯 COST BREAKDOWN */}
            <Card className="bg-gradient-to-r from-cyan-900/30 to-purple-900/30 border border-cyan-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-pink-300 flex items-center space-x-2">
                  <BanknotesIcon className="w-5 h-5" />
                  <span>Desglose de Costos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Subtotal de Items</span>
                    <span className="text-white font-semibold">
                      {formatCurrency(order.items?.reduce((sum: number, item: any) => sum + item.totalPrice, 0) || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Costo de Envío</span>
                    <span className="text-white font-semibold">{formatCurrency(order.shippingCost || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Impuestos</span>
                    <span className="text-white font-semibold">{formatCurrency(order.taxAmount || 0)}</span>
                  </div>
                  <div className="border-t border-gray-600/30 pt-3 flex justify-between items-center">
                    <span className="text-lg text-cyan-300 font-semibold">Total</span>
                    <span className="text-2xl text-cyan-300 font-bold">{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 🎯 NOTES */}
            {order.notes && (
              <Card className="bg-gray-800/50 border border-gray-600/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-purple-300">Notas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white whitespace-pre-wrap">{order.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* 🎯 @VERITAS VERIFICATION DETAILS */}
            {order._veritas && (
              <Card className="bg-gradient-to-r from-green-900/30 to-cyan-900/30 border border-green-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-green-300 flex items-center space-x-2">
                    <ShieldCheckIcon className="w-5 h-5" />
                    <span>Verificación @veritas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="text-gray-400 text-sm">Confianza</label>
                      <p className="text-green-300 font-bold text-lg">{order._veritas.confidence}%</p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">Nivel</label>
                      <p className="text-green-300 font-semibold">{order._veritas.level}</p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">Verificado</label>
                      <p className="text-green-300 font-semibold">{formatDate(order._veritas.verifiedAt)}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="text-gray-400 text-sm">Certificado</label>
                    <p className="text-green-300 font-mono text-sm bg-green-500/10 p-2 rounded border border-green-500/20">
                      {order._veritas.certificate}
                    </p>
                  </div>
                  <div className="mt-4">
                    <label className="text-gray-400 text-sm">Algoritmo</label>
                    <p className="text-cyan-300 font-mono text-sm">{order._veritas.algorithm}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 🎯 ACTION BUTTONS */}
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

export default PurchaseOrderDetailViewV3;