-- ======================================================
-- EMPIRE ARCHITECTURE V2 - MIGRATION 6/6
-- Date: 2025-11-20
-- Purpose: Create staff_clinic_access table (multi-clinic staff)
-- Author: PunkClaude - "Preparando el futuro sin bloquear el presente"
-- Status: ✅ APPROVED - DB Ready, UI Deferred post-MVP
-- ======================================================
--
-- CÓNCLAVE DECISION:
-- - Create table NOW (schema ready)
-- - DO NOT use in MVP (single clinic_id in users.clinic_id)
-- - Activate post-Golden Thread (UI for multi-clinic staff assignment)
--
-- Use Case: Staff member works in multiple clinic locations
-- Example: Dentist works Mon-Wed in Clinic A, Thu-Fri in Clinic B
--
-- ======================================================

-- ============================================================================
-- STEP 1: Create staff_clinic_access table (many-to-many)
-- ============================================================================

CREATE TABLE IF NOT EXISTS staff_clinic_access (
  staff_id UUID NOT NULL,
  clinic_id UUID NOT NULL,
  
  -- Relationship metadata
  role VARCHAR(50), -- DENTIST, HYGIENIST, RECEPTIONIST (copy of users.role for this clinic)
  is_primary BOOLEAN DEFAULT FALSE, -- TRUE for main clinic, FALSE for secondary
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Composite primary key
  PRIMARY KEY (staff_id, clinic_id)
);

-- ============================================================================
-- STEP 2: Add foreign key constraints
-- ============================================================================

ALTER TABLE staff_clinic_access
  ADD CONSTRAINT fk_staff_clinic_access_staff
  FOREIGN KEY (staff_id) 
  REFERENCES users(id) 
  ON DELETE CASCADE; -- If staff deleted, remove all clinic associations

ALTER TABLE staff_clinic_access
  ADD CONSTRAINT fk_staff_clinic_access_clinic
  FOREIGN KEY (clinic_id) 
  REFERENCES clinics(id) 
  ON DELETE CASCADE; -- If clinic deleted, remove staff association

-- ============================================================================
-- STEP 3: Create indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_staff_clinic_access_staff 
  ON staff_clinic_access(staff_id);

CREATE INDEX IF NOT EXISTS idx_staff_clinic_access_clinic 
  ON staff_clinic_access(clinic_id);

CREATE INDEX IF NOT EXISTS idx_staff_clinic_access_primary 
  ON staff_clinic_access(is_primary) 
  WHERE is_primary = TRUE;

-- ============================================================================
-- STEP 4: Add table and column comments
-- ============================================================================

COMMENT ON TABLE staff_clinic_access IS 'Future feature (post-MVP): Staff can work in multiple clinics. NOT USED YET. Backend uses users.clinic_id for single-clinic assignment in MVP.';

COMMENT ON COLUMN staff_clinic_access.staff_id IS 'User with role DENTIST/HYGIENIST/RECEPTIONIST who can work in this clinic';
COMMENT ON COLUMN staff_clinic_access.clinic_id IS 'Clinic where staff member is assigned';
COMMENT ON COLUMN staff_clinic_access.role IS 'Role for this staff member at this specific clinic (can differ between clinics)';
COMMENT ON COLUMN staff_clinic_access.is_primary IS 'TRUE for main clinic, FALSE for secondary locations';

-- ============================================================================
-- STEP 5: Create trigger for updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_staff_clinic_access_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_staff_clinic_access_updated_at
  BEFORE UPDATE ON staff_clinic_access
  FOR EACH ROW
  EXECUTE FUNCTION update_staff_clinic_access_updated_at();

-- ============================================================================
-- STEP 6: Add constraint (only one primary clinic per staff)
-- ============================================================================

-- Note: PostgreSQL doesn't support partial unique constraints easily
-- This will be enforced at application level:
-- - When setting is_primary=TRUE, set all other clinics for this staff to is_primary=FALSE

-- ============================================================================
-- STEP 7: IMPORTANT - DO NOT USE IN MVP
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ staff_clinic_access table created';
  RAISE NOTICE '⚠️ NOT USED IN MVP: Backend uses users.clinic_id for single-clinic assignment';
  RAISE NOTICE '🚀 ACTIVATE POST-GOLDEN THREAD: UI for multi-clinic staff assignment';
  RAISE NOTICE '📋 TODO: Update backend resolvers to query staff_clinic_access when feature enabled';
END
$$;

-- ======================================================
-- MIGRATION 6/6 COMPLETE
-- DATABASE FOUNDATION = ✅ DONE
-- Next Phase: Backend Logic (JWT, resolvers, mutations)
-- ======================================================
