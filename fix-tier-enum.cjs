const { Client } = require('pg');

async function fixFK() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'dentiagest',
    user: 'postgres',
    password: '11111111'
  });

  await client.connect();
  console.log('🔗 Connected to PostgreSQL');

  // Drop the FK constraint pointing to patients
  console.log('� Dropping old FK constraint...');
  await client.query('ALTER TABLE subscriptions_v3 DROP CONSTRAINT IF EXISTS subscriptions_v3_patient_id_fkey');
  
  // Add new FK constraint pointing to users
  console.log('🔧 Adding new FK to users...');
  await client.query('ALTER TABLE subscriptions_v3 ADD CONSTRAINT subscriptions_v3_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES users(id)');
  
  console.log('✅ FK now points to users table instead of patients');

  await client.end();
}

fixFK().catch(console.error);
