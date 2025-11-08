import psycopg2

try:
    conn = psycopg2.connect(
        host='localhost',
        database='dentiagest',
        user='postgres',
        password='postgres'
    )

    cur = conn.cursor()
    cur.execute("""
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'appointments'
        ORDER BY ordinal_position;
    """)
    
    print("\n📋 APPOINTMENTS TABLE COLUMNS:")
    print("=" * 80)
    for row in cur.fetchall():
        col_name, data_type, nullable, default = row
        null_str = "NULL" if nullable == "YES" else "NOT NULL"
        default_str = f"DEFAULT {default}" if default else ""
        print(f"  {col_name:<30} {data_type:<20} {null_str:<10} {default_str}")
    print("=" * 80)
    
    conn.close()
except Exception as e:
    print(f"❌ Error: {type(e).__name__}")
    print(f"   {str(e)}")
