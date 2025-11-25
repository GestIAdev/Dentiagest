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
    // Get table columns
    const columns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'subscription_plans_v3'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 SUBSCRIPTION_PLANS_V3 SCHEMA:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    // Get existing plans
    const plans = await pool.query(`SELECT * FROM subscription_plans_v3 LIMIT 5`);
    console.log(`\n📊 EXISTING PLANS (${plans.rows.length}):`);
    plans.rows.forEach(row => {
      console.log(`  - ${JSON.stringify(row, null, 2)}`);
    });
    
  } catch (err) {
    console.error('💀 ERROR:', err.message);
  } finally {
    await pool.end();
  }
}

main();
