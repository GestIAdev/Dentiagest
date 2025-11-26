const { Client } = require('pg');

async function findRealPatient() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'dentiagest',
    user: 'postgres',
    password: '11111111'
  });

  await client.connect();
  console.log('🔗 Connected to PostgreSQL');

  const userId = '413aa2a1-c4f0-406d-8958-f8e28b11d1f7';
  
  // Get user email
  const user = await client.query('SELECT id, email, role FROM users WHERE id = $1', [userId]);
  console.log('👤 User:', user.rows[0]);
  
  if (user.rows[0]) {
    // Find patient by same email
    const patient = await client.query('SELECT id, email, first_name, last_name FROM patients WHERE email = $1', [user.rows[0].email]);
    console.log('🏥 Patient with same email:', patient.rows);
  }

  // Also check for any patient with created_by matching user
  const createdBy = await client.query('SELECT id, email, first_name, created_by FROM patients WHERE created_by = $1', [userId]);
  console.log('📋 Patients created by user:', createdBy.rows);

  await client.end();
}

findRealPatient().catch(console.error);
