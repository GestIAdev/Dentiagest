#!/usr/bin/env node
/**
 * 💰 OPERATION CASHFLOW: BILLING SCHEMA INSPECTION
 * 
 * Audits invoices and invoice_items tables before Migration 010.
 * Identifies:
 * - Current columns and types
 * - Existence of clinic_id
 * - Invoice numbering strategy
 * - Constraints and indexes
 * - Data volume and distribution
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:11111111@localhost:5432/dentiagest'
});

async function inspectBillingSchema() {
  console.log('\n💰 OPERATION CASHFLOW: BILLING SCHEMA INSPECTION');
  console.log('═'.repeat(70));

  try {
    // ============================================================================
    // TABLE 1: invoices
    // ============================================================================
    console.log('\n📋 TABLE: invoices');
    console.log('─'.repeat(70));

    const invoicesColumns = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'invoices'
      ORDER BY ordinal_position
    `);

    if (invoicesColumns.rows.length === 0) {
      console.log('❌ Table invoices DOES NOT EXIST');
    } else {
      console.log('Columns:');
      invoicesColumns.rows.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? '✓' : '✗';
        const defaultVal = col.column_default ? ` (default: ${col.column_default})` : '';
        console.log(`  - ${col.column_name}: ${col.data_type} [nullable: ${nullable}]${defaultVal}`);
      });

      // Check for clinic_id
      const hasClinicId = invoicesColumns.rows.some(c => c.column_name === 'clinic_id');
      console.log(`\n🏥 clinic_id exists: ${hasClinicId ? '✅ YES' : '❌ NO (LANDMINE ACTIVE)'}`);

      // Check for invoice_number
      const invoiceNumberCol = invoicesColumns.rows.find(c => c.column_name === 'invoice_number');
      if (invoiceNumberCol) {
        console.log(`📄 invoice_number: ${invoiceNumberCol.data_type} (nullable: ${invoiceNumberCol.is_nullable})`);
      } else {
        console.log('📄 invoice_number: ❌ DOES NOT EXIST');
      }

      // Count records
      const count = await pool.query('SELECT COUNT(*) as total FROM invoices');
      console.log(`\n📊 Total invoices: ${count.rows[0].total}`);

      // Check statuses
      const statuses = await pool.query(`
        SELECT status, COUNT(*) as count
        FROM invoices
        GROUP BY status
        ORDER BY count DESC
      `);
      
      if (statuses.rows.length > 0) {
        console.log('\nStatus distribution:');
        statuses.rows.forEach(row => {
          console.log(`  ${row.status || 'NULL'}: ${row.count}`);
        });
      }
    }

    // ============================================================================
    // TABLE 2: invoice_items
    // ============================================================================
    console.log('\n📋 TABLE: invoice_items');
    console.log('─'.repeat(70));

    const itemsColumns = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'invoice_items'
      ORDER BY ordinal_position
    `);

    if (itemsColumns.rows.length === 0) {
      console.log('❌ Table invoice_items DOES NOT EXIST');
    } else {
      console.log('Columns:');
      itemsColumns.rows.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? '✓' : '✗';
        const defaultVal = col.column_default ? ` (default: ${col.column_default})` : '';
        console.log(`  - ${col.column_name}: ${col.data_type} [nullable: ${nullable}]${defaultVal}`);
      });

      // Check for clinic_id
      const hasClinicId = itemsColumns.rows.some(c => c.column_name === 'clinic_id');
      console.log(`\n🏥 clinic_id exists: ${hasClinicId ? '✅ YES' : '❌ NO (LANDMINE ACTIVE)'}`);

      // Count records
      const count = await pool.query('SELECT COUNT(*) as total FROM invoice_items');
      console.log(`\n📊 Total invoice items: ${count.rows[0].total}`);
    }

    // ============================================================================
    // CONSTRAINTS & INDEXES
    // ============================================================================
    console.log('\n🔗 CONSTRAINTS & INDEXES');
    console.log('─'.repeat(70));

    // Foreign keys on invoices
    const invoicesFKs = await pool.query(`
      SELECT
        conname AS constraint_name,
        confrelid::regclass AS referenced_table
      FROM pg_constraint
      WHERE conrelid = 'invoices'::regclass
        AND contype = 'f'
    `);

    console.log('\nInvoices Foreign Keys:');
    if (invoicesFKs.rows.length === 0) {
      console.log('  (none)');
    } else {
      invoicesFKs.rows.forEach(fk => {
        console.log(`  ✅ ${fk.constraint_name} → ${fk.referenced_table}`);
      });
    }

    // Indexes on invoices
    const invoicesIndexes = await pool.query(`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'invoices'
    `);

    console.log('\nInvoices Indexes:');
    if (invoicesIndexes.rows.length === 0) {
      console.log('  (none)');
    } else {
      invoicesIndexes.rows.forEach(idx => {
        console.log(`  📇 ${idx.indexname}`);
      });
    }

    // Foreign keys on invoice_items
    const itemsFKs = await pool.query(`
      SELECT
        conname AS constraint_name,
        confrelid::regclass AS referenced_table
      FROM pg_constraint
      WHERE conrelid = 'invoice_items'::regclass
        AND contype = 'f'
    `);

    console.log('\nInvoice Items Foreign Keys:');
    if (itemsFKs.rows.length === 0) {
      console.log('  (none)');
    } else {
      itemsFKs.rows.forEach(fk => {
        console.log(`  ✅ ${fk.constraint_name} → ${fk.referenced_table}`);
      });
    }

    // ============================================================================
    // INVOICE NUMBERING ANALYSIS
    // ============================================================================
    console.log('\n🔢 INVOICE NUMBERING ANALYSIS');
    console.log('─'.repeat(70));

    const numberingSample = await pool.query(`
      SELECT invoice_number, created_at
      FROM invoices
      ORDER BY created_at DESC
      LIMIT 10
    `);

    if (numberingSample.rows.length > 0) {
      console.log('Recent invoice numbers (last 10):');
      numberingSample.rows.forEach(inv => {
        console.log(`  ${inv.invoice_number} (${inv.created_at})`);
      });

      // Check for duplicates
      const duplicates = await pool.query(`
        SELECT invoice_number, COUNT(*) as count
        FROM invoices
        GROUP BY invoice_number
        HAVING COUNT(*) > 1
      `);

      if (duplicates.rows.length > 0) {
        console.log(`\n⚠️  WARNING: ${duplicates.rows.length} duplicate invoice numbers detected`);
        duplicates.rows.forEach(dup => {
          console.log(`  ${dup.invoice_number}: ${dup.count} occurrences`);
        });
      } else {
        console.log('\n✅ No duplicate invoice numbers found');
      }
    } else {
      console.log('(No invoices found)');
    }

    // ============================================================================
    // FINAL ASSESSMENT
    // ============================================================================
    console.log('\n🎯 MIGRATION 010 REQUIREMENTS');
    console.log('═'.repeat(70));

    const invoicesHasClinic = invoicesColumns.rows.some(c => c.column_name === 'clinic_id');
    const itemsHasClinic = itemsColumns.rows.some(c => c.column_name === 'clinic_id');

    console.log(`invoices.clinic_id: ${invoicesHasClinic ? '✅ EXISTS' : '❌ NEEDS MIGRATION'}`);
    console.log(`invoice_items.clinic_id: ${itemsHasClinic ? '✅ EXISTS' : '❌ NEEDS MIGRATION'}`);

    if (!invoicesHasClinic || !itemsHasClinic) {
      console.log('\n🔥 LANDMINE 6 ACTIVE: Billing tables need clinic_id');
      console.log('📋 Required: Migration 010 (ADD clinic_id to invoices + invoice_items)');
    } else {
      console.log('\n✅ Billing tables already have clinic_id');
    }

  } catch (error) {
    console.error('\n💥 INSPECTION FAILED:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run inspection
inspectBillingSchema().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
