const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:11111111@localhost:5432/dentiagest',
});

async function verifyAllLandmines() {
  console.log('🔍 LANDMINE VERIFICATION - ZERO ASSUMPTIONS\n');
  console.log('=' .repeat(60));

  try {
    // ========== LANDMINE 1: medical_records.clinic_id ==========
    console.log('\n💣 LANDMINE 1: medical_records.clinic_id');
    console.log('-'.repeat(60));

    const medicalRecordsColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'medical_records'
      ORDER BY ordinal_position;
    `);

    console.log('📊 medical_records columns:');
    medicalRecordsColumns.rows.forEach((col) => {
      const marker = col.column_name === 'clinic_id' ? '🔥' : '  ';
      console.log(`${marker} - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
    });

    const hasClinicId = medicalRecordsColumns.rows.some((col) => col.column_name === 'clinic_id');

    if (hasClinicId) {
      console.log('\n✅ LANDMINE 1 STATUS: SAFE');
      console.log('   medical_records.clinic_id EXISTS (Migration 007 successful)');

      // Check FK constraint
      const fkCheck = await pool.query(`
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_name = 'medical_records'
          AND constraint_type = 'FOREIGN KEY'
          AND constraint_name LIKE '%clinic%';
      `);

      if (fkCheck.rows.length > 0) {
        console.log(`   FK constraint: ${fkCheck.rows[0].constraint_name} ✅`);
      } else {
        console.log('   ⚠️ WARNING: No FK constraint to clinics table');
      }

      // Check data integrity
      const dataCheck = await pool.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(clinic_id) as with_clinic,
          COUNT(*) - COUNT(clinic_id) as without_clinic,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active,
          COUNT(CASE WHEN is_active = true AND clinic_id IS NULL THEN 1 END) as active_orphans
        FROM medical_records;
      `);

      const stats = dataCheck.rows[0];
      console.log(`   Total records: ${stats.total}`);
      console.log(`   With clinic_id: ${stats.with_clinic}`);
      console.log(`   Without clinic_id: ${stats.without_clinic}`);
      console.log(`   Active records: ${stats.active}`);
      console.log(`   Active orphans: ${stats.active_orphans}`);

      if (parseInt(stats.active_orphans) > 0) {
        console.log('   🚨 CRITICAL: Active records without clinic_id detected!');
      } else {
        console.log('   ✅ Data integrity: All active records have clinic_id');
      }
    } else {
      console.log('\n❌ LANDMINE 1 STATUS: ACTIVE AND DEADLY');
      console.log('   medical_records.clinic_id MISSING');
      console.log('   Migration 007 did NOT execute or failed silently');
    }

    // ========== LANDMINE 2: TreatmentsDatabase SQL ==========
    console.log('\n💣 LANDMINE 2: TreatmentsDatabase.getTreatments() SQL');
    console.log('-'.repeat(60));
    console.log('⚠️ MANUAL VERIFICATION REQUIRED:');
    console.log('   File: selene/src/core/database/TreatmentsDatabase.ts');
    console.log('   Method: getTreatments(filters)');
    console.log('   Check: Does SQL include "AND clinic_id = $X"?');
    console.log('   Current status: VERIFIED AS MISSING (LANDMINE ACTIVE)');

    // ========== LANDMINE 3: treatment_plans table ==========
    console.log('\n💣 LANDMINE 3: treatment_plans table');
    console.log('-'.repeat(60));

    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'treatment_plans'
      );
    `);

    if (tableExists.rows[0].exists) {
      console.log('✅ treatment_plans table EXISTS');

      const planColumns = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'treatment_plans'
        ORDER BY ordinal_position;
      `);

      console.log('📊 treatment_plans columns:');
      planColumns.rows.forEach((col) => {
        const marker = col.column_name === 'clinic_id' ? '🔥' : '  ';
        console.log(`${marker} - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
      });

      const hasPlanClinicId = planColumns.rows.some((col) => col.column_name === 'clinic_id');

      if (hasPlanClinicId) {
        console.log('\n✅ LANDMINE 3 STATUS: SAFE');
        console.log('   treatment_plans.clinic_id EXISTS');
      } else {
        console.log('\n❌ LANDMINE 3 STATUS: ACTIVE');
        console.log('   treatment_plans table EXISTS but clinic_id column MISSING');
        console.log('   Migration 008 required');
      }
    } else {
      console.log('❌ treatment_plans table DOES NOT EXIST');
      console.log('\n🔍 IMPACT ASSESSMENT:');
      console.log('   - generateTreatmentPlanV3() will CRASH on first call');
      console.log('   - createTreatmentPlan() method references non-existent table');
      console.log('   - Decision: Skip treatment plans for Phase 3 OR create table now');
    }

    // ========== SUMMARY ==========
    console.log('\n' + '='.repeat(60));
    console.log('📊 LANDMINE SUMMARY');
    console.log('='.repeat(60));

    const landmine1Safe = hasClinicId && parseInt(dataCheck.rows[0].active_orphans) === 0;
    const landmine3Safe = tableExists.rows[0].exists;

    console.log(`\n💣 LANDMINE 1 (medical_records.clinic_id): ${landmine1Safe ? '✅ SAFE' : '❌ ACTIVE'}`);
    console.log(`💣 LANDMINE 2 (TreatmentsDatabase SQL): ❌ ACTIVE (manual fix required)`);
    console.log(`💣 LANDMINE 3 (treatment_plans table): ${landmine3Safe ? '⚠️ EXISTS (check clinic_id)' : '❌ MISSING'}`);

    if (!landmine1Safe || !landmine3Safe) {
      console.log('\n🚨 CRITICAL: Cannot proceed to Phase 4 until landmines defused');
      console.log('   Fort Knox is a cardboard box');
    } else {
      console.log('\n✅ Database schema validated');
      console.log('   Remaining: Fix TreatmentsDatabase.getTreatments() SQL');
    }

    await pool.end();
    process.exit(landmine1Safe ? 0 : 1);
  } catch (error) {
    console.error('\n💥 VERIFICATION ERROR:', error.message);
    console.error(error.stack);
    await pool.end();
    process.exit(1);
  }
}

verifyAllLandmines();
