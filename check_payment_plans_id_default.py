import psycopg2

conn = psycopg2.connect(
    host='localhost',
    port=5432,
    dbname='dentiagest',
    user='postgres',
    password='11111111'
)
cur = conn.cursor()

# Check column_default for id column
cur.execute("""
SELECT column_name, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'payment_plans' AND column_name = 'id'
""")
row = cur.fetchone()

print(f"Column: {row[0]}")
print(f"Default: {row[1]}")
print(f"Nullable: {row[2]}")

conn.close()
