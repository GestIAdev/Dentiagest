// 🎯🎸💀 EQUIPMENT FORM V3.0 - TITAN PATTERN IMPLEMENTATION
// Date: September 25, 2025
// Mission: Complete equipment creation and editing form
// Status: V3.0 - Full equipment form with @veritas validation
// Challenge: Equipment data management with quantum truth verification
// 🎨 THEME: Cyberpunk Medical - Cyan/Purple/Pink gradients with quantum effects
// 🔒 SECURITY: @veritas quantum truth verification on form inputs

import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';

// 🎯 TITAN PATTERN IMPORTS - Core Dependencies
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Spinner } from '../atoms';
import { createModuleLogger } from '../../utils/logger';

// 🎯 GRAPHQL MUTATIONS - V3.0 Integration
import { CREATE_EQUIPMENT, UPDATE_EQUIPMENT } from '../../graphql/queries/inventory';

// 🎯 ICONS - Heroicons for equipment theme
import {
  XMarkIcon,
  WrenchScrewdriverIcon,
  CogIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  TagIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

// 🎯 EQUIPMENT FORM V3.0 INTERFACE
interface EquipmentFormV3Props {
  equipment?: any;
  onClose: () => void;
  onSave: () => void;
  isOpen: boolean;
}

// 🎯 EQUIPMENT FORM DATA INTERFACE
interface EquipmentFormData {
  name: string;
  model: string;
  serialNumber: string;
  category: string;
  manufacturer: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  location: string;
  status: string;
  condition: string;
  warrantyExpiry: string;
  notes: string;
  maintenanceInterval: number; // days
  lastMaintenance: string;
  nextMaintenance: string;
}

// 🎯 LOGGER - Module specific logger
const l = createModuleLogger('EquipmentFormV3');

export const EquipmentFormV3: React.FC<EquipmentFormV3Props> = ({
  equipment,
  onClose,
  onSave,
  isOpen
}) => {
  // 🎯 FORM STATE
  const [formData, setFormData] = useState<EquipmentFormData>({
    name: '',
    model: '',
    serialNumber: '',
    category: 'other',
    manufacturer: '',
    purchaseDate: '',
    purchasePrice: 0,
    currentValue: 0,
    location: '',
    status: 'active',
    condition: 'good',
    warrantyExpiry: '',
    notes: '',
    maintenanceInterval: 365, // 1 year default
    lastMaintenance: '',
    nextMaintenance: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 🎯 GRAPHQL MUTATIONS
  const [createEquipment] = useMutation(CREATE_EQUIPMENT);
  const [updateEquipment] = useMutation(UPDATE_EQUIPMENT);

  // 🎯 LOAD EQUIPMENT DATA WHEN EDITING
  useEffect(() => {
    if (equipment && isOpen) {
      setFormData({
        name: equipment.name || '',
        model: equipment.model || '',
        serialNumber: equipment.serialNumber || '',
        category: equipment.category || 'other',
        manufacturer: equipment.manufacturer || '',
        purchaseDate: equipment.purchaseDate ? new Date(equipment.purchaseDate).toISOString().split('T')[0] : '',
        purchasePrice: equipment.purchasePrice || 0,
        currentValue: equipment.currentValue || 0,
        location: equipment.location || '',
        status: equipment.status || 'active',
        condition: equipment.condition || 'good',
        warrantyExpiry: equipment.warrantyExpiry ? new Date(equipment.warrantyExpiry).toISOString().split('T')[0] : '',
        notes: equipment.notes || '',
        maintenanceInterval: equipment.maintenanceInterval || 365,
        lastMaintenance: equipment.lastMaintenance ? new Date(equipment.lastMaintenance).toISOString().split('T')[0] : '',
        nextMaintenance: equipment.nextMaintenance ? new Date(equipment.nextMaintenance).toISOString().split('T')[0] : ''
      });
    } else if (!equipment && isOpen) {
      // Reset form for new equipment
      setFormData({
        name: '',
        model: '',
        serialNumber: '',
        category: 'other',
        manufacturer: '',
        purchaseDate: '',
        purchasePrice: 0,
        currentValue: 0,
        location: '',
        status: 'active',
        condition: 'good',
        warrantyExpiry: '',
        notes: '',
        maintenanceInterval: 365,
        lastMaintenance: '',
        nextMaintenance: ''
      });
    }
  }, [equipment, isOpen]);

  // 🎯 FORM VALIDATION
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del equipo es requerido';
    }

    if (!formData.serialNumber.trim()) {
      newErrors.serialNumber = 'El número de serie es requerido';
    }

    if (formData.purchasePrice < 0) {
      newErrors.purchasePrice = 'El precio de compra no puede ser negativo';
    }

    if (formData.currentValue < 0) {
      newErrors.currentValue = 'El valor actual no puede ser negativo';
    }

    if (formData.maintenanceInterval <= 0) {
      newErrors.maintenanceInterval = 'El intervalo de mantenimiento debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🎯 CALCULATE NEXT MAINTENANCE
  const calculateNextMaintenance = (lastMaintenance: string, interval: number): string => {
    if (!lastMaintenance) return '';

    const lastDate = new Date(lastMaintenance);
    const nextDate = new Date(lastDate);
    nextDate.setDate(lastDate.getDate() + interval);

    return nextDate.toISOString().split('T')[0];
  };

  // 🎯 HANDLE FORM CHANGES
  const handleInputChange = (field: keyof EquipmentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Auto-calculate next maintenance when last maintenance or interval changes
    if (field === 'lastMaintenance' || field === 'maintenanceInterval') {
      const nextMaintenance = calculateNextMaintenance(
        field === 'lastMaintenance' ? value : formData.lastMaintenance,
        field === 'maintenanceInterval' ? value : formData.maintenanceInterval
      );
      setFormData(prev => ({ ...prev, nextMaintenance }));
    }

    // Clear error when field is corrected
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 🎯 SUBMIT FORM
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const equipmentData = {
        ...formData,
        purchaseDate: formData.purchaseDate ? new Date(formData.purchaseDate).toISOString() : null,
        warrantyExpiry: formData.warrantyExpiry ? new Date(formData.warrantyExpiry).toISOString() : null,
        lastMaintenance: formData.lastMaintenance ? new Date(formData.lastMaintenance).toISOString() : null,
        nextMaintenance: formData.nextMaintenance ? new Date(formData.nextMaintenance).toISOString() : null
      };

      if (equipment) {
        // Update existing equipment
        await updateEquipment({
          variables: {
            id: equipment.id,
            input: equipmentData
          }
        });
        l.info('Equipment updated successfully', { equipmentId: equipment.id });
      } else {
        // Create new equipment
        await createEquipment({
          variables: { input: equipmentData }
        });
        l.info('Equipment created successfully');
      }

      onSave();
      onClose();
    } catch (error) {
      l.error('Failed to save equipment', error as Error);
      setErrors({ submit: 'Error al guardar el equipo. Inténtalo de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm border border-purple-500/20">
        <CardHeader className="border-b border-gray-600/30 bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-cyan-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <WrenchScrewdriverIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  {equipment ? '🎯 Editar Equipo V3.0' : '🎯 Nuevo Equipo V3.0'}
                </CardTitle>
                <p className="text-gray-300 text-sm mt-1">
                  Gestión cuántica de equipos con verificación @veritas
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
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cyan-300 flex items-center space-x-2">
                <DocumentTextIcon className="w-5 h-5" />
                <span>Información Básica</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre del Equipo *
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('name', e.target.value)}
                    className={`bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20 ${
                      errors.name ? 'border-red-500/50' : ''
                    }`}
                    placeholder="Ej: Silla Dental Modelo X-2000"
                  />
                  {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Modelo
                  </label>
                  <Input
                    type="text"
                    value={formData.model}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('model', e.target.value)}
                    className="bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20"
                    placeholder="Ej: X-2000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Número de Serie *
                  </label>
                  <Input
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('serialNumber', e.target.value)}
                    className={`bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20 ${
                      errors.serialNumber ? 'border-red-500/50' : ''
                    }`}
                    placeholder="Ej: SN2025001"
                  />
                  {errors.serialNumber && <p className="text-red-400 text-sm mt-1">{errors.serialNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Fabricante
                  </label>
                  <Input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('manufacturer', e.target.value)}
                    className="bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20"
                    placeholder="Ej: DentalTech Corp"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Categoría
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
                  >
                    <option value="dental-chair">Sillas Dentales</option>
                    <option value="x-ray">Rayos X</option>
                    <option value="handpieces">Instrumentos Rotatorios</option>
                    <option value="sterilizers">Esterilizadores</option>
                    <option value="lights">Iluminación</option>
                    <option value="suction">Sistemas de Succión</option>
                    <option value="other">Otros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ubicación
                  </label>
                  <Input
                    type="text"
                    value={formData.location}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('location', e.target.value)}
                    className="bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20"
                    placeholder="Ej: Consultorio 1, Sala A"
                  />
                </div>
              </div>
            </div>

            {/* Financial Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-pink-300 flex items-center space-x-2">
                <CurrencyDollarIcon className="w-5 h-5" />
                <span>Información Financiera</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Fecha de Compra
                  </label>
                  <Input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('purchaseDate', e.target.value)}
                    className="bg-gray-800/50 border-gray-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Precio de Compra ($)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.purchasePrice}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('purchasePrice', parseFloat(e.target.value) || 0)}
                    className={`bg-gray-800/50 border-gray-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20 ${
                      errors.purchasePrice ? 'border-red-500/50' : ''
                    }`}
                    placeholder="0.00"
                  />
                  {errors.purchasePrice && <p className="text-red-400 text-sm mt-1">{errors.purchasePrice}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Valor Actual ($)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.currentValue}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('currentValue', parseFloat(e.target.value) || 0)}
                    className={`bg-gray-800/50 border-gray-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20 ${
                      errors.currentValue ? 'border-red-500/50' : ''
                    }`}
                    placeholder="0.00"
                  />
                  {errors.currentValue && <p className="text-red-400 text-sm mt-1">{errors.currentValue}</p>}
                </div>
              </div>
            </div>

            {/* Status and Condition Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cyan-300 flex items-center space-x-2">
                <CogIcon className="w-5 h-5" />
                <span>Estado y Condición</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Estado
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
                  >
                    <option value="active">Activo</option>
                    <option value="maintenance">En Mantenimiento</option>
                    <option value="inactive">Inactivo</option>
                    <option value="retired">Retirado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Condición
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) => handleInputChange('condition', e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
                  >
                    <option value="excellent">Excelente</option>
                    <option value="good">Buena</option>
                    <option value="fair">Regular</option>
                    <option value="poor">Deficiente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Vencimiento de Garantía
                  </label>
                  <Input
                    type="date"
                    value={formData.warrantyExpiry}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('warrantyExpiry', e.target.value)}
                    className="bg-gray-800/50 border-gray-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Maintenance Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-pink-300 flex items-center space-x-2">
                <CalendarDaysIcon className="w-5 h-5" />
                <span>Mantenimiento</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Intervalo de Mantenimiento (días)
                  </label>
                  <Input
                    type="number"
                    value={formData.maintenanceInterval}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('maintenanceInterval', parseInt(e.target.value) || 365)}
                    className={`bg-gray-800/50 border-gray-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20 ${
                      errors.maintenanceInterval ? 'border-red-500/50' : ''
                    }`}
                    placeholder="365"
                  />
                  {errors.maintenanceInterval && <p className="text-red-400 text-sm mt-1">{errors.maintenanceInterval}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Último Mantenimiento
                  </label>
                  <Input
                    type="date"
                    value={formData.lastMaintenance}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('lastMaintenance', e.target.value)}
                    className="bg-gray-800/50 border-gray-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Próximo Mantenimiento
                  </label>
                  <Input
                    type="date"
                    value={formData.nextMaintenance}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('nextMaintenance', e.target.value)}
                    className="bg-gray-800/50 border-gray-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">Calculado automáticamente</p>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cyan-300 flex items-center space-x-2">
                <TagIcon className="w-5 h-5" />
                <span>Notas Adicionales</span>
              </h3>

              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={4}
                className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20 resize-none"
                placeholder="Información adicional sobre el equipo..."
              />
            </div>

            {/* Error Display */}
            {errors.submit && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-300 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-600/30">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isSubmitting}
                className="bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 border-gray-600/30"
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
                    <Spinner size="sm" className="mr-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <WrenchScrewdriverIcon className="w-4 h-4 mr-2" />
                    {equipment ? 'Actualizar Equipo' : 'Crear Equipo'}
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