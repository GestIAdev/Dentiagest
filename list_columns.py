import psycopg2

conn = psycopg2.connect('postgresql://postgres:11111111@localhost:5432/dentiagest')
cur = conn.cursor()

tables = ['dental_materials', 'dental_equipment', 'suppliers', 'purchase_orders', 'equipment_maintenance']

for table in tables:
    print(f"\n{'=' * 60}")
    print(f"📋 COLUMNAS DE: {table}")
    print(f"{'=' * 60}")
    
    cur.execute(f"""
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = '{table}'
        ORDER BY ordinal_position
    """)
    
    columns = cur.fetchall()
    for col in columns:
        nullable = "NULL" if col[2] == 'YES' else "NOT NULL"
        print(f"  • {col[0]:<30} {col[1]:<20} {nullable}")
    
    print(f"  TOTAL: {len(columns)} columnas")

cur.close()
conn.close()
