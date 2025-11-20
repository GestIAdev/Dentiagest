-- ======================================================
-- EMPIRE ARCHITECTURE V2 - MIGRATION 2/6
-- Date: 2025-11-20
-- Purpose: Create clinics table (core of multi-tenant architecture)
-- Author: PunkClaude - "Una clínica es un reino"
-- Status: ✅ APPROVED by Cónclave
-- ======================================================

-- STEP 1: Create clinics table
CREATE TABLE IF NOT EXISTS clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Business Identity
  name VARCHAR(200) NOT NULL,
  cif VARCHAR(50), -- Tax ID / Business registration number
  organization_name VARCHAR(200), -- Optional: Franchise/brand name
  
  -- Location
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'ES', -- ISO codes: ES, AR, US, etc.
  
  -- Contact
  phone VARCHAR(50),
  email VARCHAR(255),
  
  -- Business Config
  currency VARCHAR(3) DEFAULT 'EUR', -- EUR, USD, ARS, GBP, etc.
  timezone VARCHAR(50) DEFAULT 'Europe/Madrid', -- IANA timezone
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- STEP 2: Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_clinics_country 
  ON clinics(country);

CREATE INDEX IF NOT EXISTS idx_clinics_currency 
  ON clinics(currency);

CREATE INDEX IF NOT EXISTS idx_clinics_active 
  ON clinics(is_active) 
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_clinics_org 
  ON clinics(organization_name) 
  WHERE organization_name IS NOT NULL;

-- STEP 3: Add table comment
COMMENT ON TABLE clinics IS 'Physical clinic locations. Core of multi-tenant architecture. Each clinic is a separate business unit with own staff, patients, inventory.';

-- STEP 4: Add column comments
COMMENT ON COLUMN clinics.id IS 'Clinic primary key. Used in all multi-tenant queries.';
COMMENT ON COLUMN clinics.name IS 'Display name (e.g., "Clínica Dental Radwulf Centro")';
COMMENT ON COLUMN clinics.cif IS 'Tax ID / Business registration number (optional for demo mode)';
COMMENT ON COLUMN clinics.organization_name IS 'Franchise/brand name if part of a group (e.g., "Imperio Dental S.L.")';
COMMENT ON COLUMN clinics.currency IS 'Default currency for pricing (EUR, USD, ARS). Used in billing module.';
COMMENT ON COLUMN clinics.timezone IS 'IANA timezone (e.g., "Europe/Madrid"). Used for appointment scheduling.';
COMMENT ON COLUMN clinics.is_active IS 'FALSE if clinic is closed/deactivated. Soft delete.';

-- STEP 5: Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_clinics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_clinics_updated_at
  BEFORE UPDATE ON clinics
  FOR EACH ROW
  EXECUTE FUNCTION update_clinics_updated_at();

-- ======================================================
-- MIGRATION COMPLETE
-- Next: Run Migration 3 (add clinic_id to users)
-- ======================================================
