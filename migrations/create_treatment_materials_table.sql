-- ============================================================================
-- MIGRATION: CREATE treatment_materials TABLE
-- DIRECTIVA: ENDER-D1-005 (Economic Singularity - Persistencia Completa)
-- FECHA: 2025-11-17
-- AUTOR: PunkClaude 4.5 + Radwulf
-- ============================================================================
--
-- MISIÓN: Crear tabla intermedia para persistir materiales usados en tratamientos
--         con snapshot de costos en el momento de uso (INMUTABLES para auditoría).
--
-- JUSTIFICACIÓN:
-- - Opción A (memoria GraphQL) = Economic Amnesia ❌
-- - Opción B (persistencia DB) = Economic Singularity ✅
-- - Permite calcular profit_margin REAL en facturas
-- - Auditable, rastreable, verificable por @veritas
--
-- CRÍTICO: Esta tabla es NÚCLEO FINANCIERO. No puede fallar.
-- ============================================================================

-- ============================================================================
-- STEP 0: CLEANUP (Por si existe de intento anterior)
-- ============================================================================

DROP VIEW IF EXISTS treatment_material_costs CASCADE;
DROP TABLE IF EXISTS treatment_materials CASCADE;

-- ============================================================================
-- STEP 1: CREATE treatment_materials TABLE
-- ============================================================================

CREATE TABLE treatment_materials (
  -- PRIMARY KEY
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- FOREIGN KEYS
  treatment_id UUID NOT NULL,
  material_id INTEGER NOT NULL,  -- INTEGER porque dental_materials.id es INT4
  
  -- CANTIDAD USADA (Decimal para precisión en odontología)
  quantity DECIMAL(10, 2) NOT NULL CHECK (quantity > 0),
  
  -- SNAPSHOT DE COSTO (INMUTABLE - precio en momento de uso)
  -- CRÍTICO: Si dental_materials.unit_cost cambia mañana,
  --          este campo mantiene el costo histórico REAL
  cost_snapshot DECIMAL(10, 2) NOT NULL CHECK (cost_snapshot >= 0),
  
  -- AUDIT TRAIL
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by UUID,
  
  -- CONSTRAINTS
  CONSTRAINT fk_treatment_materials_treatment 
    FOREIGN KEY (treatment_id) 
    REFERENCES medical_records(id) 
    ON DELETE CASCADE,
  
  CONSTRAINT fk_treatment_materials_material 
    FOREIGN KEY (material_id) 
    REFERENCES dental_materials(id) 
    ON DELETE RESTRICT  -- RESTRICT porque no podemos borrar un material si se usó en tratamiento
);

-- ============================================================================
-- STEP 2: CREATE INDEXES (Performance crítico para billing)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_treatment_materials_treatment_id 
  ON treatment_materials(treatment_id);

CREATE INDEX IF NOT EXISTS idx_treatment_materials_material_id 
  ON treatment_materials(material_id);

CREATE INDEX IF NOT EXISTS idx_treatment_materials_created_at 
  ON treatment_materials(created_at DESC);

-- ============================================================================
-- STEP 3: CREATE HELPFUL VIEW (Suma de costos por tratamiento)
-- ============================================================================

CREATE OR REPLACE VIEW treatment_material_costs AS
SELECT 
  treatment_id,
  COUNT(*) AS material_count,
  SUM(quantity * cost_snapshot) AS total_material_cost,
  ARRAY_AGG(
    json_build_object(
      'material_id', material_id,
      'quantity', quantity,
      'cost_snapshot', cost_snapshot,
      'line_total', quantity * cost_snapshot
    )
  ) AS materials_breakdown
FROM treatment_materials
GROUP BY treatment_id;

-- ============================================================================
-- STEP 4: ADD COMMENTS (Database Documentation)
-- ============================================================================

COMMENT ON TABLE treatment_materials IS 
  'Tabla intermedia para materiales usados en tratamientos. Guarda snapshot de costos para cálculo preciso de profit_margin. CRÍTICO: Parte del núcleo financiero (Economic Singularity).';

COMMENT ON COLUMN treatment_materials.cost_snapshot IS 
  'Precio del material en el momento de uso. INMUTABLE para auditoría histórica. No se actualiza aunque dental_materials.unit_cost cambie después.';

COMMENT ON VIEW treatment_material_costs IS 
  'Vista helper para billing: suma total_material_cost por tratamiento.';

-- ============================================================================
-- VERIFICATION QUERY (Ejecutar después de migración)
-- ============================================================================

-- SELECT 
--   table_name, 
--   column_name, 
--   data_type, 
--   is_nullable
-- FROM information_schema.columns 
-- WHERE table_name = 'treatment_materials'
-- ORDER BY ordinal_position;

-- ============================================================================
-- ROLLBACK (Si necesario - USAR CON CUIDADO)
-- ============================================================================

-- DROP VIEW IF EXISTS treatment_material_costs;
-- DROP TABLE IF EXISTS treatment_materials;
