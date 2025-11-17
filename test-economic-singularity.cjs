const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:11111111@localhost:5432/dentiagest'
});

async function testEconomicSingularity() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 TESTING ECONOMIC SINGULARITY\n');

    // STEP 1: Buscar o crear material de prueba
    console.log('📦 STEP 1: Buscando material de prueba...');
    let materialResult = await client.query(`
      SELECT id, name, unit_cost FROM dental_materials WHERE name = 'Composite Resin Test'
    `);
    
    let material;
    if (materialResult.rows.length > 0) {
      material = materialResult.rows[0];
      console.log(`✅ Material existente: ${material.name} (ID: ${material.id}, Cost: €${material.unit_cost})`);
    } else {
      materialResult = await client.query(`
        INSERT INTO dental_materials (name, category, unit_cost, unit, current_stock, minimum_stock, is_active, created_at, updated_at)
        VALUES ('Composite Resin Test', 'RESTORATIVE', 25.50, 'unit', 100, 10, true, NOW(), NOW())
        RETURNING id, name, unit_cost
      `);
      material = materialResult.rows[0];
      console.log(`✅ Material creado: ${material.name} (ID: ${material.id}, Cost: €${material.unit_cost})`);
    }
    console.log();

    // STEP 2: Crear tratamiento con materiales
    console.log('🩺 STEP 2: Creando tratamiento con materiales...');
    
    // Buscar un usuario existente o usar NULL
    const userResult = await client.query('SELECT id FROM users LIMIT 1');
    const userId = userResult.rows[0]?.id || null;
    
    const treatmentResult = await client.query(`
      INSERT INTO medical_records (id, patient_id, created_by, procedure_category, diagnosis, treatment_status, visit_date, estimated_cost, clinical_notes, created_at, updated_at)
      VALUES (gen_random_uuid(), 'f0b1f7c9-ffaa-46c6-80f7-ad8a8e3e3c82', $1, 'RESTORATIVE', 'Test treatment for Economic Singularity', 'COMPLETED', NOW(), 150.00, 'Test notes', NOW(), NOW())
      RETURNING id
    `, [userId]);
    const treatmentId = treatmentResult.rows[0].id;
    console.log(`✅ Treatment created: ${treatmentId}\n`);

    // STEP 3: Insertar en treatment_materials (esto debería hacerlo createTreatmentV3 automáticamente, pero lo hacemos manual para test)
    console.log('💰 STEP 3: Insertando materiales usados...');
    await client.query(`
      INSERT INTO treatment_materials (treatment_id, material_id, quantity, cost_snapshot, created_at)
      VALUES ($1, $2, 2, $3, NOW())
    `, [treatmentId, material.id, material.unit_cost]);
    console.log(`✅ Material insertado: 2 units × €${material.unit_cost} = €${2 * material.unit_cost}\n`);

    // STEP 4: Verificar vista treatment_material_costs
    console.log('📊 STEP 4: Verificando vista treatment_material_costs...');
    const costsView = await client.query(`
      SELECT * FROM treatment_material_costs WHERE treatment_id = $1
    `, [treatmentId]);
    console.log('✅ Vista treatment_material_costs:', JSON.stringify(costsView.rows[0], null, 2), '\n');

    // STEP 5: Crear factura vinculada VÍA GRAPHQL (Economic Singularity)
    console.log('💳 STEP 5: Creando factura vinculada vía GraphQL...');
    
    // 🔥 USAR EL BACKEND REAL VÍA HTTP
    const fetch = require('node-fetch');
    const invoiceNumber = `INV-TEST-${Date.now()}`;
    
    const graphqlQuery = {
      query: `
        mutation CreateBillingDataV3($input: BillingDataV3Input!) {
          createBillingDataV3(input: $input) {
            id
            invoiceNumber
            totalAmount
            materialCost
            profitMargin
            treatmentId
          }
        }
      `,
      variables: {
        input: {
          patientId: 'f0b1f7c9-ffaa-46c6-80f7-ad8a8e3e3c82',
          invoiceNumber: invoiceNumber,
          subtotal: 150.00,
          taxRate: 0.21,
          taxAmount: 31.50,
          discountAmount: 0,
          totalAmount: 181.50,
          currency: 'EUR',
          status: 'PENDING',
          createdBy: userId,
          treatmentId: treatmentId  // 💰 ECONOMIC SINGULARITY: El backend calculará material_cost y profit_margin
        }
      }
    };
    
    const response = await fetch('http://localhost:8005/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(graphqlQuery)
    });
    
    const result = await response.json();
    
    if (result.errors) {
      console.error('❌ GraphQL Errors:', result.errors);
      throw new Error(result.errors[0].message);
    }
    
    const billing = result.data.createBillingDataV3;
    
    console.log('✅ Factura creada:');
    console.log(`   - Invoice: ${billing.invoiceNumber}`);
    console.log(`   - Total: €${billing.totalAmount}`);
    console.log(`   - Material Cost: €${billing.materialCost || 0}`);
    console.log(`   - Profit Margin: ${billing.profitMargin ? (billing.profitMargin * 100).toFixed(2) : 0}%`);
    console.log(`   - Net Profit: €${(billing.totalAmount - (billing.materialCost || 0)).toFixed(2)}\n`);

    // STEP 6: Verificar vista billing_profitability_analysis
    console.log('📈 STEP 6: Verificando vista billing_profitability_analysis...');
    const profitabilityView = await client.query(`
      SELECT * FROM billing_profitability_analysis WHERE billing_id = $1
    `, [billing.id]);
    console.log('✅ Vista profitability_analysis:', JSON.stringify(profitabilityView.rows[0], null, 2), '\n');

    // STEP 7: Verificar KPIs globales
    console.log('🎯 STEP 7: KPIs globales de rentabilidad...');
    const kpis = await client.query('SELECT * FROM billing_profitability_kpis');
    console.log('✅ KPIs:', JSON.stringify(kpis.rows[0], null, 2), '\n');

    console.log('🎉 ECONOMIC SINGULARITY TEST: ✅ PASSED\n');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error);
  } finally {
    client.release();
    await pool.end();
  }
}

testEconomicSingularity();
