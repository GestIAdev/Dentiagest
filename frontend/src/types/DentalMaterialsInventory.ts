// 🚀 APOLLO DENTAL MATERIALS INVENTORY MANAGEMENT
// By PunkClaude & RaulVisionario - September 19, 2025
// MISSION: Complete materials management with auto-ordering and traceability

export interface DentalMaterial {
  id: string;
  name: string;
  category: 'restorative' | 'orthodontic' | 'implant' | 'endodontic' | 'prosthetic' | 'hygiene' | 'consumable';
  description: string;
  sku: string;
  manufacturer: string;
  batchNumber: string;
  expirationDate: Date;
  unitCost: number;
  unitPrice: number;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  location: string; // Warehouse location
  supplier: SupplierInfo;
  usageHistory: MaterialUsage[];
  qualityControl: QualityControlRecord[];
  complianceStatus: 'compliant' | 'expired' | 'recall' | 'pending_verification';
  lastInventoryCheck: Date;
  autoReorderEnabled: boolean;
  reorderPoint: number;
  reorderQuantity: number;
}

export interface SupplierInfo {
  id: string;
  name: string;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  reliabilityScore: number; // 0-100
  averageDeliveryTime: number; // days
  contractTerms: string;
  preferredSupplier: boolean;
}

export interface MaterialUsage {
  id: string;
  treatmentId: string;
  patientId: string;
  quantityUsed: number;
  dateUsed: Date;
  dentistId: string;
  notes?: string;
  cost: number;
}

export interface QualityControlRecord {
  id: string;
  batchId: string;
  testDate: Date;
  testType: 'sterility' | 'chemical_composition' | 'physical_properties' | 'expiration_check';
  result: 'pass' | 'fail' | 'pending';
  testedBy: string;
  notes?: string;
  certificateUrl?: string;
}

export interface StockAlert {
  id: string;
  materialId: string;
  alertType: 'low_stock' | 'expired' | 'expiring_soon' | 'overstock' | 'quality_issue';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  createdAt: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  autoAction?: AutoAction;
}

export interface AutoAction {
  type: 'reorder' | 'alert_supervisor' | 'quarantine' | 'dispose';
  triggered: boolean;
  triggeredAt?: Date;
  orderId?: string;
}

export interface AutoOrderSystem {
  enabled: boolean;
  reorderRules: ReorderRule[];
  supplierPreferences: SupplierPreference[];
  budgetLimits: BudgetLimit[];
  approvalWorkflow: ApprovalWorkflow;
}

export interface ReorderRule {
  id: string;
  materialId: string;
  triggerCondition: 'stock_below_minimum' | 'usage_pattern' | 'expiration_approaching';
  reorderQuantity: number;
  priority: 'low' | 'medium' | 'high';
  autoApprove: boolean;
  maxApprovalAmount: number;
}

export interface SupplierPreference {
  supplierId: string;
  materialCategories: string[];
  priority: number; // 1-10
  discountRate: number;
  reliabilityBonus: number;
}

export interface BudgetLimit {
  category: string;
  monthlyLimit: number;
  currentSpent: number;
  alertThreshold: number; // percentage
}

export interface ApprovalWorkflow {
  requiredApprovers: string[];
  approvalLevels: ApprovalLevel[];
  emergencyOverride: boolean;
}

export interface ApprovalLevel {
  level: number;
  approverRole: string;
  maxAmount: number;
  requiresJustification: boolean;
}

export interface MaterialTrace {
  id: string;
  materialId: string;
  batchId: string;
  supplierId: string;
  receivedDate: Date;
  receivedBy: string;
  initialQuantity: number;
  currentQuantity: number;
  usageRecords: UsageRecord[];
  disposalRecords: DisposalRecord[];
  transferRecords: TransferRecord[];
}

export interface UsageRecord {
  id: string;
  treatmentId: string;
  patientId: string;
  quantity: number;
  date: Date;
  dentistId: string;
  cost: number;
}

export interface DisposalRecord {
  id: string;
  quantity: number;
  reason: 'expired' | 'damaged' | 'contamination' | 'quality_issue';
  date: Date;
  disposedBy: string;
  witness?: string;
  documentation?: string;
}

export interface TransferRecord {
  id: string;
  fromLocation: string;
  toLocation: string;
  quantity: number;
  date: Date;
  transferredBy: string;
  reason: string;
}

export interface DentalMaterialsInventory {
  // Gestión completa de materiales
  materials: DentalMaterial[];
  stockAlerts: StockAlert[];
  autoOrderSystem: AutoOrderSystem;
  calculateTreatmentMaterialCost(treatment: Treatment): number;
  materialTraceability: MaterialTrace[];

  // Core methods
  addMaterial(material: Omit<DentalMaterial, 'id'>): Promise<DentalMaterial>;
  updateMaterial(id: string, updates: Partial<DentalMaterial>): Promise<DentalMaterial>;
  removeMaterial(id: string): Promise<void>;
  getMaterialById(id: string): DentalMaterial | undefined;
  getMaterialsByCategory(category: string): DentalMaterial[];
  getLowStockMaterials(): DentalMaterial[];
  getExpiredMaterials(): DentalMaterial[];
  getExpiringSoonMaterials(days: number): DentalMaterial[];

  // Stock management
  updateStock(materialId: string, quantity: number, operation: 'add' | 'remove' | 'adjust'): Promise<void>;
  recordUsage(materialId: string, usage: Omit<MaterialUsage, 'id'>): Promise<void>;
  checkStockAlerts(): StockAlert[];

  // Auto-order system
  processAutoOrders(): Promise<void>;
  createPurchaseOrder(materialId: string, quantity: number): Promise<string>;
  approvePurchaseOrder(orderId: string, approverId: string): Promise<void>;

  // Traceability
  getMaterialTrace(materialId: string): MaterialTrace | undefined;
  recordDisposal(materialId: string, disposal: Omit<DisposalRecord, 'id'>): Promise<void>;
  transferMaterial(materialId: string, transfer: Omit<TransferRecord, 'id'>): Promise<void>;

  // Analytics
  getUsageAnalytics(materialId: string, period: { start: Date; end: Date }): UsageAnalytics;
  getInventoryValue(): InventoryValue;
  getSupplierPerformance(): SupplierPerformance[];
}

export interface UsageAnalytics {
  totalUsage: number;
  averageUsagePerDay: number;
  usageByTreatment: { [treatmentType: string]: number };
  costAnalysis: {
    totalCost: number;
    averageCostPerUnit: number;
    costTrend: number; // percentage change
  };
  peakUsageTimes: { hour: number; usage: number }[];
}

export interface InventoryValue {
  totalValue: number;
  byCategory: { [category: string]: number };
  expiredValue: number;
  lowStockValue: number;
}

export interface SupplierPerformance {
  supplierId: string;
  supplierName: string;
  onTimeDeliveryRate: number;
  qualityScore: number;
  averageCost: number;
  reliabilityScore: number;
}

// Treatment interface for cost calculation
export interface Treatment {
  id: string;
  type: string;
  materials: TreatmentMaterial[];
  estimatedDuration: number;
  complexity: 'simple' | 'moderate' | 'complex';
}

export interface TreatmentMaterial {
  materialId: string;
  quantity: number;
  alternativeMaterials?: string[]; // Alternative material IDs
}