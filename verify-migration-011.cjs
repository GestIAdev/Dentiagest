/**
 * VERIFICATION SCRIPT: MIGRATION 011 - DENTAL_EQUIPMENT
 * 
 * Purpose: Verify clinic_id isolation for dental equipment
 * 
 * Tests:
 * 1. Schema verification (clinic_id exists, UUID, NOT NULL)
 * 2. Foreign key constraint (fk_dental_equipment_clinic)
 * 3. Indexes verification (2 indexes)
 * 4. Data integrity (all records have clinic_id)
 * 5. Backfill verification (all assigned to Default Clinic)
 */

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:11111111@localhost:5432/dentiagest',
});

let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

function logTest(name, passed, details = '') {
  testsRun++;
  if (passed) {
    testsPassed++;
    console.log(`✅ TEST ${testsRun}: ${name}`);
    if (details) console.log(`   ${details}`);
  } else {
    testsFailed++;
    console.log(`❌ TEST ${testsRun}: ${name}`);
    if (details) console.log(`   ERROR: ${details}`);
  }
}

async function runTests() {
  console.log('\n🔍 MIGRATION 011 VERIFICATION - dental_equipment\n');
  console.log('=' .repeat(80));

  try {
    // ==================== TEST 1: SCHEMA VERIFICATION ====================
    console.log('\n📋 TEST 1: Schema Verification (clinic_id column)\n');

    const schemaResult = await pool.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable
      FROM information_schema.columns
      WHERE table_name = 'dental_equipment' AND column_name = 'clinic_id'
    `);

    const schemaValid = 
      schemaResult.rows.length === 1 &&
      schemaResult.rows[0].data_type === 'uuid' &&
      schemaResult.rows[0].is_nullable === 'NO';

    logTest(
      'Schema Verification (clinic_id UUID NOT NULL)',
      schemaValid,
      schemaValid
        ? 'dental_equipment.clinic_id: uuid [NOT NULL]'
        : 'Column missing or incorrect type'
    );

    // ==================== TEST 2: FOREIGN KEY CONSTRAINT ====================
    console.log('\n📋 TEST 2: Foreign Key Constraint Verification\n');

    const fkResult = await pool.query(`
      SELECT
        conname AS constraint_name,
        confrelid::regclass AS referenced_table,
        confdeltype AS on_delete
      FROM pg_constraint
      WHERE conname = 'fk_dental_equipment_clinic'
    `);

    const fkValid = fkResult.rows.length === 1 &&
                    fkResult.rows[0].referenced_table === 'clinics' &&
                    fkResult.rows[0].on_delete === 'c'; // 'c' = CASCADE

    logTest(
      'Foreign Key Constraint',
      fkValid,
      fkValid
        ? 'fk_dental_equipment_clinic → clinics (ON DELETE CASCADE)'
        : 'FK constraint missing or incorrect'
    );

    // ==================== TEST 3: INDEX VERIFICATION ====================
    console.log('\n📋 TEST 3: Index Verification\n');

    const indexResult = await pool.query(`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'dental_equipment'
        AND indexname IN ('idx_dental_equipment_clinic', 'idx_dental_equipment_clinic_status')
      ORDER BY indexname
    `);

    const indexValid = indexResult.rows.length === 2;

    logTest(
      'Indexes Created',
      indexValid,
      indexValid
        ? '2 indexes created: idx_dental_equipment_clinic, idx_dental_equipment_clinic_status'
        : `Expected 2 indexes, found ${indexResult.rows.length}`
    );

    if (indexValid) {
      console.log('   - idx_dental_equipment_clinic (single column)');
      console.log('   - idx_dental_equipment_clinic_status (composite)');
    }

    // ==================== TEST 4: DATA INTEGRITY ====================
    console.log('\n📋 TEST 4: Data Integrity Verification\n');

    const integrityResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(clinic_id) as with_clinic_id,
        COUNT(*) FILTER (WHERE clinic_id IS NULL) as without_clinic_id
      FROM dental_equipment
    `);

    const total = parseInt(integrityResult.rows[0].total);
    const withClinicId = parseInt(integrityResult.rows[0].with_clinic_id);
    const withoutClinicId = parseInt(integrityResult.rows[0].without_clinic_id);

    const integrityValid = total === withClinicId && withoutClinicId === 0;

    logTest(
      'Data Integrity (No NULL clinic_id)',
      integrityValid,
      integrityValid
        ? `All ${total} records have clinic_id`
        : `${withoutClinicId} records missing clinic_id`
    );

    // ==================== TEST 5: BACKFILL VERIFICATION ====================
    console.log('\n📋 TEST 5: Backfill Verification (Default Clinic)\n');

    const backfillResult = await pool.query(`
      SELECT 
        c.name as clinic_name,
        COUNT(de.id) as equipment_count
      FROM dental_equipment de
      JOIN clinics c ON c.id = de.clinic_id
      GROUP BY c.id, c.name
      ORDER BY equipment_count DESC
    `);

    const backfillValid = backfillResult.rows.length === 1 &&
                          backfillResult.rows[0].clinic_name === 'Default Clinic' &&
                          parseInt(backfillResult.rows[0].equipment_count) === total;

    logTest(
      'Backfill to Default Clinic',
      backfillValid,
      backfillValid
        ? `All ${total} records assigned to Default Clinic`
        : 'Records not properly backfilled'
    );

    console.log('\n   📊 DISTRIBUTION BY CLINIC:');
    backfillResult.rows.forEach(row => {
      console.log(`      ${row.clinic_name}: ${row.equipment_count} equipment`);
    });

    // ==================== TEST 6: SAMPLE DATA VERIFICATION ====================
    console.log('\n📋 TEST 6: Sample Data Verification\n');

    const sampleResult = await pool.query(`
      SELECT 
        id,
        name,
        equipment_type,
        status,
        clinic_id
      FROM dental_equipment
      LIMIT 3
    `);

    const sampleValid = sampleResult.rows.every(row => row.clinic_id !== null);

    logTest(
      'Sample Records Have clinic_id',
      sampleValid,
      sampleValid
        ? `Verified ${sampleResult.rows.length} sample records`
        : 'Some sample records missing clinic_id'
    );

    console.log('\n   📋 SAMPLE RECORDS:');
    sampleResult.rows.forEach((row, i) => {
      console.log(`      ${i + 1}. ${row.name} (${row.equipment_type}) - Clinic: ${row.clinic_id.substring(0, 8)}...`);
    });

    // ==================== FINAL REPORT ====================
    console.log('\n' + '='.repeat(80));
    console.log('\n🎯 FINAL VERIFICATION REPORT\n');
    console.log(`   Tests Run:    ${testsRun}`);
    console.log(`   Tests Passed: ${testsPassed} ✅`);
    console.log(`   Tests Failed: ${testsFailed} ❌`);
    
    const successRate = ((testsPassed / testsRun) * 100).toFixed(1);
    console.log(`\n   Success Rate: ${successRate}%`);

    if (testsFailed === 0) {
      console.log('\n🏆 MIGRATION 011 VERDICT: VERIFIED ✅');
      console.log('   - dental_equipment: clinic_id UUID NOT NULL');
      console.log('   - FK Constraint: ACTIVE (CASCADE)');
      console.log('   - Indexes: 2/2 created');
      console.log(`   - Data Integrity: ${total} records secured`);
      console.log('   - Backfill: Default Clinic (100%)');
      console.log('\n   STATUS: LANDMINE 5 DEFUSED ✅');
    } else {
      console.log('\n🚨 MIGRATION 011 VERDICT: FAILED ❌');
      console.log(`   - ${testsFailed} test(s) failed`);
      console.log('   - STOP: Fix issues before proceeding');
    }

    console.log('\n' + '='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ CATASTROPHIC FAILURE:', error.message);
    console.error('\nStack:', error.stack);
    testsFailed++;
  } finally {
    await pool.end();
  }

  process.exit(testsFailed > 0 ? 1 : 0);
}

runTests();
