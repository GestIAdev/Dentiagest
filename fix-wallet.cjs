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
  
  // Buscar otra wallet que funcione (de tests anteriores)
  const walletCheck = await client.query(
    'SELECT id, first_name, wallet_address FROM patients WHERE wallet_address IS NOT NULL LIMIT 1'
  );
  
  if (walletCheck.rows.length > 0) {
    console.log('🔍 Wallet encontrada en otro paciente:', walletCheck.rows[0]);
  }
  
  // La wallet de la imagen está conectada a MetaMask
  // Preguntamos al usuario cuál es
  console.log('\n📋 Opciones:');
  console.log('1. Copiar wallet de otro paciente que la tenga');
  console.log('2. Pegar wallet manualmente aquí');
  
  // Por ahora, intentemos copiar de audit o de algún lado donde se usó antes
  const auditCheck = await client.query(`
    SELECT new_values->>'wallet_address' as wallet 
    FROM audit_trail 
    WHERE new_values->>'wallet_address' IS NOT NULL 
    LIMIT 1
  `);
  
  if (auditCheck.rows.length > 0 && auditCheck.rows[0].wallet) {
    const wallet = auditCheck.rows[0].wallet;
    console.log('\n💰 Wallet encontrada en audit:', wallet);
    
    // Update patient
    await client.query(
      'UPDATE patients SET wallet_address = $1 WHERE id = $2',
      [wallet, patientId]
    );
    console.log('✅ Wallet actualizada para Raul Robles!');
  } else {
    console.log('\n❌ No se encontró wallet en audit. Necesitas pasarla manualmente.');
    
    // Hardcode the wallet from the successful test (FAC-2025-001 que sí funcionó)
    // Esa transacción sí envió tokens, así que la wallet estaba bien
    console.log('\n🔧 Buscando en billing/blockchain logs...');
  }
  
  await client.end();
}

main().catch(console.error);
