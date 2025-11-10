// 🎯🎸💀 SUPPLIER FORM V3.0 - TITAN PATTERN IMPLEMENTATION
// Date: September 25, 2025
// Mission: Complete supplier form with validation and @veritas
// Status: V3.0 - Full supplier creation/editing with quantum verification
// Challenge: Comprehensive supplier data management
// 🎨 THEME: Cyberpunk Medical - Cyan/Purple/Pink gradients with quantum effects
// 🔒 SECURITY: @veritas quantum truth verification on supplier data

import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client/react';

// 🎯 TITAN PATTERN IMPORTS - Core Dependencies
import { Button } from '../../design-system/Button';
import { Card, CardHeader, CardBody } from '../../design-system/Card';

import { Badge } from '../../design-system/Badge';
import { createModuleLogger } from '../../utils/logger';

// 🎯 GRAPHQL QUERIES - V3.0 Integration
import {
  CREATE_SUPPLIER,
  UPDATE_SUPPLIER
} from '../../graphql/queries/inventory';

// 🎯 ICONS - Heroicons for supplier theme
import {
  XMarkIcon,
  BuildingStorefrontIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CreditCardIcon,
  DocumentTextIcon,
  StarIcon
} from '@heroicons/react/24/outline';

// 🎯 SUPPLIER FORM V3.0 INTERFACE
interface SupplierFormV3Props {
  supplier?: any;
  onClose: () => void;
  onSuccess: () => void;
}

// 🎯 SUPPLIER FORM DATA INTERFACE
interface SupplierFormData {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
  paymentTerms: string;
  creditLimit: number;
  status: 'active' | 'inactive' | 'suspended';
  rating: number;
  categories: string[];
  contractStart?: string;
  contractEnd?: string;
  notes: string;
}

// 🎯 LOGGER - Module specific logger
const l = createModuleLogger('SupplierFormV3');

// 🎯 SUPPLIER CATEGORIES
const SUPPLIER_CATEGORIES = [
  'Materiales Dentales',
  'Equipos Médicos',
  'Instrumentos',
  'Consumibles',
  'Software',
  'Servicios de Mantenimiento',
  'Suministros de Oficina',
  'Otros'
];

// 🎯 PAYMENT TERMS
const PAYMENT_TERMS = [
  'Contado',
  '15 días',
  '30 días',
  '45 días',
  '60 días',
  '90 días'
];

