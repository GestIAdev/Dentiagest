-- ============================================================================
-- VISTA: inventory (apunta a dental_materials)
-- DESCRIPCIÓN: Vista de compatibilidad para código legacy que espera tabla 'inventory'
--              Mapea dental_materials a la estructura antigua de inventory
-- AUTOR: PunkClaude 
-- FECHA: 2025-11-10
-- NOTA: Esta es una solución TEMPORAL. El código debería migrar a usar
--       dental_materials directamente en vez de inventory.
-- ============================================================================

-- Eliminar vista si existe
DROP VIEW IF EXISTS inventory CASCADE;

-- Crear vista que mapea dental_materials -> inventory
CREATE VIEW inventory AS
SELECT
    id,
    name,
    category,
    current_stock,
    minimum_stock,
    unit,
    'WAREHOUSE' as location,  -- Valor por defecto (no existe en dental_materials)
    NULL as supplier_id,       -- NULL porque dental_materials tiene 'supplier' (VARCHAR) no supplier_id (INT)
    updated_at as last_restocked,  -- Aproximación: última actualización = último restock
    expiry_date,
    current_stock * unit_cost as total_value,  -- Calculado
    created_at,
    updated_at
FROM dental_materials
WHERE is_active = true;

-- Comentario
COMMENT ON VIEW inventory IS 'Vista de compatibilidad legacy - mapea dental_materials a estructura antigua inventory';
