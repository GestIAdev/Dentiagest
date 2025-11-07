import pg from 'pg';
const { Client } = pg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.test') });

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

try {
  await client.connect();
  console.log('✅ Connected to PostgreSQL\n');

  // Get columns
  const columns = await client.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'users'
    ORDER BY ordinal_position
  `);

  console.log('📋 USERS TABLE COLUMNS:');
  columns.rows.forEach(r => {
    console.log(`  - ${r.column_name}: ${r.data_type} ${r.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
  });

  // Get sample data
  const users = await client.query('SELECT * FROM users LIMIT 5');
  
  console.log(`\n👥 USERS IN DB: ${users.rowCount}\n`);
  
  if (users.rows.length > 0) {
    console.log('SAMPLE USERS:');
    users.rows.forEach((u, i) => {
      console.log(`\n${i + 1}. ${u.username || u.email}`);
      Object.keys(u).forEach(key => {
        if (key !== 'password' && key !== 'password_hash') {
          console.log(`   ${key}: ${u[key]}`);
        } else {
          console.log(`   ${key}: [HIDDEN]`);
        }
      });
    });
  } else {
    console.log('⚠️ NO USERS FOUND - Table is empty');
  }

} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  await client.end();
}
