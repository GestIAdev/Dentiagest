#!/usr/bin/env node

/**
 * 🔍 AUDIT: NOTIFICATIONS MODULE (LANDMINE 10 - FINAL BOSS)
 * 
 * MISSION: Verify if notifications tables need multi-tenant isolation
 * 
 * TABLES TO AUDIT:
 * 1. notifications (notification records)
 * 2. notification_preferences (user preferences)
 * 
 * HYPOTHESIS: Notifications are USER-SCOPED (not clinic-scoped)
 * - Notifications follow patient_id or user_id
 * - No cross-user data leak expected
 * - clinic_id NOT needed (notifications belong to users, not clinics)
 * 
 * STRATEGY:
 * - Check if tables exist
 * - Check schema (patient_id, user_id columns)
 * - Count records
 * - Verify user/patient scoping
 * - Confirm no clinic_id needed
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'dentiagest',
  user: 'postgres',
  password: '11111111'
});

async function auditNotificationsModule() {
  console.log('\n🔍 AUDIT: NOTIFICATIONS MODULE (LANDMINE 10 - FINAL BOSS)\n');
  console.log('='.repeat(80));
  
  try {
    // ============================================================
    // TABLE 1: notifications
    // ============================================================
    console.log('\n📬 TABLE 1: notifications');
    console.log('-'.repeat(80));
    
    const notificationsExists = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'notifications'
      ) as exists
    `);
    
    if (!notificationsExists.rows[0].exists) {
      console.log('⚠️  Table notifications: NOT FOUND (table does not exist)');
    } else {
      // Check schema
      const notificationsSchema = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'notifications'
        ORDER BY ordinal_position
      `);
      
      console.log('✅ Table notifications: EXISTS');
      console.log(`   Columns: ${notificationsSchema.rows.length}`);
      
      // Check key columns
      const hasPatientId = notificationsSchema.rows.some(col => col.column_name === 'patient_id');
      const hasUserId = notificationsSchema.rows.some(col => col.column_name === 'user_id');
      const hasClinicId = notificationsSchema.rows.some(col => col.column_name === 'clinic_id');
      
      console.log('\n   🔍 Key Columns:');
      if (hasPatientId) {
        console.log('   ✅ patient_id: EXISTS (notifications for patients)');
      } else {
        console.log('   ❌ patient_id: NOT FOUND');
      }
      
      if (hasUserId) {
        console.log('   ✅ user_id: EXISTS (notifications for staff/users)');
      } else {
        console.log('   ❌ user_id: NOT FOUND');
      }
      
      if (hasClinicId) {
        console.log('   ⚠️  clinic_id: EXISTS (unexpected - notifications should be user-scoped)');
      } else {
        console.log('   ✅ clinic_id: NOT FOUND (correct - notifications are user-scoped)');
      }
      
      // Count records
      const notificationsCount = await pool.query('SELECT COUNT(*) as count FROM notifications');
      console.log(`\n   📊 Total records: ${notificationsCount.rows[0].count}`);
      
      // Sample data
      if (parseInt(notificationsCount.rows[0].count) > 0) {
        const sample = await pool.query(`
          SELECT id, patient_id, user_id, type, status, created_at
          FROM notifications
          LIMIT 3
        `);
        
        console.log('\n   📄 Sample Data:');
        sample.rows.forEach((row, idx) => {
          console.log(`      ${idx + 1}. ${row.type} (patient: ${row.patient_id || 'N/A'}, user: ${row.user_id || 'N/A'}, status: ${row.status})`);
        });
      }
      
      // Verdict
      if (hasPatientId || hasUserId) {
        console.log('\n   🟢 VERDICT: notifications is USER-SCOPED (no migration needed)');
        console.log('      Notifications follow patient_id/user_id (correct design)');
      } else {
        console.log('\n   ⚠️  VERDICT: Schema needs review (no patient_id or user_id found)');
      }
    }
    
    // ============================================================
    // TABLE 2: notification_preferences
    // ============================================================
    console.log('\n📬 TABLE 2: notification_preferences');
    console.log('-'.repeat(80));
    
    const preferencesExists = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'notification_preferences'
      ) as exists
    `);
    
    if (!preferencesExists.rows[0].exists) {
      console.log('⚠️  Table notification_preferences: NOT FOUND (table does not exist)');
    } else {
      // Check schema
      const preferencesSchema = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'notification_preferences'
        ORDER BY ordinal_position
      `);
      
      console.log('✅ Table notification_preferences: EXISTS');
      console.log(`   Columns: ${preferencesSchema.rows.length}`);
      
      // Check key columns
      const hasUserId = preferencesSchema.rows.some(col => col.column_name === 'user_id');
      const hasPatientId = preferencesSchema.rows.some(col => col.column_name === 'patient_id');
      const hasClinicId = preferencesSchema.rows.some(col => col.column_name === 'clinic_id');
      
      console.log('\n   🔍 Key Columns:');
      if (hasUserId) {
        console.log('   ✅ user_id: EXISTS (preferences for users)');
      } else {
        console.log('   ❌ user_id: NOT FOUND');
      }
      
      if (hasPatientId) {
        console.log('   ✅ patient_id: EXISTS (preferences for patients)');
      } else {
        console.log('   ❌ patient_id: NOT FOUND');
      }
      
      if (hasClinicId) {
        console.log('   ⚠️  clinic_id: EXISTS (unexpected - preferences should be user-scoped)');
      } else {
        console.log('   ✅ clinic_id: NOT FOUND (correct - preferences are user-scoped)');
      }
      
      // Count records
      const preferencesCount = await pool.query('SELECT COUNT(*) as count FROM notification_preferences');
      console.log(`\n   📊 Total records: ${preferencesCount.rows[0].count}`);
      
      // Sample data
      if (parseInt(preferencesCount.rows[0].count) > 0) {
        const sample = await pool.query(`
          SELECT id, user_id, patient_id, created_at
          FROM notification_preferences
          LIMIT 3
        `);
        
        console.log('\n   📄 Sample Data:');
        sample.rows.forEach((row, idx) => {
          console.log(`      ${idx + 1}. user: ${row.user_id || 'N/A'}, patient: ${row.patient_id || 'N/A'}`);
        });
      }
      
      // Verdict
      if (hasUserId || hasPatientId) {
        console.log('\n   🟢 VERDICT: notification_preferences is USER-SCOPED (no migration needed)');
        console.log('      Preferences follow user_id/patient_id (correct design)');
      } else {
        console.log('\n   ⚠️  VERDICT: Schema needs review (no user_id or patient_id found)');
      }
    }
    
    // ============================================================
    // SUMMARY
    // ============================================================
    console.log('\n' + '='.repeat(80));
    console.log('📊 LANDMINE 10 STATUS SUMMARY');
    console.log('='.repeat(80));
    
    if (notificationsExists.rows[0].exists && preferencesExists.rows[0].exists) {
      console.log('\n✅ NOTIFICATIONS MODULE: FOUND');
      
      const notificationsSchema = await pool.query(`
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'notifications'
      `);
      
      const preferencesSchema = await pool.query(`
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'notification_preferences'
      `);
      
      const notificationsUserScoped = notificationsSchema.rows.some(col => 
        col.column_name === 'patient_id' || col.column_name === 'user_id'
      );
      
      const preferencesUserScoped = preferencesSchema.rows.some(col => 
        col.column_name === 'user_id' || col.column_name === 'patient_id'
      );
      
      if (notificationsUserScoped && preferencesUserScoped) {
        console.log('\n🎯 VERDICT: LANDMINE 10 - NO THREAT DETECTED ✅');
        console.log('   Both tables are USER-SCOPED (patient_id/user_id)');
        console.log('   No clinic_id needed (notifications follow users, not clinics)');
        console.log('   No migration required');
        console.log('\n🏆 LANDMINE 10: SECURE BY DESIGN');
        console.log('   Notifications belong to users, not clinics.');
        console.log('   Architecture is correct.');
      } else {
        console.log('\n⚠️  VERDICT: LANDMINE 10 - NEEDS REVIEW');
        console.log('   User/patient scoping unclear');
        console.log('   Manual review recommended');
      }
    } else {
      console.log('\n⚠️  NOTIFICATIONS MODULE: PARTIALLY MISSING');
      console.log(`   notifications table: ${notificationsExists.rows[0].exists ? 'EXISTS' : 'NOT FOUND'}`);
      console.log(`   notification_preferences table: ${preferencesExists.rows[0].exists ? 'EXISTS' : 'NOT FOUND'}`);
      console.log('\n🟢 VERDICT: No landmine (tables not implemented yet)');
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ AUDIT COMPLETE\n');
    
  } catch (error) {
    console.error('\n❌ AUDIT FAILED:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

// Execute
auditNotificationsModule().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
