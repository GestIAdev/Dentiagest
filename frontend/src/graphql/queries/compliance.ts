// 🔥 APOLLO NUCLEAR GRAPHQL QUERIES - COMPLIANCE MANAGEMENT
// Date: September 22, 2025
// Mission: GraphQL Queries for Compliance Management V3
// Target: ComplianceManagementV3 Integration

import { gql } from '@apollo/client';

// ============================================================================
// COMPLIANCE DASHBOARD QUERIES
// ============================================================================

// 🎯 GET COMPLIANCE DASHBOARD STATS - Main dashboard metrics
export const GET_COMPLIANCE_DASHBOARD_STATS = gql`
  query GetComplianceDashboardStats {
    complianceDashboardStats {
      totalRegulations
      activeRegulations
      expiringRegulations
      overdueAudits
      upcomingAudits
      activeCertifications
      expiringCertifications
      complianceScore
      openFindings
      criticalFindings
      trainingCompletionRate
      activeAlerts
    }
  }
`;

// ============================================================================
// REGULATION QUERIES
// ============================================================================

// 🎯 GET COMPLIANCE REGULATIONS - Main regulations listing
export const GET_COMPLIANCE_REGULATIONS = gql`
  query GetComplianceRegulations(
    $filters: ComplianceRegulationFilters
  ) {
    complianceRegulations(filters: $filters) {
      id
      name
      description
      category
      version
      effectiveDate
      complianceDeadline
      status
      requirements
      responsibleParty
      lastAuditDate
      nextAuditDate
      complianceScore
      createdAt
      updatedAt
    }
  }
`;

// 🎯 GET COMPLIANCE REGULATION - Single regulation query
export const GET_COMPLIANCE_REGULATION = gql`
  query GetComplianceRegulation($id: UUID!) {
    complianceRegulation(id: $id) {
      id
      name
      description
      category
      version
      effectiveDate
      complianceDeadline
      status
      requirements
      responsibleParty
      lastAuditDate
      nextAuditDate
      complianceScore
      createdAt
      updatedAt
    }
  }
`;

// ============================================================================
// AUDIT QUERIES
// ============================================================================

// 🎯 GET COMPLIANCE AUDITS - Main audits listing
export const GET_COMPLIANCE_AUDITS = gql`
  query GetComplianceAudits(
    $filters: ComplianceAuditFilters
  ) {
    complianceAudits(filters: $filters) {
      id
      regulationId
      regulation {
        id
        name
        category
        version
      }
      title
      description
      type
      status
      scheduledDate
      completedDate
      auditor
      findings {
        id
        severity
        category
        description
        status
        dueDate
        assignedTo
      }
      overallScore
      recommendations
      followUpRequired
      followUpDate
      createdAt
      updatedAt
    }
  }
`;

// 🎯 GET COMPLIANCE AUDIT - Single audit with full details
export const GET_COMPLIANCE_AUDIT = gql`
  query GetComplianceAudit($id: UUID!) {
    complianceAudit(id: $id) {
      id
      regulationId
      regulation {
        id
        name
        description
        category
        version
      }
      title
      description
      type
      status
      scheduledDate
      completedDate
      auditor
      findings {
        id
        severity
        category
        description
        requirement
        evidence
        status
        assignedTo
        dueDate
        resolvedDate
        resolutionNotes
        createdAt
        updatedAt
      }
      overallScore
      recommendations
      followUpRequired
      followUpDate
      createdAt
      updatedAt
    }
  }
`;

// ============================================================================
// FINDINGS QUERIES
// ============================================================================

// 🎯 GET COMPLIANCE FINDINGS - Main findings listing
export const GET_COMPLIANCE_FINDINGS = gql`
  query GetComplianceFindings(
    $filters: ComplianceFindingFilters
  ) {
    complianceFindings(filters: $filters) {
      id
      auditId
      audit {
        id
        title
        regulation {
          id
          name
          category
        }
      }
      severity
      category
      description
      requirement
      evidence
      status
      assignedTo
      dueDate
      resolvedDate
      resolutionNotes
      createdAt
      updatedAt
    }
  }
`;

// ============================================================================
// CERTIFICATION QUERIES
// ============================================================================

// 🎯 GET COMPLIANCE CERTIFICATIONS - Main certifications listing
export const GET_COMPLIANCE_CERTIFICATIONS = gql`
  query GetComplianceCertifications(
    $filters: ComplianceCertificationFilters
  ) {
    complianceCertifications(filters: $filters) {
      id
      name
      issuingBody
      certificationNumber
      issueDate
      expiryDate
      status
      scope
      requirements
      renewalProcess
      contactPerson
      documents
      createdAt
      updatedAt
    }
  }
`;

