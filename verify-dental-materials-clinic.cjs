const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:11111111@localhost:5432/dentiagest',
});

async function verifyDentalMaterialsClinic() {
  console.log('🔍 VERIFYING dental_materials.clinic_id\n');

  try {
    // Check clinic_id column
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'dental_materials' AND column_name = 'clinic_id'
    `);

    if (columns.rows.length === 0) {
      console.log('❌ clinic_id column DOES NOT EXIST');
      await pool.end();
      process.exit(1);
    }

    const col = columns.rows[0];
    console.log(`✅ clinic_id column EXISTS`);
    console.log(`   - Type: ${col.data_type}`);
    console.log(`   - Nullable: ${col.is_nullable}\n`);

    // Check FK
    const fk = await pool.query(`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'dental_materials' 
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name LIKE '%clinic%'
    `);

    if (fk.rows.length > 0) {
      console.log(`✅ Foreign Key: ${fk.rows[0].constraint_name}\n`);
    } else {
      console.log('❌ Foreign Key to clinics: MISSING\n');
    }

    // Check indexes
    const indexes = await pool.query(`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'dental_materials' 
        AND indexname LIKE '%clinic%'
    `);

    console.log('📇 INDEXES:');
    if (indexes.rows.length > 0) {
      indexes.rows.forEach((idx) => {
        console.log(`  ✅ ${idx.indexname}`);
      });
    } else {
      console.log('  ⚠️ No clinic-related indexes found');
    }

    // Count records
    const count = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(clinic_id) as with_clinic
      FROM dental_materials
    `);

    console.log(`\n📊 DATA:`);
    console.log(`   Total records: ${count.rows[0].total}`);
    console.log(`   With clinic_id: ${count.rows[0].with_clinic}`);

    const allHaveClinic = count.rows[0].total === count.rows[0].with_clinic;

    console.log('\n' + '='.repeat(60));
    if (col.is_nullable === 'NO' && fk.rows.length > 0 && indexes.rows.length > 0 && allHaveClinic) {
      console.log('🎯 LANDMINE 4 STATUS: DEFUSED ✅');
      console.log('   dental_materials is multi-tenant isolated');
    } else {
      console.log('🚨 LANDMINE 4 STATUS: PARTIALLY DEFUSED');
      console.log('   Issues detected:');
      if (col.is_nullable !== 'NO') console.log('   - clinic_id is NULLABLE');
      if (fk.rows.length === 0) console.log('   - No FK constraint');
      if (indexes.rows.length === 0) console.log('   - No indexes');
      if (!allHaveClinic) console.log('   - Some records missing clinic_id');
    }
    console.log('='.repeat(60));

    await pool.end();
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    await pool.end();
    process.exit(1);
  }
}

verifyDentalMaterialsClinic();
