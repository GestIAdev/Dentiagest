#!/usr/bin/env node

/**
 * 🏆 VERIFY MIGRATION 013: suppliers + purchase_orders clinic_id
 * 
 * COMPREHENSIVE VERIFICATION:
 * 1. Schema verification (clinic_id column exists, NOT NULL)
 * 2. FK constraints verification
 * 3. Indexes verification
 * 4. Data integrity (no orphan records)
 * 5. Backfill verification (all records → Default Clinic)
 * 6. LANDMINE 9 final status (100% defused)
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'dentiagest',
  user: 'postgres',
  password: '11111111'
});

async function verifyMigration013() {
  console.log('\n🔍 VERIFY MIGRATION 013: suppliers + purchase_orders\n');
  console.log('='.repeat(80));
  
  let passed = 0;
  let failed = 0;
  
  try {
    // Get Default Clinic
    const clinicQuery = await pool.query(`
      SELECT id, name FROM clinics WHERE name = 'Default Clinic' LIMIT 1
    `);
    
    if (clinicQuery.rows.length === 0) {
      console.error('❌ Default Clinic not found');
      process.exit(1);
    }
    
    const defaultClinicId = clinicQuery.rows[0].id;
    console.log(`🏥 Default Clinic: ${defaultClinicId} (${clinicQuery.rows[0].name})\n`);
    
    // ============================================================
    // TEST 1: SUPPLIERS Schema Verification
    // ============================================================
    console.log('TEST 1: SUPPLIERS - Schema Verification');
    
    const suppliersSchemaQuery = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'suppliers' AND column_name = 'clinic_id'
    `);
    
    if (suppliersSchemaQuery.rows.length > 0) {
      const col = suppliersSchemaQuery.rows[0];
      if (col.data_type === 'uuid' && col.is_nullable === 'NO') {
        console.log('✅ PASS: suppliers.clinic_id (UUID, NOT NULL)\n');
        passed++;
      } else {
        console.log(`❌ FAIL: suppliers.clinic_id (${col.data_type}, nullable: ${col.is_nullable})\n`);
        failed++;
      }
    } else {
      console.log('❌ FAIL: suppliers.clinic_id NOT FOUND\n');
      failed++;
    }
    
    // ============================================================
    // TEST 2: PURCHASE_ORDERS Schema Verification
    // ============================================================
    console.log('TEST 2: PURCHASE_ORDERS - Schema Verification');
    
    const ordersSchemaQuery = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'purchase_orders' AND column_name = 'clinic_id'
    `);
    
    if (ordersSchemaQuery.rows.length > 0) {
      const col = ordersSchemaQuery.rows[0];
      if (col.data_type === 'uuid' && col.is_nullable === 'NO') {
        console.log('✅ PASS: purchase_orders.clinic_id (UUID, NOT NULL)\n');
        passed++;
      } else {
        console.log(`❌ FAIL: purchase_orders.clinic_id (${col.data_type}, nullable: ${col.is_nullable})\n`);
        failed++;
      }
    } else {
      console.log('❌ FAIL: purchase_orders.clinic_id NOT FOUND\n');
      failed++;
    }
    
    // ============================================================
    // TEST 3: FK Constraints Verification
    // ============================================================
    console.log('TEST 3: Foreign Key Constraints');
    
    const fkQuery = await pool.query(`
      SELECT constraint_name, table_name
      FROM information_schema.table_constraints
      WHERE table_name IN ('suppliers', 'purchase_orders')
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name LIKE '%clinic%'
      ORDER BY table_name
    `);
    
    const hasSuppliersFK = fkQuery.rows.some(row => row.table_name === 'suppliers');
    const hasOrdersFK = fkQuery.rows.some(row => row.table_name === 'purchase_orders');
    
    if (hasSuppliersFK && hasOrdersFK) {
      console.log('✅ PASS: Both FK constraints active');
      console.log(`   - ${fkQuery.rows.find(r => r.table_name === 'suppliers').constraint_name}`);
      console.log(`   - ${fkQuery.rows.find(r => r.table_name === 'purchase_orders').constraint_name}\n`);
      passed++;
    } else {
      console.log('❌ FAIL: Missing FK constraints');
      console.log(`   suppliers FK: ${hasSuppliersFK ? '✅' : '❌'}`);
      console.log(`   purchase_orders FK: ${hasOrdersFK ? '✅' : '❌'}\n`);
      failed++;
    }
    
    // ============================================================
    // TEST 4: Indexes Verification
    // ============================================================
    console.log('TEST 4: Indexes Verification');
    
    const indexQuery = await pool.query(`
      SELECT tablename, indexname
      FROM pg_indexes
      WHERE tablename IN ('suppliers', 'purchase_orders')
        AND indexname LIKE '%clinic%'
      ORDER BY tablename, indexname
    `);
    
    const suppliersIndexes = indexQuery.rows.filter(r => r.tablename === 'suppliers');
    const ordersIndexes = indexQuery.rows.filter(r => r.tablename === 'purchase_orders');
    
    if (suppliersIndexes.length >= 1 && ordersIndexes.length >= 2) {
      console.log('✅ PASS: All indexes created');
      console.log('   Suppliers:');
      suppliersIndexes.forEach(idx => console.log(`     - ${idx.indexname}`));
      console.log('   Purchase Orders:');
      ordersIndexes.forEach(idx => console.log(`     - ${idx.indexname}`));
      console.log('');
      passed++;
    } else {
      console.log('❌ FAIL: Missing indexes');
      console.log(`   suppliers: ${suppliersIndexes.length} (expected >= 1)`);
      console.log(`   purchase_orders: ${ordersIndexes.length} (expected >= 2)\n`);
      failed++;
    }
    
    // ============================================================
    // TEST 5: Data Integrity (No Orphans)
    // ============================================================
    console.log('TEST 5: Data Integrity (No Orphan Records)');
    
    const suppliersOrphansQuery = await pool.query(`
      SELECT COUNT(*) as count FROM suppliers WHERE clinic_id IS NULL
    `);
    
    const ordersOrphansQuery = await pool.query(`
      SELECT COUNT(*) as count FROM purchase_orders WHERE clinic_id IS NULL
    `);
    
    const suppliersOrphans = parseInt(suppliersOrphansQuery.rows[0].count);
    const ordersOrphans = parseInt(ordersOrphansQuery.rows[0].count);
    
    if (suppliersOrphans === 0 && ordersOrphans === 0) {
      console.log('✅ PASS: No orphan records');
      console.log(`   suppliers orphans: ${suppliersOrphans}`);
      console.log(`   purchase_orders orphans: ${ordersOrphans}\n`);
      passed++;
    } else {
      console.log('❌ FAIL: Orphan records detected');
      console.log(`   suppliers orphans: ${suppliersOrphans}`);
      console.log(`   purchase_orders orphans: ${ordersOrphans}\n`);
      failed++;
    }
    
    // ============================================================
    // TEST 6: Backfill Verification (Default Clinic)
    // ============================================================
    console.log('TEST 6: Backfill Verification (Default Clinic Assignment)');
    
    const suppliersBackfillQuery = await pool.query(`
      SELECT COUNT(*) as count 
      FROM suppliers 
      WHERE clinic_id = $1
    `, [defaultClinicId]);
    
    const ordersBackfillQuery = await pool.query(`
      SELECT COUNT(*) as count 
      FROM purchase_orders 
      WHERE clinic_id = $1
    `, [defaultClinicId]);
    
    const suppliersTotal = (await pool.query('SELECT COUNT(*) as count FROM suppliers')).rows[0].count;
    const ordersTotal = (await pool.query('SELECT COUNT(*) as count FROM purchase_orders')).rows[0].count;
    
    const suppliersBackfilled = parseInt(suppliersBackfillQuery.rows[0].count);
    const ordersBackfilled = parseInt(ordersBackfillQuery.rows[0].count);
    
    if (suppliersBackfilled === parseInt(suppliersTotal) && ordersBackfilled === parseInt(ordersTotal)) {
      console.log('✅ PASS: All records assigned to Default Clinic');
      console.log(`   suppliers: ${suppliersBackfilled}/${suppliersTotal}`);
      console.log(`   purchase_orders: ${ordersBackfilled}/${ordersTotal}\n`);
      passed++;
    } else {
      console.log('❌ FAIL: Not all records backfilled');
      console.log(`   suppliers: ${suppliersBackfilled}/${suppliersTotal}`);
      console.log(`   purchase_orders: ${ordersBackfilled}/${ordersTotal}\n`);
      failed++;
    }
    
    // ============================================================
    // TEST 7: LANDMINE 9 - Complete Status
    // ============================================================
    console.log('TEST 7: LANDMINE 9 - Complete Inventory Module Status');
    
    const inventoryTables = {
      dental_materials: await pool.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'dental_materials' AND column_name = 'clinic_id'
        ) as has_clinic_id
      `),
      suppliers: await pool.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'suppliers' AND column_name = 'clinic_id'
        ) as has_clinic_id
      `),
      purchase_orders: await pool.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'purchase_orders' AND column_name = 'clinic_id'
        ) as has_clinic_id
      `),
      cart_items: await pool.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'cart_items' AND column_name = 'user_id'
        ) as has_user_id
      `)
    };
    
    const allSecured = 
      inventoryTables.dental_materials.rows[0].has_clinic_id &&
      inventoryTables.suppliers.rows[0].has_clinic_id &&
      inventoryTables.purchase_orders.rows[0].has_clinic_id;
    // cart_items is USER-SCOPED, not checked
    
    if (allSecured) {
      console.log('✅ PASS: LANDMINE 9 - 100% DEFUSED');
      console.log('   ✅ dental_materials (Migration 009)');
      console.log('   ✅ suppliers (Migration 013)');
      console.log('   ✅ purchase_orders (Migration 013)');
      console.log('   🟢 cart_items (USER-SCOPED - no action needed)\n');
      passed++;
    } else {
      console.log('❌ FAIL: LANDMINE 9 - Incomplete');
      console.log(`   dental_materials: ${inventoryTables.dental_materials.rows[0].has_clinic_id ? '✅' : '❌'}`);
      console.log(`   suppliers: ${inventoryTables.suppliers.rows[0].has_clinic_id ? '✅' : '❌'}`);
      console.log(`   purchase_orders: ${inventoryTables.purchase_orders.rows[0].has_clinic_id ? '✅' : '❌'}\n`);
      failed++;
    }
    
    // ============================================================
    // FINAL VERDICT
    // ============================================================
    console.log('='.repeat(80));
    console.log('📊 VERIFICATION RESULTS');
    console.log('='.repeat(80));
    console.log(`✅ Passed: ${passed}/7`);
    console.log(`❌ Failed: ${failed}/7`);
    console.log(`📈 Success Rate: ${Math.round((passed / 7) * 100)}%\n`);
    
    if (failed === 0) {
      console.log('🏆 VERDICT: MIGRATION 013 APPROVED ✅\n');
      console.log('🎯 LANDMINE 9: 100% DEFUSED');
      console.log('   All Inventory Module tables secured:');
      console.log('   - dental_materials ✅');
      console.log('   - suppliers ✅');
      console.log('   - purchase_orders ✅');
      console.log('   - cart_items 🟢 (USER-SCOPED)\n');
      console.log('🏛️ THE EMPEROR\'S LOGISTICS SECURED');
      console.log('   Every supplier has a clinic.');
      console.log('   Every order belongs to someone.');
      console.log('   No orphan logistics.\n');
    } else {
      console.log('⚠️  VERDICT: MIGRATION 013 NEEDS REVIEW\n');
    }
    
    console.log('='.repeat(80));
    console.log('');
    
  } catch (error) {
    console.error('\n❌ VERIFICATION FAILED:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

// Execute
verifyMigration013().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