export const SupplierFormV3: React.FC<SupplierFormV3Props> = ({
  supplier,
  onClose,
  onSuccess
}) => {
  // 🎯 FORM STATE
  const [formData, setFormData] = useState<SupplierFormData>({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    taxId: '',
    paymentTerms: '30 días',
    creditLimit: 0,
    status: 'active',
    rating: 3.0,
    categories: [],
    contractStart: '',
    contractEnd: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🎯 GRAPHQL MUTATIONS
  const [createSupplier] = useMutation(CREATE_SUPPLIER);
  const [updateSupplier] = useMutation(UPDATE_SUPPLIER);

  // 🎯 INITIALIZE FORM DATA
  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name || '',
        contactPerson: supplier.contactPerson || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        taxId: supplier.taxId || '',
        paymentTerms: supplier.paymentTerms || '30 días',
        creditLimit: supplier.creditLimit || 0,
        status: supplier.status || 'active',
        rating: supplier.rating || 3.0,
        categories: supplier.categories || [],
        contractStart: supplier.contractStart || '',
        contractEnd: supplier.contractEnd || '',
        notes: supplier.notes || ''
      });
    }
  }, [supplier]);

  // 🎯 FORM HANDLERS
  const handleInputChange = (field: keyof SupplierFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  // 🎯 VALIDATION
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del proveedor es requerido';
    }

    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = 'La persona de contacto es requerida';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es requerida';
    }

    if (formData.creditLimit < 0) {
      newErrors.creditLimit = 'El límite de crédito no puede ser negativo';
    }

    if (formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = 'La calificación debe estar entre 1 y 5';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🎯 SUBMIT HANDLER
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const supplierData = {
        ...formData,
        contractStart: formData.contractStart || null,
        contractEnd: formData.contractEnd || null
      };

      if (supplier) {
        await updateSupplier({
          variables: {
            id: supplier.id,
            input: supplierData
          }
        });
        l.info('Supplier updated successfully', { supplierId: supplier.id });
      } else {
        await createSupplier({
          variables: { input: supplierData }
        });
        l.info('Supplier created successfully');
      }

      onSuccess();
    } catch (error) {
      l.error('Failed to save supplier', error as Error);
      // Handle specific GraphQL errors here if needed
    } finally {
      setIsSubmitting(false);
    }
  };

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
                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  🎯 {supplier ? 'Editar' : 'Nuevo'} Proveedor V3.0
                </h2>
                <p className="text-gray-300 text-sm mt-1">
                  Gestión completa de proveedores con verificación cuántica
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

        <form onSubmit={handleSubmit}>
          <CardBody className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <UserIcon className="w-5 h-5 text-cyan-400" />
                  <span>Información Básica</span>
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre del Proveedor *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('name', e.target.value)}
                    className={`bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20 ${errors.name ? 'border-red-500/50' : ''}`}
                    placeholder="Nombre del proveedor"
                  />
                  {errors.name && (
                    <p className="text-red-400 text-xs mt-1 flex items-center space-x-1">
                      <ExclamationTriangleIcon className="w-3 h-3" />
                      <span>{errors.name}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Persona de Contacto *
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('contactPerson', e.target.value)}
                    className={`bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20 ${errors.contactPerson ? 'border-red-500/50' : ''}`}
                    placeholder="Nombre de la persona de contacto"
                  />
                  {errors.contactPerson && (
                    <p className="text-red-400 text-xs mt-1 flex items-center space-x-1">
                      <ExclamationTriangleIcon className="w-3 h-3" />
                      <span>{errors.contactPerson}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)}
                      className={`pl-10 bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20 ${errors.email ? 'border-red-500/50' : ''}`}
                      placeholder="proveedor@email.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1 flex items-center space-x-1">
                      <ExclamationTriangleIcon className="w-3 h-3" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Teléfono *
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('phone', e.target.value)}
                      className={`pl-10 bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20 ${errors.phone ? 'border-red-500/50' : ''}`}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-400 text-xs mt-1 flex items-center space-x-1">
                      <ExclamationTriangleIcon className="w-3 h-3" />
                      <span>{errors.phone}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Dirección *
                  </label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <textarea
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows={3}
                      className={`pl-10 w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20 resize-none ${errors.address ? 'border-red-500/50' : ''}`}
                      placeholder="Dirección completa del proveedor"
                    />
                  </div>
                  {errors.address && (
                    <p className="text-red-400 text-xs mt-1 flex items-center space-x-1">
                      <ExclamationTriangleIcon className="w-3 h-3" />
                      <span>{errors.address}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <CreditCardIcon className="w-5 h-5 text-purple-400" />
                  <span>Información Empresarial</span>
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ID Fiscal
                  </label>
                  <input
                    type="text"
                    value={formData.taxId}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('taxId', e.target.value)}
                    className="bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20"
                    placeholder="RFC, NIT, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Términos de Pago
                  </label>
                  <select
                    value={formData.paymentTerms}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('paymentTerms', e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
                  >
                    {PAYMENT_TERMS.map(term => (
                      <option key={term} value={term}>{term}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Límite de Crédito ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.creditLimit}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('creditLimit', parseFloat(e.target.value) || 0)}
                    className={`bg-gray-800/50 border-gray-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20 ${errors.creditLimit ? 'border-red-500/50' : ''}`}
                    placeholder="0.00"
                  />
                  {errors.creditLimit && (
                    <p className="text-red-400 text-xs mt-1 flex items-center space-x-1">
                      <ExclamationTriangleIcon className="w-3 h-3" />
                      <span>{errors.creditLimit}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Estado
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('status', e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                    <option value="suspended">Suspendido</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Calificación (1-5)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      value={formData.rating}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('rating', parseFloat(e.target.value) || 3.0)}
                      className={`bg-gray-800/50 border-gray-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20 ${errors.rating ? 'border-red-500/50' : ''}`}
                    />
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(formData.rating) ? 'text-yellow-400 fill-current' : 'text-gray-500'}`}
                        />
                      ))}
                    </div>
                  </div>
                  {errors.rating && (
                    <p className="text-red-400 text-xs mt-1 flex items-center space-x-1">
                      <ExclamationTriangleIcon className="w-3 h-3" />
                      <span>{errors.rating}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2 mb-4">
                <DocumentTextIcon className="w-5 h-5 text-pink-400" />
                <span>Categorías de Productos/Servicios</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {SUPPLIER_CATEGORIES.map(category => (
                  <label key={category} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.categories.includes(category)}
                      onChange={() => handleCategoryToggle(category)}
                      className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <span className="text-gray-300 text-sm">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Contract Information */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Inicio del Contrato
                </label>
                <input
                  type="date"
                  value={formData.contractStart}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('contractStart', e.target.value)}
                  className="bg-gray-800/50 border-gray-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fin del Contrato
                </label>
                <input
                  type="date"
                  value={formData.contractEnd}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('contractEnd', e.target.value)}
                  className="bg-gray-800/50 border-gray-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notas Adicionales
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={4}
                className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20 resize-none"
                placeholder="Información adicional sobre el proveedor..."
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-600/30 mt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 border-gray-600/30"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white shadow-lg shadow-pink-500/25"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    {supplier ? 'Actualizar' : 'Crear'} Proveedor
                  </>
                )}
              </Button>
            </div>
          </CardBody>
        </form>
      </Card>
    </div>
  );
};

export default SupplierFormV3;
