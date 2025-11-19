/**
 * 🔥 INSERT TEST USER DIRECTLY INTO POSTGRES
 * patient1@dentiagest.test with PATIENT role
 * By PunkClaude - Direct DB approach, no GraphQL
 */

const pg = require('pg');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:11111111@localhost:5432/dentiagest'
});

const BCRYPT_ROUNDS = 12; // Match Selene's config

async function hashPassword(password) {
  return await bcrypt.hash(password, BCRYPT_ROUNDS);
}

async function createTestUser() {
  try {
    console.log('🔥 CREATING TEST USER: patient1@dentiagest.test');
    console.log('');

    // Check if user already exists
    const checkResult = await pool.query(
      'SELECT id, email, role FROM users WHERE email = $1',
      ['patient1@dentiagest.test']
    );

    if (checkResult.rows.length > 0) {
      const existingUser = checkResult.rows[0];
      console.log('⚠️  USER ALREADY EXISTS:');
      console.log('   ID:', existingUser.id);
      console.log('   Email:', existingUser.email);
      console.log('   Role:', existingUser.role);
      
      if (existingUser.role === 'PATIENT') {
        console.log('\n✅ PATIENT ROLE CONFIRMED - E2E tests ready!');
        
        // Update password to match test credentials
        console.log('\n🔄 Updating password to Test@12345...');
        const hashedPassword = await hashPassword('Test@12345');
        
        await pool.query(
          'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE email = $2',
          [hashedPassword, 'patient1@dentiagest.test']
        );
        
        console.log('✅ Password updated successfully!');
        console.log('\n🎯 TEST USER READY:');
        console.log('   Email: patient1@dentiagest.test');
        console.log('   Password: Test@12345');
        console.log('   Role: PATIENT');
        console.log('   ID:', existingUser.id);
      } else {
        console.log(`\n❌ WRONG ROLE: ${existingUser.role} (expected PATIENT)`);
        console.log('   Need to update role or delete user manually');
        process.exit(1);
      }
      
      await pool.end();
      return;
    }

    // Create new user
    console.log('📝 Creating new user...');
    
    const hashedPassword = await hashPassword('Test@12345');
    const userId = crypto.randomUUID(); // Generate proper UUID
    
    const insertResult = await pool.query(`
      INSERT INTO users (
        id,
        username,
        email,
        password_hash,
        is_active,
        is_admin,
        role,
        is_mfa_enabled,
        first_name,
        last_name,
        phone,
        is_locked,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      RETURNING id, email, role
    `, [
      userId,
      'patient1',
      'patient1@dentiagest.test',
      hashedPassword,
      true,           // is_active
      false,          // is_admin
      'PATIENT',      // role
      false,          // is_mfa_enabled
      'Juan',
      'García López',
      '+34600123456',
      false           // is_locked
    ]);

    const newUser = insertResult.rows[0];
    
    console.log('\n✅ USER CREATED SUCCESSFULLY!');
    console.log('   ID:', newUser.id);
    console.log('   Email:', newUser.email);
    console.log('   Role:', newUser.role);
    
    console.log('\n🎯 TEST USER READY:');
    console.log('   Email: patient1@dentiagest.test');
    console.log('   Password: Test@12345');
    console.log('   Role: PATIENT');
    
    await pool.end();
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('   Stack:', error.stack);
    await pool.end();
    process.exit(1);
  }
}

createTestUser();
