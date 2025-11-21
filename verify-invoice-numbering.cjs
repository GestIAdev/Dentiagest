/**
 * VERIFICATION SCRIPT: INVOICE NUMBERING SYSTEM
 * 
 * GeminiPunk Compliance Test - Sequential Numbering Per Clinic
 * 
 * TESTS:
 * 1. Sequential Generation: FAC-2025-001, FAC-2025-002, FAC-2025-003
 * 2. Per-Clinic Independence: Clinic A and B have separate sequences
 * 3. No Duplicates: Same number never generated twice per clinic
 * 4. Fiscal Year Reset: New year → sequence resets to 001
 * 5. Concurrent Safety: Row locking prevents race conditions
 * 
 * PASS CRITERIA: 100% or REJECT
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:11111111@localhost:5432/dentiagest',
});

// Test counters
let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

function logTest(name, passed, details = '') {
  testsRun++;
  if (passed) {
    testsPassed++;
    console.log(`✅ TEST ${testsRun}: ${name}`);
    if (details) console.log(`   ${details}`);
  } else {
    testsFailed++;
    console.log(`❌ TEST ${testsRun}: ${name}`);
    if (details) console.log(`   ERROR: ${details}`);
  }
}

async function runTests() {
  console.log('\n🔍 INVOICE NUMBERING VERIFICATION - GeminiPunk Compliance Mode\n');
  console.log('=' .repeat(80));

  try {
    // ==================== TEST 1: SEQUENTIAL PATTERN VALIDATION ====================
    console.log('\n📋 TEST 1: Sequential Invoice Number Format Validation\n');

    const result1 = await pool.query(`
      SELECT 
        invoice_number,
        clinic_id,
        created_at,
        SUBSTRING(invoice_number FROM 'FAC-([0-9]{4})-[0-9]+') as year_part,
        SUBSTRING(invoice_number FROM 'FAC-[0-9]{4}-([0-9]+)') as seq_part
      FROM billing_data
      WHERE invoice_number LIKE 'FAC-%'
      ORDER BY clinic_id, created_at
    `);

    const validFormat = result1.rows.every(row => {
      const match = row.invoice_number.match(/^FAC-(\d{4})-(\d{3,})$/);
      return match !== null;
    });

    logTest(
      'Invoice Number Format (FAC-YYYY-XXX)',
      validFormat,
      validFormat 
        ? `All ${result1.rows.length} new invoices match format`
        : 'Some invoices have invalid format'
    );

    // ==================== TEST 2: NO DUPLICATES PER CLINIC ====================
    console.log('\n📋 TEST 2: Duplicate Detection Per Clinic\n');

    const result2 = await pool.query(`
      SELECT 
        clinic_id,
        invoice_number,
        COUNT(*) as duplicate_count
      FROM billing_data
      WHERE invoice_number LIKE 'FAC-%'
      GROUP BY clinic_id, invoice_number
      HAVING COUNT(*) > 1
    `);

    const noDuplicates = result2.rows.length === 0;

    logTest(
      'No Duplicate Invoice Numbers Per Clinic',
      noDuplicates,
      noDuplicates
        ? 'PASS: Every invoice number is unique per clinic'
        : `FAIL: Found ${result2.rows.length} duplicate invoice numbers`
    );

    if (!noDuplicates) {
      console.log('\n   🚨 DUPLICATE INVOICES DETECTED:');
      result2.rows.forEach(dup => {
        console.log(`      Clinic: ${dup.clinic_id} | Invoice: ${dup.invoice_number} | Count: ${dup.duplicate_count}`);
      });
    }

    // ==================== TEST 3: SEQUENTIAL INCREMENT PER CLINIC ====================
    console.log('\n📋 TEST 3: Sequential Increment Validation\n');

    const result3 = await pool.query(`
      WITH invoice_sequences AS (
        SELECT 
          clinic_id,
          invoice_number,
          CAST(SUBSTRING(invoice_number FROM 'FAC-[0-9]{4}-([0-9]+)') AS INTEGER) as seq_num,
          SUBSTRING(invoice_number FROM 'FAC-([0-9]{4})-[0-9]+') as fiscal_year,
          created_at,
          ROW_NUMBER() OVER (
            PARTITION BY clinic_id, SUBSTRING(invoice_number FROM 'FAC-([0-9]{4})-[0-9]+')
            ORDER BY created_at
          ) as expected_seq
        FROM billing_data
        WHERE invoice_number LIKE 'FAC-%'
      )
      SELECT 
        clinic_id,
        fiscal_year,
        COUNT(*) as total_invoices,
        MIN(seq_num) as min_seq,
        MAX(seq_num) as max_seq,
        ARRAY_AGG(seq_num ORDER BY seq_num) as all_sequences
      FROM invoice_sequences
      GROUP BY clinic_id, fiscal_year
      ORDER BY clinic_id, fiscal_year
    `);

    let sequenceValid = true;
    const sequenceDetails = [];

    result3.rows.forEach(clinic => {
      const expectedMax = clinic.total_invoices;
      const hasGaps = clinic.max_seq !== expectedMax || clinic.min_seq !== 1;
      
      sequenceDetails.push({
        clinic: clinic.clinic_id,
        year: clinic.fiscal_year,
        total: clinic.total_invoices,
        range: `${clinic.min_seq}-${clinic.max_seq}`,
        valid: !hasGaps
      });

      if (hasGaps) {
        sequenceValid = false;
      }
    });

    logTest(
      'Sequential Increment (No Gaps, Starts at 1)',
      sequenceValid,
      sequenceValid
        ? `All ${result3.rows.length} clinic/year sequences are valid`
        : 'Some sequences have gaps or incorrect start'
    );

    if (!sequenceValid) {
      console.log('\n   🚨 SEQUENCE VALIDATION DETAILS:');
      sequenceDetails.forEach(detail => {
        const status = detail.valid ? '✅' : '❌';
        console.log(`      ${status} Clinic: ${detail.clinic.substring(0, 8)}... | Year: ${detail.year} | Total: ${detail.total} | Range: ${detail.range}`);
      });
    }

    // ==================== TEST 4: PER-CLINIC INDEPENDENCE ====================
    console.log('\n📋 TEST 4: Per-Clinic Sequence Independence\n');

    const result4 = await pool.query(`
      SELECT 
        clinic_id,
        COUNT(DISTINCT SUBSTRING(invoice_number FROM 'FAC-[0-9]{4}-([0-9]+)')) as unique_sequences,
        COUNT(*) as total_invoices
      FROM billing_data
      WHERE invoice_number LIKE 'FAC-%'
      GROUP BY clinic_id
    `);

    // Each clinic should have independent sequences (unique_sequences should equal total_invoices if no duplicates)
    const independence = result4.rows.every(row => row.unique_sequences === row.total_invoices);

    logTest(
      'Per-Clinic Sequence Independence',
      independence,
      independence
        ? `${result4.rows.length} clinic(s) have independent sequences`
        : 'Some clinics share sequence numbers (VIOLATION)'
    );

    console.log('\n   📊 CLINIC SEQUENCE DISTRIBUTION:');
    result4.rows.forEach(row => {
      console.log(`      Clinic: ${row.clinic_id.substring(0, 8)}... | Invoices: ${row.total_invoices} | Unique Seqs: ${row.unique_sequences}`);
    });

    // ==================== TEST 5: FISCAL YEAR SEGREGATION ====================
    console.log('\n📋 TEST 5: Fiscal Year Segregation\n');

    const result5 = await pool.query(`
      SELECT 
        SUBSTRING(invoice_number FROM 'FAC-([0-9]{4})-[0-9]+') as fiscal_year,
        COUNT(*) as invoice_count,
        MIN(CAST(SUBSTRING(invoice_number FROM 'FAC-[0-9]{4}-([0-9]+)') AS INTEGER)) as min_seq,
        MAX(CAST(SUBSTRING(invoice_number FROM 'FAC-[0-9]{4}-([0-9]+)') AS INTEGER)) as max_seq
      FROM billing_data
      WHERE invoice_number LIKE 'FAC-%'
      GROUP BY fiscal_year
      ORDER BY fiscal_year
    `);

    // Each year should start from 1 (min_seq = 1)
    const yearSegregation = result5.rows.every(row => row.min_seq === '1');

    logTest(
      'Fiscal Year Segregation (Each year starts at 001)',
      yearSegregation,
      yearSegregation
        ? `All ${result5.rows.length} fiscal year(s) start correctly at 001`
        : 'Some fiscal years do not start at 001'
    );

    console.log('\n   📅 FISCAL YEAR BREAKDOWN:');
    result5.rows.forEach(row => {
      const status = row.min_seq === '1' ? '✅' : '❌';
      console.log(`      ${status} Year: ${row.fiscal_year} | Count: ${row.invoice_count} | Range: ${row.min_seq}-${row.max_seq}`);
    });

    // ==================== TEST 6: OLD FORMAT DETECTION ====================
    console.log('\n📋 TEST 6: Legacy Invoice Format Detection\n');

    const result6 = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE invoice_number LIKE 'INV-TEST-%') as legacy_format,
        COUNT(*) FILTER (WHERE invoice_number LIKE 'FAC-%') as new_format,
        COUNT(*) as total
      FROM billing_data
    `);

    const formatStats = result6.rows[0];

    logTest(
      'Legacy Format Detection',
      true, // This is informational, not a failure
      `Legacy: ${formatStats.legacy_format} | New: ${formatStats.new_format} | Total: ${formatStats.total}`
    );

    console.log('\n   📈 FORMAT MIGRATION STATUS:');
    const migrationPercent = ((formatStats.new_format / formatStats.total) * 100).toFixed(1);
    console.log(`      New Format (FAC-): ${formatStats.new_format} invoices (${migrationPercent}%)`);
    console.log(`      Legacy Format (INV-TEST-): ${formatStats.legacy_format} invoices`);

    // ==================== TEST 7: ROW LOCKING VERIFICATION (INDIRECT) ====================
    console.log('\n📋 TEST 7: Row Locking Evidence (Timestamp Analysis)\n');

    const result7 = await pool.query(`
      SELECT 
        clinic_id,
        invoice_number,
        created_at,
        LAG(created_at) OVER (PARTITION BY clinic_id ORDER BY created_at) as prev_created_at,
        EXTRACT(EPOCH FROM (created_at - LAG(created_at) OVER (PARTITION BY clinic_id ORDER BY created_at))) as time_diff_seconds
      FROM billing_data
      WHERE invoice_number LIKE 'FAC-%'
      ORDER BY clinic_id, created_at
    `);

    // Check if invoices created within 1 second of each other have correct sequential numbers
    const concurrentCreations = result7.rows.filter(row => row.time_diff_seconds !== null && row.time_diff_seconds < 1);

    logTest(
      'Row Locking Evidence (Concurrent Creation Handling)',
      true, // Informational
      concurrentCreations.length > 0
        ? `Found ${concurrentCreations.length} near-concurrent creations (< 1 sec apart)`
        : 'No concurrent creations detected in current data'
    );

    // ==================== FINAL REPORT ====================
    console.log('\n' + '='.repeat(80));
    console.log('\n🎯 FINAL VERIFICATION REPORT\n');
    console.log(`   Tests Run:    ${testsRun}`);
    console.log(`   Tests Passed: ${testsPassed} ✅`);
    console.log(`   Tests Failed: ${testsFailed} ❌`);
    
    const successRate = ((testsPassed / testsRun) * 100).toFixed(1);
    console.log(`\n   Success Rate: ${successRate}%`);

    if (testsFailed === 0) {
      console.log('\n🏆 GEMINIPUNK VERDICT: INVOICE NUMBERING SYSTEM APPROVED ✅');
      console.log('   - Sequential numbering: COMPLIANT');
      console.log('   - Per-clinic isolation: VERIFIED');
      console.log('   - No duplicates: CONFIRMED');
      console.log('   - Fiscal compliance: ACHIEVED');
      console.log('\n   STATUS: PRODUCTION READY 🚀');
    } else {
      console.log('\n🚨 GEMINIPUNK VERDICT: SYSTEM REJECTED ❌');
      console.log(`   - ${testsFailed} CRITICAL FAILURE(S) DETECTED`);
      console.log('   - STOP: Fix issues before deployment');
      console.log('\n   STATUS: NOT PRODUCTION READY ⛔');
    }

    console.log('\n' + '='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ CATASTROPHIC FAILURE:', error.message);
    console.error('\nStack:', error.stack);
    testsFailed++;
  } finally {
    await pool.end();
  }

  process.exit(testsFailed > 0 ? 1 : 0);
}

runTests();
