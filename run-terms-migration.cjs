const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'dentiagest',
  user: 'postgres',
  password: '11111111',
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('📝 Adding terms_accepted_at column...');
    
    const sql = fs.readFileSync(
      path.join(__dirname, 'migrations', 'add_terms_accepted_at.sql'),
      'utf-8'
    );
    
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    
    console.log('✅ Migration completed successfully');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
