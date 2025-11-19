/**
 * 🔥 CREATE TEST USER: patient1@dentiagest.test
 * ROLE: PATIENT (for E2E tests on Patient Portal port 3001)
 * By PunkClaude - No excuses, just fixes
 */

const http = require('http');

// Step 1: Register patient1
const registerMutation = `
mutation Register($input: RegisterInput!) {
  register(input: $input) {
    accessToken
    refreshToken
    expiresIn
    user {
      id
      email
      role
    }
  }
}
`;

const registerVariables = {
  input: {
    email: "patient1@dentiagest.test",
    password: "Test@12345",
    firstName: "Juan",
    lastName: "García López",
    phone: "+34600123456",
    role: "PATIENT"
  }
};

const registerPayload = JSON.stringify({
  query: registerMutation,
  variables: registerVariables
});

const options = {
  hostname: 'localhost',
  port: 8005,
  path: '/graphql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(registerPayload)
  }
};

console.log('🔥 CREATING TEST USER FOR E2E...');
console.log('📧 Email: patient1@dentiagest.test');
console.log('🔑 Password: Test@12345');
console.log('👤 Role: PATIENT');
console.log('📛 Name: Juan García López');
console.log('');

const req = http.request(options, (res) => {
  console.log(`📥 Status: ${res.statusCode}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n📦 Response:');
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));
      
      if (json.errors) {
        console.log('\n⚠️  GraphQL Errors:');
        json.errors.forEach((err, i) => {
          console.log(`\nError ${i + 1}:`);
          console.log('  Message:', err.message);
          
          // Check if user already exists
          if (err.message.includes('already exists') || err.message.includes('duplicate key')) {
            console.log('\n✅ USER ALREADY EXISTS - Testing login instead...');
            testLogin();
            return;
          }
        });
        
        // If not "already exists" error, exit with failure
        if (!json.errors.some(e => e.message.includes('already exists') || e.message.includes('duplicate key'))) {
          process.exit(1);
        }
      }
      
      if (json.data?.register) {
        console.log('\n✅ USER CREATED SUCCESSFULLY!');
        console.log('   User ID:', json.data.register.user.id);
        console.log('   Email:', json.data.register.user.email);
        console.log('   Role:', json.data.register.user.role);
        
        if (json.data.register.user.role === 'PATIENT') {
          console.log('\n🎯 PATIENT ROLE CONFIRMED - E2E tests ready!');
          process.exit(0);
        } else {
          console.log(`\n❌ WRONG ROLE: Got ${json.data.register.user.role}, expected PATIENT`);
          process.exit(1);
        }
      }
    } catch (error) {
      console.log('Raw response:', data);
      console.log('Parse error:', error.message);
      process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Request failed: ${e.message}`);
  process.exit(1);
});

req.write(registerPayload);
req.end();

// Helper function to test login if user already exists
function testLogin() {
  const loginQuery = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      user {
        id
        email
        role
      }
    }
  }
  `;

  const loginVariables = {
    input: {
      email: "patient1@dentiagest.test",
      password: "Test@12345"
    }
  };

  const loginPayload = JSON.stringify({
    query: loginQuery,
    variables: loginVariables
  });

  const loginOptions = {
    hostname: 'localhost',
    port: 8005,
    path: '/graphql',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginPayload)
    }
  };

  console.log('\n🔬 Testing existing user login...');

  const loginReq = http.request(loginOptions, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        console.log('\n📦 Login Response:');
        console.log(JSON.stringify(json, null, 2));
        
        if (json.data?.login) {
          console.log('\n✅ LOGIN SUCCESSFUL!');
          console.log('   User ID:', json.data.login.user.id);
          console.log('   Email:', json.data.login.user.email);
          console.log('   Role:', json.data.login.user.role);
          
          if (json.data.login.user.role === 'PATIENT') {
            console.log('\n🎯 PATIENT ROLE CONFIRMED - E2E tests ready!');
            process.exit(0);
          } else {
            console.log(`\n❌ WRONG ROLE: Got ${json.data.login.user.role}, expected PATIENT`);
            process.exit(1);
          }
        } else {
          console.log('\n❌ Login failed - password might be different');
          console.log('   Delete the user manually and run this script again');
          process.exit(1);
        }
      } catch (error) {
        console.log('Parse error:', error.message);
        process.exit(1);
      }
    });
  });

  loginReq.on('error', (e) => {
    console.error(`❌ Login request failed: ${e.message}`);
    process.exit(1);
  });

  loginReq.write(loginPayload);
  loginReq.end();
}
