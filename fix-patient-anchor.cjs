const pg = require('pg');

async function main() {
  const client = new pg.Client({
    host: 'localhost',
    port: 5432,
    database: 'dentiagest',
    user: 'postgres',
    password: '11111111'
  });
  
  await client.connect();
  
  const patientId = '7e875d2e-c3ca-4d3e-ad2f-bb03c9ba4004';
  const defaultClinicId = '41c75edc-eed0-43c3-bb7a-25cd7ca75543';
  
  // Check if anchor exists
  const check = await client.query(
    'SELECT * FROM patient_clinic_access WHERE patient_id = $1',
    [patientId]
  );
  
  if (check.rows.length === 0) {
    console.log('❌ Paciente SIN anclaje. Creando...');
    
    // Create anchor to default clinic
    await client.query(`
      INSERT INTO patient_clinic_access (patient_id, clinic_id, first_visit_date, is_active)
      VALUES ($1, $2, CURRENT_DATE, TRUE)
    `, [patientId, defaultClinicId]);
    
    console.log(`✅ Anclaje creado: ${patientId} → ${defaultClinicId}`);
  } else {
    console.log('✅ Paciente YA tiene anclaje:', JSON.stringify(check.rows, null, 2));
  }
  
  await client.end();
}

main().catch(console.error);
