/**
 * ⚡ INSPECT USERS TABLE SCHEMA
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'dentiagest',
  user: 'postgres',
  password: '11111111',
});

async function inspectSchema() {
  const client = await pool.connect();
  
  try {
    console.log('⚡ INSPECTING USERS TABLE SCHEMA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Get columns
    const columns = await client.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);

    console.log('📋 COLUMNS:');
    columns.rows.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
    });

    // Get constraints
    const constraints = await client.query(`
      SELECT 
        conname AS constraint_name,
        contype AS constraint_type,
        pg_get_constraintdef(oid) AS constraint_definition
      FROM pg_constraint
      WHERE conrelid = 'users'::regclass
    `);

    console.log('\n🔒 CONSTRAINTS:');
    constraints.rows.forEach(con => {
      const type = {
        'p': 'PRIMARY KEY',
        'f': 'FOREIGN KEY',
        'u': 'UNIQUE',
        'c': 'CHECK'
      }[con.constraint_type] || con.constraint_type;
      
      console.log(`   - ${con.constraint_name} (${type})`);
      console.log(`     ${con.constraint_definition}`);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

inspectSchema();
