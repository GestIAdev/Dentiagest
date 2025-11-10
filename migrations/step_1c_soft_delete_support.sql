-- ============================================================================
-- 🔥 PHASE 3 STEP 1C: SOFT DELETE SUPPORT - ADD DELETED_AT COLUMNS
-- ============================================================================
-- Created: November 10, 2025
-- Mission: Enable soft-delete capability for tables with FK dependencies
-- Status: SOFT DELETE INFRASTRUCTURE
-- ============================================================================

-- ============================================================================
-- 1. ADD SOFT DELETE COLUMNS TO TABLES WITH CONSTRAINTS
-- ============================================================================

-- TABLE: suppliers (referenced by materials, purchase_orders)
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(255);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS deleted_reason VARCHAR(255);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

CREATE INDEX idx_suppliers_deleted ON suppliers(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_suppliers_active ON suppliers(is_active) WHERE is_active = true;

COMMENT ON COLUMN suppliers.deleted_at IS 'Timestamp when supplier was soft-deleted (NULL = not deleted)';
COMMENT ON COLUMN suppliers.deleted_reason IS 'Reason for soft-deletion (e.g., "FK constraint violation on materials")';
COMMENT ON COLUMN suppliers.is_active IS 'Active flag - soft-deleted suppliers have is_active = false';

-- TABLE: dental_materials (referenced by purchase_order_items)
ALTER TABLE dental_materials ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE dental_materials ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(255);
ALTER TABLE dental_materials ADD COLUMN IF NOT EXISTS deleted_reason VARCHAR(255);
ALTER TABLE dental_materials ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

CREATE INDEX idx_dental_materials_deleted ON dental_materials(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_dental_materials_active ON dental_materials(is_active) WHERE is_active = true;

COMMENT ON COLUMN dental_materials.deleted_at IS 'Timestamp when material was soft-deleted (NULL = not deleted)';
COMMENT ON COLUMN dental_materials.is_active IS 'Active flag - used by FK verification engine';

-- TABLE: purchase_orders (parent of purchase_order_items)
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(255);
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS deleted_reason VARCHAR(255);
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

CREATE INDEX idx_purchase_orders_deleted ON purchase_orders(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_purchase_orders_active ON purchase_orders(is_active) WHERE is_active = true;

COMMENT ON COLUMN purchase_orders.deleted_at IS 'Timestamp when PO was soft-deleted (NULL = not deleted)';
COMMENT ON COLUMN purchase_orders.is_active IS 'Active flag for query filtering';

-- TABLE: documents (compliance/GDPR - ALWAYS soft delete, never hard delete)
ALTER TABLE documents ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(255);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS deleted_reason VARCHAR(255);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

CREATE INDEX idx_documents_deleted ON documents(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_documents_active ON documents(is_active) WHERE is_active = true;

COMMENT ON COLUMN documents.deleted_at IS 'Timestamp when document was deleted (soft delete for compliance)';
COMMENT ON COLUMN documents.is_active IS 'Active flag - soft-deleted docs excluded from queries';

-- TABLE: patients (parent of appointments, treatments, medical_records, documents)
ALTER TABLE patients ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(255);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS deleted_reason VARCHAR(255);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

CREATE INDEX idx_patients_deleted ON patients(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_patients_active ON patients(is_active) WHERE is_active = true;

COMMENT ON COLUMN patients.deleted_at IS 'Timestamp when patient was soft-deleted';
COMMENT ON COLUMN patients.is_active IS 'Active flag - used in most queries';

-- TABLE: appointments (related to patients)
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(255);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS deleted_reason VARCHAR(255);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

CREATE INDEX idx_appointments_deleted ON appointments(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_appointments_active ON appointments(is_active) WHERE is_active = true;

-- TABLE: medical_records (related to patients)
ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(255);
ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS deleted_reason VARCHAR(255);
ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

CREATE INDEX idx_medical_records_deleted ON medical_records(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_medical_records_active ON medical_records(is_active) WHERE is_active = true;

-- TABLE: treatments (related to patients)
ALTER TABLE treatments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE treatments ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(255);
ALTER TABLE treatments ADD COLUMN IF NOT EXISTS deleted_reason VARCHAR(255);
ALTER TABLE treatments ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

CREATE INDEX idx_treatments_deleted ON treatments(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_treatments_active ON treatments(is_active) WHERE is_active = true;

-- ============================================================================
-- 2. CREATE VIEWS FOR SOFT DELETE FILTERING
-- ============================================================================

-- View: Get only ACTIVE (non-deleted) suppliers
CREATE OR REPLACE VIEW v_suppliers_active AS
SELECT *
FROM suppliers
WHERE deleted_at IS NULL AND is_active = true;

COMMENT ON VIEW v_suppliers_active IS 
'Query active suppliers - excludes soft-deleted. Use for all supplier queries by default.';

-- View: Get only ACTIVE materials
CREATE OR REPLACE VIEW v_dental_materials_active AS
SELECT *
FROM dental_materials
WHERE deleted_at IS NULL AND is_active = true;

COMMENT ON VIEW v_dental_materials_active IS 
'Query active materials - excludes soft-deleted. Use for inventory/materials queries.';

-- View: Get only ACTIVE purchase orders
CREATE OR REPLACE VIEW v_purchase_orders_active AS
SELECT *
FROM purchase_orders
WHERE deleted_at IS NULL AND is_active = true;

COMMENT ON VIEW v_purchase_orders_active IS 
'Query active purchase orders - excludes soft-deleted. Use for PO queries.';

-- View: Get only ACTIVE documents (compliance-important)
CREATE OR REPLACE VIEW v_documents_active AS
SELECT *
FROM documents
WHERE deleted_at IS NULL AND is_active = true;

COMMENT ON VIEW v_documents_active IS 
'Query active documents - excludes soft-deleted. Retained documents still queryable via other views.';

-- View: Get only ACTIVE patients
CREATE OR REPLACE VIEW v_patients_active AS
SELECT *
FROM patients
WHERE deleted_at IS NULL AND is_active = true;

COMMENT ON VIEW v_patients_active IS 
'Query active patients - excludes soft-deleted. Use for all patient-facing queries.';

-- View: All soft-deleted records (for audit/recovery)
CREATE OR REPLACE VIEW v_soft_deleted_all AS
SELECT 
  'suppliers' AS table_name,
  id,
  deleted_at,
  deleted_by,
  deleted_reason
FROM suppliers
WHERE deleted_at IS NOT NULL

UNION ALL

SELECT 'dental_materials', id, deleted_at, deleted_by, deleted_reason
FROM dental_materials
WHERE deleted_at IS NOT NULL

UNION ALL

SELECT 'purchase_orders', id, deleted_at, deleted_by, deleted_reason
FROM purchase_orders
WHERE deleted_at IS NOT NULL

UNION ALL

SELECT 'documents', id, deleted_at, deleted_by, deleted_reason
FROM documents
WHERE deleted_at IS NOT NULL

UNION ALL

SELECT 'patients', id, deleted_at, deleted_by, deleted_reason
FROM patients
WHERE deleted_at IS NOT NULL

ORDER BY deleted_at DESC;

COMMENT ON VIEW v_soft_deleted_all IS 
'Track all soft-deleted entities across tables - useful for compliance/recovery';

-- ============================================================================
-- 3. CREATE UTILITY FUNCTIONS
-- ============================================================================

-- Function 1: Check if entity is soft-deleted
CREATE OR REPLACE FUNCTION is_soft_deleted(
  p_table_name VARCHAR,
  p_entity_id VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
  v_deleted_at TIMESTAMP WITH TIME ZONE;
BEGIN
  CASE p_table_name
    WHEN 'suppliers' THEN
      SELECT deleted_at INTO v_deleted_at FROM suppliers WHERE id = p_entity_id;
    WHEN 'dental_materials' THEN
      SELECT deleted_at INTO v_deleted_at FROM dental_materials WHERE id = p_entity_id;
    WHEN 'purchase_orders' THEN
      SELECT deleted_at INTO v_deleted_at FROM purchase_orders WHERE id = p_entity_id;
    WHEN 'documents' THEN
      SELECT deleted_at INTO v_deleted_at FROM documents WHERE id = p_entity_id;
    WHEN 'patients' THEN
      SELECT deleted_at INTO v_deleted_at FROM patients WHERE id = p_entity_id;
    ELSE
      RETURN NULL;
  END CASE;
  
  RETURN v_deleted_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION is_soft_deleted(VARCHAR, VARCHAR) IS 
'Check if entity is soft-deleted: SELECT is_soft_deleted(''suppliers'', supplier_id)';

-- Function 2: Soft-delete an entity
CREATE OR REPLACE FUNCTION soft_delete_entity(
  p_table_name VARCHAR,
  p_entity_id VARCHAR,
  p_deleted_by VARCHAR,
  p_deleted_reason VARCHAR
) RETURNS BOOLEAN AS $$
BEGIN
  CASE p_table_name
    WHEN 'suppliers' THEN
      UPDATE suppliers 
      SET deleted_at = NOW(), deleted_by = p_deleted_by, deleted_reason = p_deleted_reason, is_active = false
      WHERE id = p_entity_id;
    WHEN 'dental_materials' THEN
      UPDATE dental_materials 
      SET deleted_at = NOW(), deleted_by = p_deleted_by, deleted_reason = p_deleted_reason, is_active = false
      WHERE id = p_entity_id;
    WHEN 'purchase_orders' THEN
      UPDATE purchase_orders 
      SET deleted_at = NOW(), deleted_by = p_deleted_by, deleted_reason = p_deleted_reason, is_active = false
      WHERE id = p_entity_id;
    WHEN 'documents' THEN
      UPDATE documents 
      SET deleted_at = NOW(), deleted_by = p_deleted_by, deleted_reason = p_deleted_reason, is_active = false
      WHERE id = p_entity_id;
    WHEN 'patients' THEN
      UPDATE patients 
      SET deleted_at = NOW(), deleted_by = p_deleted_by, deleted_reason = p_deleted_reason, is_active = false
      WHERE id = p_entity_id;
    ELSE
      RETURN FALSE;
  END CASE;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION soft_delete_entity(VARCHAR, VARCHAR, VARCHAR, VARCHAR) IS 
'Soft-delete entity: SELECT soft_delete_entity(''suppliers'', supplier_id, user_id, ''Constraint violation'')';

-- Function 3: Restore soft-deleted entity
CREATE OR REPLACE FUNCTION restore_soft_deleted_entity(
  p_table_name VARCHAR,
  p_entity_id VARCHAR
) RETURNS BOOLEAN AS $$
BEGIN
  CASE p_table_name
    WHEN 'suppliers' THEN
      UPDATE suppliers 
      SET deleted_at = NULL, deleted_by = NULL, deleted_reason = NULL, is_active = true
      WHERE id = p_entity_id;
    WHEN 'dental_materials' THEN
      UPDATE dental_materials 
      SET deleted_at = NULL, deleted_by = NULL, deleted_reason = NULL, is_active = true
      WHERE id = p_entity_id;
    WHEN 'purchase_orders' THEN
      UPDATE purchase_orders 
      SET deleted_at = NULL, deleted_by = NULL, deleted_reason = NULL, is_active = true
      WHERE id = p_entity_id;
    WHEN 'documents' THEN
      UPDATE documents 
      SET deleted_at = NULL, deleted_by = NULL, deleted_reason = NULL, is_active = true
      WHERE id = p_entity_id;
    WHEN 'patients' THEN
      UPDATE patients 
      SET deleted_at = NULL, deleted_by = NULL, deleted_reason = NULL, is_active = true
      WHERE id = p_entity_id;
    ELSE
      RETURN FALSE;
  END CASE;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION restore_soft_deleted_entity(VARCHAR, VARCHAR) IS 
'Restore soft-deleted entity: SELECT restore_soft_deleted_entity(''suppliers'', supplier_id)';

-- ============================================================================
-- 4. CREATE SOFT DELETE CONFIG TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS soft_delete_config (
  entity_type VARCHAR(100) PRIMARY KEY,
  table_name VARCHAR(100) NOT NULL,
  cascade_tables TEXT[],        -- Child tables affected by soft delete
  allow_hard_delete BOOLEAN DEFAULT false,  -- Whether hard delete is allowed
  retention_days INT DEFAULT 90,             -- How long to keep soft-deleted
  active BOOLEAN DEFAULT true
);

INSERT INTO soft_delete_config (entity_type, table_name, cascade_tables, allow_hard_delete, retention_days, active)
VALUES 
  ('SupplierV3', 'suppliers', ARRAY['dental_materials', 'purchase_orders'], false, 365, true),
  ('MaterialV3', 'dental_materials', ARRAY['purchase_order_items'], false, 365, true),
  ('PurchaseOrderV3', 'purchase_orders', ARRAY['purchase_order_items'], false, 90, true),
  ('DocumentV3', 'documents', ARRAY[]::TEXT[], false, 2555, true),  -- 7 years for compliance
  ('PatientV3', 'patients', ARRAY['appointments', 'medical_records', 'treatments', 'documents'], false, 365, true)
ON CONFLICT (entity_type) DO UPDATE SET active = true;

COMMENT ON TABLE soft_delete_config IS 
'Configuration for soft-delete behavior per entity type. Controls cascading, retention, and hard-delete permissions.';

COMMENT ON COLUMN soft_delete_config.cascade_tables IS 
'Which child tables are cascade soft-deleted when parent is deleted. Empty array = no cascade.';

COMMENT ON COLUMN soft_delete_config.retention_days IS 
'Days to keep soft-deleted records before automatic purge. DocumentV3 = 2555 days (7 years) for compliance.';

-- ============================================================================
-- 5. FINAL VALIDATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Soft-delete support added to suppliers, dental_materials, purchase_orders, documents, patients';
  RAISE NOTICE '✅ Created utility functions: is_soft_deleted(), soft_delete_entity(), restore_soft_deleted_entity()';
  RAISE NOTICE '✅ Created views: v_*_active for filtering, v_soft_deleted_all for audit';
  RAISE NOTICE '✅ Soft-delete config table populated with cascade rules and retention policies';
END $$;

-- ============================================================================
-- MIGRATION METADATA
-- ============================================================================
-- This migration is idempotent: safe to run multiple times (uses IF NOT EXISTS)
-- Down migration: ALTER TABLE suppliers DROP COLUMN deleted_at, deleted_by, deleted_reason, is_active;
-- Version: 1.2
-- Author: PunkClaude + Radwulf
-- Date: 2025-11-10
-- Tables modified: 7 (suppliers, dental_materials, purchase_orders, documents, patients, appointments, medical_records, treatments)
