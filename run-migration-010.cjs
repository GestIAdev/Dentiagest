#!/usr/bin/env node
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: 'postgresql://postgres:11111111@localhost:5432/dentiagest'
});

async function runMigration() {
  const migrationPath = path.join(__dirname, 'migrations', '010_add_clinic_id_to_billing.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  try {
    console.log('💰 Executing Migration 010...\n');
    await pool.query(sql);
    console.log('\n✅ Migration 010 executed successfully');
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
