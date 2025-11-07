// 🔥 APOLLO NUCLEAR ZUSTAND STORE - COMPLIANCE MANAGEMENT
// Date: September 22, 2025
// Mission: Zustand Store for Compliance Management State
// Target: ComplianceManagementV3 Integration with GraphQL

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import apolloClient from '../apollo/graphql-client';
import {
  GET_COMPLIANCE_DASHBOARD_STATS,
  GET_COMPLIANCE_REGULATIONS,
  GET_COMPLIANCE_AUDITS,
  GET_COMPLIANCE_FINDINGS,
  GET_COMPLIANCE_CERTIFICATIONS,
  GET_COMPLIANCE_POLICIES,
  GET_COMPLIANCE_TRAININGS,
  GET_COMPLIANCE_TRAINING_RECORDS,
  GET_COMPLIANCE_ALERTS,
  CREATE_COMPLIANCE_REGULATION,
  UPDATE_COMPLIANCE_REGULATION,
  DELETE_COMPLIANCE_REGULATION,
  CREATE_COMPLIANCE_AUDIT,
  UPDATE_COMPLIANCE_AUDIT,
  CREATE_COMPLIANCE_FINDING,
  UPDATE_COMPLIANCE_FINDING,
  CREATE_COMPLIANCE_CERTIFICATION,
  UPDATE_COMPLIANCE_CERTIFICATION,
  CREATE_COMPLIANCE_POLICY,
  UPDATE_COMPLIANCE_POLICY,
  CREATE_COMPLIANCE_TRAINING,
  UPDATE_COMPLIANCE_TRAINING,
  RECORD_COMPLIANCE_TRAINING_COMPLETION,
  ACKNOWLEDGE_COMPLIANCE_ALERT
} from '../graphql/queries/compliance';
import {
  ComplianceState,
  ComplianceRegulation,
  ComplianceAudit,
  ComplianceFinding,
  ComplianceCertification,
  CompliancePolicy,
  ComplianceRegulationFilters,
  ComplianceAuditFilters,
  ComplianceFindingFilters,
  ComplianceCertificationFilters,
  CompliancePolicyFilters,
  ComplianceTrainingFilters,
  ComplianceRegulationCreateInput,
  ComplianceRegulationUpdateInput,
  ComplianceAuditCreateInput,
  ComplianceAuditUpdateInput,
  ComplianceFindingCreateInput,
  ComplianceFindingUpdateInput,
  ComplianceCertificationCreateInput,
  ComplianceCertificationUpdateInput,
  CompliancePolicyCreateInput,
  CompliancePolicyUpdateInput,
  ComplianceTrainingCreateInput,
  ComplianceTrainingUpdateInput,
  ComplianceTrainingRecordCreateInput,
  ComplianceAlertAcknowledgeInput
} from '../types/complianceTypes';
import { createModuleLogger } from '../utils/logger';

const l = createModuleLogger('useComplianceStore');

