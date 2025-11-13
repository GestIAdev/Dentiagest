import psycopg2

conn = psycopg2.connect(
    host='localhost',
    port=5432,
    dbname='dentiagest',
    user='postgres',
    password='11111111'
)
cur = conn.cursor()

# Test INSERT exactly as BillingDatabase.createPaymentPlan does
cur.execute("""
INSERT INTO payment_plans (
  billing_id, patient_id, total_amount, installments_count,
  installment_amount, frequency, start_date, end_date, created_by, status
) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'active')
RETURNING *;
""", [
    '8d4aed5e-4487-4744-863b-c0f4a339a5c6',  # billingId (from test output)
    '807a2056-8bd8-4983-97fd-b115487779d9',  # patientId (from test output)
    3000.00,  # totalAmount
    6,  # installmentsCount
    500.00,  # installmentAmount
    'monthly',  # frequency
    '2025-11-12',  # startDate
    None,  # endDate
    '00000000-0000-0000-0000-000000000001'  # userId (TEST_USER_ID)
])

result = cur.fetchone()
print(f"✅ INSERT SUCCESS")
print(f"Returned ID: {result[0]}")
print(f"Full row: {result}")

conn.rollback()  # Rollback to avoid leaving test data
conn.close()
