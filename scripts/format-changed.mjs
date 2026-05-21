import { spawnSync } from 'node:child_process';

const FORMAT_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.json',
  '.md',
  '.css',
]);

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

const hasFormatterExtension = (file) =>
  FORMAT_EXTENSIONS.has(file.match(/\.[^.]+$/)?.[0] ?? '');

const base = resolveBase();
const changedFiles = [...listChangedFiles(base)].filter(hasFormatterExtension);

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
