const fs = require('fs');
const Ajv = require('ajv');
const ajv = new Ajv();

async function validate() {
  const schemaResponse = await fetch('https://openapi.vercel.sh/vercel.json');
  const schema = await schemaResponse.json();
  const validate = ajv.compile(schema);

  const vercelJson = JSON.parse(fs.readFileSync('./vercel.json', 'utf8'));
  const valid = validate(vercelJson);
  if (!valid) console.log(validate.errors);
  else console.log('valid root');

  const appVercelJson = JSON.parse(fs.readFileSync('./app/vercel.json', 'utf8'));
  const validApp = validate(appVercelJson);
  if (!validApp) console.log(validate.errors);
  else console.log('valid app');
}

validate().catch(console.error);
