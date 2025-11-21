const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:11111111@localhost:5432/dentiagest'
});

async function inspect() {
  const res = await pool.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'clinics'
    ORDER BY ordinal_position
  `);
  
  console.log('CLINICS TABLE SCHEMA:');
  console.log(JSON.stringify(res.rows, null, 2));
  
  const count = await pool.query('SELECT COUNT(*) FROM clinics');
  console.log(`\nTotal clinics: ${count.rows[0].count}`);
  
  await pool.end();
}

inspect().catch(console.error);
