// 🎸 PUNKCLAUD AUTO-ORDER SYSTEM: TypeScript Types
// Cyberpunk Inventory Revolution
// Date: September 20, 2025

type ConditionValue = string | number | boolean;

interface ActionParams {
  order: { productId: string; quantity: number };
  alert: { message: string; priority: 'low' | 'high' };
  email: { recipient: string; subject: string };
}

export const CONDITION_OPERATORS = {
  equals: 'equals',
  greater: 'greater', 
  less: 'less'
} as const satisfies Record<string, string>;

export const ACTION_TYPES = {
  order: 'order',
  alert: 'alert',
  email: 'email'
} as const satisfies Record<string, string>;

export type ReorderTrigger = 'stock_level' | 'usage_rate' | 'time_based' | 'demand_forecast';

export type ApprovalWorkflow = 'none' | 'manager' | 'budget_holder' | 'multi_level';

export interface AutoOrderRule {
  id: number;
  material_id: number;
  is_active: boolean;
  rule_name: string;
  description?: string;
  trigger_type: ReorderTrigger;
  reorder_point?: number;
  reorder_quantity?: number;
  safety_stock?: number;
  preferred_supplier_id?: number;
  backup_supplier_id?: number;
  max_order_quantity?: number;
  min_order_quantity?: number;
  budget_limit?: number;
  approval_workflow: ApprovalWorkflow;
  approver_user_id?: string;
  lead_time_days: number;
  usage_history_months: number;
  auto_approval_threshold?: number;
  created_by?: string;
  last_triggered?: string;
  trigger_count: number;
  created_at: string;
  updated_at: string;

  // Frontend computed fields
  material_name?: string;
  supplier_name?: string;
  last_execution_status?: 'success' | 'failed' | 'pending';

  // TypeScript 5+ Enhancement: Conditions and Actions with satisfies
  conditions?: Array<{
    field: string;
    operator: keyof typeof CONDITION_OPERATORS;
    value: ConditionValue; // ¡Value tipado por tipo!
  }>;
  actions?: Array<{
    type: keyof typeof ACTION_TYPES;
    params: ActionParams[keyof typeof ACTION_TYPES]; // ¡Params tipados por action type!
  }>;
}

export interface AutoOrderExecution {
  id: number;
  rule_id: number;
  purchase_order_id?: number;
  material_id: number;
  supplier_id: number;
  triggered_stock?: number;
  ordered_quantity?: number;
  estimated_cost?: number;
  status: 'pending' | 'approved' | 'ordered' | 'failed';
  execution_reason?: string;
  error_message?: string;
  approved_by?: string;
  executed_by: string;
  triggered_at: string;
  approved_at?: string;
  ordered_at?: string;
  completed_at?: string;

  // Frontend computed fields
  material_name?: string;
  supplier_name?: string;
  rule_name?: string;
}

export interface SupplierPreference {
  id: number;
  material_id: number;
  supplier_id: number;
  preference_score: number;
  reliability_rating: number;
  quality_rating: number;
  price_rating: number;
  delivery_rating: number;
  total_orders: number;
  on_time_deliveries: number;
  quality_issues: number;
  avg_delivery_days?: number;
  is_preferred: boolean;
  is_blacklisted: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;

  // Frontend computed fields
  material_name?: string;
  supplier_name?: string;
  overall_score?: number;
}

export interface AutoOrderAnalytics {
  id: number;
  material_id: number;
  total_auto_orders: number;
  successful_orders: number;
  failed_orders: number;
  avg_order_value?: number;
  total_savings?: number;
  stockout_prevention_count: number;
  avg_processing_time_hours?: number;
  approval_rate?: number;
  last_updated: string;

  // Frontend computed fields
  material_name?: string;
  success_rate?: number;
  savings_percentage?: number;
}

