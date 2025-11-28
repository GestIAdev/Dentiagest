/**
 * 🏭🎸💀 SUPPLIER FORM SHEET - HUB LOGÍSTICO V4
 * ===============================================
 * By PunkClaude & Radwulf - November 2025
 * 
 * ESTANDARIZADO: Mismo patrón visual que InvoiceFormSheet
 * - Ancho: 800px
 * - Fondo: bg-gray-900 sólido
 * - Layout: Grid 2 columnas
 */

import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '../ui/sheet';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  CREATE_SUPPLIER,
  UPDATE_SUPPLIER,
  DELETE_SUPPLIER,
} from '../../graphql/queries/inventory';
import toast from 'react-hot-toast';
import {
  BuildingStorefrontIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  StarIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CurrencyEuroIcon,
} from '@heroicons/react/24/outline';

// ============================================================================
// TYPES
// ============================================================================

interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  paymentTerms?: string;
  creditLimit?: number;
  currentBalance?: number;
  status: string;
  rating?: number;
  categories?: string[];
  contractStart?: string;
  contractEnd?: string;
  notes?: string;
}

interface SupplierFormSheetProps {
  supplier?: Supplier | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SUPPLIER_STATUS = [
  { value: 'ACTIVE', label: '🟢 Activo' },
  { value: 'INACTIVE', label: '⚫ Inactivo' },
  { value: 'BLOCKED', label: '🔴 Bloqueado' },
  { value: 'PREFERRED', label: '⭐ Preferido' },
];

const SUPPLIER_CATEGORIES = [
  { value: 'RESTORATIVE', label: '💎 Restauradores' },
  { value: 'ENDODONTIC', label: '💉 Endodoncia' },
  { value: 'ORTHODONTIC', label: '🦷 Ortodoncia' },
  { value: 'PROSTHODONTIC', label: '👑 Prostodoncia' },
  { value: 'SURGICAL', label: '🔪 Cirugía' },
  { value: 'EQUIPMENT', label: '🔧 Equipos' },
  { value: 'CONSUMABLE', label: '📦 Consumibles' },
  { value: 'GENERAL', label: '🏷️ General' },
];

const PAYMENT_TERMS = [
  { value: 'IMMEDIATE', label: 'Pago Inmediato' },
  { value: 'NET_15', label: 'Neto 15 días' },
  { value: 'NET_30', label: 'Neto 30 días' },
  { value: 'NET_60', label: 'Neto 60 días' },
  { value: 'NET_90', label: 'Neto 90 días' },
  { value: 'COD', label: 'Contra Entrega' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const SupplierFormSheet: React.FC<SupplierFormSheetProps> = ({
  supplier,
  isOpen,
  onClose,
  onSave,
}) => {
  const isEditing = !!supplier;
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    taxId: '',
    paymentTerms: 'NET_30',
    creditLimit: 0,
    status: 'ACTIVE',
    rating: 0,
    categories: [] as string[],
    contractStart: '',
    contractEnd: '',
    notes: '',
  });

  // ========================================================================
  // MUTATIONS
  // ========================================================================

  const [createSupplier] = useMutation(CREATE_SUPPLIER);
  const [updateSupplier] = useMutation(UPDATE_SUPPLIER);
  const [deleteSupplier] = useMutation(DELETE_SUPPLIER);

  // ========================================================================
  // EFFECTS
  // ========================================================================

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name || '',
        contactPerson: supplier.contactPerson || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        taxId: supplier.taxId || '',
        paymentTerms: supplier.paymentTerms || 'NET_30',
        creditLimit: supplier.creditLimit || 0,
        status: supplier.status || 'ACTIVE',
        rating: supplier.rating || 0,
        categories: supplier.categories || [],
        contractStart: supplier.contractStart ? supplier.contractStart.split('T')[0] : '',
        contractEnd: supplier.contractEnd ? supplier.contractEnd.split('T')[0] : '',
        notes: supplier.notes || '',
      });
    } else {
      setFormData({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        taxId: '',
        paymentTerms: 'NET_30',
        creditLimit: 0,
        status: 'ACTIVE',
        rating: 0,
        categories: [],
        contractStart: '',
        contractEnd: '',
        notes: '',
      });
    }
    setErrors({});
    setShowDeleteConfirm(false);
  }, [supplier, isOpen]);

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category],
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (formData.creditLimit < 0) {
      newErrors.creditLimit = 'El límite debe ser positivo';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const input = {
        name: formData.name.trim(),
        contactPerson: formData.contactPerson.trim() || null,
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        taxId: formData.taxId.trim() || null,
        paymentTerms: formData.paymentTerms,
        creditLimit: formData.creditLimit,
        status: formData.status,
        rating: formData.rating,
        categories: formData.categories,
        contractStart: formData.contractStart || null,
        contractEnd: formData.contractEnd || null,
        notes: formData.notes.trim() || null,
      };

      if (isEditing && supplier) {
        await updateSupplier({
          variables: { id: supplier.id, input },
        });
        toast.success('🏭 Proveedor actualizado');
      } else {
        await createSupplier({
          variables: { input },
        });
        toast.success('✨ Proveedor creado');
      }

      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error saving supplier:', error);
      toast.error(error.message || 'Error al guardar proveedor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!supplier) return;

    setIsLoading(true);
    try {
      await deleteSupplier({
        variables: { id: supplier.id },
      });
      toast.success('🗑️ Proveedor eliminado');
      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error deleting supplier:', error);
      toast.error(error.message || 'Error al eliminar');
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[800px] bg-gray-900 border-l border-emerald-500/30 overflow-y-auto"
      >
        <SheetHeader className="space-y-1 pb-4 border-b border-gray-700/50">
          <SheetTitle className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 flex items-center gap-2">
            <BuildingStorefrontIcon className="h-6 w-6 text-emerald-400" />
            {isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </SheetTitle>
          <SheetDescription className="text-gray-500">
            {isEditing
              ? `Editando: ${supplier?.name}`
              : 'Registra un nuevo proveedor en el sistema'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="py-6">
          {/* GRID DE 2 COLUMNAS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* ============================================================ */}
            {/* COLUMNA IZQUIERDA */}
            {/* ============================================================ */}
            <div className="space-y-5">
              {/* DATOS DE LA EMPRESA */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                  <BuildingStorefrontIcon className="h-4 w-4" />
                  Datos de la Empresa
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-gray-300 text-sm mb-1.5 block">Nombre de la Empresa *</Label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Ej: Dentsply Sirona S.A."
                      className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                    />
                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <Label className="text-gray-300 text-sm mb-1.5 block">Persona de Contacto</Label>
                    <Input
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleInputChange}
                      placeholder="Nombre del contacto"
                      className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300 text-sm mb-1.5 block">NIF / CIF</Label>
                    <Input
                      name="taxId"
                      value={formData.taxId}
                      onChange={handleInputChange}
                      placeholder="Ej: B12345678"
                      className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>
              </div>

              {/* CONTACTO */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                  <PhoneIcon className="h-4 w-4" />
                  Información de Contacto
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-gray-300 text-sm mb-1.5 flex items-center gap-2">
                      <EnvelopeIcon className="h-4 w-4 text-cyan-400" />
                      Email
                    </Label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="email@proveedor.com"
                      className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                    />
                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <Label className="text-gray-300 text-sm mb-1.5 flex items-center gap-2">
                      <PhoneIcon className="h-4 w-4 text-cyan-400" />
                      Teléfono
                    </Label>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+34 600 000 000"
                      className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300 text-sm mb-1.5 flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4 text-cyan-400" />
                      Dirección
                    </Label>
                    <Input
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Dirección completa"
                      className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                </div>
              </div>

              {/* CATEGORÍAS */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-pink-300 uppercase tracking-wider">
                  📦 Categorías de Productos
                </h3>
                <div className="flex flex-wrap gap-2">
                  {SUPPLIER_CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => handleCategoryToggle(cat.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        formData.categories.includes(cat.value)
                          ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                          : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ============================================================ */}
            {/* COLUMNA DERECHA */}
            {/* ============================================================ */}
            <div className="space-y-5">
              {/* TÉRMINOS COMERCIALES */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <CurrencyEuroIcon className="h-4 w-4" />
                  Términos Comerciales
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-gray-300 text-sm mb-1.5 block">Términos de Pago</Label>
                    <select
                      name="paymentTerms"
                      value={formData.paymentTerms}
                      onChange={handleInputChange}
                      className="w-full h-10 px-3 py-2 rounded-lg text-sm text-white bg-gray-800/50 border border-gray-700 focus:outline-none focus:border-amber-500/50"
                    >
                      {PAYMENT_TERMS.map((term) => (
                        <option key={term.value} value={term.value}>
                          {term.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="text-gray-300 text-sm mb-1.5 block">Límite de Crédito (€)</Label>
                    <Input
                      name="creditLimit"
                      type="number"
                      min="0"
                      step="100"
                      value={formData.creditLimit}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
                    />
                    {errors.creditLimit && <p className="text-red-400 text-xs mt-1">{errors.creditLimit}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-gray-300 text-sm mb-1.5 block">Inicio Contrato</Label>
                      <Input
                        name="contractStart"
                        type="date"
                        value={formData.contractStart}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300 text-sm mb-1.5 block">Fin Contrato</Label>
                      <Input
                        name="contractEnd"
                        type="date"
                        value={formData.contractEnd}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ESTADO Y RATING */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-2">
                  <StarIcon className="h-4 w-4" />
                  Estado y Calificación
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-gray-300 text-sm mb-1.5 block">Estado</Label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full h-10 px-3 py-2 rounded-lg text-sm text-white bg-gray-800/50 border border-gray-700 focus:outline-none focus:border-purple-500/50"
                    >
                      {SUPPLIER_STATUS.map((st) => (
                        <option key={st.value} value={st.value}>
                          {st.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="text-gray-300 text-sm mb-1.5 block">Calificación</Label>
                    <div className="flex items-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingChange(star)}
                          className="focus:outline-none"
                        >
                          <StarIcon
                            className={`h-6 w-6 transition-colors ${
                              star <= formData.rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-gray-600'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-gray-400 text-sm">
                        {formData.rating > 0 ? `${formData.rating}/5` : 'Sin calificar'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* NOTAS */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  📝 Notas Adicionales
                </h3>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Información adicional sobre el proveedor..."
                  className="w-full min-h-[100px] px-4 py-3 rounded-lg text-sm text-white bg-gray-800/50 border border-gray-700 focus:outline-none focus:border-gray-500/50 resize-none placeholder-gray-500"
                />
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* FOOTER ACTIONS */}
          {/* ============================================================ */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-700/50">
            {isEditing ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isLoading}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            ) : (
              <div />
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Guardando...
                  </span>
                ) : isEditing ? (
                  '💾 Guardar Cambios'
                ) : (
                  '✨ Crear Proveedor'
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-gray-800 border border-red-500/30 rounded-xl p-6 max-w-md shadow-2xl">
              <h3 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2">
                <ExclamationTriangleIcon className="h-6 w-6" />
                ¿Eliminar Proveedor?
              </h3>
              <p className="text-gray-300 mb-6">
                Estás a punto de eliminar <strong className="text-white">{supplier?.name}</strong>. 
                Esto puede afectar los materiales vinculados a este proveedor.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="border-gray-600 text-gray-300"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-500 text-white"
                >
                  {isLoading ? 'Eliminando...' : '🗑️ Sí, Eliminar'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default SupplierFormSheet;
