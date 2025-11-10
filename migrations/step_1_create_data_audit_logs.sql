-- ============================================================================
-- 🔥 PHASE 3 STEP 1: THE FOUNDATION - DATA AUDIT LOGS
-- ============================================================================
-- Created: November 10, 2025
-- Mission: Replace removed _veritas verification system with real audit logging
-- Status: FOUNDATION TABLES FOR VERIFICATION ENGINE
-- ============================================================================

-- 1. CREAR LA TABLA PRINCIPAL DE AUDITORÍA DE DATOS
-- ============================================================================
-- This is THE CORE of PHASE 3: Real-time audit logging of all data changes
-- Stores BEFORE and AFTER values for every mutation operation
-- ============================================================================

CREATE TABLE data_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- ========== ENTITY IDENTIFICATION ==========
  -- Which entity (type + id) was affected by this operation
  entity_type VARCHAR(50) NOT NULL,    -- "InventoryV3", "MaterialV3", "BillingDataV3", etc.
  entity_id VARCHAR(255) NOT NULL,     -- UUID or string ID of the entity
  
  -- ========== OPERATION TRACKING ==========
  -- What happened to this entity
  operation VARCHAR(20) NOT NULL,      -- "CREATE", "UPDATE", "DELETE_HARD", "DELETE_SOFT"
  
  -- ========== USER & CONTEXT ==========
  -- Who did it and from where
  user_id VARCHAR(255),                -- ID of user who performed operation
  ip_address VARCHAR(100),             -- Source IP for security audit
  session_id VARCHAR(255),             -- Session tracking for multi-step operations
  
  -- ========== THE CHANGE (CORE OF PHASE 3) ==========
  -- Before and after values - the heart of verification
  old_values JSONB,                    -- Previous values (for UPDATE operations)
  new_values JSONB,                    -- New values (for CREATE/UPDATE operations)
  changed_fields TEXT[],               -- Array of field names that changed
  
  -- ========== INTEGRITY VERIFICATION ==========
  -- Verification status from VerificationEngine
  integrity_status VARCHAR(20) DEFAULT 'PENDING',  -- "VALID", "WARNING", "CRITICAL", "FAILED"
  integrity_checks_passed INT DEFAULT 0,           -- Count of passing checks
  integrity_checks_failed INT DEFAULT 0,           -- Count of failing checks
  verification_notes TEXT,              -- Details of any verification failures
  
  -- ========== CASCADING OPERATIONS ==========
  -- For tracking cascade deletes and complex mutations
  parent_operation_id UUID,             -- Reference to parent operation (if cascade)
  cascade_child_count INT DEFAULT 0,    -- Number of cascaded operations
  cascade_table_name VARCHAR(100),      -- If cascade, which child table
  
  -- ========== SOFT DELETE TRACKING ==========
  -- Special handling for soft deletes
  soft_delete_reason VARCHAR(255),      -- Why was this soft-deleted (e.g., "FK constraint violation")
  
  -- ========== IMMUTABILITY TRACKING ==========
  -- For fields that must never change (like document hash)
  immutable_field_violations TEXT[],   -- List of immutable fields that were attempted to change
  
  -- ========== TIMESTAMP ==========
  -- When did this happen (with timezone)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment to table
COMMENT ON TABLE data_audit_logs IS 
'Core audit logging table for PHASE 3 verification system. Tracks all mutations with before/after values for data integrity verification.';

COMMENT ON COLUMN data_audit_logs.entity_type IS 
'GraphQL type name: InventoryV3, MaterialV3, BillingDataV3, DocumentV3, ComplianceV3, etc.';

COMMENT ON COLUMN data_audit_logs.old_values IS 
'JSONB object with previous state - used for integrity checking on UPDATE and validating changes';

COMMENT ON COLUMN data_audit_logs.new_values IS 
'JSONB object with new state - used for verifying constraints and business rules';

COMMENT ON COLUMN data_audit_logs.integrity_status IS 
'VALID=all checks passed, WARNING=minor issues, CRITICAL=verification failed, FAILED=database error';

