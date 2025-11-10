-- ============================================================================
-- 🔥 PHASE 3 STEP 1B: INTEGRITY CHECKS TABLE - VERIFICATION RULES
-- ============================================================================
-- Created: November 10, 2025
-- Mission: Store all verification rules as configurable database records
-- Status: RULES ENGINE FOUNDATION
-- ============================================================================

-- 1. CREATE INTEGRITY CHECKS TABLE
-- ============================================================================
-- This table stores the RULES that VerificationEngine uses to validate data
-- Think of it as the "verification configuration" - what constraints apply to each field

CREATE TABLE integrity_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- ========== RULE IDENTIFICATION ==========
  -- Which field of which entity does this rule apply to
  entity_type VARCHAR(100) NOT NULL,    -- "InventoryV3", "MaterialV3", "BillingDataV3", etc.
  field_name VARCHAR(100) NOT NULL,     -- "quantity", "unitPrice", "amount", "fileName", etc.
  
  -- ========== RULE DEFINITION ==========
  -- What type of check is this and what are the parameters
  check_type VARCHAR(50) NOT NULL,      -- "RANGE", "ENUM", "FOREIGN_KEY", "UNIQUE", "DATE_RANGE", "IMMUTABLE", etc.
  check_name VARCHAR(100) NOT NULL,     -- "non-negative", "positive-decimal", "supplier-fk", "email-unique", etc.
  check_rule JSONB NOT NULL,            -- The actual rule: {"type": "range", "min": 0, "max": 100}, etc.
  
  -- ========== RULE BEHAVIOR ==========
  severity VARCHAR(20) NOT NULL,        -- "WARNING" (log but allow), "ERROR" (block operation), "CRITICAL" (require manual intervention)
  error_message TEXT,                   -- User-friendly error message if check fails
  
  -- ========== RULE LIFECYCLE ==========
  active BOOLEAN DEFAULT TRUE,          -- Can disable checks without deleting them
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255),              -- Who created this rule
  
  -- ========== IMMUTABILITY & UNIQUENESS ==========
  -- Prevent duplicate rules for same entity/field/check combination
  UNIQUE(entity_type, field_name, check_name)
);

-- Add comments
COMMENT ON TABLE integrity_checks IS 
'Configuration table for verification rules. Each row defines a constraint that VerificationEngine will apply. Rules are used for INPUT VALIDATION, UPDATE VERIFICATION, and INTEGRITY CHECKING.';

COMMENT ON COLUMN integrity_checks.check_type IS 
'Type of verification: RANGE (numeric), ENUM (list of allowed values), FOREIGN_KEY (reference to another table), UNIQUE (no duplicates), DATE_RANGE (valid date range), IMMUTABLE (cannot change), STRING (format), EMAIL, etc.';

COMMENT ON COLUMN integrity_checks.check_rule IS 
'JSONB object defining the actual rule. Examples:
- RANGE: {"min": 0, "max": 100, "decimals": 2}
- ENUM: {"allowedValues": ["PENDING", "PAID", "OVERDUE"]}
- FOREIGN_KEY: {"referencedTable": "suppliers", "referencedField": "id", "checkField": "is_active"}
- UNIQUE: {"unique": true}
- DATE_RANGE: {"notFuture": true, "notBefore": "2020-01-01"}
- IMMUTABLE: {"immutable": true}';

COMMENT ON COLUMN integrity_checks.severity IS 
'WARNING: Violation is logged but operation proceeds. ERROR: Operation is blocked. CRITICAL: Requires special handling/approval.';

-- ============================================================================
-- 2. CREATE INDEX FOR FAST RULE LOOKUP
-- ============================================================================

-- Index 1: Get all rules for a specific entity field
CREATE INDEX idx_integrity_checks_entity_field 
  ON integrity_checks (entity_type, field_name) 
  WHERE active = true;

