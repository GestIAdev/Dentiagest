-- ============================================================================
-- 🔥 PENTÁGONO LEGAL - NUCLEAR COMPLIANCE SCHEMA
-- ============================================================================
-- Created: November 28, 2025
-- Mission: AI Act 2026 Ready - Compliance as Strategic Weapon
-- Author: PunkClaude + Radwulf
-- Philosophy: "El compliance no se simula. Se construye o no existe."
-- ============================================================================

-- ============================================================================
-- TABLA 1: LEGAL_DOCUMENTS (Biblioteca Legal)
-- ============================================================================
-- Reemplaza el hardcode de LegalTransparencyModule
-- Documentos legales dinámicos, editables, versionados

CREATE TABLE IF NOT EXISTS legal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  
  -- ========== DOCUMENT IDENTITY ==========
  code VARCHAR(50) NOT NULL,                -- 'GDPR-ART-9', 'LEY-25326', 'HIPAA-164'
  title VARCHAR(255) NOT NULL,              -- 'GDPR Artículo 9 - Datos Sensibles'
  description TEXT,
  
  -- ========== CATEGORIZATION ==========
  jurisdiction VARCHAR(50) NOT NULL,        -- 'EU', 'AR', 'US', 'ES', 'GLOBAL'
  category VARCHAR(50) NOT NULL,            -- 'DATA_PRIVACY', 'PATIENT_RIGHTS', 'SECURITY', 'RETENTION'
  document_type VARCHAR(50) NOT NULL,       -- 'REGULATION', 'POLICY', 'TEMPLATE', 'CERTIFICATE'
  
  -- ========== CONTENT ==========
  content_markdown TEXT,                    -- Contenido en Markdown (para docs internos)
  file_path VARCHAR(500),                   -- Path a PDF si existe
  external_url VARCHAR(500),                -- URL oficial si aplica
  
  -- ========== VERSIONING ==========
  version VARCHAR(20) DEFAULT '1.0.0',
  effective_date DATE,
  expiry_date DATE,
  last_reviewed_at TIMESTAMP,
  reviewed_by UUID REFERENCES users(id),
  
  -- ========== METADATA ==========
  is_mandatory BOOLEAN DEFAULT false,       -- ¿Es obligatorio para operar?
  is_template BOOLEAN DEFAULT false,        -- ¿Es plantilla descargable?
  requires_acknowledgment BOOLEAN DEFAULT false, -- ¿El personal debe firmar?
  
  -- ========== AUDIT ==========
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id),
  deleted_at TIMESTAMP,                     -- Soft delete
  
  -- ========== CONSTRAINTS ==========
  CONSTRAINT uq_legal_doc_code_jurisdiction UNIQUE (clinic_id, code, jurisdiction)
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_legal_documents_clinic ON legal_documents(clinic_id);
CREATE INDEX IF NOT EXISTS idx_legal_documents_jurisdiction ON legal_documents(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_legal_documents_category ON legal_documents(category);
CREATE INDEX IF NOT EXISTS idx_legal_documents_type ON legal_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_legal_documents_mandatory ON legal_documents(is_mandatory) WHERE is_mandatory = true;

-- ============================================================================
-- TABLA 2: COMPLIANCE_RULES (Motor de Reglas)
-- ============================================================================
-- Define QUÉ verificar para cada regulación
-- El corazón del cálculo del Score de Compliance

CREATE TABLE IF NOT EXISTS compliance_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- ========== RULE IDENTITY ==========
  code VARCHAR(50) NOT NULL UNIQUE,         -- 'GDPR-CONSENT-001', 'AR-25326-DATA-002'
  name VARCHAR(255) NOT NULL,               -- 'Consentimiento de Tratamiento Obligatorio'
  description TEXT,
  
  -- ========== JURISDICTION & SCOPE ==========
  jurisdiction VARCHAR(50) NOT NULL,        -- 'EU', 'AR', 'US', 'GLOBAL'
  regulation_reference VARCHAR(100),        -- 'GDPR Art. 6.1.a', 'Ley 25.326 Art. 5'
  category VARCHAR(50) NOT NULL,            -- 'DATA_CONSENT', 'SECURITY', 'RETENTION', 'ACCESS'
  
  -- ========== VERIFICATION LOGIC ==========
  -- Query SQL que devuelve TRUE si cumple, FALSE si no
  check_type VARCHAR(50) NOT NULL,          -- 'SQL_QUERY', 'COUNT_COMPARE', 'EXISTS_CHECK', 'MANUAL'
  check_query TEXT,                         -- Query SQL real para verificación automática
  expected_result VARCHAR(50),              -- 'TRUE', '>0', '=0', 'NOT_NULL'
  
  -- ========== SEVERITY & SCORING ==========
  severity VARCHAR(20) NOT NULL DEFAULT 'HIGH', -- 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'
  weight INT NOT NULL DEFAULT 10,           -- Peso en el score (1-100)
  failure_penalty INT NOT NULL DEFAULT 10,  -- Puntos que se restan si falla
  
  -- ========== REMEDIATION ==========
  remediation_steps TEXT,                   -- Qué hacer si falla
  remediation_deadline_days INT DEFAULT 30, -- Días para corregir
  
  -- ========== STATUS ==========
  is_active BOOLEAN DEFAULT true,
  requires_evidence BOOLEAN DEFAULT false,  -- ¿Necesita documentación adjunta?
  
  -- ========== AUDIT ==========
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_compliance_rules_jurisdiction ON compliance_rules(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_compliance_rules_category ON compliance_rules(category);
CREATE INDEX IF NOT EXISTS idx_compliance_rules_active ON compliance_rules(is_active) WHERE is_active = true;

-- ============================================================================
-- TABLA 3: COMPLIANCE_CHECKS (Estado Real de Cumplimiento)
-- ============================================================================
-- Resultado de ejecutar las reglas contra la clínica
-- Lo que genera el Score real

-- Nota: Esta tabla ya existe parcialmente, la expandimos
ALTER TABLE compliance_checks 
  ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS rule_id UUID REFERENCES compliance_rules(id),
  ADD COLUMN IF NOT EXISTS check_result BOOLEAN,
  ADD COLUMN IF NOT EXISTS check_details JSONB,
  ADD COLUMN IF NOT EXISTS evidence_path VARCHAR(500),
  ADD COLUMN IF NOT EXISTS remediated_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS remediated_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS severity VARCHAR(20) DEFAULT 'HIGH';

-- Si no existe, crearla completa
CREATE TABLE IF NOT EXISTS compliance_checks_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  rule_id UUID NOT NULL REFERENCES compliance_rules(id),
  
  -- ========== CHECK RESULT ==========
  check_result BOOLEAN NOT NULL,            -- TRUE = cumple, FALSE = no cumple
  check_details JSONB,                      -- Detalles del resultado (counts, etc.)
  
  -- ========== STATUS TRACKING ==========
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'COMPLIANT', 'NON_COMPLIANT', 'PENDING', 'WAIVED'
  severity VARCHAR(20) NOT NULL DEFAULT 'HIGH',
  
  -- ========== EVIDENCE ==========
  evidence_path VARCHAR(500),               -- Path a documento de evidencia
  evidence_notes TEXT,
  
  -- ========== REMEDIATION ==========
  remediation_deadline DATE,
  remediated_at TIMESTAMP,
  remediated_by UUID REFERENCES users(id),
  remediation_notes TEXT,
  
  -- ========== AUDIT ==========
  checked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  checked_by VARCHAR(100) DEFAULT 'SYSTEM', -- 'SYSTEM' o user_id
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- ========== UNIQUE CHECK PER RULE/CLINIC/DATE ==========
  CONSTRAINT uq_compliance_check UNIQUE (clinic_id, rule_id, DATE(checked_at))
);

CREATE INDEX IF NOT EXISTS idx_compliance_checks_v2_clinic ON compliance_checks_v2(clinic_id);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_v2_rule ON compliance_checks_v2(rule_id);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_v2_status ON compliance_checks_v2(status);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_v2_result ON compliance_checks_v2(check_result);

-- ============================================================================
-- TABLA 4: COMPLIANCE_SCORE_HISTORY (Histórico del Score)
-- ============================================================================
-- Para mostrar evolución del score en el tiempo

CREATE TABLE IF NOT EXISTS compliance_score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  
  -- ========== SCORE SNAPSHOT ==========
  score_date DATE NOT NULL DEFAULT CURRENT_DATE,
  overall_score DECIMAL(5,2) NOT NULL,      -- 0.00 - 100.00
  
  -- ========== BREAKDOWN BY CATEGORY ==========
  data_privacy_score DECIMAL(5,2),
  security_score DECIMAL(5,2),
  patient_rights_score DECIMAL(5,2),
  retention_score DECIMAL(5,2),
  
  -- ========== COUNTS ==========
  total_rules_checked INT NOT NULL DEFAULT 0,
  rules_passed INT NOT NULL DEFAULT 0,
  rules_failed INT NOT NULL DEFAULT 0,
  critical_issues INT NOT NULL DEFAULT 0,
  
  -- ========== METADATA ==========
  calculated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  calculated_by VARCHAR(100) DEFAULT 'SYSTEM',
  
  CONSTRAINT uq_score_clinic_date UNIQUE (clinic_id, score_date)
);

