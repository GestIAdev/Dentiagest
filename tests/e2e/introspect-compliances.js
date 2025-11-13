const http = require('http');

const query = `
{
  __type(name: "Query") {
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
      const compliancesField = result.data.__type.fields.find(f => f.name === 'compliancesV3');
      console.log(JSON.stringify(compliancesField, null, 2));
    } catch (e) {
      console.error('Parse error:', e);
      console.log(data);
    }
  });
});

req.on('error', e => console.error('Error:', e));
req.write(JSON.stringify({ query }));
req.end();
