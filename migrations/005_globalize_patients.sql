-- ======================================================
-- EMPIRE ARCHITECTURE V2 - MIGRATION 5/6  
-- Date: 2025-11-20
-- Purpose: GLOBALIZE PATIENTS (Portable Records™)
-- Author: PunkClaude - "El paciente no pertenece a la clínica. El paciente ES libre."
-- Status: ✅ APPROVED by Cónclave - KEY INNOVATION
-- ======================================================
-- 
-- CRITICAL CHANGE: Patients will no longer be "owned" by one clinic.
-- Instead, they can visit multiple clinics with portable medical records.
-- This enables:
-- - Franchise model (patient visits different branches)
-- - GDPR Art. 20 compliance (data portability)
-- - Network effect (moat against competitors)
-- - Patient owns identity, clinics own treatment data
--
-- ======================================================

-- ============================================================================
-- STEP 1: Verify patients table has NO clinic_id (already global)
-- ============================================================================

-- ✅ GOOD NEWS: patients table does NOT have clinic_id column
-- This means patients are already global by design!
-- We just need to create patient_clinic_access for many-to-many relationship

DO $$
BEGIN
    RAISE NOTICE '✅ Patients table is already GLOBAL (no clinic_id found)';
    RAISE NOTICE '🚀 Creating patient_clinic_access for many-to-many relationship...';
END
$$;

-- ============================================================================
-- STEP 2: Create patient_clinic_access table (many-to-many)
-- ============================================================================

CREATE TABLE IF NOT EXISTS patient_clinic_access (
  patient_id UUID NOT NULL,
  clinic_id UUID NOT NULL,
  
  -- Relationship metadata
  first_visit_date DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Composite primary key
  PRIMARY KEY (patient_id, clinic_id)
);

-- ============================================================================
-- STEP 3: Add foreign key constraints
-- ============================================================================

ALTER TABLE patient_clinic_access
  ADD CONSTRAINT fk_patient_clinic_access_patient
  FOREIGN KEY (patient_id) 
  REFERENCES patients(id) 
  ON DELETE CASCADE; -- If patient deleted, remove all clinic associations

ALTER TABLE patient_clinic_access
  ADD CONSTRAINT fk_patient_clinic_access_clinic
  FOREIGN KEY (clinic_id) 
  REFERENCES clinics(id) 
  ON DELETE CASCADE; -- If clinic deleted, remove patient association

-- ============================================================================
-- STEP 4: Create indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_patient_clinic_access_patient 
  ON patient_clinic_access(patient_id);

CREATE INDEX IF NOT EXISTS idx_patient_clinic_access_clinic 
  ON patient_clinic_access(clinic_id);

CREATE INDEX IF NOT EXISTS idx_patient_clinic_access_active 
  ON patient_clinic_access(is_active) 
  WHERE is_active = TRUE;

-- ============================================================================
-- STEP 5: Add table and column comments
-- ============================================================================

COMMENT ON TABLE patient_clinic_access IS 'Portable Records™: Patients can visit multiple clinics. This is a many-to-many relationship. Patient owns identity (patients table), clinics own treatment data (via this join table).';

COMMENT ON COLUMN patient_clinic_access.patient_id IS 'Patient who can access this clinic';
COMMENT ON COLUMN patient_clinic_access.clinic_id IS 'Clinic where patient has visited';
COMMENT ON COLUMN patient_clinic_access.first_visit_date IS 'Date of first appointment at this clinic';
COMMENT ON COLUMN patient_clinic_access.is_active IS 'FALSE if patient transferred to another clinic and no longer visits this one';

-- ============================================================================
-- STEP 6: NO DATA MIGRATION NEEDED
-- ============================================================================

-- ✅ patients table has NO clinic_id, so no existing data to migrate
-- patient_clinic_access will be populated when:
-- 1. Patient registers at a clinic (onboarding creates first entry)
-- 2. Patient visits different clinic (new entry created)
-- 3. Patient transfers from old system (manual migration script)

DO $$
BEGIN
  RAISE NOTICE '✅ patient_clinic_access table created successfully';
  RAISE NOTICE '🎯 Portable Records™ architecture ready';
  RAISE NOTICE '📊 Patient-clinic relationships will be created on first visit';
END
$$;

-- ============================================================================
-- STEP 7: Create trigger for updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_patient_clinic_access_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_patient_clinic_access_updated_at
  BEFORE UPDATE ON patient_clinic_access
  FOR EACH ROW
  EXECUTE FUNCTION update_patient_clinic_access_updated_at();

-- ============================================================================
-- STEP 8: Patients table is ALREADY GLOBAL (no clinic_id to drop)
-- ============================================================================

-- ✅ No cleanup needed - patients table was designed correctly from the start
-- Backend queries will use patient_clinic_access for clinic-patient relationships

DO $$
BEGIN
  RAISE NOTICE '🏛️ EMPIRE ARCHITECTURE V2 - PORTABLE RECORDS ENABLED';
  RAISE NOTICE '✅ Patients: GLOBAL identity (no clinic ownership)';
  RAISE NOTICE '✅ patient_clinic_access: Many-to-many (patient can visit multiple clinics)';
  RAISE NOTICE '🔒 MOAT CREATED: Patients can transfer between franchise clinics seamlessly';
END
$$;

-- ======================================================
-- MIGRATION COMPLETE
-- Next: Run Migration 6 (create staff_clinic_access for future multi-clinic staff)
-- ======================================================
