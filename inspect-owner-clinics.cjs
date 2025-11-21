const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:11111111@localhost:5432/dentiagest'
});

async function inspectOwnerClinics() {
  try {
    console.log('\n🔍 OWNER_CLINICS TABLE INSPECTION\n');
    console.log('='.repeat(80) + '\n');

    // Schema
    const schema = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'owner_clinics'
      ORDER BY ordinal_position
    `);

    console.log('📋 SCHEMA:\n');
    schema.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} [${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}]`);
    });

    // FK constraints
    const fks = await pool.query(`
      SELECT 
        conname AS constraint_name,
        confrelid::regclass AS referenced_table,
        a.attname AS column_name,
        af.attname AS referenced_column
      FROM pg_constraint c
      JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
      JOIN pg_attribute af ON af.attnum = ANY(c.confkey) AND af.attrelid = c.confrelid
      WHERE c.conrelid = 'owner_clinics'::regclass AND c.contype = 'f'
    `);

    console.log('\n🔗 FOREIGN KEY CONSTRAINTS:\n');
    fks.rows.forEach(fk => {
      console.log(`  - ${fk.constraint_name}: ${fk.column_name} → ${fk.referenced_table}(${fk.referenced_column})`);
    });

    // Data sample
    const data = await pool.query('SELECT * FROM owner_clinics LIMIT 5');
    console.log(`\n📊 DATA SAMPLE (${data.rows.length} rows):\n`);
    if (data.rows.length > 0) {
      console.log(JSON.stringify(data.rows, null, 2));
    } else {
      console.log('  (empty table)');
    }

    await pool.end();
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
    await pool.end();
    process.exit(1);
  }
}

inspectOwnerClinics();
