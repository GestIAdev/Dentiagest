/**
 * 📦🛠️🎸💀 INVENTORY ITEM SHEET - HUB LOGÍSTICO V4
 * ===================================================
 * By PunkClaude & Radwulf - November 2025
 * 
 * AXIOMAS:
 * - NO MOCKS: Mutations reales conectadas
 * - PATTERN: Sheet lateral 800px + Grid 2 cols
 * - DUAL MODE: Toggle Material / Equipo
 * - SCHEMA MATCHED: DentalMaterialV3 + EquipmentV3
 * 
 * CLONADO DE: InvoiceFormSheet (estándar visual)
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
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
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import {
  GET_SUPPLIERS,
  CREATE_DENTAL_MATERIAL,
  UPDATE_DENTAL_MATERIAL,
  DELETE_DENTAL_MATERIAL,
  CREATE_EQUIPMENT,
  UPDATE_EQUIPMENT,
  DELETE_EQUIPMENT,
} from '../../graphql/queries/inventory';
import toast from 'react-hot-toast';
import {
  CubeIcon,
  WrenchScrewdriverIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  HashtagIcon,
  CalendarIcon,
  ShieldCheckIcon,
  BuildingStorefrontIcon,
  MapPinIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

// ============================================================================
// TYPES
// ============================================================================

type ItemType = 'material' | 'equipment';

interface DentalMaterial {
  id: string;
  name: string;
  description?: string;
  category?: string;
  sku?: string;
  currentStock: number;
  minimumStock: number;
  maximumStock?: number;
  unitPrice: number;
  supplierId?: string;
  supplierName?: string;
  expiryDate?: string;
  batchNumber?: string;
  location?: string;
  status?: string;
}

interface Equipment {
  id: string;
  name: string;
  description?: string;
  category?: string;
  serialNumber?: string;
  model?: string;
  manufacturer?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  location?: string;
  status?: string;
  condition?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  maintenanceInterval?: number;
  supplierId?: string;
  purchasePrice?: number;
  currentValue?: number;
  depreciationRate?: number;
}

interface Supplier {
  id: string;
  name: string;
}

interface InventoryItemSheetProps {
  item?: DentalMaterial | Equipment | null;
  itemType?: ItemType;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MATERIAL_CATEGORIES = [
  { value: 'RESTORATIVE', label: '💎 Restauradores' },
  { value: 'ENDODONTIC', label: '💉 Endodoncia' },
  { value: 'ORTHODONTIC', label: '🦷 Ortodoncia' },
  { value: 'PROSTHODONTIC', label: '👑 Prostodoncia' },
  { value: 'SURGICAL', label: '🔪 Cirugía' },
  { value: 'PREVENTIVE', label: '🪥 Prevención' },
  { value: 'ANESTHESIA', label: '💊 Anestesia' },
  { value: 'IMPRESSION', label: '📐 Impresión' },
  { value: 'CEMENT', label: '🧱 Cementos' },
  { value: 'ADHESIVE', label: '🔗 Adhesivos' },
  { value: 'CONSUMABLE', label: '📦 Consumibles' },
  { value: 'OTHER', label: '🏷️ Otros' },
];

const EQUIPMENT_CATEGORIES = [
  { value: 'DIAGNOSTIC', label: '🔬 Diagnóstico' },
  { value: 'SURGICAL', label: '🔪 Quirúrgico' },
  { value: 'STERILIZATION', label: '🧪 Esterilización' },
  { value: 'IMAGING', label: '📷 Imagen' },
  { value: 'DENTAL_UNIT', label: '🪥 Unidad Dental' },
  { value: 'LABORATORY', label: '🔬 Laboratorio' },
  { value: 'ANESTHESIA', label: '💊 Anestesia' },
  { value: 'LASER', label: '⚡ Láser' },
  { value: 'FURNITURE', label: '🪑 Mobiliario' },
  { value: 'IT_EQUIPMENT', label: '💻 Informática' },
  { value: 'OTHER', label: '🏷️ Otros' },
];

const ITEM_STATUS = [
  { value: 'ACTIVE', label: '🟢 Activo' },
  { value: 'INACTIVE', label: '⚫ Inactivo' },
  { value: 'DISCONTINUED', label: '🔴 Descontinuado' },
  { value: 'MAINTENANCE', label: '🔧 En Mantenimiento' },
  { value: 'OUT_OF_STOCK', label: '⚠️ Sin Stock' },
];

const EQUIPMENT_CONDITIONS = [
  { value: 'EXCELLENT', label: '⭐ Excelente' },
  { value: 'GOOD', label: '👍 Bueno' },
  { value: 'FAIR', label: '👌 Regular' },
  { value: 'NEEDS_REPAIR', label: '🔧 Necesita Reparación' },
  { value: 'POOR', label: '⚠️ Malo' },
];

const STORAGE_LOCATIONS = [
  { value: 'ALMACEN_PRINCIPAL', label: '📦 Almacén Principal' },
  { value: 'CONSULTORIO_1', label: '🏥 Consultorio 1' },
  { value: 'CONSULTORIO_2', label: '🏥 Consultorio 2' },
  { value: 'LABORATORIO', label: '🔬 Laboratorio' },
  { value: 'ESTERILIZACION', label: '🧪 Esterilización' },
  { value: 'RECEPCION', label: '🚪 Recepción' },
];

// ============================================================================
// COMPONENT
// ============================================================================

const InventoryItemSheet: React.FC<InventoryItemSheetProps> = ({
  item,
  itemType: initialType = 'material',
  isOpen,
  onClose,
  onSave,
}) => {
  const isEditing = !!item;
  
  // Determine item type from existing item or use initial
  const detectItemType = (item: DentalMaterial | Equipment | null | undefined): ItemType => {
    if (!item) return initialType;
    // Equipment has serialNumber, manufacturer, warrantyExpiry
    if ('serialNumber' in item || 'manufacturer' in item || 'warrantyExpiry' in item) {
      return 'equipment';
    }
    // Material has currentStock, minimumStock, batchNumber
    if ('currentStock' in item || 'batchNumber' in item) {
      return 'material';
    }
    return initialType;
  };

  const [activeType, setActiveType] = useState<ItemType>(detectItemType(item));
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ========================================================================
  // SHARED FORM STATE
  // ========================================================================
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [location, setLocation] = useState('');
  const [supplierId, setSupplierId] = useState('');

  // ========================================================================
  // MATERIAL-SPECIFIC STATE
  // ========================================================================
  const [sku, setSku] = useState('');
  const [currentStock, setCurrentStock] = useState(0);
  const [minimumStock, setMinimumStock] = useState(0);
  const [maximumStock, setMaximumStock] = useState(100);
  const [unitPrice, setUnitPrice] = useState(0);
  const [expiryDate, setExpiryDate] = useState('');
  const [batchNumber, setBatchNumber] = useState('');

  // ========================================================================
  // EQUIPMENT-SPECIFIC STATE
  // ========================================================================
  const [serialNumber, setSerialNumber] = useState('');
  const [model, setModel] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [warrantyExpiry, setWarrantyExpiry] = useState('');
  const [condition, setCondition] = useState('GOOD');
  const [lastMaintenance, setLastMaintenance] = useState('');
  const [nextMaintenance, setNextMaintenance] = useState('');
  const [maintenanceInterval, setMaintenanceInterval] = useState(90);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [currentValue, setCurrentValue] = useState(0);

  // ========================================================================
  // GRAPHQL
  // ========================================================================
  const { data: suppliersData } = useQuery(GET_SUPPLIERS, {
    variables: { limit: 100 },
    fetchPolicy: 'cache-and-network',
  });

  const suppliers: Supplier[] = (suppliersData as any)?.suppliersV3 || [];

  // Material Mutations
  const [createMaterial, { loading: creatingMaterial }] = useMutation(CREATE_DENTAL_MATERIAL, {
    onCompleted: () => {
      toast.success('📦 Material creado exitosamente');
      onSave();
      onClose();
    },
    onError: (error) => {
      toast.error(`Error al crear material: ${error.message}`);
    },
  });

  const [updateMaterial, { loading: updatingMaterial }] = useMutation(UPDATE_DENTAL_MATERIAL, {
    onCompleted: () => {
      toast.success('📦 Material actualizado exitosamente');
      onSave();
      onClose();
    },
    onError: (error) => {
      toast.error(`Error al actualizar material: ${error.message}`);
    },
  });

  const [deleteMaterial, { loading: deletingMaterial }] = useMutation(DELETE_DENTAL_MATERIAL, {
    onCompleted: () => {
      toast.success('🗑️ Material eliminado');
      onSave();
      onClose();
    },
    onError: (error) => {
      toast.error(`Error al eliminar material: ${error.message}`);
    },
  });

  // Equipment Mutations
  const [createEquipment, { loading: creatingEquipment }] = useMutation(CREATE_EQUIPMENT, {
    onCompleted: () => {
      toast.success('🛠️ Equipo creado exitosamente');
      onSave();
      onClose();
    },
    onError: (error) => {
      toast.error(`Error al crear equipo: ${error.message}`);
    },
  });

  const [updateEquipment, { loading: updatingEquipment }] = useMutation(UPDATE_EQUIPMENT, {
    onCompleted: () => {
      toast.success('🛠️ Equipo actualizado exitosamente');
      onSave();
      onClose();
    },
    onError: (error) => {
      toast.error(`Error al actualizar equipo: ${error.message}`);
    },
  });

  const [deleteEquipment, { loading: deletingEquipment }] = useMutation(DELETE_EQUIPMENT, {
    onCompleted: () => {
      toast.success('🗑️ Equipo eliminado');
      onSave();
      onClose();
    },
    onError: (error) => {
      toast.error(`Error al eliminar equipo: ${error.message}`);
    },
  });

  const isLoading = creatingMaterial || updatingMaterial || deletingMaterial ||
                    creatingEquipment || updatingEquipment || deletingEquipment;

  // ========================================================================
  // POPULATE FORM WHEN EDITING
  // ========================================================================
  useEffect(() => {
    if (item && isOpen) {
      const detectedType = detectItemType(item);
      setActiveType(detectedType);

      // Shared fields
      setName(item.name || '');
      setDescription(item.description || '');
      setCategory(item.category || '');
      setStatus(item.status || 'ACTIVE');
      setLocation(item.location || '');
      setSupplierId((item as any).supplierId || '');

      if (detectedType === 'material') {
        const mat = item as DentalMaterial;
        setSku(mat.sku || '');
        setCurrentStock(mat.currentStock || 0);
        setMinimumStock(mat.minimumStock || 0);
        setMaximumStock(mat.maximumStock || 100);
        setUnitPrice(mat.unitPrice || 0);
        setExpiryDate(mat.expiryDate ? mat.expiryDate.split('T')[0] : '');
        setBatchNumber(mat.batchNumber || '');
      } else {
        const equip = item as Equipment;
        setSerialNumber(equip.serialNumber || '');
        setModel(equip.model || '');
        setManufacturer(equip.manufacturer || '');
        setPurchaseDate(equip.purchaseDate ? equip.purchaseDate.split('T')[0] : '');
        setWarrantyExpiry(equip.warrantyExpiry ? equip.warrantyExpiry.split('T')[0] : '');
        setCondition(equip.condition || 'GOOD');
        setLastMaintenance(equip.lastMaintenance ? equip.lastMaintenance.split('T')[0] : '');
        setNextMaintenance(equip.nextMaintenance ? equip.nextMaintenance.split('T')[0] : '');
        setMaintenanceInterval(equip.maintenanceInterval || 90);
        setPurchasePrice(equip.purchasePrice || 0);
        setCurrentValue(equip.currentValue || 0);
      }
    } else if (!item && isOpen) {
      // Reset form for new item
      resetForm();
    }
  }, [item, isOpen]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setCategory('');
    setStatus('ACTIVE');
    setLocation('');
    setSupplierId('');
    // Material
    setSku('');
    setCurrentStock(0);
    setMinimumStock(0);
    setMaximumStock(100);
    setUnitPrice(0);
    setExpiryDate('');
    setBatchNumber('');
    // Equipment
    setSerialNumber('');
    setModel('');
    setManufacturer('');
    setPurchaseDate('');
    setWarrantyExpiry('');
    setCondition('GOOD');
    setLastMaintenance('');
    setNextMaintenance('');
    setMaintenanceInterval(90);
    setPurchasePrice(0);
    setCurrentValue(0);
    setShowDeleteConfirm(false);
  };

  // ========================================================================
  // HANDLERS
  // ========================================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    if (activeType === 'material') {
      const materialInput = {
        name: name.trim(),
        description: description.trim() || null,
        category: category || null,
        sku: sku.trim() || null,
        currentStock,
        minimumStock,
        maximumStock: maximumStock || null,
        unitPrice,
        supplierId: supplierId || null,
        expiryDate: expiryDate || null,
        batchNumber: batchNumber.trim() || null,
        location: location || null,
        status: status || 'ACTIVE',
      };

      if (isEditing && item) {
        await updateMaterial({
          variables: { id: item.id, input: materialInput },
        });
      } else {
        await createMaterial({
          variables: { input: materialInput },
        });
      }
    } else {
      const equipmentInput = {
        name: name.trim(),
        description: description.trim() || null,
        category: category || null,
        serialNumber: serialNumber.trim() || null,
        model: model.trim() || null,
        manufacturer: manufacturer.trim() || null,
        purchaseDate: purchaseDate || null,
        warrantyExpiry: warrantyExpiry || null,
        location: location || null,
        status: status || 'ACTIVE',
        condition: condition || 'GOOD',
        lastMaintenance: lastMaintenance || null,
        nextMaintenance: nextMaintenance || null,
        maintenanceInterval: maintenanceInterval || null,
        supplierId: supplierId || null,
        purchasePrice: purchasePrice || null,
        currentValue: currentValue || null,
      };

      if (isEditing && item) {
        await updateEquipment({
          variables: { id: item.id, input: equipmentInput },
        });
      } else {
        await createEquipment({
          variables: { input: equipmentInput },
        });
      }
    }
  };

  const handleDelete = async () => {
    if (!item) return;

    if (activeType === 'material') {
      await deleteMaterial({ variables: { id: item.id } });
    } else {
      await deleteEquipment({ variables: { id: item.id } });
    }
  };

  // ========================================================================
  // RENDER
  // ========================================================================
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[800px] bg-slate-900 border-l border-white/10 overflow-y-auto"
      >
        <SheetHeader className="space-y-1 pb-4 border-b border-slate-700/50">
          <SheetTitle className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 flex items-center gap-2">
            {activeType === 'material' ? (
              <CubeIcon className="h-6 w-6 text-cyan-400" />
            ) : (
              <WrenchScrewdriverIcon className="h-6 w-6 text-purple-400" />
            )}
            {isEditing ? 'Editar' : 'Nuevo'} {activeType === 'material' ? 'Material' : 'Equipo'}
          </SheetTitle>
          <SheetDescription className="text-slate-500">
            {isEditing
              ? `Editando: ${item?.name}`
              : `Registra un nuevo ${activeType === 'material' ? 'material dental' : 'equipo'} en el inventario`}
          </SheetDescription>
        </SheetHeader>

        {/* ================================================================ */}
        {/* TYPE TOGGLE - MATERIAL / EQUIPO */}
        {/* ================================================================ */}
        {!isEditing && (
          <div className="py-4 border-b border-slate-700/50">
            <Tabs value={activeType} onValueChange={(v) => setActiveType(v as ItemType)}>
              <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
                <TabsTrigger
                  value="material"
                  className="flex items-center gap-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300"
                >
                  <CubeIcon className="h-4 w-4" />
                  📦 Material
                </TabsTrigger>
                <TabsTrigger
                  value="equipment"
                  className="flex items-center gap-2 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
                >
                  <WrenchScrewdriverIcon className="h-4 w-4" />
                  🛠️ Equipo
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}

        <form onSubmit={handleSubmit} className="py-6">
          {/* ============================================================== */}
          {/* GRID DE 2 COLUMNAS - ESTÁNDAR V4 */}
          {/* ============================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* ============================================================ */}
            {/* COLUMNA IZQUIERDA */}
            {/* ============================================================ */}
            <div className="space-y-4">

              {/* NOMBRE */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  {activeType === 'material' ? (
                    <CubeIcon className="h-4 w-4 text-cyan-400" />
                  ) : (
                    <WrenchScrewdriverIcon className="h-4 w-4 text-purple-400" />
                  )}
                  Nombre *
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={activeType === 'material' ? 'Ej: Composite A2' : 'Ej: Autoclave Clase B'}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500/50"
                  required
                />
              </div>

              {/* DESCRIPCIÓN */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">Descripción</Label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción detallada..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none"
                />
              </div>

              {/* CATEGORÍA */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">Categoría</Label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="">Seleccionar categoría</option>
                  {(activeType === 'material' ? MATERIAL_CATEGORIES : EQUIPMENT_CATEGORIES).map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* PROVEEDOR */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <BuildingStorefrontIcon className="h-4 w-4 text-emerald-400" />
                  Proveedor
                </Label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="">Sin proveedor asignado</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* UBICACIÓN */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <MapPinIcon className="h-4 w-4 text-amber-400" />
                  Ubicación
                </Label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="">Sin ubicación</option>
                  {STORAGE_LOCATIONS.map((loc) => (
                    <option key={loc.value} value={loc.value}>
                      {loc.label}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* ============================================================ */}
            {/* COLUMNA DERECHA */}
            {/* ============================================================ */}
            <div className="space-y-4">

              {/* ========== MATERIAL SPECIFIC FIELDS ========== */}
              {activeType === 'material' && (
                <>
                  {/* SKU */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                      <HashtagIcon className="h-4 w-4 text-slate-400" />
                      SKU / Código
                    </Label>
                    <Input
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="Ej: MAT-001"
                      className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500/50"
                    />
                  </div>

                  {/* STOCK LEVELS */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-300">Stock Actual</Label>
                      <Input
                        type="number"
                        value={currentStock}
                        onChange={(e) => setCurrentStock(parseInt(e.target.value) || 0)}
                        min={0}
                        className="bg-slate-800/50 border-slate-700 text-white focus:border-cyan-500/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-300">Stock Mín.</Label>
                      <Input
                        type="number"
                        value={minimumStock}
                        onChange={(e) => setMinimumStock(parseInt(e.target.value) || 0)}
                        min={0}
                        className="bg-slate-800/50 border-slate-700 text-white focus:border-cyan-500/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-300">Stock Máx.</Label>
                      <Input
                        type="number"
                        value={maximumStock}
                        onChange={(e) => setMaximumStock(parseInt(e.target.value) || 0)}
                        min={0}
                        className="bg-slate-800/50 border-slate-700 text-white focus:border-cyan-500/50"
                      />
                    </div>
                  </div>

                  {/* PRECIO UNITARIO */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                      <CurrencyDollarIcon className="h-4 w-4 text-green-400" />
                      Precio Unitario (€)
                    </Label>
                    <Input
                      type="number"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                      min={0}
                      step={0.01}
                      className="bg-slate-800/50 border-slate-700 text-white focus:border-cyan-500/50"
                    />
                  </div>

                  {/* LOTE Y CADUCIDAD */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-300">Nº Lote</Label>
                      <Input
                        value={batchNumber}
                        onChange={(e) => setBatchNumber(e.target.value)}
                        placeholder="Ej: LOT-2025-001"
                        className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                        <CalendarIcon className="h-4 w-4 text-red-400" />
                        Caducidad
                      </Label>
                      <Input
                        type="date"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="bg-slate-800/50 border-slate-700 text-white focus:border-cyan-500/50"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* ========== EQUIPMENT SPECIFIC FIELDS ========== */}
              {activeType === 'equipment' && (
                <>
                  {/* Nº SERIE */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                      <HashtagIcon className="h-4 w-4 text-purple-400" />
                      Nº Serie *
                    </Label>
                    <Input
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      placeholder="Ej: SN-2025-001234"
                      className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500/50"
                    />
                  </div>

                  {/* MARCA Y MODELO */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-300">Fabricante</Label>
                      <Input
                        value={manufacturer}
                        onChange={(e) => setManufacturer(e.target.value)}
                        placeholder="Ej: KaVo, Sirona..."
                        className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-300">Modelo</Label>
                      <Input
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        placeholder="Ej: X-Pro 3000"
                        className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500/50"
                      />
                    </div>
                  </div>

                  {/* FECHAS COMPRA Y GARANTÍA */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                        <CalendarIcon className="h-4 w-4 text-blue-400" />
                        Fecha Compra
                      </Label>
                      <Input
                        type="date"
                        value={purchaseDate}
                        onChange={(e) => setPurchaseDate(e.target.value)}
                        className="bg-slate-800/50 border-slate-700 text-white focus:border-cyan-500/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                        <ShieldCheckIcon className="h-4 w-4 text-green-400" />
                        Garantía hasta
                      </Label>
                      <Input
                        type="date"
                        value={warrantyExpiry}
                        onChange={(e) => setWarrantyExpiry(e.target.value)}
                        className="bg-slate-800/50 border-slate-700 text-white focus:border-cyan-500/50"
                      />
                    </div>
                  </div>

                  {/* PRECIOS */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                        <CurrencyDollarIcon className="h-4 w-4 text-green-400" />
                        Precio Compra (€)
                      </Label>
                      <Input
                        type="number"
                        value={purchasePrice}
                        onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                        min={0}
                        step={0.01}
                        className="bg-slate-800/50 border-slate-700 text-white focus:border-cyan-500/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-300">Valor Actual (€)</Label>
                      <Input
                        type="number"
                        value={currentValue}
                        onChange={(e) => setCurrentValue(parseFloat(e.target.value) || 0)}
                        min={0}
                        step={0.01}
                        className="bg-slate-800/50 border-slate-700 text-white focus:border-cyan-500/50"
                      />
                    </div>
                  </div>

                  {/* CONDICIÓN */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-300">Condición</Label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
                    >
                      {EQUIPMENT_CONDITIONS.map((cond) => (
                        <option key={cond.value} value={cond.value}>
                          {cond.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* MANTENIMIENTO */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-300">Último Mtto.</Label>
                      <Input
                        type="date"
                        value={lastMaintenance}
                        onChange={(e) => setLastMaintenance(e.target.value)}
                        className="bg-slate-800/50 border-slate-700 text-white focus:border-cyan-500/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-300">Próximo Mtto.</Label>
                      <Input
                        type="date"
                        value={nextMaintenance}
                        onChange={(e) => setNextMaintenance(e.target.value)}
                        className="bg-slate-800/50 border-slate-700 text-white focus:border-cyan-500/50"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* STATUS - SHARED */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">Estado</Label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
                >
                  {ITEM_STATUS.map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* ============================================================== */}
          {/* FOOTER - ACTIONS */}
          {/* ============================================================== */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-700/50">
            {/* DELETE BUTTON (EDIT MODE) */}
            {isEditing && (
              <div>
                {showDeleteConfirm ? (
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 text-sm flex items-center gap-1">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      ¿Confirmar eliminación?
                    </span>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      disabled={isLoading}
                      className="bg-red-600 hover:bg-red-500"
                    >
                      Sí, eliminar
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="text-slate-400"
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                )}
              </div>
            )}

            {/* SPACER IF NO DELETE */}
            {!isEditing && <div />}

            {/* SAVE BUTTONS */}
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="text-slate-400 hover:text-white"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !name.trim()}
                className={`${
                  activeType === 'material'
                    ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400'
                    : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400'
                } text-white font-medium shadow-lg`}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Guardando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {activeType === 'material' ? (
                      <CubeIcon className="h-4 w-4" />
                    ) : (
                      <WrenchScrewdriverIcon className="h-4 w-4" />
                    )}
                    {isEditing ? 'Actualizar' : 'Crear'} {activeType === 'material' ? 'Material' : 'Equipo'}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default InventoryItemSheet;
