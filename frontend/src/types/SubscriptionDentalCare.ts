// 🚀 APOLLO SUBSCRIPTION DENTAL CARE
// By PunkClaude & RaulVisionario - September 19, 2025
// MISSION: Netflix model for dentistry - predictable payments, unlimited care

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  tier: 'basic' | 'premium' | 'vip' | 'enterprise';
  price: {
    monthly: number;
    yearly: number;
    currency: 'EUR' | 'USD';
  };
  features: SubscriptionFeature[];
  limitations: SubscriptionLimitation[];
  targetAudience: 'individual' | 'family' | 'business' | 'senior';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionFeature {
  id: string;
  name: string;
  description: string;
  category: 'preventive' | 'restorative' | 'cosmetic' | 'emergency' | 'specialist';
  includedServices: string[]; // Service IDs
  visitLimit?: {
    type: 'unlimited' | 'monthly' | 'yearly';
    count?: number;
  };
  priority: 'low' | 'medium' | 'high' | 'vip';
}

export interface SubscriptionLimitation {
  id: string;
  type: 'service_exclusion' | 'cost_limit' | 'frequency_limit' | 'age_restriction';
  description: string;
  value?: number;
  unit?: string;
}

export interface PatientSubscription {
  id: string;
  patientId: string;
  planId: string;
  status: 'active' | 'paused' | 'cancelled' | 'expired' | 'pending';
  startDate: Date;
  endDate?: Date;
  renewalDate: Date;
  paymentMethod: PaymentMethod;
  billingCycle: 'monthly' | 'yearly';
  autoRenewal: boolean;
  usageStats: SubscriptionUsage;
  discounts: SubscriptionDiscount[];
  addOns: SubscriptionAddOn[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'bank_transfer' | 'paypal' | 'crypto';
  provider: string;
  lastFour?: string;
  expiryDate?: Date;
  isDefault: boolean;
  billingAddress: Address;
}

export interface SubscriptionUsage {
  totalVisits: number;
  visitsThisMonth: number;
  visitsThisYear: number;
  totalSpent: number;
  spentThisMonth: number;
  spentThisYear: number;
  servicesUsed: ServiceUsage[];
  lastVisitDate?: Date;
  nextScheduledVisit?: Date;
}

export interface ServiceUsage {
  serviceId: string;
  serviceName: string;
  usageCount: number;
  lastUsed?: Date;
  totalCost: number;
}

export interface SubscriptionDiscount {
  id: string;
  type: 'percentage' | 'fixed_amount' | 'first_month_free' | 'loyalty_bonus';
  value: number;
  description: string;
  validUntil?: Date;
  appliedBy: string;
  appliedAt: Date;
}

export interface SubscriptionAddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: 'monthly' | 'yearly' | 'one_time';
  isActive: boolean;
  services: string[]; // Additional service IDs
}

export interface PredictablePaymentSystem {
  // Core payment processing
  processSubscriptionPayment(subscriptionId: string): Promise<PaymentResult>;
  calculateNextBillingDate(subscription: PatientSubscription): Date;
  handleFailedPayment(subscriptionId: string, reason: string): Promise<void>;
  processRefund(subscriptionId: string, amount: number, reason: string): Promise<RefundResult>;

  // Billing cycle management
  generateMonthlyInvoices(): Promise<Invoice[]>;
  calculateProratedAmount(planChange: PlanChangeRequest): number;
  handlePlanUpgrade(subscriptionId: string, newPlanId: string): Promise<PlanChangeResult>;
  handlePlanDowngrade(subscriptionId: string, newPlanId: string): Promise<PlanChangeResult>;

  // Financial analytics
  calculateLifetimeValue(subscriptionId: string): number;
  predictChurnRisk(subscriptionId: string): ChurnRisk;
  optimizePricing(): PricingRecommendation[];
  calculateRevenueMetrics(): RevenueMetrics;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  amount: number;
  currency: string;
  timestamp: Date;
  errorMessage?: string;
}

