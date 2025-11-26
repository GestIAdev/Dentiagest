// 🎯💰🔥 INVOICE FORM SHEET - OPERACIÓN LÁZARO FASE 4
// Date: 2025
// Mission: Lateral sheet for invoice creation/edition
// Pattern: Sheet (slide from right) + Real-time calculations
// Style: Cyberpunk Terminal Form

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '../ui/sheet';
import { GET_PATIENTS } from '../../graphql/queries/patients';
import { GET_TREATMENTS_V3 } from '../../graphql/queries/treatments';
import {
  CREATE_INVOICE,
  UPDATE_INVOICE,
} from '../../graphql/queries/billing';
import toast from 'react-hot-toast';
import {
  CurrencyDollarIcon,
  UserIcon,
  DocumentTextIcon,
  CalendarIcon,
  CalculatorIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

// ============================================================================
// TYPES - Compatible with both legacy and Selene V5 schema
// ============================================================================

interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxRate: number;
}

// Compatible interface - supports both old and new schema
interface Invoice {
  id: string;
  invoiceNumber?: string;
  patientId: string;
  patientName?: string;
  // Support both formats:
  amount?: number;      // Legacy
  subtotal?: number;    // Selene V5
  taxAmount?: number | null;
  totalAmount: number;
  status: string;
  issueDate: string | number;      // Can be ISO string or timestamp
  dueDate?: string | number | null;
  paidDate?: string | number | null;
  notes?: string | null;
  items?: InvoiceItem[];
  // Selene V5 fields
  currency?: string;
  taxRate?: number | null;
  discountAmount?: number | null;
  paymentTerms?: string | null;
  treatmentId?: string | null;
  materialCost?: number | null;
  profitMargin?: number | null;
}

interface Patient {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
}

interface Treatment {
  id: string;
  treatmentType: string;  // V3 schema: CLEANING, FILLING, etc.
  description?: string;
  cost: number;           // V3 schema: price field
  status?: string;
}

interface GetPatientsData {
  patients: Patient[];
}

interface GetTreatmentsData {
  treatmentsV3: Treatment[];
}

interface InvoiceFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  invoice?: Invoice;
  onSave?: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TAX_RATE = 0.21; // 21% IVA España

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Borrador' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'paid', label: 'Pagada' },
  { value: 'overdue', label: 'Vencida' },
  { value: 'cancelled', label: 'Cancelada' },
];

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'card', label: 'Tarjeta' },
  { value: 'transfer', label: 'Transferencia' },
  { value: 'bizum', label: 'Bizum' },
];

// ============================================================================
// UTILITIES
// ============================================================================

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

