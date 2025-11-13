const http = require('http');

const query = `
{
  __schema {
    queryType {
      fields {
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
      const queries = result.data.__schema.queryType.fields
        .filter(f => f.name.includes('atient') || f.name.includes('ompliance') || f.name.includes('audit'))
        .map(f => ({ name: f.name, returnType: `${f.type.ofType?.name || f.type.name}${f.type.ofType?.kind === 'LIST' ? '[]' : ''}` }));
      
      console.log(JSON.stringify(queries, null, 2));
    } catch (e) {
      console.error('Parse error:', e);
      console.log(data);
    }
  });
});

req.on('error', e => console.error('Error:', e));
req.write(JSON.stringify({ query }));
req.end();
