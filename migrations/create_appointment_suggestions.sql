-- ============================================================================
-- DIRECTIVA #004: AI-Assisted Appointment Scheduling (GeminiEnder CEO)
-- Fecha: 17-Nov-2025
-- ============================================================================

CREATE TABLE IF NOT EXISTS appointment_suggestions (
  id SERIAL PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  clinic_id INTEGER, -- Optional, no FK for MVP
  
  -- Request Info
  appointment_type VARCHAR(20) NOT NULL CHECK (appointment_type IN ('normal', 'urgent')),
  patient_request JSONB NOT NULL,
  
  -- AI Suggestion
  suggested_date DATE NOT NULL,
  suggested_time TIME NOT NULL,
  suggested_duration INTEGER NOT NULL DEFAULT 30,
  suggested_practitioner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- AI Analysis
  confidence_score DECIMAL(3, 2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  reasoning JSONB,
  ia_diagnosis JSONB,
  
  -- Workflow Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP,
  rejection_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast queries
CREATE INDEX idx_appointment_suggestions_patient ON appointment_suggestions(patient_id);
CREATE INDEX idx_appointment_suggestions_status ON appointment_suggestions(status);
CREATE INDEX idx_appointment_suggestions_date ON appointment_suggestions(suggested_date);
CREATE INDEX idx_appointment_suggestions_clinic ON appointment_suggestions(clinic_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_appointment_suggestions_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_appointment_suggestions_timestamp
BEFORE UPDATE ON appointment_suggestions
FOR EACH ROW
EXECUTE FUNCTION update_appointment_suggestions_timestamp();

COMMENT ON TABLE appointment_suggestions IS 'AI-generated appointment suggestions pending admin approval - DIRECTIVA #004';
