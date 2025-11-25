/**
 * ⚡ FIX PATIENT REGISTRATION CONSTRAINT
 * Execute SQL migration to allow PATIENT role without staff_clinic_id
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'dentiagest',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '11111111',
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('⚡ EXECUTING MIGRATION: Fix Patient Registration Constraint');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Read SQL file
    const sqlPath = path.join(__dirname, 'selene', 'migrations', 'fix-patient-registration-constraint.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute migration
    await client.query(sql);

    console.log('✅ CONSTRAINT DROPPED: check_staff_clinic_id');
    console.log('✅ CONSTRAINT CREATED: check_staff_clinic_id (PATIENT exception)');
    
    // Verify
    const result = await client.query(`
      SELECT 
        conname AS constraint_name,
        pg_get_constraintdef(oid) AS constraint_definition
      FROM pg_constraint
      WHERE conname = 'check_staff_clinic_id'
    `);

    if (result.rows.length > 0) {
      console.log('\n🔍 VERIFICATION:');
      console.log('   Constraint:', result.rows[0].constraint_name);
      console.log('   Definition:', result.rows[0].constraint_definition);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎖️  MIGRATION COMPLETE - PATIENTS CAN NOW REGISTER');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ MIGRATION FAILED:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error);
