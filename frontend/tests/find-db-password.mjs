/**
 * PostgreSQL Connection Test Helper
 * Prueba diferentes passwords comunes para encontrar el correcto
 */

import pkg from 'pg';
const { Client } = pkg;

const COMMON_PASSWORDS = [
  'postgres',
  'admin',
  'root',
  'password',
  '123456',
  'dentiagest',
  '', // empty password
];

async function findWorkingPassword() {
  console.log('🔍 Testing PostgreSQL connection with common passwords...\n');

  for (const password of COMMON_PASSWORDS) {
    const client = new Client({
      host: 'localhost',
      port: 5432,
      database: 'postgres', // Use default postgres DB
      user: 'postgres',
      password: password,
    });

    try {
      await client.connect();
      const result = await client.query('SELECT version()');
      await client.end();

      console.log('✅ SUCCESS! PostgreSQL connection established');
      console.log(`✅ Working password: "${password}"`);
      console.log(`\n📝 Add this to frontend/.env.test:`);
      console.log(`DB_PASSWORD=${password}`);
      console.log(`\n${result.rows[0].version}\n`);
      return password;
    } catch (error: any) {
      if (password === '') {
        console.log(`❌ Empty password: ${error.message.split('\n')[0]}`);
      } else {
        console.log(`❌ "${password}": ${error.message.split('\n')[0]}`);
      }
    }
  }

  console.log('\n❌ None of the common passwords worked.');
  console.log('\n💡 Options:');
  console.log('1. Check your PostgreSQL installation password');
  console.log('2. Reset postgres user password:');
  console.log('   - Open pgAdmin or SQL Shell');
  console.log('   - Run: ALTER USER postgres PASSWORD \'postgres\';');
  console.log('3. Update frontend/.env.test with correct password');

  return null;
}

// Run the test
findWorkingPassword();
