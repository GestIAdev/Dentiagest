import psycopg2

# Conectar a PostgreSQL
conn = psycopg2.connect(
    dbname='dentiagest',
    user='postgres',
    password='11111111',
    host='localhost'
)
cur = conn.cursor()

# Crear tabla cart_items
cart_items_sql = """
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

CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(marketplace_product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_added_at ON cart_items(added_at DESC);
"""

print("🔨 Creando tabla cart_items...")
cur.execute(cart_items_sql)
conn.commit()
print("✅ Tabla cart_items creada exitosamente")

# Crear vista inventory
inventory_view_sql = """
DROP VIEW IF EXISTS inventory CASCADE;

CREATE VIEW inventory AS
SELECT
    id,
    name,
    category,
    current_stock,
    minimum_stock,
    unit,
    'WAREHOUSE' as location,
    NULL::INTEGER as supplier_id,
    updated_at as last_restocked,
    expiry_date,
    created_at,
    updated_at
FROM dental_materials
WHERE is_active = true;
"""

print("🔨 Creando vista inventory...")
cur.execute(inventory_view_sql)
conn.commit()
print("✅ Vista inventory creada exitosamente")

# Verificar
cur.execute("SELECT COUNT(*) FROM cart_items")
cart_count = cur.fetchone()[0]
print(f"📊 cart_items tiene {cart_count} registros")

cur.execute("SELECT COUNT(*) FROM inventory")
inv_count = cur.fetchone()[0]
print(f"📊 inventory vista tiene {inv_count} registros (mapeados desde dental_materials)")

cur.close()
conn.close()

print("\n🎯 TABLAS CREADAS - Listo para re-run tests")
