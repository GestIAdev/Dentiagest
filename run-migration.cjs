const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuración de conexión
const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'dentiagest',
  user: 'postgres',
  password: '11111111',
  ssl: false,
});

async function runMigration() {
  try {
    console.log('🔌 Conectando a PostgreSQL...');
    await client.connect();
    console.log('✅ Conexión exitosa\n');

    // Leer el archivo SQL (arg o default)
    const sqlFileName = process.argv[2] || 'migrations/create_netflix_dental_tables.sql';
    const sqlFile = path.join(__dirname, sqlFileName);
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log(`📝 Ejecutando migración: ${sqlFileName}...\n`);
    
    // Ejecutar el SQL completo como un único statement
    await client.query(sql);
    console.log('✅ Migración completada');

    // Verificar que se crearon las tablas y planes
    const plansResult = await client.query(`SELECT COUNT(*) as plan_count FROM subscription_plans_v3;`);
    console.log(`✅ Tabla subscription_plans_v3 creada con ${plansResult.rows[0].plan_count} planes seed\n`);
    
    const subsResult = await client.query(`SELECT COUNT(*) as sub_count FROM subscriptions_v3;`);
    console.log(`✅ Tabla subscriptions_v3 creada con ${subsResult.rows[0].sub_count} suscripciones\n`);
    
  } catch (error) {
    console.error('❌ Error en migración:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('   → PostgreSQL no está corriendo en localhost:5432');
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
