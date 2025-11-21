-- ============================================================================
-- 💰 MIGRATION 010: BILLING MULTI-TENANT ISOLATION
-- ============================================================================
-- 
-- LANDMINE 6: Billing system allows cross-clinic access
-- 
-- PROBLEMA:
--   Sin clinic_id en billing tables:
--   - Clínica A puede ver/modificar facturas de Clínica B
--   - Invoice numbering global (no per-clinic sequencing)
--   - Payment plans compartidos entre clínicas
--   - Recibos de pago sin ownership verification
-- 
-- SOLUCIÓN:
--   Añadir clinic_id (UUID NOT NULL) a:
--   1. billing_data (104 records) - Main invoices table
--   2. payment_plans (26 records) - Payment installment plans
--   3. payment_receipts (9 records) - Payment receipts
--   4. payment_reminders (0 records) - Payment reminders
--   5. partial_payments (36 records) - Partial payment transactions
-- 
-- ESTRATEGIA:
--   - Backfill a "Default Clinic" antes de NOT NULL
--   - FK constraints a clinics table
--   - Indexes en clinic_id para performance
--   - Composite indexes donde aplique (clinic_id + status, clinic_id + date)
-- 
-- FISCAL COMPLIANCE:
--   - Invoice numbering DEBE ser secuencial PER CLINIC
--   - Implementar en resolver: generateInvoiceNumber(clinic_id, fiscal_year)
--   - Formato: FAC-{YEAR}-{SEQ} (e.g., FAC-2025-001)
-- 
-- AUTOR: PunkClaude
-- FECHA: 2025-11-21
-- TASK: Phase 4-B - Operation Cashflow
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: billing_data (Main invoices table)
-- ============================================================================

DO $$
DECLARE
  default_clinic_id UUID;
  affected_rows INTEGER;
BEGIN
  RAISE NOTICE '💰 MIGRATION 010: BILLING MULTI-TENANT ISOLATION';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  
  RAISE NOTICE '';
  RAISE NOTICE '📋 TABLE 1/5: billing_data';
  RAISE NOTICE '─────────────────────────────────────────────────────────────';

  -- Get Default Clinic ID
  SELECT id INTO default_clinic_id
  FROM clinics
  WHERE name = 'Default Clinic'
  LIMIT 1;

  IF default_clinic_id IS NULL THEN
    RAISE EXCEPTION '❌ CRITICAL: Default Clinic not found. Cannot backfill.';
  END IF;

  RAISE NOTICE '✅ Default Clinic ID: %', default_clinic_id;

  -- Add clinic_id column (nullable first)
  ALTER TABLE billing_data ADD COLUMN IF NOT EXISTS clinic_id UUID;
  RAISE NOTICE '✅ Column clinic_id added to billing_data';

  -- Backfill existing records
  UPDATE billing_data
  SET clinic_id = default_clinic_id
  WHERE clinic_id IS NULL;
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RAISE NOTICE '✅ Backfilled % records in billing_data', affected_rows;

  -- Make NOT NULL
  ALTER TABLE billing_data ALTER COLUMN clinic_id SET NOT NULL;
  RAISE NOTICE '✅ clinic_id set to NOT NULL in billing_data';

  -- Add FK constraint
  ALTER TABLE billing_data
    ADD CONSTRAINT fk_billing_data_clinic
    FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE;
  RAISE NOTICE '✅ FK constraint: fk_billing_data_clinic';

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_billing_data_clinic 
    ON billing_data(clinic_id);
  RAISE NOTICE '✅ Index: idx_billing_data_clinic';

  CREATE INDEX IF NOT EXISTS idx_billing_data_clinic_status 
    ON billing_data(clinic_id, status);
  RAISE NOTICE '✅ Index: idx_billing_data_clinic_status';

  CREATE INDEX IF NOT EXISTS idx_billing_data_clinic_date 
    ON billing_data(clinic_id, issue_date DESC);
  RAISE NOTICE '✅ Index: idx_billing_data_clinic_date';

END $$;

-- ============================================================================
-- STEP 2: payment_plans
-- ============================================================================

