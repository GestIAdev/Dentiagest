-- ============================================================================
-- MIGRATION 013: ADD CLINIC_ID TO SUPPLIERS + PURCHASE_ORDERS
-- ============================================================================
-- 
-- PURPOSE: Complete multi-tenant isolation for Inventory Module (LANDMINE 9)
-- 
-- CONTEXT: Migration 009 secured dental_materials (core stock)
--          This migration secures logistics/purchasing tables
-- 
-- TABLES AFFECTED: 
--   - suppliers (2 records)
--   - purchase_orders (0 records)
-- 
-- STRATEGY:
--   1. ADD clinic_id column (UUID, nullable initially)
--   2. BACKFILL all records to Default Clinic
--   3. SET NOT NULL constraint
--   4. ADD Foreign Key to clinics table
--   5. CREATE indexes on clinic_id
-- 
-- EXECUTION TIME: ~0.3 seconds (2 suppliers + 0 orders)
-- 
-- AUTHOR: PunkClaude + GeminiPunk (THE PERFECIONIST RUN)
-- DATE: 2025-11-21
-- REVIEWED BY: Radwulf (El Estratega)
-- 
-- ============================================================================

DO $$ 
DECLARE
  v_default_clinic_id UUID;
  v_suppliers_count INTEGER;
  v_orders_count INTEGER;
