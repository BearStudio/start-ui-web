import { spawnSync } from 'node:child_process';

const runGit = (args) => {
  const result = spawnSync('git', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (result.status !== 0) {
    return null;
  }

  return result.stdout.trim();
};

const resolveBase = () => {
  const mainBase = runGit(['merge-base', 'HEAD', 'origin/main']);
  if (mainBase) {
    return mainBase;
  }

  const masterBase = runGit(['merge-base', 'HEAD', 'origin/master']);
  if (masterBase) {
    return masterBase;
  }

  const previousCommit = runGit(['rev-parse', 'HEAD~1']);
  if (previousCommit) {
    return previousCommit;
  }

  return 'HEAD';
};

const listChangedFiles = (base) => {
  const committed = runGit([
    'diff',
    '--name-only',
    '--diff-filter=ACMR',
    `${base}...HEAD`,
  ]);
  const unstaged = runGit(['diff', '--name-only', '--diff-filter=ACMR']);

  return new Set(
    [...(committed?.split('\n') ?? []), ...(unstaged?.split('\n') ?? [])]
      .map((file) => file.trim())
      .filter(Boolean)
  );
};

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
  const result = spawnSync('vitest', args, { stdio: 'inherit' });

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
