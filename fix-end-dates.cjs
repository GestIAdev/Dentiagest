const { Client } = require('pg');

async function fixEndDates() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'dentiagest',
    user: 'postgres',
    password: '11111111'
  });

  await client.connect();
  console.log('🔗 Connected to PostgreSQL');

  // Update subscriptions with NULL end_date
  // Set end_date = start_date + 1 month (for MONTHLY plans)
  const result = await client.query(`
    UPDATE subscriptions_v3 
    SET end_date = start_date + INTERVAL '1 month'
    WHERE end_date IS NULL
    RETURNING id, start_date, end_date
  `);

  console.log('✅ Updated', result.rowCount, 'subscriptions with end_date:');
  result.rows.forEach(r => {
    console.log(`  - ${r.id}: ${r.start_date} → ${r.end_date}`);
  });

  await client.end();
}

fixEndDates().catch(console.error);
