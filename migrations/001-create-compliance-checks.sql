-- Migración: Crear tabla compliance_checks (Robot Army Requirement)
-- Fecha: 13 de Noviembre, 2025
-- Propósito: Implementar backend real para Compliance Module (Fase 5)

CREATE TABLE IF NOT EXISTS compliance_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  regulation_id VARCHAR(100) NOT NULL,
  compliance_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  description TEXT,
  last_checked TIMESTAMP,
  next_check TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Índices para queries comunes
  CONSTRAINT fk_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Crear índices para optimizar queries
CREATE INDEX IF NOT EXISTS idx_compliance_checks_patient_id ON compliance_checks(patient_id);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_regulation_id ON compliance_checks(regulation_id);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_status ON compliance_checks(compliance_status);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_created_at ON compliance_checks(created_at);

-- Insertar datos de prueba (para que el Robot Army tenga con qué trabajar)
INSERT INTO compliance_checks 
  (patient_id, regulation_id, compliance_status, description, last_checked, next_check)
SELECT 
  p.id,
  'HIPAA_PRIVACY',
  'COMPLIANT',
  'HIPAA compliance check - automated',
  CURRENT_TIMESTAMP - INTERVAL '7 days',
  CURRENT_TIMESTAMP + INTERVAL '90 days'
FROM patients p
LIMIT 5
ON CONFLICT DO NOTHING;

-- Verificar que se creó
SELECT COUNT(*) as compliance_records FROM compliance_checks;
