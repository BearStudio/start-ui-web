import { spawnSync } from 'node:child_process';

import { listChangedFiles, resolveBase } from './lib/git-utils.mjs';

const shouldRunFullSuite = (file) =>
  file.startsWith('vitest.config.') ||
  /^tsconfig.*\.json$/.test(file) ||
  file === 'package.json' ||
  file === 'pnpm-lock.yaml' ||
  file.startsWith('src/modules/kernel/') ||
  file.startsWith('src/composition/');

const isTypeScriptSource = (file) =>
  file.startsWith('src/') && (file.endsWith('.ts') || file.endsWith('.tsx'));

const runVitest = (args) => {
  const result = spawnSync('vitest', args, {
    shell: process.platform === 'win32',
    stdio: 'inherit',
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  process.exit(result.status ?? 1);
};

const base = resolveBase();
const changedFiles = [...listChangedFiles(base)];

if (changedFiles.length === 0) {
  console.log('No affected tests.');
  process.exit(0);
}

if (changedFiles.some(shouldRunFullSuite)) {
  runVitest(['run']);
}

const sourceFiles = changedFiles.filter(isTypeScriptSource);

if (sourceFiles.length === 0) {
  console.log('No affected tests.');
  process.exit(0);
}

runVitest(['run', '--changed', base, ...sourceFiles]);
