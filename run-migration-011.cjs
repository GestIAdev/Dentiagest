const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: 'postgresql://postgres:11111111@localhost:5432/dentiagest'
});

async function runMigration() {
  console.log('\n🚀 EXECUTING MIGRATION 011: dental_equipment clinic_id\n');
  console.log('='.repeat(80));
  
  try {
    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', '011_add_clinic_id_to_dental_equipment.sql');
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

runMigration();
