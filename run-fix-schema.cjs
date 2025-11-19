// ============================================================================
// NOTIFICATIONS SCHEMA FIX MIGRATION RUNNER
// ============================================================================
// Adds missing columns to notifications and notification_preferences tables
// Fixes: ERROR: no existe la columna «channel», «appointment_reminders», etc.

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection (using Selene's config)
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'dentiagest',
  user: 'postgres',
  password: '11111111', // From selene/.env
});

async function runMigration() {
  console.log('🔧 Running notifications schema fix migration...\n');

  try {
    // Read SQL file
    const sqlPath = path.join(process.cwd(), 'migrations', 'fix_notifications_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log(`📂 Reading migration: ${sqlPath}`);
    console.log(`📄 SQL length: ${sql.length} characters\n`);

    // Execute migration
    console.log('🚀 Executing SQL...');
    await pool.query(sql);

    console.log('✅ Schema fix executed successfully!\n');
    console.log('📊 Columns added to notifications:');
    console.log('  - channel (VARCHAR(50), default: in_app)');
    console.log('  - sent_at (TIMESTAMP)');
    console.log('\n📊 Columns added to notification_preferences:');
    console.log('  - appointment_reminders (BOOLEAN, default: true)');
    console.log('  - billing_alerts (BOOLEAN, default: true)');
    console.log('  - treatment_updates (BOOLEAN, default: true)');
    console.log('  - marketing_emails (BOOLEAN, default: false)');
    console.log('  - created_at (TIMESTAMP)');
    console.log('\n🔧 Constraints added:');
    console.log('  - UNIQUE constraint on notification_preferences.patient_id');
    console.log('\n✅ Existing data updated with default values');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
