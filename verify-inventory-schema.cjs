/**
 * 🔍 INVENTORY SCHEMA V    console.log('✅ dental_materials table EXISTS\n');

    // Get all columns
    const columnsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'dental_materials'
      ORDER BY ordinal_position;
    `);ON
 * Checks for clinic_id column and multi-tenant readiness
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:11111111@localhost:5432/dentiagest',
});

async function verifyInventorySchema() {
  console.log('🔍 VERIFYING INVENTORY TABLE SCHEMA...\n');

  try {
    // Check if dental_materials table exists (actual inventory table)
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'dental_materials'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ dental_materials table DOES NOT EXIST');
      await pool.end();
      process.exit(1);
    }

    console.log('✅ dental_materials table EXISTS\n');

    // Get all columns
    const columnsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'inventory'
      ORDER BY ordinal_position;
    `);

    console.log('📊 COLUMNS:');
    let hasClinicId = false;
    columnsResult.rows.forEach((col) => {
      const marker = col.column_name === 'clinic_id' ? '🔥' : '  ';
      console.log(`${marker} - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
      if (col.column_name === 'clinic_id') hasClinicId = true;
    });

    console.log('\n🔗 FOREIGN KEYS:');
    const fkResult = await pool.query(`
      SELECT
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.table_name = 'inventory'
        AND tc.constraint_type = 'FOREIGN KEY';
    `);

    if (fkResult.rows.length === 0) {
      console.log('  ⚠️ No foreign keys found');
    } else {
      fkResult.rows.forEach((fk) => {
        const marker = fk.column_name === 'clinic_id' ? '🔥' : '  ';
        console.log(`${marker} ${fk.constraint_name}: ${fk.column_name} → ${fk.foreign_table_name}(${fk.foreign_column_name})`);
      });
    }

    console.log('\n📇 INDEXES:');
    const indexResult = await pool.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'inventory'
      ORDER BY indexname;
    `);

    if (indexResult.rows.length === 0) {
      console.log('  ⚠️ No indexes found (beyond primary key)');
    } else {
      indexResult.rows.forEach((idx) => {
        const marker = idx.indexname.includes('clinic') ? '🔥' : '  ';
        console.log(`${marker} ${idx.indexname}`);
      });
    }

    console.log('\n============================================================');
    if (!hasClinicId) {
      console.log('🚨 CRITICAL: clinic_id column DOES NOT EXIST');
      console.log('============================================================');
      console.log('💣 LANDMINE DETECTED: Multi-tenant isolation MISSING');
      console.log('   - Stock operations can cross clinic boundaries');
      console.log('   - Clinic A can see/modify Clinic B inventory');
      console.log('   - HOTFIX REQUIRED: Add clinic_id column + FK + index');
      console.log('============================================================\n');
      await pool.end();
      process.exit(1);
    } else {
      console.log('✅ VERIFICATION COMPLETE: inventory table has clinic_id');
      console.log('============================================================\n');
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Verification failed:', error);
    await pool.end();
    process.exit(1);
  }
}

verifyInventorySchema();
