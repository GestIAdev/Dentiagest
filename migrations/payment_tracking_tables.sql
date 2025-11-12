-- ============================================================================
-- BILLING V2 MIGRATION: Payment Tracking Tables
-- Date: 2025-11-12
-- Architect: PunkGrok
-- Mission: Create 4 tables for payment plans, partial payments, reminders, receipts
-- ============================================================================

-- 1. Los Pactos de Pago
CREATE TABLE IF NOT EXISTS payment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  billing_id UUID NOT NULL REFERENCES billing_data(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  total_amount NUMERIC(12,2) NOT NULL,
  installments_count INTEGER NOT NULL DEFAULT 1,
  installment_amount NUMERIC(12,2) NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'monthly',
  start_date DATE NOT NULL,
  end_date DATE NULL,
  status TEXT NOT NULL DEFAULT 'active',
  veritas_signature TEXT NULL,
  created_by UUID NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_plans_billing ON payment_plans(billing_id);
CREATE INDEX IF NOT EXISTS idx_payment_plans_patient ON payment_plans(patient_id);
CREATE INDEX IF NOT EXISTS idx_payment_plans_status ON payment_plans(status);

-- 2. Las Gotas del Diluvio
CREATE TABLE IF NOT EXISTS partial_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_plan_id UUID NULL REFERENCES payment_plans(id) ON DELETE SET NULL,
  billing_id UUID NOT NULL REFERENCES billing_data(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  method_id UUID NULL,
  method_type TEXT NOT NULL,
  transaction_id TEXT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  processed_at TIMESTAMP WITH TIME ZONE NULL,
  veritas_signature TEXT NULL,
  metadata JSONB NULL,
  created_by UUID NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partial_payments_billing ON partial_payments(billing_id);
CREATE INDEX IF NOT EXISTS idx_partial_payments_patient ON partial_payments(patient_id);
CREATE INDEX IF NOT EXISTS idx_partial_payments_plan ON partial_payments(payment_plan_id);
CREATE INDEX IF NOT EXISTS idx_partial_payments_status ON partial_payments(status);

-- 3. Los Truenos del Recordatorio
CREATE TABLE IF NOT EXISTS payment_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  billing_id UUID NOT NULL REFERENCES billing_data(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  message_template TEXT NULL,
  veritas_signature TEXT NULL,
  metadata JSONB NULL,
  created_by UUID NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_reminders_billing ON payment_reminders(billing_id);
CREATE INDEX IF NOT EXISTS idx_payment_reminders_patient ON payment_reminders(patient_id);
CREATE INDEX IF NOT EXISTS idx_payment_reminders_scheduled ON payment_reminders(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_payment_reminders_status ON payment_reminders(status);

-- 4. Los Certificados Inmutables
CREATE TABLE IF NOT EXISTS payment_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES partial_payments(id) ON DELETE CASCADE,
  billing_id UUID NOT NULL REFERENCES billing_data(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  receipt_number TEXT NOT NULL UNIQUE,
  total_amount NUMERIC(12,2) NOT NULL,
  paid_amount NUMERIC(12,2) NOT NULL,
  balance_remaining NUMERIC(12,2) NOT NULL DEFAULT 0,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  veritas_signature TEXT NOT NULL,
  pdf_url TEXT NULL,
  metadata JSONB NULL,
  created_by UUID NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_receipts_billing ON payment_receipts(billing_id);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_patient ON payment_receipts(patient_id);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_payment ON payment_receipts(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_number ON payment_receipts(receipt_number);
