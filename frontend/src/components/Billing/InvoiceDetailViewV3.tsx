// 🎯🎸📋 INVOICE DETAIL VIEW V3.0 - COMPREHENSIVE INVOICE MANAGEMENT
// Date: September 22, 2025
// Mission: Complete invoice detail view with payment history, AI insights, and advanced actions
// Status: V3.0 - Full invoice lifecycle management with predictive analytics
// Challenge: Transform invoice data into actionable business intelligence

import React, { useState, useEffect } from 'react';

// 🎯 TITAN PATTERN IMPORTS
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Spinner } from '../../design-system';
import { createModuleLogger } from '../../utils/logger';

// 🎯 ICONS
import {
  DocumentTextIcon,
  CreditCardIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  EnvelopeIcon,
  PrinterIcon,
  DocumentArrowDownIcon,
  BoltIcon,
  CpuChipIcon,
  LightBulbIcon,
  ArrowPathIcon,
  UserIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon as MailIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const l = createModuleLogger('InvoiceDetailViewV3');

interface InvoiceDetailViewV3Props {
  invoice: any;
  onClose?: () => void;
  className?: string;
}

export const InvoiceDetailViewV3: React.FC<InvoiceDetailViewV3Props> = ({
  invoice,
  onClose,
  className = ''
}) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // 🎯 STATUS CONFIGURATION
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'paid':
        return { color: 'green', label: 'Pagada', icon: CheckCircleIcon };
      case 'partially_paid':
        return { color: 'yellow', label: 'Pago Parcial', icon: ClockIcon };
      case 'overdue':
        return { color: 'red', label: 'Vencida', icon: ExclamationTriangleIcon };
      case 'draft':
        return { color: 'gray', label: 'Borrador', icon: DocumentTextIcon };
      default:
        return { color: 'blue', label: 'Pendiente', icon: ClockIcon };
    }
  };

  // 🎯 PAYMENT METHOD LABELS
  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash':
        return 'Efectivo';
      case 'credit_card':
        return 'Tarjeta de Crédito';
      case 'debit_card':
        return 'Tarjeta de Débito';
      case 'bank_transfer':
        return 'Transferencia Bancaria';
      case 'blockchain':
        return 'Blockchain/Crypto';
      default:
        return method;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
        <span className="ml-3 text-gray-600">Cargando factura...</span>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Factura no encontrada</h3>
        <p className="text-gray-600">No se pudo cargar la información de la factura.</p>
      </div>
    );
  }

  const statusConfig = getStatusConfig(invoice.status);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="secondary" onClick={onClose} className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20">
            ← Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-cyan-300">
              Factura {invoice.invoiceNumber}
            </h1>
            <p className="text-cyan-100">
              Paciente: {invoice.patientName}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Badge
            variant={statusConfig.color === 'green' ? 'default' :
                    statusConfig.color === 'red' ? 'destructive' : 'secondary'}
            className="flex items-center space-x-1 bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
          >
            <statusConfig.icon className="w-4 h-4" />
            <span>{statusConfig.label}</span>
          </Badge>

          <Button variant="secondary" className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20">
            <PrinterIcon className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
          <Button variant="secondary" className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20">
            <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button variant="secondary" className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20">
            <EnvelopeIcon className="w-4 h-4 mr-2" />
            Email
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-cyan-500/30">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Resumen', icon: EyeIcon },
            { id: 'items', label: 'Items', icon: DocumentTextIcon },
            { id: 'payments', label: 'Pagos', icon: CreditCardIcon },
            { id: 'insights', label: 'AI Insights', icon: CpuChipIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-cyan-500 text-cyan-400'
                    : 'border-transparent text-cyan-600 hover:text-cyan-400 hover:border-cyan-500/30'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Invoice Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Detalles de la Factura</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Número de Factura
                      </label>
                      <p className="text-lg font-semibold">{invoice.invoice_number}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Estado
                      </label>
                      <Badge variant="secondary">{statusConfig.label}</Badge>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Fecha de Emisión
                      </label>
                      <p>{new Date(invoice.issue_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Fecha de Vencimiento
                      </label>
                      <p className={new Date(invoice.due_date) < new Date() && invoice.status !== 'paid' ? 'text-red-600 font-semibold' : ''}>
                        {new Date(invoice.due_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {invoice.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notas
                      </label>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-md">
                        {invoice.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Patient Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <UserIcon className="w-5 h-5" />
                    <span>Información del Paciente</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <UserIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-semibold">{invoice.patient_name}</p>
                        <p className="text-sm text-gray-600">Paciente</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MailIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p>{invoice.patient_email}</p>
                        <p className="text-sm text-gray-600">Email</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <PhoneIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p>{invoice.patient_phone}</p>
                        <p className="text-sm text-gray-600">Teléfono</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPinIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p>{invoice.patient_address}</p>
                        <p className="text-sm text-gray-600">Dirección</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Financial Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen Financiero</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>${invoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">IVA ({invoice.tax_rate}%):</span>
                    <span>${invoice.tax_amount.toFixed(2)}</span>
                  </div>
                  {invoice.discount_amount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuento:</span>
                      <span>-${invoice.discount_amount.toFixed(2)}</span>
                    </div>
                  )}
                  <hr />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>${invoice.total_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-blue-600">
                    <span>Pagado:</span>
                    <span>${(invoice.total_amount - invoice.outstanding_amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Pendiente:</span>
                    <span className={invoice.outstanding_amount > 0 ? 'text-red-600' : 'text-green-600'}>
                      ${invoice.outstanding_amount.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* 💰 ECONOMIC SINGULARITY: Análisis de Rentabilidad (Directiva #005) */}
              {invoice.treatment_id && invoice.material_cost !== null && invoice.material_cost !== undefined && (
                <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-purple-900">
                      <BoltIcon className="w-5 h-5" />
                      <span>💰 Análisis de Rentabilidad</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Métricas Principales */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Ingreso Total:</span>
                        <span className="text-lg font-bold text-green-600">
                          €{invoice.total_amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Coste Materiales:</span>
                        <span className="text-lg font-semibold text-orange-600">
                          €{invoice.material_cost.toFixed(2)}
                        </span>
                      </div>
                      <hr className="border-purple-200" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Beneficio Neto:</span>
                        <span className="text-xl font-bold text-purple-700">
                          €{(invoice.total_amount - invoice.material_cost).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Badge de Margen de Beneficio */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Margen de Beneficio:</span>
                        <Badge 
                          variant="secondary"
                          className={`text-lg font-bold px-4 py-2 ${
                            invoice.profit_margin > 0.5 
                              ? 'bg-green-100 text-green-800 border-green-300' 
                              : invoice.profit_margin > 0.3 
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-300' 
                              : 'bg-red-100 text-red-800 border-red-300'
                          }`}
                        >
                          {invoice.profit_margin 
                            ? `${(invoice.profit_margin * 100).toFixed(1)}%` 
                            : 'N/A'}
                        </Badge>
                      </div>

                      {/* Barra de Progreso Visual */}
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            invoice.profit_margin > 0.5 
                              ? 'bg-gradient-to-r from-green-400 to-green-600' 
                              : invoice.profit_margin > 0.3 
                              ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' 
                              : 'bg-gradient-to-r from-red-400 to-red-600'
                          }`}
                          style={{ width: `${(invoice.profit_margin || 0) * 100}%` }}
                        />
                      </div>

                      {/* Categoría de Rentabilidad */}
                      <div className="mt-3 text-center">
                        <span className="text-xs font-semibold text-gray-600">
                          Categoría: {' '}
                          <span className={`${
                            invoice.profit_margin > 0.5 
                              ? 'text-green-700' 
                              : invoice.profit_margin > 0.3 
                              ? 'text-yellow-700' 
                              : 'text-red-700'
                          }`}>
                            {invoice.profit_margin > 0.5 
                              ? '🟢 EXCELENTE' 
                              : invoice.profit_margin > 0.3 
                              ? '🟡 BUENO' 
                              : invoice.profit_margin > 0.1
                              ? '🟠 ACEPTABLE'
                              : '🔴 BAJO'}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Nota Informativa */}
                    <div className="mt-4 p-3 bg-purple-100 border border-purple-200 rounded-lg">
                      <p className="text-xs text-purple-800">
                        <CpuChipIcon className="w-4 h-4 inline mr-1" />
                        <strong>Economic Singularity:</strong> Este análisis calcula el margen de beneficio real 
                        considerando el coste de materiales utilizados en el tratamiento vinculado.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full" variant="default">
                    <CreditCardIcon className="w-4 h-4 mr-2" />
                    Registrar Pago
                  </Button>
                  <Button className="w-full" variant="secondary">
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Editar Factura
                  </Button>
                  <Button className="w-full" variant="secondary">
                    <EnvelopeIcon className="w-4 h-4 mr-2" />
                    Enviar Recordatorio
                  </Button>
                  <Button className="w-full" variant="secondary">
                    <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                    Generar Recibo
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Items Tab */}
        {activeTab === 'items' && (
          <Card>
            <CardHeader>
              <CardTitle>Items de la Factura</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoice.items.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.description}</h3>
                      <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${item.unit_price.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">Total: ${item.total.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <Card>
            <CardHeader>
              <CardTitle>Historial de Pagos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoice.payments.map((payment: any) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-100">
                        <CheckCircleIcon className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          ${payment.amount.toFixed(2)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {getPaymentMethodLabel(payment.payment_method)} • {payment.reference_number}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(payment.payment_date).toLocaleDateString()} • {payment.processed_by}
                        </p>
                      </div>
                    </div>
                    <Badge variant="default">Completado</Badge>
                  </div>
                ))}

                {invoice.outstanding_amount > 0 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                      <div>
                        <h3 className="font-semibold text-yellow-900">Pago Pendiente</h3>
                        <p className="text-sm text-yellow-700">
                          Monto pendiente: ${invoice.outstanding_amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CpuChipIcon className="w-5 h-5" />
                  <span>🤖 AI Insights y Predicciones</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-100">
                        <CpuChipIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Probabilidad de Pago</h3>
                    </div>
                    <p className="text-2xl font-bold text-blue-600 mb-1">
                      {(invoice.ai_insights.payment_probability * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">Basado en historial del paciente</p>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-100">
                        <CalendarIcon className="w-4 h-4 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Fecha Predicha de Pago</h3>
                    </div>
                    <p className="text-2xl font-bold text-green-600 mb-1">
                      {new Date(invoice.ai_insights.predicted_payment_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">Próximo pago esperado</p>
                  </div>
                </div>

                {/* AI Recommendations */}
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <div className="flex items-start space-x-3">
                    <LightBulbIcon className="w-6 h-6 text-purple-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-purple-900 mb-2">💡 Recomendaciones de IA</h3>
                      <ul className="space-y-1 text-sm text-purple-800">
                        {invoice.ai_insights.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="flex items-center space-x-2">
                            <CheckCircleIcon className="w-4 h-4" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetailViewV3;
