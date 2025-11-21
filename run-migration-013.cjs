#!/usr/bin/env node

/**
 * MIGRATION 013 RUNNER: Add clinic_id to suppliers + purchase_orders
 * 
 * LANDMINE 9: Final cleanup (suppliers + purchase_orders)
 * CONTEXT: Migration 009 secured dental_materials
 * 
 * TABLES:
 * - suppliers (2 records)
 * - purchase_orders (0 records)
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'dentiagest',
  user: 'postgres',
  password: '11111111'
});

async function runMigration() {
  console.log('\n🚀 EXECUTING MIGRATION 013: suppliers + purchase_orders clinic_id\n');
  console.log('='.repeat(80));
  
  try {
    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', '013_add_clinic_id_to_suppliers_and_orders.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    
    console.log('📄 Migration file loaded\n');
    
    // Execute migration
    const result = await pool.query(migrationSQL);
    
    console.log('\n✅ Migration executed successfully\n');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('\n❌ MIGRATION FAILED:', error.message);
    console.error('\nStack:', error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Execute
runMigration().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
