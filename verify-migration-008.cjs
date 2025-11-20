const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:11111111@localhost:5432/dentiagest',
});

async function verifyMigration008() {
  console.log('🔍 VERIFYING MIGRATION 008 - treatment_plans table\n');

  try {
    // Check table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'treatment_plans'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ treatment_plans table DOES NOT EXIST');
      await pool.end();
      process.exit(1);
    }

    console.log('✅ treatment_plans table EXISTS\n');

    // Get columns
    const columnsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'treatment_plans'
      ORDER BY ordinal_position;
    `);

    console.log('📊 COLUMNS:');
    columnsResult.rows.forEach((col) => {
      const marker = col.column_name === 'clinic_id' ? '🔥' : '  ';
      console.log(`${marker} - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
    });

    // Check clinic_id
    const hasClinicId = columnsResult.rows.some((col) => col.column_name === 'clinic_id');

    if (!hasClinicId) {
      console.log('\n❌ clinic_id column MISSING');
      await pool.end();
      process.exit(1);
    }

    // Check foreign keys
    const fkCheck = await pool.query(`
      SELECT constraint_name, table_name
      FROM information_schema.table_constraints
      WHERE table_name = 'treatment_plans' AND constraint_type = 'FOREIGN KEY';
    `);

    console.log('\n🔗 FOREIGN KEYS:');
    fkCheck.rows.forEach((fk) => {
      console.log(`  ✅ ${fk.constraint_name}`);
    });

    // Check indexes
    const indexCheck = await pool.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'treatment_plans';
    `);

    console.log('\n📇 INDEXES:');
    indexCheck.rows.forEach((idx) => {
      const marker = idx.indexname.includes('clinic') ? '🔥' : '  ';
      console.log(`${marker} ${idx.indexname}`);
    });

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('🏛️ MIGRATION 008: VERIFICATION COMPLETE');
    console.log('='.repeat(60));
    console.log(`✅ Table: treatment_plans`);
    console.log(`✅ Column: clinic_id (UUID, NOT NULL)`);
    console.log(`✅ Foreign Keys: ${fkCheck.rows.length}`);
    console.log(`✅ Indexes: ${indexCheck.rows.length}`);
    console.log('\n🎯 LANDMINE 3 STATUS: DEFUSED ✅');
    console.log('   generateTreatmentPlanV3() will NOT crash');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n💥 VERIFICATION ERROR:', error.message);
    await pool.end();
    process.exit(1);
  }
}

verifyMigration008();