-- ============================================================================
-- 2. CREATE INDEXES FOR FAST LOOKUPS
-- ============================================================================
-- These indexes support the most common query patterns

-- Index 1: Find all operations for a specific entity (timeline view)
CREATE INDEX idx_data_audit_entity 
  ON data_audit_logs (entity_type, entity_id, timestamp DESC);

COMMENT ON INDEX idx_data_audit_entity IS 
'Support queries: "Get all audit log entries for InventoryV3 with ID X" for timeline views';

-- Index 2: Find integrity violations (for dashboard)
CREATE INDEX idx_data_audit_integrity 
  ON data_audit_logs (integrity_status, timestamp DESC);

COMMENT ON INDEX idx_data_audit_integrity IS 
'Support queries: "Get all CRITICAL integrity violations in last 24 hours"';

-- Index 3: Find operations by user (for security audit trail)
CREATE INDEX idx_data_audit_user 
  ON data_audit_logs (user_id, timestamp DESC);

COMMENT ON INDEX idx_data_audit_user IS 
'Support queries: "Get all operations performed by user X for compliance audit"';

-- Index 4: Find cascade operations (for understanding impact)
CREATE INDEX idx_data_audit_cascade 
  ON data_audit_logs (parent_operation_id, timestamp DESC);

COMMENT ON INDEX idx_data_audit_cascade IS 
'Support queries: "Get all cascaded operations from parent operation ID"';

-- Index 5: Find soft deletes with violations
CREATE INDEX idx_data_audit_soft_deletes 
  ON data_audit_logs (entity_type, soft_delete_reason) 
  WHERE operation = 'DELETE_SOFT';

COMMENT ON INDEX idx_data_audit_soft_deletes IS 
'Support queries: "Get all soft-deleted entities and reason why"';

-- Index 6: Quick lookup for immutable field violations
CREATE INDEX idx_data_audit_immutable_violations
  ON data_audit_logs (entity_type, operation)
  WHERE immutable_field_violations IS NOT NULL;

COMMENT ON INDEX idx_data_audit_immutable_violations IS 
'Support queries: "Get all attempts to modify immutable fields"';

-- ============================================================================
-- 3. CREATE PARTITION STRATEGY (OPTIONAL FOR LARGE SCALE)
-- ============================================================================
-- Uncomment if you need to partition by time for very high volume
-- CREATE INDEX idx_data_audit_timestamp ON data_audit_logs (timestamp);
-- -- Later: partition by month for massive tables
-- -- ALTER TABLE data_audit_logs PARTITION BY RANGE (DATE_TRUNC('month', timestamp))

-- ============================================================================
-- 4. CREATE VIEW FOR COMMON QUERIES
-- ============================================================================

-- View 1: Recent critical violations (dashboard friendly)
CREATE VIEW v_critical_violations AS
SELECT 
  id,
  entity_type,
  entity_id,
  operation,
  user_id,
  verification_notes,
  timestamp
FROM data_audit_logs
WHERE integrity_status = 'CRITICAL'
  AND timestamp > NOW() - INTERVAL '7 days'
ORDER BY timestamp DESC;

COMMENT ON VIEW v_critical_violations IS 
'Dashboard view showing critical integrity violations from past 7 days';

-- View 2: Entity change history (for timeline)
CREATE VIEW v_entity_history AS
SELECT 
  entity_type,
  entity_id,
  operation,
  user_id,
  changed_fields,
  old_values,
  new_values,
  integrity_status,
  timestamp
FROM data_audit_logs
ORDER BY entity_type, entity_id, timestamp DESC;

COMMENT ON VIEW v_entity_history IS 
'Complete change history for any entity - used for timeline/history views';

-- View 3: Soft delete tracking
CREATE VIEW v_soft_deleted_entities AS
SELECT 
  entity_type,
  entity_id,
  soft_delete_reason,
  user_id,
  timestamp
