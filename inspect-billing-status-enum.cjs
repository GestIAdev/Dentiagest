const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:11111111@localhost:5432/dentiagest'
});

async function inspect() {
  const res = await pool.query(`
    SELECT unnest(enum_range(NULL::billing_status_enum))::text as status
  `);
  
  console.log('BILLING STATUS ENUM VALUES:');
  res.rows.forEach(row => console.log('  -', row.status));
  
  await pool.end();
}

inspect().catch(console.error);
