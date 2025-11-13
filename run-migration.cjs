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

    // Leer el archivo SQL
    const sqlFile = path.join(__dirname, 'migrations', '001-create-compliance-checks.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('📝 Ejecutando migración...\n');
    
    // Ejecutar el SQL completo como un único statement
    await client.query(sql);
    console.log('✅ Migración completada');

    // Verificar que se creó la tabla
    const result = await client.query(`SELECT COUNT(*) as compliance_records FROM compliance_checks;`);
    console.log(`✅ Tabla compliance_checks creada con ${result.rows[0].compliance_records} registros\n`);
    
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
