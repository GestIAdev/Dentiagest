const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'dentiagest',
  user: 'postgres',
  password: '11111111',
  ssl: false,
});

async function fixDoctorUser() {
  try {
    console.log('🔌 Conectando a PostgreSQL...');
    await client.connect();
    console.log('✅ Conexión exitosa\n');

    // Verificar usuario actual
    console.log('📋 Usuario ANTES del fix:');
    const before = await client.query(`
      SELECT id, email, username, role 
      FROM users 
      WHERE email = 'doctor@dentiagest.com';
    `);
    console.log(before.rows[0] || 'Usuario NO encontrado');

    // Actualizar username (role ya es 'professional')
    console.log('\n🔧 Aplicando fix...');
    await client.query(`
      UPDATE users 
      SET username = 'doctor_test',
          updated_at = NOW()
      WHERE email = 'doctor@dentiagest.com';
    `);
    console.log('✅ UPDATE ejecutado');

    // Verificar usuario después del fix
    console.log('\n📋 Usuario DESPUÉS del fix:');
    const after = await client.query(`
      SELECT id, email, username, role 
      FROM users 
      WHERE email = 'doctor@dentiagest.com';
    `);
    console.log(after.rows[0]);

    console.log('\n✅ Usuario doctor@dentiagest.com reparado exitosamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

fixDoctorUser();
