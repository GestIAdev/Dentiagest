/**
 * 🧹 CLEANUP ORPHAN PATIENTS V2 - NUCLEAR EDITION
 * Elimina TODO lo relacionado con pacientes huérfanos
 */

const { Client } = require('pg');

const client = new Client({ 
  connectionString: 'postgresql://postgres:11111111@localhost:5432/dentiagest' 
});

async function cleanupOrphanPatients() {
  try {
    await client.connect();
    console.log('🔌 Conectado a PostgreSQL');

    // Usar transacción para todo
    await client.query('BEGIN');

    // 1. Obtener IDs de pacientes huérfanos
    const orphanIds = await client.query(`
      SELECT p.id FROM patients p
      WHERE p.id NOT IN (SELECT patient_id FROM patient_clinic_access)
    `);
    
    const ids = orphanIds.rows.map(r => r.id);
    console.log(`📊 Pacientes huérfanos: ${ids.length}`);
    
    if (ids.length === 0) {
      console.log('✅ No hay pacientes huérfanos');
      await client.query('COMMIT');
      return;
    }

    // 2. Encontrar TODAS las tablas con FK a patients
    const fkResult = await client.query(`
      SELECT 
        tc.table_name,
        kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu 
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND ccu.table_name = 'patients'
        AND ccu.column_name = 'id'
    `);
    
    console.log(`\n📋 Tablas con FK a patients: ${fkResult.rows.length}`);
    
    // 3. Eliminar de cada tabla dependiente
    for (const row of fkResult.rows) {
      const { table_name, column_name } = row;
      console.log(`   🧹 ${table_name}.${column_name}...`);
      
      const delResult = await client.query(
        `DELETE FROM "${table_name}" WHERE "${column_name}" = ANY($1)`,
        [ids]
      );
      
      if (delResult.rowCount > 0) {
        console.log(`      ✅ ${delResult.rowCount} eliminados`);
      }
    }
    
    // 4. Ahora eliminar pacientes
    console.log('\n   🔥 Eliminando pacientes...');
    const deleteResult = await client.query(
      'DELETE FROM patients WHERE id = ANY($1)',
      [ids]
    );
    console.log(`   ✅ ${deleteResult.rowCount} pacientes eliminados`);
    
    // 5. Commit
    await client.query('COMMIT');
    
    // 6. Verificar
    const finalCount = await client.query('SELECT COUNT(*) FROM patients');
    console.log(`\n📊 Total pacientes restantes: ${finalCount.rows[0].count}`);
    
    console.log('\n🎉 LIMPIEZA COMPLETADA');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('💥 Error (rollback ejecutado):', error.message);
  } finally {
    await client.end();
  }
}

cleanupOrphanPatients();