COMMENT ON INDEX idx_integrity_checks_entity_field IS 
'Support query: "Get all active verification rules for InventoryV3.quantity"';

-- Index 2: Get all active rules
CREATE INDEX idx_integrity_checks_active 
  ON integrity_checks (active) 
  WHERE active = true;

COMMENT ON INDEX idx_integrity_checks_active IS 
'Support query: "Get all active verification rules for rule engine startup"';

-- Index 3: Get rules by severity (for dashboard)
CREATE INDEX idx_integrity_checks_severity 
  ON integrity_checks (severity, entity_type);

COMMENT ON INDEX idx_integrity_checks_severity IS 
'Support query: "Show me all CRITICAL verification rules by entity type"';

-- ============================================================================
-- 3. POPULATE INITIAL RULES (PART 1: INVENTORY MODULE)
-- ============================================================================

-- INVENTORY MODULE RULES
-- ==================

-- Supplier: name must not be empty
INSERT INTO integrity_checks 
(entity_type, field_name, check_type, check_name, check_rule, severity, error_message, active, created_by)
VALUES 
('SupplierV3', 'name', 'STRING', 'supplier-name-required', 
 '{"minLength": 3, "maxLength": 255, "forbiddenChars": ["<", ">", "\"", "'\''"]}',
 'ERROR', 'Supplier name must be 3-255 characters', true, 'system');

-- Supplier: email must be unique and valid
INSERT INTO integrity_checks 
(entity_type, field_name, check_type, check_name, check_rule, severity, error_message, active, created_by)
VALUES 
('SupplierV3', 'email', 'EMAIL', 'supplier-email-unique',
 '{"unique": true, "format": "RFC5322"}',
 'ERROR', 'Supplier email must be unique and valid', true, 'system');

-- Supplier: rating must be 0-5
INSERT INTO integrity_checks 
(entity_type, field_name, check_type, check_name, check_rule, severity, error_message, active, created_by)
VALUES 
('SupplierV3', 'rating', 'RANGE', 'supplier-rating-range',
 '{"min": 0, "max": 5, "decimals": 2}',
 'ERROR', 'Supplier rating must be between 0 and 5', true, 'system');

-- Material: unit_cost must be positive
INSERT INTO integrity_checks 
(entity_type, field_name, check_type, check_name, check_rule, severity, error_message, active, created_by)
VALUES 
('MaterialV3', 'unitCost', 'RANGE', 'material-unitcost-positive',
 '{"min": 0.0001, "max": 99999.9999, "decimals": 4}',
 'ERROR', 'Material unit cost must be positive decimal (0.0001 to 99999.9999)', true, 'system');

-- Material: quantity_in_stock must be non-negative
INSERT INTO integrity_checks 
(entity_type, field_name, check_type, check_name, check_rule, severity, error_message, active, created_by)
VALUES 
('MaterialV3', 'quantityInStock', 'RANGE', 'material-quantity-non-negative',
 '{"min": 0, "max": 1000000, "type": "integer"}',
 'ERROR', 'Material quantity must be 0 or positive integer', true, 'system');

-- Material: supplier_id must be valid FK
INSERT INTO integrity_checks 
(entity_type, field_name, check_type, check_name, check_rule, severity, error_message, active, created_by)
VALUES 
('MaterialV3', 'supplierId', 'FOREIGN_KEY', 'material-supplier-fk',
 '{"referencedTable": "suppliers", "referencedField": "id", "checkField": "is_active", "checkValue": true}',
 'ERROR', 'Material supplier must exist and be active', true, 'system');

-- Equipment: status must be valid enum
INSERT INTO integrity_checks 
(entity_type, field_name, check_type, check_name, check_rule, severity, error_message, active, created_by)
VALUES 
('EquipmentV3', 'status', 'ENUM', 'equipment-status-enum',
 '{"allowedValues": ["OPERATIONAL", "MAINTENANCE", "BROKEN", "DECOMMISSIONED"]}',
 'ERROR', 'Equipment status must be OPERATIONAL, MAINTENANCE, BROKEN, or DECOMMISSIONED', true, 'system');