// API Request/Response types
export interface CreateAutoOrderRuleRequest {
  material_id: number;
  rule_name: string;
  description?: string;
  trigger_type: ReorderTrigger;
  reorder_point?: number;
  reorder_quantity?: number;
  safety_stock?: number;
  preferred_supplier_id?: number;
  backup_supplier_id?: number;
  max_order_quantity?: number;
  min_order_quantity?: number;
  budget_limit?: number;
  approval_workflow?: ApprovalWorkflow;
  approver_user_id?: string;
  lead_time_days?: number;
  usage_history_months?: number;
  auto_approval_threshold?: number;
}

export interface UpdateAutoOrderRuleRequest extends Partial<CreateAutoOrderRuleRequest> {
  is_active?: boolean;
}

export interface ProcessAutoOrdersResponse {
  message: string;
  processed: number;
  orders_created: number;
  errors?: string[];
}

export interface AutoOrderDashboardData {
  total_rules: number;
  active_rules: number;
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  pending_approvals: number;
  total_savings: number;
  stockout_prevention_count: number;
  recent_executions: AutoOrderExecution[];
  top_performing_rules: AutoOrderRule[];
  alerts: AutoOrderAlert[];
}

export interface AutoOrderAlert {
  id: string;
  type: 'rule_failed' | 'supplier_issue' | 'stock_critical' | 'approval_pending';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  rule_id?: number;
  material_id?: number;
  supplier_id?: number;
  created_at: string;
  acknowledged: boolean;
}

// Cyberpunk Marketplace types
export interface BlackMarketListing {
  id: string;
  material_id: number;
  material_name: string;
  category: string;
  description: string;
  unit_cost: number;
  bulk_discount?: number;
  minimum_order: number;
  supplier_id: number;
  supplier_name: string;
  supplier_rating: number;
  delivery_time_days: number;
  availability: 'available' | 'limited' | 'out_of_stock';
  quality_guarantee: boolean;
  black_market_price?: number; // Premium price for "special" materials
  risk_level: 'low' | 'medium' | 'high'; // Risk of interception/quality issues
  encrypted_delivery: boolean;
  created_at: string;
  expires_at?: string;
}

export interface BlackMarketOrder {
  id: string;
  listing_id: string;
  buyer_id: string;
  quantity: number;
  total_cost: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'intercepted' | 'failed';
  delivery_method: 'standard' | 'encrypted' | 'shadow_courier';
  risk_assessment: string;
  created_at: string;
  estimated_delivery?: string;
  actual_delivery?: string;
}

// UI Component Props
export interface AutoOrderRuleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: 'create' | 'edit';
  rule?: AutoOrderRule;
  materials: Array<{ id: number; name: string; current_stock: number; minimum_stock: number; }>;
  suppliers: Array<{ id: number; name: string; rating: number; }>;
}

export interface SupplierPreferenceManagerProps {
  materialId: number;
  materialName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export interface AutoOrderDashboardProps {
  data: AutoOrderDashboardData;
  onRefresh: () => void;
  onRuleSelect: (rule: AutoOrderRule) => void;
  onExecutionSelect: (execution: AutoOrderExecution) => void;
}

// Enums for UI
export const REORDER_TRIGGER_LABELS: Record<ReorderTrigger, string> = {
  stock_level: 'Nivel de Stock',
  usage_rate: 'Tasa de Uso',
  time_based: 'Basado en Tiempo',
  demand_forecast: 'Pronóstico de Demanda'
};

export const APPROVAL_WORKFLOW_LABELS: Record<ApprovalWorkflow, string> = {
  none: 'Sin Aprobación',
  manager: 'Gerente',
  budget_holder: 'Responsable de Presupuesto',
  multi_level: 'Múltiples Niveles'
};

export const RISK_LEVEL_COLORS: Record<string, string> = {
  low: 'text-green-400',
  medium: 'text-yellow-400',
  high: 'text-red-400'
};

export const STATUS_COLORS: Record<string, string> = {
  pending: 'text-yellow-400',
  approved: 'text-blue-400',
  ordered: 'text-purple-400',
  failed: 'text-red-400',
  success: 'text-green-400'
};