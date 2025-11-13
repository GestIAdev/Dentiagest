import psycopg2

conn = psycopg2.connect(
    host='localhost',
    port=5432,
    dbname='dentiagest',
    user='postgres',
    password='11111111'
)
cur = conn.cursor()

# First, check schema of integrity_checks table
cur.execute("""
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'integrity_checks'
ORDER BY ordinal_position
""")
print("📋 integrity_checks schema:")
for row in cur.fetchall():
    print(f"  {row[0]:30} {row[1]}")
print()

# Check integrity_checks for PaymentPlanV3
cur.execute("""
SELECT *
FROM integrity_checks
WHERE entity_type = 'PaymentPlanV3'
ORDER BY field_name
""")

rows = cur.fetchall()

if rows:
    print(f"✅ Found {len(rows)} integrity rules for PaymentPlanV3:")
    print("-" * 120)
    for row in rows:
        print(f"Field: {row[2]:25} Type: {row[3]:15} Value: {row[4]:30} Critical: {row[5]}")
else:
    print("❌ NO integrity rules found for PaymentPlanV3")

# Also check for PartialPaymentV3 and PaymentReceiptV3
for entity in ['PartialPaymentV3', 'PaymentReceiptV3']:
    cur.execute("""
    SELECT COUNT(*) FROM integrity_checks WHERE entity_type = %s
    """, [entity])
    count = cur.fetchone()[0]
    print(f"\n{entity}: {count} rules")

conn.close()
