// 🎯🎸💀 SUPPLIER DETAIL VIEW V3.0 - TITAN PATTERN IMPLEMENTATION
// Date: September 26, 2025
// Mission: Complete supplier detail view with @veritas quantum verification
// Status: V3.0 - Full marketplace system with quantum truth verification
// Challenge: Supplier integrity and relationship verification with AI insights
// 🎨 THEME: Cyberpunk Medical - Cyan/Purple/Pink gradients with quantum effects
// 🔒 SECURITY: @veritas quantum truth verification on supplier data

import React from 'react';

// 🎯 TITAN PATTERN IMPORTS - Core Dependencies
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '../atoms';

// 🎯 ICONS - Heroicons for marketplace theme
import {
  XMarkIcon,
  BuildingStorefrontIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  StarIcon,
  TruckIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  CreditCardIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

// 🎯 SUPPLIER DETAIL VIEW V3.0 INTERFACE
interface SupplierDetailViewV3Props {
  supplier: any;
  onClose: () => void;
}

export const SupplierDetailViewV3: React.FC<SupplierDetailViewV3Props> = ({
  supplier,
  onClose
}) => {
  if (!supplier) return null;

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

  // 🎯 RENDER STAR RATING
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-500'}`}
      />
    ));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 border border-cyan-500/20">
        <CardHeader className="border-b border-gray-600/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <BuildingStorefrontIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  🎯 Detalle del Proveedor V3.0
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
            {/* 🎯 SUPPLIER HEADER */}
            <Card className="bg-gradient-to-r from-purple-900/30 to-cyan-900/30 border border-purple-500/20">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-lg ${supplier.isActive ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                      <BuildingStorefrontIcon className={`w-8 h-8 ${supplier.isActive ? 'text-green-400' : 'text-red-400'}`} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                        <span>{supplier.name}</span>
                        {supplier._veritas && (
                          <ShieldCheckIcon className="w-6 h-6 text-green-400" />
                        )}
                      </h2>
                      <p className="text-gray-300 text-lg">{supplier.contactName}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge className={`${supplier.isActive ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
                          {supplier.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          {renderStars(supplier.rating)}
                          <span className="text-yellow-400 text-sm ml-1">({supplier.rating})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-cyan-300">
                      {formatCurrency(supplier.totalSpent)}
                    </div>
                    <p className="text-gray-400 text-sm">Total Gastado</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="flex items-center space-x-3">
                    <ClipboardDocumentListIcon className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Total Órdenes</p>
                      <p className="text-white font-semibold">{supplier.totalOrders}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <BanknotesIcon className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Límite Crédito</p>
                      <p className="text-white font-semibold">{formatCurrency(supplier.creditLimit)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <CreditCardIcon className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Términos Pago</p>
                      <p className="text-white font-semibold">{supplier.paymentTerms}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="w-5 h-5 text-pink-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Última Orden</p>
                      <p className="text-white font-semibold">
                        {supplier.lastOrderDate ? formatDate(supplier.lastOrderDate) : 'Nunca'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 🎯 CONTACT INFORMATION */}
            <Card className="bg-gray-800/50 border border-gray-600/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-purple-300 flex items-center space-x-2">
                  <UserIcon className="w-5 h-5" />
                  <span>Información de Contacto</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <EnvelopeIcon className="w-5 h-5 text-cyan-400" />
                      <div>
                        <p className="text-gray-400 text-sm">Email</p>
                        <p className="text-white font-semibold">{supplier.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <PhoneIcon className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="text-gray-400 text-sm">Teléfono</p>
                        <p className="text-white font-semibold">{supplier.phone}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <MapPinIcon className="w-5 h-5 text-pink-400" />
                      <div>
                        <p className="text-gray-400 text-sm">Dirección</p>
                        <p className="text-white font-semibold whitespace-pre-wrap">{supplier.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <BanknotesIcon className="w-5 h-5 text-yellow-400" />
                      <div>
                        <p className="text-gray-400 text-sm">ID Fiscal</p>
                        <p className="text-white font-mono">{supplier.taxId}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 🎯 CATEGORIES */}
            <Card className="bg-gray-800/50 border border-gray-600/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-cyan-300 flex items-center space-x-2">
                  <GlobeAltIcon className="w-5 h-5" />
                  <span>Categorías de Productos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {supplier.categories?.map((category: string, index: number) => (
                    <Badge
                      key={index}
                      className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1"
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 🎯 BUSINESS METRICS */}
            <Card className="bg-gray-800/50 border border-gray-600/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-green-300 flex items-center space-x-2">
                  <TruckIcon className="w-5 h-5" />
                  <span>Métricas de Negocio</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-cyan-400">{supplier.totalOrders}</div>
                    <div className="text-gray-400 text-sm">Órdenes Totales</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">{formatCurrency(supplier.totalSpent)}</div>
                    <div className="text-gray-400 text-sm">Valor Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400">
                      {supplier.totalOrders > 0 ? formatCurrency(supplier.totalSpent / supplier.totalOrders) : '$0.00'}
                    </div>
                    <div className="text-gray-400 text-sm">Promedio por Orden</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 🎯 @VERITAS VERIFICATION DETAILS */}
            {supplier._veritas && (
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
                      <p className="text-green-300 font-bold text-lg">{supplier._veritas.confidence}%</p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">Nivel</label>
                      <p className="text-green-300 font-semibold">{supplier._veritas.level}</p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">Verificado</label>
                      <p className="text-green-300 font-semibold">{formatDate(supplier._veritas.verifiedAt)}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="text-gray-400 text-sm">Certificado</label>
                    <p className="text-green-300 font-mono text-sm bg-green-500/10 p-2 rounded border border-green-500/20">
                      {supplier._veritas.certificate}
                    </p>
                  </div>
                  <div className="mt-4">
                    <label className="text-gray-400 text-sm">Algoritmo</label>
                    <p className="text-cyan-300 font-mono text-sm">{supplier._veritas.algorithm}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 🎯 TIMESTAMPS */}
            <Card className="bg-gray-800/50 border border-gray-600/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-gray-300">Información del Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-gray-400 text-sm">Creado</label>
                    <p className="text-white font-semibold">{formatDate(supplier.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Última Actualización</label>
                    <p className="text-white font-semibold">{formatDate(supplier.updatedAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

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

export default SupplierDetailViewV3;