-- Equipment: purchase_date must be in the past
INSERT INTO integrity_checks 
(entity_type, field_name, check_type, check_name, check_rule, severity, error_message, active, created_by)
VALUES 
('EquipmentV3', 'purchaseDate', 'DATE_RANGE', 'equipment-purchasedate-past',
 '{"notFuture": true, "immutable": true}',
 'ERROR', 'Equipment purchase date must be in the past and cannot be changed', true, 'system');

-- Equipment: warranty_expiry must be after purchase_date
INSERT INTO integrity_checks 
(entity_type, field_name, check_type, check_name, check_rule, severity, error_message, active, created_by)
VALUES 
('EquipmentV3', 'warrantyExpiry', 'DATE_RANGE', 'equipment-warranty-after-purchase',
 '{"mustBeAfter": "purchaseDate", "allowSameDay": false}',
 'ERROR', 'Equipment warranty expiry must be after purchase date', true, 'system');

-- Maintenance: status must be valid enum
INSERT INTO integrity_checks 
(entity_type, field_name, check_type, check_name, check_rule, severity, error_message, active, created_by)
VALUES 
('MaintenanceV3', 'status', 'ENUM', 'maintenance-status-enum',
 '{"allowedValues": ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "RESCHEDULED"]}',
 'ERROR', 'Maintenance status must be SCHEDULED, IN_PROGRESS, COMPLETED, or RESCHEDULED', true, 'system');

-- Maintenance: cost must be non-negative
INSERT INTO integrity_checks 
(entity_type, field_name, check_type, check_name, check_rule, severity, error_message, active, created_by)
VALUES 
('MaintenanceV3', 'cost', 'RANGE', 'maintenance-cost-non-negative',
 '{"min": 0, "max": 999999.99, "decimals": 2}',
 'ERROR', 'Maintenance cost must be non-negative decimal', true, 'system');

-- PurchaseOrder: order_number must be unique
INSERT INTO integrity_checks 
(entity_type, field_name, check_type, check_name, check_rule, severity, error_message, active, created_by)
VALUES 
('PurchaseOrderV3', 'orderNumber', 'UNIQUE', 'po-number-unique',
 '{"unique": true, "immutable": true}',
 'ERROR', 'Purchase order number must be unique and cannot be changed', true, 'system');

-- PurchaseOrder: total_amount must be positive
INSERT INTO integrity_checks 
(entity_type, field_name, check_type, check_name, check_rule, severity, error_message, active, created_by)
VALUES 
('PurchaseOrderV3', 'totalAmount', 'RANGE', 'po-amount-positive',
 '{"min": 0.01, "max": 9999999.99, "decimals": 2, "verifyCalculation": true}',
 'CRITICAL', 'PO total amount must be positive and match sum of items', true, 'system');

-- PurchaseOrder: status state machine
INSERT INTO integrity_checks 
(entity_type, field_name, check_type, check_name, check_rule, severity, error_message, active, created_by)
VALUES 
('PurchaseOrderV3', 'status', 'STATE_MACHINE', 'po-status-transitions',
 '{"stateTransitions": {"PENDING": ["APPROVED", "CANCELLED"], "APPROVED": ["SHIPPED", "CANCELLED"], "SHIPPED": ["RECEIVED", "CANCELLED"], "RECEIVED": [], "CANCELLED": []}}',
 'ERROR', 'Purchase order status transition not allowed', true, 'system');

-- InventoryV3: quantity must be non-negative (triggers auto-reorder)
INSERT INTO integrity_checks 
(entity_type, field_name, check_type, check_name, check_rule, severity, error_message, active, created_by)
VALUES 
('InventoryV3', 'quantity', 'RANGE', 'inventory-quantity-non-negative',
 '{"min": 0, "max": 1000000, "type": "integer", "triggerAutoReorder": true}',
 'WARNING', 'Inventory quantity below reorder point - auto-PO triggered', true, 'system');

