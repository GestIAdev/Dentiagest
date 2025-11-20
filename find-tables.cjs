const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:11111111@localhost:5432/dentiagest',
});

async function findInventoryTables() {
  const result = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);

  console.log('\n📊 ALL TABLES:\n');
  result.rows.forEach((t) => {
    console.log(`  - ${t.table_name}`);
  });

  await pool.end();
}

findInventoryTables().catch((e) => {
  console.error(e);
  pool.end();
  process.exit(1);
});
