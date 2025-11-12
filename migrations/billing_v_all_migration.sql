-- ======================================================
-- BILLING V_ALL MIGRATION: 5 Tablas del Apocalipsis Financiero
-- Date: 2025-11-12
-- Status: EXECUTION READY
-- ======================================================

-- SCRIPT 1: billing_data (El Cimiento Perdido)
CREATE TYPE billing_status_enum AS ENUM (
  'PENDING',
  'PAID',
  'PARTIAL',
  'OVERDUE',
  'CANCELLED'
);

CREATE TABLE IF NOT EXISTS billing_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5,2) NULL,
  tax_amount NUMERIC(12,2) NULL DEFAULT 0,
  discount_amount NUMERIC(12,2) NULL DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NULL,
  paid_date TIMESTAMP WITH TIME ZONE NULL,
  status billing_status_enum NOT NULL DEFAULT 'PENDING',
  payment_terms TEXT NULL,
  notes TEXT NULL,
  veritas_signature TEXT NULL,
  blockchain_tx_hash TEXT NULL,
  created_by UUID NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE NULL,
  deleted_by UUID NULL,
  deleted_reason TEXT NULL,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_billing_data_patient ON billing_data(patient_id);
CREATE INDEX IF NOT EXISTS idx_billing_data_invoice_number ON billing_data(invoice_number);
CREATE INDEX IF NOT EXISTS idx_billing_data_status ON billing_data(status);

-- SCRIPT 2: payment_plans (Los Pactos)
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

-- SCRIPT 3: partial_payments (Las Gotas)
CREATE TABLE IF NOT EXISTS partial_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES billing_data(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  payment_plan_id UUID NULL REFERENCES payment_plans(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  method TEXT NOT NULL,
  method_id UUID NULL,
  card_last4 TEXT NULL,
  transaction_id TEXT NULL,
  reference TEXT NULL,
  processed_at TIMESTAMP WITH TIME ZONE NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  notes TEXT NULL,
  blockchain_tx_hash TEXT NULL,
  processing_fee NUMERIC(12,2) NULL,
  exchange_rate NUMERIC(12,6) NULL,
  veritas_signature TEXT NULL,
  metadata JSONB NULL,
  created_by UUID NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partial_payments_invoice ON partial_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_partial_payments_patient ON partial_payments(patient_id);
CREATE INDEX IF NOT EXISTS idx_partial_payments_plan ON partial_payments(payment_plan_id);
CREATE INDEX IF NOT EXISTS idx_partial_payments_status ON partial_payments(status);
CREATE INDEX IF NOT EXISTS idx_partial_payments_txid ON partial_payments(transaction_id);

-- SCRIPT 4: payment_reminders (Los Truenos)
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

-- SCRIPT 5: payment_receipts (Los Certificados)
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
