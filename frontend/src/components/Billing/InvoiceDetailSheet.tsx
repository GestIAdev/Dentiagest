// 🎯💰🔥 INVOICE DETAIL SHEET - LA SINGULARIDAD ECONÓMICA
// Date: 2025
// Mission: Visor lateral de factura con análisis de rentabilidad
// Pattern: Read-only Sheet (800px) + Economic Analysis Core
// Style: Cyberpunk Terminal - Wall Street Profit Vision

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '../ui/sheet';
import { Badge, InvoiceStatusBadge } from '../ui/badge';
import toast from 'react-hot-toast';
import {
  DocumentArrowDownIcon,
  EnvelopeIcon,
  PencilSquareIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  BanknotesIcon,
  BeakerIcon,
  SparklesIcon,
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

// ============================================================================
// TYPES
// ============================================================================

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxRate: number;
}

interface Invoice {
  id: string;
  patientId: string;
  invoiceNumber: string;
  subtotal: number;
  taxRate: number | null;
  taxAmount: number | null;
  discountAmount: number | null;
  totalAmount: number;
  currency: string;
  issueDate: string | number;
  dueDate: string | number | null;
  paidDate: string | number | null;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED' | string;
  paymentTerms: string | null;
  notes: string | null;
  createdBy: string | null;
  createdAt: string | number;
  updatedAt: string | number;
  // Economic Singularity fields
  treatmentId: string | null;
  materialCost: number | null;
  profitMargin: number | null;
  items?: InvoiceItem[];
}

interface InvoiceDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onEdit?: (invoice: Invoice) => void;
}

// ============================================================================
// UTILITIES
// ============================================================================

const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return '€0.00';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

