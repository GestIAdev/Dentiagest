const {Pool}=require('pg');
const p=new Pool({connectionString:'postgresql://postgres:11111111@localhost:5432/dentiagest'});
p.query(`
  SELECT column_name, data_type, is_nullable, column_default 
  FROM information_schema.columns 
  WHERE table_name='users' 
  ORDER BY ordinal_position
`).then(r=>{
  console.log(JSON.stringify(r.rows,null,2));
  p.end();
}).catch(e=>{
  console.error(e.message);
  p.end();
});
