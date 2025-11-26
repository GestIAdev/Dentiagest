/**
 * 🚀 VITALPASS SUBSCRIPTION PLANS RESURRECTION
 * Crea la tabla subscription_plans_v3 y seedea los 3 planes Netflix-style
 */

const pg = require('pg');

const client = new pg.Client({
  user: 'postgres',
  password: '11111111',
  host: 'localhost',
  port: 5432,
  database: 'dentiagest'
});

async function createSubscriptionPlansTable() {
  try {
    await client.connect();
    console.log('📦 Conectado a PostgreSQL');

    // 1. Create enum if not exists
    console.log('\n1️⃣ Creando enum subscription_status_enum...');
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE subscription_status_enum AS ENUM (
          'ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED'
        );
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);
    console.log('   ✅ Enum listo');

    // 2. Create subscription_plans_v3 table
    console.log('\n2️⃣ Creando tabla subscription_plans_v3...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS subscription_plans_v3 (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        tier TEXT DEFAULT 'BASIC',
        price NUMERIC(12,2) NOT NULL,
        currency TEXT NOT NULL DEFAULT 'EUR',
        billing_cycle TEXT NOT NULL DEFAULT 'monthly',
        max_services_per_month INTEGER DEFAULT 0,
        max_services_per_year INTEGER DEFAULT 0,
        features JSONB DEFAULT '[]'::jsonb,
        popular BOOLEAN DEFAULT false,
        recommended BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        clinic_id UUID NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        deleted_at TIMESTAMP WITH TIME ZONE NULL
      );
    `);
    console.log('   ✅ Tabla creada');

    // 3. Create subscriptions_v3 table (for patient subscriptions)
    console.log('\n3️⃣ Creando tabla subscriptions_v3...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS subscriptions_v3 (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
        plan_id UUID NOT NULL,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        start_date DATE NOT NULL DEFAULT CURRENT_DATE,
        end_date DATE NULL,
        next_billing_date DATE NOT NULL,
        total_amount NUMERIC(12,2) NOT NULL,
        currency TEXT NOT NULL DEFAULT 'EUR',
        auto_renew BOOLEAN DEFAULT true,
        payment_method_id TEXT NULL,
        usage_this_month INTEGER DEFAULT 0,
        usage_this_year INTEGER DEFAULT 0,
        cancellation_reason TEXT NULL,
        metadata JSONB NULL,
        created_by UUID NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        deleted_at TIMESTAMP WITH TIME ZONE NULL
      );
    `);
    console.log('   ✅ Tabla subscriptions_v3 creada');

    // 4. Indexes
    console.log('\n4️⃣ Creando índices...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_subscription_plans_v3_active ON subscription_plans_v3(is_active);
      CREATE INDEX IF NOT EXISTS idx_subscription_plans_v3_clinic ON subscription_plans_v3(clinic_id);
      CREATE INDEX IF NOT EXISTS idx_subscriptions_v3_patient ON subscriptions_v3(patient_id);
      CREATE INDEX IF NOT EXISTS idx_subscriptions_v3_plan ON subscriptions_v3(plan_id);
      CREATE INDEX IF NOT EXISTS idx_subscriptions_v3_status ON subscriptions_v3(status);
    `);
    console.log('   ✅ Índices creados');

    // 5. Seed the Netflix-style plans
    console.log('\n5️⃣ Seeding planes Netflix-style...');
    
    // Check if plans already exist
    const existing = await client.query('SELECT COUNT(*) as count FROM subscription_plans_v3 WHERE deleted_at IS NULL');
    if (parseInt(existing.rows[0].count) > 0) {
      console.log(`   ⚠️ Ya existen ${existing.rows[0].count} planes. Saltando seeding.`);
    } else {
      // Plan Básico
      await client.query(`
        INSERT INTO subscription_plans_v3 (name, description, tier, price, currency, billing_cycle, max_services_per_month, max_services_per_year, features, popular, recommended, is_active, clinic_id)
        VALUES (
          'Plan Básico',
          'Perfecto para empezar tu viaje de salud dental',
          'BASIC',
          10.00,
          'EUR',
          'monthly',
          2,
          24,
          '[
            {"id": "basic-1", "name": "Limpieza dental", "description": "1 limpieza cada 6 meses", "included": true, "limit": 2, "unit": "año"},
            {"id": "basic-2", "name": "Revisión general", "description": "Revisión anual completa", "included": true, "limit": 1, "unit": "año"},
            {"id": "basic-3", "name": "Descuento en tratamientos", "description": "5% de descuento", "included": true, "limit": 5, "unit": "%"},
            {"id": "basic-4", "name": "Radiografías", "description": "No incluidas", "included": false}
          ]'::jsonb,
          false,
          false,
          true,
          NULL
        );
      `);
      console.log('   ✅ Plan Básico ($10/mes) creado');

      // Plan Premium (OBJETIVO HILO DORADO)
      await client.query(`
        INSERT INTO subscription_plans_v3 (name, description, tier, price, currency, billing_cycle, max_services_per_month, max_services_per_year, features, popular, recommended, is_active, clinic_id)
        VALUES (
          'Plan Premium',
          'El equilibrio perfecto entre precio y beneficios. ¡El más popular!',
          'PREMIUM',
          50.00,
          'EUR',
          'monthly',
          6,
          72,
          '[
            {"id": "premium-1", "name": "Limpieza dental", "description": "Limpiezas ilimitadas", "included": true, "limit": -1, "unit": "ilimitado"},
            {"id": "premium-2", "name": "Revisiones completas", "description": "4 revisiones al año", "included": true, "limit": 4, "unit": "año"},
            {"id": "premium-3", "name": "Radiografías incluidas", "description": "Panorámica y periapicales", "included": true, "limit": 4, "unit": "año"},
            {"id": "premium-4", "name": "Descuento en tratamientos", "description": "20% de descuento en todos los tratamientos", "included": true, "limit": 20, "unit": "%"},
            {"id": "premium-5", "name": "Urgencias dentales", "description": "Atención prioritaria 24/7", "included": true},
            {"id": "premium-6", "name": "Blanqueamiento", "description": "1 sesión incluida al año", "included": true, "limit": 1, "unit": "año"}
          ]'::jsonb,
          true,
          true,
          true,
          NULL
        );
      `);
      console.log('   ✅ Plan Premium ($50/mes) creado - HILO DORADO 🎯');

      // Plan Elite
      await client.query(`
        INSERT INTO subscription_plans_v3 (name, description, tier, price, currency, billing_cycle, max_services_per_month, max_services_per_year, features, popular, recommended, is_active, clinic_id)
        VALUES (
          'Plan Elite',
          'La experiencia dental definitiva. Todo incluido, sin límites.',
          'ENTERPRISE',
          100.00,
          'EUR',
          'monthly',
          12,
          144,
          '[
            {"id": "elite-1", "name": "Todos los servicios incluidos", "description": "Sin límites en ningún servicio", "included": true, "limit": -1, "unit": "ilimitado"},
            {"id": "elite-2", "name": "Blanqueamiento premium", "description": "Sesiones ilimitadas de blanqueamiento", "included": true, "limit": -1, "unit": "ilimitado"},
            {"id": "elite-3", "name": "Ortodoncia invisible", "description": "50% de descuento en Invisalign", "included": true, "limit": 50, "unit": "%"},
            {"id": "elite-4", "name": "Implantes dentales", "description": "30% de descuento", "included": true, "limit": 30, "unit": "%"},
            {"id": "elite-5", "name": "Estética facial", "description": "Tratamientos de ácido hialurónico incluidos", "included": true, "limit": 2, "unit": "año"},
            {"id": "elite-6", "name": "Concierge dental", "description": "Asistente personal para citas y seguimiento", "included": true},
            {"id": "elite-7", "name": "Familia incluida", "description": "Hasta 3 miembros adicionales", "included": true, "limit": 3, "unit": "personas"}
          ]'::jsonb,
          false,
          false,
          true,
          NULL
        );
      `);
      console.log('   ✅ Plan Elite ($100/mes) creado');
    }

    // 6. Verify
    console.log('\n6️⃣ Verificando planes creados...');
    const result = await client.query(`
      SELECT id, name, tier, price, popular, recommended, is_active, clinic_id
      FROM subscription_plans_v3
      WHERE deleted_at IS NULL
      ORDER BY price
    `);
    console.log('\n📋 PLANES DISPONIBLES:');
    console.table(result.rows);

    console.log('\n✅ ¡RESURRECCIÓN COMPLETADA! Los planes están listos para VitalPass.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

createSubscriptionPlansTable();
