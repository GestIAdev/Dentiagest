#!/usr/bin/env node
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:11111111@localhost:5432/dentiagest'
});

async function checkEquipment() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'dental_equipment'
      ORDER BY ordinal_position
    `);

    if (result.rows.length === 0) {
      console.log('❌ Table dental_equipment DOES NOT EXIST');
    } else {
      console.log('\n📋 dental_equipment columns:');
      result.rows.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
      });

      const hasClinicId = result.rows.some(col => col.column_name === 'clinic_id');
      console.log(`\n🏥 clinic_id exists: ${hasClinicId ? '✅ YES' : '❌ NO'}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkEquipment();
