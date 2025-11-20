-- ======================================================
-- EMPIRE ARCHITECTURE V2 - MIGRATION 1/6
-- Date: 2025-11-20
-- Purpose: Add multi-tenant fields to users table
-- Author: PunkClaude - "Construyendo ciudades, no casas"
-- Status: ✅ APPROVED by Cónclave (GeminiPunk + GeminiEnder)
-- ======================================================

-- STEP 1: Add is_owner field (identifies clinic owners)
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS is_owner BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN users.is_owner IS 'TRUE if user owns one or more clinics (franchise owner). FALSE for staff/patients.';

-- STEP 2: Add current_clinic_id (owner's active clinic)
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS current_clinic_id UUID;

COMMENT ON COLUMN users.current_clinic_id IS 'For OWNERs: clinic currently operating in (NULL = Lobby mode). For STAFF: their fixed clinic. For PATIENTS: NULL (use patient_clinic_access instead).';

-- STEP 3: Add organization_name (optional, for franchise groups)
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS organization_name VARCHAR(200);

COMMENT ON COLUMN users.organization_name IS 'Optional. Name of the business entity/franchise (e.g., "Imperio Dental S.L."). NULL for solo practitioners.';

-- STEP 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_clinic 
  ON users(current_clinic_id) 
  WHERE current_clinic_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_owner 
  ON users(is_owner) 
  WHERE is_owner = TRUE;

-- STEP 5: Add table comment explaining new architecture
COMMENT ON TABLE users IS 'User accounts with multi-tenant support. is_owner=TRUE for clinic owners. current_clinic_id tracks active clinic (NULL for owners in Lobby mode).';

-- ======================================================
-- MIGRATION COMPLETE
-- Next: Run Migration 2 (create clinics table)
-- ======================================================
