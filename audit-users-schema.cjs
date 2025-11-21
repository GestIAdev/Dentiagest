const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:11111111@localhost:5432/dentiagest'
});

async function auditUsers() {
  console.log('\n🔍 OPERATION "SILENT STAFF" - USERS TABLE AUDIT\n');
  console.log('='.repeat(80));
  
  try {
    // 1. Schema verification
    console.log('\n📋 SCHEMA VERIFICATION:\n');
    const schema = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
        AND column_name IN ('id', 'clinic_id', 'current_clinic_id', 'is_owner', 'role', 'email')
      ORDER BY ordinal_position
    `);
    
    schema.rows.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? '[NULL]' : '[NOT NULL]';
      console.log(`  - ${col.column_name}: ${col.data_type} ${nullable}`);
    });
    
    // 2. FK constraints
    console.log('\n🔗 FOREIGN KEY CONSTRAINTS:\n');
    const fks = await pool.query(`
      SELECT conname, confrelid::regclass AS referenced_table
      FROM pg_constraint
      WHERE conrelid = 'users'::regclass AND contype = 'f'
    `);
    
    fks.rows.forEach(fk => {
      console.log(`  - ${fk.conname} → ${fk.referenced_table}`);
    });
    
    // 3. User distribution
    console.log('\n📊 USER DISTRIBUTION:\n');
    const distribution = await pool.query(`
      SELECT 
        role,
        is_owner,
        COUNT(*) as total,
        COUNT(clinic_id) as with_clinic_id,
        COUNT(*) FILTER (WHERE clinic_id IS NULL) as without_clinic_id
      FROM users
      GROUP BY role, is_owner
      ORDER BY role
    `);
    
    console.log('  Role                  | Owner | Total | With clinic_id | Without clinic_id');
    console.log('  ' + '-'.repeat(76));
    distribution.rows.forEach(row => {
      const ownerFlag = row.is_owner ? 'YES' : 'NO ';
      console.log(`  ${row.role.padEnd(20)} | ${ownerFlag}   | ${String(row.total).padStart(5)} | ${String(row.with_clinic_id).padStart(14)} | ${String(row.without_clinic_id).padStart(17)}`);
    });
    
    // 4. Owner clinics relationship
    console.log('\n👑 OWNER-CLINICS RELATIONSHIP:\n');
    const ownerClinics = await pool.query(`
      SELECT 
        u.email,
        COUNT(oc.clinic_id) as clinic_count,
        ARRAY_AGG(c.name) as clinic_names
      FROM users u
      LEFT JOIN owner_clinics oc ON oc.user_id = u.id
      LEFT JOIN clinics c ON c.id = oc.clinic_id
      WHERE u.is_owner = true
      GROUP BY u.id, u.email
      ORDER BY clinic_count DESC
    `);
    
    ownerClinics.rows.forEach(row => {
      console.log(`  - ${row.email}: ${row.clinic_count} clinic(s)`);
      if (row.clinic_names && row.clinic_names.length > 0) {
        row.clinic_names.forEach(name => {
          console.log(`    * ${name}`);
        });
      }
    });
    
    // 5. Staff without clinic_id (CRITICAL)
    console.log('\n🚨 CRITICAL: STAFF WITHOUT CLINIC_ID:\n');
    const orphanStaff = await pool.query(`
      SELECT id, email, role, is_owner, clinic_id
      FROM users
      WHERE is_owner = false AND clinic_id IS NULL
    `);
    
    if (orphanStaff.rows.length > 0) {
      console.log(`  ❌ FOUND ${orphanStaff.rows.length} ORPHAN STAFF MEMBERS:`);
      orphanStaff.rows.forEach(row => {
        console.log(`     - ${row.email} (${row.role})`);
      });
    } else {
      console.log('  ✅ NO ORPHAN STAFF (all staff have clinic_id)');
    }
    
    // 6. Sample staff by clinic
    console.log('\n📋 SAMPLE STAFF BY CLINIC:\n');
    const staffByClinic = await pool.query(`
      SELECT 
        c.name as clinic_name,
        COUNT(u.id) as staff_count,
        ARRAY_AGG(u.role) as roles
      FROM users u
      JOIN clinics c ON c.id = u.clinic_id
      WHERE u.is_owner = false
      GROUP BY c.id, c.name
      ORDER BY staff_count DESC
      LIMIT 5
    `);
    
    staffByClinic.rows.forEach(row => {
      console.log(`  - ${row.clinic_name}: ${row.staff_count} staff`);
    });
    
    // 7. Verdict
    console.log('\n' + '='.repeat(80));
    console.log('\n🎯 AUDIT VERDICT:\n');
    
    const totalUsers = distribution.rows.reduce((sum, row) => sum + parseInt(row.total), 0);
    const totalWithClinic = distribution.rows.reduce((sum, row) => sum + parseInt(row.with_clinic_id), 0);
    const totalOwners = distribution.rows.filter(row => row.is_owner).reduce((sum, row) => sum + parseInt(row.total), 0);
    const totalStaff = totalUsers - totalOwners;
    
    console.log(`  Total Users: ${totalUsers}`);
    console.log(`  - Staff: ${totalStaff} (should ALL have clinic_id)`);
    console.log(`  - Owners: ${totalOwners} (use owner_clinics table)`);
    console.log(`  - Users with clinic_id: ${totalWithClinic}`);
    
    if (orphanStaff.rows.length === 0) {
      console.log('\n  ✅ SCHEMA: CORRECT (all staff assigned to clinic)');
    } else {
      console.log(`\n  ❌ SCHEMA: ${orphanStaff.rows.length} ORPHAN STAFF DETECTED`);
    }
    
    console.log('\n  ⚠️  NEXT: Audit resolvers for clinic_id filtering');
    console.log('\n' + '='.repeat(80) + '\n');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nStack:', error.stack);
  } finally {
    await pool.end();
  }
}

auditUsers();
