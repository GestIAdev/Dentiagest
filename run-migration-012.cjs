const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:11111111@localhost:5432/dentiagest'
});

async function runMigration012() {
  try {
    console.log('\n🚀 EXECUTING MIGRATION 012: USER CONSOLIDATION\n');
    console.log('='.repeat(80) + '\n');

    const fs = require('fs');
    const path = require('path');
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrations', '012_assign_users_to_default_clinic.sql'),
      'utf-8'
    );

    await pool.query(migrationSQL);

    console.log('\n📊 POST-MIGRATION VERIFICATION:\n');

    // Check schema (clinic_id column status)
    const schemaCheck = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'clinic_id'
    `);

    console.log('✅ users.clinic_id:', schemaCheck.rows[0].data_type, 
                `[${schemaCheck.rows[0].is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}]`);

    // Check constraint
    const constraintCheck = await pool.query(`
      SELECT conname, pg_get_constraintdef(oid) AS definition
      FROM pg_constraint
      WHERE conrelid = 'users'::regclass AND conname = 'check_staff_clinic_id'
    `);

    if (constraintCheck.rows.length > 0) {
      console.log('✅ CHECK Constraint:', constraintCheck.rows[0].conname);
      console.log('   Definition:', constraintCheck.rows[0].definition);
    } else {
      console.log('❌ CHECK Constraint: NOT FOUND');
    }

    // Data integrity check
    const integrityCheck = await pool.query(`
      SELECT 
        COUNT(*) AS total_users,
        COUNT(clinic_id) AS with_clinic_id,
        COUNT(*) FILTER (WHERE clinic_id IS NULL) AS without_clinic_id,
        COUNT(*) FILTER (WHERE is_owner = false OR is_owner IS NULL) AS total_staff,
        COUNT(*) FILTER (WHERE (is_owner = false OR is_owner IS NULL) AND clinic_id IS NULL) AS orphan_staff
      FROM users
    `);

    const stats = integrityCheck.rows[0];
    console.log('\n📊 Data Integrity:');
    console.log(`   Total Users: ${stats.total_users}`);
    console.log(`   With clinic_id: ${stats.with_clinic_id}`);
    console.log(`   Without clinic_id: ${stats.without_clinic_id}`);
    console.log(`   Total Staff: ${stats.total_staff}`);
    console.log(`   Orphan Staff: ${stats.orphan_staff}`);

    if (parseInt(stats.orphan_staff) === 0) {
      console.log('\n✅ Data Integrity: 100% (0 orphan staff detected)');
    } else {
      console.log(`\n❌ Data Integrity: FAILED (${stats.orphan_staff} orphan staff detected)`);
    }

    // Distribution by role
    const distribution = await pool.query(`
      SELECT 
        role,
        COALESCE(is_owner, false) AS is_owner,
        COUNT(*) AS total,
        COUNT(clinic_id) AS with_clinic_id
      FROM users
      GROUP BY role, is_owner
      ORDER BY role, is_owner
    `);

    console.log('\n📋 User Distribution:');
    console.log('   Role                  | Owner | Total | With clinic_id');
    console.log('   ' + '-'.repeat(64));
    distribution.rows.forEach(row => {
      console.log(
        `   ${row.role.padEnd(20)} | ${(row.is_owner ? 'YES' : 'NO ').padEnd(5)} | ` +
        `${String(row.total).padStart(5)} | ${String(row.with_clinic_id).padStart(14)}`
      );
    });

    console.log('\n' + '='.repeat(80));
    console.log('🎯 MIGRATION 012 STATUS: COMPLETE ✅');
    console.log('='.repeat(80) + '\n');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ MIGRATION 012 FAILED:', error.message);
    console.error('Stack:', error.stack);
    await pool.end();
    process.exit(1);
  }
}

runMigration012();
