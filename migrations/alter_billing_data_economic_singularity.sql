-- ============================================================================
-- MIGRATION: ALTER billing_data TABLE (Economic Singularity Fields)
-- DIRECTIVA: ENDER-D1-005 (Economic Singularity - Persistencia Completa)
-- FECHA: 2025-11-17
-- AUTOR: PunkClaude 4.5 + Radwulf
-- ============================================================================
--
-- MISIÓN: Agregar columnas para vincular facturación con tratamientos
--         y calcular profit_margin en tiempo real.
--
-- NUEVAS COLUMNAS:
-- - treatment_id: FK a medical_records (opcional - no todas las facturas son por tratamiento)
-- - material_cost: Costo total de materiales usados (calculado desde treatment_materials)
-- - profit_margin: Margen de beneficio (totalAmount - materialCost) / totalAmount
--
-- CRÍTICO: Esta es la "Economic Singularity" - el sistema sabe cuánto gana REALMENTE.
-- ============================================================================

-- ============================================================================
-- STEP 1: ADD COLUMNS TO billing_data
-- ============================================================================

ALTER TABLE billing_data 
  ADD COLUMN IF NOT EXISTS treatment_id UUID,
  ADD COLUMN IF NOT EXISTS material_cost DECIMAL(10, 2) DEFAULT 0 CHECK (material_cost >= 0),
  ADD COLUMN IF NOT EXISTS profit_margin DECIMAL(5, 4) CHECK (profit_margin >= -1 AND profit_margin <= 1);
  -- profit_margin es porcentaje en formato decimal: 0.50 = 50%, -0.10 = -10% (pérdida)

-- ============================================================================
-- STEP 2: ADD FOREIGN KEY CONSTRAINT
-- ============================================================================

ALTER TABLE billing_data
  ADD CONSTRAINT fk_billing_data_treatment
    FOREIGN KEY (treatment_id)
    REFERENCES medical_records(id)
    ON DELETE SET NULL;  -- Si se borra el tratamiento, la factura mantiene datos pero pierde vínculo

-- ============================================================================
-- STEP 3: CREATE INDEX (Performance para queries de rentabilidad)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_billing_data_treatment_id 
  ON billing_data(treatment_id);

CREATE INDEX IF NOT EXISTS idx_billing_data_profit_margin 
  ON billing_data(profit_margin DESC NULLS LAST);  -- Para reportes de rentabilidad

-- ============================================================================
-- STEP 4: ADD COMMENTS (Database Documentation)
-- ============================================================================

COMMENT ON COLUMN billing_data.treatment_id IS 
  'FK a medical_records. Vincula factura con tratamiento específico. NULL si la factura no está vinculada a tratamiento (ej: consulta simple, producto marketplace).';

COMMENT ON COLUMN billing_data.material_cost IS 
  'Costo total de materiales usados en el tratamiento asociado. Calculado desde treatment_materials.cost_snapshot * quantity. INMUTABLE una vez guardado (snapshot histórico).';

COMMENT ON COLUMN billing_data.profit_margin IS 
  'Margen de beneficio: (total_amount - material_cost) / total_amount. Formato decimal: 0.50 = 50%, 0.30 = 30%, -0.10 = -10% (pérdida). NULL si no hay tratamiento asociado o material_cost es 0.';

-- ============================================================================
-- STEP 5: CREATE HELPER VIEW (Análisis de Rentabilidad)
-- ============================================================================

CREATE OR REPLACE VIEW billing_profitability_analysis AS
SELECT 
  bd.id AS billing_id,
  bd.invoice_number,
  bd.patient_id,
  bd.treatment_id,
  bd.total_amount,
  bd.material_cost,
  bd.profit_margin,
  
  -- CLASIFICACIÓN DE RENTABILIDAD
  CASE 
    WHEN bd.profit_margin IS NULL THEN 'N/A'
    WHEN bd.profit_margin > 0.50 THEN 'EXCELLENT'  -- >50% margen
    WHEN bd.profit_margin > 0.30 THEN 'GOOD'       -- 30-50%
    WHEN bd.profit_margin > 0.10 THEN 'ACCEPTABLE' -- 10-30%
    WHEN bd.profit_margin >= 0 THEN 'LOW'          -- 0-10%
    ELSE 'LOSS'                                     -- <0% (pérdida)
  END AS profitability_category,
  
  -- BENEFICIO NETO EN EUROS
  (bd.total_amount - bd.material_cost) AS net_profit,
  
  -- METADATOS
  bd.issue_date,
  bd.status,
  bd.created_at
  
