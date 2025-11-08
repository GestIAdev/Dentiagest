import psycopg2

conn = psycopg2.connect(
    host='localhost',
    database='dentiagest',
    user='postgres',
    password='postgres'
)

cur = conn.cursor()
cur.execute('ALTER TABLE appointments ALTER COLUMN dentist_id DROP NOT NULL;')
conn.commit()
print('✅ dentist_id is now NULLABLE')
conn.close()
