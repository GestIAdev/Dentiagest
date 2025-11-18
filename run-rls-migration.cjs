/**
 * RLS MIGRATION EXECUTOR
 * Ejecuta enable_rls_gdpr_isolation.sql usando la conexión existente
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'dentiagest',
  user: 'postgres',
  password: '11111111', // TODO: Cambiar cuando dockericemos esto 🐳
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔒 INICIANDO MIGRATION: Row-Level Security');
    console.log('━'.repeat(60));
    
    // Leer SQL file
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrations', 'enable_rls_gdpr_isolation.sql'),
      'utf-8'
    );
    
    // Ejecutar en una transacción
    await client.query('BEGIN');
    
    console.log('\n📊 Ejecutando RLS policies...');
    await client.query(migrationSQL);
    
    await client.query('COMMIT');
    
    console.log('✅ MIGRATION COMPLETADA');
    console.log('\n🔐 RLS habilitado en:');
    console.log('  - patients');
    console.log('  - medical_records');
    console.log('  - appointments');
    console.log('  - billing_data');
    console.log('  - subscriptions');
    
    console.log('\n🧪 VERIFICANDO POLÍTICAS...');
    
    // Verificar que las políticas existen
    const policiesCheck = await client.query(`
      SELECT schemaname, tablename, policyname
      FROM pg_policies
      WHERE tablename IN ('patients', 'medical_records', 'appointments', 'billing_data', 'subscriptions')
      ORDER BY tablename, policyname;
    `);
    
    console.log('\n📋 Políticas creadas:');
    policiesCheck.rows.forEach(row => {
      console.log(`  ${row.tablename}.${row.policyname}`);
    });
    
    // Verificar que RLS está habilitado
    const rlsCheck = await client.query(`
      SELECT tablename, 
             CASE WHEN rowsecurity THEN '✅ ENABLED' ELSE '❌ DISABLED' END as rls_status
      FROM pg_tables
      WHERE schemaname = 'public' 
        AND tablename IN ('patients', 'medical_records', 'appointments', 'billing_data', 'subscriptions')
      ORDER BY tablename;
    `);
    
    console.log('\n🔐 Estado RLS por tabla:');
    rlsCheck.rows.forEach(row => {
      console.log(`  ${row.tablename}: ${row.rls_status}`);
    });
    
    console.log('\n🎉 GDPR COMPLIANCE ACTIVADO');
    console.log('━'.repeat(60));
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ ERROR EN MIGRATION:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
