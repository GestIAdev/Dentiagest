-- ======================================================
-- EMPIRE ARCHITECTURE V2 - MIGRATION 4/6
-- Date: 2025-11-20
-- Purpose: Create owner_clinics table (franchise management)
-- Author: PunkClaude - "Un owner, muchos reinos"
-- Status: ✅ APPROVED by Cónclave
-- ======================================================

-- STEP 1: Create owner_clinics table (many-to-many)
CREATE TABLE IF NOT EXISTS owner_clinics (
  owner_id UUID NOT NULL,
  clinic_id UUID NOT NULL,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Composite primary key
  PRIMARY KEY (owner_id, clinic_id)
);

-- STEP 2: Add foreign key constraints
ALTER TABLE owner_clinics
  ADD CONSTRAINT fk_owner_clinics_owner
  FOREIGN KEY (owner_id) 
  REFERENCES users(id) 
  ON DELETE CASCADE; -- If owner deleted, remove all clinic associations

ALTER TABLE owner_clinics
  ADD CONSTRAINT fk_owner_clinics_clinic
  FOREIGN KEY (clinic_id) 
  REFERENCES clinics(id) 
  ON DELETE CASCADE; -- If clinic deleted, remove ownership link

-- STEP 3: Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_owner_clinics_owner 
  ON owner_clinics(owner_id);

CREATE INDEX IF NOT EXISTS idx_owner_clinics_clinic 
  ON owner_clinics(clinic_id);

-- STEP 4: Add table comment
COMMENT ON TABLE owner_clinics IS 'Many-to-many relationship: Owners can own multiple clinics (franchise model). Used in Owner Lobby to list "My Clinics".';

-- STEP 5: Add column comments
COMMENT ON COLUMN owner_clinics.owner_id IS 'User with is_owner=TRUE. Can access /lobby and manage this clinic.';
COMMENT ON COLUMN owner_clinics.clinic_id IS 'Clinic owned by this user. Appears in their lobby.';

-- STEP 6: Add check constraint (owner must be is_owner=TRUE)
-- Note: This is enforced at application level
-- SQL constraint would require JOIN check which is expensive

-- ======================================================
-- MIGRATION COMPLETE
-- Next: Run Migration 5 (globalize patients - CRITICAL)
-- ======================================================
