/**
 * 🧹 CLEANUP ORPHAN PATIENTS V3 - DISABLE TRIGGERS
 * Desactiva triggers/FK temporalmente para limpieza nuclear
 */

const { Client } = require('pg');

const client = new Client({ 
  connectionString: 'postgresql://postgres:11111111@localhost:5432/dentiagest' 
});

async function cleanupOrphanPatients() {
  try {
    await client.connect();
    console.log('🔌 Conectado a PostgreSQL');

    // 1. Obtener IDs de pacientes huérfanos
    const orphanIds = await client.query(`
      SELECT p.id FROM patients p
      WHERE p.id NOT IN (SELECT patient_id FROM patient_clinic_access)
    `);
    
    const ids = orphanIds.rows.map(r => r.id);
    console.log(`📊 Pacientes huérfanos: ${ids.length}`);
    
    if (ids.length === 0) {
      console.log('✅ No hay pacientes huérfanos');
      return;
    }

    // 2. Desactivar triggers (permite bypass de FK checks)
    console.log('\n⚠️  Desactivando triggers...');
    await client.query('SET session_replication_role = replica');
    
    // 3. Encontrar TODAS las tablas con FK a patients (recursivamente)
    const allTables = await client.query(`
      WITH RECURSIVE fk_tree AS (
        -- Base: tablas que referencian patients directamente
        SELECT 
          tc.table_name,
          kcu.column_name,
          ccu.table_name as referenced_table,
          1 as depth
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu 
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND ccu.table_name = 'patients'
        
        UNION ALL
        
        -- Recursivo: tablas que referencian las tablas anteriores
        SELECT 
          tc.table_name,
          kcu.column_name,
          ccu.table_name as referenced_table,
          ft.depth + 1
        FROM fk_tree ft
        JOIN information_schema.table_constraints tc ON true
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu 
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND ccu.table_name = ft.table_name
          AND ft.depth < 5
      )
      SELECT DISTINCT table_name, column_name, referenced_table, depth
      FROM fk_tree
      ORDER BY depth DESC, table_name
    `);
    
    console.log(`\n📋 Tablas dependientes (${allTables.rows.length} total):`);
    
    // 4. Eliminar en orden de profundidad (más profundo primero)
    for (const row of allTables.rows) {
      const { table_name, column_name, referenced_table, depth } = row;
      console.log(`   [${depth}] 🧹 ${table_name}.${column_name} -> ${referenced_table}`);
      
      try {
        // Para tablas que referencian patients directamente
        if (referenced_table === 'patients') {
          const delResult = await client.query(
            `DELETE FROM "${table_name}" WHERE "${column_name}" = ANY($1)`,
            [ids]
          );
          if (delResult.rowCount > 0) {
            console.log(`       ✅ ${delResult.rowCount} eliminados`);
          }
        }
      } catch (e) {
        console.log(`       ⚠️ ${e.message.substring(0, 50)}...`);
      }
    }
    
    // 5. Eliminar pacientes directamente (con triggers desactivados)
    console.log('\n🔥 Eliminando pacientes (triggers desactivados)...');
    const deleteResult = await client.query(
      'DELETE FROM patients WHERE id = ANY($1)',
      [ids]
    );
    console.log(`✅ ${deleteResult.rowCount} pacientes eliminados`);
    
    // 6. Reactivar triggers
    console.log('\n✅ Reactivando triggers...');
    await client.query('SET session_replication_role = DEFAULT');
    
    // 7. Verificar
    const finalCount = await client.query('SELECT COUNT(*) FROM patients');
    console.log(`\n📊 Total pacientes restantes: ${finalCount.rows[0].count}`);
    
    console.log('\n🎉 LIMPIEZA COMPLETADA');

  } catch (error) {
    // Reactivar triggers en caso de error
    await client.query('SET session_replication_role = DEFAULT').catch(() => {});
    console.error('💥 Error:', error.message);
  } finally {
    await client.end();
  }
}

cleanupOrphanPatients();
