import { spawnSync } from 'node:child_process';

import { listChangedFiles, resolveBase } from './lib/git-utils.mjs';

const FORMAT_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.cjs',
  '.mjs',
  '.json',
  '.md',
  '.css',
]);

const hasFormatterExtension = (file) =>
  FORMAT_EXTENSIONS.has(file.match(/\.[^.]+$/)?.[0] ?? '');

const inputFiles = process.argv.slice(2);
const changedFiles = [
  ...new Set(
    inputFiles.length > 0 ? inputFiles : listChangedFiles(resolveBase())
  ),
].filter(hasFormatterExtension);

if (changedFiles.length === 0) {
  console.log('No changed files to format.');
  process.exit(0);
}

const result = spawnSync('oxfmt', changedFiles, { stdio: 'inherit' });

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
