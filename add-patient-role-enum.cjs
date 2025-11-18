/**
 * Add PATIENT role to userrole enum
 */

const pg = require('pg');

async function addPatientRole() {
  const client = new pg.Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'dentiagest',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '11111111',
  });

  try {
    await client.connect();
    
    console.log('🔄 Adding PATIENT and patient roles to userrole enum...');
    
    // Add PATIENT (uppercase)
    await client.query(`
      ALTER TYPE userrole ADD VALUE 'PATIENT' BEFORE 'PROFESSIONAL';
    `);
    console.log('✅ Added PATIENT');
    
    // Add patient (lowercase)
    await client.query(`
      ALTER TYPE userrole ADD VALUE 'patient' BEFORE 'professional';
    `);
    console.log('✅ Added patient');
    
    // Verify
    const result = await client.query(`
      SELECT e.enumlabel
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname = 'userrole'
      ORDER BY e.enumsortorder;
    `);
    
    console.log('\n✅ Updated userrole enum values:');
    result.rows.forEach(row => {
      console.log(`  - ${row.enumlabel}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    // If value already exists, that's OK
    if (error.message.includes('already exists')) {
      console.log('⚠️  PATIENT role already exists, continuing...');
    }
  } finally {
    await client.end();
  }
}

addPatientRole();
