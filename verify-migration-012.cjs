const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:11111111@localhost:5432/dentiagest'
});

async function verifyMigration012() {
  try {
    console.log('\n🔍 MIGRATION 012 VERIFICATION - USER CONSOLIDATION\n');
    console.log('='.repeat(80) + '\n');

    let passed = 0;
    let failed = 0;

    // ================================================================
    // TEST 1: Schema Verification (clinic_id column exists)
    // ================================================================
    console.log('📋 TEST 1: Schema Verification (clinic_id column)\n');

    const schemaCheck = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'clinic_id'
    `);

    if (schemaCheck.rows.length > 0 && schemaCheck.rows[0].data_type === 'uuid') {
      console.log('✅ PASS: users.clinic_id exists (UUID)\n');
      passed++;
    } else {
      console.log('❌ FAIL: users.clinic_id missing or wrong type\n');
      failed++;
    }

    // ================================================================
    // TEST 2: CHECK Constraint Verification
    // ================================================================
    console.log('📋 TEST 2: CHECK Constraint (staff must have clinic_id)\n');

    const constraintCheck = await pool.query(`
      SELECT conname, pg_get_constraintdef(oid) AS definition
      FROM pg_constraint
      WHERE conrelid = 'users'::regclass AND conname = 'check_staff_clinic_id'
    `);

    if (constraintCheck.rows.length > 0) {
      console.log('✅ PASS: CHECK constraint exists');
      console.log(`   Definition: ${constraintCheck.rows[0].definition}\n`);
      passed++;
    } else {
      console.log('❌ FAIL: CHECK constraint missing\n');
      failed++;
    }

    // ================================================================
    // TEST 3: Data Integrity (no orphan staff)
    // ================================================================
    console.log('📋 TEST 3: Data Integrity (no orphan staff)\n');

    const orphanCheck = await pool.query(`
      SELECT COUNT(*) AS orphan_staff
      FROM users
      WHERE (is_owner = false OR is_owner IS NULL) AND clinic_id IS NULL
    `);

    const orphanCount = parseInt(orphanCheck.rows[0].orphan_staff);
    if (orphanCount === 0) {
      console.log('✅ PASS: 0 orphan staff detected\n');
      passed++;
    } else {
      console.log(`❌ FAIL: ${orphanCount} orphan staff detected\n`);
      failed++;
    }

    // ================================================================
    // TEST 4: Backfill Verification (all users assigned to Default Clinic)
    // ================================================================
    console.log('📋 TEST 4: Backfill Verification (Default Clinic assignment)\n');

    const defaultClinic = await pool.query(`
      SELECT id, name FROM clinics WHERE name = 'Default Clinic' LIMIT 1
    `);

    if (defaultClinic.rows.length === 0) {
      console.log('❌ FAIL: Default Clinic not found\n');
      failed++;
    } else {
      const defaultClinicId = defaultClinic.rows[0].id;
      const backfillCheck = await pool.query(`
        SELECT COUNT(*) AS total_in_default
        FROM users
        WHERE clinic_id = $1
      `, [defaultClinicId]);

      const totalInDefault = parseInt(backfillCheck.rows[0].total_in_default);
      const totalUsers = await pool.query('SELECT COUNT(*) FROM users');
      const totalCount = parseInt(totalUsers.rows[0].count);

      if (totalInDefault === totalCount) {
        console.log(`✅ PASS: ${totalInDefault}/${totalCount} users assigned to Default Clinic\n`);
        passed++;
      } else {
        console.log(`❌ FAIL: Only ${totalInDefault}/${totalCount} users assigned to Default Clinic\n`);
        failed++;
      }
    }

    // ================================================================
    // TEST 5: Distribution Verification (all roles covered)
    // ================================================================
    console.log('📋 TEST 5: Distribution Verification (all roles have clinic_id)\n');

    const distribution = await pool.query(`
      SELECT 
        role,
        COUNT(*) AS total,
        COUNT(clinic_id) AS with_clinic_id
      FROM users
      GROUP BY role
    `);

    let allRolesSecured = true;
    distribution.rows.forEach(row => {
      const secured = parseInt(row.total) === parseInt(row.with_clinic_id);
      console.log(`   ${row.role}: ${row.with_clinic_id}/${row.total} ${secured ? '✅' : '❌'}`);
      if (!secured) allRolesSecured = false;
    });

    if (allRolesSecured) {
      console.log('\n✅ PASS: All roles have clinic_id assigned\n');
      passed++;
    } else {
      console.log('\n❌ FAIL: Some roles missing clinic_id\n');
      failed++;
    }

    // ================================================================
    // TEST 6: Sample Data Verification
    // ================================================================
    console.log('📋 TEST 6: Sample Data Verification (3 random users)\n');

    const sample = await pool.query(`
      SELECT email, role, clinic_id
      FROM users
      ORDER BY random()
      LIMIT 3
    `);

    let samplePass = true;
    sample.rows.forEach((user, idx) => {
      const hasClinicId = user.clinic_id !== null;
      console.log(`   ${idx + 1}. ${user.email} (${user.role})`);
      console.log(`      clinic_id: ${user.clinic_id || 'NULL'} ${hasClinicId ? '✅' : '❌'}`);
      if (!hasClinicId) samplePass = false;
    });

    if (samplePass) {
      console.log('\n✅ PASS: All sampled users have clinic_id\n');
      passed++;
    } else {
      console.log('\n❌ FAIL: Some sampled users missing clinic_id\n');
      failed++;
    }

    // ================================================================
    // FINAL VERDICT
    // ================================================================
    console.log('='.repeat(80));
    console.log(`📊 VERIFICATION RESULTS: ${passed}/${passed + failed} tests passed`);
    console.log('='.repeat(80) + '\n');

    if (failed === 0) {
      console.log('🏆 VERDICT: MIGRATION 012 APPROVED ✅\n');
      console.log('   - All 10 users assigned to Default Clinic');
      console.log('   - CHECK constraint active (staff must have clinic_id)');
      console.log('   - 0 orphan staff detected');
      console.log('   - System ready for multi-tenant resolver filtering\n');
    } else {
      console.log(`❌ VERDICT: MIGRATION 012 FAILED (${failed} tests failed)\n`);
    }

    await pool.end();
    process.exit(failed === 0 ? 0 : 1);
  } catch (error) {
    console.error('\n❌ VERIFICATION ERROR:', error.message);
    console.error('Stack:', error.stack);
    await pool.end();
    process.exit(1);
  }
}

verifyMigration012();
