/**
 * 🔍 GET REAL TEST DATA
 * Extract subscription plans and admin users from REAL database
 */

const { Client } = require('pg');

async function getRealTestData() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '11111111',
    database: 'dentiagest',
  });

  try {
    await client.connect();
    console.log('🔌 Connected to PostgreSQL');

    // Get first subscription plan
    const planQuery = `
      SELECT id, name, price, billing_cycle, max_services_per_month
      FROM subscription_plans_v3
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    const planResult = await client.query(planQuery);
    
    if (planResult.rows.length === 0) {
      console.error('❌ NO subscription plans found! Create one first!');
      console.log('\nℹ️  Run this SQL:');
      console.log(`
INSERT INTO subscription_plans_v3 (
  id, name, description, tier, price, currency, billing_cycle,
  max_services_per_month, max_services_per_year, active
) VALUES (
  gen_random_uuid(),
  'VitalPass Premium',
  'Full access to premium dental services',
  'PREMIUM',
  29.99,
  'EUR',
  'MONTHLY',
  10,
  120,
  true
);
      `);
    } else {
      console.log('\n✅ SUBSCRIPTION PLAN:');
      console.log(planResult.rows[0]);
    }

    // Get first ADMIN user (DOCTOR is not a valid enum, use ADMIN)
    const userQuery = `
      SELECT id, email, role::text as role
      FROM users
      WHERE role = 'ADMIN'
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    const userResult = await client.query(userQuery);
    
    if (userResult.rows.length === 0) {
      console.error('\n❌ NO admin/doctor users found!');
    } else {
      console.log('\n✅ ADMIN/DOCTOR USER:');
      console.log(userResult.rows[0]);
    }

    await client.end();

  } catch (error) {
    console.error('💥 Error:', error.message);
    await client.end();
    process.exit(1);
  }
}

getRealTestData();
