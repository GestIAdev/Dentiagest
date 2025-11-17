-- ============================================================================
-- NETFLIX-DENTAL INFRASTRUCTURE: Subscription System V3
-- Created: 2025-11-17
-- Purpose: Create missing tables for Patient Portal subscription testing
-- ============================================================================

-- ============================================================================
-- TABLA 1: PLANES DE SUSCRIPCIÓN (Basic, Premium, Elite)
-- ============================================================================
-- Nota: La tabla YA EXISTE, solo agregamos columnas faltantes si no existen
DO $$ 
BEGIN
  -- Agregar columna 'code' si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='subscription_plans_v3' AND column_name='code') THEN
    ALTER TABLE subscription_plans_v3 ADD COLUMN code VARCHAR(50) UNIQUE;
  END IF;
  
  -- Agregar columna 'max_services_per_month' si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='subscription_plans_v3' AND column_name='max_services_per_month') THEN
    ALTER TABLE subscription_plans_v3 ADD COLUMN max_services_per_month INTEGER;
  END IF;
  
  -- Agregar columna 'max_services_per_year' si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='subscription_plans_v3' AND column_name='max_services_per_year') THEN
    ALTER TABLE subscription_plans_v3 ADD COLUMN max_services_per_year INTEGER;
  END IF;
END $$;

-- ============================================================================
-- TABLA 2: SUSCRIPCIONES DE PACIENTES
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscriptions_v3 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans_v3(id),
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, CANCELLED, PAST_DUE, SUSPENDED
  tier VARCHAR(20), -- BASIC, PREMIUM, ELITE (denormalized for speed)
  billing_cycle VARCHAR(20) DEFAULT 'MONTHLY',
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  next_billing_date TIMESTAMP WITH TIME ZONE,
  cancellation_date TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  payment_method_id UUID, -- Referencia a tarjeta guardada (future-proof)
  usage_this_month INTEGER DEFAULT 0,
  usage_this_year INTEGER DEFAULT 0,
  remaining_services INTEGER, -- Calculado dinámicamente
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDICES PARA PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_subscriptions_v3_patient_id 
  ON subscriptions_v3(patient_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_v3_status 
  ON subscriptions_v3(status);

CREATE INDEX IF NOT EXISTS idx_subscriptions_v3_plan_id 
  ON subscriptions_v3(plan_id);

-- ============================================================================
-- SEED: PLANES POR DEFECTO (Basic, Premium, Elite)
-- ============================================================================
INSERT INTO subscription_plans_v3 (name, code, price, currency, billing_cycle, features, max_services_per_month, max_services_per_year, description, is_active) VALUES 
(
  'Basic Care', 
  'BASIC', 
  29.99, 
  'EUR',
  'MONTHLY',
  '["2 Limpiezas anuales", "Emergencias 24/7", "Descuento 5% en tratamientos"]'::jsonb,
  2,
  24,
  'Plan básico con servicios esenciales de higiene dental',
  true
),
(
  'Premium Care', 
  'PREMIUM', 
  49.99, 
  'EUR',
  'MONTHLY',
  '["4 Limpiezas anuales", "Blanqueamiento anual", "Ortodoncia 10% OFF", "Radiografías incluidas"]'::jsonb,
  4,
  48,
  'Plan premium con tratamientos estéticos y preventivos',
  true
),
(
  'Elite Care', 
  'ELITE', 
  99.99, 
  'EUR',
  'MONTHLY',
  '["Limpiezas ilimitadas", "Implantes 15% OFF", "Ortodoncia 15% OFF", "Concierge dental 24/7", "Segunda opinión gratis"]'::jsonb,
  999,
  9999,
  'Plan elite con acceso ilimitado y máximos beneficios',
  true
)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- VERIFICACIÓN: Mostrar planes creados (comentado porque causa error en scripts)
-- ============================================================================
-- SELECT 
--   name, 
--   code, 
--   price || ' ' || currency AS price_formatted,
--   billing_cycle,
--   is_active
-- FROM subscription_plans_v3
-- ORDER BY price ASC;