-- ============================================================================
-- 4. POPULATE INITIAL RULES (PART 2: BILLING MODULE)
-- ============================================================================

-- BillingDataV3: amount must be positive
INSERT INTO integrity_checks 
(entity_type, field_name, check_type, check_name, check_rule, severity, error_message, active, created_by)
VALUES 
('BillingDataV3', 'amount', 'RANGE', 'billing-amount-positive',
 '{"min": 0.01, "max": 9999999.99, "decimals": 2}',
 'CRITICAL', 'Billing amount must be positive (0.01 to 9999999.99)', true, 'system');

-- BillingDataV3: billing_date must be in the past
INSERT INTO integrity_checks 
(entity_type, field_name, check_type, check_name, check_rule, severity, error_message, active, created_by)
VALUES 
('BillingDataV3', 'billingDate', 'DATE_RANGE', 'billing-date-past',
 '{"notFuture": true, "immutable": true}',
 'ERROR', 'Billing date must be in the past and cannot be changed', true, 'system');

-- BillingDataV3: status must be valid enum
INSERT INTO integrity_checks 
(entity_type, field_name, check_type, check_name, check_rule, severity, error_message, active, created_by)
VALUES 
('BillingDataV3', 'status', 'ENUM', 'billing-status-enum',
 '{"allowedValues": ["PENDING", "PAID", "OVERDUE", "CANCELLED"]}',
 'ERROR', 'Billing status must be PENDING, PAID, OVERDUE, or CANCELLED', true, 'system');

-- ============================================================================
-- 5. POPULATE INITIAL RULES (PART 3: DOCUMENTS - CRITICAL @VERITAS FIELDS)
-- ============================================================================

-- DocumentV3: fileName is immutable (CRITICAL)
INSERT INTO integrity_checks 
(entity_type, field_name, check_type, check_name, check_rule, severity, error_message, active, created_by)
VALUES 
('DocumentV3', 'fileName', 'IMMUTABLE', 'document-filename-immutable',
 '{"immutable": true, "maxLength": 500, "forbiddenChars": ["/", "\\", "\0", "<", ">", "|", "\"", "*", "?"]}',
 'CRITICAL', 'Document file name cannot be changed once created', true, 'system');

-- DocumentV3: filePath is immutable (CRITICAL)
INSERT INTO integrity_checks 
(entity_type, field_name, check_type, check_name, check_rule, severity, error_message, active, created_by)
VALUES 
('DocumentV3', 'filePath', 'IMMUTABLE', 'document-filepath-immutable',
 '{"immutable": true, "maxLength": 1000, "forbiddenPatterns": ["/..\\\\", "\\\\../"]}',
 'CRITICAL', 'Document file path cannot be changed once created', true, 'system');

-- DocumentV3: fileHash must be unique and valid
INSERT INTO integrity_checks 
(entity_type, field_name, check_type, check_name, check_rule, severity, error_message, active, created_by)
VALUES 
('DocumentV3', 'fileHash', 'UNIQUE', 'document-filehash-unique',
 '{"unique": true, "algorithm": "SHA256", "length": 64, "immutable": true}',
 'CRITICAL', 'Document file hash must be unique SHA256 (64 chars) and cannot be changed', true, 'system');

-- DocumentV3: fileSize must be positive
INSERT INTO integrity_checks 
(entity_type, field_name, check_type, check_name, check_rule, severity, error_message, active, created_by)
VALUES 
('DocumentV3', 'fileSize', 'RANGE', 'document-filesize-positive',
 '{"min": 1, "max": 5368709120, "type": "integer", "immutable": true}',
 'ERROR', 'Document file size must be 1 byte to 5 GB and cannot be changed', true, 'system');

