// 🎯🎸💀 SUPPLIER DETAIL V3.0 - TITAN PATTERN IMPLEMENTATION
// Date: September 25, 2025
// Mission: Complete supplier detail view with @veritas verification
// Status: V3.0 - Full supplier information display with quantum truth
// Challenge: Comprehensive supplier data visualization
// 🎨 THEME: Cyberpunk Medical - Cyan/Purple/Pink gradients with quantum effects
// 🔒 SECURITY: @veritas quantum truth verification display

import React from 'react';

// 🎯 TITAN PATTERN IMPORTS - Core Dependencies
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '../atoms';

// 🎯 ICONS - Heroicons for supplier theme
import {
  XMarkIcon,
  BuildingStorefrontIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CreditCardIcon,
  DocumentTextIcon,
  StarIcon,
  ShieldCheckIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// 🎯 SUPPLIER DETAIL V3.0 INTERFACE
interface SupplierDetailV3Props {
  supplier: any;
  onClose: () => void;
}

// 🎯 SUPPLIER STATUS CONFIGURATION
const SUPPLIER_STATUS_CONFIG = {
  active: { label: 'Activo', bgColor: 'bg-green-500/20', textColor: 'text-green-300', borderColor: 'border-green-500/30' },
  inactive: { label: 'Inactivo', bgColor: 'bg-gray-500/20', textColor: 'text-gray-300', borderColor: 'border-gray-500/30' },
  suspended: { label: 'Suspendido', bgColor: 'bg-red-500/20', textColor: 'text-red-300', borderColor: 'border-red-500/30' }
};

// 🎯 PERFORMANCE RATING COLORS
const getRatingColor = (rating: number) => {
  if (rating >= 4.5) return 'text-green-400';
  if (rating >= 3.5) return 'text-yellow-400';
  if (rating >= 2.5) return 'text-orange-400';
  return 'text-red-400';
};

// 🎯 PERFORMANCE METRICS DISPLAY
const PerformanceMetric: React.FC<{ label: string; value: number; unit?: string; color?: string }> = ({
  label,
  value,
  unit = '%',
  color = 'text-cyan-400'
}) => (
  <div className="text-center p-3 bg-gray-800/30 rounded-lg border border-gray-600/30">
    <div className={`text-xl font-bold ${color}`}>{value}{unit}</div>
    <div className="text-xs text-gray-400">{label}</div>
  </div>
);

export const SupplierDetailV3: React.FC<SupplierDetailV3Props> = ({
  supplier,
  onClose
}) => {
  if (!supplier) return null;

  const statusConfig = SUPPLIER_STATUS_CONFIG[supplier.status as keyof typeof SUPPLIER_STATUS_CONFIG];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm border border-purple-500/20">
        <CardHeader className="border-b border-gray-600/30 bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-cyan-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <BuildingStorefrontIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  🎯 Detalles del Proveedor V3.0
                </CardTitle>
                <p className="text-gray-300 text-sm mt-1">
                  Información completa con verificación cuántica @veritas
                </p>
                <div className="flex items-center space-x-3 mt-2">
                  <h2 className="text-white font-semibold text-lg">{supplier.name}</h2>
                  {supplier._veritas && (
                    <ShieldCheckIcon className="w-5 h-5 text-green-400" />
                  )}
                  <Badge className={`${statusConfig.bgColor} ${statusConfig.textColor} border ${statusConfig.borderColor}`}>
                    {statusConfig.label}
                  </Badge>
                </div>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-cyan-900/20 to-cyan-800/20 backdrop-blur-sm border border-cyan-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-cyan-300 flex items-center space-x-2">
                    <UserIcon className="w-5 h-5" />
                    <span>Información de Contacto</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <UserIcon className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Persona de Contacto</p>
                      <p className="text-white font-medium">{supplier.contactPerson}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <EnvelopeIcon className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Email</p>
                      <p className="text-white font-medium">{supplier.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Teléfono</p>
                      <p className="text-white font-medium">{supplier.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPinIcon className="w-5 h-5 text-cyan-400 mt-0.5" />
                    <div>
                      <p className="text-gray-400 text-sm">Dirección</p>
                      <p className="text-white font-medium whitespace-pre-line">{supplier.address}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Business Information */}
              <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 backdrop-blur-sm border border-purple-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-purple-300 flex items-center space-x-2">
                    <CreditCardIcon className="w-5 h-5" />
                    <span>Información Empresarial</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">ID Fiscal</p>
                      <p className="text-white font-medium">{supplier.taxId || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Términos de Pago</p>
                      <p className="text-white font-medium">{supplier.paymentTerms}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Límite de Crédito</p>
                      <p className="text-white font-medium">${supplier.creditLimit?.toLocaleString() || '0'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Saldo Actual</p>
                      <p className="text-white font-medium">${supplier.currentBalance?.toLocaleString() || '0'}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm">Calificación</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`w-5 h-5 ${i < Math.floor(supplier.rating) ? 'text-yellow-400 fill-current' : 'text-gray-500'}`}
                          />
                        ))}
                      </div>
                      <span className={`font-medium ${getRatingColor(supplier.rating)}`}>
                        {supplier.rating}/5
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance & Additional Info */}
            <div className="space-y-6">
              {/* Performance Metrics */}
              {supplier.performanceMetrics && (
                <Card className="bg-gradient-to-br from-pink-900/20 to-pink-800/20 backdrop-blur-sm border border-pink-500/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-pink-300 flex items-center space-x-2">
                      <ChartBarIcon className="w-5 h-5" />
                      <span>Métricas de Rendimiento</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <PerformanceMetric
                        label="Entrega a Tiempo"
                        value={supplier.performanceMetrics.onTimeDelivery}
                        color="text-green-400"
                      />
                      <PerformanceMetric
                        label="Calidad"
                        value={supplier.performanceMetrics.qualityRating}
                        color="text-blue-400"
                      />
                      <PerformanceMetric
                        label="Tiempo de Respuesta"
                        value={supplier.performanceMetrics.responseTime}
                        unit="hrs"
                        color="text-yellow-400"
                      />
                      <PerformanceMetric
                        label="Puntuación General"
                        value={supplier.performanceMetrics.overallScore}
                        color="text-purple-400"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Categories */}
              <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 backdrop-blur-sm border border-green-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-green-300 flex items-center space-x-2">
                    <DocumentTextIcon className="w-5 h-5" />
                    <span>Categorías de Productos</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {supplier.categories && supplier.categories.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {supplier.categories.map((category: string) => (
                        <Badge key={category} className="bg-green-500/20 text-green-300 border-green-500/30">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No hay categorías especificadas</p>
                  )}
                </CardContent>
              </Card>

              {/* Contract Information */}
              {(supplier.contractStart || supplier.contractEnd) && (
                <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 backdrop-blur-sm border border-yellow-500/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-yellow-300 flex items-center space-x-2">
                      <CalendarDaysIcon className="w-5 h-5" />
                      <span>Información del Contrato</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {supplier.contractStart && (
                      <div>
                        <p className="text-gray-400 text-sm">Fecha de Inicio</p>
                        <p className="text-white font-medium">
                          {new Date(supplier.contractStart).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {supplier.contractEnd && (
                      <div>
                        <p className="text-gray-400 text-sm">Fecha de Vencimiento</p>
                        <p className="text-white font-medium">
                          {new Date(supplier.contractEnd).toLocaleDateString()}
                        </p>
                        {new Date(supplier.contractEnd) < new Date() && (
                          <Badge className="bg-red-500/20 text-red-300 border-red-500/30 mt-1">
                            <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                            Contrato Vencido
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              {supplier.notes && (
                <Card className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-gray-300 flex items-center space-x-2">
                      <DocumentTextIcon className="w-5 h-5" />
                      <span>Notas Adicionales</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white whitespace-pre-line">{supplier.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* @veritas Verification */}
              {supplier._veritas && (
                <Card className="bg-gradient-to-br from-indigo-900/20 to-indigo-800/20 backdrop-blur-sm border border-indigo-500/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-indigo-300 flex items-center space-x-2">
                      <ShieldCheckIcon className="w-5 h-5" />
                      <span>Verificación @veritas</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Estado:</span>
                      <Badge className={supplier._veritas.verified ?
                        "bg-green-500/20 text-green-300 border-green-500/30" :
                        "bg-red-500/20 text-red-300 border-red-500/30"
                      }>
                        {supplier._veritas.verified ? 'Verificado' : 'No Verificado'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Confianza:</span>
                      <span className="text-indigo-300 font-mono">{supplier._veritas.confidence}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Nivel:</span>
                      <span className="text-indigo-300">{supplier._veritas.level}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Algoritmo:</span>
                      <span className="text-indigo-300 font-mono text-xs">{supplier._veritas.algorithm}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Verificado en:</span>
                      <span className="text-indigo-300 text-xs">
                        {new Date(supplier._veritas.verifiedAt).toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-6 border-t border-gray-600/30 mt-6">
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white"
            >
              Cerrar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupplierDetailV3;