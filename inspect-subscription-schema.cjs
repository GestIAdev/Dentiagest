const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'dentiagest',
  user: 'postgres',
  password: '11111111',
  ssl: false,
});

async function inspectSchema() {
  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL\n');

    // Ver columnas de subscription_plans_v3
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'subscription_plans_v3' 
      ORDER BY ordinal_position;
    `);

    console.log('📋 Columnas de subscription_plans_v3:');
    columns.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    console.log('\n📊 Datos actuales:');
    const data = await client.query(`SELECT * FROM subscription_plans_v3 LIMIT 5;`);
    console.log(data.rows);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

inspectSchema();
