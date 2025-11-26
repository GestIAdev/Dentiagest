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
  
  const realityId = 'c342b933-8724-4b94-9660-1a48ed8adb1b';
  const raulId = '7e875d2e-c3ca-4d3e-ad2f-bb03c9ba4004';
  const wallet = '0xe00aeeab778e8661b7f401b2f72816f1f310d7d7';
  
  // Step 1: Remove wallet from Reality
  await client.query('UPDATE patients SET wallet_address = NULL WHERE id = $1', [realityId]);
  console.log('1️⃣ Wallet removida de Reality');
  
  // Step 2: Assign to Raul
  await client.query('UPDATE patients SET wallet_address = $1 WHERE id = $2', [wallet, raulId]);
  console.log('2️⃣ Wallet asignada a Raul Robles');
  
  // Verify
  const check = await client.query(
    'SELECT first_name, last_name, wallet_address FROM patients WHERE id = $1',
    [raulId]
  );
  console.log('✅ Resultado:', check.rows[0]);
  
  await client.end();
}

main().catch(console.error);
