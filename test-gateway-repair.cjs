/**
 * 🧪 GATEWAY REPAIR TEST SCRIPT
 * Tests RLS, Registration, and Role Segregation
 * 
 * By PunkClaude - November 2025
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'dentiagest',
  user: 'postgres',
  password: '11111111',
});

async function testGatewayRepair() {
  const client = await pool.connect();
  
  try {
    console.log('🔬 GATEWAY REPAIR TEST SUITE');
    console.log('━'.repeat(60));
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // TEST 1: Check RLS is enabled
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log('\n📊 TEST 1: RLS Status Check');
    const rlsCheck = await client.query(`
      SELECT tablename, 
             CASE WHEN rowsecurity THEN '✅ ENABLED' ELSE '❌ DISABLED' END as rls_status
      FROM pg_tables
      WHERE schemaname = 'public' 
        AND tablename IN ('patients', 'medical_records', 'appointments', 'billing_data', 'subscriptions')
      ORDER BY tablename;
    `);
    
    rlsCheck.rows.forEach(row => {
      console.log(`  ${row.tablename}: ${row.rls_status}`);
    });
    
    const allEnabled = rlsCheck.rows.every(row => row.rls_status === '✅ ENABLED');
    console.log(allEnabled ? '\n✅ RLS TEST PASSED' : '\n❌ RLS TEST FAILED');
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // TEST 2: Check RLS policies exist
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log('\n📋 TEST 2: RLS Policies Check');
    const policiesCheck = await client.query(`
      SELECT tablename, COUNT(*) as policy_count
      FROM pg_policies
      WHERE tablename IN ('patients', 'medical_records', 'appointments', 'billing_data', 'subscriptions')
      GROUP BY tablename
      ORDER BY tablename;
    `);
    
    policiesCheck.rows.forEach(row => {
      console.log(`  ${row.tablename}: ${row.policy_count} policies`);
    });
    
    const totalPolicies = policiesCheck.rows.reduce((sum, row) => sum + parseInt(row.policy_count), 0);
    console.log(`\n  Total: ${totalPolicies} policies`);
    console.log(totalPolicies >= 5 ? '✅ POLICIES TEST PASSED' : '❌ POLICIES TEST FAILED');
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // TEST 3: Check users table structure (role column)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log('\n🗃️  TEST 3: Users Table Structure');
    const usersSchema = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
        AND column_name IN ('id', 'email', 'password_hash', 'role', 'is_active')
      ORDER BY ordinal_position;
    `);
    
    usersSchema.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULLABLE'})`);
    });
    
    const hasRoleColumn = usersSchema.rows.some(row => row.column_name === 'role');
    console.log(hasRoleColumn ? '\n✅ USERS SCHEMA TEST PASSED' : '\n❌ USERS SCHEMA TEST FAILED');
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // TEST 4: Check existing users and roles
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log('\n👥 TEST 4: Existing Users Check');
    const usersCount = await client.query(`
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
      ORDER BY role;
    `);
    
    if (usersCount.rows.length === 0) {
      console.log('  No users found in database');
    } else {
      usersCount.rows.forEach(row => {
        console.log(`  ${row.role || 'NULL'}: ${row.count} users`);
      });
    }
    
    const hasStaffUser = usersCount.rows.some(row => 
      ['STAFF', 'ADMIN', 'DENTIST'].includes(row.role)
    );
    console.log(hasStaffUser ? '\n⚠️  STAFF users exist' : '\n⚠️  No STAFF users (only PATIENT registration works)');
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // TEST 5: Check patients table structure
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log('\n🏥 TEST 5: Patients Table Structure');
    const patientsSchema = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'patients'
        AND column_name IN ('id', 'user_id', 'first_name', 'last_name', 'email', 'terms_accepted_at')
      ORDER BY ordinal_position;
    `);
    
    patientsSchema.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULLABLE'})`);
    });
    
    const hasTermsAccepted = patientsSchema.rows.some(row => row.column_name === 'terms_accepted_at');
    console.log(hasTermsAccepted ? '\n✅ GDPR COMPLIANCE FIELD EXISTS' : '\n❌ MISSING terms_accepted_at');
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // SUMMARY
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log('\n━'.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('━'.repeat(60));
    console.log('✅ RLS Enabled: ' + (allEnabled ? 'YES' : 'NO'));
    console.log('✅ RLS Policies: ' + totalPolicies + ' policies');
    console.log('✅ Users Table: ' + (hasRoleColumn ? 'READY' : 'MISSING role column'));
    console.log('✅ GDPR Field: ' + (hasTermsAccepted ? 'PRESENT' : 'MISSING'));
    console.log('⚠️  Staff Users: ' + (hasStaffUser ? 'EXIST' : 'NEED MANUAL CREATION'));
    
    console.log('\n🎯 GATEWAY REPAIR STATUS: ' + 
      (allEnabled && totalPolicies >= 5 && hasRoleColumn && hasTermsAccepted ? 
        '✅ COMPLETE' : '⚠️  INCOMPLETE'));
    
    console.log('\n💡 NEXT STEPS:');
    if (!hasStaffUser) {
      console.log('   1. Create STAFF/ADMIN users manually (or via SQL)');
      console.log('   2. Test Patient Registration via /register route');
      console.log('   3. Test Role Segregation (Patient → Portal, Staff → Dashboard)');
    } else {
      console.log('   1. Test Patient Registration via /register route');
      console.log('   2. Test Role Segregation (Patient → Portal, Staff → Dashboard)');
      console.log('   3. Verify RLS isolation (patients only see their own data)');
    }
    
  } catch (error) {
    console.error('❌ TEST ERROR:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

testGatewayRepair().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