// ============================================================================
// POLICY QUERIES
// ============================================================================

// 🎯 GET COMPLIANCE POLICIES - Main policies listing
export const GET_COMPLIANCE_POLICIES = gql`
  query GetCompliancePolicies(
    $filters: CompliancePolicyFilters
  ) {
    compliancePolicies(filters: $filters) {
      id
      title
      description
      category
      version
      effectiveDate
      reviewDate
      status
      content
      responsibleParty
      approvalRequired
      approvedBy
      approvalDate
      attachments
      createdAt
      updatedAt
    }
  }
`;

// ============================================================================
// TRAINING QUERIES
// ============================================================================

// 🎯 GET COMPLIANCE TRAININGS - Main trainings listing
export const GET_COMPLIANCE_TRAININGS = gql`
  query GetComplianceTrainings(
    $filters: ComplianceTrainingFilters
  ) {
    complianceTrainings(filters: $filters) {
      id
      title
      description
      policyId
      policy {
        id
        title
        category
      }
      requiredFor
      type
      frequency
      duration
      status
      lastUpdated
      createdAt
    }
  }
`;

// 🎯 GET COMPLIANCE TRAINING RECORDS - Training completion records
export const GET_COMPLIANCE_TRAINING_RECORDS = gql`
  query GetComplianceTrainingRecords(
    $trainingId: UUID
    $userId: UUID
  ) {
    complianceTrainingRecords(
      trainingId: $trainingId
      userId: $userId
    ) {
      id
      trainingId
      training {
        id
        title
        type
        frequency
      }
      userId
      userName
      completedDate
      score
      status
      certificateUrl
      expiryDate
      createdAt
    }
  }
`;

// ============================================================================
// ALERT QUERIES
// ============================================================================

// 🎯 GET COMPLIANCE ALERTS - Active alerts listing
export const GET_COMPLIANCE_ALERTS = gql`
  query GetComplianceAlerts {
    complianceAlerts {
      id
      type
      severity
      title
      message
      relatedEntityId
      relatedEntityType
      dueDate
      acknowledged
      acknowledgedBy
      acknowledgedAt
      createdAt
    }
  }
`;

// ============================================================================
// MUTATION QUERIES
// ============================================================================

// 🎯 CREATE COMPLIANCE REGULATION
export const CREATE_COMPLIANCE_REGULATION = gql`
  mutation CreateComplianceRegulation(
    $input: ComplianceRegulationCreateInput!
  ) {
    createComplianceRegulation(input: $input) {
      id
      name
      description
      category
      version
      effectiveDate
      complianceDeadline
      status
      requirements
      responsibleParty
      complianceScore
      createdAt
      updatedAt
    }
  }
`;

// 🎯 UPDATE COMPLIANCE REGULATION
export const UPDATE_COMPLIANCE_REGULATION = gql`
  mutation UpdateComplianceRegulation(
    $id: UUID!
    $input: ComplianceRegulationUpdateInput!
  ) {
    updateComplianceRegulation(id: $id, input: $input) {
      id
      name
      description
      category
      version
      effectiveDate
      complianceDeadline
      status
      requirements
      responsibleParty
      complianceScore
      updatedAt
    }
  }
`;

// 🎯 DELETE COMPLIANCE REGULATION
export const DELETE_COMPLIANCE_REGULATION = gql`
  mutation DeleteComplianceRegulation($id: UUID!) {
    deleteComplianceRegulation(id: $id)
  }
`;

// 🎯 CREATE COMPLIANCE AUDIT
export const CREATE_COMPLIANCE_AUDIT = gql`
  mutation CreateComplianceAudit(
    $input: ComplianceAuditCreateInput!
  ) {
    createComplianceAudit(input: $input) {
      id
      regulationId
      title
      description
      type
      status
      scheduledDate
      auditor
      createdAt
      updatedAt
    }
  }
`;

// 🎯 UPDATE COMPLIANCE AUDIT
export const UPDATE_COMPLIANCE_AUDIT = gql`
  mutation UpdateComplianceAudit(
    $id: UUID!
    $input: ComplianceAuditUpdateInput!
  ) {
    updateComplianceAudit(id: $id, input: $input) {
      id
      title
      description
      type
      status
      scheduledDate
      completedDate
      auditor
      overallScore
      recommendations
      followUpRequired
      followUpDate
      updatedAt
    }
  }
`;