DO $$
DECLARE
  default_clinic_id UUID;
  affected_rows INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📋 TABLE 2/5: payment_plans';
  RAISE NOTICE '─────────────────────────────────────────────────────────────';

  SELECT id INTO default_clinic_id
  FROM clinics
  WHERE name = 'Default Clinic'
  LIMIT 1;

  ALTER TABLE payment_plans ADD COLUMN IF NOT EXISTS clinic_id UUID;
  RAISE NOTICE '✅ Column clinic_id added to payment_plans';

  UPDATE payment_plans
  SET clinic_id = default_clinic_id
  WHERE clinic_id IS NULL;
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RAISE NOTICE '✅ Backfilled % records in payment_plans', affected_rows;

  ALTER TABLE payment_plans ALTER COLUMN clinic_id SET NOT NULL;
  RAISE NOTICE '✅ clinic_id set to NOT NULL in payment_plans';

  ALTER TABLE payment_plans
    ADD CONSTRAINT fk_payment_plans_clinic
    FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE;
  RAISE NOTICE '✅ FK constraint: fk_payment_plans_clinic';

  CREATE INDEX IF NOT EXISTS idx_payment_plans_clinic 
    ON payment_plans(clinic_id);
  RAISE NOTICE '✅ Index: idx_payment_plans_clinic';

  CREATE INDEX IF NOT EXISTS idx_payment_plans_clinic_status 
    ON payment_plans(clinic_id, status);
  RAISE NOTICE '✅ Index: idx_payment_plans_clinic_status';

END $$;

-- ============================================================================
-- STEP 3: payment_receipts
-- ============================================================================

DO $$
DECLARE
  default_clinic_id UUID;
  affected_rows INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📋 TABLE 3/5: payment_receipts';
  RAISE NOTICE '─────────────────────────────────────────────────────────────';

  SELECT id INTO default_clinic_id
  FROM clinics
  WHERE name = 'Default Clinic'
  LIMIT 1;

  ALTER TABLE payment_receipts ADD COLUMN IF NOT EXISTS clinic_id UUID;
  RAISE NOTICE '✅ Column clinic_id added to payment_receipts';

  UPDATE payment_receipts
  SET clinic_id = default_clinic_id
  WHERE clinic_id IS NULL;
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RAISE NOTICE '✅ Backfilled % records in payment_receipts', affected_rows;

  ALTER TABLE payment_receipts ALTER COLUMN clinic_id SET NOT NULL;
  RAISE NOTICE '✅ clinic_id set to NOT NULL in payment_receipts';

  ALTER TABLE payment_receipts
    ADD CONSTRAINT fk_payment_receipts_clinic
    FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE;
  RAISE NOTICE '✅ FK constraint: fk_payment_receipts_clinic';

  CREATE INDEX IF NOT EXISTS idx_payment_receipts_clinic 
    ON payment_receipts(clinic_id);
  RAISE NOTICE '✅ Index: idx_payment_receipts_clinic';

END $$;

-- ============================================================================
-- STEP 4: payment_reminders
-- ============================================================================

DO $$
DECLARE
  default_clinic_id UUID;
  affected_rows INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📋 TABLE 4/5: payment_reminders';
  RAISE NOTICE '─────────────────────────────────────────────────────────────';

  SELECT id INTO default_clinic_id
  FROM clinics
  WHERE name = 'Default Clinic'
  LIMIT 1;

  ALTER TABLE payment_reminders ADD COLUMN IF NOT EXISTS clinic_id UUID;
  RAISE NOTICE '✅ Column clinic_id added to payment_reminders';

  UPDATE payment_reminders
  SET clinic_id = default_clinic_id
  WHERE clinic_id IS NULL;
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RAISE NOTICE '✅ Backfilled % records in payment_reminders', affected_rows;

  ALTER TABLE payment_reminders ALTER COLUMN clinic_id SET NOT NULL;
  RAISE NOTICE '✅ clinic_id set to NOT NULL in payment_reminders';

  ALTER TABLE payment_reminders
    ADD CONSTRAINT fk_payment_reminders_clinic
    FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE;
  RAISE NOTICE '✅ FK constraint: fk_payment_reminders_clinic';

  CREATE INDEX IF NOT EXISTS idx_payment_reminders_clinic 
    ON payment_reminders(clinic_id);
  RAISE NOTICE '✅ Index: idx_payment_reminders_clinic';

END $$;

-- ============================================================================
-- STEP 5: partial_payments
-- ============================================================================

DO $$
DECLARE
  default_clinic_id UUID;
  affected_rows INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📋 TABLE 5/5: partial_payments';
  RAISE NOTICE '─────────────────────────────────────────────────────────────';

  SELECT id INTO default_clinic_id
  FROM clinics
  WHERE name = 'Default Clinic'
  LIMIT 1;

  ALTER TABLE partial_payments ADD COLUMN IF NOT EXISTS clinic_id UUID;
  RAISE NOTICE '✅ Column clinic_id added to partial_payments';

  UPDATE partial_payments
  SET clinic_id = default_clinic_id
  WHERE clinic_id IS NULL;
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RAISE NOTICE '✅ Backfilled % records in partial_payments', affected_rows;

  ALTER TABLE partial_payments ALTER COLUMN clinic_id SET NOT NULL;
  RAISE NOTICE '✅ clinic_id set to NOT NULL in partial_payments';

  ALTER TABLE partial_payments
    ADD CONSTRAINT fk_partial_payments_clinic
    FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE;
  RAISE NOTICE '✅ FK constraint: fk_partial_payments_clinic';

  CREATE INDEX IF NOT EXISTS idx_partial_payments_clinic 
    ON partial_payments(clinic_id);
  RAISE NOTICE '✅ Index: idx_partial_payments_clinic';

  CREATE INDEX IF NOT EXISTS idx_partial_payments_clinic_status 
    ON partial_payments(clinic_id, status);
  RAISE NOTICE '✅ Index: idx_partial_payments_clinic_status';

