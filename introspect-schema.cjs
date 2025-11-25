const fetch = require('node-fetch');

async function introspectSchema() {
  const query = `
    query IntrospectionQuery {
      __schema {
        mutationType {
          fields {
            name
          }
        }
      }
    }
  `;

  try {
    const response = await fetch('http://localhost:8005/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });

    const json = await response.json();
    
    console.log('\n🔍 MUTATIONS DISPONIBLES EN SELENE:\n');
    
    const mutations = json.data.__schema.mutationType.fields;
    const subscriptionMutations = mutations.filter(m => m.name.toLowerCase().includes('subscription'));
    
    console.log('📋 Total mutations:', mutations.length);
    console.log('\n🎯 Subscription-related mutations:');
    subscriptionMutations.forEach(m => console.log('  -', m.name));
    
    console.log('\n🔍 Buscando createSubscriptionV3...');
    const exists = mutations.find(m => m.name === 'createSubscriptionV3');
    if (exists) {
      console.log('✅ createSubscriptionV3 EXISTE');
    } else {
      console.log('❌ createSubscriptionV3 NO EXISTE');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

introspectSchema();