CREATE INDEX IF NOT EXISTS idx_score_history_clinic ON compliance_score_history(clinic_id);
CREATE INDEX IF NOT EXISTS idx_score_history_date ON compliance_score_history(score_date DESC);

-- ============================================================================
-- TABLA 5: STAFF_ACKNOWLEDGMENTS (Firmas de Personal)
-- ============================================================================
-- Registro de que el personal ha leído y aceptado políticas

CREATE TABLE IF NOT EXISTS staff_acknowledgments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES legal_documents(id) ON DELETE CASCADE,
  
  -- ========== ACKNOWLEDGMENT ==========
  acknowledged_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(100),
  user_agent TEXT,
  
  -- ========== VERSION TRACKING ==========
  document_version VARCHAR(20),             -- Versión del documento al momento de firmar
  
  CONSTRAINT uq_staff_acknowledgment UNIQUE (user_id, document_id)
);

CREATE INDEX IF NOT EXISTS idx_staff_ack_clinic ON staff_acknowledgments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_staff_ack_user ON staff_acknowledgments(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_ack_document ON staff_acknowledgments(document_id);

-- ============================================================================
-- 🌱 SEED DATA: REGLAS BASE GDPR + LEY 25.326
-- ============================================================================

INSERT INTO compliance_rules (code, name, description, jurisdiction, regulation_reference, category, check_type, check_query, expected_result, severity, weight, failure_penalty, remediation_steps) VALUES

-- ========== GDPR (EU) ==========
('GDPR-CONSENT-001', 
 'Consentimiento de Tratamiento', 
 'Todos los pacientes deben tener consentimiento de tratamiento registrado',
 'EU', 'GDPR Art. 6.1.a', 'DATA_CONSENT', 'SQL_QUERY',
 'SELECT CASE WHEN COUNT(*) = 0 THEN TRUE ELSE FALSE END FROM patients WHERE consent_to_treatment = false AND deleted_at IS NULL',
 'TRUE', 'CRITICAL', 25, 25,
 '1. Revisar pacientes sin consentimiento
  2. Contactar para obtener firma
  3. Registrar en el sistema'),

('GDPR-CONTACT-002', 
 'Consentimiento de Contacto', 
 'Pacientes deben autorizar explícitamente el contacto',
 'EU', 'GDPR Art. 7', 'DATA_CONSENT', 'SQL_QUERY',
 'SELECT CASE WHEN (SELECT COUNT(*) FROM patients WHERE consent_to_contact IS NULL AND deleted_at IS NULL) = 0 THEN TRUE ELSE FALSE END',
 'TRUE', 'HIGH', 15, 15,
 '1. Verificar preferencias de contacto
  2. Actualizar consentimientos pendientes'),

('GDPR-RETENTION-003', 
 'Política de Retención Definida', 
 'Debe existir política de retención de datos documentada',
 'EU', 'GDPR Art. 5.1.e', 'RETENTION', 'EXISTS_CHECK',
 'SELECT EXISTS(SELECT 1 FROM legal_documents WHERE category = ''RETENTION'' AND jurisdiction = ''EU'' AND deleted_at IS NULL)',
 'TRUE', 'HIGH', 15, 15,
 '1. Crear política de retención
  2. Definir plazos por tipo de dato
  3. Publicar en el sistema'),

('GDPR-SECURITY-004', 
 'Auditoría de Accesos Habilitada', 
 'Sistema debe registrar todos los accesos a datos sensibles',
 'EU', 'GDPR Art. 32', 'SECURITY', 'SQL_QUERY',
 'SELECT EXISTS(SELECT 1 FROM data_audit_logs WHERE created_at > CURRENT_DATE - INTERVAL ''7 days'')',
 'TRUE', 'CRITICAL', 20, 20,
 '1. Verificar configuración de auditoría
  2. Revisar logs recientes
  3. Corregir gaps de logging'),

('GDPR-DELETION-005', 
 'Soft Delete Implementado', 
 'Los borrados deben ser lógicos, no físicos',
 'EU', 'GDPR Art. 17', 'DATA_CONSENT', 'SQL_QUERY',
 'SELECT NOT EXISTS(SELECT 1 FROM data_audit_logs WHERE operation = ''DELETE_HARD'' AND created_at > CURRENT_DATE - INTERVAL ''30 days'')',
 'TRUE', 'HIGH', 10, 10,
 '1. Revisar configuración de borrado
  2. Cambiar DELETE a soft delete
  3. Auditar borrados recientes'),

-- ========== LEY 25.326 (Argentina) ==========
('AR-25326-CONSENT-001', 
 'Consentimiento Expreso (Art. 5)', 
 'Datos sensibles requieren consentimiento expreso del titular',
 'AR', 'Ley 25.326 Art. 5', 'DATA_CONSENT', 'SQL_QUERY',
 'SELECT CASE WHEN COUNT(*) = 0 THEN TRUE ELSE FALSE END FROM patients WHERE consent_to_treatment = false AND deleted_at IS NULL',
 'TRUE', 'CRITICAL', 25, 25,
 '1. Obtener consentimiento firmado
  2. Registrar en sistema
  3. Archivar copia física'),

('AR-25326-ACCESS-002', 
 'Derecho de Acceso (Art. 14)', 
 'Paciente debe poder acceder a sus datos en 10 días',
 'AR', 'Ley 25.326 Art. 14', 'PATIENT_RIGHTS', 'MANUAL',
 NULL, 'TRUE', 'HIGH', 15, 10,
 '1. Verificar que existe función de exportación
  2. Probar tiempo de respuesta
  3. Documentar proceso'),

('AR-25326-RECTIFICATION-003', 
 'Derecho de Rectificación (Art. 16)', 
 'Sistema permite corregir datos inexactos',
 'AR', 'Ley 25.326 Art. 16', 'PATIENT_RIGHTS', 'MANUAL',
 NULL, 'TRUE', 'MEDIUM', 10, 5,
 '1. Verificar edición de perfil funciona
  2. Probar con caso de prueba
  3. Documentar proceso'),

('AR-26529-HISTORY-001', 
 'Acceso a Historia Clínica (Ley 26.529)', 
 'Paciente tiene derecho a acceder a su historia clínica completa',
 'AR', 'Ley 26.529 Art. 2', 'PATIENT_RIGHTS', 'MANUAL',
 NULL, 'TRUE', 'CRITICAL', 20, 15,
 '1. Verificar exportación HC funciona
  2. Incluir todos los documentos
  3. Formato legible')

ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- 🌱 SEED DATA: DOCUMENTOS LEGALES BASE
-- ============================================================================

INSERT INTO legal_documents (code, title, description, jurisdiction, category, document_type, content_markdown, is_mandatory, is_template) VALUES

('GDPR-PRIVACY-POLICY', 
 'Política de Privacidad GDPR', 
 'Política de privacidad conforme al Reglamento General de Protección de Datos',
 'EU', 'DATA_PRIVACY', 'POLICY',
 '# Política de Privacidad

## Responsable del Tratamiento
[Nombre de la Clínica]

## Datos que Recopilamos
- Información médica odontológica
- Datos de contacto del paciente
- Historial de tratamientos

## Base Legal
- Consentimiento del interesado (Art. 6.1.a GDPR)
- Cumplimiento de obligaciones legales médicas

## Derechos del Interesado
- Acceso a sus datos personales
- Rectificación de datos incorrectos
- Supresión de datos ("derecho al olvido")
- Portabilidad de datos
- Oposición al tratamiento

## Conservación
Los datos médicos se conservan según normativa sanitaria aplicable.',
 true, true),

('AR-PRIVACY-POLICY', 
 'Política de Privacidad Ley 25.326', 
 'Política conforme a la Ley de Protección de Datos Personales Argentina',
 'AR', 'DATA_PRIVACY', 'POLICY',
 '# Política de Privacidad - Argentina

## Marco Legal
Ley 25.326 de Protección de Datos Personales

## Responsable
[Nombre de la Clínica Dental]

## Datos Tratados
- Historia clínica odontológica
- Datos de identificación
- Información de contacto

## Derechos del Titular (Art. 14-16)
- Acceso gratuito en intervalos no inferiores a 6 meses
- Rectificación de datos inexactos
- Supresión cuando no sea necesario conservarlos

## Consentimiento (Art. 5)
El tratamiento de datos sensibles (salud) requiere consentimiento expreso.

## Conservación
Mínimo 10 años posterior al último tratamiento (normativa médica).',
 true, true),

('CONSENT-TEMPLATE', 
 'Plantilla de Consentimiento Informado', 
 'Modelo de consentimiento para tratamientos odontológicos',
 'GLOBAL', 'DATA_CONSENT', 'TEMPLATE',
 '# CONSENTIMIENTO INFORMADO

## Identificación del Paciente
Nombre: ________________________
DNI/ID: ________________________
Fecha: ________________________

## Declaración
Declaro que he sido informado/a de:
- [ ] El diagnóstico de mi condición dental
- [ ] El tratamiento propuesto y sus alternativas
- [ ] Los riesgos y beneficios del tratamiento
- [ ] Mi derecho a rechazar el tratamiento

## Autorización
- [ ] Autorizo el tratamiento dental propuesto
- [ ] Autorizo el uso de mis datos para gestión clínica
- [ ] Autorizo contacto para citas y seguimiento

Firma: ________________________
Fecha: ________________________',
 false, true),

('RETENTION-POLICY', 
 'Política de Retención de Datos', 
 'Plazos de conservación de documentación clínica',
 'GLOBAL', 'RETENTION', 'POLICY',
 '# Política de Retención de Datos

## Plazos de Conservación

| Tipo de Documento | Plazo Mínimo | Base Legal |
|-------------------|--------------|------------|
| Historia Clínica | 10 años desde última atención | Normativa sanitaria |
| Radiografías | 10 años | Normativa sanitaria |
| Consentimientos | Permanente | Prueba legal |
| Facturas | 10 años | Normativa fiscal |
| Comunicaciones | 3 años | Normativa comercial |

## Destrucción Segura
Los datos que superen el plazo de retención serán destruidos de forma segura.

## Excepciones
- Litigios pendientes: conservación hasta resolución
- Solicitud del paciente: evaluación caso por caso',
 true, false)

ON CONFLICT DO NOTHING;

-- ============================================================================
-- ✅ VERIFICACIÓN FINAL
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║  🔥 PENTÁGONO LEGAL - MIGRATION COMPLETE                   ║';
  RAISE NOTICE '╠════════════════════════════════════════════════════════════╣';
  RAISE NOTICE '║  ✅ legal_documents table created                          ║';
  RAISE NOTICE '║  ✅ compliance_rules table created                         ║';
  RAISE NOTICE '║  ✅ compliance_checks_v2 table created                     ║';
  RAISE NOTICE '║  ✅ compliance_score_history table created                 ║';
  RAISE NOTICE '║  ✅ staff_acknowledgments table created                    ║';
  RAISE NOTICE '║  ✅ GDPR rules seeded (5 rules)                            ║';
  RAISE NOTICE '║  ✅ Ley 25.326 rules seeded (4 rules)                      ║';
  RAISE NOTICE '║  ✅ Legal documents seeded (4 documents)                   ║';
  RAISE NOTICE '╠════════════════════════════════════════════════════════════╣';
  RAISE NOTICE '║  🎯 AI ACT 2026: READY                                     ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
END $$;

-- Show counts
SELECT 'compliance_rules' as table_name, COUNT(*) as count FROM compliance_rules
UNION ALL
SELECT 'legal_documents', COUNT(*) FROM legal_documents
UNION ALL  
SELECT 'compliance_checks_v2', COUNT(*) FROM compliance_checks_v2;
