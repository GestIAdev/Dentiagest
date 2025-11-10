-- ============================================================================
-- TABLA: cart_items
-- DESCRIPCIÓN: Carrito de compras para marketplace de materiales dentales
-- AUTOR: PunkClaude (rescatando diseño de PunkGrok)
-- FECHA: 2025-11-10
-- ============================================================================

CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    marketplace_product_id INTEGER NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(marketplace_product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_added_at ON cart_items(added_at DESC);

-- Comentarios
COMMENT ON TABLE cart_items IS 'Carrito de compras para productos del marketplace';
COMMENT ON COLUMN cart_items.marketplace_product_id IS 'ID del producto en marketplace (FK virtual a marketplace_products)';
COMMENT ON COLUMN cart_items.quantity IS 'Cantidad de unidades';
COMMENT ON COLUMN cart_items.unit_price IS 'Precio unitario en el momento de añadir al carrito';
COMMENT ON COLUMN cart_items.total_price IS 'Precio total calculado (quantity * unit_price)';
COMMENT ON COLUMN cart_items.added_at IS 'Fecha y hora en que se añadió al carrito';
