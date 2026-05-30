import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourceRoot = path.join(root, 'src');
const layer = process.argv[2];

if (!['workflow', 'adapters'].includes(layer)) {
  console.error(
    'Usage: node scripts/run-integration-layer-tests.mjs <workflow|adapters>'
  );
  process.exit(1);
}

function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(directory, entry.name);

    if (entry.isDirectory()) return listFiles(filePath);
    if (!entry.isFile()) return [];

    return [filePath];
  });
}

const integrationFiles = listFiles(sourceRoot)
  .map((filePath) => path.relative(root, filePath).split(path.sep).join('/'))
  .filter((filePath) => filePath.endsWith('.integration.test.ts'));

const selectedFiles = integrationFiles
  .filter((filePath) =>
    layer === 'workflow'
      ? filePath.endsWith('.workflow.integration.test.ts')
      : filePath.includes('/infrastructure/__tests__/')
  )
  .sort();

if (selectedFiles.length === 0) {
  console.error(`No ${layer} integration tests found.`);
  process.exit(1);
}

console.log(`Running ${selectedFiles.length} ${layer} integration test files.`);

const result = spawnSync(
  'vitest',
  ['run', '--project=integration', ...selectedFiles],
  {
    shell: process.platform === 'win32',
    stdio: 'inherit',
  }
);

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
