/**
 * Quick DB Schema Inspector
 * Discovers real table and column names
 */

import pkg from 'pg';
const { Client } = pkg;

import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, '../.env.test') });

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'dentiagest',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '11111111'
});

async function inspectSchema() {
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL\n');

    // Get all tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log('📊 TABLES FOUND:', tablesResult.rows.length);
    console.log(tablesResult.rows.map(r => r.table_name).join(', '));
    console.log('\n');

    // Inspect specific tables we care about
    const targetTables = ['patients', 'appointments', 'inventory_items', 'treatments', 'medical_records'];

    for (const table of targetTables) {
      const columnsResult = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [table]);

      if (columnsResult.rows.length > 0) {
        console.log(`\n📋 TABLE: ${table}`);
        console.log('Columns:', columnsResult.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));
      } else {
        console.log(`\n⚠️ TABLE: ${table} - NOT FOUND`);
      }
    }

    await client.end();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

inspectSchema();
