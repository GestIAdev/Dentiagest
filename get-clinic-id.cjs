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
    const result = await pool.query(`SELECT id, name FROM clinics LIMIT 1`);
    console.log('🏥 CLINIC:', result.rows[0]);
  } catch (err) {
    console.error('💀 ERROR:', err.message);
  } finally {
    await pool.end();
  }
}

main();
