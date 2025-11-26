/**
 * 🧹 CLEANUP ORPHAN PATIENTS
 * Elimina pacientes que no tienen registro en patient_clinic_access
 * (Pacientes de versiones anteriores que quedaron huérfanos)
 */

const { Client } = require('pg');

const client = new Client({ 
  connectionString: 'postgresql://postgres:11111111@localhost:5432/dentiagest' 
});

async function cleanupOrphanPatients() {
  try {
    await client.connect();
    console.log('🔌 Conectado a PostgreSQL');

    // 1. Contar pacientes huérfanos
    const countResult = await client.query(`
      SELECT COUNT(*) as orphan_count 
      FROM patients p
      WHERE p.id NOT IN (SELECT patient_id FROM patient_clinic_access)
    `);
    console.log(`\n📊 Pacientes huérfanos encontrados: ${countResult.rows[0].orphan_count}`);

    // 2. Mostrar algunos ejemplos antes de borrar
    const examplesResult = await client.query(`
      SELECT p.id, p.first_name, p.last_name, p.email, p.created_at
      FROM patients p
      WHERE p.id NOT IN (SELECT patient_id FROM patient_clinic_access)
      LIMIT 10
    `);
    
    if (examplesResult.rows.length > 0) {
      console.log('\n📋 Ejemplos de pacientes a eliminar:');
      examplesResult.rows.forEach(p => {
        console.log(`   - ${p.first_name} ${p.last_name} (${p.email}) - Creado: ${p.created_at}`);
      });
    }

    // 3. Contar pacientes vinculados (los que se mantienen)
    const linkedResult = await client.query(`
      SELECT COUNT(*) as linked_count 
      FROM patients p
      WHERE p.id IN (SELECT patient_id FROM patient_clinic_access)
    `);
    console.log(`\n✅ Pacientes vinculados (se mantienen): ${linkedResult.rows[0].linked_count}`);

    // 4. Ejecutar limpieza - Primero tablas dependientes, luego patients
    console.log('\n🔥 EJECUTANDO LIMPIEZA...');
    
    // Get orphan patient IDs
    const orphanIds = await client.query(`
      SELECT p.id FROM patients p
      WHERE p.id NOT IN (SELECT patient_id FROM patient_clinic_access)
    `);
    
    const ids = orphanIds.rows.map(r => r.id);
    
    if (ids.length > 0) {
      // Lista de todas las tablas que pueden tener patient_id FK
      const dependentTables = [
        'odontogramas',
        'medical_records', 
        'treatments',
        'appointments',
        'documents',
        'mouth_scans',
        'invoices',
        'payments',
        'prescriptions',
        'treatment_plans',
        'consent_forms',
        'patient_notes',
        'patient_images',
        'patient_documents',
        'billing_records',
        'insurance_claims'
      ];
      
      for (const table of dependentTables) {
        console.log(`   🧹 Limpiando ${table}...`);
        try {
          const result = await client.query(`DELETE FROM ${table} WHERE patient_id = ANY($1)`, [ids]);
          if (result.rowCount > 0) {
            console.log(`      ✅ ${result.rowCount} registros eliminados`);
          }
        } catch (e) {
          // Tabla no existe o no tiene patient_id - ignorar
        }
      }
      
      // Now delete orphan patients
      console.log('   🔥 Eliminando pacientes huérfanos...');
      const deleteResult = await client.query(`
        DELETE FROM patients WHERE id = ANY($1) RETURNING id
      `, [ids]);
      
      console.log(`\n🗑️  Pacientes eliminados: ${deleteResult.rowCount}`);
    } else {
      console.log('   ℹ️ No hay pacientes huérfanos para eliminar');
    }

    // 5. Verificar resultado final
    const finalCount = await client.query('SELECT COUNT(*) as total FROM patients');
    console.log(`\n📊 Total pacientes restantes: ${finalCount.rows[0].total}`);

    console.log('\n✅ LIMPIEZA COMPLETADA');

  } catch (error) {
    console.error('💥 Error:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Conexión cerrada');
  }
}

cleanupOrphanPatients();