// 🎯 CREATE COMPLIANCE FINDING
export const CREATE_COMPLIANCE_FINDING = gql`
  mutation CreateComplianceFinding(
    $input: ComplianceFindingCreateInput!
  ) {
    createComplianceFinding(input: $input) {
      id
      auditId
      severity
      category
      description
      requirement
      evidence
      status
      assignedTo
      dueDate
      createdAt
      updatedAt
    }
  }
`;

// 🎯 UPDATE COMPLIANCE FINDING
export const UPDATE_COMPLIANCE_FINDING = gql`
  mutation UpdateComplianceFinding(
    $id: UUID!
    $input: ComplianceFindingUpdateInput!
  ) {
    updateComplianceFinding(id: $id, input: $input) {
      id
      severity
      category
      description
      requirement
      evidence
      status
      assignedTo
      dueDate
      resolvedDate
      resolutionNotes
      updatedAt
    }
  }
`;

// 🎯 CREATE COMPLIANCE CERTIFICATION
export const CREATE_COMPLIANCE_CERTIFICATION = gql`
  mutation CreateComplianceCertification(
    $input: ComplianceCertificationCreateInput!
  ) {
    createComplianceCertification(input: $input) {
      id
      name
      issuingBody
      certificationNumber
      issueDate
      expiryDate
      status
      scope
      requirements
      renewalProcess
      contactPerson
      documents
      createdAt
      updatedAt
    }
  }
`;

// 🎯 UPDATE COMPLIANCE CERTIFICATION
export const UPDATE_COMPLIANCE_CERTIFICATION = gql`
  mutation UpdateComplianceCertification(
    $id: UUID!
    $input: ComplianceCertificationUpdateInput!
  ) {
    updateComplianceCertification(id: $id, input: $input) {
      id
      name
      issuingBody
      certificationNumber
      issueDate
      expiryDate
      status
      scope
      requirements
      renewalProcess
      contactPerson
      documents
      updatedAt
    }
  }
`;

// 🎯 CREATE COMPLIANCE POLICY
export const CREATE_COMPLIANCE_POLICY = gql`
  mutation CreateCompliancePolicy(
    $input: CompliancePolicyCreateInput!
  ) {
    createCompliancePolicy(input: $input) {
      id
      title
      description
      category
      version
      effectiveDate
      reviewDate
      status
      content
      responsibleParty
      approvalRequired
      createdAt
      updatedAt
    }
  }
`;

// 🎯 UPDATE COMPLIANCE POLICY
export const UPDATE_COMPLIANCE_POLICY = gql`
  mutation UpdateCompliancePolicy(
    $id: UUID!
    $input: CompliancePolicyUpdateInput!
  ) {
    updateCompliancePolicy(id: $id, input: $input) {
      id
      title
      description
      category
      version
      effectiveDate
      reviewDate
      status
      content
      responsibleParty
      approvalRequired
      approvedBy
      approvalDate
      attachments
      updatedAt
    }
  }
`;

// 🎯 CREATE COMPLIANCE TRAINING
export const CREATE_COMPLIANCE_TRAINING = gql`
  mutation CreateComplianceTraining(
    $input: ComplianceTrainingCreateInput!
  ) {
    createComplianceTraining(input: $input) {
      id
      title
      description
      policyId
      requiredFor
      type
      frequency
      duration
      status
      createdAt
    }
  }
`;

// 🎯 UPDATE COMPLIANCE TRAINING
export const UPDATE_COMPLIANCE_TRAINING = gql`
  mutation UpdateComplianceTraining(
    $id: UUID!
    $input: ComplianceTrainingUpdateInput!
  ) {
    updateComplianceTraining(id: $id, input: $input) {
      id
      title
      description
      policyId
      requiredFor
      type
      frequency
      duration
      status
      lastUpdated
    }
  }
`;

// 🎯 RECORD COMPLIANCE TRAINING COMPLETION
export const RECORD_COMPLIANCE_TRAINING_COMPLETION = gql`
  mutation RecordComplianceTrainingCompletion(
    $input: ComplianceTrainingRecordCreateInput!
  ) {
    recordComplianceTrainingCompletion(input: $input) {
      id
      trainingId
      userId
      userName
      completedDate
      score
      status
      certificateUrl
      createdAt
    }
  }
`;

// 🎯 ACKNOWLEDGE COMPLIANCE ALERT
export const ACKNOWLEDGE_COMPLIANCE_ALERT = gql`
  mutation AcknowledgeComplianceAlert(
    $input: ComplianceAlertAcknowledgeInput!
  ) {
    acknowledgeComplianceAlert(input: $input) {
      id
      acknowledged
      acknowledgedBy
      acknowledgedAt
    }
  }
`;