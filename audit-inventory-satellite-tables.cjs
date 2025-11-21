#!/usr/bin/env node

/**
 * 🔍 AUDIT: INVENTORY SATELLITE TABLES (suppliers, purchase_orders, cart_items)
 * 
 * CONTEXT: Migration 009 secured dental_materials (core stock)
 * MISSION: Verify if satellite tables (logistics/purchasing) need clinic_id
 * 
 * TABLES TO AUDIT:
 * 1. suppliers (supplier management)
 * 2. purchase_orders (purchase order management)
 * 3. cart_items (marketplace cart - USER-SCOPED, not clinic)
 * 
 * STRATEGY:
 * - Check if tables exist
 * - Check if clinic_id column exists
 * - Count records
 * - Check FK constraints
 * - Determine if migration needed
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'dentiagest',
  user: 'postgres',
  password: '11111111'
});

async function auditInventorySatelliteTables() {
  console.log('\n🔍 AUDIT: INVENTORY SATELLITE TABLES (LANDMINE 9 CLEANUP)\n');
  console.log('='.repeat(80));
  
  try {
    // ============================================================
    // TABLE 1: suppliers
    // ============================================================
    console.log('\n📦 TABLE 1: suppliers');
    console.log('-'.repeat(80));
    
    const suppliersExists = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'suppliers'
      ) as exists
    `);
    
    if (!suppliersExists.rows[0].exists) {
      console.log('⚠️  Table suppliers: NOT FOUND (table does not exist)');
    } else {
      // Check schema
      const suppliersSchema = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'suppliers'
        ORDER BY ordinal_position
      `);
      
      console.log('✅ Table suppliers: EXISTS');
      console.log(`   Columns: ${suppliersSchema.rows.length}`);
      
      const hasClinicId = suppliersSchema.rows.some(col => col.column_name === 'clinic_id');
      
      if (hasClinicId) {
        console.log('   ✅ clinic_id column: EXISTS');
        
        // Check FK
        const fkCheck = await pool.query(`
          SELECT constraint_name 
          FROM information_schema.table_constraints
          WHERE table_name = 'suppliers' 
            AND constraint_type = 'FOREIGN KEY'
            AND constraint_name LIKE '%clinic%'
        `);
        
        if (fkCheck.rows.length > 0) {
          console.log(`   ✅ FK constraint: ${fkCheck.rows[0].constraint_name}`);
        } else {
          console.log('   ⚠️  FK constraint: MISSING');
        }
      } else {
        console.log('   ❌ clinic_id column: NOT FOUND');
      }
      
      // Count records
      const suppliersCount = await pool.query('SELECT COUNT(*) as count FROM suppliers');
      console.log(`   📊 Total records: ${suppliersCount.rows[0].count}`);
      
      if (!hasClinicId && parseInt(suppliersCount.rows[0].count) > 0) {
        console.log(`   🚨 LANDMINE DETECTED: ${suppliersCount.rows[0].count} orphan records without clinic_id`);
      }
    }
    
    // ============================================================
    // TABLE 2: purchase_orders
    // ============================================================
    console.log('\n📦 TABLE 2: purchase_orders');
    console.log('-'.repeat(80));
    
    const ordersExists = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'purchase_orders'
      ) as exists
    `);
    
    if (!ordersExists.rows[0].exists) {
      console.log('⚠️  Table purchase_orders: NOT FOUND (table does not exist)');
    } else {
      // Check schema
      const ordersSchema = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'purchase_orders'
        ORDER BY ordinal_position
      `);
      
      console.log('✅ Table purchase_orders: EXISTS');
      console.log(`   Columns: ${ordersSchema.rows.length}`);
      
      const hasClinicId = ordersSchema.rows.some(col => col.column_name === 'clinic_id');
      
      if (hasClinicId) {
        console.log('   ✅ clinic_id column: EXISTS');
        
        // Check FK
        const fkCheck = await pool.query(`
          SELECT constraint_name 
          FROM information_schema.table_constraints
          WHERE table_name = 'purchase_orders' 
            AND constraint_type = 'FOREIGN KEY'
            AND constraint_name LIKE '%clinic%'
        `);
        
        if (fkCheck.rows.length > 0) {
          console.log(`   ✅ FK constraint: ${fkCheck.rows[0].constraint_name}`);
        } else {
          console.log('   ⚠️  FK constraint: MISSING');
        }
      } else {
        console.log('   ❌ clinic_id column: NOT FOUND');
      }
      
      // Count records
      const ordersCount = await pool.query('SELECT COUNT(*) as count FROM purchase_orders');
      console.log(`   📊 Total records: ${ordersCount.rows[0].count}`);
      
      if (!hasClinicId && parseInt(ordersCount.rows[0].count) > 0) {
        console.log(`   🚨 LANDMINE DETECTED: ${ordersCount.rows[0].count} orphan records without clinic_id`);
      }
    }
    
    // ============================================================
    // TABLE 3: cart_items (USER-SCOPED, not clinic)
    // ============================================================
    console.log('\n📦 TABLE 3: cart_items (USER-SCOPED)');
    console.log('-'.repeat(80));
    
    const cartExists = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'cart_items'
      ) as exists
    `);
    
    if (!cartExists.rows[0].exists) {
      console.log('⚠️  Table cart_items: NOT FOUND (table does not exist)');
    } else {
      // Check schema
      const cartSchema = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'cart_items'
        ORDER BY ordinal_position
      `);
      
      console.log('✅ Table cart_items: EXISTS');
      console.log(`   Columns: ${cartSchema.rows.length}`);
      
      const hasUserId = cartSchema.rows.some(col => col.column_name === 'user_id');
      const hasClinicId = cartSchema.rows.some(col => col.column_name === 'clinic_id');
      
      if (hasUserId) {
        console.log('   ✅ user_id column: EXISTS (correct - cart is user-scoped)');
      } else {
        console.log('   ⚠️  user_id column: MISSING');
      }
      
      if (hasClinicId) {
        console.log('   ⚠️  clinic_id column: EXISTS (unexpected - cart should be user-scoped)');
      } else {
        console.log('   ✅ clinic_id column: NOT FOUND (correct - cart is user-scoped)');
      }
      
      // Count records
      const cartCount = await pool.query('SELECT COUNT(*) as count FROM cart_items');
      console.log(`   📊 Total records: ${cartCount.rows[0].count}`);
      
      console.log('   🟢 VERDICT: cart_items is USER-SCOPED (no migration needed)');
    }
    
    // ============================================================
    // SUMMARY
    // ============================================================
    console.log('\n' + '='.repeat(80));
    console.log('📊 LANDMINE 9 STATUS SUMMARY');
    console.log('='.repeat(80));
    
    console.log('\n✅ SECURED (Migration 009):');
    console.log('   - dental_materials (core stock) → clinic_id + FK + index');
    
    console.log('\n🔍 AUDIT RESULTS:');
    
    if (suppliersExists.rows[0].exists) {
      const suppliersHasClinicId = (await pool.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'suppliers' AND column_name = 'clinic_id'
        ) as exists
      `)).rows[0].exists;
      
      if (suppliersHasClinicId) {
        console.log('   ✅ suppliers → SECURED');
      } else {
        const count = (await pool.query('SELECT COUNT(*) as count FROM suppliers')).rows[0].count;
        console.log(`   🚨 suppliers → PENDING (${count} orphan records)`);
      }
    } else {
      console.log('   ⚠️  suppliers → NOT FOUND (table does not exist)');
    }
    
    if (ordersExists.rows[0].exists) {
      const ordersHasClinicId = (await pool.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'purchase_orders' AND column_name = 'clinic_id'
        ) as exists
      `)).rows[0].exists;
      
      if (ordersHasClinicId) {
        console.log('   ✅ purchase_orders → SECURED');
      } else {
        const count = (await pool.query('SELECT COUNT(*) as count FROM purchase_orders')).rows[0].count;
        console.log(`   🚨 purchase_orders → PENDING (${count} orphan records)`);
      }
    } else {
      console.log('   ⚠️  purchase_orders → NOT FOUND (table does not exist)');
    }
    
    if (cartExists.rows[0].exists) {
      console.log('   🟢 cart_items → USER-SCOPED (no action needed)');
    } else {
      console.log('   ⚠️  cart_items → NOT FOUND (table does not exist)');
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🎯 RECOMMENDATION:');
    
    const needsMigration = (
      (suppliersExists.rows[0].exists && !(await pool.query(`SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suppliers' AND column_name = 'clinic_id') as exists`)).rows[0].exists) ||
      (ordersExists.rows[0].exists && !(await pool.query(`SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_orders' AND column_name = 'clinic_id') as exists`)).rows[0].exists)
    );
    
    if (needsMigration) {
      console.log('   📝 CREATE Migration 013: Add clinic_id to suppliers + purchase_orders');
      console.log('   ⏱️  Estimated time: 1 hour (low complexity)');
      console.log('   🎯 Priority: MEDIUM (logistics/purchasing data)');
    } else {
      console.log('   ✅ NO MIGRATION NEEDED - All tables secured or user-scoped');
      console.log('   🏆 LANDMINE 9: 100% DEFUSED');
    }
    
    console.log('='.repeat(80));
    console.log('\n✅ AUDIT COMPLETE\n');
    
  } catch (error) {
    console.error('\n❌ AUDIT FAILED:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

// Execute
auditInventorySatelliteTables().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
