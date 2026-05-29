import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourceRoot = path.join(root, 'src');
const testFilePattern = /\.(?:unit\.)?(?:test|spec)\.[cm]?[jt]sx?$/;

function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(directory, entry.name);

    if (entry.isDirectory()) return listFiles(filePath);
    if (!entry.isFile()) return [];

    return [filePath];
  });
}

const propertyTestFiles = listFiles(sourceRoot)
  .filter((filePath) => testFilePattern.test(filePath))
  .filter((filePath) =>
    readFileSync(filePath, 'utf8').includes('@/tests/support/property-testing')
  )
  .map((filePath) => path.relative(root, filePath))
  .sort();

if (propertyTestFiles.length === 0) {
  console.error('No property tests found.');
  process.exit(1);
}

for (const filePath of propertyTestFiles) {
  const stats = statSync(path.join(root, filePath));
  if (!stats.isFile()) {
    console.error(`Property test path is not a file: ${filePath}`);
    process.exit(1);
  }
}

console.log(`Running ${propertyTestFiles.length} property test files.`);

const result = spawnSync(
  'vitest',
  ['run', '--project=unit', ...propertyTestFiles],
  {
    stdio: 'inherit',
  }
);

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
