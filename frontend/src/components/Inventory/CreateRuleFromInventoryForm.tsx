import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ReorderTrigger, APPROVAL_WORKFLOW_LABELS, REORDER_TRIGGER_LABELS } from '../../types/autoOrder';
import { inventoryService } from '../../services/InventoryService';
import { useDocumentLogger } from '../../utils/documentLogger';

interface AutoOrderRuleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: AutoOrderRuleFormData) => void;
  material: {
    id: string;
    name: string;
    minimumStock: number;
    reorderPoint?: number;
    supplier?: {
      id: string;
      name: string;
    };
  };
  initialData?: Partial<AutoOrderRuleFormData>;
}

export interface AutoOrderRuleFormData {
  rule_name: string;
  description: string;
  trigger_type: ReorderTrigger;
  reorder_point?: number;
  usage_history_months?: number;
  reorder_interval_days?: number;
  preferred_supplier_id?: number;
  approval_workflow: 'none' | 'manager' | 'director';
  lead_time_days: number;
  is_active: boolean;
}

const AutoOrderRuleForm: React.FC<AutoOrderRuleFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  material,
  initialData
}) => {
  const [formData, setFormData] = useState<AutoOrderRuleFormData>({
    rule_name: `Auto-order: ${material.name}`,
    description: `Regla automática para ${material.name} - Cyberpunk Inventory Revolution`,
    trigger_type: 'stock_level',
    reorder_point: material.reorderPoint || Math.max(1, Math.floor(material.minimumStock * 0.8)),
    usage_history_months: 6,
    reorder_interval_days: 7,
    preferred_supplier_id: material.supplier ? parseInt(material.supplier.id.replace('sup-', '')) || undefined : undefined,
    approval_workflow: 'none',
    lead_time_days: 3,
    is_active: true,
    ...initialData
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AutoOrderRuleFormData, string>>>({});
  const [suppliers, setSuppliers] = useState<Array<{id: string, name: string}>>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const logger = useDocumentLogger('CreateRuleFromInventoryForm');



  

  const fetchSuppliers = useCallback(async () => {
    try {
      setLoadingSuppliers(true);
      const suppliersData = await inventoryService.getSuppliers();
      setSuppliers(suppliersData.map(supplier => ({
        id: supplier.id.toString(),
        name: supplier.name
      })));
    } catch (error) {
      // Use DocumentLogger to record supplier fetch errors
      logger.logError(error as Error, { context: 'fetchSuppliers' });
      // Fallback to empty array
      setSuppliers([]);
    } finally {
      setLoadingSuppliers(false);
    }
  }, [logger]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        rule_name: `Auto-order: ${material.name}`,
        description: `Regla automática para ${material.name} - Cyberpunk Inventory Revolution`,
        trigger_type: 'stock_level',
        reorder_point: material.reorderPoint || Math.max(1, Math.floor(material.minimumStock * 0.8)),
        usage_history_months: 6,
        reorder_interval_days: 7,
        preferred_supplier_id: undefined, // Let user select from dropdown
        approval_workflow: 'none',
        lead_time_days: 3,
        is_active: true,
        ...initialData
      });
      setErrors({});

      // Fetch suppliers
      fetchSuppliers();
    }
  }, [isOpen, material, initialData, fetchSuppliers]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AutoOrderRuleFormData, string>> = {};

    if (!formData.rule_name.trim()) {
      newErrors.rule_name = 'El nombre de la regla es requerido';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (formData.trigger_type === 'stock_level' && (!formData.reorder_point || formData.reorder_point <= 0)) {
      newErrors.reorder_point = 'El punto de reorden debe ser mayor a 0';
    }

    if (formData.trigger_type === 'usage_rate' && (!formData.usage_history_months || formData.usage_history_months <= 0)) {
      newErrors.usage_history_months = 'Los meses de historial deben ser mayor a 0';
    }

    if (formData.trigger_type === 'time_based' && (!formData.reorder_interval_days || formData.reorder_interval_days <= 0)) {
      newErrors.reorder_interval_days = 'Los días de intervalo deben ser mayor a 0';
    }

    if (formData.trigger_type === 'demand_forecast' && (!formData.usage_history_months || formData.usage_history_months <= 0)) {
      newErrors.usage_history_months = 'Los meses de historial deben ser mayor a 0';
    }

    if (formData.lead_time_days <= 0) {
      newErrors.lead_time_days = 'Los días de lead time deben ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  const handleTriggerTypeChange = (triggerType: ReorderTrigger) => {
    setFormData(prev => ({
      ...prev,
      trigger_type: triggerType,
      // Reset conditional fields when changing trigger type
      reorder_point: triggerType === 'stock_level' ? prev.reorder_point : undefined,
      usage_history_months: (triggerType === 'usage_rate' || triggerType === 'demand_forecast') ? prev.usage_history_months : undefined,
      reorder_interval_days: triggerType === 'time_based' ? prev.reorder_interval_days : undefined
    }));
  };

  const renderConditionalFields = () => {
    switch (formData.trigger_type) {
      case 'stock_level':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Punto de Reorden *
            </label>
            <input
              type="number"
              value={formData.reorder_point || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, reorder_point: parseInt(e.target.value) || 0 }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.reorder_point ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: 10"
              min="1"
            />
            {errors.reorder_point && (
              <p className="mt-1 text-sm text-red-600">{errors.reorder_point}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Cantidad mínima antes de generar un pedido automático
            </p>
          </div>
        );

      case 'usage_rate':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meses de Historial de Uso *
            </label>
            <input
              type="number"
              value={formData.usage_history_months || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, usage_history_months: parseInt(e.target.value) || 0 }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.usage_history_months ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: 6"
              min="1"
              max="24"
            />
            {errors.usage_history_months && (
              <p className="mt-1 text-sm text-red-600">{errors.usage_history_months}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Meses de datos históricos para calcular la tasa de uso promedio
            </p>
          </div>
        );

      case 'time_based':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Intervalo de Reorden (días) *
            </label>
            <input
              type="number"
              value={formData.reorder_interval_days || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, reorder_interval_days: parseInt(e.target.value) || 0 }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.reorder_interval_days ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: 30"
              min="1"
            />
            {errors.reorder_interval_days && (
              <p className="mt-1 text-sm text-red-600">{errors.reorder_interval_days}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Frecuencia en días para generar pedidos automáticos
            </p>
          </div>
        );

      case 'demand_forecast':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meses de Historial para Forecasting *
            </label>
            <input
              type="number"
              value={formData.usage_history_months || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, usage_history_months: parseInt(e.target.value) || 0 }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.usage_history_months ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: 12"
              min="3"
              max="36"
            />
            {errors.usage_history_months && (
              <p className="mt-1 text-sm text-red-600">{errors.usage_history_months}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Meses de datos históricos para predicción de demanda con IA
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    🤖 Crear Regla de Auto-Order
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-600"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Material Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Material</h4>
                    <p className="text-sm text-gray-900">{material.name}</p>
                    <p className="text-xs text-gray-500">Stock mínimo: {material.minimumStock}</p>
                  </div>

                  {/* Basic Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de la Regla *
                      </label>
                      <input
                        type="text"
                        value={formData.rule_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, rule_name: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          errors.rule_name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Ej: Auto-order Composite A2"
                      />
                      {errors.rule_name && (
                        <p className="mt-1 text-sm text-red-600">{errors.rule_name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Trigger *
                      </label>
                      <select
                        value={formData.trigger_type}
                        onChange={(e) => handleTriggerTypeChange(e.target.value as ReorderTrigger)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {Object.entries(REORDER_TRIGGER_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Describe el propósito de esta regla de auto-order"
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                  </div>

                  {/* Conditional Fields */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-700 mb-3">
                      Configuración Específica del Trigger
                    </h4>
                    {renderConditionalFields()}
                  </div>

                  {/* Advanced Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Proveedor Preferido
                      </label>
                      <select
                        value={formData.preferred_supplier_id || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, preferred_supplier_id: e.target.value ? parseInt(e.target.value) : undefined }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        disabled={loadingSuppliers}
                      >
                        <option value="">Seleccionar proveedor...</option>
                        {suppliers.map(supplier => (
                          <option key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </option>
                        ))}
                      </select>
                      {loadingSuppliers && (
                        <p className="mt-1 text-xs text-gray-500">Cargando proveedores...</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Workflow de Aprobación
                      </label>
                      <select
                        value={formData.approval_workflow}
                        onChange={(e) => setFormData(prev => ({ ...prev, approval_workflow: e.target.value as 'none' | 'manager' | 'director' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {Object.entries(APPROVAL_WORKFLOW_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center">
                    <input
                      id="is_active"
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                      Activar regla inmediatamente
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-lg hover:bg-purple-700"
                    >
                      🤖 Crear Regla de Auto-Order
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AutoOrderRuleForm;
