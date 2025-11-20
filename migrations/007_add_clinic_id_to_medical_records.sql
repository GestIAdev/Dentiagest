-- ======================================================
-- EMPIRE ARCHITECTURE V2 - MIGRATION 7 (EMERGENCY HOTFIX)
-- Date: 2025-11-20
-- Purpose: Add clinic_id to medical_records table
-- Author: PunkClaude
-- Status: 🚨 CRITICAL HOTFIX - GeminiPunk 3.0 detected landmine
-- ======================================================
--
-- CRITICAL ISSUE: appointments() query in Query/appointment.ts
-- assumes medical_records has clinic_id column, but migration
-- was never created. This causes runtime error:
-- "column medical_records.clinic_id does not exist"
--
-- SOLUTION: Add clinic_id to medical_records and backfill with
-- patient's first clinic from patient_clinic_access
--
-- ======================================================

-- ============================================================================
-- STEP 1: Add clinic_id column to medical_records
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '🚨 HOTFIX: Adding clinic_id to medical_records table...';
END
$$;

ALTER TABLE medical_records 
  ADD COLUMN IF NOT EXISTS clinic_id UUID;

COMMENT ON COLUMN medical_records.clinic_id IS 
  'Clinic where this medical record was created. Required for multi-tenant isolation.';

-- ============================================================================
-- STEP 2: Add foreign key constraint
-- ============================================================================

ALTER TABLE medical_records
  ADD CONSTRAINT fk_medical_records_clinic
  FOREIGN KEY (clinic_id) 
  REFERENCES clinics(id) 
  ON DELETE CASCADE;

-- ============================================================================
-- STEP 3: Create index for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_medical_records_clinic 
  ON medical_records(clinic_id);

-- ============================================================================
-- STEP 4: Backfill existing medical_records with clinic_id
-- ============================================================================

-- Strategy: For each medical_record, get the FIRST clinic the patient visited
-- from patient_clinic_access table (ordered by first_visit_date)

UPDATE medical_records mr
SET clinic_id = (
  SELECT pca.clinic_id 
  FROM patient_clinic_access pca
  WHERE pca.patient_id = mr.patient_id
  ORDER BY pca.first_visit_date ASC
  LIMIT 1
)
WHERE mr.clinic_id IS NULL
  AND mr.patient_id IS NOT NULL;

-- ============================================================================
-- STEP 5: Handle orphan records (no patient or no clinic association)
-- ============================================================================

-- Count orphan records
DO $$
DECLARE
  orphan_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO orphan_count
  FROM medical_records
  WHERE clinic_id IS NULL;
  
  IF orphan_count > 0 THEN
    RAISE NOTICE '⚠️ Found % orphan medical_records without clinic_id', orphan_count;
    RAISE NOTICE '🔧 These will be soft-deleted (marked as inactive)';
    
    -- Soft delete orphan records
    UPDATE medical_records
    SET is_active = FALSE,
        deleted_at = NOW()
    WHERE clinic_id IS NULL;
    
    RAISE NOTICE '✅ Orphan records soft-deleted';
  ELSE
    RAISE NOTICE '✅ No orphan records found';
  END IF;
END
$$;

-- ============================================================================
-- STEP 6: Make clinic_id NOT NULL (after backfill)
-- ============================================================================

-- Only active records should have NOT NULL constraint
ALTER TABLE medical_records
  ADD CONSTRAINT chk_medical_records_clinic_required
  CHECK (clinic_id IS NOT NULL OR is_active = FALSE);

COMMENT ON CONSTRAINT chk_medical_records_clinic_required ON medical_records IS
  'Active medical records MUST have a clinic_id. Inactive/deleted records can have NULL.';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  total_records INTEGER;
  records_with_clinic INTEGER;
  records_without_clinic INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_records FROM medical_records;
  SELECT COUNT(*) INTO records_with_clinic FROM medical_records WHERE clinic_id IS NOT NULL;
  SELECT COUNT(*) INTO records_without_clinic FROM medical_records WHERE clinic_id IS NULL AND is_active = TRUE;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '🏛️ MIGRATION 7 COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total medical_records: %', total_records;
  RAISE NOTICE 'Records with clinic_id: %', records_with_clinic;
  RAISE NOTICE 'Active records without clinic_id: %', records_without_clinic;
  
  IF records_without_clinic > 0 THEN
    RAISE EXCEPTION '❌ MIGRATION FAILED: % active records still without clinic_id', records_without_clinic;
  ELSE
    RAISE NOTICE '✅ All active medical_records have clinic_id assigned';
    RAISE NOTICE '✅ Multi-tenant isolation for medical_records: ENABLED';
  END IF;
END
$$;

-- ======================================================
-- MIGRATION COMPLETE
-- GeminiPunk 3.0 landmine defused. 💀🔥
-- ======================================================