FROM data_audit_logs
WHERE operation = 'DELETE_SOFT'
ORDER BY timestamp DESC;

COMMENT ON VIEW v_soft_deleted_entities IS 
'Track which entities are soft-deleted and why - for compliance/GDPR';

-- ============================================================================
-- 5. PERFORMANCE OPTIMIZATION: SUMMARY MATERIALIZED VIEW
-- ============================================================================
-- This is optional but HIGHLY RECOMMENDED for dashboards

CREATE MATERIALIZED VIEW mv_audit_summary_daily AS
SELECT 
  DATE(timestamp) AS audit_date,
  entity_type,
  operation,
  COUNT(*) AS operation_count,
  SUM(CASE WHEN integrity_status = 'VALID' THEN 1 ELSE 0 END) AS valid_count,
  SUM(CASE WHEN integrity_status = 'WARNING' THEN 1 ELSE 0 END) AS warning_count,
  SUM(CASE WHEN integrity_status = 'CRITICAL' THEN 1 ELSE 0 END) AS critical_count,
  SUM(CASE WHEN integrity_status = 'FAILED' THEN 1 ELSE 0 END) AS failed_count
FROM data_audit_logs
GROUP BY DATE(timestamp), entity_type, operation;

CREATE INDEX idx_audit_summary_date ON mv_audit_summary_daily (audit_date DESC);

COMMENT ON MATERIALIZED VIEW mv_audit_summary_daily IS 
'Daily summary for dashboard - refresh every hour. Use: SELECT * FROM mv_audit_summary_daily WHERE audit_date > NOW()::DATE - INTERVAL 30 days';

-- ============================================================================
-- 6. FUNCTION: REFRESH MATERIALIZED VIEW (FOR SCHEDULER)
-- ============================================================================

CREATE OR REPLACE FUNCTION refresh_audit_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_audit_summary_daily;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION refresh_audit_summary() IS 
'Refresh the audit summary materialized view. Call every hour from scheduler: SELECT refresh_audit_summary();';

-- ============================================================================
-- 7. TRIGGER: AUTO-UPDATE TIMESTAMP COLUMN (OPTIONAL)
-- ============================================================================
-- PostgreSQL note: created_at and timestamp should be the same,
-- but if you want safety, add this trigger:

CREATE OR REPLACE FUNCTION update_data_audit_logs_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.timestamp = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_data_audit_logs_timestamp
BEFORE UPDATE ON data_audit_logs
FOR EACH ROW
EXECUTE FUNCTION update_data_audit_logs_timestamp();

COMMENT ON TRIGGER trg_data_audit_logs_timestamp ON data_audit_logs IS 
'Ensures timestamp is always current on UPDATE operations';

-- ============================================================================
-- 8. DATA RETENTION POLICY (OPTIONAL)
-- ============================================================================
-- Uncomment if you want automatic cleanup of old audit logs
-- WARNING: This will DELETE data permanently after X days

-- CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
-- RETURNS void AS $$
-- BEGIN
--   DELETE FROM data_audit_logs
--   WHERE timestamp < NOW() - INTERVAL '90 days'
--     AND integrity_status IN ('VALID', 'WARNING');  -- Keep CRITICAL for longer
--   RAISE NOTICE 'Deleted % rows older than 90 days', FOUND;
-- END;
-- $$ LANGUAGE plpgsql;

-- ============================================================================
-- FINAL VALIDATION
-- ============================================================================

-- Verify table was created successfully
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'data_audit_logs') THEN
    RAISE NOTICE '✅ data_audit_logs table created successfully';
  ELSE
    RAISE EXCEPTION '❌ Failed to create data_audit_logs table';
  END IF;
END $$;

-- ============================================================================
-- MIGRATION METADATA
-- ============================================================================
-- This migration is idempotent: safe to run multiple times
-- Down migration: DROP TABLE data_audit_logs CASCADE;
-- Version: 1.0
-- Author: PunkClaude + Radwulf
-- Date: 2025-11-10
