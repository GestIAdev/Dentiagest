#!/usr/bin/env node
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:11111111@localhost:5432/dentiagest'
});

async function inspectPaymentTables() {
  console.log('\n💰 PAYMENT SYSTEM INSPECTION');
  console.log('═'.repeat(70));

  const tables = ['billing_data', 'payment_plans', 'payment_receipts', 'payment_reminders', 'partial_payments'];

  try {
    for (const table of tables) {
      console.log(`\n📋 TABLE: ${table}`);
      console.log('─'.repeat(70));

      const columns = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [table]);

      if (columns.rows.length === 0) {
        console.log('❌ Table does not exist');
        continue;
      }

      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });

      const hasClinicId = columns.rows.some(c => c.column_name === 'clinic_id');
      console.log(`\n🏥 clinic_id: ${hasClinicId ? '✅ YES' : '❌ NO'}`);

      const count = await pool.query(`SELECT COUNT(*) as total FROM ${table}`);
      console.log(`📊 Records: ${count.rows[0].total}`);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

inspectPaymentTables();
