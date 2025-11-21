const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:11111111@localhost:5432/dentiagest'
});

async function countUsers() {
  try {
    console.log('\n🔢 USER COUNT VERIFICATION\n');
    console.log('='.repeat(80) + '\n');

    const total = await pool.query('SELECT COUNT(*) FROM users');
    console.log(`📊 Total Users: ${total.rows[0].count}\n`);

    const distribution = await pool.query(`
      SELECT 
        role,
        COALESCE(is_owner, false) AS is_owner,
        COUNT(*) AS total,
        COUNT(clinic_id) AS with_clinic_id,
        COUNT(*) FILTER (WHERE clinic_id IS NULL) AS without_clinic_id
      FROM users
      GROUP BY role, is_owner
      ORDER BY role, is_owner
    `);

    console.log('📋 DISTRIBUTION BY ROLE:\n');
    console.log('  Role                  | Owner | Total | With clinic_id | Without clinic_id');
    console.log('  ' + '-'.repeat(76));
    distribution.rows.forEach(row => {
      console.log(
        `  ${row.role.padEnd(20)} | ${(row.is_owner ? 'YES' : 'NO ').padEnd(5)} | ` +
        `${String(row.total).padStart(5)} | ${String(row.with_clinic_id).padStart(14)} | ${String(row.without_clinic_id).padStart(17)}`
      );
    });

    // Sample data
    const sample = await pool.query(`
      SELECT id, email, role, is_owner, clinic_id, current_clinic_id
      FROM users
      LIMIT 10
    `);

    console.log('\n\n📄 SAMPLE DATA (first 10):\n');
    sample.rows.forEach((user, idx) => {
      console.log(`${idx + 1}. ${user.email}`);
      console.log(`   Role: ${user.role} | Owner: ${user.is_owner || false} | clinic_id: ${user.clinic_id || 'NULL'}`);
    });

    await pool.end();
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    await pool.end();
    process.exit(1);
  }
}

countUsers();
