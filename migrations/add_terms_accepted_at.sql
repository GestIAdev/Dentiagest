-- Add GDPR compliance field to patients table
-- This field stores when the patient accepted terms and conditions

ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP;

-- Add comment for documentation
COMMENT ON COLUMN patients.terms_accepted_at IS 'GDPR Article 9 - Timestamp when patient accepted terms and conditions';

-- Update existing patients (retroactive acceptance timestamp)
UPDATE patients 
SET terms_accepted_at = created_at 
WHERE terms_accepted_at IS NULL;