const formatDate = (val: string | number | null | undefined): string => {
  if (!val) return '-';
  try {
    const numVal = Number(val);
    const date = !isNaN(numVal) && numVal > 0 ? new Date(numVal) : new Date(val as string);
    if (isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch {
    return '-';
  }
};

// ============================================================================
// PROFIT ANALYSIS BADGE - THE ECONOMIC SINGULARITY CORE
// ============================================================================

interface ProfitAnalysisBadgeProps {
  profitMargin: number | null;
  className?: string;
}

const ProfitAnalysisBadge: React.FC<ProfitAnalysisBadgeProps> = ({
  profitMargin,
  className,
}) => {
  if (profitMargin === null) {
    return (
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 ${className}`}>
        <BeakerIcon className="h-5 w-5 text-gray-500" />
        <span className="text-gray-400 text-sm">Sin datos de coste</span>
      </div>
    );
  }

  const percentage = profitMargin * 100;

  // 🎯 PROFIT BADGE LOGIC:
  // >50% = EXCELENTE (Verde brillante)
  // 30-50% = BUENO (Amarillo)
  // <30% = ALERTA (Rojo)
  let bgClass: string;
  let textClass: string;
  let glowClass: string;
  let label: string;
  let Icon: React.ElementType;

  if (percentage >= 50) {
    bgClass = 'bg-gradient-to-r from-emerald-500/30 to-green-500/20';
    textClass = 'text-emerald-300';
    glowClass = 'shadow-[0_0_20px_rgba(16,185,129,0.4)]';
    label = '🚀 EXCELENTE';
    Icon = SparklesIcon;
  } else if (percentage >= 30) {
    bgClass = 'bg-gradient-to-r from-amber-500/30 to-yellow-500/20';
    textClass = 'text-amber-300';
    glowClass = 'shadow-[0_0_20px_rgba(245,158,11,0.4)]';
    label = '✓ BUENO';
    Icon = ChartBarIcon;
  } else {
    bgClass = 'bg-gradient-to-r from-red-500/30 to-rose-500/20';
    textClass = 'text-red-300';
    glowClass = 'shadow-[0_0_20px_rgba(239,68,68,0.4)]';
    label = '⚠ ALERTA';
    Icon = BeakerIcon;
  }

  return (
    <div
      className={`
        inline-flex items-center gap-3 px-5 py-3 rounded-xl border border-white/10
        ${bgClass} ${glowClass} ${className}
      `}
    >
      <Icon className={`h-6 w-6 ${textClass}`} />
      <div className="flex flex-col">
        <span className={`text-2xl font-bold ${textClass}`}>
          {percentage.toFixed(1)}%
        </span>
        <span className="text-xs text-gray-400 uppercase tracking-wider">
          {label}
        </span>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const InvoiceDetailSheet: React.FC<InvoiceDetailSheetProps> = ({
  isOpen,
  onClose,
  invoice,
  onEdit,
}) => {
  if (!invoice) return null;

  // Calculate economic singularity
  const revenue = invoice.totalAmount || 0;
  const materialCost = invoice.materialCost || 0;
  const netProfit = revenue - materialCost;
  const calculatedMargin = revenue > 0 ? netProfit / revenue : null;
  // Usar margen calculado si no hay margen guardado
  const displayMargin = invoice.profitMargin ?? calculatedMargin;

  // Action handlers
  const handleDownloadPDF = () => {
    // TODO: Implementar generación de PDF
    toast.success('📄 Generando PDF...');
    // Mock: En producción esto llamaría a un endpoint de generación de PDF
    setTimeout(() => {
      toast.success('✅ PDF descargado: ' + invoice.invoiceNumber + '.pdf');
    }, 1500);
  };

  const handleSendEmail = () => {
    // TODO: Implementar envío de email
    toast.success('📧 Preparando envío...');
    setTimeout(() => {
      toast.success('✅ Factura enviada por email');
    }, 1500);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(invoice);
    }
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[800px] bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border-l border-cyan-500/20 overflow-y-auto"
      >
        {/* ================================================================ */}
        {/* HEADER */}
        {/* ================================================================ */}
        <SheetHeader className="border-b border-gray-700/50 pb-4 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                {invoice.invoiceNumber}
              </SheetTitle>
              <SheetDescription className="text-gray-400 mt-1">
                Detalle de Factura • Singularidad Económica
              </SheetDescription>
            </div>
            <InvoiceStatusBadge status={invoice.status} className="text-sm px-4 py-1.5" />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-cyan-300 text-sm transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              Descargar PDF
            </button>
            <button
              onClick={handleSendEmail}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-300 text-sm transition-all hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]"
            >
              <EnvelopeIcon className="h-4 w-4" />
              Enviar Email
            </button>
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg text-amber-300 text-sm transition-all hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]"
            >
              <PencilSquareIcon className="h-4 w-4" />
              Editar
            </button>
          </div>
        </SheetHeader>

        {/* ================================================================ */}
        {/* DATES ROW */}
        {/* ================================================================ */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
            <CalendarIcon className="h-5 w-5 text-cyan-400" />
            <div>
              <p className="text-xs text-gray-500 uppercase">Emisión</p>
              <p className="text-gray-200 font-medium">{formatDate(invoice.issueDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
            <ClockIcon className="h-5 w-5 text-amber-400" />
            <div>
              <p className="text-xs text-gray-500 uppercase">Vencimiento</p>
              <p className="text-gray-200 font-medium">{formatDate(invoice.dueDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
            <BanknotesIcon className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-xs text-gray-500 uppercase">Fecha Pago</p>
              <p className="text-gray-200 font-medium">
                {invoice.paidDate ? formatDate(invoice.paidDate) : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* 💰 NÚCLEO ECONÓMICO - LA SINGULARIDAD */}
        {/* ================================================================ */}
        <div className="mb-6 p-6 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
          <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 mb-6 flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5 text-cyan-400" />
            Análisis de Rentabilidad
          </h3>

          {/* Main Financial Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Ingreso Total */}
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-xs text-emerald-400/70 uppercase tracking-wider mb-1">
                Ingreso Total
              </p>
              <p className="text-2xl font-bold text-emerald-400 font-mono">
                {formatCurrency(revenue)}
              </p>
            </div>

            {/* Coste Materiales */}
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-xs text-red-400/70 uppercase tracking-wider mb-1">
                Coste Materiales
              </p>
              <p className="text-2xl font-bold text-red-400 font-mono">
                {materialCost > 0 ? formatCurrency(materialCost) : (
                  <span className="text-gray-500">N/A</span>
                )}
              </p>
            </div>

            {/* Margen Neto */}
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <p className="text-xs text-purple-400/70 uppercase tracking-wider mb-1">
                Margen Neto
              </p>
              <p className="text-2xl font-bold text-purple-400 font-mono">
                {materialCost > 0 ? formatCurrency(netProfit) : formatCurrency(revenue)}
              </p>
            </div>
          </div>

          {/* PROFIT BADGE - THE SINGULARITY */}
          <div className="flex items-center justify-center">
            <ProfitAnalysisBadge profitMargin={displayMargin} />
          </div>
        </div>

        {/* ================================================================ */}
        {/* DESGLOSE FINANCIERO */}
        {/* ================================================================ */}
        <div className="mb-6 p-5 rounded-xl bg-gray-800/30 border border-gray-700/30">
          <h3 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
            <CurrencyDollarIcon className="h-4 w-4 text-cyan-400" />
            Desglose Financiero
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-700/30">
              <span className="text-gray-400">Subtotal</span>
              <span className="text-gray-200 font-mono">{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.discountAmount && invoice.discountAmount > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-gray-700/30">
                <span className="text-gray-400">Descuento</span>
                <span className="text-red-400 font-mono">-{formatCurrency(invoice.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-2 border-b border-gray-700/30">
              <span className="text-gray-400">
                IVA ({invoice.taxRate ?? 21}%)
              </span>
              <span className="text-gray-200 font-mono">{formatCurrency(invoice.taxAmount)}</span>
            </div>
            <div className="flex justify-between items-center py-3 mt-2">
              <span className="text-lg font-bold text-white">TOTAL</span>
              <span className="text-2xl font-bold text-emerald-400 font-mono">
                {formatCurrency(invoice.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* ITEMS (if available) */}
        {/* ================================================================ */}
        {invoice.items && invoice.items.length > 0 && (
          <div className="mb-6 p-5 rounded-xl bg-gray-800/30 border border-gray-700/30">
            <h3 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
              <DocumentTextIcon className="h-4 w-4 text-cyan-400" />
              Conceptos Facturados
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700/50">
                    <th className="text-left py-2 text-gray-500 font-normal">Descripción</th>
                    <th className="text-right py-2 text-gray-500 font-normal">Cant.</th>
                    <th className="text-right py-2 text-gray-500 font-normal">Precio</th>
                    <th className="text-right py-2 text-gray-500 font-normal">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={item.id || index} className="border-b border-gray-700/20">
                      <td className="py-3 text-gray-200">{item.description}</td>
                      <td className="py-3 text-right text-gray-400">{item.quantity}</td>
                      <td className="py-3 text-right text-gray-400 font-mono">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="py-3 text-right text-cyan-300 font-mono font-medium">
                        {formatCurrency(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* NOTES */}
        {/* ================================================================ */}
        {invoice.notes && (
          <div className="mb-6 p-5 rounded-xl bg-gray-800/30 border border-gray-700/30">
            <h3 className="text-sm font-bold text-gray-300 mb-3">Notas</h3>
            <p className="text-gray-400 text-sm whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}

        {/* ================================================================ */}
        {/* FOOTER META */}
        {/* ================================================================ */}
        <SheetFooter className="border-t border-gray-700/50 pt-4 mt-6">
          <div className="w-full text-center text-xs text-gray-600">
            <p>ID: {invoice.id}</p>
            <p>Paciente: {invoice.patientId}</p>
            {invoice.treatmentId && <p>Tratamiento: {invoice.treatmentId}</p>}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default InvoiceDetailSheet;
