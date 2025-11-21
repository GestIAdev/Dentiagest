const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:11111111@localhost:5432/dentiagest'
});

async function inspect() {
  console.log('\n🔍 DENTAL_EQUIPMENT TABLE INSPECTION\n');
  console.log('='.repeat(80));
  
  try {
    // 1. Check if table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'dental_equipment'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ dental_equipment table DOES NOT EXIST');
      await pool.end();
      return;
    }
    
    console.log('✅ dental_equipment table EXISTS\n');
    
    // 2. Get table schema
    console.log('📋 SCHEMA:\n');
    const schema = await pool.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'dental_equipment'
      ORDER BY ordinal_position;
    `);
    
    schema.rows.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? '[NULL]' : '[NOT NULL]';
      console.log(`  - ${col.column_name}: ${col.data_type} ${nullable}`);
      if (col.column_default) {
        console.log(`    Default: ${col.column_default}`);
      }
    });
    
    const hasClinicId = schema.rows.some(col => col.column_name === 'clinic_id');
    
    if (hasClinicId) {
      console.log('\n✅ clinic_id column ALREADY EXISTS');
    } else {
      console.log('\n❌ clinic_id column MISSING');
    }
    
    // 3. Count records
    console.log('\n📊 DATA:\n');
    const count = await pool.query('SELECT COUNT(*) FROM dental_equipment');
    console.log(`  Total Records: ${count.rows[0].count}`);
    
    if (parseInt(count.rows[0].count) > 0) {
      // Sample records
      const sample = await pool.query('SELECT * FROM dental_equipment LIMIT 3');
      console.log('\n  Sample Records (first 3):');
      sample.rows.forEach((row, i) => {
        console.log(`\n  Record ${i + 1}:`);
        console.log(`    ${JSON.stringify(row, null, 4)}`);
      });
    } else {
      console.log('  ⚠️  Table is EMPTY (no records)');
    }
    
    // 4. Check for existing FK constraints
    console.log('\n🔗 FOREIGN KEYS:\n');
    const fks = await pool.query(`
      SELECT
        conname AS constraint_name,
        conrelid::regclass AS table_name,
        a.attname AS column_name,
        confrelid::regclass AS referenced_table,
        af.attname AS referenced_column
      FROM pg_constraint c
      JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
      JOIN pg_attribute af ON af.attnum = ANY(c.confkey) AND af.attrelid = c.confrelid
      WHERE contype = 'f' 
        AND conrelid = 'dental_equipment'::regclass;
    `);
    
    if (fks.rows.length > 0) {
      fks.rows.forEach(fk => {
        console.log(`  - ${fk.constraint_name}: ${fk.column_name} → ${fk.referenced_table}(${fk.referenced_column})`);
      });
    } else {
      console.log('  ⚠️  No foreign keys defined');
    }
    
    // 5. Check for indexes
    console.log('\n📇 INDEXES:\n');
    const indexes = await pool.query(`
      SELECT
        indexname,
        indexdef
      FROM pg_indexes
      WHERE tablename = 'dental_equipment';
    `);
    
    if (indexes.rows.length > 0) {
      indexes.rows.forEach(idx => {
        console.log(`  - ${idx.indexname}`);
      });
    } else {
      console.log('  ⚠️  No indexes defined (besides implicit PK)');
    }
    
    // 6. Migration recommendation
    console.log('\n' + '='.repeat(80));
    console.log('\n🎯 MIGRATION 011 RECOMMENDATION:\n');
    
    if (!hasClinicId) {
      console.log('  ✅ ADD clinic_id column (UUID NOT NULL)');
      console.log('  ✅ BACKFILL to Default Clinic');
      if (parseInt(count.rows[0].count) === 0) {
        console.log('  ⚠️  Table is EMPTY - backfill not needed, just add NOT NULL constraint');
      }
      console.log('  ✅ ADD FK: fk_dental_equipment_clinic → clinics(id)');
      console.log('  ✅ ADD INDEX: idx_dental_equipment_clinic (clinic_id)');
    } else {
      console.log('  ⚠️  clinic_id already exists - migration may be redundant');
    }
    
    console.log('\n' + '='.repeat(80) + '\n');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nStack:', error.stack);
  } finally {
    await pool.end();
  }
}

inspect();
