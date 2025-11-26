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
  `ALTER TABLE patients 
   ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(255) UNIQUE DEFAULT NULL;`,
  (err, result) => {
    if (err) {
      console.error('❌ Error al agregar columna:', err.message);
    } else {
      console.log('✅ Columna wallet_address agregada a la tabla patients');
    }
    client.end();
  }
);
