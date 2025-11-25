/**
 * 🔧 CREATE TEST ADMIN USER (BCRYPT EDITION)
 */

const { Client } = require('pg');
const bcrypt = require('bcrypt');

async function createTestAdmin() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '11111111',
    database: 'dentiagest',
  });

  try {
    await client.connect();
    console.log('🔌 Connected to PostgreSQL');

    // Hash password (bcrypt, same as Selene production)
    const password = 'AdminPass123!';
    const hash = await bcrypt.hash(password, 10);

    // Check if admin already exists
    const checkQuery = `
      SELECT id, email FROM users WHERE email = 'doctor.admin@dentiagest.test'
    `;
    
    const existing = await client.query(checkQuery);
    
    if (existing.rows.length > 0) {
      console.log('⚠️  Admin exists, DELETING to recreate with bcrypt...');
      await client.query(`DELETE FROM users WHERE email = 'doctor.admin@dentiagest.test'`);
    }

    // Create admin user (FULL users table structure, all NOT NULL fields)
    const insertQuery = `
      INSERT INTO users (
        id, username, email, password_hash, first_name, last_name, role,
        is_active, is_admin, is_mfa_enabled, is_owner,
        created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        'doctor_admin',
        'doctor.admin@dentiagest.test',
        $1,
        'Doctor',
        'Admin',
        'ADMIN',
        true,
        true,
        false,
        true,
        NOW(),
        NOW()
      )
      RETURNING id, email, role::text as role
    `;
    
    const result = await client.query(insertQuery, [hash]);
    
    console.log('\n✅ ADMIN USER CREATED:');
    console.log(result.rows[0]);
    console.log('\n📧 Email: doctor.admin@dentiagest.test');
    console.log('🔑 Password: AdminPass123!');

    await client.end();

  } catch (error) {
    console.error('💥 Error:', error.message);
    await client.end();
    process.exit(1);
  }
}

createTestAdmin();
