-- ======================================================
-- NETFLIX DENTAL BILLING ACTIVATION - ENDER-D1-001
-- Date: 2025-01-XX
-- Status: EXECUTION READY
-- Purpose: Link billing_data to subscriptions_v3 for recurring billing
-- ======================================================

-- Add nullable subscription_id FK to billing_data
-- Nullable para soportar facturas no recurrentes (one-off invoices)
ALTER TABLE billing_data 
ADD COLUMN IF NOT EXISTS subscription_id UUID 
REFERENCES subscriptions_v3(id) ON DELETE SET NULL;

-- Index para performance en queries de billing por subscription
CREATE INDEX IF NOT EXISTS idx_billing_subscription 
ON billing_data(subscription_id);

-- Comment para documentación
COMMENT ON COLUMN billing_data.subscription_id IS 'FK a subscriptions_v3. NULL = factura no recurrente. ON DELETE SET NULL preserva factura histórica si subscription se borra.';
