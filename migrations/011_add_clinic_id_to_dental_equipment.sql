-- ============================================================================
-- MIGRATION 011: ADD CLINIC_ID TO DENTAL_EQUIPMENT
-- ============================================================================
-- 
-- PURPOSE: Multi-tenant isolation for dental equipment management
-- 
-- LANDMINE 5: dental_equipment table orphan (no clinic_id)
-- 
-- TABLES AFFECTED: 
--   - dental_equipment (15 records)
-- 
-- STRATEGY:
--   1. ADD clinic_id column (UUID, nullable initially)
--   2. BACKFILL all records to Default Clinic
--   3. SET NOT NULL constraint
--   4. ADD Foreign Key to clinics table
--   5. CREATE index on clinic_id
-- 
-- EXECUTION TIME: ~0.5 seconds (15 records)
-- 
-- AUTHOR: PunkClaude
-- DATE: 2025-11-21
-- REVIEWED BY: GeminiPunk (Gran Inquisidor)
-- 
-- ============================================================================

-- ============================================================================
-- DENTAL_EQUIPMENT TABLE: Add clinic_id column
-- ============================================================================

DO $$ 
DECLARE
  v_default_clinic_id UUID;
  v_record_count INTEGER;
BEGIN
  -- Get Default Clinic ID
  SELECT id INTO v_default_clinic_id 
  FROM clinics 
  WHERE name = 'Default Clinic' 
  LIMIT 1;
  
  IF v_default_clinic_id IS NULL THEN
    RAISE EXCEPTION 'Default Clinic not found. Cannot proceed with migration.';
  END IF;
  
  RAISE NOTICE '🏥 Default Clinic ID: %', v_default_clinic_id;
  
  -- ============================================================
  -- STEP 1: ADD clinic_id column (nullable initially)
  -- ============================================================
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dental_equipment' AND column_name = 'clinic_id'
  ) THEN
    ALTER TABLE dental_equipment ADD COLUMN clinic_id UUID;
    RAISE NOTICE '✅ STEP 1: clinic_id column added to dental_equipment';
  ELSE
    RAISE NOTICE '⚠️  clinic_id column already exists in dental_equipment';
  END IF;
  
  -- ============================================================
  -- STEP 2: BACKFILL clinic_id to Default Clinic
  -- ============================================================
  
  UPDATE dental_equipment 
  SET clinic_id = v_default_clinic_id
  WHERE clinic_id IS NULL;
  
  GET DIAGNOSTICS v_record_count = ROW_COUNT;
  RAISE NOTICE '✅ STEP 2: Backfilled % dental_equipment records to Default Clinic', v_record_count;
  
  -- ============================================================
  -- STEP 3: SET NOT NULL constraint
  -- ============================================================
  
  ALTER TABLE dental_equipment ALTER COLUMN clinic_id SET NOT NULL;
  RAISE NOTICE '✅ STEP 3: clinic_id set to NOT NULL';
  
  -- ============================================================
  -- STEP 4: ADD Foreign Key constraint
  -- ============================================================
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_dental_equipment_clinic'
  ) THEN
    ALTER TABLE dental_equipment
    ADD CONSTRAINT fk_dental_equipment_clinic
    FOREIGN KEY (clinic_id) 
    REFERENCES clinics(id) 
    ON DELETE CASCADE;
    
    RAISE NOTICE '✅ STEP 4: Foreign key constraint fk_dental_equipment_clinic created';
  ELSE
    RAISE NOTICE '⚠️  Foreign key fk_dental_equipment_clinic already exists';
  END IF;
  
  -- ============================================================
  -- STEP 5: CREATE index on clinic_id
  -- ============================================================
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_dental_equipment_clinic'
  ) THEN
    CREATE INDEX idx_dental_equipment_clinic ON dental_equipment(clinic_id);
    RAISE NOTICE '✅ STEP 5: Index idx_dental_equipment_clinic created';
  ELSE
    RAISE NOTICE '⚠️  Index idx_dental_equipment_clinic already exists';
  END IF;
  
  -- ============================================================
  -- STEP 6: CREATE composite index (clinic_id, status)
  -- ============================================================
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_dental_equipment_clinic_status'
  ) THEN
    CREATE INDEX idx_dental_equipment_clinic_status ON dental_equipment(clinic_id, status);
    RAISE NOTICE '✅ STEP 6: Composite index idx_dental_equipment_clinic_status created';
  ELSE
    RAISE NOTICE '⚠️  Index idx_dental_equipment_clinic_status already exists';
  END IF;
  
  -- ============================================================
  -- FINAL VERIFICATION
  -- ============================================================
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'MIGRATION 011: VERIFICATION';
  RAISE NOTICE '========================================';
  
  -- Check column exists and is NOT NULL
  SELECT COUNT(*) INTO v_record_count
  FROM information_schema.columns
  WHERE table_name = 'dental_equipment' 
    AND column_name = 'clinic_id'
    AND is_nullable = 'NO';
  
  IF v_record_count = 1 THEN
    RAISE NOTICE '✅ dental_equipment.clinic_id: UUID [NOT NULL]';
  ELSE
    RAISE EXCEPTION '❌ dental_equipment.clinic_id: Column verification FAILED';
  END IF;
  
  -- Check FK constraint
  SELECT COUNT(*) INTO v_record_count
  FROM pg_constraint
  WHERE conname = 'fk_dental_equipment_clinic';
  
  IF v_record_count = 1 THEN
    RAISE NOTICE '✅ FK Constraint: fk_dental_equipment_clinic ACTIVE';
  ELSE
    RAISE EXCEPTION '❌ FK Constraint: fk_dental_equipment_clinic MISSING';
  END IF;
  
  -- Check indexes
  SELECT COUNT(*) INTO v_record_count
  FROM pg_indexes
  WHERE tablename = 'dental_equipment' 
    AND indexname IN ('idx_dental_equipment_clinic', 'idx_dental_equipment_clinic_status');
  
  IF v_record_count = 2 THEN
    RAISE NOTICE '✅ Indexes: 2/2 created (single + composite)';
  ELSE
    RAISE EXCEPTION '❌ Indexes: Expected 2, found %', v_record_count;
  END IF;
  
  -- Check data integrity (no NULL clinic_id)
  SELECT COUNT(*) INTO v_record_count
  FROM dental_equipment
  WHERE clinic_id IS NULL;
  
  IF v_record_count = 0 THEN
    RAISE NOTICE '✅ Data Integrity: 0 records with NULL clinic_id';
  ELSE
    RAISE EXCEPTION '❌ Data Integrity: Found % records with NULL clinic_id', v_record_count;
  END IF;
  
  -- Total record count
  SELECT COUNT(*) INTO v_record_count FROM dental_equipment;
  RAISE NOTICE '📊 Total Records: %', v_record_count;
  
  RAISE NOTICE '';
  RAISE NOTICE '🎯 MIGRATION 011 STATUS: COMPLETE ✅';
  RAISE NOTICE '========================================';
  
END $$;

-- ============================================================================
-- END OF MIGRATION 011
-- ============================================================================