END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  billing_count INTEGER;
  plans_count INTEGER;
  receipts_count INTEGER;
  reminders_count INTEGER;
  partials_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔍 VERIFICATION';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';

  -- Count records with clinic_id
  SELECT COUNT(*) INTO billing_count
  FROM billing_data
  WHERE clinic_id IS NOT NULL;

  SELECT COUNT(*) INTO plans_count
  FROM payment_plans
  WHERE clinic_id IS NOT NULL;

  SELECT COUNT(*) INTO receipts_count
  FROM payment_receipts
  WHERE clinic_id IS NOT NULL;

  SELECT COUNT(*) INTO reminders_count
  FROM payment_reminders
  WHERE clinic_id IS NOT NULL;

  SELECT COUNT(*) INTO partials_count
  FROM partial_payments
  WHERE clinic_id IS NOT NULL;

  RAISE NOTICE '✅ billing_data: % records with clinic_id', billing_count;
  RAISE NOTICE '✅ payment_plans: % records with clinic_id', plans_count;
  RAISE NOTICE '✅ payment_receipts: % records with clinic_id', receipts_count;
  RAISE NOTICE '✅ payment_reminders: % records with clinic_id', reminders_count;
  RAISE NOTICE '✅ partial_payments: % records with clinic_id', partials_count;

  RAISE NOTICE '';
  RAISE NOTICE '🎯 MIGRATION 010 STATUS: COMPLETE ✅';
  RAISE NOTICE '💰 5 billing tables secured with multi-tenant isolation';
  RAISE NOTICE '';
  RAISE NOTICE 'NEXT STEPS:';
  RAISE NOTICE '  1. Implement per-clinic invoice numbering in resolver';
  RAISE NOTICE '  2. Update BillingDatabase.ts with clinic_id filters';
  RAISE NOTICE '  3. Update billing resolvers with getClinicIdFromContext';
  RAISE NOTICE '  4. Implement immutability rules for PAID/SENT invoices';
  RAISE NOTICE '  5. Create verification scripts';

END $$;

COMMIT;

-- ============================================================================
-- ROLLBACK SCRIPT (For emergencies only)
-- ============================================================================
-- 
-- BEGIN;
-- ALTER TABLE billing_data DROP CONSTRAINT IF EXISTS fk_billing_data_clinic;
-- ALTER TABLE billing_data DROP COLUMN IF EXISTS clinic_id;
-- DROP INDEX IF EXISTS idx_billing_data_clinic;
-- DROP INDEX IF EXISTS idx_billing_data_clinic_status;
-- DROP INDEX IF EXISTS idx_billing_data_clinic_date;
-- 
-- ALTER TABLE payment_plans DROP CONSTRAINT IF EXISTS fk_payment_plans_clinic;
-- ALTER TABLE payment_plans DROP COLUMN IF EXISTS clinic_id;
-- DROP INDEX IF EXISTS idx_payment_plans_clinic;
-- DROP INDEX IF EXISTS idx_payment_plans_clinic_status;
-- 
-- ALTER TABLE payment_receipts DROP CONSTRAINT IF EXISTS fk_payment_receipts_clinic;
-- ALTER TABLE payment_receipts DROP COLUMN IF EXISTS clinic_id;
-- DROP INDEX IF EXISTS idx_payment_receipts_clinic;
-- 
-- ALTER TABLE payment_reminders DROP CONSTRAINT IF EXISTS fk_payment_reminders_clinic;
-- ALTER TABLE payment_reminders DROP COLUMN IF EXISTS clinic_id;
-- DROP INDEX IF EXISTS idx_payment_reminders_clinic;
-- 
-- ALTER TABLE partial_payments DROP CONSTRAINT IF EXISTS fk_partial_payments_clinic;
-- ALTER TABLE partial_payments DROP COLUMN IF EXISTS clinic_id;
-- DROP INDEX IF EXISTS idx_partial_payments_clinic;
-- DROP INDEX IF EXISTS idx_partial_payments_clinic_status;
-- COMMIT;
-- 
-- ============================================================================
