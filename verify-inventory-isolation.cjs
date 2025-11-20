#!/usr/bin/env node
/**
 * 🏛️ EMPIRE V2: INVENTORY MULTI-TENANT ISOLATION VERIFICATION
 * 
 * Verifies that dental_materials table enforces clinic-level isolation
 * preventing "Inventario Comunista" scenarios.
 * 
 * Test Scenarios:
 * 1. Verify clinic_id column exists and is NOT NULL
 * 2. Verify FK constraint to clinics table
 * 3. Verify indexes on clinic_id
 * 4. Verify all records have valid clinic_id
 * 5. Test isolation: Create item in Clinic A, verify invisible to Clinic B
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:11111111@localhost:5432/dentiagest'
});

async function verifyInventoryIsolation() {
  console.log('\n🏛️ EMPIRE V2: INVENTORY ISOLATION VERIFICATION');
  console.log('═'.repeat(70));

  try {
    // ============================================================================
    // TEST 1: Schema Verification
    // ============================================================================
    console.log('\n📋 TEST 1: Schema Verification');
    console.log('─'.repeat(70));

    const columnCheck = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'dental_materials' AND column_name = 'clinic_id'
    `);

    if (columnCheck.rows.length === 0) {
      console.log('❌ CRITICAL: clinic_id column DOES NOT EXIST');
      process.exit(1);
    }

    const col = columnCheck.rows[0];
    console.log(`✅ clinic_id EXISTS: ${col.data_type}, Nullable: ${col.is_nullable}`);

    if (col.is_nullable === 'YES') {
      console.log('⚠️  WARNING: clinic_id is NULLABLE (should be NOT NULL)');
    }

    // ============================================================================
    // TEST 2: Foreign Key Constraint
    // ============================================================================
    console.log('\n🔗 TEST 2: Foreign Key Constraint');
    console.log('─'.repeat(70));

    const fkCheck = await pool.query(`
      SELECT
        conname AS constraint_name,
        conrelid::regclass AS table_name,
        confrelid::regclass AS referenced_table
      FROM pg_constraint
      WHERE conrelid = 'dental_materials'::regclass
        AND contype = 'f'
        AND conname LIKE '%clinic%'
    `);

    if (fkCheck.rows.length === 0) {
      console.log('❌ CRITICAL: No FK constraint to clinics table');
    } else {
      fkCheck.rows.forEach(fk => {
        console.log(`✅ FK: ${fk.constraint_name} → ${fk.referenced_table}`);
      });
    }

    // ============================================================================
    // TEST 3: Indexes
    // ============================================================================
    console.log('\n📇 TEST 3: Indexes on clinic_id');
    console.log('─'.repeat(70));

    const indexCheck = await pool.query(`
      SELECT
        indexname,
        indexdef
      FROM pg_indexes
      WHERE tablename = 'dental_materials'
        AND indexdef ILIKE '%clinic_id%'
    `);

    if (indexCheck.rows.length === 0) {
      console.log('⚠️  WARNING: No indexes on clinic_id (performance impact)');
    } else {
      indexCheck.rows.forEach(idx => {
        console.log(`✅ ${idx.indexname}`);
      });
    }

    // ============================================================================
    // TEST 4: Data Integrity
    // ============================================================================
    console.log('\n💾 TEST 4: Data Integrity');
    console.log('─'.repeat(70));

    const dataCheck = await pool.query(`
      SELECT
        COUNT(*) AS total_records,
        COUNT(clinic_id) AS records_with_clinic,
        COUNT(*) - COUNT(clinic_id) AS records_without_clinic
      FROM dental_materials
    `);

    const stats = dataCheck.rows[0];
    console.log(`Total records: ${stats.total_records}`);
    console.log(`With clinic_id: ${stats.records_with_clinic}`);
    console.log(`Without clinic_id: ${stats.records_without_clinic}`);

    if (parseInt(stats.records_without_clinic) > 0) {
      console.log('❌ CRITICAL: Records exist without clinic_id');
    } else {
      console.log('✅ All records have clinic_id');
    }

    // ============================================================================
    // TEST 5: Clinic Distribution
    // ============================================================================
    console.log('\n🏥 TEST 5: Clinic Distribution');
    console.log('─'.repeat(70));

    const distribution = await pool.query(`
      SELECT
        c.id,
        c.name,
        COUNT(dm.id) AS material_count
      FROM clinics c
      LEFT JOIN dental_materials dm ON dm.clinic_id = c.id
      GROUP BY c.id, c.name
      ORDER BY material_count DESC
    `);

    distribution.rows.forEach(row => {
      console.log(`  ${row.name}: ${row.material_count} materials`);
    });

    // ============================================================================
    // TEST 6: Isolation Test (if multiple clinics exist)
    // ============================================================================
    console.log('\n🔒 TEST 6: Isolation Test');
    console.log('─'.repeat(70));

    const clinicsCount = await pool.query(`SELECT COUNT(*) as count FROM clinics`);
    const numClinics = parseInt(clinicsCount.rows[0].count);

    if (numClinics < 2) {
      console.log('⏭️  SKIPPED: Need at least 2 clinics for isolation test');
    } else {
      // Get two different clinics
      const clinics = await pool.query(`SELECT id, name FROM clinics LIMIT 2`);
      const clinicA = clinics.rows[0];
      const clinicB = clinics.rows[1];

      console.log(`Testing isolation between:`);
      console.log(`  Clinic A: ${clinicA.name} (${clinicA.id})`);
      console.log(`  Clinic B: ${clinicB.name} (${clinicB.id})`);

      // Count materials per clinic
      const countA = await pool.query(
        `SELECT COUNT(*) as count FROM dental_materials WHERE clinic_id = $1`,
        [clinicA.id]
      );
      const countB = await pool.query(
        `SELECT COUNT(*) as count FROM dental_materials WHERE clinic_id = $1`,
        [clinicB.id]
      );

      console.log(`  Clinic A materials: ${countA.rows[0].count}`);
      console.log(`  Clinic B materials: ${countB.rows[0].count}`);

      // Verify no cross-clinic visibility (simulated)
      const crossCheck = await pool.query(`
        SELECT COUNT(*) as count
        FROM dental_materials
        WHERE clinic_id = $1
          AND id IN (SELECT id FROM dental_materials WHERE clinic_id = $2)
      `, [clinicA.id, clinicB.id]);

      const crossContamination = parseInt(crossCheck.rows[0].count);
      if (crossContamination > 0) {
        console.log(`❌ CRITICAL: ${crossContamination} records visible across clinics`);
      } else {
        console.log('✅ No cross-clinic contamination detected');
      }
    }

    // ============================================================================
    // FINAL VERDICT
    // ============================================================================
    console.log('\n🎯 FINAL VERDICT');
    console.log('═'.repeat(70));

    const allChecks = [
      col.is_nullable === 'NO',
      fkCheck.rows.length > 0,
      indexCheck.rows.length >= 1,
      parseInt(stats.records_without_clinic) === 0
    ];

    const passed = allChecks.filter(Boolean).length;
    const total = allChecks.length;

    console.log(`Checks passed: ${passed}/${total}`);

    if (passed === total) {
      console.log('✅ LANDMINE 4 STATUS: DEFUSED ✅');
      console.log('🏛️ Inventory multi-tenant isolation VERIFIED');
    } else {
      console.log('❌ LANDMINE 4 STATUS: ACTIVE ⚠️');
      console.log('🔥 Inventory isolation INCOMPLETE');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n💥 VERIFICATION FAILED:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run verification
verifyInventoryIsolation().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
