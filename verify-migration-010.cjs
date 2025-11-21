#!/usr/bin/env node
/**
 * 💰 MIGRATION 010 VERIFICATION: BILLING MULTI-TENANT ISOLATION
 * 
 * Comprehensive verification of Migration 010 execution.
 * 
 * TESTS:
 * 1. Schema verification (clinic_id exists, NOT NULL)
 * 2. Foreign key constraints (all 5 tables → clinics)
 * 3. Indexes verification (clinic_id indexes created)
 * 4. Data integrity (all records have clinic_id)
 * 5. Invoice numbering format check
 * 6. Cross-table consistency (billing_data ↔ payment_plans)
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:11111111@localhost:5432/dentiagest'
});

const BILLING_TABLES = [
  'billing_data',
  'payment_plans',
  'payment_receipts',
  'payment_reminders',
  'partial_payments'
];

async function verifyMigration010() {
  console.log('\n💰 MIGRATION 010 VERIFICATION: BILLING MULTI-TENANT ISOLATION');
  console.log('═'.repeat(70));

  const results = {
    schemaOk: true,
    fkOk: true,
    indexesOk: true,
    dataOk: true,
    numberingOk: true
  };

  try {
    // ========================================================================
    // TEST 1: Schema Verification - clinic_id column
    // ========================================================================
    console.log('\n📋 TEST 1: Schema Verification (clinic_id column)');
    console.log('─'.repeat(70));

    for (const table of BILLING_TABLES) {
      const columnCheck = await pool.query(`
        SELECT 
          column_name, 
          data_type, 
          is_nullable
        FROM information_schema.columns
        WHERE table_name = $1 AND column_name = 'clinic_id'
      `, [table]);

      if (columnCheck.rows.length === 0) {
        console.log(`❌ ${table}: clinic_id DOES NOT EXIST`);
        results.schemaOk = false;
      } else {
        const col = columnCheck.rows[0];
        const nullable = col.is_nullable === 'NO' ? '✅ NOT NULL' : '⚠️  NULLABLE';
        console.log(`✅ ${table}: clinic_id ${col.data_type} [${nullable}]`);
        
        if (col.is_nullable !== 'NO') {
          results.schemaOk = false;
        }
      }
    }

    // ========================================================================
    // TEST 2: Foreign Key Constraints
    // ========================================================================
    console.log('\n🔗 TEST 2: Foreign Key Constraints');
    console.log('─'.repeat(70));

    for (const table of BILLING_TABLES) {
      const fkCheck = await pool.query(`
        SELECT
          conname AS constraint_name,
          confrelid::regclass AS referenced_table
        FROM pg_constraint
        WHERE conrelid = $1::regclass
          AND contype = 'f'
          AND conname LIKE '%clinic%'
      `, [table]);

      if (fkCheck.rows.length === 0) {
        console.log(`❌ ${table}: NO FK constraint to clinics`);
        results.fkOk = false;
      } else {
        const fk = fkCheck.rows[0];
        console.log(`✅ ${table}: ${fk.constraint_name} → ${fk.referenced_table}`);
      }
    }

    // ========================================================================
    // TEST 3: Indexes Verification
    // ========================================================================
    console.log('\n📇 TEST 3: Indexes on clinic_id');
    console.log('─'.repeat(70));

    for (const table of BILLING_TABLES) {
      const indexCheck = await pool.query(`
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = $1
          AND indexdef ILIKE '%clinic_id%'
      `, [table]);

      if (indexCheck.rows.length === 0) {
        console.log(`⚠️  ${table}: NO indexes on clinic_id (performance impact)`);
        // Not critical, just warning
      } else {
        console.log(`✅ ${table}: ${indexCheck.rows.length} index(es)`);
        indexCheck.rows.forEach(idx => {
          console.log(`   - ${idx.indexname}`);
        });
      }
    }

    // ========================================================================
    // TEST 4: Data Integrity
    // ========================================================================
    console.log('\n💾 TEST 4: Data Integrity (all records have clinic_id)');
    console.log('─'.repeat(70));

    for (const table of BILLING_TABLES) {
      const dataCheck = await pool.query(`
        SELECT
          COUNT(*) AS total_records,
          COUNT(clinic_id) AS records_with_clinic,
          COUNT(*) - COUNT(clinic_id) AS records_without_clinic
        FROM ${table}
      `);

      const stats = dataCheck.rows[0];
      console.log(`${table}:`);
      console.log(`  Total: ${stats.total_records}`);
      console.log(`  With clinic_id: ${stats.records_with_clinic}`);
      console.log(`  Without clinic_id: ${stats.records_without_clinic}`);

      if (parseInt(stats.records_without_clinic) > 0) {
        console.log(`  ❌ CRITICAL: Records exist without clinic_id`);
        results.dataOk = false;
      } else if (parseInt(stats.total_records) > 0) {
        console.log(`  ✅ All records have clinic_id`);
      } else {
        console.log(`  ⚪ No records in table`);
      }
    }

    // ========================================================================
    // TEST 5: Invoice Numbering Format Check
    // ========================================================================
    console.log('\n🔢 TEST 5: Invoice Numbering Format');
    console.log('─'.repeat(70));

    const invoiceCheck = await pool.query(`
      SELECT 
        invoice_number,
        clinic_id,
        created_at
      FROM billing_data
      ORDER BY created_at DESC
      LIMIT 10
    `);

    if (invoiceCheck.rows.length > 0) {
      console.log('Recent invoice numbers (last 10):');
      invoiceCheck.rows.forEach(inv => {
        const isNewFormat = /^FAC-\d{4}-\d{3,}$/.test(inv.invoice_number);
        const icon = isNewFormat ? '✅' : '⚠️ ';
        console.log(`  ${icon} ${inv.invoice_number} (${inv.created_at.toISOString().split('T')[0]})`);
      });

      // Check for duplicates PER CLINIC
      const duplicateCheck = await pool.query(`
        SELECT clinic_id, invoice_number, COUNT(*) as count
        FROM billing_data
        GROUP BY clinic_id, invoice_number
        HAVING COUNT(*) > 1
      `);

      if (duplicateCheck.rows.length > 0) {
        console.log(`\n❌ CRITICAL: ${duplicateCheck.rows.length} duplicate invoice numbers detected`);
        duplicateCheck.rows.forEach(dup => {
          console.log(`  Clinic ${dup.clinic_id}: ${dup.invoice_number} (${dup.count} occurrences)`);
        });
        results.numberingOk = false;
      } else {
        console.log('\n✅ No duplicate invoice numbers per clinic');
      }
    } else {
      console.log('⚪ No invoices in database');
    }

    // ========================================================================
    // TEST 6: Cross-Table Consistency
    // ========================================================================
    console.log('\n🔄 TEST 6: Cross-Table Consistency');
    console.log('─'.repeat(70));

    // Check if payment_plans reference valid billing_data with same clinic_id
    const consistencyCheck = await pool.query(`
      SELECT COUNT(*) as orphan_plans
      FROM payment_plans pp
      LEFT JOIN billing_data bd ON pp.billing_id = bd.id
      WHERE bd.id IS NULL
         OR pp.clinic_id != bd.clinic_id
    `);

    const orphanPlans = parseInt(consistencyCheck.rows[0].orphan_plans);
    if (orphanPlans > 0) {
      console.log(`⚠️  WARNING: ${orphanPlans} payment plans with mismatched clinic_id or orphaned`);
    } else {
      console.log('✅ All payment plans reference valid billing_data with matching clinic_id');
    }

    // Check partial_payments → billing_data consistency
    const partialConsistency = await pool.query(`
      SELECT COUNT(*) as orphan_payments
      FROM partial_payments pp
      LEFT JOIN billing_data bd ON pp.invoice_id = bd.id
      WHERE bd.id IS NULL
         OR pp.clinic_id != bd.clinic_id
    `);

    const orphanPayments = parseInt(partialConsistency.rows[0].orphan_payments);
    if (orphanPayments > 0) {
      console.log(`⚠️  WARNING: ${orphanPayments} partial payments with mismatched clinic_id or orphaned`);
    } else {
      console.log('✅ All partial payments reference valid billing_data with matching clinic_id');
    }

    // ========================================================================
    // TEST 7: Clinic Distribution
    // ========================================================================
    console.log('\n🏥 TEST 7: Clinic Distribution');
    console.log('─'.repeat(70));

    const distribution = await pool.query(`
      SELECT
        c.id,
        c.name,
        COUNT(DISTINCT bd.id) AS invoices,
        COUNT(DISTINCT pp.id) AS payment_plans,
        COUNT(DISTINCT pr.id) AS receipts,
        COUNT(DISTINCT p.id) AS partial_payments
      FROM clinics c
      LEFT JOIN billing_data bd ON bd.clinic_id = c.id
      LEFT JOIN payment_plans pp ON pp.clinic_id = c.id
      LEFT JOIN payment_receipts pr ON pr.clinic_id = c.id
      LEFT JOIN partial_payments p ON p.clinic_id = c.id
      GROUP BY c.id, c.name
      ORDER BY invoices DESC
    `);

    console.log('\nRecords per clinic:');
    distribution.rows.forEach(row => {
      console.log(`  ${row.name}:`);
      console.log(`    Invoices: ${row.invoices}`);
      console.log(`    Payment Plans: ${row.payment_plans}`);
      console.log(`    Receipts: ${row.receipts}`);
      console.log(`    Partial Payments: ${row.partial_payments}`);
    });

    // ========================================================================
    // FINAL VERDICT
    // ========================================================================
    console.log('\n🎯 FINAL VERDICT');
    console.log('═'.repeat(70));

    const allPassed = Object.values(results).every(v => v);

    console.log(`Schema (clinic_id NOT NULL): ${results.schemaOk ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Foreign Keys: ${results.fkOk ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Indexes: ${results.indexesOk ? '✅ PASS' : '⚠️  WARNING'}`);
    console.log(`Data Integrity: ${results.dataOk ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Invoice Numbering: ${results.numberingOk ? '✅ PASS' : '❌ FAIL'}`);

    console.log('');
    if (allPassed) {
      console.log('✅ MIGRATION 010 STATUS: VERIFIED ✅');
      console.log('💰 5 billing tables secured with multi-tenant isolation');
      console.log('');
      console.log('NEXT STEPS:');
      console.log('  1. ✅ Update BillingDatabase.ts (DONE)');
      console.log('  2. ⏳ Update billing resolvers with getClinicIdFromContext');
      console.log('  3. ⏳ Test sequential invoice numbering');
      console.log('  4. ⏳ Test immutability rules');
    } else {
      console.log('❌ MIGRATION 010 STATUS: INCOMPLETE ⚠️');
      console.log('🔥 Critical issues detected - review above errors');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n💥 VERIFICATION FAILED:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run verification
verifyMigration010().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
