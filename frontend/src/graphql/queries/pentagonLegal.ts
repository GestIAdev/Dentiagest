// ⚖️ PENTÁGONO LEGAL - GRAPHQL QUERIES V4
// AI Act 2026 Ready - Compliance as Strategic Weapon
// Created: November 28, 2025

import { gql } from '@apollo/client';

// ============================================================================
// COMPLIANCE SCORE (El corazón del dashboard)
// ============================================================================

export const GET_COMPLIANCE_SCORE_V4 = gql`
  query GetComplianceScoreV4($clinicId: String, $jurisdiction: String) {
    complianceScoreV4(clinicId: $clinicId, jurisdiction: $jurisdiction) {
      overallScore
      totalRules
      rulesPassed
      rulesFailed
      criticalIssues
      highIssues
      mediumIssues
      lowIssues
      breakdown {
        dataPrivacy
        security
        patientRights
        retention
      }
      checks {
        ruleId
        ruleCode
        ruleName
        passed
        details
        severity
        weight
        penalty
      }
      calculatedAt
    }
  }
`;

// ============================================================================
// COMPLIANCE RULES (Reglas de verificación)
// ============================================================================

export const GET_COMPLIANCE_RULES_V4 = gql`
  query GetComplianceRulesV4($jurisdiction: String, $activeOnly: Boolean) {
    complianceRulesV4(jurisdiction: $jurisdiction, activeOnly: $activeOnly) {
      id
      code
      name
      description
      jurisdiction
      regulationReference
      category
      checkType
      severity
      weight
      failurePenalty
      isActive
    }
  }
`;

// ============================================================================
// LEGAL DOCUMENTS (Biblioteca Legal)
// ============================================================================

export const GET_LEGAL_DOCUMENTS_V4 = gql`
  query GetLegalDocumentsV4($jurisdiction: String, $category: String) {
    legalDocumentsV4(jurisdiction: $jurisdiction, category: $category) {
      id
      code
      title
      description
      jurisdiction
      category
      documentType
      contentMarkdown
      filePath
      externalUrl
      version
      effectiveDate
      isMandatory
      isTemplate
      createdAt
      updatedAt
    }
  }
`;

export const GET_LEGAL_DOCUMENT_V4 = gql`
  query GetLegalDocumentV4($id: ID!) {
    legalDocumentV4(id: $id) {
      id
      code
      title
      description
      jurisdiction
      category
      documentType
      contentMarkdown
      filePath
      externalUrl
      version
      effectiveDate
      isMandatory
      isTemplate
      createdAt
      updatedAt
    }
  }
`;

// ============================================================================
// AUDIT LOGS (Auditoría Forense)
// ============================================================================

export const GET_AUDIT_LOGS_V4 = gql`
  query GetAuditLogsV4($entityType: String, $operation: String, $limit: Int, $offset: Int) {
    auditLogsV4(entityType: $entityType, operation: $operation, limit: $limit, offset: $offset) {
      id
      entityType
      entityId
      operation
      userId
      ipAddress
      oldValues
      newValues
      changedFields
      integrityStatus
      createdAt
    }
  }
`;

export const GET_AUDIT_SUMMARY_V4 = gql`
  query GetAuditSummaryV4($days: Int) {
    auditSummaryV4(days: $days) {
      totalOperations
      operationsByType
      operationsByEntity
      integrityIssues
    }
  }
`;

// ============================================================================
// QUICK CHECKS (Para badges en tiempo real)
// ============================================================================

export const GET_CONSENT_COMPLIANCE_CHECK_V4 = gql`
  query GetConsentComplianceCheckV4 {
    consentComplianceCheckV4 {
      compliant
      totalPatients
      missingConsent
    }
  }
`;

// ============================================================================
// MUTATIONS - IGNITION SYSTEM
// ============================================================================

export const SEED_COMPLIANCE_DEFAULTS = gql`
  mutation SeedComplianceDefaults {
    seedComplianceDefaults {
      success
      rulesSeeded
      documentsSeeded
      message
    }
  }
`;

export const RUN_COMPLIANCE_CHECK = gql`
  mutation RunComplianceCheck($clinicId: String, $jurisdiction: String) {
    runComplianceCheck(clinicId: $clinicId, jurisdiction: $jurisdiction) {
      success
      score
      message
    }
  }
`;