BEGIN
  -- ============================================================
  -- STEP 0: Get Default Clinic ID
  -- ============================================================
  
  SELECT id INTO v_default_clinic_id 
  FROM clinics 
  WHERE name = 'Default Clinic' 
  LIMIT 1;
  
  IF v_default_clinic_id IS NULL THEN
    RAISE EXCEPTION 'Default Clinic not found. Cannot proceed with migration.';
  END IF;
  
  RAISE NOTICE '🏥 Default Clinic ID: %', v_default_clinic_id;
  
  -- ============================================================
  -- SUPPLIERS TABLE
  -- ============================================================
  
  RAISE NOTICE '';
  RAISE NOTICE '📦 PROCESSING TABLE: suppliers';
  RAISE NOTICE '------------------------------------------------------------';
  
  -- STEP 1: ADD clinic_id column (nullable initially)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'suppliers' AND column_name = 'clinic_id'
  ) THEN
    ALTER TABLE suppliers ADD COLUMN clinic_id UUID;
    RAISE NOTICE '✅ STEP 1: Column clinic_id added to suppliers';
  ELSE
    RAISE NOTICE '⚠️  STEP 1: Column clinic_id already exists';
  END IF;
  
  -- STEP 2: BACKFILL existing records to Default Clinic
  UPDATE suppliers 
  SET clinic_id = v_default_clinic_id
  WHERE clinic_id IS NULL;
  
  GET DIAGNOSTICS v_suppliers_count = ROW_COUNT;
  RAISE NOTICE '✅ STEP 2: Backfilled % suppliers to Default Clinic', v_suppliers_count;
  
  -- STEP 3: SET NOT NULL constraint
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'suppliers' 
      AND column_name = 'clinic_id' 
      AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE suppliers ALTER COLUMN clinic_id SET NOT NULL;
    RAISE NOTICE '✅ STEP 3: clinic_id set to NOT NULL';
  ELSE
    RAISE NOTICE '⚠️  STEP 3: clinic_id already NOT NULL';
  END IF;
  
  -- STEP 4: ADD Foreign Key constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_suppliers_clinic'
  ) THEN
    ALTER TABLE suppliers
    ADD CONSTRAINT fk_suppliers_clinic
    FOREIGN KEY (clinic_id) 
    REFERENCES clinics(id) 
    ON DELETE CASCADE;
    
    RAISE NOTICE '✅ STEP 4: Foreign key constraint fk_suppliers_clinic created';
  ELSE
    RAISE NOTICE '⚠️  Foreign key fk_suppliers_clinic already exists';
  END IF;
  
  -- STEP 5: CREATE index on clinic_id
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_suppliers_clinic'
  ) THEN
    CREATE INDEX idx_suppliers_clinic ON suppliers(clinic_id);
    RAISE NOTICE '✅ STEP 5: Index idx_suppliers_clinic created';
  ELSE
    RAISE NOTICE '⚠️  Index idx_suppliers_clinic already exists';
  END IF;
  
  -- ============================================================
  -- PURCHASE_ORDERS TABLE
  -- ============================================================
  
  RAISE NOTICE '';
  RAISE NOTICE '📦 PROCESSING TABLE: purchase_orders';
  RAISE NOTICE '------------------------------------------------------------';
  
  -- STEP 1: ADD clinic_id column (nullable initially)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'purchase_orders' AND column_name = 'clinic_id'
  ) THEN
    ALTER TABLE purchase_orders ADD COLUMN clinic_id UUID;
    RAISE NOTICE '✅ STEP 1: Column clinic_id added to purchase_orders';
  ELSE
    RAISE NOTICE '⚠️  STEP 1: Column clinic_id already exists';
  END IF;
  
  -- STEP 2: BACKFILL existing records to Default Clinic (if any)
  UPDATE purchase_orders 
  SET clinic_id = v_default_clinic_id
  WHERE clinic_id IS NULL;
  
  GET DIAGNOSTICS v_orders_count = ROW_COUNT;
  
  IF v_orders_count > 0 THEN
    RAISE NOTICE '✅ STEP 2: Backfilled % purchase orders to Default Clinic', v_orders_count;
  ELSE
    RAISE NOTICE '✅ STEP 2: No purchase orders to backfill (table empty)';
  END IF;
  
  -- STEP 3: SET NOT NULL constraint
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'purchase_orders' 
      AND column_name = 'clinic_id' 
      AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE purchase_orders ALTER COLUMN clinic_id SET NOT NULL;
    RAISE NOTICE '✅ STEP 3: clinic_id set to NOT NULL';
  ELSE
    RAISE NOTICE '⚠️  STEP 3: clinic_id already NOT NULL';
  END IF;
  
  -- STEP 4: ADD Foreign Key constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_purchase_orders_clinic'
  ) THEN
    ALTER TABLE purchase_orders
    ADD CONSTRAINT fk_purchase_orders_clinic
    FOREIGN KEY (clinic_id) 
    REFERENCES clinics(id) 
    ON DELETE CASCADE;
    
    RAISE NOTICE '✅ STEP 4: Foreign key constraint fk_purchase_orders_clinic created';
  ELSE
    RAISE NOTICE '⚠️  Foreign key fk_purchase_orders_clinic already exists';
  END IF;
  
  -- STEP 5: CREATE index on clinic_id
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_purchase_orders_clinic'
  ) THEN
    CREATE INDEX idx_purchase_orders_clinic ON purchase_orders(clinic_id);
    RAISE NOTICE '✅ STEP 5: Index idx_purchase_orders_clinic created';
  ELSE
    RAISE NOTICE '⚠️  Index idx_purchase_orders_clinic already exists';
  END IF;
  
  -- STEP 6: CREATE composite index (clinic_id, status)
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_purchase_orders_clinic_status'
  ) THEN
    CREATE INDEX idx_purchase_orders_clinic_status ON purchase_orders(clinic_id, status);
    RAISE NOTICE '✅ STEP 6: Composite index idx_purchase_orders_clinic_status created';
  ELSE
    RAISE NOTICE '⚠️  Index idx_purchase_orders_clinic_status already exists';
  END IF;
  
  -- ============================================================
  -- VERIFICATION
  -- ============================================================
  
  RAISE NOTICE '';
  RAISE NOTICE '============================================================';
  RAISE NOTICE '🔍 MIGRATION 013: VERIFICATION';
  RAISE NOTICE '============================================================';
  
  -- Verify suppliers
  DECLARE
    v_suppliers_clinic_id_count INTEGER;
    v_suppliers_orphans INTEGER;
  BEGIN
    SELECT COUNT(*) INTO v_suppliers_clinic_id_count
    FROM suppliers
    WHERE clinic_id IS NOT NULL;
    
    SELECT COUNT(*) INTO v_suppliers_orphans
    FROM suppliers
    WHERE clinic_id IS NULL;
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 SUPPLIERS:';
    RAISE NOTICE '   Total records: %', (SELECT COUNT(*) FROM suppliers);
    RAISE NOTICE '   With clinic_id: %', v_suppliers_clinic_id_count;
    RAISE NOTICE '   Orphan records: %', v_suppliers_orphans;
    
    IF v_suppliers_orphans = 0 THEN
      RAISE NOTICE '   ✅ Data integrity: 100%% (no orphans)';
    ELSE
      RAISE NOTICE '   ❌ Data integrity: FAILED (% orphans)', v_suppliers_orphans;
    END IF;
  END;
  
  -- Verify purchase_orders
  DECLARE
    v_orders_clinic_id_count INTEGER;
    v_orders_orphans INTEGER;
  BEGIN
    SELECT COUNT(*) INTO v_orders_clinic_id_count
    FROM purchase_orders
    WHERE clinic_id IS NOT NULL;
    
    SELECT COUNT(*) INTO v_orders_orphans
    FROM purchase_orders
    WHERE clinic_id IS NULL;
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 PURCHASE ORDERS:';
    RAISE NOTICE '   Total records: %', (SELECT COUNT(*) FROM purchase_orders);
    RAISE NOTICE '   With clinic_id: %', v_orders_clinic_id_count;
    RAISE NOTICE '   Orphan records: %', v_orders_orphans;
    
    IF v_orders_orphans = 0 THEN
      RAISE NOTICE '   ✅ Data integrity: 100%% (no orphans)';
    ELSE
      RAISE NOTICE '   ❌ Data integrity: FAILED (% orphans)', v_orders_orphans;
    END IF;
  END;
  
  -- Verify FK constraints
  DECLARE
    v_fk_suppliers BOOLEAN;
    v_fk_orders BOOLEAN;
  BEGIN
    SELECT EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'fk_suppliers_clinic'
    ) INTO v_fk_suppliers;
    
    SELECT EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'fk_purchase_orders_clinic'
    ) INTO v_fk_orders;
    
    RAISE NOTICE '';
    RAISE NOTICE '🔗 FOREIGN KEY CONSTRAINTS:';
    
    IF v_fk_suppliers THEN
      RAISE NOTICE '   ✅ fk_suppliers_clinic: ACTIVE';
    ELSE
      RAISE NOTICE '   ❌ fk_suppliers_clinic: MISSING';
    END IF;
    
    IF v_fk_orders THEN
      RAISE NOTICE '   ✅ fk_purchase_orders_clinic: ACTIVE';
    ELSE
      RAISE NOTICE '   ❌ fk_purchase_orders_clinic: MISSING';
    END IF;
  END;
  
  -- Verify indexes
  DECLARE
    v_idx_suppliers INTEGER;
    v_idx_orders INTEGER;
  BEGIN
    SELECT COUNT(*) INTO v_idx_suppliers
    FROM pg_indexes
    WHERE tablename = 'suppliers' 
      AND indexname LIKE '%clinic%';
    
    SELECT COUNT(*) INTO v_idx_orders
    FROM pg_indexes
    WHERE tablename = 'purchase_orders' 
      AND indexname LIKE '%clinic%';
    
    RAISE NOTICE '';
    RAISE NOTICE '📇 INDEXES:';
    RAISE NOTICE '   suppliers indexes: %', v_idx_suppliers;
    RAISE NOTICE '   purchase_orders indexes: %', v_idx_orders;
    
    IF v_idx_suppliers >= 1 AND v_idx_orders >= 2 THEN
      RAISE NOTICE '   ✅ All indexes created';
    ELSE
      RAISE NOTICE '   ⚠️  Some indexes missing';
    END IF;
  END;
  
  RAISE NOTICE '';
  RAISE NOTICE '============================================================';
  RAISE NOTICE '🎯 MIGRATION 013 STATUS: COMPLETE ✅';
  RAISE NOTICE '';
  RAISE NOTICE '   suppliers: % records secured', (SELECT COUNT(*) FROM suppliers);
  RAISE NOTICE '   purchase_orders: % records secured', (SELECT COUNT(*) FROM purchase_orders);
  RAISE NOTICE '';
  RAISE NOTICE '🏆 LANDMINE 9: 100%% DEFUSED';
  RAISE NOTICE '   - dental_materials ✅ (Migration 009)';
  RAISE NOTICE '   - suppliers ✅ (Migration 013)';
  RAISE NOTICE '   - purchase_orders ✅ (Migration 013)';
  RAISE NOTICE '   - cart_items 🟢 (USER-SCOPED - no action needed)';
  RAISE NOTICE '';
  RAISE NOTICE '============================================================';
  
END $$;
