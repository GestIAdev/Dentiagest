const pg = require('pg');

const client = new pg.Client({
  user: 'postgres',
  password: '11111111',
  host: 'localhost',
  port: 5432,
  database: 'dentiagest'
});

client.connect();

client.query(
  'UPDATE patients SET wallet_address = $1 WHERE id = $2',
  ['0xe00aeeab778e8661b7f401b2f72816f1f310d7d7', 'c342b933-8724-4b94-9660-1a48ed8adb1b'],
  (err, result) => {
    if (err) {
      console.error('❌ Error:', err.message);
    } else {
      console.log('✅ Updated rows:', result.rowCount);
      console.log('✅ Wallet assigned to patient c342b933-8724-4b94-9660-1a48ed8adb1b');
      console.log('   Wallet: 0xe00aeeab778e8661b7f401b2f72816f1f310d7d7');
    }
    client.end();
  }
);
