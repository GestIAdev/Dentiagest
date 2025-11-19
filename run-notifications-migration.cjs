// ============================================================================
// NOTIFICATIONS TABLES MIGRATION RUNNER
// ============================================================================
// Executes SQL migration to create notifications and notification_preferences tables
// Fixes: ERROR: no existe la relación «notifications»

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
  console.log('🔧 Running notifications tables migration...\n');

  try {
    // Read SQL file
    const sqlPath = path.join(process.cwd(), 'migrations', 'create_notifications_tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log(`📂 Reading migration: ${sqlPath}`);
    console.log(`📄 SQL length: ${sql.length} characters\n`);

    // Execute migration
    console.log('🚀 Executing SQL...');
    const result = await pool.query(sql);

    console.log('✅ Migration executed successfully!\n');
    console.log('📊 Tables created:');
    console.log('  - notifications');
    console.log('  - notification_preferences');
    console.log('\n📌 Indexes created:');
    console.log('  - idx_notifications_patient_id');
    console.log('  - idx_notifications_status');
    console.log('  - idx_notifications_type');
    console.log('  - idx_notifications_created_at');
    console.log('  - idx_notifications_priority');
    console.log('  - idx_notification_preferences_patient_id');
    console.log('\n🔔 Sample notifications created for patient1@dentiagest.test');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
