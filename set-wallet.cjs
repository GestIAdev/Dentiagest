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
  const walletAddress = '0xe00aeeab778e8661b7f401b2f72816f1f310d7d7'; // Tu wallet
  
  // Update patient
  await client.query(
    'UPDATE patients SET wallet_address = $1 WHERE id = $2',
    [walletAddress, patientId]
  );
  
  console.log('✅ Wallet actualizada para Raul Robles:', walletAddress);
  
  // Verify
  const check = await client.query(
    'SELECT first_name, last_name, wallet_address FROM patients WHERE id = $1',
    [patientId]
  );
  console.log('👤 Paciente:', check.rows[0]);
  
  await client.end();
}

main().catch(console.error);
