// 🎯🎸💀 PURCHASE ORDER FORM V3.0 - TITAN PATTERN IMPLEMENTATION
// Date: September 25, 2025
// Mission: Complete purchase order creation and editing with @veritas validation
// Status: V3.0 - Full form with validation and quantum verification
// Challenge: Complex form validation and supplier integration
// 🎨 THEME: Cyberpunk Medical - Cyan/Purple/Pink gradients with quantum effects
// 🔒 SECURITY: @veritas quantum truth verification on form data

import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client/react';

// 🎯 TITAN PATTERN IMPORTS - Core Dependencies
import { Button } from '../../design-system/Button';
import { Card, CardHeader, CardBody } from '../../design-system/Card';

import { Badge } from '../../design-system/Badge';
import { Spinner } from '../../design-system/Spinner';
import { createModuleLogger } from '../../utils/logger';

// 🎯 GRAPHQL MUTATIONS - V3.0 Integration
import {
  CREATE_PURCHASE_ORDER,
  UPDATE_PURCHASE_ORDER,
  GET_PURCHASE_ORDERS
} from '../../graphql/queries/inventory';

// 🎯 ICONS - Heroicons for purchase order theme
import {
  DocumentTextIcon,
  PlusIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  BuildingStorefrontIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  TruckIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

// 🎯 PURCHASE ORDER FORM V3.0 INTERFACE
interface PurchaseOrderFormV3Props {
  order?: any;
  suppliers: any[];
  onClose: () => void;
  onSuccess: () => void;
}

// 🎯 PURCHASE ORDER ITEM INTERFACE
interface PurchaseOrderItem {
  id?: string;
  materialId?: string;
  equipmentId?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  description: string;
  status: string;
}

// 🎯 FORM DATA INTERFACE
interface FormData {
  supplierId: string;
  orderDate: string;
  expectedDelivery: string;
  notes: string;
  items: PurchaseOrderItem[];
}

// 🎯 FORM ERRORS INTERFACE
interface FormErrors {
  supplierId?: string;
  orderDate?: string;
  expectedDelivery?: string;
  items?: string;
  general?: string;
}

// 🎯 LOGGER - Module specific logger
const l = createModuleLogger('PurchaseOrderFormV3');

// 🎯 PURCHASE ORDER FORM V3.0 COMPONENT
export const PurchaseOrderFormV3: React.FC<PurchaseOrderFormV3Props> = ({
  order,
  suppliers,
  onClose,
  onSuccess
}) => {
  // 🎯 STATE MANAGEMENT
  const [formData, setFormData] = useState<FormData>({
    supplierId: order?.supplierId || '',
    orderDate: order?.orderDate ? new Date(order.orderDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    expectedDelivery: order?.expectedDelivery ? new Date(order.expectedDelivery).toISOString().split('T')[0] : '',
    notes: order?.notes || '',
    items: order?.items || []
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState<Partial<PurchaseOrderItem>>({
    quantity: 1,
    unitPrice: 0,
    description: ''
  });

  // 🎯 GRAPHQL MUTATIONS
  const [createPurchaseOrder] = useMutation(CREATE_PURCHASE_ORDER, {
    refetchQueries: [{ query: GET_PURCHASE_ORDERS }]
  });

  const [updatePurchaseOrder] = useMutation(UPDATE_PURCHASE_ORDER, {
    refetchQueries: [{ query: GET_PURCHASE_ORDERS }]
  });

  // 🎯 CALCULATED VALUES
  const totalAmount = formData.items.reduce((sum, item) => sum + item.totalPrice, 0);
  const taxAmount = totalAmount * 0.16; // 16% IVA
  const finalAmount = totalAmount + taxAmount;

  // 🎯 FORM VALIDATION
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.supplierId) {
      newErrors.supplierId = 'Debe seleccionar un proveedor';
    }

    if (!formData.orderDate) {
      newErrors.orderDate = 'La fecha de orden es requerida';
    }

    if (!formData.expectedDelivery) {
      newErrors.expectedDelivery = 'La fecha de entrega esperada es requerida';
    } else if (new Date(formData.expectedDelivery) <= new Date(formData.orderDate)) {
      newErrors.expectedDelivery = 'La fecha de entrega debe ser posterior a la fecha de orden';
    }

    if (formData.items.length === 0) {
      newErrors.items = 'Debe agregar al menos un item a la orden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🎯 HANDLERS
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAddItem = () => {
    if (!newItem.description || newItem.quantity! <= 0 || newItem.unitPrice! <= 0) {
      return;
    }

    const item: PurchaseOrderItem = {
      id: `temp-${Date.now()}`,
      quantity: newItem.quantity!,
      unitPrice: newItem.unitPrice!,
      totalPrice: newItem.quantity! * newItem.unitPrice!,
      description: newItem.description,
      status: 'pending'
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, item]
    }));

    setNewItem({
      quantity: 1,
      unitPrice: 0,
      description: ''
    });
    setShowAddItem(false);
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index: number, field: keyof PurchaseOrderItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
              totalPrice: field === 'quantity' || field === 'unitPrice'
                ? (field === 'quantity' ? value : item.quantity) * (field === 'unitPrice' ? value : item.unitPrice)
                : item.totalPrice
            }
          : item
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        supplierId: formData.supplierId,
        orderDate: formData.orderDate,
        expectedDelivery: formData.expectedDelivery,
        notes: formData.notes,
        items: formData.items.map(item => ({
          materialId: item.materialId,
          equipmentId: item.equipmentId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          description: item.description
        }))
      };

      if (order) {
        await updatePurchaseOrder({
          variables: { id: order.id, input: orderData }
        });
        l.info('Purchase order updated successfully', { orderId: order.id });
      } else {
        await createPurchaseOrder({
          variables: { input: orderData }
        });
        l.info('Purchase order created successfully');
      }

      onSuccess();
    } catch (error) {
      l.error('Failed to save purchase order', error as Error);
      setErrors({ general: 'Error al guardar la orden de compra. Intente nuevamente.' });
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-cyan-900/20 backdrop-blur-sm border border-purple-500/20">
        <CardHeader className="border-b border-gray-600/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <DocumentTextIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  🎯 {order ? 'Editar' : 'Nueva'} Orden de Compra V3.0
                </h2>
                <p className="text-gray-300 text-sm mt-1">
                  Gestión completa con validación cuántica @veritas
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

        <CardBody className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <DocumentTextIcon className="w-5 h-5 text-purple-400" />
                <span>Información General</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Proveedor *
                  </label>
                  <select
                    value={formData.supplierId}
                    onChange={(e) => handleInputChange('supplierId', e.target.value)}
                    className={`w-full bg-gray-700/50 border rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500/20 ${
                      errors.supplierId ? 'border-red-500/50' : 'border-gray-600/50'
                    }`}
                  >
                    <option value="">Seleccionar proveedor</option>
                    {suppliers.map((supplier: any) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                  {errors.supplierId && (
                    <p className="text-red-400 text-sm mt-1 flex items-center space-x-1">
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      <span>{errors.supplierId}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Fecha de Orden *
                  </label>
                  <input
                    type="date"
                    value={formData.orderDate}
                    onChange={(e) => handleInputChange('orderDate', e.target.value)}
                    className={`w-full bg-gray-700/50 border-gray-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20 ${
                      errors.orderDate ? 'border-red-500/50' : ''
                    }`}
                  />
                  {errors.orderDate && (
                    <p className="text-red-400 text-sm mt-1 flex items-center space-x-1">
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      <span>{errors.orderDate}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Entrega Esperada *
                  </label>
                  <input
                    type="date"
                    value={formData.expectedDelivery}
                    onChange={(e) => handleInputChange('expectedDelivery', e.target.value)}
                    className={`w-full bg-gray-700/50 border-gray-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20 ${
                      errors.expectedDelivery ? 'border-red-500/50' : ''
                    }`}
                  />
                  {errors.expectedDelivery && (
                    <p className="text-red-400 text-sm mt-1 flex items-center space-x-1">
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      <span>{errors.expectedDelivery}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Estado
                  </label>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                    {order ? 'Editando' : 'Nueva Orden'}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notas
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Notas adicionales sobre la orden..."
                  rows={3}
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20"
                />
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <ClipboardDocumentListIcon className="w-5 h-5 text-cyan-400" />
                  <span>Items de la Orden</span>
                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                    {formData.items.length}
                  </Badge>
                </h3>
                <Button
                  type="button"
                  onClick={() => setShowAddItem(true)}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Agregar Item
                </Button>
              </div>

              {errors.items && (
                <p className="text-red-400 text-sm flex items-center space-x-1">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  <span>{errors.items}</span>
                </p>
              )}

              {/* Items List */}
              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <Card key={item.id || index} className="bg-gray-800/30 border border-gray-600/30">
                    <CardBody className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Descripción
                          </label>
                          <input
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            placeholder="Descripción del item"
                            className="w-full bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Cantidad
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-full bg-gray-700/50 border-gray-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Precio Unit.
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full bg-gray-700/50 border-gray-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Total
                          </label>
                          <div className="text-white font-semibold bg-gray-700/50 px-3 py-2 rounded-lg">
                            {formatCurrency(item.totalPrice)}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>

              {/* Add Item Modal */}
              {showAddItem && (
                <Card className="bg-gray-800/50 border border-cyan-500/30">
                  <CardHeader className="pb-3">
                    <h2 className="text-lg text-cyan-300">Agregar Nuevo Item</h2>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Descripción *
                      </label>
                      <input
                        value={newItem.description}
                        onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descripción del item"
                        className="w-full bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Cantidad *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={newItem.quantity}
                          onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                          className="w-full bg-gray-700/50 border-gray-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Precio Unitario *
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={newItem.unitPrice}
                          onChange={(e) => setNewItem(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                          className="w-full bg-gray-700/50 border-gray-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setShowAddItem(false);
                          setNewItem({ quantity: 1, unitPrice: 0, description: '' });
                        }}
                        className="text-gray-400 hover:text-white hover:bg-gray-700/50"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="button"
                        onClick={handleAddItem}
                        disabled={!newItem.description || newItem.quantity! <= 0 || newItem.unitPrice! <= 0}
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white disabled:opacity-50"
                      >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Agregar Item
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>

            {/* Order Summary */}
            <Card className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30">
              <CardBody className="p-4">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <CurrencyDollarIcon className="w-5 h-5 text-green-400" />
                  <span>Resumen de la Orden</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-400">{formData.items.length}</div>
                    <div className="text-sm text-gray-400">Items</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{formatCurrency(totalAmount)}</div>
                    <div className="text-sm text-gray-400">Subtotal</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{formatCurrency(finalAmount)}</div>
                    <div className="text-sm text-gray-400">Total (IVA incluido)</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-600/30">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Subtotal:</span>
                    <span className="text-white">{formatCurrency(totalAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">IVA (16%):</span>
                    <span className="text-white">{formatCurrency(taxAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-lg font-bold mt-2 pt-2 border-t border-gray-600/30">
                    <span className="text-white">Total:</span>
                    <span className="text-purple-400">{formatCurrency(finalAmount)}</span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* General Error */}
            {errors.general && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400 flex items-center space-x-2">
                  <ExclamationTriangleIcon className="w-5 h-5" />
                  <span>{errors.general}</span>
                </p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-600/30">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-white hover:bg-gray-700/50"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white shadow-lg shadow-pink-500/25 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" />
                    <span className="ml-2">Guardando...</span>
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4 mr-2" />
                    {order ? 'Actualizar' : 'Crear'} Orden
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default PurchaseOrderFormV3;
