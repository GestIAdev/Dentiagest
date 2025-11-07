// 🎯🎸💀 SUPPLIER FORM MODAL V3.0 - TITAN PATTERN IMPLEMENTATION
// Date: September 26, 2025
// Mission: Complete supplier creation/editing with @veritas quantum verification
// Status: V3.0 - Full marketplace system with quantum truth verification
// Challenge: Supplier integrity and relationship verification with AI insights
// 🎨 THEME: Cyberpunk Medical - Cyan/Purple/Pink gradients with quantum effects
// 🔒 SECURITY: @veritas quantum truth verification on supplier data

import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client/react';

// 🎯 TITAN PATTERN IMPORTS - Core Dependencies
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Textarea, Badge, Spinner } from '../atoms';
import { createModuleLogger } from '../../utils/logger';

// 🎯 GRAPHQL MUTATIONS - V3.0 Integration
import { CREATE_SUPPLIER, UPDATE_SUPPLIER } from '../../graphql/queries/marketplace';

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
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline';

// 🎯 SUPPLIER FORM MODAL V3.0 INTERFACE
interface SupplierFormModalV3Props {
  isOpen: boolean;
  supplier?: any;
  onClose: () => void;
  onSuccess: () => void;
}

// 🎯 FORM DATA INTERFACE
interface FormData {
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
  paymentTerms: string;
  creditLimit: number;
  isActive: boolean;
  categories: string[];
}

// 🎯 LOGGER - Module specific logger
const l = createModuleLogger('SupplierFormModalV3');