export const useComplianceStore = create<ComplianceState>()(
  devtools(
    persist(
      (set, get) => ({
        // ============================================================================
        // INITIAL STATE
        // ============================================================================
        regulations: [],
        audits: [],
        findings: [],
        certifications: [],
        policies: [],
        trainings: [],
        trainingRecords: [],
        alerts: [],
        stats: null,
        selectedRegulation: null,
        selectedAudit: null,
        selectedFinding: null,
        selectedCertification: null,
        selectedPolicy: null,
        activeTab: 'dashboard',
        regulationFilters: {},
        auditFilters: {},
        findingFilters: {},
        certificationFilters: {},
        policyFilters: {},
        trainingFilters: {},
        loading: false,
        error: null,

        // ============================================================================
        // UI STATE ACTIONS
        // ============================================================================
        setActiveTab: (tab: 'dashboard' | 'regulations' | 'audits' | 'certifications' | 'policies' | 'training' | 'alerts') => set({ activeTab: tab }),
        setRegulationFilters: (filters: ComplianceRegulationFilters) => set({ regulationFilters: filters }),
        setAuditFilters: (filters: ComplianceAuditFilters) => set({ auditFilters: filters }),
        setFindingFilters: (filters: ComplianceFindingFilters) => set({ findingFilters: filters }),
        setCertificationFilters: (filters: ComplianceCertificationFilters) => set({ certificationFilters: filters }),
        setPolicyFilters: (filters: CompliancePolicyFilters) => set({ policyFilters: filters }),
        setTrainingFilters: (filters: ComplianceTrainingFilters) => set({ trainingFilters: filters }),
        selectRegulation: (regulation: ComplianceRegulation | null) => set({ selectedRegulation: regulation }),
        selectAudit: (audit: ComplianceAudit | null) => set({ selectedAudit: audit }),
        selectFinding: (finding: ComplianceFinding | null) => set({ selectedFinding: finding }),
        selectCertification: (certification: ComplianceCertification | null) => set({ selectedCertification: certification }),
        selectPolicy: (policy: CompliancePolicy | null) => set({ selectedPolicy: policy }),

        // ============================================================================
        // DATA LOADING ACTIONS
        // ============================================================================
        loadDashboardStats: async () => {
          try {
            set({ loading: true, error: null });
            l.info && l.info('Loading compliance dashboard stats');
            const { data } = await apolloClient.query({
              query: GET_COMPLIANCE_DASHBOARD_STATS,
              fetchPolicy: 'network-only'
            });
            const responseData = data as any;
            set({
              stats: responseData.complianceDashboardStats,
              loading: false
            });
            l.info && l.info('Loaded compliance dashboard stats');
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load compliance dashboard stats';
            l.error && l.error(errorMessage);
            set({ error: errorMessage, loading: false });
          }
        },

        loadRegulations: async () => {
          try {
            set({ loading: true, error: null });
            l.info && l.info('Loading compliance regulations');
            const { data } = await apolloClient.query({
              query: GET_COMPLIANCE_REGULATIONS,
              variables: { filters: get().regulationFilters },
              fetchPolicy: 'network-only'
            });
            const responseData = data as any;
            set({
              regulations: responseData.complianceRegulations || [],
              loading: false
            });
            l.info && l.info(`Loaded ${responseData.complianceRegulations?.length || 0} regulations`);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load regulations';
            l.error && l.error(errorMessage);
            set({ error: errorMessage, loading: false });
          }
        },

        loadAudits: async () => {
          try {
            set({ loading: true, error: null });
            l.info && l.info('Loading compliance audits');
            const { data } = await apolloClient.query({
              query: GET_COMPLIANCE_AUDITS,
              variables: { filters: get().auditFilters },
              fetchPolicy: 'network-only'
            });
            const responseData = data as any;
            set({
              audits: responseData.complianceAudits || [],
              loading: false
            });
            l.info && l.info(`Loaded ${responseData.complianceAudits?.length || 0} audits`);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load audits';
            l.error && l.error(errorMessage);
            set({ error: errorMessage, loading: false });
          }
        },

        loadFindings: async () => {
          try {
            set({ loading: true, error: null });
            l.info && l.info('Loading compliance findings');
            const { data } = await apolloClient.query({
              query: GET_COMPLIANCE_FINDINGS,
              variables: { filters: get().findingFilters },
              fetchPolicy: 'network-only'
            });
            const responseData = data as any;
            set({
              findings: responseData.complianceFindings || [],
              loading: false
            });
            l.info && l.info(`Loaded ${responseData.complianceFindings?.length || 0} findings`);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load findings';
            l.error && l.error(errorMessage);
            set({ error: errorMessage, loading: false });
          }
        },

        loadCertifications: async () => {
          try {
            set({ loading: true, error: null });
            l.info && l.info('Loading compliance certifications');
            const { data } = await apolloClient.query({
              query: GET_COMPLIANCE_CERTIFICATIONS,
              variables: { filters: get().certificationFilters },
              fetchPolicy: 'network-only'
            });
            const responseData = data as any;
            set({
              certifications: responseData.complianceCertifications || [],
              loading: false
            });
            l.info && l.info(`Loaded ${responseData.complianceCertifications?.length || 0} certifications`);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load certifications';
            l.error && l.error(errorMessage);
            set({ error: errorMessage, loading: false });
          }
        },

        loadPolicies: async () => {
          try {
            set({ loading: true, error: null });
            l.info && l.info('Loading compliance policies');
            const { data } = await apolloClient.query({
              query: GET_COMPLIANCE_POLICIES,
              variables: { filters: get().policyFilters },
              fetchPolicy: 'network-only'
            });
            const responseData = data as any;
            set({
              policies: responseData.compliancePolicies || [],
              loading: false
            });
            l.info && l.info(`Loaded ${responseData.compliancePolicies?.length || 0} policies`);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load policies';
            l.error && l.error(errorMessage);
            set({ error: errorMessage, loading: false });
          }
        },

        loadTrainings: async () => {
          try {
            set({ loading: true, error: null });
            l.info && l.info('Loading compliance trainings');
            const { data } = await apolloClient.query({
              query: GET_COMPLIANCE_TRAININGS,
              variables: { filters: get().trainingFilters },
              fetchPolicy: 'network-only'
            });
            const responseData = data as any;
            set({
              trainings: responseData.complianceTrainings || [],
              loading: false
            });
            l.info && l.info(`Loaded ${responseData.complianceTrainings?.length || 0} trainings`);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load trainings';
            l.error && l.error(errorMessage);
            set({ error: errorMessage, loading: false });
          }
        },

        loadTrainingRecords: async (trainingId?: string, userId?: string) => {
          try {
            set({ loading: true, error: null });
            l.info && l.info('Loading compliance training records');
            const { data } = await apolloClient.query({
              query: GET_COMPLIANCE_TRAINING_RECORDS,
              variables: { trainingId, userId },
              fetchPolicy: 'network-only'
            });
            const responseData = data as any;
            set({
              trainingRecords: responseData.complianceTrainingRecords || [],
              loading: false
            });
            l.info && l.info(`Loaded ${responseData.complianceTrainingRecords?.length || 0} training records`);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load training records';
            l.error && l.error(errorMessage);
            set({ error: errorMessage, loading: false });
          }
        },

        loadAlerts: async () => {
          try {
            set({ loading: true, error: null });
            l.info && l.info('Loading compliance alerts');
            const { data } = await apolloClient.query({
              query: GET_COMPLIANCE_ALERTS,
              fetchPolicy: 'network-only'
            });
            const responseData = data as any;
            set({
              alerts: responseData.complianceAlerts || [],
              loading: false
            });
            l.info && l.info(`Loaded ${responseData.complianceAlerts?.length || 0} alerts`);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load alerts';
            l.error && l.error(errorMessage);
            set({ error: errorMessage, loading: false });
          }
        },

        // ============================================================================
        // REGULATION CRUD OPERATIONS
        // ============================================================================
        createRegulation: async (input: ComplianceRegulationCreateInput) => {
          try {
            set({ loading: true, error: null });
            l.info && l.info('Creating compliance regulation', { input });
            const { data } = await apolloClient.mutate({
              mutation: CREATE_COMPLIANCE_REGULATION,
              variables: { input }
            });
            const responseData = data as any;
            const newRegulation = responseData.createComplianceRegulation;
            set(state => ({
              regulations: [...state.regulations, newRegulation],
              loading: false
            }));
            l.info && l.info('Regulation created successfully', { regulationId: newRegulation.id });
            return newRegulation;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create regulation';
            l.error && l.error(errorMessage);
            set({ error: errorMessage, loading: false });
            throw error;
          }
        },

        updateRegulation: async (id: string, input: ComplianceRegulationUpdateInput) => {
          try {
            set({ loading: true, error: null });
            l.info && l.info('Updating compliance regulation', { id, input });
            const { data } = await apolloClient.mutate({
              mutation: UPDATE_COMPLIANCE_REGULATION,
              variables: { id, input }
            });
            const responseData = data as any;
            const updatedRegulation = responseData.updateComplianceRegulation;
            set(state => ({
              regulations: state.regulations.map(reg =>
                reg.id === id ? updatedRegulation : reg
              ),
              selectedRegulation: state.selectedRegulation?.id === id ? updatedRegulation : state.selectedRegulation,
              loading: false
            }));
            l.info && l.info('Regulation updated successfully', { regulationId: id });
            return updatedRegulation;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update regulation';
            l.error && l.error(errorMessage);
            set({ error: errorMessage, loading: false });
            throw error;
          }
        },

        deleteRegulation: async (id: string) => {
          try {
            set({ loading: true, error: null });
            l.info && l.info('Deleting compliance regulation', { id });
            await apolloClient.mutate({
              mutation: DELETE_COMPLIANCE_REGULATION,
              variables: { id }
            });
            set(state => ({
              regulations: state.regulations.filter(reg => reg.id !== id),
              selectedRegulation: state.selectedRegulation?.id === id ? null : state.selectedRegulation,
              loading: false
            }));
            l.info && l.info('Regulation deleted successfully', { regulationId: id });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete regulation';
            l.error && l.error(errorMessage);
            set({ error: errorMessage, loading: false });
            throw error;
          }
        },

        // ============================================================================
        // AUDIT CRUD OPERATIONS
        // ============================================================================
        createAudit: async (input: ComplianceAuditCreateInput) => {
          try {
            set({ loading: true, error: null });
            l.info && l.info('Creating compliance audit', { input });
            const { data } = await apolloClient.mutate({
              mutation: CREATE_COMPLIANCE_AUDIT,
              variables: { input }
            });
            const responseData = data as any;
            const newAudit = responseData.createComplianceAudit;
            set(state => ({
              audits: [...state.audits, newAudit],
              loading: false
            }));
            l.info && l.info('Audit created successfully', { auditId: newAudit.id });
            return newAudit;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create audit';
            l.error && l.error(errorMessage);
            set({ error: errorMessage, loading: false });
            throw error;
          }
        },

        updateAudit: async (id: string, input: ComplianceAuditUpdateInput) => {
          try {
            set({ loading: true, error: null });
            l.info && l.info('Updating compliance audit', { id, input });
            const { data } = await apolloClient.mutate({
              mutation: UPDATE_COMPLIANCE_AUDIT,
              variables: { id, input }
            });
            const responseData = data as any;
            const updatedAudit = responseData.updateComplianceAudit;
            set(state => ({
              audits: state.audits.map(audit =>
                audit.id === id ? updatedAudit : audit
              ),
              selectedAudit: state.selectedAudit?.id === id ? updatedAudit : state.selectedAudit,
              loading: false
            }));
            l.info && l.info('Audit updated successfully', { auditId: id });
            return updatedAudit;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update audit';
            l.error && l.error(errorMessage);
            set({ error: errorMessage, loading: false });
            throw error;
          }
        },

        // ============================================================================
        // FINDING CRUD OPERATIONS
        // ============================================================================
        createFinding: async (input: ComplianceFindingCreateInput) => {
          try {
            set({ loading: true, error: null });
            l.info && l.info('Creating compliance finding', { input });
            const { data } = await apolloClient.mutate({
              mutation: CREATE_COMPLIANCE_FINDING,
              variables: { input }
            });
            const responseData = data as any;
            const newFinding = responseData.createComplianceFinding;
            set(state => ({
              findings: [...state.findings, newFinding],
              loading: false
            }));
            l.info && l.info('Finding created successfully', { findingId: newFinding.id });
            return newFinding;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create finding';
            l.error && l.error(errorMessage);
            set({ error: errorMessage, loading: false });
            throw error;
          }
        },

        updateFinding: async (id: string, input: ComplianceFindingUpdateInput) => {
          try {
            set({ loading: true, error: null });
            l.info && l.info('Updating compliance finding', { id, input });
            const { data } = await apolloClient.mutate({
              mutation: UPDATE_COMPLIANCE_FINDING,
              variables: { id, input }
            });
            const responseData = data as any;
            const updatedFinding = responseData.updateComplianceFinding;
            set(state => ({
              findings: state.findings.map(finding =>
                finding.id === id ? updatedFinding : finding
              ),
              selectedFinding: state.selectedFinding?.id === id ? updatedFinding : state.selectedFinding,
              loading: false
            }));
            l.info && l.info('Finding updated successfully', { findingId: id });
            return updatedFinding;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update finding';
            l.error && l.error(errorMessage);
            set({ error: errorMessage, loading: false });
            throw error;
          }
        },

        // ============================================================================
        // CERTIFICATION CRUD OPERATIONS
        // ============================================================================
        createCertification: async (input: ComplianceCertificationCreateInput) => {
          try {
            set({ loading: true, error: null });
            l.info && l.info('Creating compliance certification', { input });
            const { data } = await apolloClient.mutate({
              mutation: CREATE_COMPLIANCE_CERTIFICATION,
              variables: { input }
            });
            const responseData = data as any;
            const newCertification = responseData.createComplianceCertification;
            set(state => ({
              certifications: [...state.certifications, newCertification],
              loading: false
            }));
            l.info && l.info('Certification created successfully', { certificationId: newCertification.id });
            return newCertification;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create certification';
            l.error && l.error(errorMessage);
            set({ error: errorMessage, loading: false });
            throw error;
          }
        },

        updateCertification: async (id: string, input: ComplianceCertificationUpdateInput) => {
          try {
            set({ loading: true, error: null });
            l.info && l.info('Updating compliance certification', { id, input });
            const { data } = await apolloClient.mutate({
              mutation: UPDATE_COMPLIANCE_CERTIFICATION,
              variables: { id, input }
            });
            const responseData = data as any;
            const updatedCertification = responseData.updateComplianceCertification;
            set(state => ({
              certifications: state.certifications.map(cert =>
                cert.id === id ? updatedCertification : cert
              ),
              selectedCertification: state.selectedCertification?.id === id ? updatedCertification : state.selectedCertification,
              loading: false
            }));
            l.info && l.info('Certification updated successfully', { certificationId: id });
            return updatedCertification;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update certification';
            l.error && l.error(errorMessage);
            set({ error: errorMessage, loading: false });
            throw error;
          }
        },

        // ============================================================================
        // POLICY CRUD OPERATIONS
        // ============================================================================
        createPolicy: async (input: CompliancePolicyCreateInput) => {
          try {
            set({ loading: true, error: null });
            l.info && l.info('Creating compliance policy', { input });
            const { data } = await apolloClient.mutate({
              mutation: CREATE_COMPLIANCE_POLICY,
              variables: { input }
            });
            const responseData = data as any;
            const newPolicy = responseData.createCompliancePolicy;
            set(state => ({
              policies: [...state.policies, newPolicy],
              loading: false
            }));
            l.info && l.info('Policy created successfully', { policyId: newPolicy.id });
            return newPolicy;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create policy';
            l.error && l.error(errorMessage);
            set({ error: errorMessage, loading: false });
            throw error;
          }
        },

        updatePolicy: async (id: string, input: CompliancePolicyUpdateInput) => {
          try {
            set({ loading: true, error: null });
            l.info && l.info('Updating compliance policy', { id, input });
            const { data } = await apolloClient.mutate({
              mutation: UPDATE_COMPLIANCE_POLICY,
              variables: { input }
            });
            const responseData = data as any;
            const updatedPolicy = responseData.updateCompliancePolicy;
            set(state => ({
              policies: state.policies.map(policy =>
                policy.id === id ? updatedPolicy : policy
              ),
              selectedPolicy: state.selectedPolicy?.id === id ? updatedPolicy : state.selectedPolicy,
              loading: false
            }));
            l.info && l.info('Policy updated successfully', { policyId: id });
            return updatedPolicy;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update policy';
            l.error && l.error(errorMessage);
            set({ error: errorMessage, loading: false });
            throw error;
          }
        },

        // ============================================================================
        // TRAINING CRUD OPERATIONS
        // ============================================================================
        createTraining: async (input: ComplianceTrainingCreateInput) => {
          try {
            set({ loading: true, error: null });
            l.info && l.info('Creating compliance training', { input });
            const { data } = await apolloClient.mutate({
              mutation: CREATE_COMPLIANCE_TRAINING,
              variables: { input }
            });
            const responseData = data as any;
            const newTraining = responseData.createComplianceTraining;
            set(state => ({
              trainings: [...state.trainings, newTraining],
              loading: false
            }));
            l.info && l.info('Training created successfully', { trainingId: newTraining.id });
            return newTraining;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create training';
            l.error && l.error(errorMessage);
            set({ error: errorMessage, loading: false });
            throw error;
          }
        },

        updateTraining: async (id: string, input: ComplianceTrainingUpdateInput) => {
          try {
            set({ loading: true, error: null });
            l.info && l.info('Updating compliance training', { id, input });
            const { data } = await apolloClient.mutate({
              mutation: UPDATE_COMPLIANCE_TRAINING,
              variables: { id, input }
            });
            const responseData = data as any;
            const updatedTraining = responseData.updateComplianceTraining;
            set(state => ({
              trainings: state.trainings.map(training =>
                training.id === id ? updatedTraining : training
              ),
              loading: false
            }));
            l.info && l.info('Training updated successfully', { trainingId: id });
            return updatedTraining;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update training';
            l.error && l.error(errorMessage);
            set({ error: errorMessage, loading: false });
            throw error;
          }
        },

        recordTrainingCompletion: async (input: ComplianceTrainingRecordCreateInput) => {
          try {
            set({ loading: true, error: null });
            l.info && l.info('Recording training completion', { input });
            const { data } = await apolloClient.mutate({
              mutation: RECORD_COMPLIANCE_TRAINING_COMPLETION,
              variables: { input }
            });
            const responseData = data as any;
            const newRecord = responseData.recordComplianceTrainingCompletion;
            set(state => ({
              trainingRecords: [...state.trainingRecords, newRecord],
              loading: false
            }));
            l.info && l.info('Training completion recorded successfully', { recordId: newRecord.id });
            return newRecord;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to record training completion';
            l.error && l.error(errorMessage);
            set({ error: errorMessage, loading: false });
            throw error;
          }
        },

        // ============================================================================
        // ALERT OPERATIONS
        // ============================================================================
        acknowledgeAlert: async (input: ComplianceAlertAcknowledgeInput) => {
          try {
            set({ loading: true, error: null });
            l.info && l.info('Acknowledging compliance alert', { input });
            const { data } = await apolloClient.mutate({
              mutation: ACKNOWLEDGE_COMPLIANCE_ALERT,
              variables: { input }
            });
            const responseData = data as any;
            const updatedAlert = responseData.acknowledgeComplianceAlert;
            set(state => ({
              alerts: state.alerts.map(alert =>
                alert.id === input.alertId ? { ...alert, ...updatedAlert } : alert
              ),
              loading: false
            }));
            l.info && l.info('Alert acknowledged successfully', { alertId: input.alertId });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to acknowledge alert';
            l.error && l.error(errorMessage);
            set({ error: errorMessage, loading: false });
            throw error;
          }
        }
      }),
      {
        name: 'compliance-store',
        partialize: (state) => ({
          activeTab: state.activeTab,
          regulationFilters: state.regulationFilters,
          auditFilters: state.auditFilters,
          findingFilters: state.findingFilters,
          certificationFilters: state.certificationFilters,
          policyFilters: state.policyFilters,
          trainingFilters: state.trainingFilters
        })
      }
    ),
    {
      name: 'compliance-store'
    }
  )
);
