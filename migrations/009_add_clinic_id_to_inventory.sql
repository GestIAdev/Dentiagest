-- ============================================================================
-- 🏛️ MIGRATION 009: ADD clinic_id TO dental_materials TABLE
-- ============================================================================
-- PURPOSE: Multi-tenant isolation for inventory system
-- DATE: 2025-11-20
-- AUTHOR: PunkClaude + GeminiPunk 3.0 RAGE MODE
-- 
-- PROBLEM: "Inventario Comunista" - Clínica A puede ver/usar stock de Clínica B
-- SOLUTION: Add clinic_id column + FK + index + backfill to Default Clinic
-- NOTE: The actual table is dental_materials (not inventory)
-- ============================================================================

-- ============================================================================
-- STEP 1: Add clinic_id column (nullable initially for backfill)
-- ============================================================================

ALTER TABLE dental_materials ADD COLUMN IF NOT EXISTS clinic_id UUID;

-- ============================================================================
-- STEP 2: Backfill existing records to Default Clinic
-- ============================================================================

-- Check if Default Clinic exists, create if not
DO $$
DECLARE
  default_clinic_id UUID;
BEGIN
  -- Try to find existing Default Clinic
  SELECT id INTO default_clinic_id 
  FROM clinics 
  WHERE name = 'Default Clinic' OR name = 'Mi Clínica DentIAgest'
  LIMIT 1;

  -- If no clinic exists, create one
  IF default_clinic_id IS NULL THEN
    INSERT INTO clinics (id, name, email, is_active)
    VALUES (
      gen_random_uuid(),
      'Default Clinic',
      'default@dentiagest.com',
      TRUE
    )
    RETURNING id INTO default_clinic_id;
    
    RAISE NOTICE '🏥 Created Default Clinic: %', default_clinic_id;
  ELSE
    RAISE NOTICE '🏥 Using existing clinic: % (%)', default_clinic_id, 
      (SELECT name FROM clinics WHERE id = default_clinic_id);
  END IF;

  -- Backfill all existing inventory items
  UPDATE dental_materials 
  SET clinic_id = default_clinic_id
  WHERE clinic_id IS NULL;

  RAISE NOTICE '✅ Backfilled % inventory items to Default Clinic', 
    (SELECT COUNT(*) FROM dental_materials WHERE clinic_id = default_clinic_id);
END $$;

-- ============================================================================
-- STEP 3: Make clinic_id NOT NULL + Add FK constraint
-- ============================================================================

ALTER TABLE dental_materials 
  ALTER COLUMN clinic_id SET NOT NULL;

ALTER TABLE dental_materials 
  ADD CONSTRAINT fk_dental_materials_clinic 
  FOREIGN KEY (clinic_id) 
  REFERENCES clinics(id) 
  ON DELETE CASCADE;

-- ============================================================================
-- STEP 4: Create performance index
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_dental_materials_clinic ON dental_materials(clinic_id);

-- Additional composite index for common queries
CREATE INDEX IF NOT EXISTS idx_dental_materials_clinic_active 
  ON dental_materials(clinic_id, current_stock) 
  WHERE current_stock > 0;

-- ============================================================================
-- STEP 5: Verification
-- ============================================================================

DO $$
DECLARE
  clinic_id_exists BOOLEAN;
  fk_exists BOOLEAN;
  index_exists BOOLEAN;
  total_items INTEGER;
  items_with_clinic INTEGER;
BEGIN
  -- Check column exists and is NOT NULL
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dental_materials' 
      AND column_name = 'clinic_id'
      AND is_nullable = 'NO'
  ) INTO clinic_id_exists;

  -- Check FK constraint exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'dental_materials' 
      AND constraint_name = 'fk_dental_materials_clinic'
  ) INTO fk_exists;

  -- Check index exists
  SELECT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'dental_materials' 
      AND indexname = 'idx_dental_materials_clinic'
  ) INTO index_exists;

  -- Count items
  SELECT COUNT(*) INTO total_items FROM dental_materials;
  SELECT COUNT(*) INTO items_with_clinic FROM dental_materials WHERE clinic_id IS NOT NULL;

  -- Report
  RAISE NOTICE '';
  RAISE NOTICE '============================================================';
  RAISE NOTICE '🏛️ MIGRATION 009: VERIFICATION COMPLETE';
  RAISE NOTICE '============================================================';
  
  IF clinic_id_exists THEN
    RAISE NOTICE '✅ Column: clinic_id (UUID, NOT NULL)';
  ELSE
    RAISE NOTICE '❌ Column: clinic_id MISSING or NULLABLE';
  END IF;

  IF fk_exists THEN
    RAISE NOTICE '✅ Foreign Key: fk_dental_materials_clinic';
  ELSE
    RAISE NOTICE '❌ Foreign Key: MISSING';
  END IF;

  IF index_exists THEN
    RAISE NOTICE '✅ Index: idx_dental_materials_clinic';
  ELSE
    RAISE NOTICE '❌ Index: MISSING';
  END IF;

  RAISE NOTICE '📊 Total inventory items: %', total_items;
  RAISE NOTICE '📊 Items with clinic_id: %', items_with_clinic;

  IF clinic_id_exists AND fk_exists AND index_exists AND total_items = items_with_clinic THEN
    RAISE NOTICE '';
    RAISE NOTICE '🎯 LANDMINE 4 STATUS: DEFUSED ✅';
    RAISE NOTICE '   dental_materials is now multi-tenant isolated';
    RAISE NOTICE '';
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '🚨 LANDMINE 4 STATUS: PARTIALLY DEFUSED';
    RAISE NOTICE '   Manual verification required';
    RAISE NOTICE '';
  END IF;

  RAISE NOTICE '============================================================';
END $$;

