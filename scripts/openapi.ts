import { writeFile } from 'node:fs/promises';

import { openApiDocument } from '../src/server/api/openapi';

async function main() {
  try {
    await writeFile('./openapi.json', JSON.stringify(openApiDocument));
    console.log('✅ Generate `.openapi.json`');
  } catch {
    console.error('❌ Unable to generate OpenAPI');
  }
}

main();
