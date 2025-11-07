/**
 * Database Schema Validation Tests
 * Verifica estructura PostgreSQL sin tocar UI
 * 
 * Este test valida:
 * - Conexión PostgreSQL
 * - Existencia de 13 tablas core
 * - Schema correcto (columns, types, constraints)
 * - Foreign keys configuradas
 * - Test data accesible (o tablas vacías)
 */

import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import pkg from 'pg';
const { Client } = pkg;

// Load .env.test for DB credentials
import { config } from 'dotenv';
import path from 'path';
config({ path: path.resolve(__dirname, '../.env.test') });

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'dentiagest',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '11111111'
};

describe('Database Schema Validation', () => {
  let client: typeof Client.prototype;

  beforeAll(async () => {
    client = new Client(DB_CONFIG);
    try {
      await client.connect();
    } catch (error) {
      console.error('❌ PostgreSQL connection failed:', error);
      throw new Error('Database not running or wrong credentials');
    }
  });

  afterAll(async () => {
    await client.end();
  });

  test('PostgreSQL connection successful', async () => {
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    expect(result.rows).toBeDefined();
    expect(result.rows[0].current_time).toBeDefined();
    console.log('✅ PostgreSQL connected:', result.rows[0].pg_version);
  });

  test('13 core tables exist', async () => {
    const requiredTables = [
      'patients',
      'appointments', 
      'medical_records',
      'treatments',
      'documents',
      'inventory',
      'billing_data',
      'compliance',
      'treatment_rooms',
      'dental_equipment',
      'users',
      'deletion_requests',
      'permanent_deletion_records'
    ];

    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    const existingTables = result.rows.map(r => r.table_name);
    console.log('📊 Existing tables:', existingTables.length);

    for (const table of requiredTables) {
      expect(existingTables).toContain(table);
    }
  });

  test('Patients table schema correct', async () => {
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'patients'
      ORDER BY ordinal_position;
    `);

    const columns = result.rows.map(r => r.column_name);
    
    expect(columns).toContain('id');
    expect(columns).toContain('first_name');
    expect(columns).toContain('last_name');
    expect(columns).toContain('email');
    expect(columns).toContain('phone');
    expect(columns).toContain('insurance_provider');
    expect(columns).toContain('is_active');

    console.log('✅ Patients columns:', columns.length);
  });

  test('Appointments table schema correct', async () => {
    const result = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'appointments'
      ORDER BY ordinal_position;
    `);

    const columns = result.rows.map(r => r.column_name);
    
    expect(columns).toContain('id');
    expect(columns).toContain('patient_id');
    expect(columns).toContain('date');
    expect(columns).toContain('time');
    expect(columns).toContain('type');
    expect(columns).toContain('status');

    console.log('✅ Appointments columns:', columns.length);
  });

  test('Inventory table schema correct', async () => {
    const result = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'inventory'
      ORDER BY ordinal_position;
    `);

    const columns = result.rows.map(r => r.column_name);
    
    expect(columns).toContain('id');
    expect(columns).toContain('item_name');
    expect(columns).toContain('quantity');
    expect(columns).toContain('unit_price');

    console.log('✅ Inventory columns:', columns.length);
  });

  test('Foreign key constraints exist', async () => {
    const result = await client.query(`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name IN ('appointments', 'medical_records', 'treatments')
      ORDER BY tc.table_name;
    `);

    expect(result.rows.length).toBeGreaterThan(0);
    console.log('✅ Foreign keys found:', result.rows.length);
  });

  test('Test data accessible (tables queryable)', async () => {
    const tables = ['patients', 'appointments', 'inventory', 'treatments'];
    
    for (const table of tables) {
      const result = await client.query(`SELECT COUNT(*) as count FROM ${table};`);
      const count = parseInt(result.rows[0].count);
      
      // Just verify query works, count can be 0 or > 0
      expect(count).toBeGreaterThanOrEqual(0);
      console.log(`📊 ${table}: ${count} rows`);
    }
  });

  test('Primary keys configured', async () => {
    const tables = ['patients', 'appointments', 'inventory', 'treatments'];
    
    for (const table of tables) {
      const result = await client.query(`
        SELECT a.attname
        FROM   pg_index i
        JOIN   pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
        WHERE  i.indrelid = $1::regclass
        AND    i.indisprimary;
      `, [table]);

      expect(result.rows.length).toBeGreaterThan(0);
    }
    console.log('✅ Primary keys validated for core tables');
  });
});
