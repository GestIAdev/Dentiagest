// Verification script for Migration 007
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'dentiagest',
  user: 'postgres',
  password: '11111111',
  ssl: false,
});

async function verifyMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 VERIFICANDO MIGRATION 007 - medical_records.clinic_id\n');
    
    // Check 1: Column exists
    console.log('📊 Check 1: ¿Existe columna clinic_id?');
    const columnCheck = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'medical_records' 
        AND column_name = 'clinic_id'
    `);
    
    if (columnCheck.rows.length > 0) {
      console.log('✅ Columna clinic_id existe');
      console.log(`   Type: ${columnCheck.rows[0].data_type}`);
      console.log(`   Nullable: ${columnCheck.rows[0].is_nullable}\n`);
    } else {
      console.log('❌ Columna clinic_id NO existe\n');
      return;
    }
    
    // Check 2: Record counts
    console.log('📊 Check 2: Conteo de registros');
    const counts = await client.query(`
      SELECT 
        COUNT(*) FILTER (WHERE true) as total_records,
        COUNT(*) FILTER (WHERE clinic_id IS NOT NULL) as records_with_clinic,
        COUNT(*) FILTER (WHERE clinic_id IS NULL AND is_active = TRUE) as active_without_clinic,
        COUNT(*) FILTER (WHERE clinic_id IS NULL AND is_active = FALSE) as inactive_orphans
      FROM medical_records
    `);
    
    const stats = counts.rows[0];
    console.log(`   Total records: ${stats.total_records}`);
    console.log(`   Records with clinic_id: ${stats.records_with_clinic}`);
    console.log(`   Active WITHOUT clinic_id: ${stats.active_without_clinic}`);
    console.log(`   Inactive orphans: ${stats.inactive_orphans}\n`);
    
    if (parseInt(stats.active_without_clinic) > 0) {
      console.log('⚠️  WARNING: Hay registros activos sin clinic_id');
    } else {
      console.log('✅ Todos los registros activos tienen clinic_id');
    }
    
    // Check 3: Foreign key constraint
    console.log('\n📊 Check 3: ¿Existe constraint de foreign key?');
    const fkCheck = await client.query(`
      SELECT conname as constraint_name
      FROM pg_constraint
      WHERE conrelid = 'medical_records'::regclass
        AND conname = 'fk_medical_records_clinic'
    `);
    
    if (fkCheck.rows.length > 0) {
      console.log('✅ Foreign key constraint existe: fk_medical_records_clinic\n');
    } else {
      console.log('❌ Foreign key constraint NO existe\n');
    }
    
    // Check 4: Index
    console.log('📊 Check 4: ¿Existe índice?');
    const indexCheck = await client.query(`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'medical_records'
        AND indexname = 'idx_medical_records_clinic'
    `);
    
    if (indexCheck.rows.length > 0) {
      console.log('✅ Índice existe: idx_medical_records_clinic\n');
    } else {
      console.log('❌ Índice NO existe\n');
    }
    
    console.log('========================================');
    console.log('🏛️ MIGRATION 007: VERIFICATION COMPLETE');
    console.log('========================================');
    
  } catch (error) {
    console.error('❌ Error en verificación:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

verifyMigration();
