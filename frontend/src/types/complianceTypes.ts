// APOLLO NUCLEAR TYPES - COMPLIANCE MANAGEMENT
// Date: September 22, 2025
// Mission: TypeScript types for Compliance Management V3
// Target: Regulatory compliance, audits, certifications, and policy management

export interface ComplianceRegulation {
  id: string;
  name: string;
  description: string;
  category: 'HIPAA' | 'GDPR' | 'FDA' | 'ISO' | 'LOCAL' | 'OTHER';
  version: string;
  effectiveDate: Date;
  complianceDeadline: Date;
  status: 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'ARCHIVED';
  requirements: string[];
  responsibleParty: string;
  lastAuditDate?: Date;
  nextAuditDate?: Date;
  complianceScore: number; // 0-100
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplianceAudit {
  id: string;
  regulationId: string;
  regulation?: ComplianceRegulation;
  title: string;
  description: string;
  type: 'INTERNAL' | 'EXTERNAL' | 'SURPRISE' | 'ROUTINE';
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  scheduledDate: Date;
  completedDate?: Date;
  auditor: string;
  findings: ComplianceFinding[];
  overallScore: number; // 0-100
  recommendations: string[];
  followUpRequired: boolean;
  followUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplianceFinding {
  id: string;
  auditId: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  category: string;
  description: string;
  requirement: string;
  evidence: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'ACCEPTED_RISK';
  assignedTo: string;
  dueDate: Date;
  resolvedDate?: Date;
  resolutionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplianceCertification {
  id: string;
  name: string;
  issuingBody: string;
  certificationNumber: string;
  issueDate: Date;
  expiryDate: Date;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'PENDING_RENEWAL';
  scope: string;
  requirements: string[];
  renewalProcess: string;
  contactPerson: string;
  documents: string[]; // URLs or file references
  createdAt: Date;
  updatedAt: Date;
}

export interface CompliancePolicy {
  id: string;
  title: string;
  description: string;
  category: 'PATIENT_PRIVACY' | 'DATA_SECURITY' | 'CLINICAL_PRACTICE' | 'ADMINISTRATIVE' | 'OTHER';
  version: string;
  effectiveDate: Date;
  reviewDate: Date;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | 'UNDER_REVIEW';
  content: string;
  responsibleParty: string;
  approvalRequired: boolean;
  approvedBy?: string;
  approvalDate?: Date;
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplianceTraining {
  id: string;
  title: string;
  description: string;
  policyId?: string;
  policy?: CompliancePolicy;
  requiredFor: string[]; // Role IDs or names
  type: 'MANDATORY' | 'OPTIONAL' | 'REFRESHER';
  frequency: 'ANNUAL' | 'BIANNUAL' | 'QUARTERLY' | 'ONE_TIME' | 'AS_NEEDED';
  duration: number; // minutes
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  lastUpdated: Date;
  createdAt: Date;
}

export interface ComplianceTrainingRecord {
  id: string;
  trainingId: string;
  training?: ComplianceTraining;
  userId: string;
  userName: string;
  completedDate: Date;
  score?: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED' | 'EXPIRED';
  certificateUrl?: string;
  expiryDate?: Date;
  createdAt: Date;
}

export interface ComplianceAlert {
  id: string;
  type: 'REGULATION_UPDATE' | 'AUDIT_DUE' | 'CERTIFICATION_EXPIRY' | 'TRAINING_OVERDUE' | 'COMPLIANCE_BREACH';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  message: string;
  relatedEntityId: string;
  relatedEntityType: 'REGULATION' | 'AUDIT' | 'CERTIFICATION' | 'POLICY' | 'TRAINING';
  dueDate?: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  createdAt: Date;
}

export interface ComplianceDashboardStats {
  totalRegulations: number;
  activeRegulations: number;
  expiringRegulations: number;
  overdueAudits: number;
  upcomingAudits: number;
  activeCertifications: number;
  expiringCertifications: number;
  complianceScore: number;
  openFindings: number;
  criticalFindings: number;
  trainingCompletionRate: number;
  activeAlerts: number;
}

export interface ComplianceState {
  // Data
  regulations: ComplianceRegulation[];
  audits: ComplianceAudit[];
  findings: ComplianceFinding[];
  certifications: ComplianceCertification[];
  policies: CompliancePolicy[];
  trainings: ComplianceTraining[];
  trainingRecords: ComplianceTrainingRecord[];
  alerts: ComplianceAlert[];
  stats: ComplianceDashboardStats | null;

  // UI State
  selectedRegulation: ComplianceRegulation | null;
  selectedAudit: ComplianceAudit | null;
  selectedFinding: ComplianceFinding | null;
  selectedCertification: ComplianceCertification | null;
  selectedPolicy: CompliancePolicy | null;
  activeTab: 'dashboard' | 'regulations' | 'audits' | 'certifications' | 'policies' | 'training' | 'alerts';

  // Filters
  regulationFilters: ComplianceRegulationFilters;
  auditFilters: ComplianceAuditFilters;
  findingFilters: ComplianceFindingFilters;
  certificationFilters: ComplianceCertificationFilters;
  policyFilters: CompliancePolicyFilters;
  trainingFilters: ComplianceTrainingFilters;

  // Loading and Error
  loading: boolean;
  error: string | null;

  // Actions
  setActiveTab: (tab: 'dashboard' | 'regulations' | 'audits' | 'certifications' | 'policies' | 'training' | 'alerts') => void;
  setRegulationFilters: (filters: ComplianceRegulationFilters) => void;
  setAuditFilters: (filters: ComplianceAuditFilters) => void;
  setFindingFilters: (filters: ComplianceFindingFilters) => void;
  setCertificationFilters: (filters: ComplianceCertificationFilters) => void;
  setPolicyFilters: (filters: CompliancePolicyFilters) => void;
  setTrainingFilters: (filters: ComplianceTrainingFilters) => void;
  selectRegulation: (regulation: ComplianceRegulation | null) => void;
  selectAudit: (audit: ComplianceAudit | null) => void;
  selectFinding: (finding: ComplianceFinding | null) => void;
  selectCertification: (certification: ComplianceCertification | null) => void;
  selectPolicy: (policy: CompliancePolicy | null) => void;

  // Data Loading Actions
  loadDashboardStats: () => Promise<void>;
  loadRegulations: () => Promise<void>;
  loadAudits: () => Promise<void>;
  loadFindings: () => Promise<void>;
  loadCertifications: () => Promise<void>;
  loadPolicies: () => Promise<void>;
  loadTrainings: () => Promise<void>;
  loadAlerts: () => Promise<void>;

  // CRUD Operations
  createRegulation: (input: ComplianceRegulationCreateInput) => Promise<ComplianceRegulation>;
  updateRegulation: (id: string, input: ComplianceRegulationUpdateInput) => Promise<ComplianceRegulation>;
  deleteRegulation: (id: string) => Promise<void>;
  createAudit: (input: ComplianceAuditCreateInput) => Promise<ComplianceAudit>;
  updateAudit: (id: string, input: ComplianceAuditUpdateInput) => Promise<ComplianceAudit>;
  createFinding: (input: ComplianceFindingCreateInput) => Promise<ComplianceFinding>;
  updateFinding: (id: string, input: ComplianceFindingUpdateInput) => Promise<ComplianceFinding>;
  createCertification: (input: ComplianceCertificationCreateInput) => Promise<ComplianceCertification>;
  updateCertification: (id: string, input: ComplianceCertificationUpdateInput) => Promise<ComplianceCertification>;
  createPolicy: (input: CompliancePolicyCreateInput) => Promise<CompliancePolicy>;
  updatePolicy: (id: string, input: CompliancePolicyUpdateInput) => Promise<CompliancePolicy>;
  createTraining: (input: ComplianceTrainingCreateInput) => Promise<ComplianceTraining>;
  updateTraining: (id: string, input: ComplianceTrainingUpdateInput) => Promise<ComplianceTraining>;
  recordTrainingCompletion: (input: ComplianceTrainingRecordCreateInput) => Promise<ComplianceTrainingRecord>;
  acknowledgeAlert: (input: ComplianceAlertAcknowledgeInput) => Promise<void>;
}

// Filter Types
export interface ComplianceRegulationFilters {
  category?: string;
  status?: string;
  search?: string;
}

export interface ComplianceAuditFilters {
  type?: string;
  status?: string;
  dateRange?: { start: Date; end: Date };
  search?: string;
}

export interface ComplianceFindingFilters {
  severity?: string;
  status?: string;
  auditId?: string;
  search?: string;
}

export interface ComplianceCertificationFilters {
  status?: string;
  expiryRange?: { start: Date; end: Date };
  search?: string;
}

export interface CompliancePolicyFilters {
  category?: string;
  status?: string;
  search?: string;
}

export interface ComplianceTrainingFilters {
  type?: string;
  status?: string;
  requiredFor?: string;
  search?: string;
}

// Input Types for Mutations
export interface ComplianceRegulationCreateInput {
  name: string;
  description: string;
  category: string;
  version: string;
  effectiveDate: Date;
  complianceDeadline: Date;
  requirements: string[];
  responsibleParty: string;
}

export interface ComplianceRegulationUpdateInput {
  name?: string;
  description?: string;
  category?: string;
  version?: string;
  effectiveDate?: Date;
  complianceDeadline?: Date;
  requirements?: string[];
  responsibleParty?: string;
  status?: string;
}

export interface ComplianceAuditCreateInput {
  regulationId: string;
  title: string;
  description: string;
  type: string;
  scheduledDate: Date;
  auditor: string;
}

export interface ComplianceAuditUpdateInput {
  title?: string;
  description?: string;
  type?: string;
  scheduledDate?: Date;
  auditor?: string;
  status?: string;
  completedDate?: Date;
  overallScore?: number;
  recommendations?: string[];
  followUpRequired?: boolean;
  followUpDate?: Date;
}

export interface ComplianceFindingCreateInput {
  auditId: string;
  severity: string;
  category: string;
  description: string;
  requirement: string;
  evidence: string;
  assignedTo: string;
  dueDate: Date;
}

export interface ComplianceFindingUpdateInput {
  severity?: string;
  category?: string;
  description?: string;
  requirement?: string;
  evidence?: string;
  status?: string;
  assignedTo?: string;
  dueDate?: Date;
  resolvedDate?: Date;
  resolutionNotes?: string;
}

export interface ComplianceCertificationCreateInput {
  name: string;
  issuingBody: string;
  certificationNumber: string;
  issueDate: Date;
  expiryDate: Date;
  scope: string;
  requirements: string[];
  renewalProcess: string;
  contactPerson: string;
  documents: string[];
}

export interface ComplianceCertificationUpdateInput {
  name?: string;
  issuingBody?: string;
  certificationNumber?: string;
  issueDate?: Date;
  expiryDate?: Date;
  scope?: string;
  requirements?: string[];
  renewalProcess?: string;
  contactPerson?: string;
  status?: string;
  documents?: string[];
}

export interface CompliancePolicyCreateInput {
  title: string;
  description: string;
  category: string;
  version: string;
  effectiveDate: Date;
  reviewDate: Date;
  content: string;
  responsibleParty: string;
  approvalRequired: boolean;
}

export interface CompliancePolicyUpdateInput {
  title?: string;
  description?: string;
  category?: string;
  version?: string;
  effectiveDate?: Date;
  reviewDate?: Date;
  status?: string;
  content?: string;
  responsibleParty?: string;
  approvalRequired?: boolean;
  approvedBy?: string;
  approvalDate?: Date;
  attachments?: string[];
}

export interface ComplianceTrainingCreateInput {
  title: string;
  description: string;
  policyId?: string;
  requiredFor: string[];
  type: string;
  frequency: string;
  duration: number;
}

export interface ComplianceTrainingUpdateInput {
  title?: string;
  description?: string;
  policyId?: string;
  requiredFor?: string[];
  type?: string;
  frequency?: string;
  duration?: number;
  status?: string;
}

export interface ComplianceTrainingRecordCreateInput {
  trainingId: string;
  userId: string;
  completedDate: Date;
  score?: number;
  status: string;
  certificateUrl?: string;
}

export interface ComplianceAlertAcknowledgeInput {
  alertId: string;
  acknowledgedBy: string;
}