const getPatientDisplayName = (patient: Patient): string => {
  if (patient.name) return patient.name;
  return `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Sin nombre';
};

// Parse date from timestamp or string to YYYY-MM-DD format for input fields
const parseToDateInputValue = (date: string | number | null | undefined): string => {
  if (!date) return '';
  try {
    let d: Date;
    if (typeof date === 'number') {
      // Handle timestamp (milliseconds or seconds)
      const timestamp = date > 9999999999 ? date : date * 1000;
      d = new Date(timestamp);
    } else {
      d = new Date(date.includes('T') ? date : date.replace(' ', 'T'));
    }
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const InvoiceFormSheet: React.FC<InvoiceFormSheetProps> = ({
  isOpen,
  onClose,
  invoice,
  onSave,
}) => {
  const isEditing = !!invoice;

  // Form state
  const [patientId, setPatientId] = useState<string>('');
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [treatmentId, setTreatmentId] = useState<string>('');
  const [customDescription, setCustomDescription] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [status, setStatus] = useState<string>('pending');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [issueDate, setIssueDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // GraphQL
  const { data: patientsData } = useQuery<GetPatientsData>(GET_PATIENTS, {
    variables: { limit: 100 },
  });

  const { data: treatmentsData } = useQuery<GetTreatmentsData>(GET_TREATMENTS_V3, {
    variables: { limit: 100 },
  });

  const [createInvoice, { loading: creating }] = useMutation(CREATE_INVOICE, {
    onCompleted: () => {
      toast.success('💰 Factura creada exitosamente');
      onSave?.();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const [updateInvoice, { loading: updating }] = useMutation(UPDATE_INVOICE, {
    onCompleted: () => {
      toast.success('✅ Factura actualizada');
      onSave?.();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const loading = creating || updating;

  // Initialize form when editing
  useEffect(() => {
    if (invoice && isOpen) {
      setPatientId(invoice.patientId || '');
      setStatus(invoice.status || 'pending');
      setNotes(invoice.notes || '');
      setIssueDate(parseToDateInputValue(invoice.issueDate) || new Date().toISOString().split('T')[0]);
      setDueDate(parseToDateInputValue(invoice.dueDate) || '');
      // If invoice has items, populate from first item
      if (invoice.items && invoice.items.length > 0) {
        setCustomDescription(invoice.items[0].description || '');
        setQuantity(invoice.items[0].quantity || 1);
        setUnitPrice(invoice.items[0].unitPrice || 0);
      } else {
        // Support both legacy (amount) and Selene V5 (subtotal) schemas
        setUnitPrice(invoice.amount ?? invoice.subtotal ?? 0);
      }
    } else if (isOpen && !invoice) {
      // Reset form for new invoice
      setPatientId('');
      setTreatmentId('');
      setCustomDescription('');
      setQuantity(1);
      setUnitPrice(0);
      setDiscountPercent(0);
      setStatus('pending');
      setPaymentMethod('');
      setNotes('');
      setIssueDate(new Date().toISOString().split('T')[0]);
      setDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    }
  }, [invoice, isOpen]);

  // Filtered patients for search
  const filteredPatients = useMemo(() => {
    const patients = patientsData?.patients || [];
    if (!patientSearch) return patients.slice(0, 10);
    const search = patientSearch.toLowerCase();
    return patients
      .filter((p) => getPatientDisplayName(p).toLowerCase().includes(search))
      .slice(0, 10);
  }, [patientsData, patientSearch]);

  // Selected patient name
  const selectedPatientName = useMemo(() => {
    const patient = patientsData?.patients.find((p) => p.id === patientId);
    return patient ? getPatientDisplayName(patient) : '';
  }, [patientsData, patientId]);

  // Auto-fill price from treatment
  useEffect(() => {
    if (treatmentId && treatmentsData) {
      const treatment = treatmentsData.treatmentsV3?.find((t) => t.id === treatmentId);
      if (treatment) {
        setUnitPrice(treatment.cost);
        setCustomDescription(treatment.description || treatment.treatmentType);
      }
    }
  }, [treatmentId, treatmentsData]);

  // Calculations
  const subtotal = quantity * unitPrice;
  const discountAmount = subtotal * (discountPercent / 100);
  const subtotalAfterDiscount = subtotal - discountAmount;
  const taxAmount = subtotalAfterDiscount * TAX_RATE;
  const totalAmount = subtotalAfterDiscount + taxAmount;

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientId) {
      toast.error('Selecciona un paciente');
      return;
    }

    if (unitPrice <= 0) {
      toast.error('El precio debe ser mayor a 0');
      return;
    }

    // Generar número de factura único si es nueva
    const invoiceNumber = invoice?.invoiceNumber || 
      `INV-${Date.now().toString(36).toUpperCase()}`;

    console.log('🚀 Invoice Payload:', { isEditing, patientId, status });

    try {
      if (isEditing && invoice) {
        // Check if invoice is already locked (PAID/SENT)
        const isLocked = ['PAID', 'SENT'].includes(invoice.status?.toUpperCase());
        
        let updateInput;
        
        if (isLocked) {
          // 💰 IMMUTABLE: Solo permitir cambios de status, notes, paymentTerms
          updateInput = {
            status: status.toUpperCase(),
            notes: notes || null,
            paymentTerms: paymentMethod || null,
          };
          console.log('🔒 Locked Invoice - Limited Update:', updateInput);
        } else {
          // UpdateBillingDataV3Input: Campos editables para facturas NO bloqueadas
          updateInput = {
            subtotal: parseFloat(subtotalAfterDiscount.toFixed(2)),
            taxRate: parseFloat((TAX_RATE * 100).toFixed(2)),
            taxAmount: parseFloat(taxAmount.toFixed(2)),
            discountAmount: parseFloat(discountAmount.toFixed(2)),
            totalAmount: parseFloat(totalAmount.toFixed(2)),
            currency: 'EUR',
            issueDate: new Date(issueDate).toISOString(),
            dueDate: dueDate ? new Date(dueDate).toISOString() : null,
            status: status.toUpperCase(),
            paymentTerms: paymentMethod || null,
            notes: notes || null,
          };
          console.log('📝 Unlocked Invoice - Full Update:', updateInput);
        }
        
        await updateInvoice({
          variables: { id: invoice.id, input: updateInput },
        });
      } else {
        // BillingDataV3Input: Todos los campos para creación
        const createInput = {
          patientId,
          invoiceNumber,
          subtotal: parseFloat(subtotalAfterDiscount.toFixed(2)),
          taxRate: parseFloat((TAX_RATE * 100).toFixed(2)),
          taxAmount: parseFloat(taxAmount.toFixed(2)),
          discountAmount: parseFloat(discountAmount.toFixed(2)),
          totalAmount: parseFloat(totalAmount.toFixed(2)),
          currency: 'EUR',
          issueDate: new Date(issueDate).toISOString(),
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
          status: status.toUpperCase(), // ENUM: PENDING, PAID, OVERDUE, CANCELLED
          paymentTerms: paymentMethod || null,
          notes: notes || null,
          treatmentId: treatmentId || null,
        };
        console.log('🆕 Create Input:', createInput);
        
        await createInvoice({
          variables: { input: createInput },
        });
      }
    } catch (err: any) {
      console.error('🔥 Invoice mutation error:', err);
      // Extract GraphQL error message
      const errorMessage = err?.graphQLErrors?.[0]?.message || 
                          err?.message || 
                          'Error desconocido al guardar factura';
      toast.error(`❌ ${errorMessage}`);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[800px] bg-gray-900 border-l border-cyan-500/30 overflow-y-auto"
      >
        <SheetHeader className="space-y-1 pb-4 border-b border-gray-700/50">
          <SheetTitle className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 flex items-center gap-2">
            <CurrencyDollarIcon className="h-6 w-6 text-cyan-400" />
            {isEditing ? 'Editar Factura' : 'Nueva Factura'}
          </SheetTitle>
          <SheetDescription className="text-gray-500">
            {isEditing
              ? `Editando factura ${invoice?.invoiceNumber}`
              : 'Crea una nueva factura para un paciente'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="py-6">
          {/* GRID DE 2 COLUMNAS PARA EVITAR SCROLL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* ============================================================ */}
            {/* COLUMNA IZQUIERDA */}
            {/* ============================================================ */}
            <div className="space-y-4">
              {/* PATIENT SELECTOR */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <UserIcon className="h-4 w-4 text-cyan-400" />
                  Paciente *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={patientId ? selectedPatientName : patientSearch}
                    onChange={(e) => {
                      setPatientSearch(e.target.value);
                      setPatientId('');
                      setShowPatientDropdown(true);
                    }}
                    onFocus={() => setShowPatientDropdown(true)}
                    placeholder="Buscar paciente..."
                    className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                  />
                  {showPatientDropdown && filteredPatients.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                      {filteredPatients.map((patient) => (
                        <button
                          key={patient.id}
                          type="button"
                          onClick={() => {
                            setPatientId(patient.id);
                            setPatientSearch('');
                            setShowPatientDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 text-gray-200 hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors"
                        >
                          {getPatientDisplayName(patient)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* TREATMENT SELECTOR */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <SparklesIcon className="h-4 w-4 text-purple-400" />
                  Tratamiento
                </label>
                <select
                  value={treatmentId}
                  onChange={(e) => setTreatmentId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="">Seleccionar tratamiento (opcional)</option>
                  {treatmentsData?.treatmentsV3?.map((treatment) => (
                    <option key={treatment.id} value={treatment.id}>
                      {treatment.treatmentType} - {formatCurrency(treatment.cost)}
                    </option>
                  ))}
                </select>
              </div>

              {/* DESCRIPTION */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <DocumentTextIcon className="h-4 w-4 text-gray-400" />
                  Descripción
                </label>
                <input
                  type="text"
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Descripción del servicio..."
                  className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              {/* QUANTITY & PRICE */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Precio (€)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              {/* DISCOUNT */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Descuento (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            {/* ============================================================ */}
            {/* COLUMNA DERECHA */}
            {/* ============================================================ */}
            <div className="space-y-4">
              {/* DATES */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    Emisión
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Vencimiento</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              {/* STATUS & PAYMENT METHOD */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Estado</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-cyan-500/50"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Método Pago</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="">Sin especificar</option>
                    {PAYMENT_METHODS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* NOTES */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Notas</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Notas adicionales..."
                  className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none"
                />
              </div>

              {/* TOTALS SUMMARY - Wall Street Style */}
              <div className="bg-gray-800/50 border border-cyan-500/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-700">
                  <CalculatorIcon className="h-5 w-5 text-cyan-400" />
                  <span className="text-sm font-semibold text-gray-300">Resumen</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal:</span>
                  <span className="font-mono text-gray-300">{formatCurrency(subtotal)}</span>
                </div>
                
                {discountPercent > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Descuento ({discountPercent}%):</span>
                    <span className="font-mono text-red-400">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">IVA (21%):</span>
                  <span className="font-mono text-gray-400">{formatCurrency(taxAmount)}</span>
                </div>
                
                <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent my-2" />
                
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-200">TOTAL:</span>
                  <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 font-mono">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* ================================================================ */}
        {/* FOOTER */}
        {/* ================================================================ */}
        <SheetFooter className="pt-4 border-t border-gray-700/50">
          <div className="flex w-full gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gray-800 text-gray-300 rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading || !patientId || unitPrice <= 0}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </span>
              ) : isEditing ? (
                'Actualizar'
              ) : (
                'Crear Factura'
              )}
            </button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default InvoiceFormSheet;
