-- ================================================================
-- MIGRATION 012: USER CONSOLIDATION - ASSIGN ALL USERS TO DEFAULT CLINIC
-- ================================================================
-- 
-- OBJECTIVE: 
--   Eliminate "digital vagabonds" - assign all 10 test users to Default Clinic.
--   Enforce constraint: Non-owner users MUST have clinic_id (owners can be NULL).
--
-- STRATEGY:
--   1. Get Default Clinic ID
--   2. Update all non-owner users → SET clinic_id
--   3. Add CHECK constraint (staff must have clinic_id, owners exempt)
--   4. Verify 10/10 users secured
--
-- IMPACT:
--   - 10 users (4 PATIENT, 3 receptionist, 2 admin, 1 professional)
--   - All will be assigned to Default Clinic
--   - Enables multi-tenant resolver filtering immediately
--
-- ROLLBACK:
--   UPDATE users SET clinic_id = NULL WHERE clinic_id IS NOT NULL;
--   ALTER TABLE users DROP CONSTRAINT IF EXISTS check_staff_clinic_id;
-- ================================================================

BEGIN;

-- ================================================================
-- STEP 1: GET DEFAULT CLINIC ID
-- ================================================================

DO $$
DECLARE
  v_default_clinic_id UUID;
  v_users_updated INTEGER;
BEGIN
  -- Get Default Clinic (created in Migration 006)
  SELECT id INTO v_default_clinic_id
  FROM clinics
  WHERE name = 'Default Clinic'
  LIMIT 1;

  IF v_default_clinic_id IS NULL THEN
    RAISE EXCEPTION '❌ Default Clinic not found. Migration 006 may not have run.';
  END IF;

  RAISE NOTICE '🏥 Default Clinic ID: %', v_default_clinic_id;

  -- ================================================================
  -- STEP 2: ASSIGN ALL NON-OWNER USERS TO DEFAULT CLINIC
  -- ================================================================
  -- Rule: All users who are NOT owners get clinic_id assigned
  -- Owners (is_owner = true) will use owner_clinics many-to-many table

  UPDATE users
  SET clinic_id = v_default_clinic_id
  WHERE (is_owner = false OR is_owner IS NULL);

  GET DIAGNOSTICS v_users_updated = ROW_COUNT;
  RAISE NOTICE '✅ STEP 1: Assigned % users to Default Clinic', v_users_updated;

  -- ================================================================
  -- STEP 3: ADD CHECK CONSTRAINT
  -- ================================================================
  -- Constraint: Staff (non-owners) MUST have clinic_id
  -- Owners can have clinic_id = NULL (they live in the Lobby)

  ALTER TABLE users
    ADD CONSTRAINT check_staff_clinic_id
    CHECK (is_owner = true OR clinic_id IS NOT NULL);

  RAISE NOTICE '✅ STEP 2: CHECK constraint added (staff must have clinic_id)';

  -- ================================================================
  -- STEP 4: VERIFICATION
  -- ================================================================

  -- Check: All non-owner users have clinic_id
  DECLARE
    v_orphan_staff INTEGER;
    v_total_staff INTEGER;
    v_total_owners INTEGER;
  BEGIN
    SELECT COUNT(*) INTO v_orphan_staff
    FROM users
    WHERE (is_owner = false OR is_owner IS NULL) AND clinic_id IS NULL;

    SELECT COUNT(*) INTO v_total_staff
    FROM users
    WHERE (is_owner = false OR is_owner IS NULL);

    SELECT COUNT(*) INTO v_total_owners
    FROM users
    WHERE is_owner = true;

    IF v_orphan_staff > 0 THEN
      RAISE EXCEPTION '❌ VERIFICATION FAILED: % staff users still have clinic_id = NULL', v_orphan_staff;
    END IF;

    RAISE NOTICE '✅ STEP 3: Verification passed';
    RAISE NOTICE '   - Total Staff: % (all with clinic_id)', v_total_staff;
    RAISE NOTICE '   - Total Owners: % (clinic_id optional)', v_total_owners;
    RAISE NOTICE '   - Orphan Staff: 0';
  END;

END $$;

-- ================================================================
-- FINAL VERIFICATION QUERIES
-- ================================================================

-- Show user distribution after migration
SELECT 
  role,
  COALESCE(is_owner, false) AS is_owner,
  COUNT(*) AS total,
  COUNT(clinic_id) AS with_clinic_id,
  COUNT(*) FILTER (WHERE clinic_id IS NULL) AS without_clinic_id
FROM users
GROUP BY role, is_owner
ORDER BY role, is_owner;

-- Show constraint status
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'users'::regclass
  AND conname = 'check_staff_clinic_id';

COMMIT;

-- ================================================================
-- MIGRATION 012 COMPLETE
-- ================================================================
-- 
-- EXPECTED RESULTS:
--   - 10/10 users with clinic_id assigned (staff)
--   - 0/0 owners (table currently has no owners)
--   - CHECK constraint active: (is_owner = true OR clinic_id IS NOT NULL)
--   - No orphan staff detected
--
-- NEXT STEPS:
--   - Execute verify-migration-012.cjs (6 tests)
--   - Activate User resolvers with clinic filtering
--   - Create verify-user-isolation.cjs
-- ================================================================