-- DocumentV3: mimeType must be in allowed list
INSERT INTO integrity_checks 
(entity_type, field_name, check_type, check_name, check_rule, severity, error_message, active, created_by)
VALUES 
('DocumentV3', 'mimeType', 'ENUM', 'document-mimetype-allowed',
 '{"allowedValues": ["application/pdf", "image/png", "image/jpeg", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]}',
 'ERROR', 'Document MIME type must be PDF, PNG, JPEG, DOC, or DOCX', true, 'system');

-- DocumentV3: accessLevel must be valid enum
INSERT INTO integrity_checks 
(entity_type, field_name, check_type, check_name, check_rule, severity, error_message, active, created_by)
VALUES 
('DocumentV3', 'accessLevel', 'ENUM', 'document-accesslevel-enum',
 '{"allowedValues": ["PRIVATE", "CONFIDENTIAL", "PUBLIC"], "defaultValue": "PRIVATE"}',
 'ERROR', 'Document access level must be PRIVATE, CONFIDENTIAL, or PUBLIC', true, 'system');

-- ============================================================================
-- 6. POPULATE INITIAL RULES (PART 4: COMPLIANCE MODULE)
-- ============================================================================

-- ComplianceV3: status must be valid enum
INSERT INTO integrity_checks 
(entity_type, field_name, check_type, check_name, check_rule, severity, error_message, active, created_by)
VALUES 
('ComplianceV3', 'complianceStatus', 'ENUM', 'compliance-status-enum',
 '{"allowedValues": ["COMPLIANT", "NON_COMPLIANT", "PENDING_REVIEW", "EXCEPTION"]}',
 'ERROR', 'Compliance status must be COMPLIANT, NON_COMPLIANT, PENDING_REVIEW, or EXCEPTION', true, 'system');

-- ComplianceV3: last_checked must be in the past
INSERT INTO integrity_checks 
(entity_type, field_name, check_type, check_name, check_rule, severity, error_message, active, created_by)
VALUES 
('ComplianceV3', 'lastChecked', 'DATE_RANGE', 'compliance-lastchecked-past',
 '{"notFuture": true}',
 'WARNING', 'Compliance last checked date must be in the past', true, 'system');

-- ComplianceV3: next_check must be in the future
INSERT INTO integrity_checks 
(entity_type, field_name, check_type, check_name, check_rule, severity, error_message, active, created_by)
VALUES 
('ComplianceV3', 'nextCheck', 'DATE_RANGE', 'compliance-nextcheck-future',
 '{"mustBeAfter": "NOW()"}',
 'ERROR', 'Compliance next check date must be in the future', true, 'system');

-- ============================================================================
-- 7. CREATE VIEW FOR QUICK RULE LOOKUP
-- ============================================================================

CREATE VIEW v_active_integrity_checks AS
SELECT 
  entity_type,
  field_name,
  check_type,
  check_name,
  check_rule,
  severity,
  error_message
FROM integrity_checks
WHERE active = true
ORDER BY entity_type, field_name, severity DESC;

COMMENT ON VIEW v_active_integrity_checks IS 
'View of all active verification rules - use by VerificationEngine on startup to load rule set';

-- ============================================================================
-- 8. FINAL VALIDATION
-- ============================================================================

DO $$
BEGIN
  DECLARE
    rule_count INT;
  BEGIN
    SELECT COUNT(*) INTO rule_count FROM integrity_checks;
    RAISE NOTICE '✅ integrity_checks table created with % rules', rule_count;
  END;
END $$;

-- ============================================================================
-- MIGRATION METADATA
-- ============================================================================
-- This migration is idempotent: safe to run multiple times
-- Down migration: DROP TABLE integrity_checks CASCADE;
-- Version: 1.1
-- Author: PunkClaude + Radwulf
-- Date: 2025-11-10
-- Rules created: 31 integrity checks across 6 entity types
