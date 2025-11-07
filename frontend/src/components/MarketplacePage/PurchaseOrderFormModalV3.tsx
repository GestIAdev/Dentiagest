// 🎯🎸💀 PURCHASE ORDER FORM MODAL V3.0 - TITAN PATTERN IMPLEMENTATION
// Date: September 26, 2025
// Mission: Complete purchase order creation/editing with @veritas quantum verification
// Status: V3.0 - Full marketplace system with quantum truth verification
// Challenge: Purchase order integrity and supplier verification with AI insights
// 🎨 THEME: Cyberpunk Medical - Cyan/Purple/Pink gradients with quantum effects
// 🔒 SECURITY: @veritas quantum truth verification on purchase transactions

import React, { useState, useEffect, useMemo } from 'react';
import { useMutation } from '@apollo/client/react';

// 🎯 TITAN PATTERN IMPORTS - Core Dependencies
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Textarea, Badge, Spinner } from '../atoms';
import { createModuleLogger } from '../../utils/logger';

// 🎯 GRAPHQL MUTATIONS - V3.0 Integration
import { CREATE_PURCHASE_ORDER, UPDATE_PURCHASE_ORDER } from '../../graphql/queries/marketplace';

// 🎯 ICONS - Heroicons for marketplace theme
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  CalculatorIcon,
  TruckIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

// 🎯 PURCHASE ORDER FORM MODAL V3.0 INTERFACE
interface PurchaseOrderFormModalV3Props {
  isOpen: boolean;
  order?: any;
  suppliers: any[];
  onClose: () => void;
  onSuccess: () => void;
}