export interface RefundResult {
  success: boolean;
  refundId: string;
  amount: number;
  processedAt: Date;
  reason: string;
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  patientId: string;
  amount: number;
  currency: string;
  billingPeriod: {
    start: Date;
    end: Date;
  };
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  discounts: InvoiceDiscount[];
  taxes: InvoiceTax[];
  paymentDate?: Date;
}

export interface InvoiceItem {
  id: string;
  description: string;
  amount: number;
  quantity: number;
  serviceId?: string;
  category: string;
}

export interface InvoiceDiscount {
  id: string;
  description: string;
  amount: number;
  type: 'percentage' | 'fixed';
}

export interface InvoiceTax {
  id: string;
  name: string;
  rate: number;
  amount: number;
}

export interface PlanChangeRequest {
  subscriptionId: string;
  currentPlanId: string;
  newPlanId: string;
  effectiveDate: Date;
  reason: string;
}

export interface PlanChangeResult {
  success: boolean;
  proratedAmount: number;
  nextBillingDate: Date;
  confirmationRequired: boolean;
}

export interface ChurnRisk {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  reasons: string[];
  recommendations: string[];
  predictedChurnDate?: Date;
}

export interface PricingRecommendation {
  planId: string;
  currentPrice: number;
  recommendedPrice: number;
  expectedRevenue: number;
  confidence: number;
  reasoning: string[];
}

export interface RevenueMetrics {
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  averageRevenuePerUser: number;
  churnRate: number;
  customerLifetimeValue: number;
  paybackPeriod: number;
  growthRate: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Service definitions for subscription plans
export interface DentalService {
  id: string;
  name: string;
  description: string;
  category: 'preventive' | 'restorative' | 'cosmetic' | 'emergency' | 'specialist';
  basePrice: number;
  estimatedDuration: number; // minutes
  requiredSkills: string[];
  equipmentNeeded: string[];
  consumables: string[];
  isCoveredBySubscription: boolean;
  subscriptionTiers: string[]; // Plan IDs that cover this service
}

// Analytics and reporting
export interface SubscriptionAnalytics {
  totalActiveSubscriptions: number;
  monthlyNewSubscriptions: number;
  churnRate: number;
  averageRevenuePerUser: number;
  mostPopularPlans: PlanPopularity[];
  serviceUtilization: ServiceUtilization[];
  paymentSuccessRate: number;
  customerSatisfaction: number;
}

export interface PlanPopularity {
  planId: string;
  planName: string;
  subscriberCount: number;
  revenue: number;
  growthRate: number;
}

export interface ServiceUtilization {
  serviceId: string;
  serviceName: string;
  usageCount: number;
  revenueGenerated: number;
  averageCost: number;
}

// Notification system for subscriptions
export interface SubscriptionNotification {
  id: string;
  subscriptionId: string;
  patientId: string;
  type: 'payment_due' | 'payment_failed' | 'plan_expiring' | 'visit_reminder' | 'upgrade_offer';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channels: ('email' | 'sms' | 'app' | 'portal')[];
  scheduledFor: Date;
  sentAt?: Date;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
}

// Integration with existing systems
export interface SubscriptionIntegration {
  // Patient management integration
  syncPatientData(patientId: string): Promise<void>;
  updatePatientSubscriptionStatus(patientId: string, status: string): Promise<void>;

  // Appointment system integration
  checkServiceCoverage(appointmentId: string): Promise<ServiceCoverage>;
  applySubscriptionDiscount(appointmentId: string): Promise<DiscountApplication>;

  // Billing system integration
  createSubscriptionInvoice(subscriptionId: string): Promise<Invoice>;
  processSubscriptionPayment(payment: PaymentRequest): Promise<PaymentResult>;
}

export interface ServiceCoverage {
  isCovered: boolean;
  coveragePercentage: number;
  remainingVisits?: number;
  notes?: string;
}

export interface DiscountApplication {
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  discountReason: string;
}

export interface PaymentRequest {
  subscriptionId: string;
  amount: number;
  currency: string;
  paymentMethodId: string;
  description: string;
}
