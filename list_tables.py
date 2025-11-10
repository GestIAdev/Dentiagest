import psycopg2

conn = psycopg2.connect('postgresql://postgres:11111111@localhost:5432/dentiagest')
cur = conn.cursor()
cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name")
tables = cur.fetchall()

print("=" * 60)
print("📊 TABLAS EN DENTIAGEST DATABASE:")
print("=" * 60)
for table in tables:
    print(f"  ✅ {table[0]}")
print("=" * 60)
print(f"TOTAL: {len(tables)} tablas")
print("=" * 60)

cur.close()
conn.close()