FROM billing_data bd
WHERE bd.treatment_id IS NOT NULL  -- Solo facturas vinculadas a tratamientos
ORDER BY bd.profit_margin DESC NULLS LAST;

-- ============================================================================
-- STEP 6: CREATE AGGREGATE VIEW (KPIs de Rentabilidad Global)
-- ============================================================================

CREATE OR REPLACE VIEW billing_profitability_kpis AS
SELECT 
  COUNT(*) AS total_treatment_invoices,
  
  -- INGRESOS VS COSTOS
  SUM(total_amount) AS total_revenue,
  SUM(material_cost) AS total_material_costs,
  SUM(total_amount - material_cost) AS total_net_profit,
  
  -- MARGEN PROMEDIO
  AVG(profit_margin) AS average_profit_margin,
  
  -- DISTRIBUCIÓN POR CATEGORÍA
  COUNT(*) FILTER (WHERE profit_margin > 0.50) AS excellent_count,
  COUNT(*) FILTER (WHERE profit_margin BETWEEN 0.30 AND 0.50) AS good_count,
  COUNT(*) FILTER (WHERE profit_margin BETWEEN 0.10 AND 0.30) AS acceptable_count,
  COUNT(*) FILTER (WHERE profit_margin BETWEEN 0 AND 0.10) AS low_count,
  COUNT(*) FILTER (WHERE profit_margin < 0) AS loss_count,
  
  -- PORCENTAJES
  ROUND(100.0 * COUNT(*) FILTER (WHERE profit_margin > 0.50) / COUNT(*), 2) AS excellent_percentage,
  ROUND(100.0 * COUNT(*) FILTER (WHERE profit_margin < 0) / COUNT(*), 2) AS loss_percentage
  
FROM billing_data
WHERE treatment_id IS NOT NULL AND profit_margin IS NOT NULL;

-- ============================================================================
-- STEP 7: ADD COMMENTS TO VIEWS
-- ============================================================================

COMMENT ON VIEW billing_profitability_analysis IS 
  'Análisis de rentabilidad por factura vinculada a tratamiento. Incluye clasificación (EXCELLENT/GOOD/ACCEPTABLE/LOW/LOSS) y beneficio neto. Usado por frontend para mostrar badges de rentabilidad.';

COMMENT ON VIEW billing_profitability_kpis IS 
  'KPIs agregados de rentabilidad global. Usado por dashboard ejecutivo para visualizar salud financiera. Responde: ¿Cuánto estamos ganando REALMENTE?';

-- ============================================================================
-- VERIFICATION QUERIES (Ejecutar después de migración)
-- ============================================================================

-- Verificar columnas nuevas
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'billing_data' 
--   AND column_name IN ('treatment_id', 'material_cost', 'profit_margin');

-- Verificar foreign key
-- SELECT constraint_name, constraint_type 
-- FROM information_schema.table_constraints 
-- WHERE table_name = 'billing_data' AND constraint_name = 'fk_billing_data_treatment';

-- Probar views
-- SELECT * FROM billing_profitability_kpis;

-- ============================================================================
-- ROLLBACK (Si necesario - USAR CON CUIDADO)
-- ============================================================================

-- DROP VIEW IF EXISTS billing_profitability_kpis;
-- DROP VIEW IF EXISTS billing_profitability_analysis;
-- ALTER TABLE billing_data DROP CONSTRAINT IF EXISTS fk_billing_data_treatment;
-- ALTER TABLE billing_data DROP COLUMN IF EXISTS profit_margin;
-- ALTER TABLE billing_data DROP COLUMN IF EXISTS material_cost;
-- ALTER TABLE billing_data DROP COLUMN IF EXISTS treatment_id;
