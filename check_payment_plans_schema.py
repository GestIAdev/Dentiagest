import psycopg2

conn = psycopg2.connect(
    host='localhost',
    port=5432,
    dbname='dentiagest',
    user='postgres',
    password='11111111'
)
cur = conn.cursor()

# Check if payment_plans table exists
cur.execute("""
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'payment_plans'
)
""")
exists = cur.fetchone()[0]

if exists:
    print("✅ Table 'payment_plans' EXISTS")
    print("\n📋 SCHEMA:")
    print("-" * 80)
    cur.execute("""
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_name = 'payment_plans' 
    ORDER BY ordinal_position
    """)
    for row in cur.fetchall():
        print(f"{row[0]:30} {row[1]:20} {row[2]}")
else:
    print("❌ Table 'payment_plans' DOES NOT EXIST")

conn.close()
