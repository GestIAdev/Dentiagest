-- ======================================================
-- EMPIRE ARCHITECTURE V2 - MIGRATION 3/6
-- Date: 2025-11-20
-- Purpose: Add clinic_id to users (staff assignment)
-- Author: PunkClaude - "Cada staff tiene su reino"
-- Status: ✅ APPROVED by Cónclave
-- ======================================================

-- STEP 1: Add clinic_id field (staff assignment)
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS clinic_id UUID;

-- STEP 2: Add foreign key constraint to clinics
ALTER TABLE users
  ADD CONSTRAINT fk_users_clinic
  FOREIGN KEY (clinic_id) 
  REFERENCES clinics(id) 
  ON DELETE SET NULL; -- If clinic deleted, set staff's clinic_id to NULL

-- STEP 3: Add foreign key constraint for current_clinic_id (owner's active clinic)
ALTER TABLE users
  ADD CONSTRAINT fk_users_current_clinic
  FOREIGN KEY (current_clinic_id) 
  REFERENCES clinics(id) 
  ON DELETE SET NULL; -- If clinic deleted, owner returns to lobby

-- STEP 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_clinic_id 
  ON users(clinic_id) 
  WHERE clinic_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_current_clinic_id 
  ON users(current_clinic_id) 
  WHERE current_clinic_id IS NOT NULL;

-- STEP 5: Add column comments
COMMENT ON COLUMN users.clinic_id IS 'For STAFF: their assigned clinic (fixed). For OWNERS: NULL (they use current_clinic_id instead). For PATIENTS: NULL (use patient_clinic_access table).';

-- STEP 6: Add constraint check (business rule validation)
-- Owner should NOT have clinic_id (they use current_clinic_id)
-- Staff MUST have clinic_id (they are assigned to one clinic)
-- Patients should NOT have clinic_id (they use patient_clinic_access)
-- Note: This constraint will be enforced at application level for now
-- (SQL constraint would be complex with multiple roles)

-- ======================================================
-- MIGRATION COMPLETE
-- Next: Run Migration 4 (create owner_clinics table)
-- ======================================================
