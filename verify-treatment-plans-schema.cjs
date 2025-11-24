const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:11111111@localhost:5432/dentiagest',
});

async function verifyTreatmentPlansSchema() {
  console.log('🔍 VERIFYING TREATMENT_PLANS TABLE SCHEMA...\n');

  try {
    // Check if table exists
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

    // Get all columns
    const columnsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'treatment_plans'
      ORDER BY ordinal_position;
    `);

    console.log('📊 COLUMNS:');
    columnsResult.rows.forEach((col) => {
      console.log(`  - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
    });

    // Check specifically for clinic_id
    const hasClinicId = columnsResult.rows.some((col) => col.column_name === 'clinic_id');

    console.log('\n🔍 CRITICAL CHECK: clinic_id column');
    if (hasClinicId) {
      console.log('✅ clinic_id EXISTS in treatment_plans');
    } else {
      console.log('❌ clinic_id MISSING in treatment_plans');
      console.log('🚨 LANDMINE 3 ACTIVE: Migration 008 required');
    }

    await pool.end();
    process.exit(hasClinicId ? 0 : 1);
  } catch (error) {
    console.error('💥 ERROR:', error.message);
    await pool.end();
    process.exit(1);
  }
}

verifyTreatmentPlansSchema();
