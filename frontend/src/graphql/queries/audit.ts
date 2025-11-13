/**
 * 🔥 AUDIT QUERIES - Real-Time Audit Trail & Verification
 * By PunkClaude & Radwulf - November 13, 2025
 * 
 * Purpose: Connect frontend to AuditDatabase for real-time compliance verification
 * Philosophy: "Cero Mocks" - All data from actual audit logs
 */

import { gql } from '@apollo/client';

// ============================================================================
// VERIFICATION DASHBOARD QUERY
// ============================================================================
/**
 * 🎯 VERIFICATION_DASHBOARD
 * 
 * Real-time dashboard metrics from AuditDatabase
 * - reportDate: Timestamp del reporte más reciente
 * - totalOperations: Total de operaciones auditadas
 * - failedChecks: Checks que fallaron en Gate 1 (VERIFICACIÓN)
 * - criticalIssues: Issues críticos detectados
 * - warningIssues: Issues de advertencia
 * - integrityScore: Puntuación de integridad (0-100)
 * 
 * Poll Interval: 30000ms (30 segundos) para datos en tiempo real
 */
export const VERIFICATION_DASHBOARD = gql`
  query VerificationDashboard {
    verificationDashboard {
      reportDate
      totalOperations
      failedChecks
      criticalIssues
      warningIssues
      integrityScore
    }
  }
`;

// ============================================================================
// AUDIT TRAIL QUERY
// ============================================================================
/**
 * 🎯 AUDIT_TRAIL
 * 
 * Historial completo de mutaciones para una entidad específica
 * - entityType: Tipo de entidad (ComplianceRegulationV3, audit, finding, etc.)
 * - entityId: ID de la entidad
 * - limit: Número máximo de registros a retornar (default: 100)
 * 
 * Response fields:
 * - entityType: Tipo de entidad auditada
 * - entityId: ID de la entidad
 * - totalMutations: Total de mutaciones registradas
 * - history: Array de operaciones con:
 *   - id: ID único del registro de auditoría
 *   - operation: CREATE, UPDATE, DELETE, SOFT_DELETE, INTEGRITY_VIOLATION
 *   - oldValues: Valores anteriores (null para CREATE)
 *   - newValues: Valores nuevos (null para DELETE)
 *   - changedFields: Array de campos que cambiaron
 *   - userId: ID del usuario que ejecutó la operación
 *   - timestamp: Fecha/hora de la operación
 *   - integrityStatus: PASSED, FAILED, WARNED
 */
export const AUDIT_TRAIL = gql`
  query AuditTrail(
    $entityType: String!
    $entityId: String!
    $limit: Int = 100
  ) {
    auditTrail(
      entityType: $entityType
      entityId: $entityId
      limit: $limit
    ) {
      entityType
      entityId
      totalMutations
      history {
        id
        operation
        oldValues
        newValues
        changedFields
        userId
        userEmail
        ipAddress
        timestamp
        integrityStatus
      }
    }
  }
`;

// ============================================================================
// COMPLIANCE REGULATION AUDIT QUERY
// ============================================================================
/**
 * 🎯 COMPLIANCE_REGULATION_AUDIT
 * 
 * Auditoría completa de una regulación específica
 * Incluye: historial, cambios, integridad verificada
 */
export const COMPLIANCE_REGULATION_AUDIT = gql`
  query ComplianceRegulationAudit($regulationId: String!) {
    auditTrail(
      entityType: "ComplianceRegulationV3"
      entityId: $regulationId
      limit: 500
    ) {
      entityType
      entityId
      totalMutations
      history {
        id
        operation
        oldValues
        newValues
        changedFields
        userId
        userEmail
        timestamp
        integrityStatus
      }
    }
  }
`;

// ============================================================================
// AUDIT DETAIL QUERY
// ============================================================================
/**
 * 🎯 AUDIT_DETAIL
 * 
 * Detalles completos de una auditoría específica
 */
export const AUDIT_DETAIL = gql`
  query AuditDetail($auditId: String!) {
    auditTrail(
      entityType: "audit"
      entityId: $auditId
      limit: 500
    ) {
      entityType
      entityId
      totalMutations
      history {
        id
        operation
        oldValues
        newValues
        changedFields
        userId
        userEmail
        ipAddress
        timestamp
        integrityStatus
      }
    }
  }
`;

// ============================================================================
// FINDING AUDIT QUERY
// ============================================================================
/**
 * 🎯 FINDING_AUDIT
 * 
 * Auditoría completa de un hallazgo específico
 */
export const FINDING_AUDIT = gql`
  query FindingAudit($findingId: String!) {
    auditTrail(
      entityType: "finding"
      entityId: $findingId
      limit: 500
    ) {
      entityType
      entityId
      totalMutations
      history {
        id
        operation
        oldValues
        newValues
        changedFields
        userId
        userEmail
        ipAddress
        timestamp
        integrityStatus
      }
    }
  }
`;

// ============================================================================
// INTEGRITY VIOLATIONS QUERY
// ============================================================================
/**
 * 🎯 INTEGRITY_VIOLATIONS
 * 
 * Listado de violaciones de integridad detectadas
 */
export const INTEGRITY_VIOLATIONS = gql`
  query IntegrityViolations(
    $entityType: String
    $minSeverity: String = "WARNING"
    $limit: Int = 100
  ) {
    integrityViolations(
      entityType: $entityType
      minSeverity: $minSeverity
      limit: $limit
    ) {
      id
      entityType
      entityId
      severity
      description
      detectedAt
      resolvedAt
      status
    }
  }
`;

// ============================================================================
// DASHBOARD WITH TRENDS QUERY
// ============================================================================
/**
 * 🎯 VERIFICATION_DASHBOARD_WITH_TRENDS
 * 
 * Dashboard con histórico de cambios (últimas 24 horas)
 */
export const VERIFICATION_DASHBOARD_WITH_TRENDS = gql`
  query VerificationDashboardWithTrends($timeRange: String = "24h") {
    verificationDashboard {
      reportDate
      totalOperations
      failedChecks
      criticalIssues
      warningIssues
      integrityScore
    }
    trends(timeRange: $timeRange) {
      timestamp
      integrityScore
      totalOperations
      failedChecks
      criticalIssues
    }
  }
`;
