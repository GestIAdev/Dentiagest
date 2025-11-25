const { Pool } = require('pg');

async function main() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '11111111',
    database: 'dentiagest'
  });

  try {
    const result = await pool.query(`
      SELECT id, email, role, clinic_id 
      FROM users 
      WHERE email LIKE 'paciente.%@vitalpass.test' 
      ORDER BY created_at DESC 
      LIMIT 3
    `);
    
    console.log('📊 LAST 3 PATIENTS:');
    result.rows.forEach(row => {
      console.log(`  - ${row.email}: clinic_id = ${row.clinic_id || 'NULL'}`);
    });
  } catch (err) {
    console.error('💀 ERROR:', err.message);
  } finally {
    await pool.end();
  }
}

main();
