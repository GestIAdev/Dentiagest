const http = require('http');

const query = `
{
  __schema {
    mutationType {
      fields {
        name
        args {
          name
          type {
            kind
            name
            ofType {
              kind
              name
            }
          }
        }
      }
    }
  }
}
`;

const options = {
  hostname: 'localhost',
  port: 8005,
  path: '/graphql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      const mutations = result.data.__schema.mutationType.fields
        .filter(f => f.name.includes('ompliance') || f.name.includes('Compliance'))
        .map(f => ({ name: f.name, args: f.args }));
      
      console.log(JSON.stringify(mutations, null, 2));
    } catch (e) {
      console.error('Parse error:', e);
      console.log(data);
    }
  });
});

req.on('error', e => console.error('Error:', e));
req.write(JSON.stringify({ query }));
req.end();