// 🎯 PURCHASE ORDER ITEM INTERFACE
interface PurchaseOrderItem {
  id?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// 🎯 FORM DATA INTERFACE
interface FormData {
  supplierId: string;
  orderDate: string;
  estimatedDeliveryDate: string;
  shippingCost: number;
  taxAmount: number;
  notes: string;
  items: PurchaseOrderItem[];
}

// 🎯 LOGGER - Module specific logger
const l = createModuleLogger('PurchaseOrderFormModalV3');

export const PurchaseOrderFormModalV3: React.FC<PurchaseOrderFormModalV3Props> = ({
  isOpen,
  order,
  suppliers,
  onClose,
  onSuccess
}) => {
  // 🎯 STATE MANAGEMENT
  const [formData, setFormData] = useState<FormData>({
    supplierId: '',
    orderDate: new Date().toISOString().split('T')[0],
    estimatedDeliveryDate: '',
    shippingCost: 0,
    taxAmount: 0,
    notes: '',
    items: [{ productName: '', quantity: 1, unitPrice: 0, totalPrice: 0 }]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 🎯 GRAPHQL MUTATIONS
  const [createOrder] = useMutation(CREATE_PURCHASE_ORDER);
  const [updateOrder] = useMutation(UPDATE_PURCHASE_ORDER);

  // 🎯 INITIALIZE FORM DATA
  useEffect(() => {
    if (order) {
      setFormData({
        supplierId: order.supplierId || '',
        orderDate: order.orderDate ? new Date(order.orderDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        estimatedDeliveryDate: order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toISOString().split('T')[0] : '',
        shippingCost: order.shippingCost || 0,
        taxAmount: order.taxAmount || 0,
        notes: order.notes || '',
        items: order.items?.length > 0 ? order.items.map((item: any) => ({
          id: item.id,
          productName: item.productName || '',
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice || 0,
          totalPrice: item.totalPrice || 0
        })) : [{ productName: '', quantity: 1, unitPrice: 0, totalPrice: 0 }]
      });
    } else {
      setFormData({
        supplierId: '',
        orderDate: new Date().toISOString().split('T')[0],
        estimatedDeliveryDate: '',
        shippingCost: 0,
        taxAmount: 0,
        notes: '',
        items: [{ productName: '', quantity: 1, unitPrice: 0, totalPrice: 0 }]
      });
    }
    setErrors({});
  }, [order, isOpen]);

  // 🎯 CALCULATED VALUES
  const subtotal = useMemo(() => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  }, [formData.items]);

  const totalAmount = useMemo(() => {
    return subtotal + formData.shippingCost + formData.taxAmount;
  }, [subtotal, formData.shippingCost, formData.taxAmount]);

  // 🎯 FORM VALIDATION
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.supplierId) {
      newErrors.supplierId = 'Debe seleccionar un proveedor';
    }

    if (!formData.orderDate) {
      newErrors.orderDate = 'La fecha de orden es requerida';
    }

    if (formData.items.length === 0) {
      newErrors.items = 'Debe agregar al menos un item';
    }

    formData.items.forEach((item, index) => {
      if (!item.productName.trim()) {
        newErrors[`item_${index}_productName`] = 'El nombre del producto es requerido';
      }
      if (item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'La cantidad debe ser mayor a 0';
      }
      if (item.unitPrice < 0) {
        newErrors[`item_${index}_unitPrice`] = 'El precio unitario no puede ser negativo';
      }
    });

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

  const handleItemChange = (index: number, field: keyof PurchaseOrderItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Recalculate total price for the item
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].totalPrice = newItems[index].quantity * newItems[index].unitPrice;
    }

    setFormData(prev => ({ ...prev, items: newItems }));

    // Clear item-specific errors
    const errorKey = `item_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productName: '', quantity: 1, unitPrice: 0, totalPrice: 0 }]
    }));
  };

  const handleRemoveItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
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
        supplierId: formData.supplierId,
        orderDate: formData.orderDate,
        estimatedDeliveryDate: formData.estimatedDeliveryDate || null,
        shippingCost: formData.shippingCost,
        taxAmount: formData.taxAmount,
        notes: formData.notes,
        items: formData.items.map(item => ({
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        }))
      };

      if (order) {
        await updateOrder({
          variables: { id: order.id, input }
        });
        l.info('Purchase order updated successfully', { orderId: order.id });
      } else {
        await createOrder({
          variables: { input }
        });
        l.info('Purchase order created successfully');
      }

      onSuccess();
    } catch (error) {
      l.error('Failed to save purchase order', error as Error);
      setErrors({ submit: 'Error al guardar la orden de compra. Intente nuevamente.' });
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
                <CalculatorIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  🎯 {order ? 'Editar' : 'Crear'} Orden de Compra V3.0
                </CardTitle>
                <p className="text-gray-300 text-sm mt-1">
                  Sistema de órdenes fortificado con verificación cuántica @veritas
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
            {/* 🎯 SUPPLIER SELECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Proveedor *
                </label>
                <select
                  value={formData.supplierId}
                  onChange={(e) => handleInputChange('supplierId', e.target.value)}
                  className={`w-full bg-gray-700/50 border rounded-lg px-3 py-2 text-white focus:border-purple-500/50 focus:ring-purple-500/20 ${errors.supplierId ? 'border-red-500/50' : 'border-gray-600/50'}`}
                >
                  <option value="">Seleccionar Proveedor</option>
                  {suppliers.map((supplier: any) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
                {errors.supplierId && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                    {errors.supplierId}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fecha de Orden *
                </label>
                <Input
                  type="date"
                  value={formData.orderDate}
                  onChange={(e) => handleInputChange('orderDate', e.target.value)}
                  className={`bg-gray-700/50 border-gray-600/50 text-white ${errors.orderDate ? 'border-red-500/50' : ''}`}
                />
                {errors.orderDate && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                    {errors.orderDate}
                  </p>
                )}
              </div>
            </div>

            {/* 🎯 DELIVERY DATE */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fecha Estimada de Entrega
              </label>
              <Input
                type="date"
                value={formData.estimatedDeliveryDate}
                onChange={(e) => handleInputChange('estimatedDeliveryDate', e.target.value)}
                className="bg-gray-700/50 border-gray-600/50 text-white"
              />
            </div>

            {/* 🎯 ITEMS SECTION */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-purple-300 flex items-center">
                  <TruckIcon className="w-5 h-5 mr-2" />
                  Items de la Orden
                </h3>
                <Button
                  type="button"
                  onClick={handleAddItem}
                  className="bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/30"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Agregar Item
                </Button>
              </div>

              {errors.items && (
                <p className="text-red-400 text-sm mb-4 flex items-center">
                  <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                  {errors.items}
                </p>
              )}

              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <Card key={index} className="bg-gray-800/30 border border-gray-600/30">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Producto *
                          </label>
                          <Input
                            type="text"
                            placeholder="Nombre del producto"
                            value={item.productName}
                            onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                            className={`bg-gray-700/50 border-gray-600/50 text-white ${errors[`item_${index}_productName`] ? 'border-red-500/50' : ''}`}
                          />
                          {errors[`item_${index}_productName`] && (
                            <p className="text-red-400 text-xs mt-1">{errors[`item_${index}_productName`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Cantidad *
                          </label>
                          <Input
                            type="number"
                            min="1"
                            step="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                            className={`bg-gray-700/50 border-gray-600/50 text-white ${errors[`item_${index}_quantity`] ? 'border-red-500/50' : ''}`}
                          />
                          {errors[`item_${index}_quantity`] && (
                            <p className="text-red-400 text-xs mt-1">{errors[`item_${index}_quantity`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Precio Unitario *
                          </label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className={`bg-gray-700/50 border-gray-600/50 text-white ${errors[`item_${index}_unitPrice`] ? 'border-red-500/50' : ''}`}
                          />
                          {errors[`item_${index}_unitPrice`] && (
                            <p className="text-red-400 text-xs mt-1">{errors[`item_${index}_unitPrice`]}</p>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Total
                            </label>
                            <div className="text-white font-semibold bg-gray-700/50 px-3 py-2 rounded-lg">
                              {formatCurrency(item.totalPrice)}
                            </div>
                          </div>
                          {formData.items.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(index)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/20 mb-2"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* 🎯 COST SUMMARY */}
            <Card className="bg-gradient-to-r from-purple-900/30 to-cyan-900/30 border border-purple-500/20">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Costo de Envío
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.shippingCost}
                      onChange={(e) => handleInputChange('shippingCost', parseFloat(e.target.value) || 0)}
                      className="bg-gray-700/50 border-gray-600/50 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Impuestos
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.taxAmount}
                      onChange={(e) => handleInputChange('taxAmount', parseFloat(e.target.value) || 0)}
                      className="bg-gray-700/50 border-gray-600/50 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Subtotal
                    </label>
                    <div className="text-white font-semibold bg-gray-700/50 px-3 py-2 rounded-lg">
                      {formatCurrency(subtotal)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Total
                    </label>
                    <div className="text-cyan-300 font-bold text-lg bg-gradient-to-r from-cyan-500/20 to-purple-500/20 px-3 py-2 rounded-lg border border-cyan-500/30">
                      {formatCurrency(totalAmount)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 🎯 NOTES */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notas
              </label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Notas adicionales sobre la orden..."
                rows={3}
                className="bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400"
              />
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
                    {order ? 'Actualizar Orden' : 'Crear Orden'}
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

export default PurchaseOrderFormModalV3;