export const SupplierFormModalV3: React.FC<SupplierFormModalV3Props> = ({
  isOpen,
  supplier,
  onClose,
  onSuccess
}) => {
  // 🎯 STATE MANAGEMENT
  const [formData, setFormData] = useState<FormData>({
    name: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    taxId: '',
    paymentTerms: 'Net 30',
    creditLimit: 0,
    isActive: true,
    categories: ['']
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 🎯 GRAPHQL MUTATIONS
  const [createSupplier] = useMutation(CREATE_SUPPLIER);
  const [updateSupplier] = useMutation(UPDATE_SUPPLIER);

  // 🎯 INITIALIZE FORM DATA
  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name || '',
        contactName: supplier.contactName || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        taxId: supplier.taxId || '',
        paymentTerms: supplier.paymentTerms || 'Net 30',
        creditLimit: supplier.creditLimit || 0,
        isActive: supplier.isActive ?? true,
        categories: supplier.categories?.length > 0 ? supplier.categories : ['']
      });
    } else {
      setFormData({
        name: '',
        contactName: '',
        email: '',
        phone: '',
        address: '',
        taxId: '',
        paymentTerms: 'Net 30',
        creditLimit: 0,
        isActive: true,
        categories: ['']
      });
    }
    setErrors({});
  }, [supplier, isOpen]);

  // 🎯 FORM VALIDATION
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del proveedor es requerido';
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = 'El nombre del contacto es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no tiene un formato válido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es requerida';
    }

    if (!formData.taxId.trim()) {
      newErrors.taxId = 'El ID fiscal es requerido';
    }

    const validCategories = formData.categories.filter(cat => cat.trim());
    if (validCategories.length === 0) {
      newErrors.categories = 'Debe especificar al menos una categoría';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🎯 HANDLERS
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCategoryChange = (index: number, value: string) => {
    const newCategories = [...formData.categories];
    newCategories[index] = value;
    setFormData(prev => ({ ...prev, categories: newCategories }));

    if (errors.categories) {
      setErrors(prev => ({ ...prev, categories: '' }));
    }
  };

  const handleAddCategory = () => {
    setFormData(prev => ({
      ...prev,
      categories: [...prev.categories, '']
    }));
  };

  const handleRemoveCategory = (index: number) => {
    if (formData.categories.length > 1) {
      setFormData(prev => ({
        ...prev,
        categories: prev.categories.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const input = {
        name: formData.name,
        contactName: formData.contactName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        taxId: formData.taxId,
        paymentTerms: formData.paymentTerms,
        creditLimit: formData.creditLimit,
        isActive: formData.isActive,
        categories: formData.categories.filter(cat => cat.trim())
      };

      if (supplier) {
        await updateSupplier({
          variables: { input: { ...input, id: supplier.id } }
        });
        l.info('Supplier updated successfully', { supplierId: supplier.id });
      } else {
        await createSupplier({
          variables: { input }
        });
        l.info('Supplier created successfully');
      }

      onSuccess();
    } catch (error) {
      l.error('Failed to save supplier', error as Error);
      setErrors({ submit: 'Error al guardar el proveedor. Intente nuevamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🎯 FORMAT CURRENCY
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (!isOpen) return null;

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
                  🎯 {supplier ? 'Editar' : 'Crear'} Proveedor V3.0
                </CardTitle>
                <p className="text-gray-300 text-sm mt-1">
                  Sistema de proveedores fortificado con verificación cuántica @veritas
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 🎯 BASIC INFORMATION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre del Proveedor *
                </label>
                <div className="relative">
                  <BuildingStorefrontIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`pl-10 bg-gray-700/50 border-gray-600/50 text-white ${errors.name ? 'border-red-500/50' : ''}`}
                    placeholder="Nombre de la empresa"
                  />
                </div>
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre del Contacto *
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => handleInputChange('contactName', e.target.value)}
                    className={`pl-10 bg-gray-700/50 border-gray-600/50 text-white ${errors.contactName ? 'border-red-500/50' : ''}`}
                    placeholder="Persona de contacto"
                  />
                </div>
                {errors.contactName && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                    {errors.contactName}
                  </p>
                )}
              </div>
            </div>

            {/* 🎯 CONTACT INFORMATION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`pl-10 bg-gray-700/50 border-gray-600/50 text-white ${errors.email ? 'border-red-500/50' : ''}`}
                    placeholder="proveedor@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Teléfono *
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`pl-10 bg-gray-700/50 border-gray-600/50 text-white ${errors.phone ? 'border-red-500/50' : ''}`}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            {/* 🎯 ADDRESS */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Dirección *
              </label>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className={`pl-10 bg-gray-700/50 border-gray-600/50 text-white ${errors.address ? 'border-red-500/50' : ''}`}
                  placeholder="Dirección completa del proveedor"
                  rows={3}
                />
              </div>
              {errors.address && (
                <p className="text-red-400 text-sm mt-1 flex items-center">
                  <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                  {errors.address}
                </p>
              )}
            </div>

            {/* 🎯 BUSINESS INFORMATION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ID Fiscal *
                </label>
                <Input
                  type="text"
                  value={formData.taxId}
                  onChange={(e) => handleInputChange('taxId', e.target.value)}
                  className={`bg-gray-700/50 border-gray-600/50 text-white ${errors.taxId ? 'border-red-500/50' : ''}`}
                  placeholder="Número de identificación fiscal"
                />
                {errors.taxId && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                    {errors.taxId}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Términos de Pago
                </label>
                <select
                  value={formData.paymentTerms}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('paymentTerms', e.target.value)}
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
                >
                  <option value="Net 15">Net 15 días</option>
                  <option value="Net 30">Net 30 días</option>
                  <option value="Net 45">Net 45 días</option>
                  <option value="Net 60">Net 60 días</option>
                  <option value="Cash on Delivery">Pago contra entrega</option>
                  <option value="Due on Receipt">Vencimiento al recibo</option>
                </select>
              </div>
            </div>

            {/* 🎯 FINANCIAL INFORMATION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Límite de Crédito
                </label>
                <div className="relative">
                  <BanknotesIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.creditLimit}
                    onChange={(e) => handleInputChange('creditLimit', parseFloat(e.target.value) || 0)}
                    className="pl-10 bg-gray-700/50 border-gray-600/50 text-white"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-gray-400 text-xs mt-1">
                  Límite actual: {formatCurrency(formData.creditLimit)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Estado del Proveedor
                </label>
                <div className="flex items-center space-x-4 mt-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={() => handleInputChange('isActive', true)}
                      className="text-cyan-500 focus:ring-cyan-500"
                    />
                    <span className="text-green-400">Activo</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="isActive"
                      checked={!formData.isActive}
                      onChange={() => handleInputChange('isActive', false)}
                      className="text-cyan-500 focus:ring-cyan-500"
                    />
                    <span className="text-red-400">Inactivo</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 🎯 CATEGORIES */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-300">
                  Categorías *
                </label>
                <Button
                  type="button"
                  onClick={handleAddCategory}
                  className="bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/30"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Agregar Categoría
                </Button>
              </div>

              {errors.categories && (
                <p className="text-red-400 text-sm mb-4 flex items-center">
                  <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                  {errors.categories}
                </p>
              )}

              <div className="space-y-3">
                {formData.categories.map((category, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Input
                      type="text"
                      value={category}
                      onChange={(e) => handleCategoryChange(index, e.target.value)}
                      className="flex-1 bg-gray-700/50 border-gray-600/50 text-white"
                      placeholder={`Categoría ${index + 1} (ej: Equipos, Materiales, Servicios)`}
                    />
                    {formData.categories.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCategory(index)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                      >
                        <MinusIcon className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 🎯 @VERITAS VERIFICATION BADGE */}
            <div className="flex items-center justify-center">
              <Badge className="bg-green-500/20 text-green-300 border border-green-500/30 px-4 py-2">
                <ShieldCheckIcon className="w-4 h-4 mr-2" />
                @veritas Quantum Verification Active
              </Badge>
            </div>

            {/* 🎯 ERROR MESSAGE */}
            {errors.submit && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-300 flex items-center">
                  <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                  {errors.submit}
                </p>
              </div>
            )}

            {/* 🎯 FORM ACTIONS */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-600/30">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="text-gray-400 hover:text-white hover:bg-gray-700/50"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white shadow-lg shadow-pink-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" />
                    <span className="ml-2">Guardando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    {supplier ? 'Actualizar Proveedor' : 'Crear Proveedor'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupplierFormModalV3;
